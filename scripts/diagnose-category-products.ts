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
  console.log('🔍 Diagnosing category product assignments...\n');

  // Get all categories
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

  console.log('📊 Category Product Counts:\n');
  for (const cat of categories) {
    console.log(`  ${cat.name.padEnd(30)} ${cat._count.products.toString().padStart(4)} products (slug: ${cat.slug})`);
  }

  // Check if all products are in Trees
  const treesCategory = await prisma.category.findFirst({
    where: { name: 'Trees' },
  });

  if (treesCategory) {
    const treesProducts = await prisma.product.findMany({
      where: { categoryId: treesCategory.id },
      take: 5,
      select: { id: true, name: true, categoryId: true },
    });

    console.log(`\n🌳 Trees category (ID: ${treesCategory.id}):`);
    console.log(`   Total products: ${treesCategory._count.products}`);
    if (treesProducts.length > 0) {
      console.log(`   Sample products:`);
      treesProducts.forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.name} (categoryId: ${p.categoryId})`);
      });
    }

    // Check if there are products with different categoryIds
    const allProducts = await prisma.product.findMany({
      select: { categoryId: true },
    });

    const categoryIdCounts = new Map<string, number>();
    allProducts.forEach(p => {
      if (p.categoryId) {
        categoryIdCounts.set(p.categoryId, (categoryIdCounts.get(p.categoryId) || 0) + 1);
      }
    });

    console.log(`\n📦 Products by categoryId:`);
    for (const [catId, count] of Array.from(categoryIdCounts.entries()).sort((a, b) => b[1] - a[1])) {
      const cat = categories.find(c => c.id === catId);
      const catName = cat ? cat.name : 'Unknown';
      console.log(`   ${catName.padEnd(30)} ${count.toString().padStart(4)} products (ID: ${catId})`);
    }

    // Check for products with null categoryId
    const productsWithoutCategory = await prisma.product.count({
      where: { categoryId: null },
    });
    console.log(`\n   Products without category: ${productsWithoutCategory}`);
  }

  // Test a specific category page query
  console.log(`\n🧪 Testing category page queries:\n`);
  const testSlugs = ['trees', 'shrubs', 'grasses', 'hedging-and-screening'];
  
  for (const slug of testSlugs) {
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    
    if (!category) {
      console.log(`  ❌ Category not found: ${slug}`);
      continue;
    }
    
    const products = await prisma.product.findMany({
      where: { categoryId: category.id },
      take: 3,
    });
    
    console.log(`  ${category.name.padEnd(30)} (slug: ${slug}): ${products.length} products`);
    if (products.length > 0) {
      console.log(`    Sample: ${products[0].name}`);
    }
  }
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  process.exit(0);
});

