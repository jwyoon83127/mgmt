'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        router.push('/');
      } else {
        setError('이메일 또는 비밀번호가 잘못되었습니다.');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-dim to-brand-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v20M2 12h20M6 6l12 12M18 6L6 18" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">경영집행위원회</h1>
          <p className="text-sm text-white/70">회의 관리 플랫폼</p>
        </div>

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} autoComplete="off" className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-ui-on-surface mb-1">로그인</h2>
            <p className="text-sm text-ui-variant">계정으로 로그인하세요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/30 flex items-start gap-3">
              <svg className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <p className="text-sm text-[#ba1a1a] font-medium">{error}</p>
            </div>
          )}

          {/* 아이디 입력 */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-ui-on-surface mb-2">
              아이디
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl border border-ui-high/40 text-ui-on-surface placeholder-ui-variant focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
              required
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-ui-on-surface mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-ui-high/40 text-ui-on-surface placeholder-ui-variant focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-ui-variant hover:text-ui-on-surface transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:cursor-default transition-all duration-200 bg-brand-primary text-white hover:bg-brand-dim disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                로그인 중...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3H9a6 6 0 0 0-6 6v12a6 6 0 0 0 6 6h6a6 6 0 0 0 6-6V9a6 6 0 0 0-6-6Z" />
                  <path d="M12 16v-4m0 0V8" />
                </svg>
                로그인
              </>
            )}
          </button>

          {/* 계정 안내 */}
          <div className="pt-4 border-t border-ui-high/40">
            <p className="text-xs text-ui-variant mb-3 font-medium">📝 관리자 계정</p>
            <div className="space-y-2 text-xs text-ui-variant">
              <p><span className="font-semibold text-ui-on-surface">아이디:</span> admin</p>
              <p><span className="font-semibold text-ui-on-surface">비밀번호:</span> 1234</p>
            </div>
          </div>
        </form>

        {/* 하단 텍스트 */}
        <p className="text-center text-sm text-white/70 mt-8">
          시스템 관리자에게 문의하세요 / 📧 support@company.com
        </p>
      </div>
    </div>
  );
}
