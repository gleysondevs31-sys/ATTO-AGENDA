import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { cancelAppointment, updateAppointment } from '@/lib/appointments';
import { handleError, ok } from '@/lib/api/responses';
import { assertAppointmentScope, requireCompanyId } from '@/lib/tenant';
import { updateAppointmentSchema } from '@/lib/validation/appointment';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await requireCompanyId(request);
    const appointment = await prisma.appointment.findFirst({ where: { id: params.id, companyId }, include: { client: true, bookingLink: true, user: true } });
    if (!appointment) throw new Error('Agendamento não encontrado para esta empresa.');
    return ok(appointment);
  } catch (error) { return handleError(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await requireCompanyId(request);
    const payload = updateAppointmentSchema.parse(await request.json());
    const appointment = await updateAppointment(params.id, companyId, payload);
    return ok(appointment);
  } catch (error) { return handleError(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await requireCompanyId(request);
    await assertAppointmentScope(params.id, companyId);
    return ok(await cancelAppointment(params.id, companyId));
  } catch (error) { return handleError(error); }
}
