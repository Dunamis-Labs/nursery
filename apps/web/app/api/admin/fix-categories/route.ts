import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

/**
 * API endpoint to fix category assignments for products
 * Maps products to the 15 main Plantmark categories based on URL structure
 * Note: This endpoint is accessible from the admin dashboard without API key
 */

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

/**
 * Map Plantmark URL paths to the 15 main categories
 * Plantmark URLs are like: /trees/product-name, /shrubs/product-name, etc.
 */
function mapUrlToCategory(urlPath: string): string | null {
  if (!urlPath) return null;
  
  // Normalize the path - remove leading/trailing slashes and split
  const pathParts = urlPath.toLowerCase().split('/').filter(p => p && p !== 'plant-finder');
  
  if (pathParts.length === 0) return null;
  
  const firstPart = pathParts[0].toLowerCase();
  
  // Direct mapping from URL slugs to categories
  const urlToCategoryMap: Record<string, string> = {
    // Trees
    'trees': 'Trees',
    'tree': 'Trees',
    
    // Shrubs
    'shrubs': 'Shrubs',
    'shrub': 'Shrubs',
    
    // Grasses
    'grasses': 'Grasses',
    'grass': 'Grasses',
    'ornamental-grasses': 'Grasses',
    
    // Hedging and Screening
    'hedging': 'Hedging and Screening',
    'hedge': 'Hedging and Screening',
    'screening': 'Hedging and Screening',
    'hedging-and-screening': 'Hedging and Screening',
    
    // Groundcovers
    'groundcovers': 'Groundcovers',
    'groundcover': 'Groundcovers',
    'ground-covers': 'Groundcovers',
    'ground-cover': 'Groundcovers',
    
    // Climbers
    'climbers': 'Climbers',
    'climber': 'Climbers',
    'vines': 'Climbers',
    'vine': 'Climbers',
    
    // Palms, Ferns & Tropical
    'palms': 'Palms, Ferns & Tropical',
    'palm': 'Palms, Ferns & Tropical',
    'ferns': 'Palms, Ferns & Tropical',
    'fern': 'Palms, Ferns & Tropical',
    'tropical': 'Palms, Ferns & Tropical',
    'palms-ferns-tropical': 'Palms, Ferns & Tropical',
    
    // Conifers
    'conifers': 'Conifers',
    'conifer': 'Conifers',
    
    // Roses
    'roses': 'Roses',
    'rose': 'Roses',
    
    // Succulents & Cacti
    'succulents': 'Succulents & Cacti',
    'succulent': 'Succulents & Cacti',
    'cacti': 'Succulents & Cacti',
    'cactus': 'Succulents & Cacti',
    'succulents-cacti': 'Succulents & Cacti',
    
    // Citrus & Fruit
    'citrus': 'Citrus & Fruit',
    'fruit': 'Citrus & Fruit',
    'fruit-trees': 'Citrus & Fruit',
    'citrus-fruit': 'Citrus & Fruit',
    
    // Herbs & Vegetables
    'herbs': 'Herbs & Vegetables',
    'herb': 'Herbs & Vegetables',
    'vegetables': 'Herbs & Vegetables',
    'vegetable': 'Herbs & Vegetables',
    'herbs-vegetables': 'Herbs & Vegetables',
    
    // Water Plants
    'water-plants': 'Water Plants',
    'water-plant': 'Water Plants',
    'aquatic': 'Water Plants',
    'pond-plants': 'Water Plants',
    
    // Indoor Plants
    'indoor-plants': 'Indoor Plants',
    'indoor': 'Indoor Plants',
    'houseplants': 'Indoor Plants',
    'house-plants': 'Indoor Plants',
    
    // Garden Products
    'garden-products': 'Garden Products',
    'products': 'Garden Products',
    'accessories': 'Garden Products',
    'tools': 'Garden Products',
    'fertilisers': 'Garden Products',
    'fertilizers': 'Garden Products',
  };
  
  // Check direct mapping
  if (urlToCategoryMap[firstPart]) {
    return urlToCategoryMap[firstPart];
  }
  
  // If no direct match, try to infer from common patterns
  // But only if it's clearly a category path, not a product name
  // Product URLs are usually like /trees/acer-freemanii-rubrum-autumn-blaze
  // So if firstPart is a known category word, use it
  
  return null; // Don't guess - only use explicit mappings
}

