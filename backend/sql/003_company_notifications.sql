-- 003_company_notifications.sql
-- Credenciais de notificacao por empresa (BYO)

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS whatsapp_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_provider text NOT NULL DEFAULT 'twilio',
  ADD COLUMN IF NOT EXISTS twilio_account_sid text,
  ADD COLUMN IF NOT EXISTS twilio_auth_token text,
  ADD COLUMN IF NOT EXISTS twilio_whatsapp_from text,
  ADD COLUMN IF NOT EXISTS twilio_whatsapp_template_sid text,
  ADD COLUMN IF NOT EXISTS email_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS smtp_host text,
  ADD COLUMN IF NOT EXISTS smtp_port integer,
  ADD COLUMN IF NOT EXISTS smtp_user text,
  ADD COLUMN IF NOT EXISTS smtp_pass text,
  ADD COLUMN IF NOT EXISTS smtp_from text,
  ADD COLUMN IF NOT EXISTS smtp_secure boolean NOT NULL DEFAULT false;
