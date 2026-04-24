'use server';

import { readSmtpConfig, writeSmtpConfig, clearSmtpConfig, configFromEnv, type SmtpConfig } from '@/lib/services/smtpConfig';
import { sendMail, verifyConfig, type MailResult } from '@/lib/services/mailer';
import { writeAudit } from '@/lib/services/auditService';

export type SmtpConfigPublic = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  from: string;
  hasPassword: boolean;
  source: 'db' | 'env' | 'none';
};

export async function getSmtpSettings(): Promise<SmtpConfigPublic> {
  const db = await readSmtpConfig();
  if (db) {
    return { host: db.host, port: db.port, secure: db.secure, user: db.user, from: db.from, hasPassword: !!db.pass, source: 'db' };
  }
  const env = configFromEnv();
  if (env) {
    return { host: env.host, port: env.port, secure: env.secure, user: env.user, from: env.from, hasPassword: !!env.pass, source: 'env' };
  }
  return { host: '', port: 587, secure: false, user: '', from: '', hasPassword: false, source: 'none' };
}

export async function saveSmtpSettings(input: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass?: string;
  from: string;
  actor?: { id: string; email: string } | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!input.host || !input.user) return { ok: false, error: '호스트와 사용자(ID)는 필수입니다.' };
  const existing = await readSmtpConfig();
  const password = input.pass && input.pass.length > 0 ? input.pass : existing?.pass;
  if (!password) return { ok: false, error: '비밀번호를 입력해주세요.' };
  const cfg: SmtpConfig = {
    host: input.host.trim(),
    port: Number(input.port) || 587,
    secure: !!input.secure,
    user: input.user.trim(),
    pass: password,
    from: input.from.trim() || input.user.trim(),
  };
  try {
    await writeSmtpConfig(cfg, input.actor?.id);
    await writeAudit({
      action: 'smtp_updated',
      actorId: input.actor?.id ?? null, actorEmail: input.actor?.email ?? null,
      details: { host: cfg.host, port: cfg.port, user: cfg.user },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function clearSmtpSettings(actor?: { id: string; email: string } | null): Promise<{ ok: true }> {
  await clearSmtpConfig();
  await writeAudit({ action: 'smtp_cleared', actorId: actor?.id ?? null, actorEmail: actor?.email ?? null });
  return { ok: true };
}

export async function testSmtpConnection(actor?: { id: string; email: string } | null): Promise<MailResult> {
  const db = await readSmtpConfig();
  const cfg = db ?? configFromEnv();
  if (!cfg) return { ok: false, reason: 'smtp_not_configured' };
  const res = await verifyConfig(cfg);
  if (res.ok) {
    try { const { markTestedNow } = await import('@/lib/services/smtpConfig'); await markTestedNow(); } catch {}
  }
  await writeAudit({
    action: 'smtp_tested',
    actorId: actor?.id ?? null, actorEmail: actor?.email ?? null,
    details: { ok: res.ok, error: res.ok ? undefined : res.error },
  });
  return res;
}

export async function sendTestMail(to: string): Promise<MailResult> {
  if (!to) return { ok: false, reason: 'send_failed', error: '수신자를 입력해주세요.' };
  return sendMail({
    to,
    subject: '[경영집행위원회] SMTP 테스트 메일',
    text: '메일 발송 설정이 정상적으로 동작합니다.',
    html: '<p>메일 발송 설정이 정상적으로 동작합니다.</p>',
    mailType: 'test',
  });
}
