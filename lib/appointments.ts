import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { cleanOptional, cleanText } from '@/lib/security/sanitize';
import { writeAudit } from '@/lib/booking';
import type { z } from 'zod';
import type { createAppointmentSchema, updateAppointmentSchema } from '@/lib/validation/appointment';

type CreateAppointment = z.infer<typeof createAppointmentSchema>;
type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function timeString(date: Date) {
  return date.toISOString().slice(11, 16);
}

function dayOfWeek(date: Date) {
  return date.getUTCDay();
}

export function generateProtocol() {
  return `AG-${new Date().getUTCFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function validateSlot(tx: Prisma.TransactionClient, bookingLinkId: string, startsAt: Date, appointmentId?: string) {
  const link = await tx.bookingLink.findUnique({ where: { id: bookingLinkId } });
  if (!link) throw new Error('Link de agendamento não encontrado.');
  if (!link.isActive) throw new Error('Link de agendamento inativo.');
  if (link.expiresAt && link.expiresAt < new Date()) throw new Error('Link de agendamento expirado.');
  if (!link.availableDays.includes(dayOfWeek(startsAt))) throw new Error('Data fora dos dias disponíveis.');
  if (!link.availableSlots.includes(timeString(startsAt))) throw new Error('Horário fora da disponibilidade.');

  const startOfDay = new Date(startsAt);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const dailyCount = await tx.appointment.count({
    where: { bookingLinkId, status: { not: 'cancelled' }, startsAt: { gte: startOfDay, lt: endOfDay }, ...(appointmentId ? { id: { not: appointmentId } } : {}) },
  });
  if (dailyCount >= link.dailyLimit) throw new Error('Limite diário de agendamentos atingido.');

  const conflict = await tx.appointment.findFirst({
    where: { bookingLinkId, startsAt, status: { not: 'cancelled' }, ...(appointmentId ? { id: { not: appointmentId } } : {}) },
  });
  if (conflict) throw new Error('Horário já reservado.');
  return link;
}

export async function createAppointment(input: CreateAppointment, companyId?: string) {
  return prisma.$transaction(async (tx) => {
    const startsAt = new Date(input.startsAt);
    const link = input.bookingLinkId
      ? await tx.bookingLink.findFirst({ where: { id: input.bookingLinkId, ...(companyId ? { companyId } : {}) } })
      : await tx.bookingLink.findUnique({ where: { slug: input.slug! } });
    if (!link || (companyId && link.companyId !== companyId)) throw new Error('Link de agendamento não encontrado.');
    await validateSlot(tx, link.id, startsAt);
    const client = await tx.client.create({ data: { companyId: link.companyId, fullName: cleanText(input.client.fullName, 160), phone: cleanText(input.client.phone, 30), email: cleanOptional(input.client.email, 160), cpf: cleanOptional(input.client.cpf, 14) } });
    const appointment = await tx.appointment.create({
      data: { companyId: link.companyId, bookingLinkId: link.id, userId: link.userId, clientId: client.id, protocol: generateProtocol(), startsAt, endsAt: addMinutes(startsAt, link.duration), status: 'scheduled', notes: cleanOptional(input.notes, 600) },
      include: { client: true, bookingLink: true },
    });
    await tx.auditLog.create({ data: { companyId: link.companyId, action: 'appointment.created', entity: 'Appointment', entityId: appointment.id, metadata: { protocol: appointment.protocol } } });
    return appointment;
  });
}

export async function updateAppointment(id: string, companyId: string, input: UpdateAppointment) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.appointment.findFirst({ where: { id, companyId }, include: { bookingLink: true } });
    if (!current) throw new Error('Agendamento não encontrado para esta empresa.');
    const startsAt = input.startsAt ? new Date(input.startsAt) : current.startsAt;
    if (input.startsAt) await validateSlot(tx, current.bookingLinkId, startsAt, id);
    const status = input.startsAt && !input.status ? 'rescheduled' : input.status;
    const updated = await tx.appointment.update({ where: { id }, data: { ...(input.startsAt ? { startsAt, endsAt: addMinutes(startsAt, current.bookingLink.duration) } : {}), ...(status ? { status } : {}), ...(input.notes !== undefined ? { notes: cleanOptional(input.notes, 600) } : {}) }, include: { client: true, bookingLink: true } });
    await tx.auditLog.create({ data: { companyId, action: status === 'cancelled' ? 'appointment.cancelled' : 'appointment.updated', entity: 'Appointment', entityId: id, metadata: { status: updated.status } } });
    return updated;
  });
}

export async function cancelAppointment(id: string, companyId: string) {
  const appointment = await prisma.appointment.update({ where: { id }, data: { status: 'cancelled' } });
  await writeAudit(companyId, 'appointment.cancelled', 'Appointment', id, { protocol: appointment.protocol });
  return appointment;
}
