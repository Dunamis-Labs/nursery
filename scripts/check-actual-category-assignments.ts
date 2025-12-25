import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = databaseUrl;

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  console.log('🔍 Checking actual product category assignments...\n');

  // Get Trees category
  const treesCategory = await prisma.category.findFirst({
    where: { name: 'Trees' },
  });

  if (!treesCategory) {
    console.error('Trees category not found!');
    return;
  }

  console.log(`🌳 Trees category ID: ${treesCategory.id}`);
  console.log(`🌳 Trees category slug: ${treesCategory.slug}\n`);

  // Count products by categoryId
  const categoryCounts = await prisma.product.groupBy({
    by: ['categoryId'],
    _count: true,
  });

  console.log('📊 Products by categoryId:\n');
  const categoryMap = new Map<string, { name: string; count: number }>();
  
  for (const count of categoryCounts) {
    if (!count.categoryId) {
      console.log(`  NULL categoryId: ${count._count} products`);
      continue;
    }
    
    const category = await prisma.category.findUnique({
      where: { id: count.categoryId },
      select: { name: true, slug: true },
    });
    
    const name = category ? category.name : 'Unknown';
    categoryMap.set(count.categoryId, { name, count: count._count });
    console.log(`  ${name.padEnd(30)} (ID: ${count.categoryId}): ${count._count} products`);
  }

  // Check if all products are in Trees
  const totalProducts = await prisma.product.count();
  const treesProductCount = categoryMap.get(treesCategory.id)?.count || 0;
  
  console.log(`\n📦 Total products: ${totalProducts}`);
  console.log(`🌳 Products in Trees: ${treesProductCount}`);
  
  if (treesProductCount === totalProducts) {
    console.error('\n❌ PROBLEM FOUND: ALL products are assigned to Trees!');
    console.log('   This is why Trees shows all products and other categories are empty.\n');
    
    // Check a few sample products
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        categoryId: true,
        sourceUrl: true,
      },
    });
    
    console.log('Sample products:');
    for (const product of sampleProducts) {
      const cat = await prisma.category.findUnique({
        where: { id: product.categoryId },
        select: { name: true },
      });
      console.log(`  - ${product.name}: categoryId=${product.categoryId} (${cat?.name || 'Unknown'})`);
    }
  } else {
    console.log('\n✅ Products are distributed across categories correctly.');
    console.log('   The issue must be in the query or component logic.');
  }
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  process.exit(0);
});

