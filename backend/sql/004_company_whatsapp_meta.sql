-- 004_company_whatsapp_meta.sql
-- Credenciais Meta Cloud API por empresa

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS meta_access_token text,
  ADD COLUMN IF NOT EXISTS meta_phone_number_id text,
  ADD COLUMN IF NOT EXISTS meta_base_url text;

ALTER TABLE companies
  ALTER COLUMN whatsapp_provider SET DEFAULT 'meta';

UPDATE companies
SET whatsapp_provider = 'meta'
WHERE whatsapp_provider = 'twilio';
