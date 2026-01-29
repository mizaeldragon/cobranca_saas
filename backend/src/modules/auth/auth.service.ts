import { query } from "../../config/db";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccess, signRefresh, verifyRefresh } from "../../utils/jwt";
import bcrypt from "bcryptjs";
import crypto from "crypto";

type RegisterInput = {
  legalName: string;
  document: string;
  email: string;
  phone: string;
  password: string;
  bankProvider?: string;
  providerApiKey?: string;
};

type UserRow = {
  id: string;
  company_id: string;
  email: string;
  password_hash: string;
  role: "OWNER" | "ADMIN";
};

export const AuthService = {
  async register(input: RegisterInput) {
    const password_hash = await hashPassword(input.password);

    const company = (
      await query<{ id: string; email: string }>(
        `
        INSERT INTO companies (legal_name, document, email, password_hash, bank_provider, provider_api_key, webhook_secret)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING id, email
        `,
        [
          input.legalName,
          input.document,
          input.email.toLowerCase(),
          password_hash,
          input.bankProvider ?? "mock",
          input.providerApiKey ?? null,
          crypto.randomBytes(24).toString("hex"),
        ]
      )
    )[0];

    // cria user OWNER
    const user = (
      await query<UserRow>(
        `
        INSERT INTO users (company_id, full_name, email, phone, password_hash, role)
        VALUES ($1,$2,$3,$4,$5,'OWNER')
        RETURNING id, company_id, email, password_hash, role
        `,
        [company.id, input.legalName, input.email.toLowerCase(), input.phone, password_hash]
      )
    )[0];

    const payload = { companyId: company.id, email: user.email };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    const token_hash = await bcrypt.hash(refreshToken, 10);
    await query(`INSERT INTO refresh_tokens (company_id, token_hash) VALUES ($1,$2)`, [company.id, token_hash]);

    return { companyId: company.id, userId: user.id, role: user.role, accessToken, refreshToken };
  },

  async login(input: { email: string; password: string }) {
    // login “global” (procura por user email)
    const rows = await query<UserRow>(
      `SELECT id, company_id, email, password_hash, role FROM users WHERE email = $1 AND active = true LIMIT 1`,
      [input.email.toLowerCase()]
    );
    const user = rows[0];
    if (!user) throw Object.assign(new Error("Email ou senha invalidos"), { status: 401 });

    const ok = await comparePassword(input.password, user.password_hash);
    if (!ok) throw Object.assign(new Error("Email ou senha invalidos"), { status: 401 });

    const payload = { companyId: user.company_id, email: user.email };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh(payload);

    const token_hash = await bcrypt.hash(refreshToken, 10);
    await query(`INSERT INTO refresh_tokens (company_id, token_hash) VALUES ($1,$2)`, [user.company_id, token_hash]);

    return { companyId: user.company_id, userId: user.id, role: user.role, accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    let payload: { companyId: string; email: string };
    try {
      payload = verifyRefresh(refreshToken);
    } catch {
      throw Object.assign(new Error("Invalid refresh token"), { status: 401 });
    }

    const tokens = await query<{ id: string; token_hash: string; revoked: boolean }>(
      `SELECT id, token_hash, revoked FROM refresh_tokens WHERE company_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [payload.companyId]
    );

    const match = await Promise.all(
      tokens.map(async (t) => ({ t, ok: !t.revoked && (await bcrypt.compare(refreshToken, t.token_hash)) }))
    );
    const found = match.find((m) => m.ok)?.t;
    if (!found) throw Object.assign(new Error("Refresh token not found"), { status: 401 });

    const newAccessToken = signAccess(payload);
    const newRefreshToken = signRefresh(payload);

    await query(`UPDATE refresh_tokens SET revoked = true WHERE id = $1`, [found.id]);
    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await query(`INSERT INTO refresh_tokens (company_id, token_hash) VALUES ($1,$2)`, [payload.companyId, newHash]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  async logout(refreshToken: string) {
    let payload: { companyId: string; email: string };
    try {
      payload = verifyRefresh(refreshToken);
    } catch {
      return;
    }

    const tokens = await query<{ id: string; token_hash: string; revoked: boolean }>(
      `SELECT id, token_hash, revoked FROM refresh_tokens WHERE company_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [payload.companyId]
    );

    for (const t of tokens) {
      if (!t.revoked && (await bcrypt.compare(refreshToken, t.token_hash))) {
        await query(`UPDATE refresh_tokens SET revoked = true WHERE id = $1`, [t.id]);
        break;
      }
    }
  },
};
