#!/usr/bin/env tsx
/**
 * Script to download images for existing products in the database
 * This will replace Plantmark URLs with local paths
 */

import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables FIRST, before importing Prisma
dotenv.config({ path: resolve(__dirname, '../.env') });

// Use non-pooling connection for scripts (prefer non-pooling URLs)
let databaseUrl = process.env.DATABASE_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL, DATABASE_URL_NON_POOLING, or POSTGRES_URL_NON_POOLING must be set');
}

// Check if URL uses pooler hostname and warn
if (databaseUrl.includes('pooler.supabase.com')) {
  console.warn('⚠️  WARNING: Connection URL uses pooler hostname (pooler.supabase.com)');
  console.warn('   This will not work for scripts. You need the DIRECT connection.');
  console.warn('   In Supabase: Settings → Database → Connection string → URI (not Session mode)');
  console.warn('   Hostname should be: db.xxxxx.supabase.co (NOT pooler.supabase.com)\n');
}

// Override DATABASE_URL in process.env BEFORE importing Prisma
process.env.DATABASE_URL = databaseUrl;

// Log which URL we're using (without password)
const urlForLogging = databaseUrl.replace(/:[^:@]+@/, ':****@');
// Extract port and hostname
let port = 'unknown';
let hostname = 'unknown';
try {
  const urlObj = new URL(databaseUrl);
  port = urlObj.port || (databaseUrl.startsWith('postgresql://') ? '5432' : 'unknown');
  hostname = urlObj.hostname;
} catch {
  // Fallback regex if URL parsing fails
  const portMatch = databaseUrl.match(/:(\d+)(?:\/|$)/);
  port = portMatch ? portMatch[1] : 'unknown';
  const hostMatch = databaseUrl.match(/@([^:]+)/);
  hostname = hostMatch ? hostMatch[1] : 'unknown';
}

console.log(`📡 Using database connection:`);
console.log(`   Hostname: ${hostname}`);
console.log(`   Port: ${port}`);
if (port === '6543' || hostname.includes('pooler')) {
  console.warn('⚠️  WARNING: Using pooler connection - this will fail!');
  console.warn('   Use direct connection: db.xxxxx.supabase.co:5432\n');
} else if (port === '5432' && !hostname.includes('pooler')) {
  console.log('✅ Using direct connection\n');
} else {
  console.log('');
}

// Import Prisma AFTER setting DATABASE_URL
import { PrismaClient } from '@prisma/client';
import { ImageDownloadService } from '../packages/data-import/src/services/ImageDownloadService';

// Create Prisma client - it will use DATABASE_URL from process.env
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function downloadProductImages() {
  console.log('🖼️  Starting image download for existing products...\n');

  const imageDownloader = new ImageDownloadService({
    baseUrl: '/products/',
  });

  // Get all products with Plantmark images (with retry logic)
  let products;
  let retries = 3;
  while (retries > 0) {
    try {
      products = await prisma.product.findMany({
        where: {
          OR: [
            {
              imageUrl: {
                contains: 'plantmark.com.au',
              },
            },
            {
              images: {
                path: ['$'],
                array_contains: ['plantmark.com.au'],
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          images: true,
        },
      });
      break; // Success
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('\n❌ Database connection failed after retries');
        console.error('   Make sure DATABASE_URL in .env uses direct connection (port 5432)');
        console.error('   Not the pooler connection (port 6543)');
        throw error;
      }
      console.log(`⚠️  Connection error, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (!products) {
    throw new Error('Failed to fetch products after retries');
  }

  console.log(`Found ${products.length} products with Plantmark images\n`);

  let successCount = 0;
  let errorCount = 0;
  let consecutiveFailures = 0;
  const MAX_CONSECUTIVE_FAILURES = 5; // Stop if too many failures in a row

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Add delay between products to avoid rate limiting (except for first product)
    if (i > 0) {
      const delay = consecutiveFailures > 0 ? 3000 : 1000; // Longer delay if failures
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      console.log(`Processing: ${product.name} (${product.slug}) [${i + 1}/${products.length}]`);

      let newImageUrl = product.imageUrl;
      let newImages: string[] = [];

      // Download main image
      if (product.imageUrl && product.imageUrl.includes('plantmark.com.au')) {
        const result = await imageDownloader.downloadImage(product.imageUrl, product.slug);
        if (result.success && result.localPath) {
          newImageUrl = result.localPath;
          console.log(`  ✓ Downloaded main image: ${result.localPath}`);
          consecutiveFailures = 0; // Reset on success
        } else {
          console.log(`  ✗ Failed to download main image: ${result.error}`);
          consecutiveFailures++;
          
          // If too many consecutive failures, wait longer before continuing
          if (consecutiveFailures >= 3) {
            console.log(`  ⏸️  Rate limiting detected, waiting 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }

      // Download additional images
      if (product.images) {
        const imageArray = Array.isArray(product.images) ? product.images : [];
        const plantmarkImages = imageArray.filter(
          (url: unknown) => typeof url === 'string' && url.includes('plantmark.com.au')
        );

        if (plantmarkImages.length > 0) {
          const result = await imageDownloader.downloadImages(plantmarkImages, product.slug);
          newImages = result.downloaded;
          
          // Keep non-Plantmark images
          const otherImages = imageArray.filter(
            (url: unknown) => typeof url === 'string' && !url.includes('plantmark.com.au')
          );
          newImages = [...newImages, ...otherImages];

          console.log(`  ✓ Downloaded ${result.downloaded.length} additional images`);
          if (result.failed.length > 0) {
            console.log(`  ✗ Failed to download ${result.failed.length} images`);
          }
        } else {
          newImages = imageArray as string[];
        }
      }

      // Update product in database (with retry)
      let updateRetries = 3;
      while (updateRetries > 0) {
        try {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              imageUrl: newImageUrl,
              images: newImages.length > 0 ? (newImages as any) : undefined,
            },
          });
          break; // Success
        } catch (error) {
          updateRetries--;
          if (updateRetries === 0) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      successCount++;
      consecutiveFailures = 0; // Reset on success
      console.log(`  ✅ Updated product\n`);
      
      // Stop if too many consecutive failures (likely rate limited)
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        console.log(`\n⚠️  Stopping due to ${consecutiveFailures} consecutive failures (likely rate limited)`);
        console.log(`   Processed ${i + 1}/${products.length} products before stopping`);
        console.log(`   You can run the script again to continue from where it left off`);
        break;
      }
    } catch (error) {
      errorCount++;
      consecutiveFailures++;
      console.error(`  ❌ Error processing product:`, error instanceof Error ? error.message : error);
      console.log('');
      
      // Stop if too many consecutive failures
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        console.log(`\n⚠️  Stopping due to ${consecutiveFailures} consecutive failures`);
        break;
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  ✅ Successfully processed: ${successCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📦 Total products: ${products.length}`);
}

// Run the script
downloadProductImages()
  .then(async () => {
    console.log('\n✨ Image download complete!');
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n💥 Fatal error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });

