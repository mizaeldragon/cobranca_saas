-- 005_remove_twilio_columns.sql
-- Remove colunas do Twilio (Meta Cloud API apenas)

ALTER TABLE companies
  DROP COLUMN IF EXISTS twilio_account_sid,
  DROP COLUMN IF EXISTS twilio_auth_token,
  DROP COLUMN IF EXISTS twilio_whatsapp_from,
  DROP COLUMN IF EXISTS twilio_whatsapp_template_sid;
