import { query } from "../../config/db";

type CreateCustomer = {
  name: string;
  document: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export const CustomersService = {
  async listPaged(companyId: string, q: any) {
    const page = Math.max(1, Number(q.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 20)));
    const offset = (page - 1) * pageSize;

    const search =
      q.search && String(q.search).trim().length > 0
        ? `%${String(q.search).toLowerCase()}%`
        : null;

    const items = await query<any>(
      `
      SELECT *
      FROM customers
      WHERE company_id = $1
        AND ($2::text IS NULL OR LOWER(name) LIKE $2 OR LOWER(document) LIKE $2 OR LOWER(COALESCE(email,'')) LIKE $2)
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
      `,
      [companyId, search, pageSize, offset]
    );

    const totalRow = (
      await query<{ count: string }>(
        `
        SELECT COUNT(*)::text as count
        FROM customers
        WHERE company_id = $1
          AND ($2::text IS NULL OR LOWER(name) LIKE $2 OR LOWER(document) LIKE $2 OR LOWER(COALESCE(email,'')) LIKE $2)
        `,
        [companyId, search]
      )
    )[0];

    return { page, pageSize, total: Number(totalRow?.count ?? "0"), items };
  },

  async create(companyId: string, data: CreateCustomer) {
    const rows = await query(
      `
      INSERT INTO customers (
        company_id, name, document, email, phone,
        address_line1, address_line2, city, state, zip
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        companyId,
        data.name,
        data.document,
        data.email ?? null,
        data.phone ?? null,
        data.addressLine1 ?? null,
        data.addressLine2 ?? null,
        data.city ?? null,
        data.state ?? null,
        data.zip ?? null,
      ]
    );
    return rows[0];
  },

  async update(companyId: string, id: string, data: Partial<CreateCustomer>) {
    const rows = await query(
      `
      UPDATE customers
      SET
        name = COALESCE($3, name),
        document = COALESCE($4, document),
        email = COALESCE($5, email),
        phone = COALESCE($6, phone),
        address_line1 = COALESCE($7, address_line1),
        address_line2 = COALESCE($8, address_line2),
        city = COALESCE($9, city),
        state = COALESCE($10, state),
        zip = COALESCE($11, zip)
      WHERE company_id = $1 AND id = $2
      RETURNING *
      `,
      [
        companyId,
        id,
        data.name ?? null,
        data.document ?? null,
        data.email ?? null,
        data.phone ?? null,
        data.addressLine1 ?? null,
        data.addressLine2 ?? null,
        data.city ?? null,
        data.state ?? null,
        data.zip ?? null,
      ]
    );
    if (!rows[0]) throw Object.assign(new Error("Customer not found"), { status: 404 });
    return rows[0];
  },

  async remove(companyId: string, id: string) {
    const rows = await query(`DELETE FROM customers WHERE company_id = $1 AND id = $2 RETURNING id`, [companyId, id]);
    if (!rows[0]) throw Object.assign(new Error("Customer not found"), { status: 404 });
  },
};
