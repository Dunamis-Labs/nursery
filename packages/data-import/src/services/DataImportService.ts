import { prisma, Prisma } from '@nursery/db';
import { PlantmarkApiClient } from './PlantmarkApiClient';
import { PlantmarkScraper } from './PlantmarkScraper';
import { ImageDownloadService } from './ImageDownloadService';
import { validateProduct, normalizeProduct, generateSlug } from '../utils/validation';
import type { PlantmarkProduct, ImportResult, ScrapingJobData, PlantmarkApiConfig } from '../types';
import { ScrapingJobType, ScrapingJobStatus, ProductSource, ProductType, AvailabilityStatus } from '@nursery/db';

export interface ImportOptions {
  useApi?: boolean; // Try API first, fallback to scraping
  jobType?: ScrapingJobType;
  category?: string;
  maxProducts?: number; // Limit for testing
}

/**
 * Main data import service that orchestrates Plantmark API/Scraping
 * and imports products into the database
 */
export class DataImportService {
  private apiClient: PlantmarkApiClient;
  private scraper: PlantmarkScraper;
  private imageDownloader: ImageDownloadService;
  private currentJobId: string | null = null;

  constructor(config: PlantmarkApiConfig = {}) {
    this.apiClient = new PlantmarkApiClient(config);
    this.scraper = new PlantmarkScraper(config);
    this.imageDownloader = new ImageDownloadService({
      baseUrl: '/products/',
    });
  }

  /**
   * Start a new import job
   */
  async startImportJob(options: ImportOptions = {}): Promise<string> {
    const jobType = options.jobType || ScrapingJobType.FULL;
    
    // Create job record
    const job = await prisma.scrapingJob.create({
      data: {
        jobType,
        status: ScrapingJobStatus.PENDING,
        productsProcessed: 0,
        productsCreated: 0,
        productsUpdated: 0,
        errors: [],
        metadata: {
          useApi: options.useApi ?? true,
          category: options.category,
          maxProducts: options.maxProducts,
        },
      },
    });

    this.currentJobId = job.id;
    return job.id;
  }

  /**
   * Execute import job
   */
  async executeImport(jobId: string, options: ImportOptions = {}): Promise<ImportResult> {
    const job = await prisma.scrapingJob.findUnique({ where: { id: jobId } });
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Update job status
    await prisma.scrapingJob.update({
      where: { id: jobId },
      data: {
        status: ScrapingJobStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    const result: ImportResult = {
      created: 0,
      updated: 0,
      errors: [],
    };

    try {
      const useApi = options.useApi ?? true;
      let products: PlantmarkProduct[] = [];

      if (useApi) {
        // Try API first
        try {
          products = await this.importFromApi(options);
        } catch (apiError) {
          console.warn('API import failed, falling back to scraping:', apiError);
          products = await this.importFromScraping(options);
        }
      } else {
        // Use scraping directly
        products = await this.importFromScraping(options);
      }

      // Process and import products
      let skipped = 0;
      let processed = 0;
      
      for (const product of products) {
        try {
          const importResult = await this.importProduct(product, jobId, options);
          processed++;
          
          if (importResult.created) {
            result.created++;
          } else if (importResult.updated) {
            result.updated++;
          } else {
            // Product exists but no changes detected (skipped)
            skipped++;
          }
        } catch (error) {
          processed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push({
            productId: product.id,
            url: product.sourceUrl,
            message: errorMessage,
            timestamp: new Date(),
          });
          
          // If it's a connection error, log it but continue
          if (errorMessage.includes('P1001') || errorMessage.includes('Can\'t reach database')) {
            console.warn(`⚠️  Database connection issue for product ${product.id}, continuing...`);
          }
        }

        // Update job progress periodically (every 10 products or on errors)
        if (processed % 10 === 0 || result.errors.length > 0) {
          try {
            const currentJob = await prisma.scrapingJob.findUnique({ where: { id: jobId } });
            await prisma.scrapingJob.update({
              where: { id: jobId },
              data: {
                productsProcessed: processed,
                productsCreated: result.created,
                productsUpdated: result.updated,
                errors: result.errors.slice(-50) as Prisma.InputJsonValue, // Keep last 50 errors
                metadata: {
                  ...((currentJob?.metadata as Record<string, unknown>) || {}),
                  skipped,
                } as Prisma.InputJsonValue,
              },
            });
          } catch (updateError) {
            // If job update fails, log but continue scraping
            console.warn('⚠️  Could not update job progress, continuing scrape...');
          }
        }

        // Check max products limit
        if (options.maxProducts && processed >= options.maxProducts) {
          break;
        }
      }
      
      // Final job update
      try {
        await prisma.scrapingJob.update({
          where: { id: jobId },
          data: {
            productsProcessed: processed,
            productsCreated: result.created,
            productsUpdated: result.updated,
            errors: result.errors.slice(-50) as Prisma.InputJsonValue,
            metadata: {
              skipped,
            } as Prisma.InputJsonValue,
          },
        });
      } catch (updateError) {
        console.warn('⚠️  Could not update final job status');
      }

      // Mark job as completed
      await prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          status: ScrapingJobStatus.COMPLETED,
          completedAt: new Date(),
          productsCreated: result.created,
          productsUpdated: result.updated,
          errors: result.errors as Prisma.InputJsonValue,
        },
      });

      return result;
    } catch (error) {
      // Mark job as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await prisma.scrapingJob.update({
        where: { id: jobId },
        data: {
          status: ScrapingJobStatus.FAILED,
          completedAt: new Date(),
          errors: [
            ...result.errors,
            {
              message: errorMessage,
              timestamp: new Date(),
            },
          ] as Prisma.InputJsonValue,
        },
      });

