import { NextRequest } from 'next/server';
import { handleError, ok } from '@/lib/api/responses';
import { forgotPasswordSchema } from '@/lib/validation/auth';
import { createAuditLog, findUserByEmail } from '@/lib/storage';
export async function POST(request: NextRequest) { try { const payload=forgotPasswordSchema.parse(await request.json()); const user=await findUserByEmail(payload.email.toLowerCase()); if(user) await createAuditLog({companyId:user.companyId,userId:user.id,entityType:'User',entityId:user.id,action:'auth.password_reset_requested'}); return ok({message:'Se este e-mail existir, enviaremos instruções de recuperação.'}); } catch(error){ return handleError(error); } }
