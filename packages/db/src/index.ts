export { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

// Prisma types will be available after running: npm run db:generate
// Types are generated from schema.prisma and exported from @prisma/client

// Re-export Prisma client instance
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

