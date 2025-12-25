import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = databaseUrl;

import { PrismaClient } from '@prisma/client';
// @ts-ignore - ES module import
import { PlantmarkScraper } from '../packages/data-import/src/services/PlantmarkScraper.ts';

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

/**
 * Map scraped category name to one of the 15 main categories
 */
function mapToMainCategory(scrapedCategory: string | null): string | null {
  if (!scrapedCategory) return null;
  
  const lower = scrapedCategory.toLowerCase().trim();
  
  // Direct matches
  const directMap: Record<string, string> = {
    'trees': 'Trees',
    'shrubs': 'Shrubs',
    'grasses': 'Grasses',
    'hedging': 'Hedging and Screening',
    'hedging and screening': 'Hedging and Screening',
    'screening': 'Hedging and Screening',
    'groundcovers': 'Groundcovers',
    'ground covers': 'Groundcovers',
    'ground-cover': 'Groundcovers',
    'climbers': 'Climbers',
    'vines': 'Climbers',
    'palms': 'Palms, Ferns & Tropical',
    'ferns': 'Palms, Ferns & Tropical',
    'tropical': 'Palms, Ferns & Tropical',
    'palms, ferns & tropical': 'Palms, Ferns & Tropical',
    'conifers': 'Conifers',
    'roses': 'Roses',
    'succulents': 'Succulents & Cacti',
    'cacti': 'Succulents & Cacti',
    'cactus': 'Succulents & Cacti',
    'succulents & cacti': 'Succulents & Cacti',
    'citrus': 'Citrus & Fruit',
    'fruit': 'Citrus & Fruit',
    'citrus & fruit': 'Citrus & Fruit',
    'herbs': 'Herbs & Vegetables',
    'vegetables': 'Herbs & Vegetables',
    'herbs & vegetables': 'Herbs & Vegetables',
    'water plants': 'Water Plants',
    'aquatic': 'Water Plants',
    'indoor plants': 'Indoor Plants',
    'indoor': 'Indoor Plants',
    'houseplants': 'Indoor Plants',
    'garden products': 'Garden Products',
    'products': 'Garden Products',
  };
  
  if (directMap[lower]) {
    return directMap[lower];
  }
  
  // Partial matches
  if (lower.includes('tree')) return 'Trees';
  if (lower.includes('shrub')) return 'Shrubs';
  if (lower.includes('grass')) return 'Grasses';
  if (lower.includes('hedg') || lower.includes('screen')) return 'Hedging and Screening';
  if (lower.includes('ground') || lower.includes('cover')) return 'Groundcovers';
  if (lower.includes('climb') || lower.includes('vine')) return 'Climbers';
  if (lower.includes('palm') || lower.includes('fern') || lower.includes('tropical')) return 'Palms, Ferns & Tropical';
  if (lower.includes('conifer')) return 'Conifers';
  if (lower.includes('rose')) return 'Roses';
  if (lower.includes('succulent') || lower.includes('cact')) return 'Succulents & Cacti';
  if (lower.includes('citrus') || lower.includes('fruit')) return 'Citrus & Fruit';
  if (lower.includes('herb') || lower.includes('vegetable')) return 'Herbs & Vegetables';
  if (lower.includes('water') || lower.includes('aquatic') || lower.includes('pond')) return 'Water Plants';
  if (lower.includes('indoor') || lower.includes('house')) return 'Indoor Plants';
  if (lower.includes('garden') || lower.includes('product')) return 'Garden Products';
  
  return null;
}

async function main() {
  console.log('🌱 Starting category re-scrape from product detail pages...\n');

  // Initialize scraper
  const scraper = new PlantmarkScraper({
    email: process.env.PLANTMARK_EMAIL,
    password: process.env.PLANTMARK_PASSWORD,
  });
  
  await scraper.initialize();
  console.log('✅ Scraper initialized\n');

  // Get or create the 15 main categories
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
    }
    
    categoryMap.set(categoryName.toLowerCase(), category.id);
  }

  // Get all products with sourceUrl
  const products = await prisma.product.findMany({
    where: {
      sourceUrl: { not: null },
    },
    select: {
      id: true,
      sourceUrl: true,
      name: true,
      categoryId: true,
    },
  });

  console.log(`Found ${products.length} products to process\n`);

  // Process products in batches
  const batchSize = 10; // Smaller batches to avoid rate limiting
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const categoryCounts = new Map<string, number>();

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    for (const product of batch) {
      try {
        if (!product.sourceUrl) {
          skipped++;
          continue;
        }

        // Scrape product detail page
        const scrapedProduct = await scraper.scrapeProductDetail(product.sourceUrl);
        
        if (!scrapedProduct) {
          console.log(`  ⚠️  Could not scrape: ${product.name}`);
          skipped++;
          continue;
        }

        // Extract category from scraped data
        const scrapedCategory = scrapedProduct.category || null;
        const mainCategory = mapToMainCategory(scrapedCategory);

        if (!mainCategory) {
          console.log(`  ⚠️  Could not map category "${scrapedCategory}" for: ${product.name}`);
          skipped++;
          continue;
        }

        // Get category ID
        const categoryId = categoryMap.get(mainCategory.toLowerCase());
        if (!categoryId) {
          console.log(`  ⚠️  Category not found: ${mainCategory}`);
          skipped++;
          continue;
        }

        // Update product if category changed
        if (!product.categoryId || product.categoryId !== categoryId) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId },
          });
          updated++;
          categoryCounts.set(mainCategory, (categoryCounts.get(mainCategory) || 0) + 1);
          console.log(`  ✅ ${product.name} -> ${mainCategory}`);
        } else {
          // Already correct
          categoryCounts.set(mainCategory, (categoryCounts.get(mainCategory) || 0) + 1);
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        errors++;
        console.error(`  ❌ Error processing ${product.name}:`, error instanceof Error ? error.message : String(error));
        // Wait a bit longer on error
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Progress update
    const processed = Math.min(i + batchSize, products.length);
    console.log(`\n📊 Progress: ${processed}/${products.length} products`);
    console.log(`   Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}\n`);
  }

  // Final summary
  console.log('\n✅ Category re-scrape complete!');
  console.log(`\nSummary:`);
  console.log(`  - Products processed: ${products.length}`);
  console.log(`  - Products updated: ${updated}`);
  console.log(`  - Products skipped: ${skipped}`);
  console.log(`  - Errors: ${errors}`);
  console.log(`\nCategory distribution:`);
  for (const [name, count] of Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])) {
    console.log(`  - ${name}: ${count} products`);
  }
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  process.exit(0);
});

