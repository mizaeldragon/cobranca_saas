-- =========================================
-- 002_rbac_reports_fees.sql
-- Evolução do schema: RBAC, fees, webhooks, idempotência
-- =========================================

-- =========================
-- RBAC (Users + Roles)
-- =========================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('OWNER','ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  password_hash text NOT NULL,
  role user_role NOT NULL DEFAULT 'OWNER',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, email)
);

-- Migração segura: cria user OWNER a partir da tabela companies
INSERT INTO users (company_id, full_name, email, password_hash, role)
SELECT c.id, c.legal_name, c.email, c.password_hash, 'OWNER'
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM users u
  WHERE u.company_id = c.id AND u.email = c.email
);

-- =========================
-- Webhook security
-- =========================
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS webhook_secret text;

-- =========================
-- Fees em subscriptions
-- =========================
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS fine_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interest_bps integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_days_before integer NOT NULL DEFAULT 0;

-- =========================
-- Fees + idempotência em charges
-- =========================
ALTER TABLE charges
  ADD COLUMN IF NOT EXISTS fine_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interest_bps integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_until date,
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS invoice_url text;

-- Garante que uma cobrança não seja criada duas vezes
CREATE UNIQUE INDEX IF NOT EXISTS uniq_charges_idempotency
ON charges(company_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- Garante unicidade do provider_charge_id por empresa
CREATE UNIQUE INDEX IF NOT EXISTS uniq_charges_provider_ref
ON charges(company_id, provider, provider_charge_id)
WHERE provider_charge_id IS NOT NULL;

-- =========================
-- Índices para relatórios
-- =========================
CREATE INDEX IF NOT EXISTS idx_charges_company_status_due
  ON charges(company_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_charges_company_created
  ON charges(company_id, created_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_company_active
  ON subscriptions(company_id, active);

CREATE INDEX IF NOT EXISTS idx_users_company_id
  ON users(company_id);
