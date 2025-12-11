import type { PlantmarkProduct, PlantmarkApiConfig } from '../types';

/**
 * Plantmark Web Scraper
 * 
 * FALLBACK METHOD: Uses web scraping if Plantmark API is not available.
 * Requires Puppeteer or Playwright for browser automation.
 * 
 * Note: This requires an Australian IP address to access plantmark.com.au
 */
export class PlantmarkScraper {
  private config: Required<PlantmarkApiConfig>;
  private lastRequestTime: number = 0;
  private browser: any = null; // Puppeteer.Browser or Playwright.Browser

  constructor(config: PlantmarkApiConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://www.plantmark.com.au',
      apiKey: config.apiKey || '',
      useProxy: config.useProxy || false,
      proxyUrl: config.proxyUrl || '',
      rateLimitMs: config.rateLimitMs || 2000, // Default: 1 request per 2 seconds
    };
  }

  /**
   * Initialize browser (Puppeteer or Playwright)
   */
  async initialize(): Promise<void> {
    // Try Puppeteer first, fallback to Playwright
    try {
      const puppeteer = await import('puppeteer');
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    } catch (error) {
      try {
        const { chromium } = await import('playwright');
        this.browser = await chromium.launch({
          headless: true,
        });
      } catch (playwrightError) {
        throw new Error(
          'Neither Puppeteer nor Playwright is available. ' +
          'Install one: npm install puppeteer or npm install playwright'
        );
      }
    }
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      if (this.browser.close) {
        await this.browser.close();
      } else if (this.browser.close) {
        await this.browser.close();
      }
      this.browser = null;
    }
  }

  /**
   * Scrape product listing page
   */
  async scrapeProducts(
    page: number = 1,
    category?: string
  ): Promise<{ products: PlantmarkProduct[]; hasMore: boolean }> {
    await this.rateLimit();

    if (!this.browser) {
      await this.initialize();
    }

    const url = this.buildProductListUrl(page, category);
    const pageInstance = await this.browser.newPage();

    try {
      // Set viewport and user agent
      await pageInstance.setViewport({ width: 1920, height: 1080 });
      await pageInstance.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      );

      // Navigate to page
      await pageInstance.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for product list to load
      await pageInstance.waitForSelector('.product-item, [data-product], .product-card', {
        timeout: 10000,
      });

      // Extract product data based on actual Plantmark structure
      const products = await pageInstance.evaluate(() => {
        // Plantmark uses: <div class="_ProductBoxWithLocation product-item product-attributes" data-productid="6697">
        const productElements = document.querySelectorAll('div[data-productid], .product-item[data-productid], ._ProductBoxWithLocation');
        const scrapedProducts: PlantmarkProduct[] = [];

        productElements.forEach((element) => {
          const productId = element.getAttribute('data-productid');
          if (!productId) return;

          // Find product name - usually in a link or heading
          const nameEl = element.querySelector('a[href*="/"], h2, h3, .product-name, [class*="name"]');
          const linkEl = element.querySelector('a[href*="/"]');
          const imageEl = element.querySelector('img');
          
          // Try to find price - might be in various formats
          const priceEl = element.querySelector('.price, [class*="price"], [data-price]');
          
          // Try to find botanical/common names
          const botanicalEl = element.querySelector('[class*="botanical"], [data-botanical]');
          const commonEl = element.querySelector('[class*="common"], [data-common]');
          
          // Try to find description
          const descEl = element.querySelector('.description, [class*="desc"], p');

          if (nameEl) {
            const name = nameEl.textContent?.trim() || '';
            const href = linkEl?.getAttribute('href') || '';
            const fullUrl = href.startsWith('http') ? href : `https://www.plantmark.com.au${href}`;
            
            // Extract price if available
            let price: number | undefined;
            if (priceEl) {
              const priceText = priceEl.textContent?.replace(/[^0-9.]/g, '') || '';
              if (priceText) {
                price = parseFloat(priceText);
              }
            }

            scrapedProducts.push({
              id: productId,
              name,
              sourceId: productId,
              sourceUrl: fullUrl,
              botanicalName: botanicalEl?.textContent?.trim(),
              commonName: commonEl?.textContent?.trim(),
              description: descEl?.textContent?.trim(),
              price,
              imageUrl: imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src'),
            });
          }
        });

        return scrapedProducts;
      });

      // Check for pagination
      const hasMore = await pageInstance.evaluate(() => {
        const nextButton = document.querySelector('.pagination .next, [data-next-page]');
        return nextButton !== null && !nextButton.hasAttribute('disabled');
      });

      return { products, hasMore };
    } finally {
      await pageInstance.close();
    }
  }

  /**
   * Scrape a single product detail page
   */
  async scrapeProductDetail(sourceUrl: string): Promise<PlantmarkProduct | null> {
    await this.rateLimit();

    if (!this.browser) {
      await this.initialize();
    }

    const fullUrl = sourceUrl.startsWith('http') ? sourceUrl : `${this.config.baseUrl}${sourceUrl}`;
    const pageInstance = await this.browser.newPage();

    try {
      await pageInstance.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Extract product details
      const product = await pageInstance.evaluate(() => {
        // TODO: Implement actual scraping logic based on Plantmark's product page structure
        
        const nameEl = document.querySelector('h1, .product-title, [data-product-name]');
        const descriptionEl = document.querySelector('.description, .product-description, [data-description]');
        const priceEl = document.querySelector('.price, [data-price]');
        const imageEls = document.querySelectorAll('.product-images img, [data-image]');
        const botanicalEl = document.querySelector('[data-botanical-name], .botanical-name');
        const commonEl = document.querySelector('[data-common-name], .common-name');

        if (!nameEl) return null;

        const images = Array.from(imageEls)
          .map((img) => img.getAttribute('src') || '')
          .filter((src) => src.length > 0);

        return {
          id: document.querySelector('[data-product-id]')?.getAttribute('data-product-id') || '',
          name: nameEl.textContent?.trim() || '',
          description: descriptionEl?.textContent?.trim() || undefined,
          botanicalName: botanicalEl?.textContent?.trim() || undefined,
          commonName: commonEl?.textContent?.trim() || undefined,
          price: priceEl ? parseFloat(priceEl.textContent?.replace(/[^0-9.]/g, '') || '0') : undefined,
          imageUrl: images[0] || undefined,
          images: images.length > 0 ? images : undefined,
          sourceUrl: window.location.href,
        };
      });

      return product as PlantmarkProduct;
    } finally {
      await pageInstance.close();
    }
  }

  /**
   * Build product list URL
   */
  private buildProductListUrl(page: number, category?: string): string {
    // Use plant-finder page which shows all products
    let url = `${this.config.baseUrl}/plant-finder`;
    
    // Note: Plantmark uses hash-based routing for filters
    // Format: /plant-finder#/category=...&page=...
    if (category || page > 1) {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (page > 1) params.append('page', page.toString());
      url += `#/${params.toString()}`;
    }
    
    return url;
  }

  /**
   * Rate limiting
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.config.rateLimitMs) {
      const delay = this.config.rateLimitMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }
}

