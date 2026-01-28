-- =========================================
-- 003_add_phone_to_users.sql
-- Add phone field to users
-- =========================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone text;
