export const prisma = new Proxy({}, { get() { throw new Error('Prisma está isolado nesta etapa. Use lib/storage para JSON local ou Google Planilhas.'); } }) as any;
