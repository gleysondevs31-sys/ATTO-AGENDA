import { prisma } from '@/lib/db/prisma';

export type SlotResult = { slots: string[]; dailyLimitReached: boolean };
function minutes(value: string) { const [h,m]=value.split(':').map(Number); return h*60+m; }
function time(value: number) { return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`; }
function dateAt(date: string, slot: string) { return new Date(`${date}T${slot}:00.000Z`); }
function overlaps(start: string, end: string, slotStart: number, slotEnd: number) { return minutes(start) < slotEnd && minutes(end) > slotStart; }

export async function getAvailableSlots(slug: string, date: string): Promise<SlotResult & { link: any }> {
  const link = await prisma.bookingLink.findUnique({ where: { slug }, include: { company: true, user: true } });
  if (!link || !link.isActive || (link.expiresAt && link.expiresAt < new Date())) throw new Error('Link indisponível.');
  const day = new Date(`${date}T00:00:00.000Z`);
  const now = new Date();
  if (Number.isNaN(day.getTime())) throw new Error('Data inválida.');
  if (day < new Date(new Date().toISOString().slice(0,10)+'T00:00:00.000Z')) throw new Error('Data passada.');
  const maxDate = new Date(); maxDate.setUTCDate(maxDate.getUTCDate() + (link.maxScheduleDays ?? 60));
  if (day > maxDate) return { slots: [], dailyLimitReached: false, link };
  const weekday = day.getUTCDay();
  const duration = link.durationMinutes ?? link.duration;
  const [rules, exceptions, appointmentsCount, appointments] = await Promise.all([
    prisma.availabilityRule.findMany({ where: { bookingLinkId: link.id, weekday, isActive: true } }),
    prisma.availabilityException.findMany({ where: { bookingLinkId: link.id, date: day } }),
    prisma.appointment.count({ where: { bookingLinkId: link.id, status: { not: 'cancelled' }, startsAt: { gte: day, lt: new Date(day.getTime()+86400000) } } }),
    prisma.appointment.findMany({ where: { bookingLinkId: link.id, status: { not: 'cancelled' }, startsAt: { gte: day, lt: new Date(day.getTime()+86400000) } }, select: { startsAt: true } }),
  ]);
  if (appointmentsCount >= link.dailyLimit) return { slots: [], dailyLimitReached: true, link };
  const generated = new Set<string>();
  const sourceRules = rules.length ? rules : link.availableDays.includes(weekday) ? link.availableSlots.map((slot) => ({ startTime: slot, endTime: time(minutes(slot)+duration) })) : [];
  for (const rule of sourceRules) for (let start=minutes(rule.startTime); start+duration<=minutes(rule.endTime); start+=duration) generated.add(time(start));
  for (const exception of exceptions.filter((item) => item.type === 'extra')) for (let start=minutes(exception.startTime); start+duration<=minutes(exception.endTime); start+=duration) generated.add(time(start));
  const occupied = new Set(appointments.map((item) => item.startsAt.toISOString().slice(11,16)));
  const blocked = exceptions.filter((item) => item.type === 'blocked');
  const minNotice = new Date(now.getTime() + (link.minScheduleNoticeMinutes ?? 0)*60000);
  const slots = [...generated].sort().filter((slot) => {
    const start = minutes(slot); const end = start + duration;
    if (occupied.has(slot)) return false;
    if (blocked.some((block) => overlaps(block.startTime, block.endTime, start, end))) return false;
    if (dateAt(date, slot) <= minNotice) return false;
    return true;
  });
  return { slots, dailyLimitReached: false, link };
}
