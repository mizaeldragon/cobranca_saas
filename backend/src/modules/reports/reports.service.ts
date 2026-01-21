import { query } from "../../config/db";

export const ReportsService = {
  async summary(companyId: string, range: { from: string | null; to: string | null }) {
    const from = range.from;
    const to = range.to;

    const rows = await query<any>(
      `
      SELECT
        SUM(CASE WHEN status='pending' THEN amount_cents ELSE 0 END) AS pending_cents,
        SUM(CASE WHEN status='paid' THEN amount_cents ELSE 0 END) AS paid_cents,
        SUM(CASE WHEN status='overdue' THEN amount_cents ELSE 0 END) AS overdue_cents,
        COUNT(*) FILTER (WHERE status='pending') AS pending_count,
        COUNT(*) FILTER (WHERE status='paid') AS paid_count,
        COUNT(*) FILTER (WHERE status='overdue') AS overdue_count
      FROM charges
      WHERE company_id = $1
        AND ($2::date IS NULL OR due_date >= $2)
        AND ($3::date IS NULL OR due_date <= $3)
      `,
      [companyId, from, to]
    );

    const byMonth = await query<any>(
      `
      SELECT
        to_char(date_trunc('month', due_date), 'YYYY-MM') as month,
        SUM(CASE WHEN status='paid' THEN amount_cents ELSE 0 END) AS paid_cents,
        SUM(CASE WHEN status!='paid' THEN amount_cents ELSE 0 END) AS open_cents
      FROM charges
      WHERE company_id = $1
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 12
      `,
      [companyId]
    );

    return { totals: rows[0], byMonth };
  },

  async mrr(companyId: string) {
    // aproximação simples: assinaturas ativas mensalizadas (weekly*4, yearly/12)
    const rows = await query<any>(
      `
      SELECT interval, SUM(amount_cents) AS sum_cents
      FROM subscriptions
      WHERE company_id = $1 AND active = true
      GROUP BY interval
      `,
      [companyId]
    );

    let mrrCents = 0;
    for (const r of rows) {
      const sum = Number(r.sum_cents ?? 0);
      if (r.interval === "monthly") mrrCents += sum;
      if (r.interval === "weekly") mrrCents += sum * 4;
      if (r.interval === "yearly") mrrCents += Math.round(sum / 12);
    }

    return { mrrCents, breakdown: rows };
  },
};
