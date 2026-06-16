import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { createAppointment } from '@/lib/appointments';
import { handleError, ok } from '@/lib/api/responses';
import { requireSession } from '@/lib/auth/session';
import { createAppointmentSchema } from '@/lib/validation/appointment';

export async function GET(request: NextRequest) {
  try {
    const { companyId } = await requireSession(request, 'manage_appointments');
    const appointments = await prisma.appointment.findMany({ where: { companyId }, include: { client: true, bookingLink: true, user: true }, orderBy: { startsAt: 'desc' } });
    return ok(appointments);
  } catch (error) { return handleError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await requireSession(request, 'manage_appointments');
    const payload = createAppointmentSchema.parse(await request.json());
    const appointment = await createAppointment(payload, companyId);
    return ok(appointment, { status: 201 });
  } catch (error) { return handleError(error); }
}
