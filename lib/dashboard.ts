import { prisma } from '@/lib/db/prisma';

export async function getDashboard(companyId?: string | null) {
  if (!companyId) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const afterTomorrow = new Date(today); afterTomorrow.setDate(afterTomorrow.getDate() + 2);
  const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
  const [total, todayCount, tomorrowCount, weekCount, cancellations, attended, noShow, converted, relevant, upcoming, grouped, topLinks, topConsultants] = await Promise.all([
    prisma.appointment.count({ where: { companyId } }),
    prisma.appointment.count({ where: { companyId, startsAt: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { companyId, startsAt: { gte: tomorrow, lt: afterTomorrow } } }),
    prisma.appointment.count({ where: { companyId, startsAt: { gte: today, lt: weekEnd } } }),
    prisma.appointment.count({ where: { companyId, status: 'cancelled' } }),
    prisma.appointment.count({ where: { companyId, status: 'attended' } }),
    prisma.appointment.count({ where: { companyId, status: 'no_show' } }),
    prisma.appointment.count({ where: { companyId, status: 'converted' } }),
    prisma.appointment.count({ where: { companyId, status: { in: ['attended', 'no_show'] } } }),
    prisma.appointment.findMany({ where: { companyId, startsAt: { gte: new Date() }, status: { not: 'cancelled' } }, include: { client: true, bookingLink: true, user: true }, orderBy: { startsAt: 'asc' }, take: 6 }),
    prisma.appointment.groupBy({ by: ['status'], where: { companyId }, _count: { status: true } }),
    prisma.appointment.groupBy({ by: ['bookingLinkId'], where: { companyId }, _count: { bookingLinkId: true }, orderBy: { _count: { bookingLinkId: 'desc' } }, take: 5 }),
    prisma.appointment.groupBy({ by: ['userId'], where: { companyId, userId: { not: null } }, _count: { userId: true }, orderBy: { _count: { userId: 'desc' } }, take: 5 }),
  ]);
  return { total, todayCount, tomorrowCount, weekCount, cancellations, noShow, converted, conversionRate: total ? Math.round((converted / total) * 1000) / 10 : 0, attendanceRate: relevant ? Math.round((attended / relevant) * 1000) / 10 : 0, upcoming, byStatus: grouped.map((item) => ({ status: item.status, count: item._count.status })), topLinks, topConsultants };
}
