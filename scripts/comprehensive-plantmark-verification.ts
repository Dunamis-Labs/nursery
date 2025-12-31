#!/usr/bin/env tsx
/**
 * Comprehensive Plantmark Verification Script
 * 
 * Performs complete verification and import of Plantmark data with support for VPN workarounds.
 * 
 * Usage:
 *   npm run verify:plantmark                    # Full verification
 *   npm run verify:plantmark -- --scrape-only   # Phase 1: Scrape with VPN (saves to files)
 *   npm run verify:plantmark -- --import-only   # Phase 2: Import without VPN (reads from files)
 */

// Load environment variables FIRST
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DataImportService } from '../packages/data-import/src/services/DataImportService';
import { PlantmarkScraper } from '../packages/data-import/src/services/PlantmarkScraper';
import { ImageDownloadService } from '../packages/data-import/src/services/ImageDownloadService';
import { generateSlug } from '../packages/data-import/src/utils/validation';
import { prisma } from '@nursery/db';
import { ScrapingJobType, ScrapingJobStatus } from '@nursery/db';

const SCRAPED_DATA_DIR = join(process.cwd(), '.scraped-data');
const SCRAPED_PRODUCTS_FILE = join(SCRAPED_DATA_DIR, 'scraped-products.json');
const SCRAPED_PRODUCT_DETAILS_FILE = join(SCRAPED_DATA_DIR, 'scraped-product-details.json');

// Ensure scraped data directory exists
if (!existsSync(SCRAPED_DATA_DIR)) {
  mkdirSync(SCRAPED_DATA_DIR, { recursive: true });
}

// Parse command line arguments
const args = process.argv.slice(2);
const SCRAPE_ONLY = args.includes('--scrape-only');
const IMPORT_ONLY = args.includes('--import-only');

// Environment variables
const TEST_MODE = process.env.TEST_MODE === 'true';
const SKIP_PRODUCT_CHECK = process.env.SKIP_PRODUCT_CHECK === 'true';
const SKIP_CATEGORY_CHECK = process.env.SKIP_CATEGORY_CHECK === 'true';
const SKIP_CONTENT_CHECK = process.env.SKIP_CONTENT_CHECK === 'true';
const SKIP_IMAGE_CHECK = process.env.SKIP_IMAGE_CHECK === 'true';
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Sleep with jitter for rate limiting
 */
