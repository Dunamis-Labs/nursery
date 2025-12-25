#!/usr/bin/env tsx
/**
 * Re-scrape All Plantmark Products Script
 * 
 * This script:
 * 1. Scrapes all products from Plantmark's plant-finder page
 * 2. For each product:
 *    - Ensures it exists in the database (creates if missing, updates if exists)
 *    - Downloads all images (main image + additional images)
 *    - Verifies images are stored locally
 * 
 * Usage:
 *   npx tsx scripts/rescrape-all-plantmark-products.ts
 * 
 * Environment Variables:
 *   - DATABASE_URL: Database connection string
 *   - PLANTMARK_BASE_URL: Base URL for Plantmark (default: https://www.plantmark.com.au)
 *   - PLANTMARK_RATE_LIMIT_MS: Rate limit between requests (default: 2000ms)
 *   - SKIP_EXISTING: Skip products that already exist in database (default: false)
 *   - TEST_MODE: Process only first 5 products for testing (default: false)
 */

// Load environment variables FIRST
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { DataImportService } from '../packages/data-import/src/services/DataImportService';
import { PlantmarkScraper } from '../packages/data-import/src/services/PlantmarkScraper';
import { ImageDownloadService } from '../packages/data-import/src/services/ImageDownloadService';
import { prisma } from '@nursery/db';
import { ScrapingJobType, ScrapingJobStatus } from '@nursery/db';
import { existsSync } from 'fs';
import { join } from 'path';

interface ProductUrl {
  id: string;
  url: string;
  name: string;
}

