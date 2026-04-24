-- Part 1 Phase 2 migration: password_reset_logs + audit_logs
-- Idempotent: safe to run multiple times.

CREATE TYPE IF NOT EXISTS reset_method AS ENUM ('admin', 'self');
CREATE TYPE IF NOT EXISTS audit_action AS ENUM (
  'login_success', 'login_failed', 'logout',
  'user_created', 'user_deleted', 'password_reset',
  'smtp_updated', 'smtp_cleared', 'smtp_tested',
  'mail_sent', 'mail_failed'
);

CREATE TABLE IF NOT EXISTS password_reset_logs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  reset_by VARCHAR(50),
  reset_method reset_method NOT NULL DEFAULT 'admin',
  reset_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);

CREATE INDEX IF NOT EXISTS idx_pw_user ON password_reset_logs (user_id, reset_at);
CREATE INDEX IF NOT EXISTS idx_pw_actor ON password_reset_logs (reset_by, reset_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  actor_id VARCHAR(50),
  actor_email VARCHAR(191),
  action audit_action NOT NULL,
  target_id VARCHAR(50),
  target_label VARCHAR(191),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs (actor_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs (action, occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs (occurred_at);
