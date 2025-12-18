import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

// Use non-pooling connection for scripts (prefer non-pooling URLs)
let databaseUrl = process.env.DATABASE_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL, DATABASE_URL_NON_POOLING, or POSTGRES_URL_NON_POOLING must be set');
}

// Check if URL uses pooler hostname
if (databaseUrl.includes('pooler.supabase.com')) {
  console.error('❌ ERROR: Connection URL uses pooler hostname (pooler.supabase.com)');
  console.error('   Scripts cannot use pooler connections. You need the DIRECT connection URL.');
  console.error('');
  console.error('   To fix this:');
  console.error('   1. Go to https://supabase.com/dashboard');
  console.error('   2. Select your project');
  console.error('   3. Settings → Database');
  console.error('   4. Scroll to "Connection string"');
  console.error('   5. Select "URI" (NOT Session mode)');
  console.error('   6. Copy the URL that has hostname: db.xxxxx.supabase.co (NOT pooler.supabase.com)');
  console.error('   7. Update DATABASE_URL_NON_POOLING in your .env file');
  console.error('');
  throw new Error('Cannot use pooler connection for scripts. Please update .env with direct connection URL.');
}

// Override DATABASE_URL in process.env BEFORE importing Prisma
process.env.DATABASE_URL = databaseUrl;

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: ['error', 'warn'],
});

/**
 * Extract category from Plantmark URL
 * Categories are in the URL path like: /trees/product-name or /shrubs/product-name
 */
function extractCategoryFromUrl(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  
  try {
    const url = new URL(sourceUrl);
    const pathParts = url.pathname.split('/').filter(p => p && p !== 'plant-finder');
    
    if (pathParts.length > 0) {
      const categorySlug = pathParts[0].toLowerCase();
      
      // Map common slugs to category names (matching Plantmark's structure)
      const categoryNameMap: Record<string, string> = {
        'trees': 'Trees',
        'shrubs': 'Shrubs',
        'perennials': 'Perennials',
        'annuals': 'Annuals',
        'succulents': 'Succulents',
        'palms': 'Palms',
        'grasses': 'Grasses',
        'ferns': 'Ferns',
        'climbers': 'Climbers',
        'groundcovers': 'Groundcovers',
        'ground-covers': 'Groundcovers',
        'indoor-plants': 'Indoor Plants',
        'indoor': 'Indoor Plants',
        'houseplants': 'Indoor Plants',
        'roses': 'Roses',
      };
      
      if (categoryNameMap[categorySlug]) {
        return categoryNameMap[categorySlug];
      }
      
      // Convert slug to readable name (e.g., "trees" -> "Trees", "indoor-plants" -> "Indoor Plants")
      return categorySlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  } catch (error) {
    console.error(`Error parsing URL ${sourceUrl}:`, error);
  }
  
  return null;
}

async function fixCategories() {
  console.log('🌱 Starting category fix (extracting from Plantmark URLs)...\n');

  // Get all products with sourceUrl
  const products = await prisma.product.findMany({
    where: {
      sourceUrl: { not: null },
    },
    include: {
      category: true,
    },
  });

  console.log(`Found ${products.length} products to process\n`);

  // Get or create categories
  const categoryMap = new Map<string, string>();
  const categories = await prisma.category.findMany();
  categories.forEach((cat) => {
    categoryMap.set(cat.name.toLowerCase(), cat.id);
  });

  // Process products in batches
  const batchSize = 50;
  let updated = 0;
  let created = 0;
  let skipped = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}...`);

    for (const product of batch) {
      try {
        // Extract category from URL only (no inference)
        const categoryName = extractCategoryFromUrl(product.sourceUrl);

        if (!categoryName) {
          skipped++;
          continue;
        }

        // Get or create category
        let categoryId = categoryMap.get(categoryName.toLowerCase());
        if (!categoryId) {
          const category = await prisma.category.create({
            data: {
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
              description: `${categoryName} plants`,
            },
          });
          categoryId = category.id;
          categoryMap.set(categoryName.toLowerCase(), categoryId);
          created++;
        }

        // Update product if category changed or if product has no category
        if (!product.categoryId || product.categoryId !== categoryId) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId },
          });
          updated++;
        }
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
      }
    }
  }

  // Get category breakdown
  const categoryBreakdown = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Get uncategorized count
  const uncategorizedCategory = await prisma.category.findFirst({
    where: { name: 'Uncategorized' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  console.log('\n✅ Category fix complete!\n');
  console.log('Summary:');
  console.log(`  Total products: ${products.length}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Categories created: ${created}`);
  console.log(`  Skipped (no category in URL): ${skipped}`);
  console.log(`  Uncategorized: ${uncategorizedCategory?._count.products || 0}\n`);

  console.log('Category Breakdown:');
  categoryBreakdown
    .filter((cat) => cat.name !== 'Uncategorized')
    .forEach((cat) => {
      console.log(`  ${cat.name}: ${cat._count.products} products`);
    });
}

fixCategories()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

