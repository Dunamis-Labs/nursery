#!/usr/bin/env tsx
/**
 * Show Example Product Data
 * 
 * This script scrapes a single product from Plantmark and displays
 * the data structure we extract and store.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PlantmarkScraper } from '../packages/data-import/src/services/PlantmarkScraper';

async function showProductExample() {
  console.log('🌱 Fetching example product data from Plantmark...\n');

  const scraper = new PlantmarkScraper({
    baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
    rateLimitMs: 2000,
  });

  try {
    await scraper.initialize();
    
    // Scrape the first product from the plant finder page
    console.log('Scraping product list...');
    const result = await scraper.scrapeProducts(1);
    
    if (result.products.length === 0) {
      console.log('❌ No products found');
      await scraper.close();
      return;
    }

    const firstProduct = result.products[0];
    
    console.log('\n📦 Example Product Data Structure:\n');
    console.log('═'.repeat(80));
    console.log(JSON.stringify(firstProduct, null, 2));
    console.log('═'.repeat(80));
    
    console.log('\n📋 Formatted View:\n');
    console.log(`ID: ${firstProduct.id}`);
    console.log(`Name: ${firstProduct.name}`);
    console.log(`Slug: ${firstProduct.slug || 'N/A'}`);
    console.log(`Description: ${firstProduct.description ? firstProduct.description.substring(0, 100) + '...' : 'N/A'}`);
    console.log(`Botanical Name: ${firstProduct.botanicalName || 'N/A'}`);
    console.log(`Common Name: ${firstProduct.commonName || 'N/A'}`);
    console.log(`Price: ${firstProduct.price ? `$${firstProduct.price.toFixed(2)}` : 'N/A'}`);
    console.log(`Availability: ${firstProduct.availability || 'N/A'}`);
    console.log(`Category: ${firstProduct.category || 'N/A'}`);
    console.log(`Image URL: ${firstProduct.imageUrl || 'N/A'}`);
    console.log(`Images (${firstProduct.images?.length || 0}):`, firstProduct.images || []);
    console.log(`Source URL: ${firstProduct.sourceUrl}`);
    console.log(`Source ID: ${firstProduct.sourceId || 'N/A'}`);
    console.log(`Metadata:`, firstProduct.metadata ? JSON.stringify(firstProduct.metadata, null, 2) : 'N/A');
    
    // If we have a source URL, try to get more details
    if (firstProduct.sourceUrl) {
      console.log('\n🔍 Fetching detailed product information...\n');
      const detail = await scraper.scrapeProductDetail(firstProduct.sourceUrl);
      
      if (detail) {
        console.log('📦 Detailed Product Data:\n');
        console.log('═'.repeat(80));
        console.log(JSON.stringify(detail, null, 2));
        console.log('═'.repeat(80));
      }
    }

    await scraper.close();
    
    console.log('\n✅ Example complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await scraper.close();
    process.exit(1);
  }
}

showProductExample();

