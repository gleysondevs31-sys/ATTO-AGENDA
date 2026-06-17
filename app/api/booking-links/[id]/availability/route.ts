import { NextRequest } from 'next/server';
import { handleError, ok } from '@/lib/api/responses';
import { requireSession } from '@/lib/auth/session';
import { assertBookingLinkScope } from '@/lib/tenant';
import { saveAvailabilitySchema } from '@/lib/validation/availability';
import { createAuditLog, listAvailabilityExceptions, listAvailabilityRules } from '@/lib/storage';
export async function GET(request: NextRequest,{params}:{params:{id:string}}){try{const {companyId}=await requireSession(request,'manage_links'); await assertBookingLinkScope(params.id,companyId); return ok({rules:await listAvailabilityRules(params.id),exceptions:await listAvailabilityExceptions(params.id)});}catch(error){return handleError(error)}}
export async function POST(request: NextRequest,{params}:{params:{id:string}}){try{const {companyId,userId}=await requireSession(request,'manage_links'); await assertBookingLinkScope(params.id,companyId); saveAvailabilitySchema.parse(await request.json()); await createAuditLog({companyId,userId,entityType:'BookingLink',entityId:params.id,action:'availability.updated'}); return ok({success:true,message:'No modo JSON/Sheets, edite data/availability-rules.json localmente ou alimente a planilha.'});}catch(error){return handleError(error)}}
