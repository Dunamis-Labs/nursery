/**
 * Script to remove all subcategories and reassign products to main categories
 * 
 * This script:
 * 1. Finds all subcategories (categories with parentId)
 * 2. Reassigns products from subcategories to their parent main categories
 * 3. Deletes all subcategories
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

async function main() {
  console.log('🌱 Removing subcategories and reassigning products...\n');

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
    },
  });

  const mainCategoryMap = new Map<string, string>(); // name -> id
  for (const cat of mainCategories) {
    mainCategoryMap.set(cat.name.toLowerCase(), cat.id);
    console.log(`  ✓ ${cat.name} (${cat.id})`);
  }

  if (mainCategories.length === 0) {
    console.error('❌ No main categories found! Cannot proceed.');
    return;
  }

  // Step 2: Find all subcategories
  console.log('\nStep 2: Finding all subcategories...');
  const subcategories = await prisma.category.findMany({
    where: {
      parentId: { not: null },
    },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: { products: true },
      },
    },
  });

  console.log(`  Found ${subcategories.length} subcategories\n`);

  if (subcategories.length === 0) {
    console.log('✅ No subcategories found. Nothing to do!');
    return;
  }

  // Step 3: Reassign products from subcategories to main categories
  console.log('Step 3: Reassigning products to main categories...');
  let productsReassigned = 0;
  let productsSkipped = 0;
  let subcategoriesDeleted = 0;

  for (const subcat of subcategories) {
    const productCount = subcat._count.products;
    
    if (productCount === 0) {
      console.log(`  ⏭️  ${subcat.name} (0 products) - will be deleted`);
      continue;
    }

    // Find the main category to reassign to
    let targetMainCategoryId: string | null = null;

    // First, try to find parent's main category (if parent is a main category)
    if (subcat.parent) {
      const parentNameLower = subcat.parent.name.toLowerCase();
      if (mainCategoryMap.has(parentNameLower)) {
        targetMainCategoryId = mainCategoryMap.get(parentNameLower)!;
        console.log(`  📦 ${subcat.name} → ${subcat.parent.name} (${productCount} products)`);
      }
    }

    // If parent is not a main category, try to match by name similarity
    if (!targetMainCategoryId) {
      const subcatNameLower = subcat.name.toLowerCase();
      for (const [mainName, mainId] of mainCategoryMap.entries()) {
        // Check if subcategory name contains main category name or vice versa
        const normalizedSubcat = subcatNameLower.replace(/[&,]/g, '').replace(/\s+/g, ' ').trim();
        const normalizedMain = mainName.replace(/[&,]/g, '').replace(/\s+/g, ' ').trim();
        
        if (normalizedSubcat.includes(normalizedMain) || normalizedMain.includes(normalizedSubcat)) {
          targetMainCategoryId = mainId;
          const mainCategoryName = Array.from(mainCategoryMap.keys())
            .find(k => mainCategoryMap.get(k) === mainId);
          console.log(`  📦 ${subcat.name} → ${mainCategoryName} (matched by name, ${productCount} products)`);
          break;
        }
      }
    }

    // If still no match, try to find by first word
    if (!targetMainCategoryId) {
      const firstWord = subcat.name.toLowerCase().split(/[\s,&]+/)[0];
      for (const [mainName, mainId] of mainCategoryMap.entries()) {
        if (mainName.toLowerCase().startsWith(firstWord)) {
          targetMainCategoryId = mainId;
          const mainCategoryName = Array.from(mainCategoryMap.keys())
            .find(k => mainCategoryMap.get(k) === mainId);
          console.log(`  📦 ${subcat.name} → ${mainCategoryName} (matched by first word, ${productCount} products)`);
          break;
        }
      }
    }

    if (targetMainCategoryId) {
      // Reassign all products from subcategory to main category
      const result = await prisma.product.updateMany({
        where: {
          categoryId: subcat.id,
        },
        data: {
          categoryId: targetMainCategoryId,
        },
      });
      productsReassigned += result.count;
      console.log(`    ✅ Reassigned ${result.count} products`);
    } else {
      // No main category found - assign to first main category as fallback
      const fallbackCategoryId = mainCategories[0].id;
      const result = await prisma.product.updateMany({
        where: {
          categoryId: subcat.id,
        },
        data: {
          categoryId: fallbackCategoryId,
        },
      });
      productsReassigned += result.count;
      productsSkipped += result.count;
      console.log(`    ⚠️  ${subcat.name} → ${mainCategories[0].name} (FALLBACK, ${result.count} products)`);
    }
  }

  // Step 4: Delete all subcategories
  console.log('\nStep 4: Deleting all subcategories...');
  const deleteResult = await prisma.category.deleteMany({
    where: {
      parentId: { not: null },
    },
  });
  subcategoriesDeleted = deleteResult.count;
  console.log(`  ✅ Deleted ${subcategoriesDeleted} subcategories`);

  // Step 5: Verify - check for any remaining subcategories
  console.log('\nStep 5: Verifying...');
  const remainingSubcategories = await prisma.category.count({
    where: {
      parentId: { not: null },
    },
  });

  if (remainingSubcategories > 0) {
    console.log(`  ⚠️  Warning: ${remainingSubcategories} subcategories still exist`);
  } else {
    console.log('  ✅ No subcategories remaining');
  }

  // Final summary
  console.log('\n✅ Migration complete!\n');
  console.log('Summary:');
  console.log(`  Products reassigned: ${productsReassigned}`);
  console.log(`  Products skipped (fallback): ${productsSkipped}`);
  console.log(`  Subcategories deleted: ${subcategoriesDeleted}`);
  console.log(`  Remaining subcategories: ${remainingSubcategories}`);

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
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

