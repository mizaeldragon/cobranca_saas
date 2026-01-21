import { query } from "../../config/db";

export const CompaniesService = {
  async getMe(companyId: string) {
    const rows = await query(
      `SELECT id, legal_name, document, email, bank_provider, created_at FROM companies WHERE id = $1`,
      [companyId]
    );
    if (!rows[0]) throw Object.assign(new Error("Company not found"), { status: 404 });
    return rows[0];
  },

  async updateMe(companyId: string, data: { legalName?: string; bankProvider?: string; providerApiKey?: string | null }) {
    const rows = await query(
      `
      UPDATE companies
      SET
        legal_name = COALESCE($2, legal_name),
        bank_provider = COALESCE($3, bank_provider),
        provider_api_key = COALESCE($4, provider_api_key)
      WHERE id = $1
      RETURNING id, legal_name, document, email, bank_provider, created_at
      `,
      [companyId, data.legalName ?? null, data.bankProvider ?? null, data.providerApiKey ?? null]
    );
    if (!rows[0]) throw Object.assign(new Error("Company not found"), { status: 404 });
    return rows[0];
  },
};
