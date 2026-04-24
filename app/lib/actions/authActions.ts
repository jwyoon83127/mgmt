'use server';

import {
  listUsers, authenticate, createUser, resetUserPassword, deleteUser, ensureSeedUsers,
} from '@/lib/services/userService';
import { writeAudit, logPasswordReset } from '@/lib/services/auditService';
import type { PublicUser, UserRole } from '@/lib/types/auth';

let seeded = false;
async function ensureSeededOnce() {
  if (seeded) return;
  try { await ensureSeedUsers(); seeded = true; } catch (e) { console.error('seed error:', e); }
}

export async function fetchUsers(): Promise<PublicUser[]> {
  await ensureSeededOnce();
  return listUsers();
}

export async function loginAction(email: string, password: string): Promise<PublicUser | null> {
  await ensureSeededOnce();
  const user = await authenticate(email, password);
  if (user) {
    await writeAudit({ action: 'login_success', actorId: user.id, actorEmail: user.email });
  } else {
    await writeAudit({ action: 'login_failed', actorEmail: email, details: { reason: 'invalid_credentials' } });
  }
  return user;
}

export async function logoutAction(actor: { id: string; email: string } | null) {
  if (actor) await writeAudit({ action: 'logout', actorId: actor.id, actorEmail: actor.email });
}

export async function createUserAction(
  input: { email: string; name: string; password: string; role: UserRole },
  actor?: { id: string; email: string } | null,
) {
  const res = await createUser(input);
  if (res.ok) {
    await writeAudit({
      action: 'user_created',
      actorId: actor?.id ?? null, actorEmail: actor?.email ?? null,
      targetId: res.user.id, targetLabel: res.user.email,
      details: { name: res.user.name, role: res.user.role },
    });
  }
  return res;
}

export async function resetPasswordAction(
  userId: string, newPassword: string,
  actor?: { id: string; email: string } | null,
): Promise<boolean> {
  const ok = await resetUserPassword(userId, newPassword);
  if (ok) {
    const method = actor && actor.id === userId ? 'self' : 'admin';
    await logPasswordReset({ userId, resetBy: actor?.id ?? null, method });
    await writeAudit({
      action: 'password_reset',
      actorId: actor?.id ?? null, actorEmail: actor?.email ?? null,
      targetId: userId,
      details: { method },
    });
  }
  return ok;
}

export async function deleteUserAction(
  userId: string,
  actor?: { id: string; email: string } | null,
) {
  const target = (await listUsers()).find(u => u.id === userId);
  const res = await deleteUser(userId);
  if (res.ok) {
    await writeAudit({
      action: 'user_deleted',
      actorId: actor?.id ?? null, actorEmail: actor?.email ?? null,
      targetId: userId, targetLabel: target?.email ?? null,
      details: { name: target?.name },
    });
  }
  return res;
}

