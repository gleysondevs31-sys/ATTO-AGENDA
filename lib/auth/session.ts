import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@/lib/auth/permissions';
import { listUsers } from '@/lib/storage';
import { can, type Action } from '@/lib/auth/permissions';

const cookieName = 'atto_session';
const defaultSecret = 'dev-only-change-me';

export type SessionUser = { userId: string; companyId: string; role: UserRole; email: string; name: string };

function secret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? defaultSecret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(user: SessionUser) {
  return jwt.sign(user, secret(), { expiresIn: '7d' });
}

export function verifySessionToken(token?: string) {
  if (!token) return null;
  try {
    return jwt.verify(token, secret()) as SessionUser;
  } catch {
    return null;
  }
}

export function setSessionCookie(token: string) {
  cookies().set(cookieName, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
}

export function clearSessionCookie() {
  cookies().delete(cookieName);
}

export function getSessionFromCookies() {
  return verifySessionToken(cookies().get(cookieName)?.value);
}

export function getSessionFromRequest(request: NextRequest) {
  return verifySessionToken(request.cookies.get(cookieName)?.value);
}

export async function requireSession(request: NextRequest, action?: Action) {
  const session = getSessionFromRequest(request);
  if (!session) throw new Error('Não autenticado.');
  const user = (await listUsers(session.companyId)).find((item) => item.id === session.userId);
  if (!user) throw new Error('Sessão inválida.');
  if (action && !can(user.role, action)) throw new Error('Permissão insuficiente.');
  return { userId: user.id, companyId: user.companyId, role: user.role, email: user.email, name: user.name } satisfies SessionUser;
}
