import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { PlantmarkScraper } from '../packages/data-import/src/services/PlantmarkScraper';

async function testCategoryExtraction() {
  console.log('🧪 Testing Category Extraction from Plantmark\n');

  const scraper = new PlantmarkScraper({
    baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
    rateLimitMs: 2000,
    email: process.env.PLANTMARK_EMAIL?.replace(/^"|"$/g, ''),
    password: process.env.PLANTMARK_PASSWORD?.replace(/^"|"$/g, ''),
  });

  try {
    await scraper.initialize();
    console.log('✅ Browser initialized\n');

    // Test 1: Scrape products from a specific category page
    console.log('📋 Test 1: Scraping products from "Trees" category page...\n');
    const treesResult = await scraper.scrapeProducts(1, 'trees');
    
    console.log(`Found ${treesResult.products.length} products\n`);
    
    if (treesResult.products.length > 0) {
      console.log('Sample products with categories:');
      treesResult.products.slice(0, 5).forEach((product, i) => {
        console.log(`\n${i + 1}. ${product.name}`);
        if (product.botanicalName) {
          console.log(`   Botanical: ${product.botanicalName}`);
        }
        console.log(`   Category: ${product.category || '(not extracted)'}`);
        console.log(`   URL: ${product.sourceUrl}`);
      });
    }

    // Test 2: Scrape a specific product detail page
    if (treesResult.products.length > 0) {
      const testProduct = treesResult.products[0];
      console.log(`\n\n📋 Test 2: Scraping product detail page...\n`);
      console.log(`Product: ${testProduct.name}`);
      console.log(`URL: ${testProduct.sourceUrl}\n`);
      
      const detailResult = await scraper.scrapeProductDetail(testProduct.sourceUrl);
      
      if (detailResult) {
        console.log('✅ Product detail scraped successfully:');
        console.log(`   Name: ${detailResult.name}`);
        console.log(`   Botanical: ${detailResult.botanicalName || 'N/A'}`);
        console.log(`   Category: ${detailResult.category || '(not extracted)'}`);
        console.log(`   Price: ${detailResult.price ? `$${detailResult.price}` : 'N/A'}`);
        console.log(`   Variants: ${detailResult.variants?.length || 0}`);
      } else {
        console.log('❌ Failed to scrape product detail');
      }
    }

    // Test 3: Try another category
    console.log(`\n\n📋 Test 3: Scraping products from "Shrubs" category page...\n`);
    const shrubsResult = await scraper.scrapeProducts(1, 'shrubs');
    
    console.log(`Found ${shrubsResult.products.length} products\n`);
    
    if (shrubsResult.products.length > 0) {
      console.log('Sample products with categories:');
      shrubsResult.products.slice(0, 3).forEach((product, i) => {
        console.log(`\n${i + 1}. ${product.name}`);
        console.log(`   Category: ${product.category || '(not extracted)'}`);
      });
    }

    // Summary
    console.log(`\n\n📊 Summary:\n`);
    const allProducts = [...treesResult.products, ...shrubsResult.products];
    const withCategory = allProducts.filter(p => p.category).length;
    const withoutCategory = allProducts.length - withCategory;
    
    console.log(`Total products scraped: ${allProducts.length}`);
    console.log(`With category: ${withCategory} (${Math.round(withCategory / allProducts.length * 100)}%)`);
    console.log(`Without category: ${withoutCategory} (${Math.round(withoutCategory / allProducts.length * 100)}%)`);
    
    if (withCategory > 0) {
      const categories = new Set(allProducts.filter(p => p.category).map(p => p.category));
      console.log(`\nCategories found: ${Array.from(categories).join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error('\nStack:', error.stack);
    }
  } finally {
    await scraper.close();
    console.log('\n✅ Test completed');
  }
}

testCategoryExtraction();

