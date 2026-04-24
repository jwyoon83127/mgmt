import 'server-only';
import pool from '../db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { encryptSecret, decryptSecret } from './crypto';

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

type SmtpRow = RowDataPacket & {
  id: number;
  host: string;
  port: number;
  secure: number;
  smtp_user: string;
  password_encrypted: Buffer;
  from_address: string | null;
  status: 'active' | 'inactive';
};

export async function readSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const [rows] = await pool.query<SmtpRow[]>(
      "SELECT id, host, port, secure, smtp_user, password_encrypted, from_address, status FROM smtp_settings WHERE status = 'active' ORDER BY updated_at DESC LIMIT 1"
    );
    const row = rows[0];
    if (!row) return null;
    return {
      host: row.host,
      port: Number(row.port) || 587,
      secure: !!row.secure,
      user: row.smtp_user,
      pass: decryptSecret(row.password_encrypted),
      from: row.from_address || row.smtp_user,
    };
  } catch (e) {
    console.error('readSmtpConfig error:', e);
    return null;
  }
}

export async function writeSmtpConfig(cfg: SmtpConfig, updatedBy?: string): Promise<void> {
  const encrypted = encryptSecret(cfg.pass);
  // 단일 활성 레코드 정책: 기존 active를 inactive 처리 후 새 레코드 삽입
  await pool.query("UPDATE smtp_settings SET status = 'inactive' WHERE status = 'active'");
  await pool.query<ResultSetHeader>(
    `INSERT INTO smtp_settings (host, port, secure, smtp_user, password_encrypted, from_address, status, tested_at, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, 'active', NULL, ?)`,
    [cfg.host, cfg.port, cfg.secure ? 1 : 0, cfg.user, encrypted, cfg.from || cfg.user, updatedBy ?? null]
  );
}

export async function clearSmtpConfig(): Promise<void> {
  await pool.query("UPDATE smtp_settings SET status = 'inactive' WHERE status = 'active'");
}

export function configFromEnv(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return {
    host,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true',
    user,
    pass,
    from: process.env.SMTP_FROM || user,
  };
}

export async function resolveSmtpConfig(): Promise<SmtpConfig | null> {
  return (await readSmtpConfig()) ?? configFromEnv();
}

export async function markTestedNow(): Promise<void> {
  await pool.query("UPDATE smtp_settings SET tested_at = CURRENT_TIMESTAMP WHERE status = 'active'");
}
