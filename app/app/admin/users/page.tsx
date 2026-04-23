'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import { useAuthStore } from '@/lib/store/authStore';
import { UserPlus, Trash, ShieldCheck, EnvelopeSimple } from '@phosphor-icons/react';

export default function AdminUsersPage() {
  const router = useRouter();
  const { users, currentUser, addUser, deleteUser, isAdmin } = useAuthStore();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (!isAdmin()) {
    return (
      <>
        <AppHeader />
        <main className="min-h-screen bg-ui-surface py-12">
          <div className="max-w-xl mx-auto px-6 text-center layer-card p-12">
            <h1 className="text-xl font-bold text-ui-on-surface mb-2">접근 권한이 없습니다</h1>
            <p className="text-sm text-ui-variant mb-6">계정 관리는 관리자(간사)만 가능합니다.</p>
            <button onClick={() => router.push('/')} className="btn-secondary">대시보드로</button>
          </div>
        </main>
      </>
    );
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!form.name || !form.email || !form.password) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }
    const ok = addUser(form.email, form.name, form.password, 'user');
    if (ok) {
      setMessage({ type: 'success', text: `${form.name} 집행위원이 등록되었습니다.` });
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
    } else {
      setMessage({ type: 'error', text: '이미 존재하는 이메일입니다.' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`${name} 집행위원을 삭제하시겠습니까?`)) return;
    const ok = deleteUser(id);
    if (ok) {
      setMessage({ type: 'success', text: `${name} 집행위원이 삭제되었습니다.` });
      setTimeout(() => setMessage(null), 3000);
    }
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
              <p className="text-sm text-ui-variant">관리자(간사) 및 집행위원 계정을 관리합니다. 집행위원은 관리자가 사전 등록한 인원만 이용 가능합니다.</p>
            </div>
            <button onClick={() => setShowForm(v => !v)} className="btn-primary">
              <UserPlus size={16} weight="bold" />
              {showForm ? '폼 닫기' : '집행위원 추가'}
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
              message.type === 'success'
                ? 'bg-[#9df197]/10 border-[#9df197]/30 text-[#005c15]'
                : 'bg-[#ba1a1a]/10 border-[#ba1a1a]/30 text-[#ba1a1a]'
            }`}>
              {message.text}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleAdd} className="layer-card p-6 mb-6 grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3">
              <input
                type="text" placeholder="이름 (예: 홍길동 이사)"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary"
              />
              <input
                type="email" placeholder="이메일"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary"
              />
              <input
                type="password" placeholder="임시 비밀번호"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-ui-high/40 text-sm outline-none focus:border-brand-primary"
              />
              <button type="submit" className="btn-primary">등록</button>
            </form>
          )}

          {/* 관리자 섹션 */}
          <section className="mb-8">
            <h2 className="text-sm font-bold text-ui-variant uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck size={16} /> 관리자 · 간사 ({admins.length}명)
            </h2>
            <div className="space-y-2">
              {admins.map(u => (
                <UserRow key={u.id} name={u.name} email={u.email} badge="관리자·간사" isMe={u.id === currentUser?.id} />
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
                    key={u.id}
                    name={u.name}
                    email={u.email}
                    badge="집행위원"
                    isMe={u.id === currentUser?.id}
                    onDelete={() => handleDelete(u.id, u.name)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function UserRow({ name, email, badge, isMe, onDelete }: { name: string; email: string; badge: string; isMe: boolean; onDelete?: () => void }) {
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
      {onDelete && !isMe && (
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors cursor-pointer shrink-0"
          title="삭제"
        >
          <Trash size={16} />
        </button>
      )}
    </div>
  );
}
