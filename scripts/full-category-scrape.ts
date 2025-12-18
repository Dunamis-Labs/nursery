import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { DataImportService } from '../packages/data-import/src/services/DataImportService';
import { ScrapingJobType } from '@nursery/db';

/**
 * Full category scrape - Scrapes all products from each category individually
 * to ensure we capture everything, including products that might be missed
 * in the general plant-finder scrape.
 */
async function fullCategoryScrape() {
  console.log('🌿 Starting Full Category Scrape\n');

  // Known Plantmark categories (based on common nursery categories)
  const categories = [
    'trees',
    'shrubs',
    'indoor-plants',
    'outdoor-plants',
    'succulents',
    'perennials',
    'groundcovers',
    'climbers',
    'palms',
    'grasses',
    'herbs-vegetables',
    'roses',
    'ferns',
    'pots-planters',
    'hedging-screening',
    'native-plants',
    'tropical-plants',
    'flowering-plants',
    'foliage-plants',
  ];

  const importService = new DataImportService({
    baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
    useProxy: process.env.PLANTMARK_USE_PROXY === 'true',
    proxyUrl: process.env.PLANTMARK_PROXY_URL,
    rateLimitMs: parseInt(process.env.PLANTMARK_RATE_LIMIT_MS || '2000'),
    email: process.env.PLANTMARK_EMAIL?.replace(/^"|"$/g, ''),
    password: process.env.PLANTMARK_PASSWORD?.replace(/^"|"$/g, ''),
  });

  const results: Array<{ category: string; products: number; created: number; updated: number }> = [];

  for (const category of categories) {
    try {
      console.log(`\n📁 Scraping category: ${category}`);
      console.log('─'.repeat(50));

      // Create job for this category
      const jobId = await importService.startImportJob({
        jobType: ScrapingJobType.FULL,
        useApi: false,
        category,
        maxProducts: 10000, // High limit per category
      });

      // Execute import
      const result = await importService.executeImport(jobId, {
        jobType: ScrapingJobType.FULL,
        useApi: false,
        category,
        maxProducts: 10000,
      });

      results.push({
        category,
        products: result.created + result.updated,
        created: result.created,
        updated: result.updated,
      });

      console.log(`✅ ${category}: ${result.created} created, ${result.updated} updated`);

      // Rate limit between categories
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`❌ Error scraping ${category}:`, error instanceof Error ? error.message : error);
      results.push({
        category,
        products: 0,
        created: 0,
        updated: 0,
      });
    }
  }

  // Summary
  console.log('\n\n📊 Scrape Summary:');
  console.log('═'.repeat(50));
  results.forEach(r => {
    console.log(`${r.category.padEnd(25)}: ${r.products.toString().padStart(5)} products (${r.created} new, ${r.updated} updated)`);
  });

  const totalProducts = results.reduce((sum, r) => sum + r.products, 0);
  const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);

  console.log('═'.repeat(50));
  console.log(`Total: ${totalProducts} products processed`);
  console.log(`  Created: ${totalCreated}`);
  console.log(`  Updated: ${totalUpdated}`);

  await importService.scraper.close();
}

fullCategoryScrape().catch(console.error);

