# ATTO AGENDA

Plataforma SaaS moderna para links personalizados de agendamento de visitas comerciais e reuniões.

## Stack

- Frontend: Next.js, TypeScript, Tailwind, componentes no estilo Shadcn/UI
- Backend/API: rotas REST em Node.js prontas para evoluir para NestJS
- Banco planejado: PostgreSQL
- Fila planejada: Redis + BullMQ
- Deploy planejado: Docker em VPS Linux

## Recursos implementados no protótipo

- Landing page responsiva com modo claro/escuro
- Dashboard com métricas, agenda do dia e ranking de usuários
- Página pública em `/visita-metrocasa` com calendário, horários, formulário, protocolo e QR Code conceitual
- Endpoints REST: `/api/appointments`, `/api/appointments/:id`, `/api/booking-links`
- Estrutura visual alinhada a um SaaS profissional e clean

## Scripts

```bash
npm run dev
npm run build
npm run typecheck
```


## Deploy na Vercel

O projeto está pinado em Next.js 14, React 18 e Tailwind 3 para evitar que o deploy use versões `latest` incompatíveis. A Vercel deve usar Node 20 conforme `.nvmrc` e executar:

```bash
npm install
npm run build
```

Se o ambiente local bloquear o npm registry, o deploy na Vercel ainda funciona em um projeto conectado ao GitHub com acesso normal ao registry público.
