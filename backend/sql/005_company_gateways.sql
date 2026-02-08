-- =========================================
-- 005_company_gateways.sql
-- Company gateways (multi-credentials)
-- =========================================

CREATE TABLE IF NOT EXISTS company_gateways (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  provider text NOT NULL,
  label text,
  credentials jsonb NOT NULL,
  active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_gateways_company_id
ON company_gateways(company_id);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_company_active_gateway
ON company_gateways(company_id)
WHERE active;
