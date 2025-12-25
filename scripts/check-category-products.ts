import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const categories = await prisma.category.findMany({
    where: {
      name: { not: 'Uncategorized' },
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log('\n📊 Category Product Counts:\n');
  for (const cat of categories) {
    console.log(`  ${cat.name.padEnd(30)} ${cat._count.products.toString().padStart(4)} products`);
  }

  const totalProducts = await prisma.product.count();
  const allProducts = await prisma.product.findMany({
    select: { categoryId: true },
  });
  const productsWithCategory = allProducts.filter(p => p.categoryId !== null).length;

  console.log(`\n📦 Total products: ${totalProducts}`);
  console.log(`📦 Products with category: ${productsWithCategory}`);
  console.log(`📦 Products without category: ${totalProducts - productsWithCategory}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

