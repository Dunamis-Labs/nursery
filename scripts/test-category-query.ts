import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

config({ path: path.resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('Testing category query with exact same query as page...\n');
  
  const category = await prisma.category.findUnique({
    where: { slug: 'hedging-and-screening' },
    include: {
      products: {
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!category) {
    console.log('❌ Category not found!');
    return;
  }

  console.log(`✅ Category found: ${category.name}`);
  console.log(`📦 Products found: ${category.products.length}`);
  
  if (category.products.length > 0) {
    console.log(`\nSample products:`);
    category.products.slice(0, 3).forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (ID: ${p.id}, categoryId: ${p.categoryId})`);
    });
  } else {
    console.log('\n⚠️  No products found! Checking if products exist in database...');
    
    const productCount = await prisma.product.count({
      where: { categoryId: category.id },
    });
    
    console.log(`\nProducts with categoryId=${category.id}: ${productCount}`);
    
    if (productCount > 0) {
      console.log('\n❌ PROBLEM FOUND: Products exist but relation query returned empty!');
      console.log('This suggests a Prisma relation issue or database connection problem.');
    }
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

