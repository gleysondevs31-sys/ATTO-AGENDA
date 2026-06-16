import { PrismaClient } from '@prisma/client';
import { assertDatabaseUrl } from '@/lib/db/env';

const globalForPrisma = globalThis as unknown as { prismaClient?: PrismaClient };

function getPrismaClient() {
  if (!globalForPrisma.prismaClient) {
    assertDatabaseUrl();
    globalForPrisma.prismaClient = new PrismaClient();
  }
  return globalForPrisma.prismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = client[property as keyof PrismaClient];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
