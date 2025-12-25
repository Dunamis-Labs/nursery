/**
 * Script to merge duplicate categories with similar names
 * 
 * This script:
 * 1. Finds categories with similar names (e.g., "Hedging & Screening" vs "Hedging and Screening")
 * 2. Reassigns products from duplicate categories to the main category
 * 3. Deletes duplicate categories
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const MAIN_CATEGORIES = [
  'Trees',
  'Shrubs',
  'Grasses',
  'Hedging and Screening',
  'Groundcovers',
  'Climbers',
  'Palms, Ferns & Tropical',
  'Conifers',
  'Roses',
  'Succulents & Cacti',
  'Citrus & Fruit',
  'Herbs & Vegetables',
  'Water Plants',
  'Indoor Plants',
  'Garden Products',
];

function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[&,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log('🌱 Merging duplicate categories...\n');

  // Step 1: Get all main categories
  console.log('Step 1: Finding main categories...');
  const mainCategories = await prisma.category.findMany({
    where: {
      name: { in: MAIN_CATEGORIES },
      parentId: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { products: true },
      },
    },
  });

  const mainCategoryMap = new Map<string, { id: string; name: string }>(); // normalized -> main category
  for (const cat of mainCategories) {
    const normalized = normalizeCategoryName(cat.name);
    mainCategoryMap.set(normalized, { id: cat.id, name: cat.name });
    console.log(`  ✓ ${cat.name} (${cat._count.products} products)`);
  }

  // Step 2: Find all categories (including duplicates)
  console.log('\nStep 2: Finding all categories...');
  const allCategories = await prisma.category.findMany({
    where: {
      name: { not: 'Uncategorized' },
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  console.log(`  Found ${allCategories.length} total categories\n`);

  // Step 3: Find duplicates and merge them
  console.log('Step 3: Finding and merging duplicate categories...');
  let productsReassigned = 0;
  let categoriesDeleted = 0;
  const categoriesToDelete: string[] = [];

  for (const cat of allCategories) {
    // Skip if this is already a main category
    if (MAIN_CATEGORIES.includes(cat.name) && cat.parentId === null) {
      continue;
    }

    const normalized = normalizeCategoryName(cat.name);
    const mainCategory = mainCategoryMap.get(normalized);

    if (mainCategory && mainCategory.id !== cat.id) {
      // This is a duplicate - reassign products
      const productCount = cat._count.products;
      
      if (productCount > 0) {
        console.log(`  📦 ${cat.name} → ${mainCategory.name} (${productCount} products)`);
        const result = await prisma.product.updateMany({
          where: {
            categoryId: cat.id,
          },
          data: {
            categoryId: mainCategory.id,
          },
        });
        productsReassigned += result.count;
        console.log(`    ✅ Reassigned ${result.count} products`);
      }

      categoriesToDelete.push(cat.id);
    } else {
      // Try to match by first word or partial match
      const firstWord = normalized.split(' ')[0];
      let matched = false;

      for (const [normName, mainCat] of mainCategoryMap.entries()) {
        if (normName.startsWith(firstWord) || normalized.includes(normName) || normName.includes(normalized)) {
          if (mainCat.id !== cat.id) {
            const productCount = cat._count.products;
            
            if (productCount > 0) {
              console.log(`  📦 ${cat.name} → ${mainCat.name} (matched by similarity, ${productCount} products)`);
              const result = await prisma.product.updateMany({
                where: {
                  categoryId: cat.id,
                },
                data: {
                  categoryId: mainCat.id,
                },
              });
              productsReassigned += result.count;
              console.log(`    ✅ Reassigned ${result.count} products`);
            }

            categoriesToDelete.push(cat.id);
            matched = true;
            break;
          }
        }
      }

      if (!matched && cat._count.products > 0) {
        console.log(`  ⚠️  ${cat.name} (${cat._count.products} products) - no match found, keeping for now`);
      } else if (!matched) {
        // No products, safe to delete
        categoriesToDelete.push(cat.id);
      }
    }
  }

  // Step 4: Delete duplicate categories
  console.log('\nStep 4: Deleting duplicate categories...');
  if (categoriesToDelete.length > 0) {
    const deleteResult = await prisma.category.deleteMany({
      where: {
        id: { in: categoriesToDelete },
      },
    });
    categoriesDeleted = deleteResult.count;
    console.log(`  ✅ Deleted ${categoriesDeleted} duplicate categories`);
  } else {
    console.log('  ℹ️  No duplicate categories to delete');
  }

  // Final summary
  console.log('\n✅ Migration complete!\n');
  console.log('Summary:');
  console.log(`  Products reassigned: ${productsReassigned}`);
  console.log(`  Categories deleted: ${categoriesDeleted}`);

  // Show final category product counts
  console.log('\n📊 Final category product counts:');
  const finalCategories = await prisma.category.findMany({
    where: {
      name: { in: MAIN_CATEGORIES },
      parentId: null,
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

  for (const cat of finalCategories) {
    console.log(`  ${cat.name.padEnd(30)} ${cat._count.products.toString().padStart(4)} products`);
  }

  // Check for any remaining non-main categories
  const remainingNonMain = await prisma.category.findMany({
    where: {
      name: { notIn: MAIN_CATEGORIES },
      name: { not: 'Uncategorized' },
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  if (remainingNonMain.length > 0) {
    console.log('\n⚠️  Remaining non-main categories:');
    for (const cat of remainingNonMain) {
      console.log(`  ${cat.name.padEnd(30)} ${cat._count.products.toString().padStart(4)} products`);
    }
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

