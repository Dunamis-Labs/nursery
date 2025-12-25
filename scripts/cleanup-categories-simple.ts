/**
 * Simple script to:
 * 1. Keep only the 15 main categories
 * 2. Reassign all products to these 15 categories
 * 3. Delete all other categories
 * 4. Ensure all 1551 products are assigned
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

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

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[&,]/g, '').replace(/\s+/g, ' ').trim();
}

async function main() {
  console.log('🧹 Cleaning up categories...\n');

  // Step 1: Get or create the 15 main categories
  console.log('Step 1: Ensuring 15 main categories exist...');
  const mainCategoryMap = new Map<string, string>(); // name -> id
  
  for (const categoryName of MAIN_CATEGORIES) {
    let category = await prisma.category.findFirst({
      where: {
        name: categoryName,
        parentId: null,
      },
    });

    if (!category) {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/,/g, '');
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug,
          description: `${categoryName} plants`,
        },
      });
      console.log(`  ✅ Created: ${categoryName}`);
    } else {
      console.log(`  ✓ Exists: ${categoryName}`);
    }
    
    mainCategoryMap.set(normalizeName(categoryName), category.id);
  }

  // Step 2: Get all products
  console.log('\nStep 2: Fetching all products...');
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });
  console.log(`  Found ${allProducts.length} products`);

  // Step 3: Reassign products to main categories
  console.log('\nStep 3: Reassigning products to main categories...');
  let reassigned = 0;
  let alreadyCorrect = 0;
  const reassignmentMap = new Map<string, number>(); // category name -> count

  for (const product of allProducts) {
    let targetCategoryId: string | null = null;
    const currentCategoryName = product.category?.name || 'Unknown';

    // Check if already in a main category
    if (product.categoryId && mainCategoryMap.has(normalizeName(currentCategoryName))) {
      const mainCatId = mainCategoryMap.get(normalizeName(currentCategoryName))!;
      if (product.categoryId === mainCatId) {
        alreadyCorrect++;
        continue;
      }
      targetCategoryId = mainCatId;
    } else {
      // Try to match by name similarity
      const normalizedCurrent = normalizeName(currentCategoryName);
      for (const [mainName, mainId] of mainCategoryMap.entries()) {
        if (normalizedCurrent.includes(mainName) || mainName.includes(normalizedCurrent)) {
          targetCategoryId = mainId;
          break;
        }
      }
    }

    // If no match found, assign to first main category as fallback
    if (!targetCategoryId) {
      targetCategoryId = Array.from(mainCategoryMap.values())[0];
    }

    if (product.categoryId !== targetCategoryId) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: targetCategoryId },
      });
      reassigned++;
      
      const targetCategoryName = Array.from(mainCategoryMap.entries())
        .find(([_, id]) => id === targetCategoryId)?.[0] || 'Unknown';
      reassignmentMap.set(targetCategoryName, (reassignmentMap.get(targetCategoryName) || 0) + 1);
    }
  }

  console.log(`  ✅ Reassigned ${reassigned} products`);
  console.log(`  ✓ ${alreadyCorrect} products already in correct categories`);

  // Step 4: Delete all non-main categories
  console.log('\nStep 4: Deleting all non-main categories...');
  const mainCategoryIds = Array.from(mainCategoryMap.values());
  const deleteResult = await prisma.category.deleteMany({
    where: {
      id: { notIn: mainCategoryIds },
    },
  });
  console.log(`  ✅ Deleted ${deleteResult.count} categories`);

  // Step 5: Verify final state
  console.log('\nStep 5: Verifying final state...');
  const finalCategories = await prisma.category.findMany({
    where: {
      id: { in: mainCategoryIds },
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

  const totalProducts = await prisma.product.count();
  const unassignedProducts = await prisma.product.count({
    where: {
      categoryId: { notIn: mainCategoryIds },
    },
  });

  console.log('\n✅ Cleanup complete!\n');
  console.log('📊 Final Category Product Counts:');
  for (const cat of finalCategories) {
    console.log(`  ${cat.name.padEnd(30)} ${cat._count.products.toString().padStart(4)} products`);
  }
  
  console.log(`\n📦 Total products: ${totalProducts}`);
  console.log(`📦 Unassigned products: ${unassignedProducts}`);
  
  if (unassignedProducts > 0) {
    console.log(`\n⚠️  Warning: ${unassignedProducts} products are not assigned to main categories!`);
  }
  
  if (reassigned > 0) {
    console.log(`\n📋 Reassignment breakdown:`);
    for (const [catName, count] of Array.from(reassignmentMap.entries()).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${catName}: ${count} products`);
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

