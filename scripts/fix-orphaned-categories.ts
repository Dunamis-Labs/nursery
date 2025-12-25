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
  console.log('🔍 Checking for products with invalid category references...\n');

  // Get all products
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      categoryId: true,
    },
  });

  // Filter to only products with categoryId
  const productsWithCategory = products.filter(p => p.categoryId !== null);

  console.log(`Found ${productsWithCategory.length} products with categories\n`);

  // Get all valid category IDs
  const validCategories = await prisma.category.findMany({
    select: { id: true },
  });
  const validCategoryIds = new Set(validCategories.map(c => c.id));

  // Find products with invalid categoryIds
  const orphanedProducts = productsWithCategory.filter(
    p => p.categoryId && !validCategoryIds.has(p.categoryId)
  );

  console.log(`Found ${orphanedProducts.length} products with invalid category references\n`);

  if (orphanedProducts.length === 0) {
    console.log('✅ No orphaned products found!');
    return;
  }

  // Get or create Uncategorized category
  let uncategorizedCategory = await prisma.category.findFirst({
    where: { name: 'Uncategorized' },
  });

  if (!uncategorizedCategory) {
    uncategorizedCategory = await prisma.category.create({
      data: {
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Products without a specific category',
      },
    });
    console.log('✅ Created Uncategorized category');
  }

  // Fix orphaned products
  console.log('\nFixing orphaned products...');
  let fixed = 0;
  for (const product of orphanedProducts) {
    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: uncategorizedCategory.id },
      });
      fixed++;
      if (fixed % 10 === 0) {
        console.log(`  Fixed ${fixed}/${orphanedProducts.length} products...`);
      }
    } catch (error) {
      console.error(`  Error fixing product ${product.name}:`, error);
    }
  }

  console.log(`\n✅ Fixed ${fixed} orphaned products!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

