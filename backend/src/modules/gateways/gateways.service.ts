import { query } from "../../config/db";

export type GatewayProvider = "asaas" | "cora" | "santander";

export type GatewayRow = {
  id: string;
  company_id: string;
  provider: GatewayProvider;
  label: string | null;
  credentials: any;
  active: boolean;
  created_at: string;
  updated_at: string;
};

function buildCredentials(provider: GatewayProvider, data: any) {
  if (provider === "asaas") {
    return {
      apiKey: data.apiKey,
      userAgent: data.userAgent ?? null,
    };
  }
  if (provider === "cora") {
    return {
      clientId: data.clientId,
      certificate: data.certificate,
      privateKey: data.privateKey,
      certificatePassword: data.certificatePassword ?? null,
    };
  }
  return {
    clientId: data.clientId,
    clientSecret: data.clientSecret,
    certificate: data.certificate,
    certificatePassword: data.certificatePassword ?? null,
    companyId: data.companyId ?? null,
    workspaceId: data.workspaceId ?? null,
    certificateExpiresAt: data.certificateExpiresAt ?? null,
  };
}

async function syncCompanyProvider(companyId: string, gateway: GatewayRow) {
  if (!gateway.active) return;
  const provider = gateway.provider;
  const apiKey = provider === "asaas" ? gateway.credentials?.apiKey ?? null : null;
  await query(
    `
    UPDATE companies
    SET bank_provider = $2,
        provider_api_key = $3
    WHERE id = $1
    `,
    [companyId, provider, apiKey]
  );
}

export const GatewaysService = {
  async list(companyId: string) {
    return query<GatewayRow>(
      `
      SELECT id, company_id, provider, label, credentials, active, created_at, updated_at
      FROM company_gateways
      WHERE company_id = $1
      ORDER BY active DESC, created_at DESC
      `,
      [companyId]
    );
  },

  async create(companyId: string, data: any) {
    const credentials = buildCredentials(data.provider, data);
    const rows = await query<GatewayRow>(
      `
      INSERT INTO company_gateways (company_id, provider, label, credentials, active)
      VALUES ($1, $2, $3, $4::jsonb, $5)
      RETURNING id, company_id, provider, label, credentials, active, created_at, updated_at
      `,
      [companyId, data.provider, data.label ?? null, JSON.stringify(credentials), Boolean(data.active)]
    );
    const created = rows[0];
    if (!created) throw Object.assign(new Error("Failed to create gateway"), { status: 500 });
    if (created.active) {
      return GatewaysService.activate(companyId, created.id);
    }
    return created;
  },

  async update(companyId: string, id: string, data: any) {
    const existing = (
      await query<GatewayRow>(
        `
        SELECT id, company_id, provider, label, credentials, active, created_at, updated_at
        FROM company_gateways
        WHERE id = $1 AND company_id = $2
        `,
        [id, companyId]
      )
    )[0];
    if (!existing) throw Object.assign(new Error("Gateway not found"), { status: 404 });
    if (data.provider && data.provider !== existing.provider) {
      throw Object.assign(new Error("Gateway provider mismatch"), { status: 400 });
    }

    const nextCredentials = {
      ...existing.credentials,
      ...buildCredentials(existing.provider, { ...existing.credentials, ...data }),
    };

    const rows = await query<GatewayRow>(
      `
      UPDATE company_gateways
      SET
        label = COALESCE($3, label),
        credentials = $4::jsonb,
        active = COALESCE($5, active),
        updated_at = now()
      WHERE id = $2 AND company_id = $1
      RETURNING id, company_id, provider, label, credentials, active, created_at, updated_at
      `,
      [
        companyId,
        id,
        data.label ?? null,
        JSON.stringify(nextCredentials),
        typeof data.active === "boolean" ? data.active : null,
      ]
    );
    const updated = rows[0];
    if (!updated) throw Object.assign(new Error("Gateway not found"), { status: 404 });

    if (data.active === true) {
      return GatewaysService.activate(companyId, id);
    }

    if (existing.active && data.active === false) {
      await query(
        `
        UPDATE companies
        SET bank_provider = 'mock',
            provider_api_key = NULL
        WHERE id = $1
        `,
        [companyId]
      );
    }

    if (updated.active) {
      await syncCompanyProvider(companyId, updated);
    }

    return updated;
  },

  async activate(companyId: string, id: string) {
    const rows = await query<GatewayRow>(
      `
      UPDATE company_gateways
      SET active = CASE WHEN id = $2 THEN true ELSE false END,
          updated_at = now()
      WHERE company_id = $1
      RETURNING id, company_id, provider, label, credentials, active, created_at, updated_at
      `,
      [companyId, id]
    );
    const active = rows.find((row) => row.id === id);
    if (!active) throw Object.assign(new Error("Gateway not found"), { status: 404 });
    await syncCompanyProvider(companyId, active);
    return active;
  },

  async remove(companyId: string, id: string) {
    const rows = await query<GatewayRow>(
      `
      DELETE FROM company_gateways
      WHERE id = $1 AND company_id = $2
      RETURNING id, company_id, provider, label, credentials, active, created_at, updated_at
      `,
      [id, companyId]
    );
    const removed = rows[0];
    if (!removed) throw Object.assign(new Error("Gateway not found"), { status: 404 });
    if (removed.active) {
      await query(
        `
        UPDATE companies
        SET bank_provider = 'mock',
            provider_api_key = NULL
        WHERE id = $1
        `,
        [companyId]
      );
    }
    return removed;
  },
};
