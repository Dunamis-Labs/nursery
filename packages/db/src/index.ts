export { PrismaClient } from '@prisma/client';
// Explicitly export Prisma types to avoid CommonJS/ESM issues with Turbopack
export type {
  Prisma,
  Decimal,
  JsonValue,
  InputJsonValue,
  JsonNullValueFilter,
  JsonNullValueInput,
  NestedJsonFilter,
  NestedJsonNullableFilter,
} from '@prisma/client';

// Prisma types will be available after running: npm run db:generate
// Types are generated from schema.prisma and exported from @prisma/client

// Re-export Prisma client instance
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is set and valid
// #region agent log
const envCheck = {
  DATABASE_URL: !!process.env.DATABASE_URL,
  DATABASE_URL_NON_POOLING: !!process.env.DATABASE_URL_NON_POOLING,
  POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
  NODE_ENV: process.env.NODE_ENV,
  allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES')),
};
fetch('http://127.0.0.1:7242/ingest/349c6429-fdf5-4459-8ed5-e0d69f4124fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'packages/db/src/index.ts:15',message:'DATABASE_URL env check',data:envCheck,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
// #endregion

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING;

if (!databaseUrl) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/349c6429-fdf5-4459-8ed5-e0d69f4124fc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'packages/db/src/index.ts:25',message:'DATABASE_URL missing - throwing error',data:{envCheck},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  throw new Error(
    'DATABASE_URL is not set. Please set DATABASE_URL, DATABASE_URL_NON_POOLING, or POSTGRES_URL_NON_POOLING in your environment variables.'
  );
}

// Warn if using pooler connection (scripts can't use it, but Next.js can)
if (databaseUrl.includes('pooler.supabase.com') && process.env.NODE_ENV === 'development') {
  console.warn('⚠️  Using pooler connection. For scripts, use DATABASE_URL_NON_POOLING with direct connection.');
}

// Create Prisma client - in development, create fresh instance each time
// This prevents Next.js from caching stale data
const createPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// In development: create fresh client (no caching)
// In production: use singleton for performance
export const prisma =
  process.env.NODE_ENV === 'development'
    ? createPrismaClient()
    : (globalForPrisma.prisma ?? createPrismaClient());

// Only cache in production
if (process.env.NODE_ENV === 'production' && !globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

