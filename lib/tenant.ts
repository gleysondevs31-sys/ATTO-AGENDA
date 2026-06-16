import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export function getCompanyId(request: NextRequest) {
  return request.headers.get('x-company-id') ?? process.env.DEMO_COMPANY_ID ?? null;
}

export async function requireCompanyId(request: NextRequest) {
  const companyId = getCompanyId(request);
  if (!companyId) throw new Error('companyId obrigatório. Envie o header x-company-id ou configure DEMO_COMPANY_ID.');
  return companyId;
}

export function scoped(companyId: string) {
  return { companyId };
}

export async function assertBookingLinkScope(id: string, companyId: string) {
  const link = await prisma.bookingLink.findFirst({ where: { id, companyId } });
  if (!link) throw new Error('Link não encontrado para esta empresa.');
  return link;
}

export async function assertAppointmentScope(id: string, companyId: string) {
  const appointment = await prisma.appointment.findFirst({ where: { id, companyId } });
  if (!appointment) throw new Error('Agendamento não encontrado para esta empresa.');
  return appointment;
}
