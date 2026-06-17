import { NextRequest } from 'next/server';
import { handleError, ok } from '@/lib/api/responses';
import { hashPassword, setSessionCookie, signSession } from '@/lib/auth/session';
import { registerSchema } from '@/lib/validation/auth';
import { cleanText } from '@/lib/security/sanitize';
import { createAuditLog, createCompany, createUser } from '@/lib/storage';
function slugify(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,80)}
export async function POST(request: NextRequest){try{const payload=registerSchema.parse(await request.json()); const company=await createCompany({name:cleanText(payload.companyName,120),slug:`${slugify(payload.companyName)}-${Date.now().toString(36)}`}); const user=await createUser({companyId:company.id,name:cleanText(payload.name,120),email:payload.email.toLowerCase(),passwordHash:await hashPassword(payload.password),role:'owner'}); await createAuditLog({companyId:company.id,userId:user.id,entityType:'User',entityId:user.id,action:'auth.registered'}); setSessionCookie(signSession({userId:user.id,companyId:company.id,role:user.role,email:user.email,name:user.name})); return ok({user:{id:user.id,name:user.name,email:user.email,role:user.role},company},{status:201});}catch(error){return handleError(error)}}