      throw error;
    } finally {
      // Cleanup scraper browser if used
      await this.scraper.close();
    }
  }

  /**
   * Import products from API
   */
  private async importFromApi(options: ImportOptions): Promise<PlantmarkProduct[]> {
    const products: PlantmarkProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.apiClient.getProducts(page, 50, options.category);
      
      if (response.products) {
        products.push(...response.products);
      }

      hasMore = response.hasMore ?? false;
      page++;

      if (options.maxProducts && products.length >= options.maxProducts) {
        break;
      }
    }

    return products.slice(0, options.maxProducts);
  }

  /**
   * Import products from scraping
   */
  private async importFromScraping(options: ImportOptions): Promise<PlantmarkProduct[]> {
    const products: PlantmarkProduct[] = [];
    let page = 1;
    let hasMore = true;
    let consecutiveEmptyPages = 0;

    await this.scraper.initialize();

    while (hasMore && consecutiveEmptyPages < 2) {
      const result = await this.scraper.scrapeProducts(page, options.category);
      
      if (result.products.length === 0) {
        consecutiveEmptyPages++;
      } else {
        consecutiveEmptyPages = 0;
        products.push(...result.products);
      }
      
      hasMore = result.hasMore;

      // Stop if we've reached the max products limit
      if (options.maxProducts && products.length >= options.maxProducts) {
        break;
      }

      // For infinite scroll pages, we typically only need page 1
      // But if hasMore is true, try page 2 as well
      if (page === 1 && !hasMore && products.length > 0) {
        // Got products but hasMore is false - might be infinite scroll that stopped early
        // Try one more scroll attempt by going to page 2
        page++;
      } else {
        page++;
      }
    }

    return products.slice(0, options.maxProducts);
  }

  /**
   * Import a single product into the database
   */
  async importProduct(
    product: PlantmarkProduct,
    jobId: string,
    options?: ImportOptions
  ): Promise<{ created: boolean; updated: boolean }> {
    // Validate product
    const validation = validateProduct(product);
    if (!validation.valid || !validation.product) {
      throw new Error(`Invalid product: ${validation.errors?.join(', ')}`);
    }

    const normalized = normalizeProduct(validation.product);

    // Download images before saving
    let downloadedImages: string[] = [];
    let localImageUrl: string | undefined = normalized.imageUrl;
    
    try {
      // Always try to download main image if it's from Plantmark (even if product exists)
      if (normalized.imageUrl && normalized.imageUrl.includes('plantmark.com.au')) {
        console.log(`  📥 Downloading main image for ${normalized.name}: ${normalized.imageUrl}`);
        const mainImageResult = await this.imageDownloader.downloadImage(
          normalized.imageUrl,
          normalized.slug
        );
        if (mainImageResult.success && mainImageResult.localPath) {
          localImageUrl = mainImageResult.localPath;
          console.log(`  ✅ Main image downloaded: ${mainImageResult.localPath}`);
        } else {
          console.warn(`  ⚠️  Main image download failed: ${mainImageResult.error || 'Unknown error'}`);
          // Keep original URL if download fails (will be handled by fix-image-paths later)
        }
      } else if (normalized.imageUrl && !normalized.imageUrl.startsWith('/products/')) {
        // If imageUrl exists but isn't local, try to download it
        console.log(`  📥 Attempting to download image from: ${normalized.imageUrl}`);
        const mainImageResult = await this.imageDownloader.downloadImage(
          normalized.imageUrl,
          normalized.slug
        );
        if (mainImageResult.success && mainImageResult.localPath) {
          localImageUrl = mainImageResult.localPath;
          console.log(`  ✅ Image downloaded: ${mainImageResult.localPath}`);
        }
      }

      // Download additional images
      if (normalized.images && Array.isArray(normalized.images) && normalized.images.length > 0) {
        const plantmarkImages = normalized.images.filter((url: string) => 
          typeof url === 'string' && url.includes('plantmark.com.au')
        );
        
        if (plantmarkImages.length > 0) {
          console.log(`  📥 Downloading ${plantmarkImages.length} additional images for ${normalized.name}`);
          const result = await this.imageDownloader.downloadImages(plantmarkImages, normalized.slug);
          downloadedImages = result.downloaded;
          
          if (result.failed.length > 0) {
            console.warn(`  ⚠️  Failed to download ${result.failed.length} images:`, result.failed.map(f => f.url));
          }
          
          if (downloadedImages.length > 0) {
            console.log(`  ✅ Downloaded ${downloadedImages.length} images`);
          }
          
          // Combine downloaded images with any non-Plantmark images
          const otherImages = normalized.images.filter((url: string) => 
            typeof url === 'string' && !url.includes('plantmark.com.au')
          );
          downloadedImages = [...downloadedImages, ...otherImages];
        } else {
          downloadedImages = normalized.images as string[];
        }
      }
    } catch (error) {
      console.error(`  ❌ Failed to download images for product ${normalized.name}:`, error);
      // Continue with original URLs if download fails
      downloadedImages = (normalized.images as string[]) || [];
    }

    // Find or create category
    const category = await this.findOrCreateCategory(normalized.category || 'Uncategorized');

    // Check if product already exists
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { sourceId: normalized.sourceId || normalized.id },
          { sourceUrl: normalized.sourceUrl },
          { slug: normalized.slug },
        ],
      },
    });

    // Build metadata object with all additional product information
    const metadata: Record<string, unknown> = {
      ...(normalized.metadata || {}),
      ...(normalized.specifications ? { specifications: normalized.specifications } : {}),
      ...(normalized.careInstructions ? { careInstructions: normalized.careInstructions } : {}),
      ...(normalized.plantingInstructions ? { plantingInstructions: normalized.plantingInstructions } : {}),
      ...(normalized.variants && normalized.variants.length > 0 ? { variants: normalized.variants } : {}),
      scrapedAt: new Date().toISOString(),
    };

    const productData: Prisma.ProductUncheckedCreateInput = {
      name: normalized.name,
      slug: normalized.slug || generateSlug(normalized.name),
      description: normalized.description,
      productType: ProductType.PHYSICAL,
      price: normalized.price ? normalized.price : 0,
      availability: normalized.availability
        ? (normalized.availability as AvailabilityStatus)
        : AvailabilityStatus.IN_STOCK,
      categoryId: category.id,
      source: (options?.useApi ?? true) ? ProductSource.API : ProductSource.SCRAPED,
      sourceId: normalized.sourceId || normalized.id,
      sourceUrl: normalized.sourceUrl,
      botanicalName: normalized.botanicalName,
      commonName: normalized.commonName,
      imageUrl: localImageUrl,
      images: downloadedImages.length > 0 ? (downloadedImages as Prisma.InputJsonValue) : undefined,
      metadata: Object.keys(metadata).length > 0 ? (metadata as Prisma.InputJsonValue) : undefined,
    };

    if (existing) {
      // Smart merge: update changed fields and fill missing blanks
      const updateData: Partial<Prisma.ProductUncheckedUpdateInput> = {};
      let hasChanges = false;

      // Helper to check if value exists and is different
      const shouldUpdate = <T>(newValue: T | null | undefined, existingValue: T | null | undefined): boolean => {
        // Update if new value exists and is different, OR if existing is null/undefined and new has value
        if (newValue === null || newValue === undefined) return false;
        if (existingValue === null || existingValue === undefined) return true;
        return JSON.stringify(newValue) !== JSON.stringify(existingValue);
      };

      // Helper to merge metadata objects
      const mergeMetadata = (existingMeta: Record<string, unknown> | null, newMeta: Record<string, unknown> | null): Record<string, unknown> => {
        const merged = { ...(existingMeta || {}) };
        if (newMeta) {
          // Merge specifications if both exist
          if (merged.specifications && newMeta.specifications) {
            merged.specifications = { ...(merged.specifications as Record<string, unknown>), ...(newMeta.specifications as Record<string, unknown>) };
          } else if (newMeta.specifications) {
            merged.specifications = newMeta.specifications;
          }
          
          // Merge variants if both exist (prefer new ones)
          if (newMeta.variants) {
            merged.variants = newMeta.variants;
          }
          
          // Merge other fields
          Object.keys(newMeta).forEach(key => {
            if (key !== 'specifications' && key !== 'variants') {
              if (newMeta[key] !== null && newMeta[key] !== undefined) {
                merged[key] = newMeta[key];
              }
            }
          });
        }
        return merged;
      };

      // Check and update each field
      if (shouldUpdate(productData.name, existing.name)) {
        updateData.name = productData.name;
        hasChanges = true;
      }

      if (shouldUpdate(productData.description, existing.description)) {
        updateData.description = productData.description;
        hasChanges = true;
      }

      if (shouldUpdate(productData.price, existing.price)) {
        updateData.price = productData.price;
        hasChanges = true;
      }

      if (shouldUpdate(productData.imageUrl, existing.imageUrl)) {
        updateData.imageUrl = productData.imageUrl;
        hasChanges = true;
      }

      if (shouldUpdate(productData.images, existing.images)) {
        updateData.images = productData.images;
        hasChanges = true;
      }

      if (shouldUpdate(productData.botanicalName, existing.botanicalName)) {
        updateData.botanicalName = productData.botanicalName;
        hasChanges = true;
      }

      if (shouldUpdate(productData.commonName, existing.commonName)) {
        updateData.commonName = productData.commonName;
        hasChanges = true;
      }

      if (shouldUpdate(productData.availability, existing.availability)) {
        updateData.availability = productData.availability;
        hasChanges = true;
      }

      if (shouldUpdate(productData.sourceUrl, existing.sourceUrl)) {
        updateData.sourceUrl = productData.sourceUrl;
        hasChanges = true;
      }

      // Smart merge metadata (fill missing and update changed)
      const existingMetadata = (existing.metadata as Record<string, unknown>) || {};
      const newMetadata = metadata || {};
      const mergedMetadata = mergeMetadata(existingMetadata, newMetadata);
      
      // Check if metadata changed
      if (JSON.stringify(existingMetadata) !== JSON.stringify(mergedMetadata)) {
        updateData.metadata = mergedMetadata as Prisma.InputJsonValue;
        hasChanges = true;
      }

      // Update category if changed
      if (category.id !== existing.categoryId) {
        updateData.categoryId = category.id;
        hasChanges = true;
      }

      if (hasChanges) {
        // Update existing product with merged data
        await prisma.product.update({
          where: { id: existing.id },
          data: updateData,
        });
        return { created: false, updated: true };
      } else {
        // No changes, skip update
        return { created: false, updated: false };
      }
    } else {
      // Create new product
      await prisma.product.create({ data: productData });
      return { created: true, updated: false };
    }
  }

  /**
   * Find or create category
   */
  private async findOrCreateCategory(name: string) {
    const slug = generateSlug(name);
    
    // Retry logic for database connection issues
    let retries = 3;
    let category = null;
    
    while (retries > 0 && !category) {
      try {
        category = await prisma.category.findFirst({
          where: { slug },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name,
              slug,
            },
          });
        }
        break; // Success, exit retry loop
      } catch (error) {
        retries--;
        if (retries === 0) {
          // If all retries failed, create a default category or throw
          console.warn(`⚠️  Could not find/create category "${name}", using default`);
          // Try to get or create "Uncategorized" as fallback
          try {
            category = await prisma.category.findFirst({
              where: { slug: 'uncategorized' },
            }) || await prisma.category.create({
              data: {
                name: 'Uncategorized',
                slug: 'uncategorized',
              },
            });
          } catch (fallbackError) {
            throw new Error(`Failed to create category after retries: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }

    return category!;
  }
}


