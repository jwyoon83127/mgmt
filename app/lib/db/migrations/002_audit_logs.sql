-- Part 1 Phase 2 migration: password_reset_logs + audit_logs
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS password_reset_logs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  reset_by VARCHAR(50),
  reset_method ENUM('admin','self') NOT NULL DEFAULT 'admin',
  reset_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  INDEX idx_pw_user (user_id, reset_at),
  INDEX idx_pw_actor (reset_by, reset_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  actor_id VARCHAR(50),
  actor_email VARCHAR(191),
  action ENUM(
    'login_success','login_failed','logout',
    'user_created','user_deleted','password_reset',
    'smtp_updated','smtp_cleared','smtp_tested',
    'mail_sent','mail_failed'
  ) NOT NULL,
  target_id VARCHAR(50),
  target_label VARCHAR(191),
  details LONGTEXT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor (actor_id, occurred_at),
  INDEX idx_audit_action (action, occurred_at),
  INDEX idx_audit_time (occurred_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
