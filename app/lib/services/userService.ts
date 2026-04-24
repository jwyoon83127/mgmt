import 'server-only';
import bcrypt from 'bcrypt';
import pool from '../db';

import type { PublicUser, UserRole } from '../types/auth';

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
};

const BCRYPT_ROUNDS = 10;

function toPublic(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

export async function listUsers(): Promise<PublicUser[]> {
  const { rows } = await pool.query<UserRow>(
    'SELECT id, email, name, password_hash, role, created_at FROM users WHERE deleted_at IS NULL ORDER BY role DESC, created_at ASC'
  );
  return rows.map(toPublic);
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    'SELECT id, email, name, password_hash, role, created_at FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1',
    [email]
  );
  return rows[0] ?? null;
}

export async function authenticate(email: string, password: string): Promise<PublicUser | null> {
  const row = await findUserByEmail(email);
  if (!row) return null;
  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) return null;
  return toPublic(row);
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}): Promise<{ ok: true; user: PublicUser } | { ok: false; error: 'duplicate' | 'invalid' | 'internal' }> {
  if (!input.email || !input.name || !input.password) return { ok: false, error: 'invalid' };
  const existing = await findUserByEmail(input.email);
  if (existing) return { ok: false, error: 'duplicate' };
  const hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    await pool.query(
      'INSERT INTO users (id, email, name, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      [id, input.email, input.name, hash, input.role]
    );
    const row = await findUserByEmail(input.email);
    if (!row) return { ok: false, error: 'internal' };
    return { ok: true, user: toPublic(row) };
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === '23505') return { ok: false, error: 'duplicate' };
    console.error('createUser error:', e);
    return { ok: false, error: 'internal' };
  }
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<boolean> {
  if (!newPassword) return false;
  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  const { rowCount } = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2 AND deleted_at IS NULL',
    [hash, userId]
  );
  return (rowCount ?? 0) > 0;
}

export async function deleteUser(userId: string): Promise<{ ok: true } | { ok: false; error: 'not_found' | 'last_admin' }> {
  const { rows } = await pool.query<UserRow>(
    'SELECT id, email, name, password_hash, role, created_at FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1',
    [userId]
  );
  const target = rows[0];
  if (!target) return { ok: false, error: 'not_found' };
  if (target.role === 'admin') {
    const { rows: countRows } = await pool.query<{ cnt: string }>(
      "SELECT COUNT(*) as cnt FROM users WHERE role = 'admin' AND deleted_at IS NULL"
    );
    if (parseInt(countRows[0]?.cnt ?? '0') <= 1) return { ok: false, error: 'last_admin' };
  }
  await pool.query('UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
  return { ok: true };
}

export async function ensureSeedUsers(): Promise<void> {
  const seedDefs: { id: string; email: string; name: string; role: UserRole; password: string }[] = [
    { id: 'admin-001', email: 'admin',                name: '관리자',     role: 'admin', password: '1234' },
    { id: 'exec-001',  email: 'junchang@humuson.com', name: '전순창 이사', role: 'user',  password: 'humuson1234' },
    { id: 'exec-002',  email: 'heeyong@humuson.com',  name: '원희용 이사', role: 'user',  password: 'humuson1234' },
    { id: 'exec-003',  email: 'hyoseok@humuson.com',  name: '차효석 리더', role: 'user',  password: 'humuson1234' },
    { id: 'exec-004',  email: 'byungho@humuson.com',  name: '김병호 리더', role: 'user',  password: 'humuson1234' },
  ];
  for (const s of seedDefs) {
    const { rows } = await pool.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [s.email]
    );
    if (rows.length > 0) continue;
    const hash = await bcrypt.hash(s.password, BCRYPT_ROUNDS);
    await pool.query(
      'INSERT INTO users (id, email, name, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      [s.id, s.email, s.name, hash, s.role]
    );
  }
}
