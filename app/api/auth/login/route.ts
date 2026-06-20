import { NextRequest } from 'next/server';
import { handleError, ok, fail } from '@/lib/api/responses';
import { setSessionCookie, signSession, verifyPassword } from '@/lib/auth/session';
import { rateLimit } from '@/lib/security/rate-limit';
import { loginSchema } from '@/lib/validation/auth';
import { findUserByEmail } from '@/lib/storage';
export async function POST(request: NextRequest) { try { const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'unknown'; if(!rateLimit(`login:${ip}`,5,60000).ok) return fail('Muitas tentativas. Tente novamente em instantes.',429); const payload=loginSchema.parse(await request.json()); const user=await findUserByEmail(payload.email.toLowerCase()); if(!user?.passwordHash || !(await verifyPassword(payload.password,user.passwordHash))) return fail('Credenciais inválidas.',401); setSessionCookie(await signSession({userId:user.id,companyId:user.companyId,role:user.role,email:user.email,name:user.name})); return ok({user:{id:user.id,name:user.name,email:user.email,role:user.role},company:{id:user.companyId,name:user.companyId}}); } catch(error){ return handleError(error); } }
