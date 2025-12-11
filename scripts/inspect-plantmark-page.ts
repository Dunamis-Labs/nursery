#!/usr/bin/env tsx
/**
 * Plantmark Page Inspector
 * 
 * Inspects the actual page structure and embedded data to understand
 * how Plantmark loads product information.
 */

import { chromium, Browser, Page } from 'playwright';

async function inspectPage() {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  // Monitor all network requests
  const requests: Array<{ url: string; method: string; type: string; headers: Record<string, string> }> = [];
  const responses: Array<{ url: string; status: number; contentType: string; body?: string }> = [];

  page.on('request', (request) => {
    requests.push({
      url: request.url(),
      method: request.method(),
      type: request.resourceType(),
      headers: request.headers(),
    });
  });

  page.on('response', async (response) => {
    const url = response.url();
    const contentType = response.headers()['content-type'] || '';
    
    let body: string | undefined;
    try {
      if (contentType.includes('application/json') || contentType.includes('text/')) {
        body = await response.text();
      }
    } catch {
      // Ignore errors reading body
    }

    responses.push({
      url,
      status: response.status(),
      contentType,
      body: body?.substring(0, 500), // First 500 chars
    });
  });

  console.log('🌱 Inspecting Plantmark Plant Finder page...\n');

  try {
    // Navigate directly to plant-finder page
    console.log('Loading plant-finder page: https://www.plantmark.com.au/plant-finder');
    await page.goto('https://www.plantmark.com.au/plant-finder', {
      waitUntil: 'domcontentloaded', // Less strict than networkidle
      timeout: 60000, // Increased timeout
    });
    
    console.log('Page loaded, waiting for content...');
    await page.waitForTimeout(5000); // Wait for dynamic content to load
    
    // Try to wait for specific elements that might indicate the page is ready
    try {
      await page.waitForSelector('body', { timeout: 10000 });
      console.log('Page content detected');
    } catch {
      console.log('Continuing despite timeout...');
    }

    // Check for embedded JSON data in page
    console.log('3. Checking for embedded data...');
    const embeddedData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/json"], script[type="application/ld+json"]'));
      const dataScripts = scripts.map(s => s.textContent);
      
      // Also check window.__INITIAL_STATE__ or similar
      const windowData: Record<string, unknown> = {};
      if ((window as any).__INITIAL_STATE__) {
        windowData.__INITIAL_STATE__ = (window as any).__INITIAL_STATE__;
      }
      if ((window as any).__NEXT_DATA__) {
        windowData.__NEXT_DATA__ = (window as any).__NEXT_DATA__;
      }
      if ((window as any).initialData) {
        windowData.initialData = (window as any).initialData;
      }

      return {
        jsonScripts: dataScripts,
        windowData,
      };
    });

    console.log('\n📊 Network Requests Summary:');
    console.log(`Total requests: ${requests.length}`);
    console.log(`JSON responses: ${responses.filter(r => r.contentType.includes('json')).length}`);
    
    // Show interesting requests
    console.log('\n🔍 Interesting Requests:');
    requests.forEach((req, i) => {
      if (req.url.includes('api') || req.url.includes('graphql') || req.url.includes('rest') || 
          req.url.includes('product') || req.url.includes('tree') || req.url.includes('data')) {
        console.log(`\n[${i}] ${req.method} ${req.url}`);
        console.log(`   Type: ${req.type}`);
      }
    });

    console.log('\n📦 JSON Responses:');
    responses.forEach((resp, i) => {
      if (resp.contentType.includes('json')) {
        console.log(`\n[${i}] ${resp.status} ${resp.url}`);
        if (resp.body) {
          console.log(`   Preview: ${resp.body.substring(0, 200)}...`);
        }
      }
    });

    console.log('\n📄 Embedded Data:');
    if (embeddedData.jsonScripts.length > 0) {
      console.log(`Found ${embeddedData.jsonScripts.length} JSON-LD scripts`);
      embeddedData.jsonScripts.forEach((data, i) => {
        console.log(`\nScript ${i + 1}:`);
        console.log(data?.substring(0, 300));
      });
    }

    if (Object.keys(embeddedData.windowData).length > 0) {
      console.log('\nWindow Data:');
      console.log(JSON.stringify(embeddedData.windowData, null, 2).substring(0, 500));
    }

    // Check page structure
    console.log('\n🏗️  Page Structure:');
    const structure = await page.evaluate(() => {
      // Look for various product-related selectors
      const productSelectors = [
        '[data-product]',
        '.product',
        '.product-item',
        '[class*="product"]',
        '[class*="plant"]',
        '[class*="item"]',
        '[data-plant]',
        '.plant-card',
        '.plant-item',
      ];
      
      let productElements: Element[] = [];
      productSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          productElements = productElements.concat(Array.from(elements));
        } catch {
          // Ignore invalid selectors
        }
      });
      
      const links = Array.from(document.querySelectorAll('a[href*="product"], a[href*="tree"], a[href*="plant"], a[href*="/p/"]')).slice(0, 10);
      
      // Check for search/filter inputs
      const searchInputs = Array.from(document.querySelectorAll('input[type="search"], input[placeholder*="search" i], input[name*="search" i]'));
      const filterElements = Array.from(document.querySelectorAll('[class*="filter"], [class*="category"], select'));
      
      return {
        productElementCount: productElements.length,
        productElementSample: productElements.length > 0 ? productElements[0].outerHTML.substring(0, 300) : null,
        productLinks: links.map(l => ({
          href: l.getAttribute('href'),
          text: l.textContent?.trim(),
        })),
        searchInputs: searchInputs.length,
        filterElements: filterElements.length,
        pageTitle: document.title,
        url: window.location.href,
      };
    });

    console.log(`Product elements found: ${structure.productElementCount}`);
    if (structure.productElementSample) {
      console.log(`Sample element: ${structure.productElementSample}...`);
    }
    console.log('Product links:', structure.productLinks);

    // Save detailed output
    const fs = await import('fs/promises');
    await fs.writeFile(
      'scripts/plantmark-inspection.json',
      JSON.stringify({
        requests: requests.slice(0, 50), // First 50 requests
        responses: responses.filter(r => r.contentType.includes('json')),
        embeddedData,
        structure,
      }, null, 2)
    );
    console.log('\n💾 Saved detailed inspection to scripts/plantmark-inspection.json');

  } catch (error) {
    console.error('Error during inspection:', error);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  inspectPage();
}

