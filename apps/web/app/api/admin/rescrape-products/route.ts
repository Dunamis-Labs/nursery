import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';
import { Prisma } from '@prisma/client';

// Force server-side only
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 600; // 10 minutes max

export async function POST(request: NextRequest) {
  try {
    const { limit, missingImagesOnly } = await request.json().catch(() => ({}));
    const maxProducts = limit ? parseInt(limit) : 100;
    const onlyMissingImages = missingImagesOnly === true;

    console.log(`🔧 Starting product rescrape (limit: ${maxProducts}, missingImagesOnly: ${onlyMissingImages})...`);

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
          id: true,
          name: true,
          slug: true,
          sourceUrl: true,
          imageUrl: true,
          images: true,
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
          id: true,
          name: true,
          slug: true,
          sourceUrl: true,
        },
        take: maxProducts,
      });
    }

    console.log(`Found ${products.length} products to rescrape`);

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
    const stats = {
      imagesAdded: 0,
      descriptionsUpdated: 0,
      attributesUpdated: 0,
    };

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

