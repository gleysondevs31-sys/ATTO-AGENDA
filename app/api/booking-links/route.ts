import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError, ok } from '@/lib/api/responses';
import { toBookingData, writeAudit } from '@/lib/booking';
import { requireCompanyId } from '@/lib/tenant';
import { createBookingLinkSchema } from '@/lib/validation/booking-link';

export async function GET(request: NextRequest) {
  try {
    const companyId = await requireCompanyId(request);
    const links = await prisma.bookingLink.findMany({ where: { companyId }, include: { user: true, _count: { select: { appointments: true } } }, orderBy: { createdAt: 'desc' } });
    return ok(links);
  } catch (error) { return handleError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = await requireCompanyId(request);
    const payload = createBookingLinkSchema.parse(await request.json());
    const link = await prisma.bookingLink.create({ data: { companyId, ...toBookingData(payload) } });
    await writeAudit(companyId, 'booking_link.created', 'BookingLink', link.id, { slug: link.slug });
    return ok(link, { status: 201 });
  } catch (error) { return handleError(error); }
}
