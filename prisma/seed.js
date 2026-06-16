const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({ where: { slug: 'metrocasa' }, update: {}, create: { name: 'Metrocasa Construtora', slug: 'metrocasa', primaryColor: '#ed1c24', buttonColor: '#ed1c24', backgroundColor: '#ffffff', textColor: '#09090b', theme: 'light' } });
  const passwordHash = await bcrypt.hash('Demo@12345', 12);
  const user = await prisma.user.upsert({ where: { companyId_email: { companyId: company.id, email: 'owner@attoagenda.com.br' } }, update: { passwordHash, role: 'owner' }, create: { companyId: company.id, name: 'Connor Alves', email: 'owner@attoagenda.com.br', passwordHash, role: 'owner', title: 'Consultor comercial' } });
  const link = await prisma.bookingLink.upsert({ where: { slug: 'visita-metrocasa' }, update: {}, create: { companyId: company.id, userId: user.id, slug: 'visita-metrocasa', name: 'Visita ao decorado Metrocasa', title: 'Connor Alves', description: 'Agende sua visita comercial com confirmação automática.', welcomeText: 'Escolha o melhor horário para visitar o decorado.', confirmationText: 'Sua visita foi confirmada com sucesso.', address: 'Av. Paulista, 1000 — São Paulo, SP', instructions: 'Chegue com 10 minutos de antecedência.', duration: 30, durationMinutes: 30, dailyLimit: 24, availableDays: [1,2,3,4,5,6], availableSlots: ['09:00','09:30','10:00','10:30','13:30','14:00','15:00','16:30'], isActive: true } });
  await prisma.availabilityRule.deleteMany({ where: { bookingLinkId: link.id } });
  await prisma.availabilityRule.createMany({ data: [1,2,3,4,5,6].flatMap((weekday) => ([{ companyId: company.id, userId: user.id, bookingLinkId: link.id, weekday, startTime: '09:00', endTime: '12:00' }, { companyId: company.id, userId: user.id, bookingLinkId: link.id, weekday, startTime: '13:30', endTime: '18:00' }])) });
  const client = await prisma.client.create({ data: { companyId: company.id, fullName: 'Marina Lopes', phone: '11999999999', email: 'marina@example.com' } });
  await prisma.appointment.create({ data: { companyId: company.id, bookingLinkId: link.id, userId: user.id, clientId: client.id, protocol: 'AG-2026-584712', startsAt: new Date('2026-06-18T10:30:00.000Z'), endsAt: new Date('2026-06-18T11:00:00.000Z'), status: 'scheduled' } }).catch(() => null);
  console.log(`Seed concluído. DEMO_COMPANY_ID=${company.id}`);
  console.log('Login demo: owner@attoagenda.com.br / Demo@12345');
}
main().finally(async () => prisma.$disconnect());
