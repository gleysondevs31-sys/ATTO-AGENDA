import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError, ok } from '@/lib/api/responses';
import { requireSession } from '@/lib/auth/session';
import { assertBookingLinkScope } from '@/lib/tenant';
import { saveAvailabilitySchema } from '@/lib/validation/availability';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try { const { companyId } = await requireSession(request, 'manage_links'); await assertBookingLinkScope(params.id, companyId); const [rules, exceptions] = await Promise.all([prisma.availabilityRule.findMany({ where: { companyId, bookingLinkId: params.id } }), prisma.availabilityException.findMany({ where: { companyId, bookingLinkId: params.id }, orderBy: { date: 'asc' } })]); return ok({ rules, exceptions }); } catch (error) { return handleError(error); }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try { const { companyId, userId } = await requireSession(request, 'manage_links'); await assertBookingLinkScope(params.id, companyId); const payload = saveAvailabilitySchema.parse(await request.json()); await prisma.$transaction(async (tx) => { await tx.bookingLink.update({ where: { id: params.id }, data: { duration: payload.duration } }); await tx.availabilityRule.deleteMany({ where: { companyId, bookingLinkId: params.id } }); await tx.availabilityRule.createMany({ data: payload.rules.map((rule) => ({ companyId, userId: rule.userId ?? userId, bookingLinkId: params.id, weekday: rule.weekday, startTime: rule.startTime, endTime: rule.endTime, isActive: rule.isActive ?? true })) }); if (payload.exceptions?.length) await tx.availabilityException.createMany({ data: payload.exceptions.map((item) => ({ companyId, userId: item.userId ?? userId, bookingLinkId: params.id, date: new Date(`${item.date}T00:00:00.000Z`), startTime: item.startTime, endTime: item.endTime, type: item.type, reason: item.reason })) }); await tx.auditLog.create({ data: { companyId, userId, actorId: userId, action: 'availability.updated', entity: 'BookingLink', entityType: 'BookingLink', entityId: params.id } }); }); return ok({ success: true }); } catch (error) { return handleError(error); }
}
