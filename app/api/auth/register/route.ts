import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError, ok } from '@/lib/api/responses';
import { hashPassword, setSessionCookie, signSession } from '@/lib/auth/session';
import { registerSchema } from '@/lib/validation/auth';
import { cleanText } from '@/lib/security/sanitize';

function slugify(value: string) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80); }

export async function POST(request: NextRequest) {
  try {
    const payload = registerSchema.parse(await request.json());
    const passwordHash = await hashPassword(payload.password);
    const company = await prisma.company.create({ data: { name: cleanText(payload.companyName, 120), slug: `${slugify(payload.companyName)}-${Date.now().toString(36)}` } });
    const user = await prisma.user.create({ data: { companyId: company.id, name: cleanText(payload.name, 120), email: payload.email.toLowerCase(), passwordHash, role: 'owner' } });
    await prisma.auditLog.create({ data: { companyId: company.id, actorId: user.id, action: 'auth.registered', entity: 'User', entityId: user.id } });
    setSessionCookie(signSession({ userId: user.id, companyId: company.id, role: user.role, email: user.email, name: user.name }));
    return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, company }, { status: 201 });
  } catch (error) { return handleError(error); }
}
