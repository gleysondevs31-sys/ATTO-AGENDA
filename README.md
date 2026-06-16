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

## Autenticação e permissões

A autenticação usa sessão HTTP-only própria compatível com Next.js 14. Configure um segredo forte:

```bash
AUTH_SECRET="uma-string-longa-e-aleatoria"
# NEXTAUTH_SECRET também é aceito como fallback
```

Fluxos disponíveis:

- `/login`: entrar.
- `/register`: cria a primeira empresa, configurações visuais padrão e usuário `owner`.
- `/forgot-password`: resposta neutra para evitar enumeração de e-mails.
- `/profile`: perfil do usuário autenticado.
- `/users`: usuários da empresa.

Rotas privadas protegidas por middleware: `/dashboard`, `/booking-links`, `/appointments`, `/settings`, `/users` e `/profile`. As APIs privadas validam sessão, `userId`, `companyId`, `role` e permissão da ação.

Papéis:

- `owner`: acesso total.
- `admin`: gerencia usuários, links, agenda e configurações.
- `manager`: visualiza relatórios e agenda da equipe.
- `consultant`: gerencia apenas fluxo próprio planejado.

## Personalização visual

Cada empresa e cada link podem configurar logo, banner, foto do consultor, cores, tema, layout, textos e redes sociais. Use:

- `/settings/appearance` para configuração global da empresa.
- `/booking-links/[id]/appearance` para editar e visualizar o preview de um link específico.

Uploads aceitam apenas PNG, JPG, JPEG e WEBP até 5MB. A rota `/api/upload` já valida tipo/tamanho e retorna uma URL preparada para adaptação com Vercel Blob, S3 ou storage compatível.

A página pública `/:slug` aplica dinamicamente logo, banner, foto, cores, layout, textos, endereço e instruções, com fallback quando imagens não existem e sem aceitar HTML bruto nos textos.

## Fluxo operacional completo

### Disponibilidade

A disponibilidade é configurada em `/booking-links/[id]/availability` com regras por dia da semana, horário de início/fim, duração, pausa de almoço e bloqueios manuais. O endpoint público abaixo calcula horários livres em tempo real:

```bash
GET /api/public/booking-links/visita-metrocasa/slots?date=2026-06-18
```

O cálculo remove agendamentos ocupados, bloqueios manuais, horários fora da janela mínima/máxima e respeita limite diário.

### Agendamento público

A página `/:slug` carrega slots dinamicamente, mostra loading, estado sem horários, confirma o agendamento e exibe protocolo com botão de copiar e link de WhatsApp.

### Cancelamento e reagendamento público

```bash
/a/AG-2026-584712/cancel
/a/AG-2026-584712/reschedule
```

O cliente informa o telefone usado no agendamento. O sistema valida telefone, janela mínima e permissões públicas configuradas no link.

### Notificações

A tabela `NotificationLog` registra mensagens pendentes para WhatsApp, E-mail ou SMS. Nesta etapa a plataforma gera a mensagem de confirmação, botão de cópia e link de WhatsApp, deixando a integração paga para um adaptador futuro.

### Demo seed

```bash
npm run db:generate
npm run db:seed
```

Credenciais demo:

- E-mail: `owner@attoagenda.com.br`
- Senha: `Demo@12345`

O seed cria empresa demo, usuário owner, link público, regras de disponibilidade e um agendamento exemplo.

## Erro: DATABASE_URL não configurada

Login, cadastro, seed e APIs privadas dependem de PostgreSQL real. Se aparecer a tela `/setup` ou a mensagem de banco não configurado, configure na Vercel:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/atto_agenda?schema=public"
AUTH_SECRET="gere-uma-string-longa-e-segura"
```

Depois rode as migrations no ambiente conectado ao banco:

```bash
npx prisma migrate deploy
npm run db:seed
```

Sem `DATABASE_URL`, a landing pode abrir, mas autenticação, usuários, links e agendamentos não podem ser persistidos.
