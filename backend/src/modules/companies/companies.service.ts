import { query } from "../../config/db";

export const CompaniesService = {
  async getMe(companyId: string) {
    const rows = await query(
      `
      SELECT
        id,
        legal_name,
        document,
        email,
        bank_provider,
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
        smtp_secure,
        created_at
      FROM companies
      WHERE id = $1
      `,
      [companyId]
    );
    if (!rows[0]) throw Object.assign(new Error("Company not found"), { status: 404 });
    return rows[0];
  },

  async updateMe(
    companyId: string,
    data: {
      legalName?: string;
      bankProvider?: string;
      providerApiKey?: string | null;
      whatsappEnabled?: boolean;
      whatsappProvider?: string;
      metaAccessToken?: string | null;
      metaPhoneNumberId?: string | null;
      metaBaseUrl?: string | null;
      metaTemplateName?: string | null;
      metaTemplateLanguage?: string | null;
      emailEnabled?: boolean;
      smtpHost?: string | null;
      smtpPort?: number | null;
      smtpUser?: string | null;
      smtpPass?: string | null;
      smtpFrom?: string | null;
      smtpSecure?: boolean;
    }
  ) {
    const rows = await query(
      `
      UPDATE companies
      SET
        legal_name = COALESCE($2, legal_name),
        bank_provider = COALESCE($3, bank_provider),
        provider_api_key = COALESCE($4, provider_api_key),
        whatsapp_enabled = COALESCE($5, whatsapp_enabled),
        whatsapp_provider = COALESCE($6, whatsapp_provider),
        meta_access_token = COALESCE($7, meta_access_token),
        meta_phone_number_id = COALESCE($8, meta_phone_number_id),
        meta_base_url = COALESCE($9, meta_base_url),
        meta_template_name = COALESCE($10, meta_template_name),
        meta_template_language = COALESCE($11, meta_template_language),
        email_enabled = COALESCE($12, email_enabled),
        smtp_host = COALESCE($13, smtp_host),
        smtp_port = COALESCE($14, smtp_port),
        smtp_user = COALESCE($15, smtp_user),
        smtp_pass = COALESCE($16, smtp_pass),
        smtp_from = COALESCE($17, smtp_from),
        smtp_secure = COALESCE($18, smtp_secure)
      WHERE id = $1
      RETURNING
        id,
        legal_name,
        document,
        email,
        bank_provider,
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
        smtp_secure,
        created_at
      `,
      [
        companyId,
        data.legalName ?? null,
        data.bankProvider ?? null,
        data.providerApiKey ?? null,
        typeof data.whatsappEnabled === "boolean" ? data.whatsappEnabled : null,
        data.whatsappProvider ?? null,
        data.metaAccessToken ?? null,
        data.metaPhoneNumberId ?? null,
        data.metaBaseUrl ?? null,
        data.metaTemplateName ?? null,
        data.metaTemplateLanguage ?? null,
        typeof data.emailEnabled === "boolean" ? data.emailEnabled : null,
        data.smtpHost ?? null,
        typeof data.smtpPort === "number" ? data.smtpPort : null,
        data.smtpUser ?? null,
        data.smtpPass ?? null,
        data.smtpFrom ?? null,
        typeof data.smtpSecure === "boolean" ? data.smtpSecure : null,
      ]
    );
    if (!rows[0]) throw Object.assign(new Error("Company not found"), { status: 404 });
    if (data.legalName) {
      await query(
        `
        UPDATE users
        SET full_name = $2
        WHERE company_id = $1 AND role = 'OWNER'
        `,
        [companyId, data.legalName]
      );
    }
    return rows[0];
  },
};
