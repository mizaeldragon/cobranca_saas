// src/modules/charges/charges.service.ts
import { query } from "../../config/db";
import { getProvider } from "../providers/providers.factory";
import type { ProviderName } from "../providers/provider.types";
import { sendChargeWhatsApp, type WhatsAppConfig } from "../../utils/whatsapp";
import { sendChargeEmail, type EmailConfig } from "../../utils/email";
import { isValidCpfCnpj, onlyDigits } from "../../utils/document";

type CompanyRow = {
  bank_provider: ProviderName;
  provider_api_key: string | null;
  whatsapp_enabled?: boolean | null;
  whatsapp_provider?: string | null;
  meta_access_token?: string | null;
  meta_phone_number_id?: string | null;
  meta_base_url?: string | null;
  meta_template_name?: string | null;
  meta_template_language?: string | null;
  email_enabled?: boolean | null;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_user?: string | null;
  smtp_pass?: string | null;
  smtp_from?: string | null;
  smtp_secure?: boolean | null;
};

function buildWhatsAppConfig(company: CompanyRow): WhatsAppConfig {
  return {
    enabled: company.whatsapp_enabled ?? false,
    provider: (company.whatsapp_provider ?? "meta") as "meta" | "twilio",
    metaAccessToken: company.meta_access_token,
    metaPhoneNumberId: company.meta_phone_number_id,
    metaBaseUrl: company.meta_base_url,
    metaTemplateName: company.meta_template_name,
    metaTemplateLanguage: company.meta_template_language,
  };
}

function buildEmailConfig(company: CompanyRow): EmailConfig {
  return {
    enabled: company.email_enabled ?? false,
    smtpHost: company.smtp_host,
    smtpPort: company.smtp_port ?? undefined,
    smtpUser: company.smtp_user,
    smtpPass: company.smtp_pass,
    smtpFrom: company.smtp_from,
    smtpSecure: company.smtp_secure ?? false,
  };
}

