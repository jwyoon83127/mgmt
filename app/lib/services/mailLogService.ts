import 'server-only';
import pool from '../db';

export type MailType = 'credential' | 'password_reset' | 'test' | 'other';
export type MailLogStatus = 'sent' | 'failed';

export async function logMail(entry: {
  to: string;
  subject: string;
  mailType: MailType;
  status: MailLogStatus;
  messageId?: string;
  error?: string;
  userId?: string;
}): Promise<void> {
  const id = `mail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await pool.query(
      `INSERT INTO mail_send_logs (id, to_address, subject, mail_type, status, message_id, error_message, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, entry.to, entry.subject, entry.mailType, entry.status, entry.messageId ?? null, entry.error ?? null, entry.userId ?? null]
    );
  } catch (e) {
    console.error('logMail error:', e);
  }
}

export type MailLog = {
  id: string;
  to: string;
  subject: string | null;
  mailType: MailType;
  status: MailLogStatus;
  messageId: string | null;
  error: string | null;
  sentAt: string;
  userId: string | null;
};

type MailRow = {
  id: string;
  to_address: string;
  subject: string | null;
  mail_type: MailType;
  status: MailLogStatus;
  message_id: string | null;
  error_message: string | null;
  sent_at: Date;
  user_id: string | null;
};

export async function listRecentMailLogs(limit = 50): Promise<MailLog[]> {
  const { rows } = await pool.query<MailRow>(
    'SELECT * FROM mail_send_logs ORDER BY sent_at DESC LIMIT $1',
    [limit]
  );
  return rows.map(r => ({
    id: r.id,
    to: r.to_address,
    subject: r.subject,
    mailType: r.mail_type,
    status: r.status,
    messageId: r.message_id,
    error: r.error_message,
    sentAt: r.sent_at instanceof Date ? r.sent_at.toISOString() : String(r.sent_at),
    userId: r.user_id,
  }));
}
