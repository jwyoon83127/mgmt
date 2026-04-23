'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';

export default function AdminModal() {
  const { adminModalOpen, closeAdminModal } = useUIStore();
  const { users, currentUser, addUser, deleteUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'users' | 'add'>('users');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.name || !formData.email || !formData.password) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }

    // 집행위원은 관리자 권한 없이 등록만 허용
    const success = addUser(formData.email, formData.name, formData.password, 'user');

    if (success) {
      setMessage({ type: 'success', text: `${formData.name} 집행위원이 추가되었습니다.` });
      setFormData({ name: '', email: '', password: '' });
      setActiveTab('users');
    } else {
      setMessage({ type: 'error', text: '집행위원 추가에 실패했습니다. 이메일을 확인해주세요.' });
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (confirm(`${user.name} 사용자를 삭제하시겠습니까?`)) {
      const success = deleteUser(userId);
      if (success) {
        setMessage({ type: 'success', text: `${user.name} 사용자가 삭제되었습니다.` });
      } else {
        setMessage({ type: 'error', text: '사용자를 삭제할 수 없습니다.' });
      }
    }
  };

  if (!adminModalOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeAdminModal}
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-2xl bg-white rounded-3xl shadow-lg pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="px-8 py-6 border-b border-ui-high/40 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold font-display text-ui-on-surface">관리자 패널</h1>
              <button
                onClick={closeAdminModal}
                className="text-ui-variant hover:text-ui-on-surface transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-ui-variant">집행위원 계정을 등록하고 관리합니다. 관리자(간사)만 등록 가능합니다.</p>
          </div>

          {/* 탭 */}
          <div className="px-8 py-4 border-b border-ui-high/40 shrink-0 flex gap-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2 px-1 text-sm font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-ui-variant hover:text-ui-on-surface'
              }`}
            >
              집행위원 관리 ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`pb-2 px-1 text-sm font-semibold transition-colors ${
                activeTab === 'add'
                  ? 'text-brand-primary border-b-2 border-brand-primary'
                  : 'text-ui-variant hover:text-ui-on-surface'
              }`}
            >
              집행위원 추가
            </button>
          </div>

          {/* 컨텐츠 */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {message && (
              <div
                className={`mb-4 p-4 rounded-xl border flex items-start gap-3 ${
                  message.type === 'success'
                    ? 'bg-[#9df197]/10 border-[#9df197]/30'
                    : 'bg-[#ba1a1a]/10 border-[#ba1a1a]/30'
                }`}
              >
                <svg
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    message.type === 'success' ? 'text-[#005c15]' : 'text-[#ba1a1a]'
                  }`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  {message.type === 'success' ? (
                    <path d="M10 15.586L6.707 12.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l10-10a1 1 0 00-1.414-1.414L10 15.586z" />
                  ) : (
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  )}
                </svg>
                <p className={`text-sm font-medium ${message.type === 'success' ? 'text-[#005c15]' : 'text-[#ba1a1a]'}`}>
                  {message.text}
                </p>
              </div>
            )}

            {activeTab === 'users' ? (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 rounded-xl border border-ui-high/40 flex items-center justify-between"
                    style={{ background: '#f8f9fa' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-sm font-semibold text-ui-on-surface">{user.name}</p>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            user.role === 'admin'
                              ? 'bg-brand-primary text-white'
                              : 'bg-ui-low text-ui-on-surface'
                          }`}
                        >
                          {user.role === 'admin' ? '관리자·간사' : '집행위원'}
                        </span>
                        {user.id === currentUser?.id && (
                          <span className="text-xs px-2 py-0.5 rounded bg-brand-container/50 text-brand-primary font-semibold">
                            (현재 로그인)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ui-variant">{user.email}</p>
                    </div>

                    {/* 액션 버튼: 관리자(간사) 계정은 삭제 불가 */}
                    {user.id !== currentUser?.id && user.role !== 'admin' && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleAddUser} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-semibold text-ui-on-surface mb-2">이름</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-4 py-2.5 rounded-lg border border-ui-high/40 text-ui-on-surface placeholder-ui-variant focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ui-on-surface mb-2">이메일 주소</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-ui-high/40 text-ui-on-surface placeholder-ui-variant focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ui-on-surface mb-2">비밀번호</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg border border-ui-high/40 text-ui-on-surface placeholder-ui-variant focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="p-3 rounded-lg bg-brand-container/20 text-xs text-ui-variant">
                  신규 계정은 <strong className="text-brand-primary">집행위원 권한</strong>으로 등록됩니다. 관리자(간사)는 경영전략실장 1인으로 고정됩니다.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-brand-primary text-white hover:bg-brand-dim transition-colors cursor-pointer"
                >
                  집행위원 추가
                </button>
              </form>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="px-8 py-6 border-t border-ui-high/40 shrink-0">
            <button
              onClick={closeAdminModal}
              className="w-full py-2.5 rounded-xl text-sm font-semibold bg-ui-low text-ui-on-surface hover:bg-ui-low/80 transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
