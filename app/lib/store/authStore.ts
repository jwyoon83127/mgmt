'use client';

import { create } from 'zustand';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // 실제 프로덕션에서는 해시된 비밀번호 필요
  role: UserRole;
  createdAt: Date;
}

export interface AuthState {
  currentUser: User | null;
  users: User[];

  // Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (email: string, name: string, password: string, role: UserRole) => boolean;
  updateUserRole: (userId: string, role: UserRole) => boolean;
  deleteUser: (userId: string) => boolean;
  isAdmin: () => boolean;
  isLoggedIn: () => boolean;
  initializeUsers: () => void;
}

// 초기 관리자 계정 (경영전략실장 이석진 - 관리자 겸 간사)
const INITIAL_ADMIN: User = {
  id: 'admin-001',
  email: 'seokjin@humuson.com',
  name: '이석진',
  password: 'humuson1234',
  role: 'admin',
  createdAt: new Date(),
};

// 초기 집행위원 (관리자가 사전 등록한 이용 가능 계정)
const INITIAL_EXECUTIVES: User[] = [
  { id: 'exec-001', email: 'junchang@humuson.com', name: '전순창 이사', password: 'humuson1234', role: 'user', createdAt: new Date() },
  { id: 'exec-002', email: 'heeyong@humuson.com', name: '원희용 이사', password: 'humuson1234', role: 'user', createdAt: new Date() },
  { id: 'exec-003', email: 'hyoseok@humuson.com', name: '차효석 리더', password: 'humuson1234', role: 'user', createdAt: new Date() },
  { id: 'exec-004', email: 'byungho@humuson.com', name: '김병호 리더', password: 'humuson1234', role: 'user', createdAt: new Date() },
];

const STORAGE_KEY = 'auth_users';
const CURRENT_USER_KEY = 'current_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: [],

  initializeUsers: () => {
    // localStorage에서 사용자 목록 로드
    const stored = localStorage.getItem(STORAGE_KEY);
    let users: User[] = stored ? JSON.parse(stored) : [INITIAL_ADMIN, ...INITIAL_EXECUTIVES];

    // 관리자(이석진)가 없으면 추가
    if (!users.some((u: User) => u.email === INITIAL_ADMIN.email)) {
      users = [INITIAL_ADMIN, ...users];
    }
    // 집행위원 누락분 보충
    for (const exec of INITIAL_EXECUTIVES) {
      if (!users.some((u: User) => u.email === exec.email)) {
        users.push(exec);
      }
    }

    set({ users });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },

  login: (email: string, password: string) => {
    const state = get();
    const user = state.users.find((u) => u.email === email && u.password === password);

    if (user) {
      set({ currentUser: user });
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    }

    return false;
  },

  logout: () => {
    set({ currentUser: null });
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  addUser: (email: string, name: string, password: string, role: UserRole) => {
    const state = get();

    // 중복 이메일 확인
    if (state.users.some((u) => u.email === email)) {
      console.error('이미 존재하는 이메일입니다.');
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      password,
      role,
      createdAt: new Date(),
    };

    const updatedUsers = [...state.users, newUser];
    set({ users: updatedUsers });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));

    return true;
  },

  updateUserRole: (userId: string, role: UserRole) => {
    const state = get();
    const updatedUsers = state.users.map((u) =>
      u.id === userId ? { ...u, role } : u
    );

    set({ users: updatedUsers });

    // 현재 사용자의 역할이 변경되었으면 업데이트
    if (state.currentUser?.id === userId) {
      const updatedCurrentUser = { ...state.currentUser, role };
      set({ currentUser: updatedCurrentUser });
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    return true;
  },

  deleteUser: (userId: string) => {
    const state = get();

    // 현재 로그인한 사용자는 삭제 불가
    if (state.currentUser?.id === userId) {
      console.error('현재 로그인한 사용자는 삭제할 수 없습니다.');
      return false;
    }

    // 마지막 관리자는 삭제 불가
    const adminCount = state.users.filter((u) => u.role === 'admin').length;
    const userToDelete = state.users.find((u) => u.id === userId);
    if (userToDelete?.role === 'admin' && adminCount === 1) {
      console.error('마지막 관리자는 삭제할 수 없습니다.');
      return false;
    }

    const updatedUsers = state.users.filter((u) => u.id !== userId);
    set({ users: updatedUsers });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));

    return true;
  },

  isAdmin: () => {
    return get().currentUser?.role === 'admin';
  },

  isLoggedIn: () => {
    return get().currentUser !== null;
  },
}));

// 로컬스토리지에서 로그인 상태 복원
export function restoreAuthState() {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (stored) {
    try {
      const user = JSON.parse(stored);
      // 사용자 정보가 유효한지 확인하려면 users 목록에서 찾기
      const allUsersStored = localStorage.getItem(STORAGE_KEY);
      const users = allUsersStored ? JSON.parse(allUsersStored) : [];

      const validUser = users.find((u: User) => u.id === user.id);
      if (validUser) {
        useAuthStore.setState({ currentUser: validUser, users });
        return;
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error);
    }
  }

  // Initialize users if not already done
  useAuthStore.getState().initializeUsers();
}
