'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, restoreAuthState } from '@/lib/store/authStore';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, initializeUsers } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 사용자 목록 초기화
    initializeUsers();

    // 저장된 로그인 정보 복원
    restoreAuthState();

    setIsInitialized(true);
  }, [initializeUsers]);

  useEffect(() => {
    if (!isInitialized) return;

    // 로그인 페이지는 누구나 접근 가능
    if (pathname === '/login') return;

    // 다른 페이지는 로그인 필수
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, pathname, isInitialized, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl animate-spin-slow mx-auto mb-4"
            style={{ borderTop: '3px solid #2a676c', borderRight: '3px solid #e0e4e8', borderBottom: '3px solid #e0e4e8', borderLeft: '3px solid #2a676c' }} />
          <p className="text-sm text-ui-variant">로딩 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
