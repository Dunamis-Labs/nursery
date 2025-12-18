import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

/**
 * API endpoint to fix category assignments for products
 * Extracts categories directly from Plantmark URLs (no inference)
 * Note: This endpoint is accessible from the admin dashboard without API key
 */
export async function POST(request: NextRequest) {
  // Allow access from admin dashboard (no API key required for this endpoint)
  try {
    console.log('🌱 Starting category fix via API (extracting from Plantmark URLs)...');

    // Get all products with sourceUrl
    const products = await prisma.product.findMany({
      where: {
        sourceUrl: { not: null },
      },
      include: {
        category: true,
      },
    });

    console.log(`Found ${products.length} products to process`);

    // Get or create categories
    const categoryMap = new Map<string, string>();
    const categories = await prisma.category.findMany();
    categories.forEach((cat) => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
    });

    /**
     * Extract category from Plantmark URL
     * Categories are in the URL path like: /trees/product-name or /shrubs/product-name
     */
    function extractCategoryFromUrl(sourceUrl: string | null): string | null {
      if (!sourceUrl) return null;
      
      try {
        const url = new URL(sourceUrl);
        const pathParts = url.pathname.split('/').filter(p => p && p !== 'plant-finder');
        
        if (pathParts.length > 0) {
          const categorySlug = pathParts[0].toLowerCase();
          
          // Map common slugs to category names (matching Plantmark's structure)
          const categoryNameMap: Record<string, string> = {
            'trees': 'Trees',
            'shrubs': 'Shrubs',
            'perennials': 'Perennials',
            'annuals': 'Annuals',
            'succulents': 'Succulents',
            'palms': 'Palms',
            'grasses': 'Grasses',
            'ferns': 'Ferns',
            'climbers': 'Climbers',
            'groundcovers': 'Groundcovers',
            'ground-covers': 'Groundcovers',
            'indoor-plants': 'Indoor Plants',
            'indoor': 'Indoor Plants',
            'houseplants': 'Indoor Plants',
            'roses': 'Roses',
          };
          
          if (categoryNameMap[categorySlug]) {
            return categoryNameMap[categorySlug];
          }
          
          // Convert slug to readable name (e.g., "trees" -> "Trees", "indoor-plants" -> "Indoor Plants")
          return categorySlug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        }
      } catch (error) {
        console.error(`Error parsing URL ${sourceUrl}:`, error);
      }
      
      return null;
    }

    // Process products in batches
    const batchSize = 50;
    let updated = 0;
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      for (const product of batch) {
        try {
          // Extract category from URL only (no inference)
          const categoryName = extractCategoryFromUrl(product.sourceUrl);

          if (!categoryName) {
            skipped++;
            continue;
          }

          // Get or create category
          let categoryId = categoryMap.get(categoryName.toLowerCase());
          if (!categoryId) {
            const category = await prisma.category.create({
              data: {
                name: categoryName,
                slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
                description: `${categoryName} plants`,
              },
            });
            categoryId = category.id;
            categoryMap.set(categoryName.toLowerCase(), categoryId);
            created++;
          }

          // Update product if category changed or if product has no category
          if (!product.categoryId || product.categoryId !== categoryId) {
            await prisma.product.update({
              where: { id: product.id },
              data: { categoryId },
            });
            updated++;
          }
        } catch (error) {
          console.error(`Error processing product ${product.id}:`, error);
        }
      }
    }

    // Get category breakdown
    const categoryBreakdown = await prisma.category.findMany({
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
        created,
        skipped,
        uncategorized: uncategorizedCategory?._count.products || 0,
      },
      categories: categoryBreakdown
        .filter((cat) => cat.name !== 'Uncategorized')
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          productCount: cat._count.products,
        })),
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
