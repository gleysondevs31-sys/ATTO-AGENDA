import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError, ok, fail } from '@/lib/api/responses';
import { setSessionCookie, signSession, verifyPassword } from '@/lib/auth/session';
import { rateLimit } from '@/lib/security/rate-limit';
import { loginSchema } from '@/lib/validation/auth';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!rateLimit(`login:${ip}`, 5, 60_000).ok) return fail('Muitas tentativas. Tente novamente em instantes.', 429);
    const payload = loginSchema.parse(await request.json());
    const user = await prisma.user.findFirst({ where: { email: payload.email.toLowerCase() }, include: { company: true } });
    if (!user) return fail('Credenciais inválidas.', 401);
    const userWithPassword = user as typeof user & { passwordHash?: string | null };
    if (!userWithPassword.passwordHash || !(await verifyPassword(payload.password, userWithPassword.passwordHash))) return fail('Credenciais inválidas.', 401);
    await prisma.auditLog.create({ data: { companyId: userWithPassword.companyId, actorId: userWithPassword.id, action: 'auth.login', entity: 'User', entityId: userWithPassword.id } });
    setSessionCookie(signSession({ userId: userWithPassword.id, companyId: userWithPassword.companyId, role: userWithPassword.role, email: userWithPassword.email, name: userWithPassword.name }));
    return ok({ user: { id: userWithPassword.id, name: userWithPassword.name, email: userWithPassword.email, role: userWithPassword.role }, company: { id: userWithPassword.company.id, name: userWithPassword.company.name } });
  } catch (error) { return handleError(error); }
}
