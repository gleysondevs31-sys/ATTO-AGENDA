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
    if (!user?.passwordHash || !(await verifyPassword(payload.password, user.passwordHash))) return fail('Credenciais inválidas.', 401);
    await prisma.auditLog.create({ data: { companyId: user.companyId, actorId: user.id, action: 'auth.login', entity: 'User', entityId: user.id } });
    setSessionCookie(signSession({ userId: user.id, companyId: user.companyId, role: user.role, email: user.email, name: user.name }));
    return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, company: { id: user.company.id, name: user.company.name } });
  } catch (error) { return handleError(error); }
}
