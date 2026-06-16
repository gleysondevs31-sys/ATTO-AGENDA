const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { slug: 'metrocasa' },
    update: {},
    create: { name: 'Metrocasa Construtora', slug: 'metrocasa' },
  });
  const user = await prisma.user.upsert({
    where: { companyId_email: { companyId: company.id, email: 'connor@metrocasa.com.br' } },
    update: {},
    create: { companyId: company.id, name: 'Connor Alves', email: 'connor@metrocasa.com.br', role: 'owner', title: 'Consultor comercial' },
  });
  await prisma.bookingLink.upsert({
    where: { slug: 'visita-metrocasa' },
    update: {},
    create: {
      companyId: company.id,
      userId: user.id,
      slug: 'visita-metrocasa',
      name: 'Visita ao decorado Metrocasa',
      description: 'Agende sua visita comercial com confirmação automática.',
      welcomeText: 'Escolha o melhor horário para visitar o decorado.',
      confirmationText: 'Sua visita foi confirmada com sucesso.',
      address: 'Av. Paulista, 1000 — São Paulo, SP',
      duration: 30,
      dailyLimit: 24,
      availableDays: [1, 2, 3, 4, 5, 6],
      availableSlots: ['09:00', '09:30', '10:00', '10:30', '13:30', '14:00', '15:00', '16:30'],
      isActive: true,
    },
  });
  console.log(`Seed concluído. Configure DEMO_COMPANY_ID=${company.id}`);
}

main().finally(async () => prisma.$disconnect());
