import { query } from "../../config/db";

function isISODate(d: any): d is string {
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
}

export const SubscriptionsService = {
  async listPaged(companyId: string, q: any) {
    const page = Math.max(1, Number(q.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 20)));
    const offset = (page - 1) * pageSize;

    const search =
      q.search && String(q.search).trim().length > 0
        ? `%${String(q.search).toLowerCase()}%`
        : null;

    const active = q.active === "true" ? true : q.active === "false" ? false : null;

    const fromRaw = q.from != null ? String(q.from) : null;
    const toRaw = q.to != null ? String(q.to) : null;
    const from = fromRaw && isISODate(fromRaw) ? fromRaw : null;
    const to = toRaw && isISODate(toRaw) ? toRaw : null;

    const items = await query<any>(
      `
      SELECT
        s.*,
        c.name as customer_name,
        c.document as customer_document
      FROM subscriptions s
      JOIN customers c ON c.id = s.customer_id
      WHERE s.company_id = $1
        AND ($2::boolean IS NULL OR s.active = $2)
        AND ($3::date IS NULL OR s.next_due_date >= $3)
        AND ($4::date IS NULL OR s.next_due_date <= $4)
        AND ($5::text IS NULL OR LOWER(c.name) LIKE $5 OR LOWER(c.document) LIKE $5)
      ORDER BY s.created_at DESC
      LIMIT $6 OFFSET $7
      `,
      [companyId, active, from, to, search, pageSize, offset]
    );

    const totalRow = (
      await query<{ count: string }>(
        `
        SELECT COUNT(*)::text as count
        FROM subscriptions s
        JOIN customers c ON c.id = s.customer_id
        WHERE s.company_id = $1
          AND ($2::boolean IS NULL OR s.active = $2)
          AND ($3::date IS NULL OR s.next_due_date >= $3)
          AND ($4::date IS NULL OR s.next_due_date <= $4)
          AND ($5::text IS NULL OR LOWER(c.name) LIKE $5 OR LOWER(c.document) LIKE $5)
        `,
        [companyId, active, from, to, search]
      )
    )[0];

    return { page, pageSize, total: Number(totalRow?.count ?? "0"), items };
  },

  async create(companyId: string, data: any) {
    const fineCents = Math.max(0, Number(data.fineCents ?? 0));
    const interestBps = Math.max(0, Number(data.interestBps ?? 0));
    const discountCents = Math.max(0, Number(data.discountCents ?? 0));
    const discountDaysBefore = Math.max(0, Number(data.discountDaysBefore ?? 0));

    const rows = await query(
      `
      INSERT INTO subscriptions (
        company_id,
        customer_id,
        amount_cents,
        interval,
        payment_method,
        next_due_date,
        active,
        fine_cents,
        interest_bps,
        discount_cents,
        discount_days_before
      )
      VALUES ($1,$2,$3,$4,$5,$6,true,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        companyId,
        data.customerId,
        data.amountCents,
        data.interval,
        data.paymentMethod,
        data.nextDueDate,
        fineCents,
        interestBps,
        discountCents,
        discountDaysBefore,
      ]
    );
    return rows[0];
  },

  async update(companyId: string, id: string, data: any) {
    const rows = await query(
      `
      UPDATE subscriptions
      SET
        amount_cents = COALESCE($3, amount_cents),
        interval = COALESCE($4, interval),
        payment_method = COALESCE($5, payment_method),
        next_due_date = COALESCE($6, next_due_date),
        active = COALESCE($7, active),
        fine_cents = COALESCE($8, fine_cents),
        interest_bps = COALESCE($9, interest_bps),
        discount_cents = COALESCE($10, discount_cents),
        discount_days_before = COALESCE($11, discount_days_before)
      WHERE company_id = $1 AND id = $2
      RETURNING *
      `,
      [
        companyId,
        id,
        data.amountCents ?? null,
        data.interval ?? null,
        data.paymentMethod ?? null,
        data.nextDueDate ?? null,
        data.active ?? null,
        data.fineCents ?? null,
        data.interestBps ?? null,
        data.discountCents ?? null,
        data.discountDaysBefore ?? null,
      ]
    );
    if (!rows[0]) throw Object.assign(new Error("Subscription not found"), { status: 404 });
    return rows[0];
  },

  async remove(companyId: string, id: string) {
    const rows = await query(`DELETE FROM subscriptions WHERE company_id = $1 AND id = $2 RETURNING id`, [companyId, id]);
    if (!rows[0]) throw Object.assign(new Error("Subscription not found"), { status: 404 });
  },
};
