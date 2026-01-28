import { query } from "../../config/db";
import { comparePassword, hashPassword } from "../../utils/password";
import { hashPassword } from "../../utils/password";

export const UsersService = {
  async getById(companyId: string, userId: string) {
    const rows = await query(
      `SELECT id, full_name, email, phone, role, active, created_at FROM users WHERE company_id = $1 AND id = $2 LIMIT 1`,
      [companyId, userId]
    );
    if (!rows[0]) throw Object.assign(new Error("User not found"), { status: 404 });
    return rows[0];
  },

  async listPaged(companyId: string, q: any) {
    const page = Math.max(1, Number(q.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 20)));
    const offset = (page - 1) * pageSize;
    const roleRaw = q.role ? String(q.role).toUpperCase() : null;
    const role = roleRaw === "ADMIN" || roleRaw === "OWNER" ? roleRaw : null;

    const items = await query(
      `
      SELECT id, full_name, email, phone, role, active, created_at
      FROM users
      WHERE company_id = $1
        AND ($2::user_role IS NULL OR role = $2)
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4
      `,
      [companyId, role, pageSize, offset]
    );

    const totalRow = (
      await query<{ count: string }>(
        `
        SELECT COUNT(*)::text as count
        FROM users
        WHERE company_id = $1
          AND ($2::user_role IS NULL OR role = $2)
        `,
        [companyId, role]
      )
    )[0];

    return { page, pageSize, total: Number(totalRow?.count ?? "0"), items };
  },

  async create(companyId: string, data: any) {
    const password_hash = await hashPassword(data.password);
    const rows = await query(
      `
      INSERT INTO users (company_id, full_name, email, phone, password_hash, role)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING id, full_name, email, phone, role, active, created_at
      `,
      [companyId, data.fullName, data.email.toLowerCase(), data.phone ?? null, password_hash, data.role]
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

  async updateMe(
    companyId: string,
    userId: string,
    data: { fullName?: string; email?: string; phone?: string; currentPassword?: string; newPassword?: string }
  ) {
    const rows = await query<{ id: string; email: string; password_hash: string; role: "OWNER" | "ADMIN" }>(
      `SELECT id, email, password_hash, role FROM users WHERE company_id = $1 AND id = $2 AND active = true LIMIT 1`,
      [companyId, userId]
    );
    const user = rows[0];
    if (!user) throw Object.assign(new Error("User not found"), { status: 404 });

    const wantsEmail = typeof data.email === "string" && data.email.trim().length > 0;
    const wantsPhone = typeof data.phone === "string" && data.phone.trim().length > 0;
    const wantsPassword = typeof data.newPassword === "string" && data.newPassword.length > 0;

    if (wantsEmail || wantsPassword || wantsPhone) {
      if (wantsPassword) {
        if (!data.currentPassword) {
          throw Object.assign(new Error("Senha atual obrigatoria"), { status: 400 });
        }
        const ok = await comparePassword(data.currentPassword, user.password_hash);
        if (!ok) throw Object.assign(new Error("Senha atual incorreta"), { status: 401 });
      }

      if (wantsEmail) {
        const newEmail = data.email!.toLowerCase();
        const existing = await query<{ id: string }>(
          `SELECT id FROM users WHERE company_id = $1 AND email = $2 AND id <> $3 LIMIT 1`,
          [companyId, newEmail, userId]
        );
        if (existing[0]) throw Object.assign(new Error("Email ja cadastrado"), { status: 409 });
      }

      let newPasswordHash: string | null = null;
      if (wantsPassword) {
        newPasswordHash = await hashPassword(data.newPassword!);
      }

      const updated = (
        await query(
          `
          UPDATE users
          SET
            full_name = COALESCE($3, full_name),
            email = COALESCE($4, email),
            phone = COALESCE($5, phone),
            password_hash = COALESCE($6, password_hash)
          WHERE company_id = $1 AND id = $2
          RETURNING id, full_name, email, phone, role, active, created_at
          `,
          [
            companyId,
            userId,
            data.fullName ?? null,
            data.email?.toLowerCase() ?? null,
            wantsPhone ? data.phone?.trim() : null,
            newPasswordHash,
          ]
        )
      )[0];

      if (wantsEmail) {
        await query(`UPDATE companies SET email = $2 WHERE id = $1`, [companyId, data.email!.toLowerCase()]);
      }

      if (wantsPassword && user.role === "OWNER" && newPasswordHash) {
        await query(`UPDATE companies SET password_hash = $2 WHERE id = $1`, [companyId, newPasswordHash]);
      }
      if (data.fullName && user.role === "OWNER") {
        await query(`UPDATE companies SET legal_name = $2 WHERE id = $1`, [companyId, data.fullName]);
      }

      return {
        user: updated,
        emailChanged: wantsEmail && data.email!.toLowerCase() !== user.email,
        passwordChanged: wantsPassword,
      };
    }

    const updated = (
      await query(
        `
        UPDATE users
        SET
          full_name = COALESCE($3, full_name),
          phone = COALESCE($4, phone)
        WHERE company_id = $1 AND id = $2
        RETURNING id, full_name, email, phone, role, active, created_at
        `,
        [companyId, userId, data.fullName ?? null, wantsPhone ? data.phone?.trim() : null]
      )
    )[0];
    if (data.fullName && user.role === "OWNER") {
      await query(`UPDATE companies SET legal_name = $2 WHERE id = $1`, [companyId, data.fullName]);
    }
    return { user: updated, emailChanged: false, passwordChanged: false };
  },
};
