export function assertDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada. Configure uma URL PostgreSQL nas variáveis de ambiente antes de usar banco, autenticação, seed ou APIs privadas.');
  }
}
