-- 006_company_meta_template.sql
-- Template Meta por empresa

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS meta_template_name text,
  ADD COLUMN IF NOT EXISTS meta_template_language text;
