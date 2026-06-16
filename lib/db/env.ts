export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function assertDatabaseUrl() {
  if (!isDatabaseConfigured()) {
    throw new Error('Banco de dados não configurado. Defina DATABASE_URL com uma URL PostgreSQL nas variáveis de ambiente da Vercel antes de usar autenticação, cadastro, seed ou APIs privadas.');
  }
}
