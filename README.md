# ATTO AGENDA

Plataforma SaaS de agendamento de visitas comerciais com Next.js 14, React 18, TypeScript e Tailwind 3.

## Storage atual

O fluxo principal não exige banco SQL. A persistência usa:

1. **Google Planilhas em produção** — obrigatório na Vercel.
2. **JSON local em `/data` apenas em desenvolvimento** — fallback para rodar e testar localmente.

> Na Vercel o filesystem é efêmero/somente leitura para persistência real. Não use JSON local para agendamentos, usuários, status ou uploads em produção.

## Variáveis de ambiente

### Obrigatórias em produção

```bash
AUTH_SECRET="gere-uma-string-longa-e-segura"
NEXTAUTH_SECRET="pode-ser-o-mesmo-valor-do-auth-secret"
APP_URL="https://seu-dominio.vercel.app"
GOOGLE_SHEETS_CLIENT_EMAIL="service-account@projeto.iam.gserviceaccount.com"
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID="id-da-planilha"
SETUP_SECRET="gere-outra-string-longa-e-segura"
```

### Opcionais

```bash
GOOGLE_SHEETS_PROJECT_ID="id-do-projeto"
VERCEL_BLOB_TOKEN="token-para-upload-persistente"
WHATSAPP_PROVIDER="futuro-provedor"
WHATSAPP_API_URL="url-do-provedor"
WHATSAPP_API_TOKEN="token-do-provedor"
```

Se `NODE_ENV=production` e as variáveis do Google Sheets não estiverem configuradas, escritas importantes são bloqueadas com erro claro de configuração.

## Abas do Google Sheets

A rota de setup cria/atualiza cabeçalhos para:

- `Companies`
- `Users`
- `BookingLinks`
- `AvailabilityRules`
- `AvailabilityExceptions`
- `Appointments`
- `Clients`
- `AuditLogs`
- `NotificationLogs`

## Configuração Google Cloud

1. Crie um projeto no Google Cloud.
2. Ative a **Google Sheets API**.
3. Crie uma **Service Account**.
4. Gere uma chave JSON.
5. Copie `client_email` para `GOOGLE_SHEETS_CLIENT_EMAIL`.
6. Copie `private_key` para `GOOGLE_SHEETS_PRIVATE_KEY`, mantendo as quebras como `\n`.
7. Crie uma planilha no Google Sheets.
8. Compartilhe a planilha com o e-mail da Service Account como editor.
9. Copie o ID da planilha para `GOOGLE_SHEETS_SPREADSHEET_ID`.

## Deploy na Vercel

1. Crie o projeto na Vercel.
2. Configure Node.js 20.
3. Configure todas as variáveis obrigatórias.
4. Faça deploy normalmente com `npm install` e `npm run build`.
5. Após o deploy, rode o setup protegido:

```bash
curl -X POST "https://seu-dominio.vercel.app/api/setup/google-sheets?secret=SEU_SETUP_SECRET"
```

6. Teste o link público `/visita-metrocasa`.
7. Confirme que novas linhas aparecem nas abas da planilha.

## Rodar localmente com JSON

```bash
npm install
npm run db:seed
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

## Uploads

Uploads locais não são persistentes na Vercel. Em produção, `/api/upload` retorna erro claro se `VERCEL_BLOB_TOKEN` ou storage externo não estiver configurado. A estrutura está preparada para Vercel Blob/S3 sem quebrar o build.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run db:seed
```

`npm run db:seed` popula JSON local para desenvolvimento.
