-- Part 1 Phase 1 migration: users + smtp_settings + mail_send_logs
-- Idempotent: safe to run multiple times.

CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'user');
CREATE TYPE IF NOT EXISTS smtp_status AS ENUM ('active', 'inactive');
CREATE TYPE IF NOT EXISTS mail_type AS ENUM ('credential', 'password_reset', 'test', 'other');
CREATE TYPE IF NOT EXISTS mail_status AS ENUM ('sent', 'failed');

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users (deleted_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS smtp_settings (
  id SERIAL PRIMARY KEY,
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL DEFAULT 587,
  secure BOOLEAN NOT NULL DEFAULT FALSE,
  smtp_user VARCHAR(255) NOT NULL,
  password_encrypted BYTEA NOT NULL,
  from_address VARCHAR(255),
  status smtp_status NOT NULL DEFAULT 'active',
  tested_at TIMESTAMPTZ NULL,
  updated_by VARCHAR(50),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_smtp_status ON smtp_settings (status, updated_at);

CREATE OR REPLACE TRIGGER smtp_settings_updated_at
  BEFORE UPDATE ON smtp_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS mail_send_logs (
  id VARCHAR(50) PRIMARY KEY,
  to_address VARCHAR(191) NOT NULL,
  subject VARCHAR(255),
  mail_type mail_type NOT NULL DEFAULT 'other',
  status mail_status NOT NULL,
  message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_mail_to ON mail_send_logs (to_address, sent_at);
CREATE INDEX IF NOT EXISTS idx_mail_user ON mail_send_logs (user_id, sent_at);
