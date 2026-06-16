import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError, ok } from '@/lib/api/responses';
import { forgotPasswordSchema } from '@/lib/validation/auth';

export async function POST(request: NextRequest) {
  try {
    const payload = forgotPasswordSchema.parse(await request.json());
    const user = await prisma.user.findFirst({ where: { email: payload.email.toLowerCase() } });
    if (user) await prisma.auditLog.create({ data: { companyId: user.companyId, actorId: user.id, action: 'auth.password_reset_requested', entity: 'User', entityId: user.id } });
    return ok({ message: 'Se este e-mail existir, enviaremos instruções de recuperação.' });
  } catch (error) { return handleError(error); }
}
