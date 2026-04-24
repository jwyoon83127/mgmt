-- Part 1 Phase 1 migration: users + smtp_settings + mail_send_logs
-- Idempotent: safe to run multiple times.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_users_role (role),
  INDEX idx_users_deleted (deleted_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS smtp_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL DEFAULT 587,
  secure TINYINT(1) NOT NULL DEFAULT 0,
  smtp_user VARCHAR(255) NOT NULL,
  password_encrypted VARBINARY(1024) NOT NULL,
  from_address VARCHAR(255),
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  tested_at TIMESTAMP NULL,
  updated_by VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_smtp_status (status, updated_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mail_send_logs (
  id VARCHAR(50) PRIMARY KEY,
  to_address VARCHAR(191) NOT NULL,
  subject VARCHAR(255),
  mail_type ENUM('credential','password_reset','test','other') NOT NULL DEFAULT 'other',
  status ENUM('sent','failed') NOT NULL,
  message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(50),
  INDEX idx_mail_to (to_address, sent_at),
  INDEX idx_mail_user (user_id, sent_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
