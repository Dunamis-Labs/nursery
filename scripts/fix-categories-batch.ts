import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

// Build direct connection URL from .env variables
const host = process.env.POSTGRES_HOST || 'db.pahkmqhomlzfbnizwryw.supabase.co';
const user = process.env.POSTGRES_USER || 'postgres.pahkmqhomlzfbnizwryw';
const password = process.env.POSTGRES_PASSWORD || '';
const database = process.env.POSTGRES_DATABASE || 'postgres';

// Use pooler URL for scripts (Next.js uses it successfully)
const databaseUrl = process.env.DATABASE_URL || `postgres://${user}:${password}@${host}:5432/${database}?sslmode=require`;

process.env.DATABASE_URL = databaseUrl;

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

// The 15 main Plantmark categories
const PLANTMARK_CATEGORIES = [
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

function mapUrlToCategory(urlPath: string): string | null {
  if (!urlPath) return null;
  
  const pathParts = urlPath.toLowerCase().split('/').filter(p => p && p !== 'plant-finder');
  if (pathParts.length === 0) return null;
  
  const firstPart = pathParts[0].toLowerCase();
  
  const urlToCategoryMap: Record<string, string> = {
    'trees': 'Trees', 'tree': 'Trees',
    'shrubs': 'Shrubs', 'shrub': 'Shrubs',
    'grasses': 'Grasses', 'grass': 'Grasses', 'ornamental-grasses': 'Grasses',
    'hedging': 'Hedging and Screening', 'hedge': 'Hedging and Screening', 'screening': 'Hedging and Screening',
    'groundcovers': 'Groundcovers', 'groundcover': 'Groundcovers', 'ground-covers': 'Groundcovers',
    'climbers': 'Climbers', 'climber': 'Climbers', 'vines': 'Climbers', 'vine': 'Climbers',
    'palms': 'Palms, Ferns & Tropical', 'palm': 'Palms, Ferns & Tropical',
    'ferns': 'Palms, Ferns & Tropical', 'fern': 'Palms, Ferns & Tropical',
    'tropical': 'Palms, Ferns & Tropical',
    'conifers': 'Conifers', 'conifer': 'Conifers',
    'roses': 'Roses', 'rose': 'Roses',
    'succulents': 'Succulents & Cacti', 'succulent': 'Succulents & Cacti',
    'cacti': 'Succulents & Cacti', 'cactus': 'Succulents & Cacti',
    'citrus': 'Citrus & Fruit', 'fruit': 'Citrus & Fruit', 'fruit-trees': 'Citrus & Fruit',
    'herbs': 'Herbs & Vegetables', 'herb': 'Herbs & Vegetables',
    'vegetables': 'Herbs & Vegetables', 'vegetable': 'Herbs & Vegetables',
    'water-plants': 'Water Plants', 'water-plant': 'Water Plants', 'aquatic': 'Water Plants',
    'indoor-plants': 'Indoor Plants', 'indoor': 'Indoor Plants', 'houseplants': 'Indoor Plants',
    'garden-products': 'Garden Products', 'products': 'Garden Products',
  };
  
  return urlToCategoryMap[firstPart] || null;
}

function extractCategoryFromUrl(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  try {
    const url = new URL(sourceUrl);
    return mapUrlToCategory(url.pathname);
  } catch {
    return null;
  }
}

async function main() {
  console.log('🌱 Starting category fix - mapping to 15 main Plantmark categories...\n');

  // Step 1: Ensure the 15 main categories exist
  console.log('Step 1: Creating/verifying 15 main categories...');
  const categoryMap = new Map<string, string>();
  for (const categoryName of PLANTMARK_CATEGORIES) {
    let category = await prisma.category.findFirst({
      where: { name: categoryName },
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
          description: `${categoryName} from Plantmark`,
        },
      });
      console.log(`  ✅ Created: ${categoryName}`);
    } else {
      console.log(`  ✓ Exists: ${categoryName}`);
    }
    
    categoryMap.set(categoryName.toLowerCase(), category.id);
  }

  // Step 2: Get all products
  console.log('\nStep 2: Fetching products...');
  const products = await prisma.product.findMany({
    where: { sourceUrl: { not: null } },
    select: { id: true, sourceUrl: true, categoryId: true },
  });
  console.log(`  Found ${products.length} products\n`);

  // Step 3: Re-categorize products
  console.log('Step 3: Re-categorizing products...');
  const batchSize = 50;
  let updated = 0;
  let skipped = 0;
  const categoryCounts = new Map<string, number>();

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    for (const product of batch) {
      try {
        const categoryName = extractCategoryFromUrl(product.sourceUrl);
        if (!categoryName) {
          skipped++;
          continue;
        }

        const categoryId = categoryMap.get(categoryName.toLowerCase());
        if (!categoryId) {
          skipped++;
          continue;
        }

        if (!product.categoryId || product.categoryId !== categoryId) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId },
          });
          updated++;
          categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
        }
      } catch (error) {
        console.error(`  Error processing product ${product.id}:`, error);
      }
    }
    
    // Progress update
    const processed = Math.min(i + batchSize, products.length);
    console.log(`  Progress: ${processed}/${products.length} products (${updated} updated, ${skipped} skipped)`);
  }

  // Step 4: Reassign products from deleted categories FIRST
  console.log('\nStep 4: Reassigning products from incorrect categories...');
  const allCategories = await prisma.category.findMany();
  const mainCategoryIds = Array.from(categoryMap.values());
  const categoriesToDelete = allCategories.filter(cat => !mainCategoryIds.includes(cat.id));
  
  console.log(`  Found ${categoriesToDelete.length} incorrect categories`);
  
  // Create or get Uncategorized category
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
    console.log('  Created Uncategorized category');
  }
  
  // Reassign all products from incorrect categories to Uncategorized
  let reassigned = 0;
  for (const category of categoriesToDelete) {
    try {
      const result = await prisma.product.updateMany({
        where: { categoryId: category.id },
        data: { categoryId: uncategorizedCategory.id },
      });
      reassigned += result.count;
    } catch (error) {
      console.error(`  Error reassigning from ${category.name}:`, error);
    }
  }
  console.log(`  Reassigned ${reassigned} products to Uncategorized`);

  // Step 5: Delete incorrect categories
  console.log('\nStep 5: Deleting incorrect categories...');
  let deleted = 0;
  for (const category of categoriesToDelete) {
    try {
      // Double-check no products reference this category
      const productCount = await prisma.product.count({
        where: { categoryId: category.id },
      });
      
      if (productCount > 0) {
        console.log(`  ⚠️  Skipping ${category.name} - still has ${productCount} products`);
        continue;
      }
      
      await prisma.category.delete({
        where: { id: category.id },
      });
      deleted++;
      if (deleted % 10 === 0) {
        console.log(`  Deleted ${deleted}/${categoriesToDelete.length} categories...`);
      }
    } catch (error) {
      console.error(`  Error deleting category ${category.name}:`, error);
    }
  }

  // Final summary
  console.log('\n✅ Category fix complete!');
  console.log(`\nSummary:`);
  console.log(`  - Products processed: ${products.length}`);
  console.log(`  - Products updated: ${updated}`);
  console.log(`  - Products skipped: ${skipped}`);
  console.log(`  - Incorrect categories deleted: ${deleted}`);
  console.log(`\nCategory distribution:`);
  for (const [name, count] of Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  - ${name}: ${count} products`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