function sleepWithJitter(baseMs: number): Promise<void> {
  const jitter = Math.random() * 0.3 * baseMs; // 0-30% jitter
  const delay = baseMs + jitter;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Check if URL is already a Vercel Blob URL
 */
function isBlobUrl(url?: string | null): boolean {
  return !!url && url.includes('.blob.vercel-storage.com/');
}

/**
 * Check if URL is a local product path
 */
function isLocalProductPath(url?: string | null): boolean {
  return !!url && url.startsWith('/products/');
}

/**
 * Upload local image to Vercel Blob (only if not already uploaded)
 */
async function uploadToBlobIfMissing(
  localPath: string,
  type: 'product' | 'category'
): Promise<string | null> {
  if (!BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  try {
    const { put } = await import('@vercel/blob');
    const { readFileSync } = await import('fs');
    const { basename, join } = await import('path');

    // localPath is like /products/filename.jpg
    const filename = basename(localPath);
    const blobPath = `images/${type}/${filename}`;

    // Resolve file on disk
    const absolute = localPath.startsWith('/')
      ? join(process.cwd(), 'apps', 'web', 'public', localPath)
      : join(process.cwd(), 'apps', 'web', 'public', localPath.replace(/^\//, ''));

    if (!existsSync(absolute)) {
      console.warn(`⚠️  uploadToBlob: file not found ${absolute}`);
      return null;
    }

    const buffer = readFileSync(absolute);
    const result = await put(blobPath, buffer, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    });
    return result.url;
  } catch (error) {
    console.warn('⚠️  Blob upload failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Phase 1: Scrape-only mode
 * Scrapes all products, downloads images locally, saves to files
 */
async function scrapeOnly() {
  console.log('🌱 Phase 1: Scraping Plantmark (VPN Required)\n');

  const scraper = new PlantmarkScraper({
    baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
    rateLimitMs: parseInt(process.env.PLANTMARK_RATE_LIMIT_MS || '2000'),
  });

  const imageDownloader = new ImageDownloadService({
    baseUrl: '/products/',
  });

  try {
    await scraper.initialize();

    // Step 1: Scrape product listings (handle pagination - 24 products per page)
    console.log('Step 1: Scraping product listings (with pagination)...\n');
    const allProducts: any[] = [];
    let page = 1;
    let hasMore = true;
    let totalScraped = 0;

    while (hasMore) {
      console.log(`  Scraping page ${page}...`);
      const result = await scraper.scrapeProducts(page);
      allProducts.push(...result.products);
      totalScraped += result.products.length;
      hasMore = result.hasMore;
      
      console.log(`  Found ${result.products.length} products on page ${page} (total: ${totalScraped})`);
      
      if (hasMore) {
        page++;
        // Rate limiting between pages
        await sleepWithJitter(2000);
      }
    }

    console.log(`\n✅ Found ${allProducts.length} total products across ${page} page(s)\n`);

    // Save product listings
    writeFileSync(SCRAPED_PRODUCTS_FILE, JSON.stringify(allProducts, null, 2));
    console.log(`💾 Saved product listings to ${SCRAPED_PRODUCTS_FILE}\n`);

    // Step 2: Scrape product details and download images
    console.log('Step 2: Scraping product details and downloading images...\n');

    const productDetails: any[] = [];
    const maxProducts = TEST_MODE ? 10 : allProducts.length;
    let blockedCount = 0;

    for (let i = 0; i < Math.min(maxProducts, allProducts.length); i++) {
      const product = allProducts[i];
      const progress = `[${i + 1}/${Math.min(maxProducts, allProducts.length)}]`;

      if (!product.sourceUrl) {
        console.log(`${progress} ⚠️  Skipping ${product.name || product.id} (no sourceUrl)`);
        continue;
      }

      try {
        console.log(`${progress} Scraping ${product.name || product.id}...`);
        console.log(`  🔗 URL: ${product.sourceUrl}`);

        // Navigate to and scrape product detail page (opens browser window, clicks into product)
        const detail = await scraper.scrapeProductDetail(product.sourceUrl);

        if (!detail) {
          console.log(`  ⚠️  No detail data found`);
          continue;
        }

        // Check for WAF blocking
        if (detail.description?.includes('Sorry, you have been blocked') ||
            detail.name?.includes('Sorry, you have been blocked')) {
          console.log(`  🚫 Blocked by WAF - skipping`);
          blockedCount++;
          continue;
        }

        // Log extracted information
        console.log(`  ✅ Extracted:`);
        console.log(`     Name: ${detail.name || 'N/A'}`);
        console.log(`     Category: ${detail.category || 'N/A'}`);
        console.log(`     Images: ${detail.images?.length || 0} additional images`);
        if (detail.botanicalName) console.log(`     Botanical: ${detail.botanicalName}`);
        if (detail.commonName) console.log(`     Common: ${detail.commonName}`);

        // Download main image (skip if it's a placeholder/default image)
        if (detail.imageUrl && detail.imageUrl.includes('plantmark.com.au')) {
          const lowerImageUrl = detail.imageUrl.toLowerCase();
          if (lowerImageUrl.includes('default-image') || 
              lowerImageUrl.includes('default_image') || 
              lowerImageUrl.includes('no-image') ||
              lowerImageUrl.includes('placeholder')) {
            console.log(`  ⚠️  Skipping main image (placeholder/default): ${detail.imageUrl}`);
            detail.imageUrl = undefined; // Remove placeholder image
          } else {
            console.log(`  📥 Downloading main image...`);
            const mainImageResult = await imageDownloader.downloadImage(
              detail.imageUrl,
              detail.slug || generateSlug(detail.name)
            );
            if (mainImageResult.success && mainImageResult.localPath) {
              detail.imageUrl = mainImageResult.localPath;
              console.log(`  ✅ Main image downloaded: ${mainImageResult.localPath}`);
            } else {
              console.log(`  ⚠️  Main image download failed`);
            }
          }
        }

        // Download additional images (filter out placeholder/default images)
        if (detail.images && Array.isArray(detail.images) && detail.images.length > 0) {
          const plantmarkImages = detail.images.filter((url: string) => {
            if (typeof url !== 'string' || !url.includes('plantmark.com.au')) return false;
            // Filter out placeholder/default images
            const lowerUrl = url.toLowerCase();
            return !lowerUrl.includes('default-image') && 
                   !lowerUrl.includes('default_image') && 
                   !lowerUrl.includes('no-image') &&
                   !lowerUrl.includes('placeholder');
          });

          if (plantmarkImages.length > 0) {
            console.log(`  📥 Downloading ${plantmarkImages.length} additional images...`);
            const result = await imageDownloader.downloadImages(
              plantmarkImages,
              detail.slug || generateSlug(detail.name)
            );
            detail.images = result.downloaded;
            if (result.failed.length > 0) {
              console.log(`  ⚠️  Failed to download ${result.failed.length} images`);
            }
            if (result.downloaded.length > 0) {
              console.log(`  ✅ Downloaded ${result.downloaded.length} additional images`);
            }
          } else {
            console.log(`  ℹ️  No valid additional images to download (filtered out placeholders)`);
          }
        }

        // Check if main image is a placeholder before reporting success
        const hasValidMainImage = detail.imageUrl && 
                                  !detail.imageUrl.includes('default-image') && 
                                  !detail.imageUrl.includes('placeholder');
        const hasValidAdditionalImages = detail.images && 
                                         Array.isArray(detail.images) && 
                                         detail.images.length > 0;

        productDetails.push(detail);
        if (hasValidMainImage || hasValidAdditionalImages) {
          console.log(`  ✅ Scraped product details${hasValidMainImage || hasValidAdditionalImages ? ' and images' : ''}`);
        } else {
          console.log(`  ✅ Scraped product details (no valid images found)`);
        }

        // Rate limiting
        await sleepWithJitter(2000);
      } catch (error) {
        console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Save product details
    writeFileSync(SCRAPED_PRODUCT_DETAILS_FILE, JSON.stringify(productDetails, null, 2));
    console.log(`\n💾 Saved ${productDetails.length} product details to ${SCRAPED_PRODUCT_DETAILS_FILE}`);

    if (blockedCount > 0) {
      console.log(`\n⚠️  ${blockedCount} products were blocked by WAF and skipped`);
    }

    console.log('\n✅ Scrape-only phase complete!');
    console.log('   Run with --import-only to import the scraped data.\n');

  } catch (error) {
    console.error('❌ Scrape failed:', error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

/**
 * Phase 2: Import-only mode
 * Loads scraped data from files and imports to database
 * Uploads images to Vercel Blob only if missing
 */
async function importOnly() {
  console.log('🌱 Phase 2: Importing Scraped Data (No VPN Required)\n');

  if (!existsSync(SCRAPED_PRODUCT_DETAILS_FILE)) {
    console.error(`❌ Scraped data file not found: ${SCRAPED_PRODUCT_DETAILS_FILE}`);
    console.error('   Run with --scrape-only first to generate the data file.\n');
    process.exit(1);
  }

  const importService = new DataImportService({
    baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
    rateLimitMs: parseInt(process.env.PLANTMARK_RATE_LIMIT_MS || '2000'),
  });

  try {
    // Load scraped product details
    console.log('📂 Loading scraped product details...\n');
    const productDetailsJson = readFileSync(SCRAPED_PRODUCT_DETAILS_FILE, 'utf-8');
    const productDetails: any[] = JSON.parse(productDetailsJson);

    console.log(`✅ Loaded ${productDetails.length} product details\n`);

    // Create import job
    const jobId = await importService.startImportJob({
      jobType: ScrapingJobType.FULL,
      useApi: false,
      maxProducts: productDetails.length,
    });

    console.log(`📋 Import Job ID: ${jobId}\n`);

    // Import each product
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const maxProducts = TEST_MODE ? 10 : productDetails.length;

    for (let i = 0; i < Math.min(maxProducts, productDetails.length); i++) {
      const detail = productDetails[i];
      const progress = `[${i + 1}/${Math.min(maxProducts, productDetails.length)}]`;

      try {
        console.log(`${progress} Importing ${detail.name || detail.id}...`);

        // Check if product already exists in database with blob URLs
        const existingProduct = await prisma.product.findFirst({
          where: {
            OR: [
              { slug: detail.slug || generateSlug(detail.name) },
              { sourceId: detail.id },
              { sourceUrl: detail.sourceUrl },
            ],
          },
          select: { imageUrl: true, images: true },
        });

        // Upload images to blob only if missing from product/Vercel
        if (BLOB_READ_WRITE_TOKEN) {
          // Check main image - use existing blob URL if available
          const existingMainImage = existingProduct?.imageUrl;
          if (isBlobUrl(existingMainImage)) {
            // Product already has blob URL, use it
            detail.imageUrl = existingMainImage;
            console.log(`  ✓ Main image already in blob`);
          } else if (isLocalProductPath(detail.imageUrl) && !isBlobUrl(detail.imageUrl)) {
            // Upload local image to blob
            const blobUrl = await uploadToBlobIfMissing(detail.imageUrl, 'product');
            if (blobUrl) {
              detail.imageUrl = blobUrl;
              console.log(`  ☁️  Main image uploaded to blob: ${blobUrl}`);
            }
          }

          // Check additional images - use existing blob URLs if available
          if (detail.images && Array.isArray(detail.images)) {
            const existingImages = (existingProduct?.images as string[]) || [];
            const hasExistingBlobImages = existingImages.some(img => isBlobUrl(img));

            if (hasExistingBlobImages) {
              // Product already has blob images, use them
              detail.images = existingImages.filter(img => isBlobUrl(img));
              console.log(`  ✓ Additional images already in blob`);
            } else {
              // Upload local images to blob
              const uploadedImages: string[] = [];
              for (const img of detail.images) {
                if (isBlobUrl(img)) {
                  uploadedImages.push(img);
                } else if (isLocalProductPath(img)) {
                  const blobUrl = await uploadToBlobIfMissing(img, 'product');
                  uploadedImages.push(blobUrl || img);
                } else {
                  uploadedImages.push(img);
                }
              }
              detail.images = uploadedImages;
            }
          }
        }

        // Import product
        const result = await importService['importProduct'](detail, jobId, {
          useApi: false,
        });

        if (result.created) {
          created++;
          console.log(`  ✅ Created`);
        } else if (result.updated) {
          updated++;
          console.log(`  ✅ Updated`);
        } else {
          skipped++;
          console.log(`  ⏭️  Skipped (already exists)`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update job status
    try {
      await prisma.scrapingJob.updateMany({
        where: { id: jobId },
        data: {
          status: ScrapingJobStatus.COMPLETED,
          completedAt: new Date(),
          productsProcessed: Math.min(maxProducts, productDetails.length),
          productsCreated: created,
          productsUpdated: updated,
        },
      });
    } catch (error) {
      console.warn('⚠️  Could not update job status');
    }

    console.log('\n✅ Import complete!');
    console.log(`📊 Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}\n`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

/**
 * Full verification mode (both scrape and import)
 */
async function fullVerification() {
  console.log('🌱 Full Plantmark Verification\n');

  const importService = new DataImportService({
    baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
    rateLimitMs: parseInt(process.env.PLANTMARK_RATE_LIMIT_MS || '2000'),
  });

  const scraper = new PlantmarkScraper({
    baseUrl: process.env.PLANTMARK_BASE_URL || 'https://www.plantmark.com.au',
    rateLimitMs: parseInt(process.env.PLANTMARK_RATE_LIMIT_MS || '2000'),
  });

  try {
    await scraper.initialize();

    // Step 1: Check for missing products (handle pagination - 24 products per page)
    if (!SKIP_PRODUCT_CHECK) {
      console.log('Step 1: Checking for missing products (with pagination)...\n');

      const scrapedProducts: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        console.log(`  Scraping page ${page}...`);
        const result = await scraper.scrapeProducts(page);
        scrapedProducts.push(...result.products);
        hasMore = result.hasMore;
        
        console.log(`  Found ${result.products.length} products on page ${page} (total: ${scrapedProducts.length})`);
        
        if (hasMore) {
          page++;
          await sleepWithJitter(2000);
        }
      }

      // Get all existing products from database
      const dbProducts = await prisma.product.findMany({
        select: { slug: true, sourceId: true, sourceUrl: true },
      });

      const dbProductSlugs = new Set(dbProducts.map(p => p.slug));
      const dbProductSourceIds = new Set(dbProducts.map(p => p.sourceId).filter(Boolean));
      const dbProductSourceUrls = new Set(dbProducts.map(p => p.sourceUrl).filter(Boolean));

      const missingProducts = scrapedProducts.filter((p: any) => {
        if (!p.sourceUrl) return false;
        const slug = generateSlug(p.name || p.id);
        return (
          !dbProductSlugs.has(slug) &&
          !dbProductSourceIds.has(p.id) &&
          !dbProductSourceUrls.has(p.sourceUrl)
        );
      });

      console.log(`📊 Found ${scrapedProducts.length} products on Plantmark`);
      console.log(`📊 Found ${dbProducts.length} products in database`);
      console.log(`📊 Missing products: ${missingProducts.length}\n`);

      if (missingProducts.length > 0) {
        console.log(`Importing ${missingProducts.length} missing products...\n`);

        const jobId = await importService.startImportJob({
          jobType: ScrapingJobType.INCREMENTAL,
          useApi: false,
          maxProducts: missingProducts.length,
        });

        const maxProducts = TEST_MODE ? 10 : missingProducts.length;

        for (let i = 0; i < Math.min(maxProducts, missingProducts.length); i++) {
          const product = missingProducts[i];
          const progress = `[${i + 1}/${Math.min(maxProducts, missingProducts.length)}]`;

          try {
            console.log(`${progress} Importing ${product.name || product.id}...`);

            if (!product.sourceUrl) {
              console.log(`  ⚠️  No sourceUrl, skipping`);
              continue;
            }

            // Navigate to and scrape product detail page (opens browser window, clicks into product)
            const detail = await scraper.scrapeProductDetail(product.sourceUrl);
            if (detail) {
              const result = await importService['importProduct'](detail, jobId, {
                useApi: false,
              });

              if (result.created) {
                console.log(`  ✅ Created`);
              } else if (result.updated) {
                console.log(`  ✅ Updated`);
              }
            }

            await sleepWithJitter(2000);
          } catch (error) {
            console.log(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        try {
          await prisma.scrapingJob.updateMany({
            where: { id: jobId },
            data: {
              status: ScrapingJobStatus.COMPLETED,
              completedAt: new Date(),
            },
          });
        } catch (error) {
          console.warn('⚠️  Could not update job status');
        }
      }
    }

    // Step 2: Category mapping check (if not skipped)
    if (!SKIP_CATEGORY_CHECK) {
      console.log('\nStep 2: Checking category mappings (primary categories only)...\n');

      // Get all products with their categories
      const productsWithCategories = await prisma.product.findMany({
        where: { categoryId: { not: null } },
        select: {
          id: true,
          name: true,
          slug: true,
          categoryId: true,
          category: {
            select: {
              id: true,
              name: true,
              parentId: true,
            },
          },
        },
      });

      // Get all primary categories (parentId is null)
      const primaryCategories = await prisma.category.findMany({
        where: { parentId: null },
        select: { id: true, name: true },
      });
      const primaryCategoryIds = new Set(primaryCategories.map(c => c.id));

      // Find products assigned to sub-categories
      const productsInSubCategories = productsWithCategories.filter(
        (p) => p.category && p.category.parentId !== null
      );

      console.log(`📊 Total products with categories: ${productsWithCategories.length}`);
      console.log(`📊 Products in primary categories: ${productsWithCategories.length - productsInSubCategories.length}`);
      console.log(`📊 Products incorrectly in sub-categories: ${productsInSubCategories.length}\n`);

      if (productsInSubCategories.length > 0) {
        console.log('⚠️  Found products assigned to sub-categories. Fixing...\n');

        // Helper function to get primary category (traverse up the tree)
        async function getPrimaryCategory(categoryId: string): Promise<string | null> {
          let currentId: string | null = categoryId;
          const visited = new Set<string>();

          while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const category = await prisma.category.findUnique({
              where: { id: currentId },
              select: { id: true, parentId: true },
            });

            if (!category) return null;
            if (!category.parentId) return category.id; // Found primary category
            currentId = category.parentId;
          }

          return null;
        }

        // Fix products assigned to sub-categories
        let fixed = 0;
        for (const product of productsInSubCategories.slice(0, TEST_MODE ? 10 : productsInSubCategories.length)) {
          if (!product.categoryId) continue;

          const primaryCategoryId = await getPrimaryCategory(product.categoryId);
          if (primaryCategoryId && primaryCategoryId !== product.categoryId) {
            try {
              await prisma.product.update({
                where: { id: product.id },
                data: { categoryId: primaryCategoryId },
              });
              fixed++;
              console.log(`  ✅ Fixed ${product.name}: moved to primary category`);
            } catch (error) {
              console.log(`  ❌ Failed to fix ${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }

        console.log(`\n✅ Fixed ${fixed} products (moved to primary categories)\n`);
      } else {
        console.log('✅ All products are correctly assigned to primary categories\n');
      }
    }

    // Step 3: Content completeness check (if not skipped)
    if (!SKIP_CONTENT_CHECK) {
      console.log('\nStep 3: Checking content completeness...\n');

      const productsWithMissingContent = await prisma.product.findMany({
        where: {
          OR: [
            { content: null },
            {
              content: {
                OR: [
                  { detailedDescription: null },
                  { detailedDescription: '' },
                  { careInstructions: null },
                  { careInstructions: '' },
                ],
              },
            },
          ],
        },
        select: { id: true, name: true, sourceUrl: true },
        take: TEST_MODE ? 10 : 100,
      });

      console.log(`📊 Products with missing content: ${productsWithMissingContent.length}\n`);

      if (productsWithMissingContent.length > 0 && !TEST_MODE) {
        console.log('⚠️  Content enrichment would be performed here\n');
      }
    }

    // Step 4: Image completeness check (if not skipped)
    if (!SKIP_IMAGE_CHECK) {
      console.log('\nStep 4: Checking image completeness...\n');

      const productsWithMissingImages = await prisma.product.findMany({
        where: {
          OR: [
            { imageUrl: null },
            { imageUrl: '' },
            { images: { equals: [] } },
          ],
        },
        select: { id: true, name: true, sourceUrl: true },
        take: TEST_MODE ? 10 : 100,
      });

      console.log(`📊 Products with missing images: ${productsWithMissingImages.length}\n`);

      if (productsWithMissingImages.length > 0 && !TEST_MODE) {
        console.log('⚠️  Image download would be performed here\n');
      }
    }

    console.log('✅ Full verification complete!\n');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

/**
 * Main function
 */
async function main() {
  // Ensure DATABASE_URL points to non-pooling connection for scripts
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL_NON_POOLING) {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl.includes('?pgbouncer=true') || dbUrl.includes('pooler')) {
      process.env.DATABASE_URL_NON_POOLING = dbUrl.replace(/[?&]pgbouncer=true/, '').replace(/pooler/, 'direct');
      console.log('⚠️  Using non-pooling database connection for script\n');
    }
  }

  if (SCRAPE_ONLY) {
    await scrapeOnly();
  } else if (IMPORT_ONLY) {
    await importOnly();
  } else {
    await fullVerification();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

