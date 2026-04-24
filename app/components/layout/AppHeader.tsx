'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, isAdmin } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const userInitial = currentUser?.name.charAt(0) || 'U';

  const navItems = [
    { href: '/', label: '대시보드' },
    { href: '/meetings', label: '회의 관리' },
    ...(isAdmin() ? [
      { href: '/admin/users', label: '계정 관리' },
      { href: '/admin/logs', label: '감사 로그' },
    ] : []),
  ];

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="glass-header no-print">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2a676c, #1b5b60)' }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 21V8l9-6 9 6v13" />
                <path d="M9 21v-6h6v6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold font-display text-ui-on-surface leading-tight">경영집행위원회</p>
              <p className="text-[10px] text-ui-variant leading-tight">Executive Committee</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
                  isActive(item.href)
                    ? 'bg-brand-container/50 text-brand-primary'
                    : 'text-ui-on-surface hover:bg-ui-low'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-ui-low transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #2a676c, #1b5b60)' }}>
                {userInitial}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-ui-on-surface">{currentUser?.name}</p>
                <p className="text-[10px] text-ui-variant">
                  {isAdmin() ? '관리자·간사' : '집행위원'}
                </p>
              </div>
              <svg className={`w-4 h-4 text-ui-variant transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-ui-high/40 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-ui-high/40">
                  <p className="text-xs text-ui-variant">로그인 계정</p>
                  <p className="text-sm font-semibold text-ui-on-surface">{currentUser?.email}</p>
                </div>

                {isAdmin() && (
                  <button
                    onClick={() => { router.push('/admin/users'); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-ui-on-surface hover:bg-ui-low transition-colors flex items-center gap-2 border-b border-ui-high/40 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                    </svg>
                    계정 관리
                  </button>
                )}

                <button
                  onClick={() => { handleLogout(); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-[#ba1a1a] hover:bg-[#ba1a1a]/5 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 3l3 3m0 0l-3 3m3-3H9m7 11v-4"></path>
                  </svg>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
