'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useAuthStore } from '@/lib/store/authStore';
import { generateTempPassword } from '@/lib/utils/password';
import { sendCredentialsEmail } from '@/lib/actions/sendCredentials';
import SmtpSettings from '@/components/admin/SmtpSettings';
import { UserPlus, Trash, ShieldCheck, EnvelopeSimple, Key, X, ArrowClockwise, Copy, Check } from '@phosphor-icons/react';

type Toast = { type: 'success' | 'error' | 'info'; text: string } | null;

export default function AdminUsersPage() {
  const router = useRouter();
  const { users, currentUser, addUser, deleteUser, resetPassword, isAdmin } = useAuthStore();
  const [ready, setReady] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '', sendEmail: true });
  const [toast, setToast] = useState<Toast>(null);
  const [showForm, setShowForm] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => { setReady(true); }, []);

  const showToast = (t: NonNullable<Toast>) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  if (ready && !isAdmin()) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-ui-surface py-12">
          <div className="max-w-xl mx-auto px-6 text-center layer-card p-12">
            <h1 className="text-xl font-bold text-ui-on-surface mb-2">접근 권한이 없습니다</h1>
            <p className="text-sm text-ui-variant mb-6">계정 관리는 관리자만 가능합니다.</p>
            <button onClick={() => router.push('/')} className="btn-secondary">대시보드로</button>
          </div>
        </main>
      </>
    );
  }

  const handleAutoGenerate = () => {
    setForm(f => ({ ...f, password: generateTempPassword(10) }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      showToast({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }
    const res = await addUser(form.email, form.name, form.password, 'user');
    if (!res.ok) {
      showToast({ type: 'error', text: res.error === 'duplicate' ? '이미 존재하는 이메일입니다.' : '계정 생성에 실패했습니다.' });
      return;
    }
    if (form.sendEmail) {
      const res = await sendCredentialsEmail({
        to: form.email, name: form.name, loginId: form.email, password: form.password, kind: 'new',
      });
      if (res.ok) {
        showToast({ type: 'success', text: `${form.name} 등록 완료. ${form.email}로 계정 정보를 발송했습니다.` });
      } else if (res.reason === 'smtp_not_configured') {
        showToast({ type: 'info', text: `${form.name} 등록 완료. 메일 서버가 설정되지 않아 발송되지 않았습니다.` });
      } else {
        showToast({ type: 'error', text: `${form.name} 등록 완료. 메일 발송 실패: ${res.error ?? ''}` });
      }
    } else {
      showToast({ type: 'success', text: `${form.name} 집행위원이 등록되었습니다.` });
    }
    setForm({ name: '', email: '', password: '', sendEmail: true });
    setShowForm(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} 집행위원을 삭제하시겠습니까?`)) return;
    const ok = await deleteUser(id);
    if (ok) showToast({ type: 'success', text: `${name} 집행위원이 삭제되었습니다.` });
    else showToast({ type: 'error', text: '삭제에 실패했습니다.' });
  };

  const admins = users.filter(u => u.role === 'admin');
  const executives = users.filter(u => u.role === 'user');

  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-ui-surface py-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-6 rounded-full bg-brand-primary" />
                <h1 className="text-2xl font-bold font-display text-ui-on-surface">계정 관리</h1>
              </div>
              <p className="text-sm text-ui-variant">관리자 및 집행위원 계정을 관리합니다. 집행위원은 관리자가 사전 등록한 인원만 이용 가능합니다.</p>
            </div>
            <button onClick={() => setShowForm(v => !v)} className="btn-primary">
              <UserPlus size={16} weight="bold" />
              {showForm ? '폼 닫기' : '집행위원 추가'}
            </button>
          </div>

          <SmtpSettings />

          {toast && (
            <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
              toast.type === 'success' ? 'bg-[#9df197]/10 border-[#9df197]/30 text-[#005c15]'
                : toast.type === 'error' ? 'bg-[#ba1a1a]/10 border-[#ba1a1a]/30 text-[#ba1a1a]'
                : 'bg-brand-container/20 border-brand-primary/30 text-brand-primary'
            }`}>
              {toast.text}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleAdd} className="layer-card p-6 mb-6 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text" placeholder="이름 (예: 홍길동 이사)"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="px-4 py-2.5 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary"
                />
                <input
                  type="email" placeholder="이메일 (로그인 ID)"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="px-4 py-2.5 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text" placeholder="초기 비밀번호"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary font-mono"
                />
                <button type="button" onClick={handleAutoGenerate} className="btn-secondary text-xs whitespace-nowrap">
                  <ArrowClockwise size={14} /> 자동 생성
                </button>
              </div>
              <label className="flex items-center gap-2 text-sm text-ui-on-surface cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sendEmail}
                  onChange={e => setForm({ ...form, sendEmail: e.target.checked })}
                  className="w-4 h-4 accent-brand-primary"
                />
                등록 완료 후 해당 이메일로 계정 정보(ID · 비밀번호)를 발송합니다.
              </label>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">등록</button>
              </div>
            </form>
          )}

          <section className="mb-8">
            <h2 className="text-sm font-bold text-ui-variant uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck size={16} /> 관리자 ({admins.length}명)
            </h2>
            <div className="space-y-2">
              {admins.map(u => (
                <UserRow
                  key={u.id} name={u.name} email={u.email} badge="관리자"
                  isMe={u.id === currentUser?.id}
                  onReset={() => setResetTarget({ id: u.id, name: u.name, email: u.email })}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-ui-variant uppercase tracking-wider mb-3">집행위원 ({executives.length}명)</h2>
            {executives.length === 0 ? (
              <div className="layer-card p-8 text-center text-sm text-ui-variant">등록된 집행위원이 없습니다.</div>
            ) : (
              <div className="space-y-2">
                {executives.map(u => (
                  <UserRow
                    key={u.id} name={u.name} email={u.email} badge="집행위원"
                    isMe={u.id === currentUser?.id}
                    onReset={() => setResetTarget({ id: u.id, name: u.name, email: u.email })}
                    onDelete={() => handleDelete(u.id, u.name)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {resetTarget && (
        <ResetPasswordModal
          target={resetTarget}
          onClose={() => setResetTarget(null)}
          onDone={(t) => { setResetTarget(null); showToast(t); }}
          resetPassword={resetPassword}
        />
      )}
    </>
  );
}

function UserRow({
  name, email, badge, isMe, onReset, onDelete,
}: {
  name: string; email: string; badge: string; isMe: boolean;
  onReset?: () => void; onDelete?: () => void;
}) {
  return (
    <div className="layer-card px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-ui-on-surface">{name}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              badge.includes('관리자') ? 'bg-brand-primary text-white' : 'bg-ui-low text-ui-on-surface'
            }`}>
              {badge}
            </span>
            {isMe && <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-container/50 text-brand-primary font-semibold">현재 로그인</span>}
          </div>
          <p className="text-xs text-ui-variant mt-0.5 flex items-center gap-1"><EnvelopeSimple size={12} /> {email}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onReset && (
          <button
            onClick={onReset}
            className="p-2 rounded-lg text-ui-variant hover:text-brand-primary hover:bg-brand-container/30 transition-colors cursor-pointer"
            title="비밀번호 재설정"
          >
            <Key size={16} />
          </button>
        )}
        {onDelete && !isMe && (
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors cursor-pointer"
            title="삭제"
          >
            <Trash size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function ResetPasswordModal({
  target, onClose, onDone, resetPassword,
}: {
  target: { id: string; name: string; email: string };
  onClose: () => void;
  onDone: (t: { type: 'success' | 'error' | 'info'; text: string }) => void;
  resetPassword: (userId: string, newPassword: string) => Promise<boolean>;
}) {
  const [password, setPassword] = useState(() => generateTempPassword(10));
  const [sendEmail, setSendEmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleSubmit = async () => {
    if (!password || submitting) return;
    setSubmitting(true);
    const ok = await resetPassword(target.id, password);
    if (!ok) {
      setSubmitting(false);
      onDone({ type: 'error', text: '비밀번호 재설정에 실패했습니다.' });
      return;
    }
    if (sendEmail) {
      const res = await sendCredentialsEmail({
        to: target.email, name: target.name, loginId: target.email, password, kind: 'reset',
      });
      if (res.ok) {
        onDone({ type: 'success', text: `${target.name}의 비밀번호를 재설정하고 ${target.email}로 메일을 발송했습니다.` });
      } else if (res.reason === 'smtp_not_configured') {
        onDone({ type: 'info', text: `비밀번호 재설정 완료. 메일 서버가 설정되지 않아 발송되지 않았습니다.` });
      } else {
        onDone({ type: 'error', text: `비밀번호 재설정 완료. 메일 발송 실패: ${res.error ?? ''}` });
      }
    } else {
      onDone({ type: 'success', text: `${target.name}의 비밀번호가 재설정되었습니다.` });
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold font-display text-ui-on-surface">비밀번호 재설정</h3>
            <p className="text-xs text-ui-variant mt-1">{target.name} · {target.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ui-low text-ui-variant cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <label className="block text-xs font-semibold text-ui-variant mb-1.5">새 비밀번호</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text" value={password}
            onChange={e => setPassword(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary font-mono"
          />
          <button
            type="button" onClick={() => setPassword(generateTempPassword(10))}
            className="btn-secondary text-xs whitespace-nowrap" title="재생성"
          >
            <ArrowClockwise size={14} />
          </button>
          <button
            type="button" onClick={handleCopy}
            className="btn-secondary text-xs whitespace-nowrap" title="복사"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-ui-on-surface cursor-pointer mb-5">
          <input
            type="checkbox" checked={sendEmail}
            onChange={e => setSendEmail(e.target.checked)}
            className="w-4 h-4 accent-brand-primary"
          />
          {target.email}로 새 비밀번호를 메일로 발송
        </label>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">취소</button>
          <button onClick={handleSubmit} disabled={submitting || !password} className="btn-primary disabled:opacity-50">
            {submitting ? '처리 중...' : '재설정'}
          </button>
        </div>
      </div>
    </div>
  );
}
