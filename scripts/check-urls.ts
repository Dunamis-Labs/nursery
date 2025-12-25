import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = databaseUrl;

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { sourceUrl: { not: null } },
    take: 20,
    select: { 
      sourceUrl: true, 
      name: true,
      metadata: true,
    },
  });
  
  console.log('Sample URLs:');
  products.forEach(p => {
    const url = p.sourceUrl || '';
    const path = url.replace('https://www.plantmark.com.au', '');
    console.log(`  ${path} -> ${p.name}`);
  });
  
  // Check if metadata has category info
  console.log('\nChecking metadata for category info...');
  const withMetadata = products.filter(p => p.metadata && typeof p.metadata === 'object');
  if (withMetadata.length > 0) {
    console.log('Sample metadata:', JSON.stringify(withMetadata[0].metadata, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

