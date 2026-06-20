import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from '@/lib/auth/permissions';
import { can, type Action } from '@/lib/auth/permissions';
import { listUsers } from '@/lib/storage';

const cookieName = 'atto_session';
const defaultSecret = 'dev-only-change-me';
const encoder = new TextEncoder();

export type SessionUser = { userId: string; companyId: string; role: UserRole; email: string; name: string };

function secretKey() {
  return encoder.encode(process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? defaultSecret);
}

function isSessionUser(payload: Record<string, unknown>): payload is SessionUser {
  return typeof payload.userId === 'string' && typeof payload.companyId === 'string' && typeof payload.email === 'string' && typeof payload.name === 'string' && typeof payload.role === 'string';
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signSession(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey());
}

export async function verifySessionToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return isSessionUser(payload) ? payload : null;
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

export async function getSessionFromCookies() {
  return verifySessionToken(cookies().get(cookieName)?.value);
}

export async function getSessionFromRequest(request: NextRequest) {
  return verifySessionToken(request.cookies.get(cookieName)?.value);
}

export async function requireSession(request: NextRequest, action?: Action) {
  const session = await getSessionFromRequest(request);
  if (!session) throw new Error('Não autenticado.');
  const user = (await listUsers(session.companyId)).find((item) => item.id === session.userId);
  if (!user) throw new Error('Sessão inválida.');
  if (action && !can(user.role, action)) throw new Error('Permissão insuficiente.');
  return { userId: user.id, companyId: user.companyId, role: user.role, email: user.email, name: user.name } satisfies SessionUser;
}
