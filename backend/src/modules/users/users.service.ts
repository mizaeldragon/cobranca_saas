import { query } from "../../config/db";
import { hashPassword } from "../../utils/password";

export const UsersService = {
  async list(companyId: string) {
    return query(
      `SELECT id, full_name, email, role, active, created_at FROM users WHERE company_id = $1 ORDER BY created_at DESC`,
      [companyId]
    );
  },

  async create(companyId: string, data: any) {
    const password_hash = await hashPassword(data.password);
    const rows = await query(
      `
      INSERT INTO users (company_id, full_name, email, password_hash, role)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id, full_name, email, role, active, created_at
      `,
      [companyId, data.fullName, data.email.toLowerCase(), password_hash, data.role]
    );
    return rows[0];
  },

  async update(companyId: string, userId: string, data: any) {
    const rows = await query(
      `
      UPDATE users
      SET
        full_name = COALESCE($3, full_name),
        role = COALESCE($4, role),
        active = COALESCE($5, active)
      WHERE company_id = $1 AND id = $2
      RETURNING id, full_name, email, role, active, created_at
      `,
      [companyId, userId, data.fullName ?? null, data.role ?? null, data.active ?? null]
    );
    if (!rows[0]) throw Object.assign(new Error("User not found"), { status: 404 });
    return rows[0];
  },
};