/**
 * Extract category from Plantmark sourceUrl
 */
function extractCategoryFromUrl(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  
  try {
    const url = new URL(sourceUrl);
    return mapUrlToCategory(url.pathname);
  } catch (error) {
    console.error(`Error parsing URL ${sourceUrl}:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting category fix - mapping to 15 main Plantmark categories...');

    // First, ensure the 15 main categories exist
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
        console.log(`✅ Created category: ${categoryName}`);
      }
      
      categoryMap.set(categoryName.toLowerCase(), category.id);
    }

    // Get all products with sourceUrl
    const products = await prisma.product.findMany({
      where: {
        sourceUrl: { not: null },
      },
      select: {
        id: true,
        sourceUrl: true,
        categoryId: true,
      },
    });

    console.log(`Found ${products.length} products to process`);

    // Process products in batches
    const batchSize = 50;
    let updated = 0;
    let skipped = 0;
    const categoryCounts = new Map<string, number>();

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      for (const product of batch) {
        try {
          // Extract category from URL
          const categoryName = extractCategoryFromUrl(product.sourceUrl);

          if (!categoryName) {
            skipped++;
            continue;
          }

          // Get category ID
          const categoryId = categoryMap.get(categoryName.toLowerCase());
          if (!categoryId) {
            console.warn(`Category not found: ${categoryName}`);
            skipped++;
            continue;
          }

          // Update product if category changed or if product has no category
          if (!product.categoryId || product.categoryId !== categoryId) {
            await prisma.product.update({
              where: { id: product.id },
              data: { categoryId },
            });
            updated++;
            categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
          }
        } catch (error) {
          console.error(`Error processing product ${product.id}:`, error);
        }
      }
    }

    // Delete all categories that are NOT in the 15 main categories
    const allCategories = await prisma.category.findMany();
    const mainCategoryIds = Array.from(categoryMap.values());
    const categoriesToDelete = allCategories.filter(cat => !mainCategoryIds.includes(cat.id));
    
    let deleted = 0;
    for (const category of categoriesToDelete) {
      try {
        // First, move products from deleted categories to "Uncategorized" or first main category
        const uncategorizedCategory = await prisma.category.findFirst({
          where: { name: 'Uncategorized' },
        }) || await prisma.category.findFirst({
          where: { name: PLANTMARK_CATEGORIES[0] },
        });
        
        if (uncategorizedCategory) {
          await prisma.product.updateMany({
            where: { categoryId: category.id },
            data: { categoryId: uncategorizedCategory.id },
          });
        }
        
        // Check if category still exists before deleting
        const categoryExists = await prisma.category.findUnique({
          where: { id: category.id },
        });
        
        if (categoryExists) {
          await prisma.category.delete({
            where: { id: category.id },
          });
          deleted++;
          console.log(`🗑️  Deleted incorrect category: ${category.name}`);
        }
      } catch (error) {
        console.error(`Error deleting category ${category.name}:`, error);
        // Continue with next category
      }
    }

    // Get final category breakdown
    const categoryBreakdown = await prisma.category.findMany({
      where: {
        name: { in: [...PLANTMARK_CATEGORIES] },
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get uncategorized count
    const uncategorizedCategory = await prisma.category.findFirst({
      where: { name: 'Uncategorized' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalProducts: products.length,
        updated,
        skipped,
        deletedCategories: deleted,
        uncategorized: uncategorizedCategory?._count.products || 0,
      },
      categories: categoryBreakdown.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat._count.products,
      })),
      categoryCounts: Object.fromEntries(categoryCounts),
    });
  } catch (error) {
    console.error('Error fixing categories:', error);
    return NextResponse.json(
      {
        error: 'Failed to fix categories',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
