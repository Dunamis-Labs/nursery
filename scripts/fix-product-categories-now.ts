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
] as const;

function mapUrlToCategory(urlPath: string): string | null {
  if (!urlPath) return null;
  
  const pathParts = urlPath.toLowerCase().split('/').filter(p => p && p !== 'plant-finder');
  if (pathParts.length === 0) return null;
  
  const firstPart = pathParts[0].toLowerCase();
  
  const urlToCategoryMap: Record<string, string> = {
    'trees': 'Trees', 'tree': 'Trees',
    'shrubs': 'Shrubs', 'shrub': 'Shrubs',
    'grasses': 'Grasses', 'grass': 'Grasses', 'ornamental-grasses': 'Grasses',
    'hedging': 'Hedging and Screening', 'hedge': 'Hedging and Screening', 'screening': 'Hedging and Screening', 'hedging-and-screening': 'Hedging and Screening',
    'groundcovers': 'Groundcovers', 'groundcover': 'Groundcovers', 'ground-covers': 'Groundcovers',
    'climbers': 'Climbers', 'climber': 'Climbers', 'vines': 'Climbers', 'vine': 'Climbers',
    'palms': 'Palms, Ferns & Tropical', 'palm': 'Palms, Ferns & Tropical',
    'ferns': 'Palms, Ferns & Tropical', 'fern': 'Palms, Ferns & Tropical',
    'tropical': 'Palms, Ferns & Tropical', 'palms-ferns-and-tropical': 'Palms, Ferns & Tropical',
    'conifers': 'Conifers', 'conifer': 'Conifers',
    'roses': 'Roses', 'rose': 'Roses',
    'succulents': 'Succulents & Cacti', 'succulent': 'Succulents & Cacti',
    'cacti': 'Succulents & Cacti', 'cactus': 'Succulents & Cacti', 'succulents-and-cacti': 'Succulents & Cacti',
    'citrus': 'Citrus & Fruit', 'fruit': 'Citrus & Fruit', 'fruit-trees': 'Citrus & Fruit', 'citrus-and-fruit': 'Citrus & Fruit',
    'herbs': 'Herbs & Vegetables', 'herb': 'Herbs & Vegetables',
    'vegetables': 'Herbs & Vegetables', 'vegetable': 'Herbs & Vegetables', 'herbs-and-vegetables': 'Herbs & Vegetables',
    'water-plants': 'Water Plants', 'water-plant': 'Water Plants', 'aquatic': 'Water Plants', 'water-plants': 'Water Plants',
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
  console.log('🔧 Fixing product category assignments...\n');

  // Step 1: Ensure the 15 main categories exist
  console.log('Step 1: Ensuring 15 main categories exist...');
  const categoryMap = new Map<string, string>();
  for (const categoryName of PLANTMARK_CATEGORIES) {
    let category = await prisma.category.findFirst({
      where: { name: categoryName },
    });
    
    if (!category) {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug,
          description: `${categoryName} from Plantmark`,
        },
      });
      console.log(`  ✅ Created: ${categoryName}`);
    } else {
      console.log(`  ✓ Exists: ${categoryName}`);
    }
    
    categoryMap.set(categoryName.toLowerCase(), category.id);
  }

  // Step 2: Get all products with sourceUrl
  console.log('\nStep 2: Fetching products...');
  const products = await prisma.product.findMany({
    where: { sourceUrl: { not: null } },
    select: { id: true, name: true, sourceUrl: true, categoryId: true },
  });
  console.log(`  Found ${products.length} products with sourceUrl\n`);

  // Step 3: Fix category assignments
  console.log('Step 3: Fixing category assignments...');
  const batchSize = 100;
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
          console.error(`  ⚠️  Category not found: ${categoryName}`);
          skipped++;
          continue;
        }

        // Update if category is wrong or missing
        if (!product.categoryId || product.categoryId !== categoryId) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId },
          });
          updated++;
          categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
        } else {
          categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${product.name}:`, error instanceof Error ? error.message : String(error));
        skipped++;
      }
    }
    
    // Progress update
    const processed = Math.min(i + batchSize, products.length);
    if (processed % 500 === 0 || processed === products.length) {
      console.log(`  Progress: ${processed}/${products.length} (${updated} updated, ${skipped} skipped)`);
    }
  }

  // Step 4: Verify results
  console.log('\nStep 4: Verifying results...\n');
  for (const categoryName of PLANTMARK_CATEGORIES) {
    const categoryId = categoryMap.get(categoryName.toLowerCase());
    if (categoryId) {
      const count = await prisma.product.count({
        where: { categoryId },
      });
      console.log(`  ${categoryName.padEnd(30)} ${count.toString().padStart(4)} products`);
    }
  }

  console.log('\n✅ Done!');
  console.log(`  Total products processed: ${products.length}`);
  console.log(`  Products updated: ${updated}`);
  console.log(`  Products skipped: ${skipped}`);
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  process.exit(0);
});

