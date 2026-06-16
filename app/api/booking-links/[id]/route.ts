import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError, ok } from '@/lib/api/responses';
import { toBookingData, writeAudit } from '@/lib/booking';
import { assertBookingLinkScope, requireCompanyId } from '@/lib/tenant';
import { updateBookingLinkSchema } from '@/lib/validation/booking-link';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await requireCompanyId(request);
    const link = await prisma.bookingLink.findFirst({ where: { id: params.id, companyId }, include: { user: true, appointments: { include: { client: true }, orderBy: { startsAt: 'desc' } } } });
    if (!link) throw new Error('Link não encontrado para esta empresa.');
    return ok(link);
  } catch (error) { return handleError(error); }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await requireCompanyId(request);
    await assertBookingLinkScope(params.id, companyId);
    const payload = updateBookingLinkSchema.parse(await request.json());
    const link = await prisma.bookingLink.update({ where: { id: params.id }, data: toBookingData(payload) });
    await writeAudit(companyId, 'booking_link.updated', 'BookingLink', link.id, { slug: link.slug });
    return ok(link);
  } catch (error) { return handleError(error); }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = await requireCompanyId(request);
    await assertBookingLinkScope(params.id, companyId);
    const link = await prisma.bookingLink.update({ where: { id: params.id }, data: { isActive: false } });
    await writeAudit(companyId, 'booking_link.disabled', 'BookingLink', link.id, { slug: link.slug });
    return ok(link);
  } catch (error) { return handleError(error); }
}
