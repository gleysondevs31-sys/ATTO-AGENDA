import { NextRequest } from 'next/server';
import { createAppointment } from '@/lib/appointments';
import { handleError, ok } from '@/lib/api/responses';
import { requireSession } from '@/lib/auth/session';
import { createAppointmentSchema } from '@/lib/validation/appointment';
import { listAppointments } from '@/lib/storage';
export async function GET(request: NextRequest) { try { const { companyId } = await requireSession(request, 'manage_appointments'); return ok(await listAppointments(companyId)); } catch(error){ return handleError(error); } }
export async function POST(request: NextRequest) { try { const { companyId } = await requireSession(request, 'manage_appointments'); const payload=createAppointmentSchema.parse(await request.json()); return ok(await createAppointment(payload, companyId),{status:201}); } catch(error){ return handleError(error); } }
