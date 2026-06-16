import { NextRequest } from 'next/server';
import { createAppointment } from '@/lib/appointments';
import { fail, handleError, ok } from '@/lib/api/responses';
import { rateLimit } from '@/lib/security/rate-limit';
import { createAppointmentSchema } from '@/lib/validation/appointment';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const limited = rateLimit(`public-appointment:${ip}`, 6, 60_000);
    if (!limited.ok) return fail('Muitas tentativas. Tente novamente em instantes.', 429);
    const payload = createAppointmentSchema.parse(await request.json());
    const appointment = await createAppointment(payload);
    return ok({ id: appointment.id, protocol: appointment.protocol, status: appointment.status, startsAt: appointment.startsAt, endsAt: appointment.endsAt }, { status: 201 });
  } catch (error) { return handleError(error); }
}
