import type { PlantmarkProduct, PlantmarkApiConfig } from '../types';

// Helper to make dynamic imports truly dynamic (prevents Turbopack from analyzing)
// Uses Function constructor to create a truly dynamic import that can't be statically analyzed
const dynamicImport = (moduleName: string) => {
  // Use Function constructor to prevent static analysis
  const importFunc = new Function('moduleName', 'return import(moduleName)');
  return importFunc(moduleName);
};

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

  private isLoggedIn: boolean = false;

  constructor(config: PlantmarkApiConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://www.plantmark.com.au',
      apiKey: config.apiKey || '',
      useProxy: config.useProxy || false,
      proxyUrl: config.proxyUrl || '',
      rateLimitMs: config.rateLimitMs || 2000, // Default: 1 request per 2 seconds
      email: config.email || '',
      password: config.password || '',
    };
  }

  /**
   * Initialize browser (Puppeteer or Playwright)
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      return;
    }

    // Skip during build - these are runtime-only dependencies
    // Check for build-time environment variables that indicate we're in a build
    if (process.env.NEXT_PHASE === 'phase-production-build' || 
        (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'production')) {
      throw new Error(
        'Browser automation is not available during build. ' +
        'This code should only run at runtime in API routes.'
      );
    }

    // Try Puppeteer first, fallback to Playwright
    // These are optional dependencies - use Function constructor to make imports truly dynamic
    // This prevents Turbopack from statically analyzing the import paths
    
    // Try Puppeteer first
    try {
      const puppeteer = await dynamicImport('puppeteer');
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      (this.browser as any).__isPuppeteer = true;
      // For Puppeteer, browser context is implicit - cookies are shared automatically
      this.browserContext = this.browser;
      return;
    } catch (error) {
      // Fall through to Playwright
    }

    // Try Playwright as fallback
    try {
      const playwright = await dynamicImport('playwright');
      const { chromium } = playwright;
      this.browser = await chromium.launch({
        headless: true,
      });
      (this.browser as any).__isPlaywright = true;
      // For Playwright, create a persistent context to maintain cookies
      // Use sameSite: 'Lax' and sameOrigin: true to ensure cookies persist
      this.browserContext = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        // Ensure cookies persist across navigations
        storageState: undefined, // We'll set cookies manually
      });
      return;
    } catch (error) {
      // Continue to error
    }

    throw new Error(
      'Neither Puppeteer nor Playwright is available. ' +
      'Install one: npm install puppeteer or npm install playwright'
    );

    // Login if credentials are provided
    if (this.config.email && this.config.password && !this.isLoggedIn) {
      await this.login();
    }
  }

  /**
   * Login to Plantmark to access prices
   */
  private async login(): Promise<void> {
    if (!this.config.email || !this.config.password) {
      return;
    }

    if (!this.browser) {
      throw new Error('Browser must be initialized before login');
    }

    // Use browser context to create page (ensures cookies are shared)
    const pageInstance = this.browserContext 
      ? await this.browserContext.newPage()
      : await this.browser.newPage();

    try {
      const isPuppeteer = (this.browser as any).__isPuppeteer;

      if (isPuppeteer) {
        await pageInstance.setViewport({ width: 1920, height: 1080 });
        await pageInstance.setUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        );
      } else {
        await pageInstance.setViewportSize({ width: 1920, height: 1080 });
        await pageInstance.setExtraHTTPHeaders({
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        });
      }

      // Navigate to login page
      await pageInstance.goto(`${this.config.baseUrl}/login`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Wait for login form to be visible
      await pageInstance.waitForSelector('#Username', { timeout: 10000 });
      await pageInstance.waitForSelector('#Password', { timeout: 10000 });
      
      // Fill in login form - be specific to avoid matching search form
      if (isPuppeteer) {
        // Puppeteer API - use more specific selectors
        await pageInstance.type('#Username', this.config.email, { delay: 100 });
        await pageInstance.type('#Password', this.config.password, { delay: 100 });
      } else {
        // Playwright API - use more specific selectors
        await pageInstance.fill('#Username', this.config.email);
        await pageInstance.fill('#Password', this.config.password);
      }
      
      // Wait a moment for form to be ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Submit form by pressing Enter on password field (more reliable)
      if (isPuppeteer) {
        await pageInstance.focus('#Password');
        await Promise.all([
          pageInstance.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }),
          pageInstance.keyboard.press('Enter')
        ]).catch(async () => {
          // Fallback: wait a bit and check
          await new Promise(resolve => setTimeout(resolve, 5000));
        });
      } else {
        await pageInstance.focus('#Password');
        await Promise.all([
          pageInstance.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }),
          pageInstance.keyboard.press('Enter')
        ]).catch(async () => {
          // Fallback: wait a bit and check
          await new Promise(resolve => setTimeout(resolve, 5000));
        });
      }
      
      // Additional wait to ensure cookies are set and page is fully loaded
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check current URL - should redirect to homepage on successful login
      const finalUrl = pageInstance.url();
      if (finalUrl.includes('/login')) {
        console.warn('   ⚠️  Still on login page after submit - login may have failed');
      } else {
        console.log(`   ✅ Login successful - redirected to: ${finalUrl}`);
      }

      // Verify login by checking for user session indicators
      const loginSuccess = await pageInstance.evaluate(() => {
        const currentUrl = window.location.href;
        const bodyText = document.body.textContent || '';
        
        // Check for login success indicators
        const isLoggedIn = !currentUrl.includes('/login') || 
                          bodyText.includes('logout') ||
                          bodyText.includes('Welcome') ||
                          bodyText.includes('account') ||
                          document.querySelector('.account, [class*="account"], [class*="welcome"]') !== null ||
                          document.querySelector('.ico-logout, [class*="logout"]') !== null;
        
        const hasError = bodyText.toLowerCase().includes('invalid') ||
                        bodyText.toLowerCase().includes('incorrect') ||
                        document.querySelector('.error, [class*="error"], .validation-summary-errors') !== null;
        
        return { isLoggedIn, hasError, currentUrl };
      });

      if (loginSuccess.isLoggedIn && !loginSuccess.hasError) {
        this.isLoggedIn = true;
        console.log('✅ Successfully logged in to Plantmark');
        
        // Verify login by checking cookies (use correct API for Puppeteer vs Playwright)
        try {
          let cookies: any[] = [];
          if (isPuppeteer) {
            cookies = await pageInstance.cookies();
          } else {
            // Playwright uses context().cookies()
            const context = (pageInstance as any).context();
            cookies = await context.cookies();
          }
          
          const hasAuthCookie = cookies.some((cookie: any) => 
            cookie.name.includes('auth') || 
            cookie.name.includes('session') || 
            cookie.name.includes('login') ||
            cookie.name.includes('customer') ||
            cookie.name.includes('Nop')
          );
          
          if (hasAuthCookie) {
            console.log(`   Found ${cookies.length} cookies, session should persist`);
          } else {
            console.warn(`   No auth cookies found (${cookies.length} total cookies)`);
          }
        } catch (cookieError) {
          console.warn('   Could not check cookies:', cookieError);
        }
        
        // Save cookies from login page to ensure they persist
        try {
          let cookies: any[] = [];
          if (isPuppeteer) {
            cookies = await pageInstance.cookies();
          } else {
            const context = (pageInstance as any).context();
            cookies = await context.cookies();
          }
          
          // Store cookies in browser context for future pages
          if (cookies.length > 0) {
            if (isPuppeteer) {
              // For Puppeteer, cookies are automatically shared via browser context
              console.log(`   ✅ ${cookies.length} cookies available in browser context`);
            } else if (this.browserContext) {
              // For Playwright, explicitly add cookies to context
              await this.browserContext.addCookies(cookies);
              console.log(`   ✅ Saved ${cookies.length} cookies to browser context`);
            }
          }
        } catch (cookieError) {
          console.warn('   Could not save cookies:', cookieError);
        }
        
        // Navigate to a product page to verify login persists
        // Use the same page instance to maintain cookies
        await pageInstance.goto(`${this.config.baseUrl}/trees`, { waitUntil: 'networkidle', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer for prices to load
        
        const verifyLogin = await pageInstance.evaluate(() => {
          const pricingCol = document.querySelector('.pricing');
          const pricingText = pricingCol?.textContent || '';
          const priceElements = document.querySelectorAll('[id^="price-exgst-"], [id^="price-incgst-"]');
          const welcomeText = document.body.textContent || '';
          return {
            stillLoggedIn: !pricingText.includes('Want pricing') && !pricingText.includes('Click to login'),
            pricingText: pricingText.trim().substring(0, 50),
            priceElementsFound: priceElements.length,
            hasWelcome: welcomeText.includes('Welcome')
          };
        });
        
        if (verifyLogin.stillLoggedIn && verifyLogin.priceElementsFound > 0) {
          console.log(`   ✅ Login verified - found ${verifyLogin.priceElementsFound} price elements`);
        } else {
          console.warn(`   ⚠️  Login verification: loggedIn=${verifyLogin.stillLoggedIn}, prices=${verifyLogin.priceElementsFound}, welcome=${verifyLogin.hasWelcome}`);
          console.warn(`   Pricing text: ${verifyLogin.pricingText}`);
          
          // Try to debug why prices aren't loading
          if (verifyLogin.stillLoggedIn && verifyLogin.priceElementsFound === 0) {
            console.warn('   ⚠️  Logged in but prices not found - may need to wait longer or check AJAX loading');
          }
        }
      } else {
        console.warn('⚠️  Login may have failed. Continuing without authentication.');
        if (loginSuccess.hasError) {
          console.warn('   Error detected on login page');
        }
        console.warn(`   Current URL: ${loginSuccess.currentUrl}`);
      }
    } catch (error) {
      console.warn('⚠️  Login failed:', error);
      // Continue without login - prices may not be available
    } finally {
      // Don't close the login page immediately - keep it open to maintain session
      // The browser context will maintain cookies across pages
      // We'll close it when the browser is closed
      // await pageInstance.close(); // Commented out to maintain session
    }
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browserContext && (this.browser as any).__isPlaywright) {
      await this.browserContext.close();
      this.browserContext = null;
    }
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
    // Use browser context to create page (ensures cookies from login are shared)
    const pageInstance = this.browserContext 
      ? await this.browserContext.newPage()
      : await this.browser.newPage();

    try {
      // Check if Puppeteer or Playwright
      const isPuppeteer = (this.browser as any).__isPuppeteer;
      
      if (isPuppeteer) {
        // Puppeteer API
        await pageInstance.setViewport({ width: 1920, height: 1080 });
        await pageInstance.setUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        );
        await pageInstance.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        // Wait for prices to potentially load via JavaScript
        await new Promise(resolve => setTimeout(resolve, 5000));
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
        await pageInstance.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        // Wait for prices to potentially load via JavaScript/AJAX
        await new Promise(resolve => setTimeout(resolve, 5000));
        // Try to wait for selector, but don't fail if it takes too long
        try {
          await pageInstance.waitForSelector('div[data-productid], .product-item[data-productid]', {
            timeout: 10000,
          });
        } catch {
          // Continue anyway - products might already be loaded
        }
      }
      
      // If logged in, wait a bit more for prices to load and verify
      if (this.isLoggedIn) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if prices have loaded
        const pricesLoaded = await pageInstance.evaluate(() => {
          return document.querySelectorAll('[id^="price-exgst-"], [id^="price-incgst-"]').length;
        });
        
        if (pricesLoaded === 0) {
          console.warn('   ⚠️  No price elements found after login - prices may not be loading');
        } else {
          console.log(`   ✅ Found ${pricesLoaded} price elements`);
        }
      }

      // Extract category from the page (breadcrumbs, page title, or URL)
      // Also use the category parameter if provided, or extract from URL
      let pageCategory: string | null = null;
      
      // First, try to use the category parameter if provided
      if (category) {
        // Convert slug to readable name (e.g., "trees" -> "Trees")
        pageCategory = category.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        console.log(`   📁 Using category parameter: "${pageCategory}"`);
      } else {
        // Extract from page
        pageCategory = await pageInstance.evaluate(() => {
          // Try breadcrumbs first
          const breadcrumbs = document.querySelectorAll('.breadcrumb a, .breadcrumbs a, nav[aria-label="breadcrumb"] a, [class*="breadcrumb"] a');
          if (breadcrumbs.length > 1) {
            // Usually second-to-last breadcrumb is the category
            const categoryLink = Array.from(breadcrumbs)[breadcrumbs.length - 2] as HTMLElement;
            if (categoryLink) {
              const categoryText = categoryLink.textContent?.trim();
              if (categoryText && categoryText.toLowerCase() !== 'home' && categoryText.toLowerCase() !== 'plant finder') {
                return categoryText;
              }
            }
          }
          
          // Try page title/heading
          const pageTitle = document.querySelector('h1, .page-title, [class*="category"] h1');
          if (pageTitle) {
            const titleText = pageTitle.textContent?.trim();
            if (titleText && !titleText.toLowerCase().includes('plant finder')) {
              return titleText;
            }
          }
          
          // Try URL path (this should work even with hash)
          const pathParts = window.location.pathname.split('/').filter(p => p);
          if (pathParts.length > 0 && pathParts[0] !== 'plant-finder') {
            // Convert slug to readable name (e.g., "trees" -> "Trees")
            const categorySlug = pathParts[0];
            return categorySlug.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
          }
          
          return null;
        });
        
        // Log extracted category for debugging
        if (pageCategory) {
          console.log(`   📁 Extracted category from page: "${pageCategory}"`);
        } else {
          console.log(`   ⚠️  Could not extract category from page`);
        }
      }

      // Log extracted category for debugging
      if (pageCategory) {
        console.log(`   📁 Extracted category from page: "${pageCategory}"`);
      } else {
        console.log(`   ⚠️  Could not extract category from page`);
      }

      // Extract product data based on actual Plantmark structure
      // Plantmark uses div-based structure: ._ProductBoxWithLocation with columns
      let products = await pageInstance.evaluate((categoryFromPage: string | null) => {
        const scrapedProducts: PlantmarkProduct[] = [];
        const productMap = new Map<string, any>(); // Key by productId to group variants
        
        // Find all product boxes
        const productBoxes = document.querySelectorAll('._ProductBoxWithLocation[data-productid], [data-productid].product-item');
        
        productBoxes.forEach((productBox) => {
          const productId = productBox.getAttribute('data-productid');
          if (!productId) return;
          
          // Extract product link and name
          const linkEl = productBox.querySelector('a[href*="/"]');
          if (!linkEl) return;
          
          const href = linkEl.getAttribute('href') || '';
          const fullUrl = href.startsWith('http') ? href : `https://www.plantmark.com.au${href}`;
          
          let name = linkEl.textContent?.trim() || linkEl.getAttribute('title') || '';
          name = name.replace(/^Show details for\s*/i, '').trim();
          
          // Try to get name from product title
          if (!name) {
            const titleEl = productBox.querySelector('.product-title, h2');
            name = titleEl?.textContent?.trim() || '';
          }
          
          if (!name && href) {
            const slug = href.split('/').pop() || '';
            name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          }
          
          // Extract image
          const imageEl = productBox.querySelector('img:not([src*="data:image"]):not([src*="placeholder"])');
          let imageUrl = imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src') || imageEl?.getAttribute('data-lazyloadsrc');
          if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            imageUrl = imageUrl.startsWith('/') 
              ? `https://www.plantmark.com.au${imageUrl}`
              : `https://www.plantmark.com.au/${imageUrl}`;
          }
          if (imageUrl?.includes('data:image') || imageUrl?.includes('placeholder') || !imageUrl) {
            imageUrl = undefined;
          }
          
          // Extract botanical/common names
          const botanicalEl = productBox.querySelector('[class*="botanical"], [data-botanical]');
          const commonEl = productBox.querySelector('[class*="common"], [data-common]');
          const botanicalName = botanicalEl?.textContent?.trim();
          const commonName = commonEl?.textContent?.trim();
          
          // Extract description
          const descEl = productBox.querySelector('.description, [class*="desc"]');
          const description = descEl?.textContent?.trim();
          
          // Find all size variants in this product box
          const sizeVariants = productBox.querySelectorAll('[id^="size-"], [id^="mobile-size-"], .size.combo, [class*="combo"][class*="location-box"]');
          const variants: any[] = [];
          
          sizeVariants.forEach((sizeEl) => {
            const comboId = sizeEl.id ? sizeEl.id.replace(/^(mobile-)?size-/, '') : 
                           sizeEl.className.match(/combo-(\d+)/)?.[1] || null;
            const sizeText = (sizeEl.textContent || '').trim();
            
            // Skip if no combo ID or invalid size
            if (!comboId || !sizeText || sizeText.length === 0) return;
            
            // Get stock from availability element or className
            const stockMatch = sizeEl.className.match(/stock-(\d+)/);
            const availabilityEl = document.getElementById('availability-' + comboId);
            const stockText = availabilityEl?.textContent?.trim() || '';
            const stockFromAvailability = stockText.match(/(\d+)/);
            const stock = stockMatch ? parseInt(stockMatch[1]) : 
                         (stockFromAvailability ? parseInt(stockFromAvailability[1]) : undefined);
            
            // Get price using combo ID
            let variantPrice: number | undefined;
            const priceExGstEl = document.getElementById('price-exgst-' + comboId);
            const priceIncGstEl = document.getElementById('price-incgst-' + comboId);
            
            if (priceExGstEl) {
              const priceText = priceExGstEl.textContent || '';
              const exGstMatch = priceText.match(/\$?(\d+\.?\d*)\s*(?:ex|excluding)\s*gst/i);
              if (exGstMatch) {
                variantPrice = parseFloat(exGstMatch[1]);
              }
            } else if (priceIncGstEl) {
              const priceText = priceIncGstEl.textContent || '';
              const incGstMatch = priceText.match(/\$?(\d+\.?\d*)\s*(?:inc|including)\s*gst/i);
              if (incGstMatch) {
                // Convert INC GST to EX GST (divide by 1.1)
                const incGstPrice = parseFloat(incGstMatch[1]);
                variantPrice = Math.round((incGstPrice / 1.1) * 100) / 100;
              }
            }
            
            // Only add if size looks valid (contains cm or L)
            if (sizeText.match(/\d+cm/i) || sizeText.match(/\d+L/i) || sizeText.match(/\d+.*pot/i)) {
              variants.push({
                id: comboId,
                size: sizeText,
                price: variantPrice,
                availability: stock && stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
                stock
              });
            }
          });
          
          // Group variants by productId
          if (!productMap.has(productId)) {
            const firstVariantWithPrice = variants.find(v => v.price);
            productMap.set(productId, {
              id: productId,
              name: name || 'Unknown',
              sourceId: productId,
              sourceUrl: fullUrl,
              botanicalName,
              commonName,
              description,
              price: firstVariantWithPrice?.price,
              imageUrl,
              variants: []
            });
          }
          
          // Add variants
          const product = productMap.get(productId);
          variants.forEach(variant => {
            // Avoid duplicates
            if (!product.variants.find(v => v.id === variant.id)) {
              product.variants.push(variant);
            }
          });
        });
        
        // Convert map to array
        productMap.forEach((product) => {
          // If no variants, create a single product entry
          if (product.variants.length === 0) {
            scrapedProducts.push({
              id: product.id,
              name: product.name,
              sourceId: product.sourceId,
              sourceUrl: product.sourceUrl,
              botanicalName: product.botanicalName,
              commonName: product.commonName,
              description: product.description,
              price: product.price,
              imageUrl: product.imageUrl,
              category: categoryFromPage || undefined
            });
          } else {
            // Use first variant's price as main price
            const firstVariantWithPrice = product.variants.find((v: any) => v.price);
            scrapedProducts.push({
              id: product.id,
              name: product.name,
              sourceId: product.sourceId,
              sourceUrl: product.sourceUrl,
              botanicalName: product.botanicalName,
              commonName: product.commonName,
              description: product.description,
              price: firstVariantWithPrice?.price || product.price,
              imageUrl: product.imageUrl,
              variants: product.variants.length > 0 ? product.variants : undefined,
              category: categoryFromPage || undefined
            });
          }
        });
        
        // Fallback: if no table structure found, use original div-based extraction
        if (scrapedProducts.length === 0) {
          const productElements = document.querySelectorAll('div[data-productid], .product-item[data-productid], ._ProductBoxWithLocation');
          
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
              name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
            
            const priceEl = element.querySelector('.price, [class*="price"], [data-price]');
            let price: number | undefined;
            if (priceEl) {
              const priceText = priceEl.textContent?.replace(/[^0-9.]/g, '') || '';
              if (priceText) {
                price = parseFloat(priceText);
              }
            }
            
            const botanicalEl = element.querySelector('[class*="botanical"], [data-botanical]');
            const commonEl = element.querySelector('[class*="common"], [data-common]');
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
                botanicalName: botanicalEl?.textContent?.trim(),
                commonName: commonEl?.textContent?.trim(),
                description,
                price,
                imageUrl,
                category: categoryFromPage || undefined
              });
            }
          });
        }
        
        return scrapedProducts;
      }, pageCategory);

      // Extract total results count from page to determine pagination
      // Store totalResults in a class property so we can reuse it across pages
      if (!(this as any).totalResults && page === 1) {
        // On first page, extract total results count
        (this as any).totalResults = await pageInstance.evaluate(() => {
          const bodyText = document.body.textContent || '';
          
          // Look for patterns like "Showing 1-24 of 500" or "500 results" or "2025" mentioned
          const showingMatch = bodyText.match(/showing\s+\d+\s*-\s*\d+\s+of\s+(\d+)/i);
          if (showingMatch) return parseInt(showingMatch[1]);
          
          // Look for "X results" or "X products" patterns
          const resultsMatch = bodyText.match(/(\d{2,})\s+(?:results?|products?|items?|plants?)/i);
          if (resultsMatch) return parseInt(resultsMatch[1]);
          
          // Look for large numbers that might be total (usually 3+ digits)
          const largeNumberMatch = bodyText.match(/\b(\d{3,})\b/);
          if (largeNumberMatch) {
            const num = parseInt(largeNumberMatch[1]);
            // Reasonable range for total products (between 100 and 10000)
            if (num >= 100 && num <= 10000) return num;
          }
          
          return null;
        });
      }
      
      const totalResults = (this as any).totalResults;
      const pageSize = 24;
      
      // Determine if there are more pages
      let hasMore = false;
      
      if (totalResults) {
        // Calculate total pages based on total results
        const totalPages = Math.ceil(totalResults / pageSize);
        hasMore = page < totalPages;
      } else {
        // Fallback: check for pagination buttons/links
        hasMore = await pageInstance.evaluate(() => {
          // Look for next page button/link
          const nextButton = document.querySelector('.pagination .next, [data-next-page], a[href*="pageNumber"], button[class*="next"]');
          if (nextButton) {
            const href = nextButton.getAttribute('href') || '';
            const isDisabled = nextButton.hasAttribute('disabled') || 
                             nextButton.classList.contains('disabled') ||
                             nextButton.classList.contains('inactive') ||
                             nextButton.classList.contains('disabled');
            return !isDisabled && (href.includes('pageNumber') || nextButton.textContent?.toLowerCase().includes('next'));
          }
          return false;
        });
      }

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
    // Use browser context to create page (ensures cookies from login are shared)
    const pageInstance = this.browserContext 
      ? await this.browserContext.newPage()
      : await this.browser.newPage();

    try {
      const isPuppeteer = (this.browser as any).__isPuppeteer;
      
      if (isPuppeteer) {
        await pageInstance.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        await pageInstance.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // If logged in, try clicking on variants to reveal prices (prices might be loaded dynamically)
      if (this.isLoggedIn) {
        try {
          // Click on first few variants to trigger price loading
          if (isPuppeteer) {
            await pageInstance.evaluate(() => {
              const variants = document.querySelectorAll('[id^="size-"], .size.combo, [class*="combo"][class*="location-box"]');
              for (let i = 0; i < Math.min(3, variants.length); i++) {
                const variant = variants[i] as HTMLElement;
                if (variant && variant.offsetParent !== null) {
                  try {
                    variant.click();
                  } catch (e) {
                    // Ignore click errors
                  }
                }
              }
            });
          } else {
            // Playwright - use click method
            const variants = await pageInstance.$$('[id^="size-"], .size.combo, [class*="combo"][class*="location-box"]');
            for (let i = 0; i < Math.min(3, variants.length); i++) {
              try {
                await variants[i].click({ timeout: 1000 });
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (e) {
                // Ignore click errors
              }
            }
          }
          
          // Wait for prices to potentially load after clicks
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          // Ignore errors - prices might not need clicking
        }
      }

      // Extract product details - improved for Plantmark's actual structure
      // Load the scraping code from a separate JS file to avoid TypeScript compilation issues
      let scrapeCode: string;
      try {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const { dirname } = path;
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      
      const scrapeCodePath = path.join(__dirname, 'scrapeProductDetailCode.js');
        scrapeCode = fs.readFileSync(scrapeCodePath, 'utf-8');
      } catch (fileError) {
        // Fallback: try to read from package directory
        try {
          const fs = await import('fs');
          const path = await import('path');
          // Try multiple possible paths
          const possiblePaths = [
            path.join(process.cwd(), 'packages/data-import/src/services/scrapeProductDetailCode.js'),
            path.join(process.cwd(), 'node_modules/@nursery/data-import/src/services/scrapeProductDetailCode.js'),
            path.join(process.cwd(), 'node_modules/@nursery/data-import/dist/services/scrapeProductDetailCode.js'),
          ];
          
          let found = false;
          for (const possiblePath of possiblePaths) {
            try {
              if (fs.existsSync(possiblePath)) {
                scrapeCode = fs.readFileSync(possiblePath, 'utf-8');
                found = true;
                break;
              }
            } catch (e) {
              // Continue to next path
            }
          }
          
          if (!found) {
            throw new Error(`Could not find scrapeProductDetailCode.js. Tried: ${possiblePaths.join(', ')}. Original error: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
          }
        } catch (fallbackError) {
          throw new Error(`Failed to load scrape code: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
        }
      }
      
      // Extract just the function body (remove function declaration wrapper and closing brace)
      const functionBody = scrapeCode
        .replace(/^\/\/.*\n/gm, '') // Remove comments
        .replace(/^function\s+\w+\s*\([^)]*\)\s*\{/, '') // Remove function declaration
        .replace(/\}\s*$/, '') // Remove closing brace
        .trim();
      
      // Create a function that executes the body and returns the result
      // Use Function constructor to avoid TypeScript compilation issues
      const scrapeFunction = new Function(functionBody);
      const product = await pageInstance.evaluate(scrapeFunction) as PlantmarkProduct;

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
    // Plantmark uses hash-based routing with specific parameters
    // Format: /plant-finder#/isFilters=1&pageSize=24&orderBy=0&pageNumber=2
    let url = `${this.config.baseUrl}/plant-finder`;
    
    const params = new URLSearchParams();
    params.append('isFilters', '1');
    params.append('pageSize', '24');
    params.append('orderBy', '0');
    if (page > 1) {
      params.append('pageNumber', page.toString());
    }
    if (category) {
      params.append('category', category);
    }
    
    url += `#/${params.toString()}`;
    
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

