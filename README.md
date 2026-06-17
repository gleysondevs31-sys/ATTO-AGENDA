# ATTO AGENDA

Plataforma SaaS de agendamento de visitas comerciais com Next.js 14, React 18 e TypeScript.

## Storage atual

Nesta etapa o fluxo principal **não depende de PostgreSQL, Prisma, migrations ou DATABASE_URL**.

A persistência usa:

1. **JSON local** em `/data` para desenvolvimento/fallback.
2. **Google Planilhas** em produção quando `GOOGLE_SHEETS_SPREADSHEET_ID` estiver configurado.

> Limitação: na Vercel, escrita em JSON local pode ser efêmera/somente leitura. Para produção, use Google Planilhas. PostgreSQL pode voltar no futuro como banco relacional definitivo.

## Variáveis de ambiente

```bash
AUTH_SECRET="gere-uma-string-longa-e-segura"
GOOGLE_SHEETS_CLIENT_EMAIL="service-account@projeto.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID="id-da-planilha"
GOOGLE_SHEETS_PROJECT_ID="opcional"
```

Se `GOOGLE_SHEETS_SPREADSHEET_ID` não existir, o sistema usa JSON local.

## Google Sheets

Crie uma planilha com as abas abaixo. O serviço também tenta garantir cabeçalhos automaticamente quando a credencial tem permissão de edição.

- `Appointments`
- `Clients`
- `BookingLinks`
- `AuditLogs`
- `NotificationLogs`

### Como configurar

1. Crie um projeto no Google Cloud.
2. Ative a **Google Sheets API**.
3. Crie uma **Service Account**.
4. Gere uma chave JSON.
5. Copie `client_email` para `GOOGLE_SHEETS_CLIENT_EMAIL`.
6. Copie `private_key` para `GOOGLE_SHEETS_PRIVATE_KEY` mantendo `\n`.
7. Compartilhe a planilha com o e-mail da Service Account como editor.
8. Configure as variáveis na Vercel.

## Rodar localmente

```bash
npm install
npm run dev
```

Dados locais ficam em `/data`:

- `companies.json`
- `users.json`
- `booking-links.json`
- `availability-rules.json`
- `availability-exceptions.json`
- `clients.json`
- `appointments.json`
- `audit-logs.json`
- `notification-logs.json`

## Login demo local

```txt
E-mail: owner@attoagenda.com.br
Senha: Demo@12345
```

## Fluxo manual de teste

1. Acesse `/login` e entre com o usuário demo.
2. Acesse `/booking-links`.
3. Abra `/visita-metrocasa`.
4. Escolha data e horário.
5. Confirme o agendamento.
6. Verifique nova linha em Google Planilhas ou `/data/appointments.json` local.
7. Use `/a/{PROTOCOLO}/cancel` para cancelar.
8. Confirme a atualização na planilha/JSON.

## Deploy na Vercel

- Não configure `DATABASE_URL`; ela não é necessária nesta etapa.
- Configure `AUTH_SECRET`.
- Para produção, configure as variáveis do Google Sheets.
- Rode `npm run build` no pipeline padrão da Vercel.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:seed
```

`npm run db:seed` popula JSON local para desenvolvimento.
