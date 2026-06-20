import { NextRequest } from 'next/server';
import { fail, handleError, ok } from '@/lib/api/responses';
import { getAvailableSlots } from '@/lib/availability';
import { rateLimit } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!rateLimit(`public-slots:${ip}`, 30, 60_000).ok) return fail('Muitas consultas. Tente novamente em instantes.', 429);
    const date = request.nextUrl.searchParams.get('date');
    if (!date) return fail('Informe date=YYYY-MM-DD.', 400);
    const result = await getAvailableSlots(params.slug, date);
    return ok({ date, slots: result.slots, dailyLimitReached: result.dailyLimitReached, duration: result.link.durationMinutes ?? result.link.duration });
  } catch (error) { return handleError(error); }
}
