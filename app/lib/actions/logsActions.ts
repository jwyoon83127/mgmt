'use server';

import { listRecentAudits, type AuditRow } from '@/lib/services/auditService';
import { listRecentMailLogs, type MailLog } from '@/lib/services/mailLogService';

export async function fetchAuditLogs(limit = 100): Promise<AuditRow[]> {
  return listRecentAudits(limit);
}

export async function fetchMailLogs(limit = 50): Promise<MailLog[]> {
  return listRecentMailLogs(limit);
}
