#!/usr/bin/env tsx
/**
 * Full Plantmark Import Script
 * 
 * Imports all products from Plantmark's Plant Finder page,
 * including full details, images, pricing, and content.
 * 
 * Usage:
 *   npm run import:full
 *   or
 *   tsx scripts/full-plantmark-import.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { DataImportService } from '../packages/data-import/src/services/DataImportService';
import { PlantmarkScraper } from '../packages/data-import/src/services/PlantmarkScraper';
import { ScrapingJobType, ScrapingJobStatus } from '@nursery/db';

async function fullImport() {
  console.log('🌱 Starting Full Plantmark Import...\n');

  const importService = new DataImportService({
    baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
    useProxy: process.env.PLANTMARK_USE_PROXY === 'true',
    proxyUrl: process.env.PLANTMARK_PROXY_URL,
    rateLimitMs: parseInt(process.env.PLANTMARK_RATE_LIMIT_MS || '2000'),
  });

  try {
    // Step 1: Scrape all product URLs from plant-finder
    console.log('Step 1: Scraping product list from /plant-finder...\n');
    const scraper = new PlantmarkScraper({
      baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
      rateLimitMs: 2000,
    });

    await scraper.initialize();
    
    // Scrape all products from plant-finder (uses infinite scroll, not pagination)
    console.log('  Scraping all products (this may take a few minutes)...');
    const result = await scraper.scrapeProducts(1);
    
    // Extract product URLs
    const allProductUrls: Array<{ id: string; url: string; name: string }> = [];
    result.products.forEach(product => {
      if (product.sourceUrl) {
        allProductUrls.push({
          id: product.id,
          url: product.sourceUrl,
          name: product.name || 'Unknown',
        });
      }
    });

    console.log(`  Found ${result.products.length} products`);

    await scraper.close();
    console.log(`\n✅ Found ${allProductUrls.length} total products\n`);

    if (allProductUrls.length === 0) {
      console.log('❌ No products found. Exiting.');
      return;
    }

    // Step 2: Create import job
    console.log('Step 2: Creating import job...\n');
    const jobId = await importService.startImportJob({
      jobType: ScrapingJobType.FULL,
      useApi: false,
      maxProducts: allProductUrls.length,
    });

    console.log(`  Job ID: ${jobId}\n`);

    // Step 3: Scrape each product detail page and import
    console.log('Step 3: Scraping product details and importing...\n');
    
    const detailScraper = new PlantmarkScraper({
      baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
      rateLimitMs: 2000,
    });

    await detailScraper.initialize();

    let imported = 0;
    let errors = 0;
    const batchSize = 10; // Process in batches

    for (let i = 0; i < allProductUrls.length; i += batchSize) {
      const batch = allProductUrls.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allProductUrls.length / batchSize);

      console.log(`\n  Processing batch ${batchNum}/${totalBatches} (${batch.length} products)...`);

      for (const product of batch) {
        try {
          console.log(`    [${i + batch.indexOf(product) + 1}/${allProductUrls.length}] ${product.name}`);
          
          // Scrape product detail page
          const detail = await detailScraper.scrapeProductDetail(product.url);
          
          if (detail) {
            // Import the product
            const result = await importService['importProduct'](
              detail,
              jobId,
              { useApi: false }
            );

            if (result.created) {
              imported++;
              console.log(`      ✅ Created`);
            } else if (result.updated) {
              imported++;
              console.log(`      ✅ Updated`);
            }
          } else {
            console.log(`      ⚠️  No detail data found`);
            errors++;
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.log(`      ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errors++;
        }
      }

      // Update job progress
      const { prisma } = await import('@nursery/db');
      await prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          productsProcessed: i + batch.length,
          productsCreated: imported,
          productsUpdated: 0,
        },
      });
    }

    await detailScraper.close();

    // Step 4: Mark job as completed
    console.log('\nStep 4: Finalizing import job...\n');
    const { prisma } = await import('@nursery/db');
    await prisma.scrapingJob.update({
      where: { id: jobId },
      data: {
        status: ScrapingJobStatus.COMPLETED,
        completedAt: new Date(),
        productsProcessed: allProductUrls.length,
        productsCreated: imported,
        productsUpdated: 0,
      },
    });

    console.log('✅ Import completed!\n');
    console.log('📊 Summary:');
    console.log(`  Total products found: ${allProductUrls.length}`);
    console.log(`  Products imported: ${imported}`);
    console.log(`  Errors: ${errors}`);
    console.log(`  Job ID: ${jobId}\n`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  fullImport();
}

