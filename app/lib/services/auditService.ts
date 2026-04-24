import 'server-only';
import pool from '../db';

export type AuditAction =
  | 'login_success' | 'login_failed' | 'logout'
  | 'user_created' | 'user_deleted' | 'password_reset'
  | 'smtp_updated' | 'smtp_cleared' | 'smtp_tested'
  | 'mail_sent' | 'mail_failed';

export async function writeAudit(entry: {
  action: AuditAction;
  actorId?: string | null;
  actorEmail?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await pool.query(
      `INSERT INTO audit_logs (id, actor_id, actor_email, action, target_id, target_label, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        entry.actorId ?? null,
        entry.actorEmail ?? null,
        entry.action,
        entry.targetId ?? null,
        entry.targetLabel ?? null,
        entry.details ? JSON.stringify(entry.details) : null,
      ]
    );
  } catch (e) {
    console.error('writeAudit error:', e);
  }
}

export async function logPasswordReset(entry: {
  userId: string;
  resetBy?: string | null;
  method: 'admin' | 'self';
}): Promise<void> {
  const id = `pwreset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await pool.query(
      `INSERT INTO password_reset_logs (id, user_id, reset_by, reset_method) VALUES ($1, $2, $3, $4)`,
      [id, entry.userId, entry.resetBy ?? null, entry.method]
    );
  } catch (e) {
    console.error('logPasswordReset error:', e);
  }
}

export type AuditRow = {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: AuditAction;
  targetId: string | null;
  targetLabel: string | null;
  details: Record<string, unknown> | null;
  occurredAt: string;
};

type RawAudit = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: AuditAction;
  target_id: string | null;
  target_label: string | null;
  details: Record<string, unknown> | null;
  occurred_at: Date;
};

export async function listRecentAudits(limit = 100): Promise<AuditRow[]> {
  const { rows } = await pool.query<RawAudit>(
    'SELECT * FROM audit_logs ORDER BY occurred_at DESC LIMIT $1',
    [limit]
  );
  return rows.map(r => ({
    id: r.id,
    actorId: r.actor_id,
    actorEmail: r.actor_email,
    action: r.action,
    targetId: r.target_id,
    targetLabel: r.target_label,
    details: r.details ?? null,
    occurredAt: r.occurred_at instanceof Date ? r.occurred_at.toISOString() : String(r.occurred_at),
  }));
}