export const ChargesService = {
  async getById(companyId: string, chargeId: string) {
    const rows = await query(
      `
      SELECT
        ch.*,
        c.name as customer_name,
        c.document as customer_document,
        c.email as customer_email,
        c.phone as customer_phone
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

  async update(
    companyId: string,
    chargeId: string,
    data: { amountCents?: number; dueDate?: string; paymentMethod?: "pix" | "boleto" | "card" }
  ) {
    const rows = await query(
      `
      UPDATE charges
      SET
        amount_cents = COALESCE($3, amount_cents),
        due_date = COALESCE($4, due_date),
        payment_method = COALESCE($5, payment_method)
      WHERE company_id = $1 AND id = $2
      RETURNING *
      `,
      [companyId, chargeId, data.amountCents ?? null, data.dueDate ?? null, data.paymentMethod ?? null]
    );
    if (!rows[0]) throw Object.assign(new Error("Charge not found"), { status: 404 });
    return rows[0];
  },

  async cancel(companyId: string, chargeId: string) {
    const ch = (await query<any>(
      `
      SELECT id, status, provider, provider_charge_id
      FROM charges
      WHERE company_id = $1 AND id = $2
      LIMIT 1
      `,
      [companyId, chargeId]
    ))[0];
    if (!ch) throw Object.assign(new Error("Charge not found"), { status: 404 });
    if (ch.status === "paid") throw Object.assign(new Error("Charge already paid"), { status: 409 });
    if (ch.status === "canceled") return ch;

    if (ch.provider !== "mock" && !ch.provider_charge_id) {
      throw Object.assign(new Error("Provider charge id missing"), { status: 400 });
    }

    const company = (await query<CompanyRow>(
      `
      SELECT
        bank_provider,
        provider_api_key,
        whatsapp_enabled,
        whatsapp_provider,
        meta_access_token,
        meta_phone_number_id,
        meta_base_url,
        meta_template_name,
        meta_template_language,
        email_enabled,
        smtp_host,
        smtp_port,
        smtp_user,
        smtp_pass,
        smtp_from,
        smtp_secure
      FROM companies
      WHERE id = $1
      `,
      [companyId]
    ))[0];
    if (!company) throw Object.assign(new Error("Company not found"), { status: 404 });
    if (ch.provider !== "mock" && !company.provider_api_key) {
      throw Object.assign(new Error("Company provider_api_key is missing"), { status: 400 });
    }

    const provider = getProvider(ch.provider as ProviderName);
    await provider.cancelCharge({ apiKey: company.provider_api_key ?? undefined }, ch.provider_charge_id);

    const updated = (await query<any>(
      `
      UPDATE charges
      SET status = 'canceled'
      WHERE id = $1
      RETURNING *
      `,
      [ch.id]
    ))[0];

    await query(
      `
      UPDATE payments
      SET status = 'failed', raw = COALESCE(raw,'{}'::jsonb) || $2::jsonb
      WHERE company_id = $1 AND charge_id = $3
      `,
      [companyId, JSON.stringify({ canceledAt: new Date().toISOString() }), ch.id]
    );

    return updated;
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
    if (!isValidCpfCnpj(onlyDigits(customer.document ?? ""))) {
      throw Object.assign(new Error("CPF/CNPJ invalido"), { status: 422 });
    }

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

    try {
      const result = await sendChargeWhatsApp({
        customerName: customer.name,
        phone: customer.phone,
        amountCents: data.amountCents,
        dueDate: data.dueDate,
        invoiceUrl: createdOnProvider.invoice_url ?? null,
        config: buildWhatsAppConfig(company),
      });
      if (result) {
        console.log("[whatsapp] sent:", { provider: result.provider, sid: result.sid, status: result.status });
      }
    } catch (err) {
      console.warn("[whatsapp] failed to send charge message:", err?.response?.data ?? err);
    }

    try {
      const info = await sendChargeEmail({
        customerName: customer.name,
        email: customer.email,
        amountCents: data.amountCents,
        dueDate: data.dueDate,
        invoiceUrl: createdOnProvider.invoice_url ?? null,
        config: buildEmailConfig(company),
      });
      if (info) {
        console.log("[email] sent:", { messageId: info.messageId });
      }
    } catch (err) {
      console.warn("[email] failed to send charge message:", err?.response?.data ?? err);
    }

    return { ...ch, providerData: createdOnProvider };
  },

  async notifyCharge(companyId: string, chargeId: string) {
    const rows = await query<any>(
      `
      SELECT
        ch.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        co.whatsapp_enabled,
        co.whatsapp_provider,
        co.meta_access_token,
        co.meta_phone_number_id,
        co.meta_base_url,
        co.meta_template_name,
        co.meta_template_language,
        co.email_enabled,
        co.smtp_host,
        co.smtp_port,
        co.smtp_user,
        co.smtp_pass,
        co.smtp_from,
        co.smtp_secure
      FROM charges ch
      JOIN customers c ON c.id = ch.customer_id
      JOIN companies co ON co.id = ch.company_id
      WHERE ch.company_id = $1 AND ch.id = $2
      LIMIT 1
      `,
      [companyId, chargeId]
    );
    const ch = rows[0];
    if (!ch) throw Object.assign(new Error("Charge not found"), { status: 404 });

    const notifyResult: {
      whatsapp?: { ok: boolean; result?: any; error?: any };
      email?: { ok: boolean; result?: any; error?: any };
    } = {};

    try {
      const result = await sendChargeWhatsApp({
        customerName: ch.customer_name,
        phone: ch.customer_phone,
        amountCents: ch.amount_cents,
        dueDate: ch.due_date,
        invoiceUrl: ch.invoice_url ?? null,
        config: buildWhatsAppConfig(ch as CompanyRow),
      });
      notifyResult.whatsapp = { ok: true, result };
      if (result) {
        console.log("[whatsapp] notify sent:", { provider: result.provider, sid: result.sid, status: result.status });
      }
    } catch (err) {
      notifyResult.whatsapp = { ok: false, error: err?.response?.data ?? err?.message ?? err };
      console.warn("[whatsapp] failed to send charge message:", err?.response?.data ?? err);
    }

    try {
      const info = await sendChargeEmail({
        customerName: ch.customer_name,
        email: ch.customer_email,
        amountCents: ch.amount_cents,
        dueDate: ch.due_date,
        invoiceUrl: ch.invoice_url ?? null,
        config: buildEmailConfig(ch as CompanyRow),
      });
      notifyResult.email = { ok: true, result: info };
      if (info) {
        console.log("[email] notify sent:", { messageId: info.messageId });
      }
    } catch (err) {
      notifyResult.email = { ok: false, error: err?.response?.data ?? err?.message ?? err };
      console.warn("[email] failed to send charge message:", err?.response?.data ?? err);
    }

    return {
      ok: true,
      phone: ch.customer_phone ?? null,
      email: ch.customer_email ?? null,
      ...notifyResult,
    };
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
