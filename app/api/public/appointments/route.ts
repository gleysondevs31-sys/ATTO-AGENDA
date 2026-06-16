import { NextRequest } from 'next/server';
import { createAppointment } from '@/lib/appointments';
import { fail, handleError, ok } from '@/lib/api/responses';
import { rateLimit } from '@/lib/security/rate-limit';
import { createAppointmentSchema } from '@/lib/validation/appointment';
import { confirmationMessage } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const limited = rateLimit(`public-appointment:${ip}`, 6, 60_000);
    if (!limited.ok) return fail('Muitas tentativas. Tente novamente em instantes.', 429);
    const payload = createAppointmentSchema.parse(await request.json());
    const appointment = await createAppointment(payload);
    const companyName = appointment.bookingLink.name;
    const message = confirmationMessage({ company: companyName, date: appointment.startsAt, address: appointment.bookingLink.address, protocol: appointment.protocol });
    return ok({ id: appointment.id, protocol: appointment.protocol, status: appointment.status, data: appointment.startsAt.toISOString().slice(0, 10), horario: appointment.startsAt.toISOString().slice(11, 16), endereco: appointment.bookingLink.address, empresa: companyName, consultor: null, mensagem: message, startsAt: appointment.startsAt, endsAt: appointment.endsAt }, { status: 201 });
  } catch (error) { return handleError(error); }
}
