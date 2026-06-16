import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export function confirmationMessage(input: { company: string; consultant?: string | null; date: Date; address: string; protocol: string }) {
  return `✅ Visita Confirmada\n\nData: ${input.date.toLocaleDateString('pt-BR')}\nHorário: ${input.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\nLocal: ${input.address}\n${input.consultant ? `Consultor: ${input.consultant}\n` : ''}Protocolo: ${input.protocol}`;
}

export async function createNotificationLog(data: { companyId: string; appointmentId: string; channel: 'whatsapp'|'email'|'sms'; type: 'confirmation'|'reminder'|'cancellation'|'reschedule'; payload: Prisma.InputJsonValue }) {
  return prisma.notificationLog.create({ data: { companyId: data.companyId, appointmentId: data.appointmentId, channel: data.channel, type: data.type, status: 'pending', payload: data.payload } });
}
