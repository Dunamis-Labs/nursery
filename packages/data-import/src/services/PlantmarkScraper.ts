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

      // Extract product data
      const products = await pageInstance.evaluate(() => {
        // TODO: Implement actual scraping logic based on Plantmark's HTML structure
        // This is a placeholder that needs to be customized based on actual site structure
        
        const productElements = document.querySelectorAll('.product-item, [data-product], .product-card');
        const scrapedProducts: PlantmarkProduct[] = [];

        productElements.forEach((element) => {
          const nameEl = element.querySelector('.product-name, h2, h3, [data-name]');
          const priceEl = element.querySelector('.price, [data-price]');
          const imageEl = element.querySelector('img');
          const linkEl = element.querySelector('a');

          if (nameEl) {
            scrapedProducts.push({
              id: element.getAttribute('data-id') || '',
              name: nameEl.textContent?.trim() || '',
              price: priceEl ? parseFloat(priceEl.textContent?.replace(/[^0-9.]/g, '') || '0') : undefined,
              imageUrl: imageEl?.getAttribute('src') || undefined,
              sourceUrl: linkEl?.getAttribute('href') || '',
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
    let url = `${this.config.baseUrl}/trees`;
    
    if (category) {
      url += `#/category=${encodeURIComponent(category)}`;
    }
    
    if (page > 1) {
      url += `&page=${page}`;
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

