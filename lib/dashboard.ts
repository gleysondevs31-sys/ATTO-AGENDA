import { prisma } from '@/lib/db/prisma';

export async function getDashboard(companyId?: string | null) {
  if (!companyId) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [total, todayCount, cancellations, attended, relevant, upcoming, grouped] = await Promise.all([
    prisma.appointment.count({ where: { companyId } }),
    prisma.appointment.count({ where: { companyId, startsAt: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { companyId, status: 'cancelled' } }),
    prisma.appointment.count({ where: { companyId, status: 'attended' } }),
    prisma.appointment.count({ where: { companyId, status: { in: ['attended', 'no_show'] } } }),
    prisma.appointment.findMany({ where: { companyId, startsAt: { gte: new Date() }, status: { not: 'cancelled' } }, include: { client: true, bookingLink: true, user: true }, orderBy: { startsAt: 'asc' }, take: 6 }),
    prisma.appointment.groupBy({ by: ['status'], where: { companyId }, _count: { status: true } }),
  ]);
  return { total, todayCount, cancellations, attendanceRate: relevant ? Math.round((attended / relevant) * 1000) / 10 : 0, upcoming, byStatus: grouped.map((item) => ({ status: item.status, count: item._count.status })) };
}
