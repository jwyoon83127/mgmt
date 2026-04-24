'use client';

import { create } from 'zustand';
import {
  fetchUsers, loginAction, createUserAction, resetPasswordAction, deleteUserAction, logoutAction,
} from '@/lib/actions/authActions';
import type { PublicUser, UserRole } from '@/lib/types/auth';

export type { UserRole };
export type User = PublicUser;

export interface AuthState {
  currentUser: User | null;
  users: User[];
  loading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (email: string, name: string, password: string, role: UserRole) =>
    Promise<{ ok: true; user: User } | { ok: false; error: 'duplicate' | 'invalid' | 'internal' }>;
  resetPassword: (userId: string, newPassword: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  isAdmin: () => boolean;
  isLoggedIn: () => boolean;
  refreshUsers: () => Promise<void>;
  initialize: () => Promise<void>;
}

const CURRENT_USER_KEY = 'current_user';

function safeGetCurrent(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) as User : null;
  } catch { return null; }
}

function safeSetCurrent(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_USER_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: [],
  loading: false,

  initialize: async () => {
    set({ loading: true });
    const restored = safeGetCurrent();
    const users = await fetchUsers();
    const stillValid = restored && users.some(u => u.id === restored.id) ? restored : null;
    if (restored && !stillValid) safeSetCurrent(null);
    set({ users, currentUser: stillValid, loading: false });
  },

  refreshUsers: async () => {
    const users = await fetchUsers();
    set({ users });
  },

  login: async (email, password) => {
    const user = await loginAction(email, password);
    if (!user) return false;
    safeSetCurrent(user);
    set({ currentUser: user });
    return true;
  },

  logout: () => {
    const actor = get().currentUser;
    if (actor) void logoutAction({ id: actor.id, email: actor.email });
    safeSetCurrent(null);
    set({ currentUser: null });
  },

  addUser: async (email, name, password, role) => {
    const actor = get().currentUser;
    const res = await createUserAction({ email, name, password, role }, actor ? { id: actor.id, email: actor.email } : null);
    if (res.ok) await get().refreshUsers();
    return res;
  },

  resetPassword: async (userId, newPassword) => {
    const actor = get().currentUser;
    const ok = await resetPasswordAction(userId, newPassword, actor ? { id: actor.id, email: actor.email } : null);
    if (ok) await get().refreshUsers();
    return ok;
  },

  deleteUser: async (userId) => {
    if (get().currentUser?.id === userId) {
      console.error('현재 로그인한 사용자는 삭제할 수 없습니다.');
      return false;
    }
    const actor = get().currentUser;
    const res = await deleteUserAction(userId, actor ? { id: actor.id, email: actor.email } : null);
    if (res.ok) await get().refreshUsers();
    return res.ok;
  },

  isAdmin: () => get().currentUser?.role === 'admin',
  isLoggedIn: () => get().currentUser !== null,
}));
