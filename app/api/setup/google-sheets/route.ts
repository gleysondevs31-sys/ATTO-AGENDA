import { NextRequest } from 'next/server';
import { fail, handleError, ok } from '@/lib/api/responses';
import { hashPassword } from '@/lib/auth/session';
import { ensureSheetHeaders } from '@/lib/integrations/google-sheets';
import { createAvailabilityRule, createBookingLink, createCompany, createUser, getStorageMode, listBookingLinks, listCompanies, listUsers } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-setup-secret') ?? request.nextUrl.searchParams.get('secret');
    if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET) return fail('Setup não autorizado.', 401);
    if (getStorageMode() !== 'google-sheets') return fail('Google Sheets não configurado. Configure GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL e GOOGLE_SHEETS_PRIVATE_KEY na Vercel.', 500);

    await ensureSheetHeaders();
    const existingCompany = (await listCompanies()).find((company) => company.slug === 'metrocasa');
    const company = existingCompany ?? await createCompany({ id: 'company_demo', name: 'Metrocasa Construtora', slug: 'metrocasa', primaryColor: '#ed1c24', secondaryColor: '#129247', buttonColor: '#ed1c24', backgroundColor: '#ffffff', textColor: '#09090b', theme: 'light' });
    const existingUser = (await listUsers(company.id)).find((user) => user.email === 'owner@attoagenda.com.br');
    const user = existingUser ?? await createUser({ id: 'user_owner_demo', companyId: company.id, name: 'Connor Alves', email: 'owner@attoagenda.com.br', passwordHash: await hashPassword('Demo@12345'), role: 'owner', title: 'Consultor comercial' });
    const existingLink = (await listBookingLinks(company.id)).find((link) => link.slug === 'visita-metrocasa');
    const link = existingLink ?? await createBookingLink({ id: 'link_demo', companyId: company.id, userId: user.id, slug: 'visita-metrocasa', name: 'Visita ao decorado Metrocasa', title: 'Connor Alves', description: 'Agende sua visita comercial com confirmação automática.', address: 'Av. Paulista, 1000 — São Paulo, SP', duration: 30, durationMinutes: 30, dailyLimit: 24, availableDays: [1, 2, 3, 4, 5, 6], availableSlots: ['09:00', '09:30', '10:00', '10:30', '13:30', '14:00', '15:00', '16:30'], isActive: true, primaryColor: '#ed1c24', buttonColor: '#ed1c24', backgroundColor: '#ffffff', textColor: '#09090b', welcomeText: 'Escolha o melhor horário para visitar o decorado.', confirmationText: 'Sua visita foi confirmada com sucesso.' });
    const weekdays = [1, 2, 3, 4, 5, 6];
    await Promise.all(weekdays.flatMap((weekday) => [
      createAvailabilityRule({ companyId: company.id, userId: user.id, bookingLinkId: link.id, weekday, startTime: '09:00', endTime: '12:00', isActive: true }),
      createAvailabilityRule({ companyId: company.id, userId: user.id, bookingLinkId: link.id, weekday, startTime: '13:30', endTime: '18:00', isActive: true }),
    ]));
    return ok({ company: { id: company.id, name: company.name }, user: { id: user.id, email: user.email }, link: { id: link.id, slug: link.slug } });
  } catch (error) { return handleError(error); }
}
