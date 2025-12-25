import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';
import { Prisma } from '@prisma/client';
import { generateSlug } from '@nursery/data-import';

// Force server-side only
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 600; // 10 minutes max

/**
 * Helper function to get the primary category (root category with no parent)
 */
async function getPrimaryCategory(categoryId: string | null): Promise<{ id: string; name: string } | null> {
  if (!categoryId) return null;
  
  let currentCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, name: true, parentId: true },
  });
  
  if (!currentCategory) return null;
  
  // Traverse up the tree until we find a category with no parent
  while (currentCategory.parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: currentCategory.parentId },
      select: { id: true, name: true, parentId: true },
    });
    
    if (!parent) break;
    currentCategory = parent;
  }
  
  return { id: currentCategory.id, name: currentCategory.name };
}

export async function POST(request: NextRequest) {
  try {
    const { limit, missingImagesOnly, checkCategories } = await request.json().catch(() => ({}));
    const maxProducts = limit ? parseInt(limit) : 100;
    const onlyMissingImages = missingImagesOnly === true;
    const shouldCheckCategories = checkCategories === true;

    console.log(`🔧 Starting product rescrape (limit: ${maxProducts}, missingImagesOnly: ${onlyMissingImages}, checkCategories: ${shouldCheckCategories})...`);

    // Only import in development/local - skip during build
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Scraping is only available in local development environment',
        },
        { status: 403 }
      );
    }

    // Use lazy getter to prevent build-time analysis
    const { getPlantmarkScraper } = await import('@nursery/data-import');
    const PlantmarkScraper = await getPlantmarkScraper();
    const { DataImportService } = await import('@nursery/data-import');

    // Check environment variables (strip quotes if present)
    const plantmarkEmail = process.env.PLANTMARK_EMAIL?.replace(/^"|"$/g, '') || '';
    const plantmarkPassword = process.env.PLANTMARK_PASSWORD?.replace(/^"|"$/g, '') || '';
    
    if (!plantmarkEmail || !plantmarkPassword) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing Plantmark credentials',
          details: 'PLANTMARK_EMAIL and PLANTMARK_PASSWORD must be set in apps/web/.env.local',
          debug: {
            hasEmail: !!process.env.PLANTMARK_EMAIL,
            hasPassword: !!process.env.PLANTMARK_PASSWORD,
            emailLength: process.env.PLANTMARK_EMAIL?.length || 0,
            passwordLength: process.env.PLANTMARK_PASSWORD?.length || 0,
          }
        },
        { status: 400 }
      );
    }

    // Initialize scraper
    const scraper = new PlantmarkScraper({
      email: plantmarkEmail,
      password: plantmarkPassword,
      baseUrl: process.env.PLANTMARK_BASE_URL?.replace(/^"|"$/g, '') || 'https://www.plantmark.com.au',
    });
    
    try {
      await scraper.initialize();
      console.log('✅ Scraper initialized');
    } catch (initError) {
      console.error('❌ Failed to initialize scraper:', initError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to initialize scraper',
          details: initError instanceof Error ? initError.message : String(initError)
        },
        { status: 500 }
      );
    }

    // Initialize import service
    const importService = new DataImportService({
      baseUrl: process.env.PLANTMARK_BASE_URL?.replace(/^"|"$/g, '') || 'https://www.plantmark.com.au',
      email: plantmarkEmail,
      password: plantmarkPassword,
    });

    // Get products to rescrape
    let products;
    const baseSelect = {
      id: true,
      name: true,
      slug: true,
      sourceUrl: true,
    };
    
    if (onlyMissingImages) {
      // Get products with Plantmark URLs or no images
      products = await prisma.product.findMany({
        where: {
          OR: [
            {
              imageUrl: {
                contains: 'plantmark.com.au',
              },
            },
            {
              images: { equals: Prisma.JsonNull },
            },
            {
              imageUrl: { equals: null },
            },
          ],
        },
        select: {
          ...baseSelect,
          imageUrl: true,
          images: true,
          ...(shouldCheckCategories ? { categoryId: true } : {}),
        },
        take: maxProducts,
      });
    } else {
      // Get all products with sourceUrl
      products = await prisma.product.findMany({
        where: {
          sourceUrl: { not: null },
        },
        select: {
          ...baseSelect,
          ...(shouldCheckCategories ? { categoryId: true } : {}),
        },
        take: maxProducts,
      });
    }

    console.log(`Found ${products.length} products to rescrape`);

    // Initialize stats early
    const stats = {
      imagesAdded: 0,
      descriptionsUpdated: 0,
      attributesUpdated: 0,
      categoriesFixed: 0,
    };

    if (products.length === 0) {
      await scraper.close();
      return NextResponse.json({
        success: true,
        message: 'No products to rescrape',
        stats: {
          productsProcessed: 0,
          updated: 0,
          skipped: 0,
          errors: 0,
          ...stats,
        },
      });
    }

    // Test scraper with first product before processing all
    console.log('🧪 Testing scraper with first product...');
    try {
      const testProduct = products[0];
      if (testProduct.sourceUrl) {
        const testResult = await scraper.scrapeProductDetail(testProduct.sourceUrl);
        if (testResult) {
          console.log(`✅ Test scrape successful: ${testResult.name || testProduct.name} - Images: ${testResult.images?.length || 0}`);
        } else {
          console.warn(`⚠️  Test scrape returned null for: ${testProduct.name}`);
        }
      }
    } catch (testError) {
      console.error('❌ Test scrape failed:', testError instanceof Error ? testError.message : String(testError));
      await scraper.close();
      return NextResponse.json(
        { 
          success: false,
          error: 'Scraper test failed',
          details: testError instanceof Error ? testError.message : String(testError),
          note: 'Check server logs for detailed error. The scraper may not be able to access Plantmark or the scrape code file.'
        },
        { status: 500 }
      );
    }

    // Create a temporary job for tracking
    const jobId = await importService.startImportJob({
      jobType: 'INCREMENTAL',
      useApi: false,
    });

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process products in batches
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      for (const product of batch) {
        try {
          if (!product.sourceUrl) {
            console.log(`  ⚠️  Skipping ${product.name}: no sourceUrl`);
            skipped++;
            continue;
          }

          console.log(`Processing: ${product.name} (${i + 1}/${products.length}) - ${product.sourceUrl}`);

          // Scrape product detail page
          let scrapedProduct;
          try {
            scrapedProduct = await scraper.scrapeProductDetail(product.sourceUrl);
          } catch (scrapeError) {
            console.error(`  ❌ Scrape error for ${product.name}:`, scrapeError instanceof Error ? scrapeError.message : String(scrapeError));
            if (scrapeError instanceof Error && scrapeError.stack) {
              console.error(`  Stack:`, scrapeError.stack);
            }
            errors++;
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }
          
          if (!scrapedProduct) {
            console.log(`  ⚠️  Could not scrape: ${product.name} - scraper returned null`);
            skipped++;
            continue;
          }

          console.log(`  ✅ Scraped: ${scrapedProduct.name || product.name} - Images: ${scrapedProduct.images?.length || 0}, Description: ${scrapedProduct.description ? 'Yes' : 'No'}`);

          // Check category if requested
          if (shouldCheckCategories && scrapedProduct.category) {
            try {
              // Get the product's current primary category
              const productCategoryId = 'categoryId' in product ? (product.categoryId as string | null) : null;
              const currentPrimaryCategory = await getPrimaryCategory(productCategoryId);
              
              // Find the scraped category using the same slug generation as DataImportService
              const scrapedCategoryName = scrapedProduct.category;
              const scrapedCategorySlug = generateSlug(scrapedCategoryName);
              
              // Find the category by slug first
              let scrapedCategory = await prisma.category.findFirst({
                where: { slug: scrapedCategorySlug },
                select: { id: true, name: true, parentId: true },
              });
              
              // If not found by slug, try to find by name (case-insensitive)
              if (!scrapedCategory) {
                const allCategories = await prisma.category.findMany({
                  select: { id: true, name: true, parentId: true },
                });
                scrapedCategory = allCategories.find(
                  cat => cat.name.toLowerCase() === scrapedCategoryName.toLowerCase()
                ) || null;
              }
              
              if (scrapedCategory) {
                // Get the primary category for the scraped category
                const scrapedPrimaryCategory = await getPrimaryCategory(scrapedCategory.id);
                
                // Compare primary categories
                if (scrapedPrimaryCategory && currentPrimaryCategory) {
                  if (scrapedPrimaryCategory.id !== currentPrimaryCategory.id) {
                    console.log(`  🔄 Category mismatch detected:`);
                    console.log(`     Current: ${currentPrimaryCategory.name} (${currentPrimaryCategory.id})`);
                    console.log(`     Scraped: ${scrapedPrimaryCategory.name} (${scrapedPrimaryCategory.id})`);
                    
                    // Update product to use the correct primary category
                    await prisma.product.update({
                      where: { id: product.id },
                      data: { categoryId: scrapedPrimaryCategory.id },
                    });
                    
                    stats.categoriesFixed++;
                    console.log(`  ✅ Updated product category to: ${scrapedPrimaryCategory.name}`);
                  } else {
                    console.log(`  ✓ Category is correct: ${currentPrimaryCategory.name}`);
                  }
                } else if (scrapedPrimaryCategory && !currentPrimaryCategory) {
                  // Product has no category, assign the scraped primary category
                  await prisma.product.update({
                    where: { id: product.id },
                    data: { categoryId: scrapedPrimaryCategory.id },
                  });
                  
                  stats.categoriesFixed++;
                  console.log(`  ✅ Assigned category: ${scrapedPrimaryCategory.name}`);
                } else if (!scrapedPrimaryCategory) {
                  console.log(`  ⚠️  Could not determine primary category for "${scrapedCategoryName}"`);
                }
              } else {
                console.log(`  ⚠️  Could not find category "${scrapedCategoryName}" in database`);
              }
            } catch (categoryError) {
              console.error(`  ⚠️  Error checking category for ${product.name}:`, categoryError instanceof Error ? categoryError.message : String(categoryError));
              // Continue processing even if category check fails
            }
          }

          // Import/update product with new data
          let result;
          try {
            result = await importService.importProduct(scrapedProduct, jobId, {
              useApi: false,
            });
          } catch (importError) {
            console.error(`  ❌ Import error for ${product.name}:`, importError instanceof Error ? importError.message : String(importError));
            errors++;
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue;
          }

          if (result.updated || result.created) {
            updated++;
            console.log(`  ✅ Updated product: ${product.name}`);
            
            // Track what was updated
            if (scrapedProduct.images && scrapedProduct.images.length > 0) {
              stats.imagesAdded += scrapedProduct.images.length;
              console.log(`    📸 Added ${scrapedProduct.images.length} images`);
            }
            if (scrapedProduct.description) {
              stats.descriptionsUpdated++;
              console.log(`    📝 Updated description`);
            }
            if (scrapedProduct.specifications) {
              stats.attributesUpdated++;
              console.log(`    📋 Updated specifications`);
            }
          } else {
            console.log(`  ⚠️  Product not updated: ${product.name} - result:`, JSON.stringify(result));
            skipped++;
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          errors++;
          console.error(`  ❌ Unexpected error processing ${product.name}:`, error instanceof Error ? error.message : String(error));
          if (error instanceof Error && error.stack) {
            console.error(`  Stack:`, error.stack);
          }
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    // Clean up scraper
    try {
      await scraper.close();
    } catch (closeError) {
      console.warn('Error closing scraper:', closeError);
    }

    return NextResponse.json({
      success: true,
      message: 'Product rescrape complete',
      stats: {
        productsProcessed: products.length,
        updated,
        skipped,
        errors,
        ...stats,
      },
    });
  } catch (error) {
    console.error('Error rescraping products:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