async function main() {
  console.log('🌱 Starting Re-scrape of All Plantmark Products...\n');

  // Configuration
  const TEST_MODE = process.env.TEST_MODE === 'true';
  const SKIP_EXISTING = process.env.SKIP_EXISTING === 'true';
  const baseUrl = process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au';
  const rateLimitMs = parseInt(process.env.PLANTMARK_RATE_LIMIT_MS || '2000');

  // Initialize services
  const importService = new DataImportService({
    baseUrl,
    useProxy: process.env.PLANTMARK_USE_PROXY === 'true',
    proxyUrl: process.env.PLANTMARK_PROXY_URL,
    rateLimitMs,
  });

  const imageDownloader = new ImageDownloadService({
    baseUrl: '/products/',
    outputDir: join(process.cwd(), 'apps', 'web', 'public', 'products'),
  });

  try {
    // Step 1: Scrape all product URLs from plant-finder
    console.log('📋 Step 1: Scraping product list from /plant-finder...\n');
    const scraper = new PlantmarkScraper({
      baseUrl,
      rateLimitMs,
    });

    await scraper.initialize();
    
    console.log('  Scraping all products (this may take a few minutes)...');
    const result = await scraper.scrapeProducts(1);
    
    // Extract product URLs
    const allProductUrls: ProductUrl[] = [];
    result.products.forEach(product => {
      if (product.sourceUrl) {
        allProductUrls.push({
          id: product.id,
          url: product.sourceUrl,
          name: product.name || 'Unknown',
        });
      }
    });

    await scraper.close();
    console.log(`  ✅ Found ${allProductUrls.length} products\n`);

    if (allProductUrls.length === 0) {
      console.log('❌ No products found. Exiting.');
      return;
    }

    // Limit products in test mode
    const productsToProcess = TEST_MODE 
      ? allProductUrls.slice(0, 5)
      : allProductUrls;

    if (TEST_MODE) {
      console.log(`⚠️  TEST_MODE enabled: Processing only ${productsToProcess.length} products\n`);
    }

    // Step 2: Create import job
    console.log('📝 Step 2: Creating import job...\n');
    const jobId = await importService.startImportJob({
      jobType: ScrapingJobType.FULL,
      useApi: false,
      maxProducts: productsToProcess.length,
    });
    console.log(`  Job ID: ${jobId}\n`);

    // Step 3: Process each product
    console.log('🔄 Step 3: Processing products...\n');
    
    const detailScraper = new PlantmarkScraper({
      baseUrl,
      rateLimitMs,
    });

    await detailScraper.initialize();

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    let imagesDownloaded = 0;
    let imagesFixed = 0;

    for (let i = 0; i < productsToProcess.length; i++) {
      const productUrl = productsToProcess[i];
      const progress = `[${i + 1}/${productsToProcess.length}]`;
      
      try {
        console.log(`\n${progress} Processing: ${productUrl.name}`);
        console.log(`  URL: ${productUrl.url}`);

        // Check if product already exists
        const existing = await prisma.product.findFirst({
          where: {
            OR: [
              { sourceId: productUrl.id },
              { sourceUrl: productUrl.url },
            ],
          },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            images: true,
            slug: true,
          },
        });

        if (SKIP_EXISTING && existing) {
          console.log(`  ⏭️  Skipping (already exists)`);
          skipped++;
          continue;
        }

        // Scrape product detail page
        console.log(`  📥 Scraping product details...`);
        const detail = await detailScraper.scrapeProductDetail(productUrl.url);
        
        if (!detail) {
          console.log(`  ⚠️  No detail data found`);
          errors++;
          continue;
        }

        // Import/update the product (this handles image downloads)
        console.log(`  💾 Importing/updating product...`);
        const importResult = await importService['importProduct'](
          detail,
          jobId,
          { useApi: false }
        );

        if (importResult.created) {
          created++;
          console.log(`  ✅ Created`);
        } else if (importResult.updated) {
          updated++;
          console.log(`  ✅ Updated`);
        }

        // Verify and fix images
        const product = await prisma.product.findFirst({
          where: {
            OR: [
              { sourceId: productUrl.id },
              { sourceUrl: productUrl.url },
            ],
          },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            images: true,
            slug: true,
          },
        });

        if (!product) {
          console.log(`  ⚠️  Product not found after import`);
          continue;
        }

        // Check main image
        let needsImageFix = false;
        let newImageUrl = product.imageUrl;
        let newImages = Array.isArray(product.images) ? product.images : [];

        // Check if main image exists locally
        if (product.imageUrl) {
          if (product.imageUrl.includes('plantmark.com.au')) {
            // Still has Plantmark URL, needs download
            console.log(`  📥 Downloading main image...`);
            const imageResult = await imageDownloader.downloadImage(
              product.imageUrl,
              product.slug
            );
            if (imageResult.success && imageResult.localPath) {
              newImageUrl = imageResult.localPath;
              imagesDownloaded++;
              needsImageFix = true;
              console.log(`  ✅ Main image downloaded: ${imageResult.localPath}`);
            } else {
              console.log(`  ⚠️  Main image download failed: ${imageResult.error}`);
            }
          } else if (product.imageUrl.startsWith('/products/')) {
            // Check if local file exists
            const filename = product.imageUrl.replace('/products/', '');
            const filePath = join(process.cwd(), 'apps', 'web', 'public', 'products', filename);
            if (!existsSync(filePath)) {
              console.log(`  ⚠️  Main image file missing: ${product.imageUrl}`);
              // Try to re-download if we have the original URL in metadata
              const productWithMeta = await prisma.product.findUnique({
                where: { id: product.id },
                select: { metadata: true },
              });
              // Could try to extract original URL from metadata, but for now just mark as needs fix
              needsImageFix = true;
            }
          }
        } else {
          // No main image - try to download from detail if available
          if (detail.imageUrl) {
            console.log(`  📥 Downloading missing main image...`);
            const imageResult = await imageDownloader.downloadImage(
              detail.imageUrl,
              product.slug
            );
            if (imageResult.success && imageResult.localPath) {
              newImageUrl = imageResult.localPath;
              imagesDownloaded++;
              needsImageFix = true;
              console.log(`  ✅ Main image downloaded: ${imageResult.localPath}`);
            }
          }
        }

        // Check additional images
        const imageArray = Array.isArray(product.images) ? product.images : [];
        const plantmarkImages = imageArray.filter(
          (url: unknown) => typeof url === 'string' && url.includes('plantmark.com.au')
        );

        if (plantmarkImages.length > 0) {
          console.log(`  📥 Downloading ${plantmarkImages.length} additional images...`);
          const result = await imageDownloader.downloadImages(plantmarkImages, product.slug);
          
          if (result.downloaded.length > 0) {
            imagesDownloaded += result.downloaded.length;
            needsImageFix = true;
            
            // Combine downloaded images with non-Plantmark images
            const otherImages = imageArray.filter(
              (url: unknown) => typeof url === 'string' && !url.includes('plantmark.com.au')
            );
            newImages = [...result.downloaded, ...otherImages];
            
            console.log(`  ✅ Downloaded ${result.downloaded.length} additional images`);
          }
          
          if (result.failed.length > 0) {
            console.log(`  ⚠️  Failed to download ${result.failed.length} images`);
          }
        }

        // Verify all local images exist
        const verifiedImages: string[] = [];
        for (const imgUrl of newImages) {
          if (typeof imgUrl === 'string') {
            if (imgUrl.startsWith('/products/')) {
              const filename = imgUrl.replace('/products/', '');
              const filePath = join(process.cwd(), 'apps', 'web', 'public', 'products', filename);
              if (existsSync(filePath)) {
                verifiedImages.push(imgUrl);
              } else {
                console.log(`  ⚠️  Image file missing: ${imgUrl}`);
              }
            } else {
              // Keep non-local URLs
              verifiedImages.push(imgUrl);
            }
          }
        }
        newImages = verifiedImages;

        // Update product if images were fixed
        if (needsImageFix) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              imageUrl: newImageUrl,
              images: newImages.length > 0 ? (newImages as any) : undefined,
            },
          });
          imagesFixed++;
          console.log(`  ✅ Images updated in database`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, rateLimitMs));

      } catch (error) {
        console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        if (error instanceof Error && error.stack) {
          console.log(`     Stack: ${error.stack.split('\n')[0]}`);
        }
        errors++;
      }
    }

    await detailScraper.close();

    // Step 4: Mark job as completed
    console.log('\n📊 Step 4: Finalizing import job...\n');
    await prisma.scrapingJob.update({
      where: { id: jobId },
      data: {
        status: ScrapingJobStatus.COMPLETED,
        completedAt: new Date(),
        productsProcessed: productsToProcess.length,
        productsCreated: created,
        productsUpdated: updated,
      },
    });

    // Final summary
    console.log('\n✅ Re-scrape completed!\n');
    console.log('📊 Summary:');
    console.log(`  Total products found: ${allProductUrls.length}`);
    console.log(`  Products processed: ${productsToProcess.length}`);
    console.log(`  Products created: ${created}`);
    console.log(`  Products updated: ${updated}`);
    console.log(`  Products skipped: ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log(`  Images downloaded: ${imagesDownloaded}`);
    console.log(`  Products with images fixed: ${imagesFixed}`);
    console.log(`  Job ID: ${jobId}\n`);

  } catch (error) {
    console.error('❌ Re-scrape failed:', error);
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

