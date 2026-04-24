'use client';

import { useEffect, useState } from 'react';
import { EnvelopeSimple, CaretDown, CaretUp, CheckCircle, Warning } from '@phosphor-icons/react';
import {
  getSmtpSettings, saveSmtpSettings, clearSmtpSettings, testSmtpConnection, sendTestMail,
  type SmtpConfigPublic,
} from '@/lib/actions/smtpSettings';
import { useAuthStore } from '@/lib/store/authStore';

type Status = { type: 'success' | 'error' | 'info'; text: string } | null;

const PRESETS: Record<string, { host: string; port: number; secure: boolean; note: string }> = {
  gmail: { host: 'smtp.gmail.com', port: 587, secure: false, note: '앱 비밀번호 필요 (일반 비밀번호 불가)' },
  naver: { host: 'smtp.naver.com', port: 587, secure: false, note: '네이버 메일 > 환경설정 > POP3/SMTP 사용 설정' },
  daum: { host: 'smtp.daum.net', port: 465, secure: true, note: '다음/카카오 메일' },
  worksmobile: { host: 'smtp.worksmobile.com', port: 465, secure: true, note: '네이버웍스' },
};

export default function SmtpSettings() {
  const currentUser = useAuthStore(s => s.currentUser);
  const actor = currentUser ? { id: currentUser.id, email: currentUser.email } : null;
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState<SmtpConfigPublic | null>(null);
  const [form, setForm] = useState({ host: '', port: 587, secure: false, user: '', pass: '', from: '' });
  const [status, setStatus] = useState<Status>(null);
  const [testTo, setTestTo] = useState('');
  const [busy, setBusy] = useState<'save' | 'test' | 'verify' | null>(null);

  useEffect(() => { (async () => {
    const c = await getSmtpSettings();
    setCfg(c);
    setForm({ host: c.host, port: c.port, secure: c.secure, user: c.user, pass: '', from: c.from });
  })(); }, []);

  const flash = (s: NonNullable<Status>) => { setStatus(s); setTimeout(() => setStatus(null), 4000); };

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    if (!p) return;
    setForm(f => ({ ...f, host: p.host, port: p.port, secure: p.secure }));
    flash({ type: 'info', text: p.note });
  };

  const handleSave = async () => {
    setBusy('save');
    const res = await saveSmtpSettings({ ...form, actor });
    setBusy(null);
    if (!res.ok) { flash({ type: 'error', text: res.error }); return; }
    const c = await getSmtpSettings();
    setCfg(c);
    setForm(f => ({ ...f, pass: '' }));
    flash({ type: 'success', text: '메일 서버 설정이 저장되었습니다.' });
  };

  const handleVerify = async () => {
    setBusy('verify');
    const res = await testSmtpConnection(actor);
    setBusy(null);
    if (res.ok) flash({ type: 'success', text: 'SMTP 연결 확인 완료.' });
    else if (res.reason === 'smtp_not_configured') flash({ type: 'error', text: '먼저 설정을 저장하세요.' });
    else flash({ type: 'error', text: `연결 실패: ${res.error ?? ''}` });
  };

  const handleTestSend = async () => {
    if (!testTo) { flash({ type: 'error', text: '테스트 수신 이메일을 입력하세요.' }); return; }
    setBusy('test');
    const res = await sendTestMail(testTo);
    setBusy(null);
    if (res.ok) flash({ type: 'success', text: `${testTo}로 테스트 메일을 발송했습니다.` });
    else if (res.reason === 'smtp_not_configured') flash({ type: 'error', text: '먼저 설정을 저장하세요.' });
    else flash({ type: 'error', text: `발송 실패: ${res.error ?? ''}` });
  };

  const handleClear = async () => {
    if (!confirm('저장된 메일 서버 설정을 삭제하시겠습니까?')) return;
    await clearSmtpSettings(actor);
    const c = await getSmtpSettings();
    setCfg(c);
    setForm({ host: c.host, port: c.port, secure: c.secure, user: c.user, pass: '', from: c.from });
    flash({ type: 'info', text: '설정을 초기화했습니다.' });
  };

  const source = cfg?.source ?? 'none';
  const sourceBadge =
    source === 'db' ? { text: 'DB 저장됨', cls: 'bg-[#9df197]/20 text-[#005c15]' }
    : source === 'env' ? { text: '환경변수', cls: 'bg-brand-container/50 text-brand-primary' }
    : { text: '미설정', cls: 'bg-[#ba1a1a]/10 text-[#ba1a1a]' };

  return (
    <div className="layer-card p-5 mb-6">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-container/40 text-brand-primary flex items-center justify-center shrink-0">
            <EnvelopeSimple size={18} weight="bold" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-ui-on-surface">메일 발송 설정 (SMTP)</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sourceBadge.cls}`}>{sourceBadge.text}</span>
            </div>
            <p className="text-xs text-ui-variant mt-0.5 truncate">
              {cfg && cfg.host ? `${cfg.user} @ ${cfg.host}:${cfg.port}` : '발송할 메일 계정을 등록해주세요.'}
            </p>
          </div>
        </div>
        {open ? <CaretUp size={18} className="text-ui-variant" /> : <CaretDown size={18} className="text-ui-variant" />}
      </button>

      {open && (
        <div className="mt-5 pt-5 border-t border-ui-high/30 space-y-3">
          {status && (
            <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${
              status.type === 'success' ? 'bg-[#9df197]/10 text-[#005c15]'
                : status.type === 'error' ? 'bg-[#ba1a1a]/10 text-[#ba1a1a]'
                : 'bg-brand-container/20 text-brand-primary'
            }`}>
              {status.type === 'success' ? <CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0" />
                : status.type === 'error' ? <Warning size={16} weight="fill" className="mt-0.5 shrink-0" />
                : <EnvelopeSimple size={16} className="mt-0.5 shrink-0" />}
              <span>{status.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-ui-variant self-center">빠른 설정:</span>
            {Object.keys(PRESETS).map(k => (
              <button key={k} type="button" onClick={() => applyPreset(k)}
                className="text-xs px-3 py-1 rounded-full border border-ui-high/40 hover:bg-ui-low cursor-pointer capitalize">
                {k}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-3">
            <div>
              <label className="block text-xs font-semibold text-ui-variant mb-1">SMTP 호스트</label>
              <input type="text" value={form.host}
                onChange={e => setForm({ ...form, host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ui-variant mb-1">포트</label>
              <input type="number" value={form.port}
                onChange={e => setForm({ ...form, port: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary" />
            </div>
            <label className="flex items-center gap-2 text-sm text-ui-on-surface cursor-pointer self-end pb-2">
              <input type="checkbox" checked={form.secure}
                onChange={e => setForm({ ...form, secure: e.target.checked })}
                className="w-4 h-4 accent-brand-primary" />
              SSL (465)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ui-variant mb-1">메일 계정 (ID)</label>
              <input type="text" value={form.user}
                onChange={e => setForm({ ...form, user: e.target.value, from: form.from || e.target.value })}
                placeholder="admin@humuson.com"
                className="w-full px-3 py-2 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ui-variant mb-1">
                비밀번호 {cfg?.hasPassword && <span className="text-[10px] text-ui-variant font-normal">(저장됨 — 변경 시에만 입력)</span>}
              </label>
              <input type="password" value={form.pass}
                onChange={e => setForm({ ...form, pass: e.target.value })}
                placeholder={cfg?.hasPassword ? '••••••••' : '앱 비밀번호 또는 SMTP 비밀번호'}
                className="w-full px-3 py-2 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ui-variant mb-1">발신자 표기 (From)</label>
            <input type="text" value={form.from}
              onChange={e => setForm({ ...form, from: e.target.value })}
              placeholder='"경영집행위원회" <admin@humuson.com>'
              className="w-full px-3 py-2 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              <button type="button" onClick={handleSave} disabled={busy !== null} className="btn-primary disabled:opacity-50">
                {busy === 'save' ? '저장 중...' : '저장'}
              </button>
              <button type="button" onClick={handleVerify} disabled={busy !== null || source === 'none'} className="btn-secondary disabled:opacity-50">
                {busy === 'verify' ? '확인 중...' : '연결 테스트'}
              </button>
              {source === 'db' && (
                <button type="button" onClick={handleClear} className="btn-secondary text-[#ba1a1a]">초기화</button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <input type="email" value={testTo} onChange={e => setTestTo(e.target.value)}
                placeholder="테스트 수신 이메일"
                className="px-3 py-2 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary w-60" />
              <button type="button" onClick={handleTestSend} disabled={busy !== null || source === 'none'} className="btn-secondary disabled:opacity-50">
                {busy === 'test' ? '발송 중...' : '테스트 발송'}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-ui-variant leading-relaxed pt-2 border-t border-ui-high/20">
            <strong>Gmail</strong>은 <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-brand-primary underline">앱 비밀번호</a>가 필요합니다. <strong>네이버/다음</strong>은 메일 설정에서 "POP3/SMTP 사용" 옵션을 켜야 합니다.
            저장된 비밀번호는 DB의 <code className="bg-ui-low px-1 rounded">smtp_settings</code> 테이블에 AES-256-GCM으로 암호화되어 저장됩니다. <code className="bg-ui-low px-1 rounded">APP_SECRET_KEY</code> 환경변수가 설정되어야 합니다.
          </div>
        </div>
      )}
    </div>
  );
}
