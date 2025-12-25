import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

// Force server-side only - prevent client-side bundling
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max (for long-running scrapes)

// The 15 main Plantmark categories
const PLANTMARK_CATEGORIES = [
  'Trees',
  'Shrubs',
  'Grasses',
  'Hedging and Screening',
  'Groundcovers',
  'Climbers',
  'Palms, Ferns & Tropical',
  'Conifers',
  'Roses',
  'Succulents & Cacti',
  'Citrus & Fruit',
  'Herbs & Vegetables',
  'Water Plants',
  'Indoor Plants',
  'Garden Products',
] as const;

function mapToMainCategory(scrapedCategory: string | null): string | null {
  if (!scrapedCategory) return null;
  
  const lower = scrapedCategory.toLowerCase().trim();
  
  const directMap: Record<string, string> = {
    'trees': 'Trees',
    'shrubs': 'Shrubs',
    'grasses': 'Grasses',
    'hedging': 'Hedging and Screening',
    'hedging and screening': 'Hedging and Screening',
    'screening': 'Hedging and Screening',
    'groundcovers': 'Groundcovers',
    'ground covers': 'Groundcovers',
    'ground-cover': 'Groundcovers',
    'climbers': 'Climbers',
    'vines': 'Climbers',
    'palms': 'Palms, Ferns & Tropical',
    'ferns': 'Palms, Ferns & Tropical',
    'tropical': 'Palms, Ferns & Tropical',
    'palms, ferns & tropical': 'Palms, Ferns & Tropical',
    'conifers': 'Conifers',
    'roses': 'Roses',
    'succulents': 'Succulents & Cacti',
    'cacti': 'Succulents & Cacti',
    'cactus': 'Succulents & Cacti',
    'succulents & cacti': 'Succulents & Cacti',
    'citrus': 'Citrus & Fruit',
    'fruit': 'Citrus & Fruit',
    'citrus & fruit': 'Citrus & Fruit',
    'herbs': 'Herbs & Vegetables',
    'vegetables': 'Herbs & Vegetables',
    'herbs & vegetables': 'Herbs & Vegetables',
    'water plants': 'Water Plants',
    'aquatic': 'Water Plants',
    'indoor plants': 'Indoor Plants',
    'indoor': 'Indoor Plants',
    'houseplants': 'Indoor Plants',
    'garden products': 'Garden Products',
    'products': 'Garden Products',
  };
  
  if (directMap[lower]) {
    return directMap[lower];
  }
  
  // Partial matches
  if (lower.includes('tree')) return 'Trees';
  if (lower.includes('shrub')) return 'Shrubs';
  if (lower.includes('grass')) return 'Grasses';
  if (lower.includes('hedg') || lower.includes('screen')) return 'Hedging and Screening';
  if (lower.includes('ground') || lower.includes('cover')) return 'Groundcovers';
  if (lower.includes('climb') || lower.includes('vine')) return 'Climbers';
  if (lower.includes('palm') || lower.includes('fern') || lower.includes('tropical')) return 'Palms, Ferns & Tropical';
  if (lower.includes('conifer')) return 'Conifers';
  if (lower.includes('rose')) return 'Roses';
  if (lower.includes('succulent') || lower.includes('cact')) return 'Succulents & Cacti';
  if (lower.includes('citrus') || lower.includes('fruit')) return 'Citrus & Fruit';
  if (lower.includes('herb') || lower.includes('vegetable')) return 'Herbs & Vegetables';
  if (lower.includes('water') || lower.includes('aquatic') || lower.includes('pond')) return 'Water Plants';
  if (lower.includes('indoor') || lower.includes('house')) return 'Indoor Plants';
  if (lower.includes('garden') || lower.includes('product')) return 'Garden Products';
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { limit } = await request.json().catch(() => ({}));
    const maxProducts = limit ? parseInt(limit) : 100; // Default to 100 for testing

    console.log(`🔧 Starting category re-scrape (limit: ${maxProducts})...`);

    // Dynamically import PlantmarkScraper to avoid client-side code issues
    const { PlantmarkScraper } = await import('@nursery/data-import');
    
    // Initialize scraper
    const scraper = new PlantmarkScraper({
      email: process.env.PLANTMARK_EMAIL,
      password: process.env.PLANTMARK_PASSWORD,
    });
    
    await scraper.initialize();
    console.log('✅ Scraper initialized');

    // Get or create the 15 main categories
    const categoryMap = new Map<string, string>();
    for (const categoryName of PLANTMARK_CATEGORIES) {
      let category = await prisma.category.findFirst({
        where: { name: categoryName },
      });
      
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
            description: `${categoryName} from Plantmark`,
          },
        });
      }
      
      categoryMap.set(categoryName.toLowerCase(), category.id);
    }

    // Get products with sourceUrl (limit for testing)
    const products = await prisma.product.findMany({
      where: {
        sourceUrl: { not: null },
      },
      select: {
        id: true,
        sourceUrl: true,
        name: true,
        categoryId: true,
      },
      take: maxProducts,
    });

    console.log(`Found ${products.length} products to process`);

    // Process products
    const batchSize = 10;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const categoryCounts = new Map<string, number>();

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      for (const product of batch) {
        try {
          if (!product.sourceUrl) {
            skipped++;
            continue;
          }

          // Scrape product detail page
          const scrapedProduct = await scraper.scrapeProductDetail(product.sourceUrl);
          
          if (!scrapedProduct) {
            skipped++;
            continue;
          }

          // Extract category from scraped data
          const scrapedCategory = scrapedProduct.category || null;
          const mainCategory = mapToMainCategory(scrapedCategory);

          if (!mainCategory) {
            skipped++;
            continue;
          }

          // Get category ID
          const categoryId = categoryMap.get(mainCategory.toLowerCase());
          if (!categoryId) {
            skipped++;
            continue;
          }

          // Update product if category changed
          if (!product.categoryId || product.categoryId !== categoryId) {
            await prisma.product.update({
              where: { id: product.id },
              data: { categoryId },
            });
            updated++;
            categoryCounts.set(mainCategory, (categoryCounts.get(mainCategory) || 0) + 1);
          } else {
            categoryCounts.set(mainCategory, (categoryCounts.get(mainCategory) || 0) + 1);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          errors++;
          console.error(`Error processing ${product.name}:`, error instanceof Error ? error.message : String(error));
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

    // Get final counts
    const finalCounts: Record<string, number> = {};
    for (const categoryName of PLANTMARK_CATEGORIES) {
      const categoryId = categoryMap.get(categoryName.toLowerCase());
      if (categoryId) {
        const count = await prisma.product.count({
          where: { categoryId },
        });
        finalCounts[categoryName] = count;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Category re-scrape complete',
      stats: {
        productsProcessed: products.length,
        updated,
        skipped,
        errors,
      },
      categoryCounts: finalCounts,
    });
  } catch (error) {
    console.error('Error re-scraping categories:', error);
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

