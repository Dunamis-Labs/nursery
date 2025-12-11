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
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      (this.browser as any).__isPuppeteer = true;
    } catch (error) {
      try {
        const { chromium } = await import('playwright');
        this.browser = await chromium.launch({
          headless: true,
        });
        (this.browser as any).__isPlaywright = true;
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
      await this.browser.close();
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
      // Check if Puppeteer or Playwright
      const isPuppeteer = (this.browser as any).__isPuppeteer;
      
      if (isPuppeteer) {
        // Puppeteer API
        await pageInstance.setViewport({ width: 1920, height: 1080 });
        await pageInstance.setUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        );
        await pageInstance.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Wait a bit for content to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Try to wait for selector, but don't fail if it takes too long
        try {
          await pageInstance.waitForSelector('div[data-productid], .product-item[data-productid]', {
            timeout: 10000,
          });
        } catch {
          // Continue anyway - products might already be loaded
        }
      } else {
        // Playwright API
        await pageInstance.setViewportSize({ width: 1920, height: 1080 });
        await pageInstance.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        });
        await pageInstance.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Wait a bit for content to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Try to wait for selector, but don't fail if it takes too long
        try {
          await pageInstance.waitForSelector('div[data-productid], .product-item[data-productid]', {
            timeout: 10000,
          });
        } catch {
          // Continue anyway - products might already be loaded
        }
      }

      // Extract product data based on actual Plantmark structure
      let products = await pageInstance.evaluate(() => {
        // Plantmark uses: <div class="_ProductBoxWithLocation product-item product-attributes" data-productid="6697">
        const productElements = document.querySelectorAll('div[data-productid], .product-item[data-productid], ._ProductBoxWithLocation');
        const scrapedProducts: PlantmarkProduct[] = [];

        productElements.forEach((element) => {
          const productId = element.getAttribute('data-productid');
          if (!productId) return;

          // Find product link - this usually contains the name
          const linkEl = element.querySelector('a[href*="/"]');
          if (!linkEl) return;
          
          const href = linkEl.getAttribute('href') || '';
          const fullUrl = href.startsWith('http') ? href : `https://www.plantmark.com.au${href}`;
          
          // Extract name from link text or title attribute
          let name = linkEl.textContent?.trim() || linkEl.getAttribute('title') || '';
          
          // Clean up common prefixes like "Show details for"
          name = name.replace(/^Show details for\s*/i, '').trim();
          
          // If name is still empty, try to get it from the URL slug
          if (!name && href) {
            const slug = href.split('/').pop() || '';
            // Convert slug to readable name (e.g., "abelia-floribunda" -> "Abelia Floribunda")
            name = slug
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
          
          // Find image - look for actual image URLs, not placeholders
          const imageEl = element.querySelector('img:not([src*="data:image"]):not([src*="placeholder"])');
          let imageUrl = imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src');
          
          // Make relative URLs absolute
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            imageUrl = imageUrl.startsWith('/') 
              ? `https://www.plantmark.com.au${imageUrl}`
              : `https://www.plantmark.com.au/${imageUrl}`;
          }
          
          // Skip placeholder/empty images
          if (imageUrl?.includes('data:image') || imageUrl?.includes('placeholder') || !imageUrl) {
            imageUrl = undefined;
          }
          
          // Try to find price - might be in various formats
          const priceEl = element.querySelector('.price, [class*="price"], [data-price]');
          
          // Try to find botanical/common names
          const botanicalEl = element.querySelector('[class*="botanical"], [data-botanical]');
          const commonEl = element.querySelector('[class*="common"], [data-common]');
          
          // Try to find description - look for text content in the element
          const descEl = element.querySelector('.description, [class*="desc"], p, .detail');
          let description = descEl?.textContent?.trim();
          
          // If no description element found, get text from the whole product box
          if (!description) {
            const allText = element.textContent?.trim() || '';
            // Remove the name from the text to get description
            description = allText.replace(name, '').trim();
          }

          // Extract price if available
          let price: number | undefined;
          if (priceEl) {
            const priceText = priceEl.textContent?.replace(/[^0-9.]/g, '') || '';
            if (priceText) {
              price = parseFloat(priceText);
            }
          }

          // Only add if we have at least a name or description
          if (name || description) {
            scrapedProducts.push({
              id: productId,
              name: name || description?.substring(0, 50) || 'Unknown',
              sourceId: productId,
              sourceUrl: fullUrl,
              botanicalName: botanicalEl?.textContent?.trim(),
              commonName: commonEl?.textContent?.trim(),
              description,
              price,
              imageUrl,
            });
          }
        });

        return scrapedProducts;
      });

      // Check for pagination or infinite scroll
      // Plant Finder uses infinite scroll, so we need to scroll to load more
      let previousCount = products.length;
      let scrollAttempts = 0;
      const maxScrollAttempts = 10; // Limit scrolling to prevent infinite loops
      
      while (scrollAttempts < maxScrollAttempts) {
        // Scroll to bottom to trigger lazy loading
        await pageInstance.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // Wait for new content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if new products loaded
        const newProducts = await pageInstance.evaluate(() => {
          const productElements = document.querySelectorAll('div[data-productid], .product-item[data-productid], ._ProductBoxWithLocation');
          return productElements.length;
        });
        
        if (newProducts === previousCount) {
          // No new products loaded, we've reached the end
          break;
        }
        
        previousCount = newProducts;
        scrollAttempts++;
      }
      
      // Re-extract all products after scrolling
      let allProducts = products;
      if (scrollAttempts > 0) {
        allProducts = await pageInstance.evaluate(() => {
          const productElements = document.querySelectorAll('div[data-productid], .product-item[data-productid], ._ProductBoxWithLocation');
          const scrapedProducts: PlantmarkProduct[] = [];

          productElements.forEach((element) => {
            const productId = element.getAttribute('data-productid');
            if (!productId) return;

            const linkEl = element.querySelector('a[href*="/"]');
            if (!linkEl) return;
            
            const href = linkEl.getAttribute('href') || '';
            const fullUrl = href.startsWith('http') ? href : `https://www.plantmark.com.au${href}`;
            
            let name = linkEl.textContent?.trim() || linkEl.getAttribute('title') || '';
            name = name.replace(/^Show details for\s*/i, '').trim();
            
            if (!name && href) {
              const slug = href.split('/').pop() || '';
              name = slug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            }
            
            const imageEl = element.querySelector('img:not([src*="data:image"]):not([src*="placeholder"])');
            let imageUrl = imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src');
            
            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
              imageUrl = imageUrl.startsWith('/') 
                ? `https://www.plantmark.com.au${imageUrl}`
                : `https://www.plantmark.com.au/${imageUrl}`;
            }
            
            if (imageUrl?.includes('data:image') || imageUrl?.includes('placeholder') || !imageUrl) {
              imageUrl = undefined;
            }
            
            const descEl = element.querySelector('.description, [class*="desc"], p, .detail');
            let description = descEl?.textContent?.trim();
            
            if (!description) {
              const allText = element.textContent?.trim() || '';
              description = allText.replace(name, '').trim();
            }

            if (name || description) {
              scrapedProducts.push({
                id: productId,
                name: name || description?.substring(0, 50) || 'Unknown',
                sourceId: productId,
                sourceUrl: fullUrl,
                description,
                imageUrl,
              });
            }
          });

          return scrapedProducts;
        });
        products = allProducts;
      }
      
      // Check for traditional pagination as fallback
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
      const isPuppeteer = (this.browser as any).__isPuppeteer;
      
      if (isPuppeteer) {
        await pageInstance.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        await pageInstance.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Extract product details - improved for Plantmark's actual structure
      const product = await pageInstance.evaluate(() => {
        // Plantmark product page structure
        const nameEl = document.querySelector('h1, .product-title, [data-product-name], .product-name');
        const descriptionEl = document.querySelector('.description, .product-description, [data-description], .product-detail, .detail');
        
        // Look for price in various locations
        const priceEl = document.querySelector('.price, [data-price], .product-price, [class*="price"]');
        
        // Find all images (main and gallery)
        const imageEls = document.querySelectorAll('.product-images img, .product-gallery img, [data-image], .photo img, img[src*="thumbs"]');
        
        // Botanical and common names
        const botanicalEl = document.querySelector('[data-botanical-name], .botanical-name, [class*="botanical"]');
        const commonEl = document.querySelector('[data-common-name], .common-name, [class*="common"]');
        
        // Extract product ID from URL or page
        const urlParts = window.location.pathname.split('/');
        const slug = urlParts[urlParts.length - 1];
        const productId = document.querySelector('[data-product-id]')?.getAttribute('data-product-id') || 
                         document.querySelector('[data-productid]')?.getAttribute('data-productid') || '';

        if (!nameEl) {
          // Try to get name from page title or URL
          const pageTitle = document.title.split('|')[0]?.trim();
          if (!pageTitle) return null;
        }

        const name = nameEl?.textContent?.trim() || 
                    document.title.split('|')[0]?.trim() ||
                    slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // Extract all images, making URLs absolute
        const images = Array.from(imageEls)
          .map((img) => {
            let src = img.getAttribute('src') || img.getAttribute('data-src') || '';
            // Skip placeholder images
            if (src.includes('data:image') || src.includes('placeholder')) return null;
            // Make relative URLs absolute
            if (src && !src.startsWith('http')) {
              src = src.startsWith('/') ? `https://www.plantmark.com.au${src}` : `https://www.plantmark.com.au/${src}`;
            }
            return src;
          })
          .filter((src): src is string => src !== null && src.length > 0);

        // Extract price
        let price: number | undefined;
        if (priceEl) {
          const priceText = priceEl.textContent?.replace(/[^0-9.]/g, '') || '';
          if (priceText) {
            price = parseFloat(priceText);
          }
        }

        // Get full description text
        let description = descriptionEl?.textContent?.trim();
        if (!description) {
          // Try to get description from multiple paragraphs
          const descParagraphs = Array.from(document.querySelectorAll('.product-detail p, .detail p, .description p'))
            .map(p => p.textContent?.trim())
            .filter(text => text && text.length > 10)
            .join('\n\n');
          description = descParagraphs || undefined;
        }

        return {
          id: productId || slug,
          name,
          description,
          botanicalName: botanicalEl?.textContent?.trim() || undefined,
          commonName: commonEl?.textContent?.trim() || undefined,
          price,
          imageUrl: images[0] || undefined,
          images: images.length > 0 ? images : undefined,
          sourceUrl: window.location.href,
          sourceId: productId || slug,
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

