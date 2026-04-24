'use server';

import { sendMail, type MailResult } from '@/lib/services/mailer';

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

export async function sendCredentialsEmail(params: {
  to: string;
  name: string;
  loginId: string;
  password: string;
  kind: 'new' | 'reset';
}): Promise<MailResult> {
  const { to, name, loginId, password, kind } = params;
  const subject = kind === 'new'
    ? '[경영집행위원회] 계정이 생성되었습니다'
    : '[경영집행위원회] 비밀번호가 재설정되었습니다';

  const intro = kind === 'new'
    ? '경영집행위원회 시스템 계정이 생성되었습니다. 아래 정보로 로그인하신 뒤 비밀번호를 변경해 주세요.'
    : '관리자가 비밀번호를 재설정했습니다. 아래 임시 비밀번호로 로그인하신 뒤 비밀번호를 변경해 주세요.';

  const html = `
<!doctype html>
<html><body style="font-family:-apple-system,'Segoe UI',Roboto,sans-serif;background:#f5f6f8;padding:32px;margin:0;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e5e7eb;">
    <div style="font-size:14px;color:#2a676c;font-weight:700;letter-spacing:.08em;">EXECUTIVE COMMITTEE</div>
    <h1 style="font-size:20px;margin:8px 0 16px;color:#111827;">${escapeHtml(name)} 님, 안녕하세요</h1>
    <p style="color:#374151;line-height:1.6;">${escapeHtml(intro)}</p>
    <div style="margin:24px 0;padding:16px 20px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb;">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">로그인 ID</div>
      <div style="font-size:16px;font-weight:600;color:#111827;margin-bottom:12px;">${escapeHtml(loginId)}</div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">${kind === 'new' ? '초기' : '임시'} 비밀번호</div>
      <div style="font-size:16px;font-weight:600;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#111827;">${escapeHtml(password)}</div>
    </div>
    <p style="color:#6b7280;font-size:13px;line-height:1.6;">보안을 위해 로그인 후 즉시 비밀번호를 변경해 주세요. 본 메일은 발신 전용입니다.</p>
  </div>
</body></html>`;

  const text = `${name} 님, 안녕하세요\n\n${intro}\n\n로그인 ID: ${loginId}\n${kind === 'new' ? '초기' : '임시'} 비밀번호: ${password}\n\n로그인 후 즉시 비밀번호를 변경해 주세요.`;

  return sendMail({ to, subject, html, text, mailType: kind === 'new' ? 'credential' : 'password_reset' });
}
