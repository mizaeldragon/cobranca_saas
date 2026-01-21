// src/modules/charges/charges.service.ts
import { query } from "../../config/db";
import { getProvider } from "../providers/providers.factory";
import type { ProviderName } from "../providers/provider.types";

type CompanyRow = { bank_provider: ProviderName; provider_api_key: string | null };

export const ChargesService = {
  async getById(companyId: string, chargeId: string) {
    const rows = await query(
      `
      SELECT ch.*, c.name as customer_name, c.document as customer_document
      FROM charges ch
      JOIN customers c ON c.id = ch.customer_id
      WHERE ch.company_id = $1 AND ch.id = $2
      LIMIT 1
      `,
      [companyId, chargeId]
    );
    if (!rows[0]) throw Object.assign(new Error("Charge not found"), { status: 404 });
    return rows[0];
  },

  async list(companyId: string) {
    return query(
      `
      SELECT ch.*, c.name as customer_name, c.document as customer_document
      FROM charges ch
      JOIN customers c ON c.id = ch.customer_id
      WHERE ch.company_id = $1
      ORDER BY ch.created_at DESC
      `,
      [companyId]
    );
  },

  async listPaged(companyId: string, q: any) {
    const page = Math.max(1, Number(q.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 20)));
    const offset = (page - 1) * pageSize;

    const status = q.status ?? null;
    const from = q.from ?? null;
    const to = q.to ?? null;
    const search = q.search ? `%${String(q.search).toLowerCase()}%` : null;

    const rows = await query<any>(
      `
      SELECT ch.*, c.name as customer_name, c.document as customer_document
      FROM charges ch
      JOIN customers c ON c.id = ch.customer_id
      WHERE ch.company_id = $1
        AND ($2::charge_status IS NULL OR ch.status = $2)
        AND ($3::date IS NULL OR ch.due_date >= $3)
        AND ($4::date IS NULL OR ch.due_date <= $4)
        AND ($5::text IS NULL OR LOWER(c.name) LIKE $5 OR LOWER(c.document) LIKE $5)
      ORDER BY ch.created_at DESC
      LIMIT $6 OFFSET $7
      `,
      [companyId, status, from, to, search, pageSize, offset]
    );

    const total = (await query<{ count: string }>(
      `
      SELECT COUNT(*)::text as count
      FROM charges ch
      JOIN customers c ON c.id = ch.customer_id
      WHERE ch.company_id = $1
        AND ($2::charge_status IS NULL OR ch.status = $2)
        AND ($3::date IS NULL OR ch.due_date >= $3)
        AND ($4::date IS NULL OR ch.due_date <= $4)
        AND ($5::text IS NULL OR LOWER(c.name) LIKE $5 OR LOWER(c.document) LIKE $5)
      `,
      [companyId, status, from, to, search]
    ))[0];

    return { page, pageSize, total: Number(total.count), items: rows };
  },

  async createManual(companyId: string, data: any) {
    const company = (await query<CompanyRow>(
      `SELECT bank_provider, provider_api_key FROM companies WHERE id = $1`,
      [companyId]
    ))[0];
    if (!company) throw Object.assign(new Error("Company not found"), { status: 404 });
    if (company.bank_provider !== "mock" && !company.provider_api_key) {
      throw Object.assign(new Error("Company provider_api_key is missing"), { status: 400 });
    }

    // idempotência antes de chamar o provider (evita criar 2 no Asaas também)
    if (data.idempotencyKey) {
      const existing = (await query<any>(
        `SELECT * FROM charges WHERE company_id = $1 AND idempotency_key = $2 LIMIT 1`,
        [companyId, data.idempotencyKey]
      ))[0];
      if (existing) return existing;
    }

    const customer = (await query<any>(
      `SELECT * FROM customers WHERE company_id = $1 AND id = $2`,
      [companyId, data.customerId]
    ))[0];
    if (!customer) throw Object.assign(new Error("Customer not found"), { status: 404 });

    const provider = getProvider(company.bank_provider);

const createdOnProvider = await provider.createCharge(
  { apiKey: company.provider_api_key ?? undefined },
  {
    amount_cents: data.amountCents,
    due_date: data.dueDate, // "YYYY-MM-DD"
    payment_method: data.paymentMethod, // "pix" | "boleto" | "card"
    description: data.description ?? null,
    customer: {
      name: customer.name,
      document: customer.document,
      email: customer.email,
      phone: customer.phone,
      address: {
        line1: customer.address_line1,
        line2: customer.address_line2,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
      },
    },
  }
);


    const ch = (await query<any>(
      `
      INSERT INTO charges (
        company_id, subscription_id, customer_id,
        amount_cents, payment_method, due_date,
        status, provider, provider_charge_id, invoice_url, idempotency_key
      )
      VALUES ($1, NULL, $2, $3, $4, $5, 'pending', $6, $7, $8, $9)
      RETURNING *
      `,
      [
        companyId,
        data.customerId,
        data.amountCents,
        data.paymentMethod,
        data.dueDate,
        createdOnProvider.provider,
        createdOnProvider.provider_charge_id,
        createdOnProvider.invoice_url ?? null,
        data.idempotencyKey ?? null,
      ]
    ))[0];

    await query(
      `
      INSERT INTO payments (company_id, charge_id, provider, provider_payment_id, status, raw)
      VALUES ($1,$2,$3,$4,'created',$5)
      `,
      [
        companyId,
        ch.id,
        createdOnProvider.provider,
        createdOnProvider.provider_charge_id,
        JSON.stringify(createdOnProvider.raw ?? createdOnProvider),
      ]
    );

    return { ...ch, providerData: createdOnProvider };
  },

  async markPaid(companyId: string, chargeId: string, meta: { source: string }) {
    const existing = (await query<any>(
      `
      SELECT * FROM charges
      WHERE company_id = $1 AND id = $2
      LIMIT 1
      `,
      [companyId, chargeId]
    ))[0];
    if (!existing) throw Object.assign(new Error("Charge not found"), { status: 404 });
    if (existing.status === "paid") return existing;

    const updated = (await query<any>(
      `
      UPDATE charges
      SET status = 'paid'
      WHERE id = $1
      RETURNING *
      `,
      [existing.id]
    ))[0];

    await query(
      `
      UPDATE payments
      SET status = 'confirmed', raw = COALESCE(raw,'{}'::jsonb) || $3::jsonb
      WHERE company_id = $1 AND charge_id = $2
      `,
      [companyId, chargeId, JSON.stringify({ confirmedBy: meta.source, at: new Date().toISOString() })]
    );

    await ChargesService.onChargePaid(updated, { source: meta.source });

    return updated;
  },

  async confirmByProvider(companyId: string, provider: ProviderName, providerChargeId: string, raw: any) {
    const existing = (await query<any>(
      `
      SELECT * FROM charges
      WHERE company_id = $1 AND provider = $2 AND provider_charge_id = $3
      LIMIT 1
      `,
      [companyId, provider, providerChargeId]
    ))[0];

    if (!existing) return null;
    if (existing.status === "paid") return existing;

    const ch = (await query<any>(
      `
      UPDATE charges
      SET status = 'paid'
      WHERE id = $1
      RETURNING *
      `,
      [existing.id]
    ))[0];

    await query(
      `
      UPDATE payments
      SET status = 'confirmed', raw = COALESCE(raw,'{}'::jsonb) || $2::jsonb
      WHERE company_id = $1 AND charge_id = $3
      `,
      [companyId, JSON.stringify({ webhook: raw, at: new Date().toISOString() }), ch.id]
    );

    await ChargesService.onChargePaid(ch, { source: "webhook" });

    return ch;
  },

  async onChargePaid(_charge: any, _meta: { source: string }) {
    // hook para efeitos pos-pagamento (assinatura, recibo, notificacao, etc.)
  },
};
