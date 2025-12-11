#!/usr/bin/env tsx
/**
 * Test Plantmark Scraper
 * 
 * Tests the Plantmark scraper to verify it can extract products correctly.
 * 
 * Usage:
 *   npm run test:scraper
 *   or
 *   tsx scripts/test-plantmark-scraper.ts
 */

import { PlantmarkScraper } from '../packages/data-import/src/services/PlantmarkScraper';

async function testScraper() {
  console.log('🧪 Testing Plantmark Scraper...\n');

  const scraper = new PlantmarkScraper({
    baseUrl: 'https://www.plantmark.com.au',
    rateLimitMs: 2000, // 2 seconds between requests
  });

  try {
    console.log('1. Initializing browser...');
    await scraper.initialize();
    console.log('✅ Browser initialized\n');

    console.log('2. Scraping products from /plant-finder...');
    console.log('   (This may take a moment...)\n');
    
    const result = await scraper.scrapeProducts(1, undefined);
    
    console.log(`✅ Scraped ${result.products.length} products\n`);
    console.log(`   Has more pages: ${result.hasMore}\n`);

    if (result.products.length === 0) {
      console.log('❌ No products found! Check the selectors.\n');
      return;
    }

    // Show first 3 products as examples
    console.log('📦 Sample Products (first 3):\n');
    result.products.slice(0, 3).forEach((product, index) => {
      console.log(`Product ${index + 1}:`);
      console.log(`  ID: ${product.id}`);
      console.log(`  Name: ${product.name}`);
      console.log(`  Source URL: ${product.sourceUrl}`);
      console.log(`  Price: ${product.price || 'N/A'}`);
      console.log(`  Botanical Name: ${product.botanicalName || 'N/A'}`);
      console.log(`  Common Name: ${product.commonName || 'N/A'}`);
      console.log(`  Image URL: ${product.imageUrl || 'N/A'}`);
      console.log(`  Description: ${product.description ? product.description.substring(0, 100) + '...' : 'N/A'}`);
      console.log('');
    });

    // Validate product structure
    console.log('🔍 Validating product structure...\n');
    const validationErrors: string[] = [];

    result.products.forEach((product, index) => {
      if (!product.id) {
        validationErrors.push(`Product ${index + 1}: Missing ID`);
      }
      if (!product.name) {
        validationErrors.push(`Product ${index + 1}: Missing name`);
      }
      if (!product.sourceUrl) {
        validationErrors.push(`Product ${index + 1}: Missing source URL`);
      }
    });

    if (validationErrors.length > 0) {
      console.log('❌ Validation errors found:\n');
      validationErrors.forEach(error => console.log(`  - ${error}`));
      console.log('');
    } else {
      console.log('✅ All products have required fields (id, name, sourceUrl)\n');
    }

    // Test product detail scraping
    if (result.products.length > 0) {
      const firstProduct = result.products[0];
      console.log(`3. Testing product detail scraping for: ${firstProduct.name}`);
      console.log(`   URL: ${firstProduct.sourceUrl}\n`);
      
      try {
        const detail = await scraper.scrapeProductDetail(firstProduct.sourceUrl);
        
        if (detail) {
          console.log('✅ Product detail scraped successfully:\n');
          console.log(`  Name: ${detail.name}`);
          console.log(`  Description: ${detail.description ? detail.description.substring(0, 150) + '...' : 'N/A'}`);
          console.log(`  Botanical Name: ${detail.botanicalName || 'N/A'}`);
          console.log(`  Common Name: ${detail.commonName || 'N/A'}`);
          console.log(`  Price: ${detail.price || 'N/A'}`);
          console.log(`  Images: ${detail.images ? detail.images.length : 0} found`);
          console.log('');
        } else {
          console.log('⚠️  Product detail page returned no data\n');
        }
      } catch (error) {
        console.log(`❌ Error scraping product detail: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      }
    }

    // Summary
    console.log('📊 Summary:\n');
    console.log(`  Total products scraped: ${result.products.length}`);
    console.log(`  Products with prices: ${result.products.filter(p => p.price).length}`);
    console.log(`  Products with images: ${result.products.filter(p => p.imageUrl).length}`);
    console.log(`  Products with botanical names: ${result.products.filter(p => p.botanicalName).length}`);
    console.log(`  Products with descriptions: ${result.products.filter(p => p.description).length}`);
    console.log(`  Has more pages: ${result.hasMore}`);
    console.log('');

    // Save sample to file
    const fs = await import('fs/promises');
    await fs.writeFile(
      'scripts/scraper-test-results.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalProducts: result.products.length,
        hasMore: result.hasMore,
        sampleProducts: result.products.slice(0, 5),
        allProducts: result.products,
      }, null, 2)
    );
    console.log('💾 Saved test results to scripts/scraper-test-results.json\n');

    console.log('✅ Scraper test completed successfully!\n');

  } catch (error) {
    console.error('❌ Scraper test failed:\n');
    console.error(error);
    process.exit(1);
  } finally {
    console.log('4. Closing browser...');
    await scraper.close();
    console.log('✅ Browser closed\n');
  }
}

if (require.main === module) {
  testScraper();
}

