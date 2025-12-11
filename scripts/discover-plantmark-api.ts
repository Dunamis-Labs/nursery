#!/usr/bin/env tsx
/**
 * Plantmark API Discovery Script
 * 
 * This script loads plantmark.com.au in a headless browser and monitors
 * network requests to discover API endpoints.
 * 
 * Usage:
 *   npm run discover:plantmark
 *   or
 *   tsx scripts/discover-plantmark-api.ts
 */

import { chromium, Browser, Page } from 'playwright';

interface DiscoveredEndpoint {
  url: string;
  method: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  responseBody?: unknown;
  status: number;
  type: 'xhr' | 'fetch' | 'document';
  timestamp: Date;
}

interface DiscoveredEndpoints {
  productList?: DiscoveredEndpoint;
  productDetail?: DiscoveredEndpoint;
  categories?: DiscoveredEndpoint;
  search?: DiscoveredEndpoint;
  filters?: DiscoveredEndpoint;
  all: DiscoveredEndpoint[];
}

async function discoverEndpoints(): Promise<DiscoveredEndpoints> {
  const browser: Browser = await chromium.launch({
    headless: false, // Set to true for production, false for debugging
  });

  const page: Page = await browser.newPage();
  const discovered: DiscoveredEndpoint[] = [];

  // Monitor all network requests
  page.on('response', async (response) => {
    const url = response.url();
    const request = response.request();
    const method = request.method();
    
    // Only track JSON responses or API-like endpoints
    const contentType = response.headers()['content-type'] || '';
    const isJson = contentType.includes('application/json');
    const isApiLike = url.includes('/api/') || 
                      url.includes('/graphql') ||
                      url.includes('/rest/') ||
                      isJson;

    if (isApiLike || isJson) {
      try {
        let responseBody: unknown = null;
        if (isJson) {
          try {
            responseBody = await response.json();
          } catch {
            // Not JSON, skip body
          }
        }

        const endpoint: DiscoveredEndpoint = {
          url,
          method,
          requestHeaders: request.headers(),
          responseHeaders: response.headers(),
          responseBody,
          status: response.status(),
          type: request.resourceType() as 'xhr' | 'fetch' | 'document',
          timestamp: new Date(),
        };

        discovered.push(endpoint);
        console.log(`\n[${endpoint.type.toUpperCase()}] ${method} ${url}`);
        console.log(`  Status: ${endpoint.status}`);
        if (endpoint.responseBody) {
          console.log(`  Response preview:`, JSON.stringify(endpoint.responseBody).substring(0, 200));
        }
      } catch (error) {
        console.error(`Error processing response ${url}:`, error);
      }
    }
  });

  console.log('🌱 Starting Plantmark API Discovery...\n');
  console.log('Navigating to plantmark.com.au...');

  try {
    // Navigate to main page
    await page.goto('https://www.plantmark.com.au', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('\n✅ Main page loaded. Monitoring network requests...\n');
    await page.waitForTimeout(3000); // Wait for initial requests

    // Navigate to products/trees page
    console.log('\n📦 Navigating to products page...');
    await page.goto('https://www.plantmark.com.au/trees', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    // Try interacting with filters/search
    console.log('\n🔍 Testing search functionality...');
    const searchInput = await page.$('input[type="search"], input[placeholder*="search" i], input[name*="search" i]');
    if (searchInput) {
      await searchInput.fill('tree');
      await page.waitForTimeout(2000);
    }

    // Try clicking on a product if available
    console.log('\n🖱️  Clicking on a product to see detail page requests...');
    const productLink = await page.$('a[href*="/product"], a[href*="/tree"], .product-item a, [data-product] a');
    if (productLink) {
      await productLink.click();
      await page.waitForTimeout(3000);
    }

    // Scroll to trigger lazy loading
    console.log('\n📜 Scrolling to trigger lazy loading...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);

  } catch (error) {
    console.error('Error during navigation:', error);
  } finally {
    await browser.close();
  }

  // Analyze discovered endpoints
  const analyzed = analyzeEndpoints(discovered);

  return analyzed;
}

function analyzeEndpoints(endpoints: DiscoveredEndpoint[]): DiscoveredEndpoints {
  const result: DiscoveredEndpoints = {
    all: endpoints,
  };

  // Look for product list endpoints
  const productListCandidates = endpoints.filter(
    (e) =>
      (e.url.includes('product') || e.url.includes('tree') || e.url.includes('item')) &&
      (e.method === 'GET' || e.method === 'POST') &&
      e.status === 200 &&
      e.responseBody &&
      typeof e.responseBody === 'object' &&
      (Array.isArray(e.responseBody) || 
       (e.responseBody as Record<string, unknown>).products ||
       (e.responseBody as Record<string, unknown>).items ||
       (e.responseBody as Record<string, unknown>).data)
  );

  if (productListCandidates.length > 0) {
    result.productList = productListCandidates[0];
    console.log('\n✅ Found product list endpoint:', result.productList.url);
  }

  // Look for category endpoints
  const categoryCandidates = endpoints.filter(
    (e) =>
      e.url.includes('categor') &&
      e.status === 200 &&
      e.responseBody &&
      typeof e.responseBody === 'object'
  );

  if (categoryCandidates.length > 0) {
    result.categories = categoryCandidates[0];
    console.log('✅ Found categories endpoint:', result.categories.url);
  }

  // Look for search endpoints
  const searchCandidates = endpoints.filter(
    (e) =>
      (e.url.includes('search') || e.url.includes('query')) &&
      e.status === 200 &&
      e.responseBody &&
      typeof e.responseBody === 'object'
  );

  if (searchCandidates.length > 0) {
    result.search = searchCandidates[0];
    console.log('✅ Found search endpoint:', result.search.url);
  }

  return result;
}

function generateApiClientCode(endpoints: DiscoveredEndpoints): string {
  let code = `// Auto-generated Plantmark API Client methods based on discovered endpoints\n\n`;

  if (endpoints.productList) {
    const url = endpoints.productList.url;
    code += `async getProducts(page: number = 1, pageSize: number = 50, category?: string): Promise<PlantmarkApiResponse> {
    await this.rateLimit();
    
    // Discovered endpoint: ${url}
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    ${category ? `if (category) params.append('category', category);` : ''}
    
    const response = await this.fetchWithProxy(\`${url}\`);
    return this.parseApiResponse(response);
  }\n\n`;
  }

  if (endpoints.search) {
    const url = endpoints.search.url;
    code += `async searchProducts(query: string, page: number = 1): Promise<PlantmarkApiResponse> {
    await this.rateLimit();
    
    // Discovered endpoint: ${url}
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
    });
    
    const response = await this.fetchWithProxy(\`${url}?\${params}\`);
    return this.parseApiResponse(response);
  }\n\n`;
  }

  return code;
}

async function main() {
  try {
    const endpoints = await discoverEndpoints();

    console.log('\n\n📊 Discovery Summary:');
    console.log(`Total API-like requests found: ${endpoints.all.length}`);
    console.log(`Product list endpoint: ${endpoints.productList?.url || 'Not found'}`);
    console.log(`Categories endpoint: ${endpoints.categories?.url || 'Not found'}`);
    console.log(`Search endpoint: ${endpoints.search?.url || 'Not found'}`);

    // Save discovered endpoints to JSON
    const fs = await import('fs/promises');
    await fs.writeFile(
      'scripts/plantmark-endpoints.json',
      JSON.stringify(endpoints, null, 2)
    );
    console.log('\n💾 Saved discovered endpoints to scripts/plantmark-endpoints.json');

    // Generate code suggestions
    if (endpoints.productList || endpoints.search) {
      const code = generateApiClientCode(endpoints);
      await fs.writeFile('scripts/plantmark-api-client-suggestions.ts', code);
      console.log('💡 Generated API client code suggestions in scripts/plantmark-api-client-suggestions.ts');
    }

    console.log('\n✅ Discovery complete!');
  } catch (error) {
    console.error('❌ Discovery failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

