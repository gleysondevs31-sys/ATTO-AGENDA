import { NextRequest } from 'next/server';
import { getPublicBookingLink, publicLinkDto } from '@/lib/booking';
import { fail, handleError, ok } from '@/lib/api/responses';

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const link = await getPublicBookingLink(params.slug);
    if (!link) return fail('Link público não encontrado, inativo ou expirado.', 404);
    return ok(await publicLinkDto(link));
  } catch (error) { return handleError(error); }
}
