import 'server-only';
import nodemailer from 'nodemailer';
import { resolveSmtpConfig, type SmtpConfig } from './smtpConfig';
import { logMail, type MailType } from './mailLogService';
import { writeAudit } from './auditService';

export type MailResult =
  | { ok: true; messageId: string }
  | { ok: false; reason: 'smtp_not_configured' | 'send_failed'; error?: string };

function buildTransporter(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  mailType?: MailType;
  userId?: string;
}): Promise<MailResult> {
  const cfg = await resolveSmtpConfig();
  if (!cfg) return { ok: false, reason: 'smtp_not_configured' };
  try {
    const info = await buildTransporter(cfg).sendMail({ from: cfg.from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
    await logMail({ to: opts.to, subject: opts.subject, mailType: opts.mailType ?? 'other', status: 'sent', messageId: info.messageId, userId: opts.userId });
    await writeAudit({ action: 'mail_sent', targetLabel: opts.to, details: { subject: opts.subject, mailType: opts.mailType ?? 'other' } });
    return { ok: true, messageId: info.messageId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await logMail({ to: opts.to, subject: opts.subject, mailType: opts.mailType ?? 'other', status: 'failed', error: message, userId: opts.userId });
    await writeAudit({ action: 'mail_failed', targetLabel: opts.to, details: { subject: opts.subject, mailType: opts.mailType ?? 'other', error: message } });
    return { ok: false, reason: 'send_failed', error: message };
  }
}

export async function verifyConfig(cfg: SmtpConfig): Promise<MailResult> {
  try {
    await buildTransporter(cfg).verify();
    return { ok: true, messageId: 'verified' };
  } catch (e) {
    return { ok: false, reason: 'send_failed', error: e instanceof Error ? e.message : String(e) };
  }
}
