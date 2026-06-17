import { NextRequest } from 'next/server';
import { cancelAppointment, updateAppointment } from '@/lib/appointments';
import { handleError, ok } from '@/lib/api/responses';
import { assertAppointmentScope } from '@/lib/tenant';
import { requireSession } from '@/lib/auth/session';
import { updateAppointmentSchema } from '@/lib/validation/appointment';
export async function GET(request: NextRequest,{params}:{params:{id:string}}){try{const {companyId}=await requireSession(request,'manage_appointments'); return ok(await assertAppointmentScope(params.id,companyId));}catch(error){return handleError(error)}}
export async function PATCH(request: NextRequest,{params}:{params:{id:string}}){try{const {companyId}=await requireSession(request,'manage_appointments'); const payload=updateAppointmentSchema.parse(await request.json()); return ok(await updateAppointment(params.id,companyId,payload));}catch(error){return handleError(error)}}
export async function DELETE(request: NextRequest,{params}:{params:{id:string}}){try{const {companyId}=await requireSession(request,'manage_appointments'); await assertAppointmentScope(params.id,companyId); return ok(await cancelAppointment(params.id,companyId));}catch(error){return handleError(error)}}
