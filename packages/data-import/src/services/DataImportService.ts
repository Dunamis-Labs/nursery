import { prisma, Prisma } from '@nursery/db';
import { PlantmarkApiClient } from './PlantmarkApiClient';
import { PlantmarkScraper } from './PlantmarkScraper';
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
  private currentJobId: string | null = null;

  constructor(config: PlantmarkApiConfig = {}) {
    this.apiClient = new PlantmarkApiClient(config);
    this.scraper = new PlantmarkScraper(config);
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
      for (const product of products) {
        try {
          const importResult = await this.importProduct(product, jobId, options);
          if (importResult.created) {
            result.created++;
          } else if (importResult.updated) {
            result.updated++;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push({
            productId: product.id,
            url: product.sourceUrl,
            message: errorMessage,
            timestamp: new Date(),
          });
        }

        // Update job progress
        await prisma.scrapingJob.update({
          where: { id: jobId },
          data: {
            productsProcessed: { increment: 1 },
            productsCreated: result.created,
            productsUpdated: result.updated,
            errors: result.errors as Prisma.InputJsonValue,
          },
        });

        // Check max products limit
        if (options.maxProducts && result.created + result.updated >= options.maxProducts) {
          break;
        }
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

    await this.scraper.initialize();

    while (hasMore) {
      const result = await this.scraper.scrapeProducts(page, options.category);
      products.push(...result.products);
      hasMore = result.hasMore;

      page++;

      if (options.maxProducts && products.length >= options.maxProducts) {
        break;
      }
    }

    return products.slice(0, options.maxProducts);
  }

  /**
   * Import a single product into the database
   */
  private async importProduct(
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
      imageUrl: normalized.imageUrl,
      images: normalized.images ? (normalized.images as Prisma.InputJsonValue) : undefined,
      metadata: normalized.metadata ? (normalized.metadata as Prisma.InputJsonValue) : undefined,
    };

    if (existing) {
      // Update existing product
      await prisma.product.update({
        where: { id: existing.id },
        data: productData,
      });
      return { created: false, updated: true };
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
    
    let category = await prisma.category.findFirst({
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

    return category;
  }
}


