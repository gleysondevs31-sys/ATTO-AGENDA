# ATTO AGENDA

Plataforma SaaS para links personalizados de agendamento de visitas comerciais e reuniões, com painel administrativo, página pública, API REST, Prisma ORM e PostgreSQL.

## Stack

- Frontend: Next.js 14, React 18, TypeScript, Tailwind 3
- API: Route Handlers do Next.js compatíveis com Vercel
- ORM/Banco: Prisma + PostgreSQL
- Validação: Zod
- Deploy: Vercel com Node 20

## Variáveis de ambiente

Crie um arquivo `.env` local:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/atto_agenda?schema=public"
DEMO_COMPANY_ID="id-da-company-para-dashboard-admin"
```

`DATABASE_URL` é obrigatório para Prisma. `DEMO_COMPANY_ID` permite que a landing/dashboard leia métricas reais de uma empresa demo. Nas APIs administrativas, também é possível enviar `x-company-id` para isolar o tenant.

## Como rodar localmente

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Após o seed, copie o `DEMO_COMPANY_ID` exibido no terminal para seu `.env` e acesse:

- Dashboard: `http://localhost:3000`
- Link público: `http://localhost:3000/visita-metrocasa`

## Migrations e Prisma

```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

O schema inicial possui: `Company`, `User`, `BookingLink`, `Availability`, `Appointment`, `Client` e `AuditLog`. Todas as entidades operacionais carregam `companyId` para garantir isolamento multiempresa.

## API REST

Rotas administrativas exigem `x-company-id` ou `DEMO_COMPANY_ID`:

```bash
GET    /api/booking-links
POST   /api/booking-links
GET    /api/booking-links/:id
PATCH  /api/booking-links/:id
DELETE /api/booking-links/:id

GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/:id
PATCH  /api/appointments/:id
DELETE /api/appointments/:id
```

Rotas públicas não expõem dados internos:

```bash
GET  /api/public/booking-links/:slug
POST /api/public/appointments
```

## Fluxo público de agendamento

1. Acesse `/visita-metrocasa`.
2. Escolha uma data permitida pelo link.
3. Escolha um horário disponível.
4. Preencha nome, telefone e campos opcionais.
5. Confirme o agendamento.
6. A API cria `Client`, `Appointment`, protocolo automático e `AuditLog`, bloqueando conflitos de horário.

## Deploy na Vercel

O projeto está pinado em Next.js 14, React 18 e Tailwind 3 para evitar incompatibilidades de `latest`. A Vercel deve usar Node 20 conforme `.nvmrc` e executar:

```bash
npm install
npm run build
```

Configure `DATABASE_URL` e, opcionalmente, `DEMO_COMPANY_ID` nas Environment Variables da Vercel. Execute as migrations no banco de produção antes de liberar tráfego:

```bash
npx prisma migrate deploy
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:seed
```
