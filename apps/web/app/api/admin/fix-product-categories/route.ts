import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

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

function mapUrlToCategory(urlPath: string): string | null {
  if (!urlPath) return null;
  
  const pathParts = urlPath.toLowerCase().split('/').filter(p => p && p !== 'plant-finder');
  if (pathParts.length === 0) return null;
  
  const firstPart = pathParts[0].toLowerCase();
  
  const urlToCategoryMap: Record<string, string> = {
    'trees': 'Trees', 'tree': 'Trees',
    'shrubs': 'Shrubs', 'shrub': 'Shrubs',
    'grasses': 'Grasses', 'grass': 'Grasses', 'ornamental-grasses': 'Grasses',
    'hedging': 'Hedging and Screening', 'hedge': 'Hedging and Screening', 'screening': 'Hedging and Screening', 'hedging-and-screening': 'Hedging and Screening',
    'groundcovers': 'Groundcovers', 'groundcover': 'Groundcovers', 'ground-covers': 'Groundcovers',
    'climbers': 'Climbers', 'climber': 'Climbers', 'vines': 'Climbers', 'vine': 'Climbers',
    'palms': 'Palms, Ferns & Tropical', 'palm': 'Palms, Ferns & Tropical',
    'ferns': 'Palms, Ferns & Tropical', 'fern': 'Palms, Ferns & Tropical',
    'tropical': 'Palms, Ferns & Tropical', 'palms-ferns-and-tropical': 'Palms, Ferns & Tropical',
    'conifers': 'Conifers', 'conifer': 'Conifers',
    'roses': 'Roses', 'rose': 'Roses',
    'succulents': 'Succulents & Cacti', 'succulent': 'Succulents & Cacti',
    'cacti': 'Succulents & Cacti', 'cactus': 'Succulents & Cacti', 'succulents-and-cacti': 'Succulents & Cacti',
    'citrus': 'Citrus & Fruit', 'fruit': 'Citrus & Fruit', 'fruit-trees': 'Citrus & Fruit', 'citrus-and-fruit': 'Citrus & Fruit',
    'herbs': 'Herbs & Vegetables', 'herb': 'Herbs & Vegetables',
    'vegetables': 'Herbs & Vegetables', 'vegetable': 'Herbs & Vegetables', 'herbs-and-vegetables': 'Herbs & Vegetables',
    'water-plants': 'Water Plants', 'water-plant': 'Water Plants', 'aquatic': 'Water Plants',
    'indoor-plants': 'Indoor Plants', 'indoor': 'Indoor Plants', 'houseplants': 'Indoor Plants',
    'garden-products': 'Garden Products', 'products': 'Garden Products',
  };
  
  return urlToCategoryMap[firstPart] || null;
}

function extractCategoryFromUrl(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  try {
    const url = new URL(sourceUrl);
    // Plantmark URLs can be:
    // 1. /category/product-name (e.g., /shrubs/abelia-floribunda)
    // 2. /product-name (e.g., /abelia-floribunda) - category not in URL
    const pathname = url.pathname;
    return mapUrlToCategory(pathname);
  } catch {
    return null;
  }
}

function mapCategoryNameToMainCategory(categoryName: string): string | null {
  if (!categoryName) return null;
  
  const lower = categoryName.toLowerCase().trim();
  
  // Direct matches
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
    'palms, ferns and tropical': 'Palms, Ferns & Tropical',
    'conifers': 'Conifers',
    'roses': 'Roses',
    'succulents': 'Succulents & Cacti',
    'cacti': 'Succulents & Cacti',
    'cactus': 'Succulents & Cacti',
    'succulents & cacti': 'Succulents & Cacti',
    'succulents and cacti': 'Succulents & Cacti',
    'citrus': 'Citrus & Fruit',
    'fruit': 'Citrus & Fruit',
    'citrus & fruit': 'Citrus & Fruit',
    'citrus and fruit': 'Citrus & Fruit',
    'herbs': 'Herbs & Vegetables',
    'vegetables': 'Herbs & Vegetables',
    'herbs & vegetables': 'Herbs & Vegetables',
    'herbs and vegetables': 'Herbs & Vegetables',
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

function extractCategoryFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null;
  
  const meta = metadata as Record<string, unknown>;
  
  // Check if category is directly in metadata
  if (meta.category && typeof meta.category === 'string') {
    return mapCategoryNameToMainCategory(meta.category);
  }
  
  // Check categoryPath
  if (meta.categoryPath && Array.isArray(meta.categoryPath) && meta.categoryPath.length > 0) {
    const lastCategory = meta.categoryPath[meta.categoryPath.length - 1];
    if (typeof lastCategory === 'string') {
      return mapCategoryNameToMainCategory(lastCategory);
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting product category fix...');

    // Step 1: Ensure the 15 main categories exist
    const categoryMap = new Map<string, string>();
    for (const categoryName of PLANTMARK_CATEGORIES) {
      let category = await prisma.category.findFirst({
        where: { name: categoryName },
      });
      
      if (!category) {
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        category = await prisma.category.create({
          data: {
            name: categoryName,
            slug,
            description: `${categoryName} from Plantmark`,
          },
        });
      }
      
      categoryMap.set(categoryName.toLowerCase(), category.id);
    }

    // Step 2: Get all products with sourceUrl and metadata
    const products = await prisma.product.findMany({
      where: { sourceUrl: { not: null } },
      select: { id: true, name: true, sourceUrl: true, categoryId: true, metadata: true },
    });

    // Step 3: Fix category assignments
    const batchSize = 100;
    let updated = 0;
    let skipped = 0;
    const categoryCounts = new Map<string, number>();

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      for (const product of batch) {
        try {
          // Try to extract category from URL first
          let categoryName = extractCategoryFromUrl(product.sourceUrl);
          
          // If not found in URL, try metadata
          if (!categoryName) {
            categoryName = extractCategoryFromMetadata(product.metadata);
          }
          
          // If still not found, we need to scrape the product page
          // For now, skip products without category info
          // TODO: Implement scraping for products without category
          if (!categoryName) {
            skipped++;
            continue;
          }
          
          // Map to main category
          categoryName = mapCategoryNameToMainCategory(categoryName);
          
          if (!categoryName) {
            skipped++;
            continue;
          }

          const categoryId = categoryMap.get(categoryName.toLowerCase());
          if (!categoryId) {
            skipped++;
            continue;
          }

          // Update if category is wrong or missing
          if (!product.categoryId || product.categoryId !== categoryId) {
            await prisma.product.update({
              where: { id: product.id },
              data: { categoryId },
            });
            updated++;
            categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
          } else {
            categoryCounts.set(categoryName, (categoryCounts.get(categoryName) || 0) + 1);
          }
        } catch (error) {
          console.error(`Error processing product ${product.id}:`, error);
          skipped++;
        }
      }
    }

    // Step 4: Get final counts
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
      message: 'Product categories fixed',
      stats: {
        totalProducts: products.length,
        updated,
        skipped,
      },
      categoryCounts: finalCounts,
    });
  } catch (error) {
    console.error('Error fixing categories:', error);
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

