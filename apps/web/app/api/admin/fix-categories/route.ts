import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

/**
 * API endpoint to fix category assignments for products
 * This can be called from the browser/admin dashboard since it runs in the Next.js context
 * which has access to the database connection
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting category fix via API...');

    // Get all products
    const products = await prisma.product.findMany({
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

    // Comprehensive category inference logic (from fix-categories.ts)
    const GENUS_CATEGORY_MAPPINGS: Record<string, string> = {
      // Trees
      eucalyptus: 'Trees',
      acacia: 'Trees',
      melaleuca: 'Trees',
      callistemon: 'Trees',
      citrus: 'Trees',
      grevillea: 'Trees',
      banksia: 'Trees',
      leptospermum: 'Trees',
      syzygium: 'Trees',
      corymbia: 'Trees',
      angophora: 'Trees',
      casuarina: 'Trees',
      // Shrubs
      camellia: 'Shrubs',
      azalea: 'Shrubs',
      rhododendron: 'Shrubs',
      viburnum: 'Shrubs',
      hydrangea: 'Shrubs',
      buxus: 'Shrubs',
      pittosporum: 'Shrubs',
      westringia: 'Shrubs',
      aucuba: 'Shrubs',
      gardenia: 'Shrubs',
      protea: 'Shrubs',
      boronia: 'Shrubs',
      eremophila: 'Shrubs',
      hakea: 'Shrubs',
      kunzea: 'Shrubs',
      olearia: 'Shrubs',
      // Perennials
      petunia: 'Perennials',
      osteospermum: 'Perennials',
      gazania: 'Perennials',
      verbena: 'Perennials',
      lobelia: 'Perennials',
      begonia: 'Perennials',
      impatiens: 'Perennials',
      coleus: 'Perennials',
      calibrachoa: 'Perennials',
      // Succulents
      senecio: 'Succulents',
      echeveria: 'Succulents',
      portulaca: 'Succulents',
      graptopetalum: 'Succulents',
      sempervivum: 'Succulents',
      cotyledon: 'Succulents',
      delosperma: 'Succulents',
      mesembryanthemum: 'Succulents',
      // Grasses
      dianella: 'Grasses',
      liriope: 'Grasses',
      ophiopogon: 'Grasses',
      festuca: 'Grasses',
      stipa: 'Grasses',
      poa: 'Grasses',
      agrostis: 'Grasses',
      cortaderia: 'Grasses',
      panicum: 'Grasses',
      schizachyrium: 'Grasses',
      // Indoor Plants
      syngonium: 'Indoor Plants',
      monstera: 'Indoor Plants',
      pothos: 'Indoor Plants',
      epipremnum: 'Indoor Plants',
      scindapsus: 'Indoor Plants',
      schefflera: 'Indoor Plants',
      dieffenbachia: 'Indoor Plants',
      calathea: 'Indoor Plants',
      maranta: 'Indoor Plants',
      peperomia: 'Indoor Plants',
      pilea: 'Indoor Plants',
      tradescantia: 'Indoor Plants',
      aechmea: 'Indoor Plants',
      guzmania: 'Indoor Plants',
      tillandsia: 'Indoor Plants',
      // Roses
      rosa: 'Roses',
      // Palms
      phoenix: 'Palms',
      trachycarpus: 'Palms',
      livistona: 'Palms',
      // Ferns
      dicksonia: 'Ferns',
      cyathea: 'Ferns',
      // Climbers
      clematis: 'Climbers',
      jasmine: 'Climbers',
      wisteria: 'Climbers',
      // Groundcovers
      ajuga: 'Groundcovers',
      vinca: 'Groundcovers',
      lamium: 'Groundcovers',
    };

    function inferCategoryFromProduct(
      name: string,
      botanicalName: string | null | undefined,
      sourceUrl?: string | null
    ): string | null {
      const nameLower = name.toLowerCase().trim();
      const nameParts = name.trim().split(/\s+/);

      // Strategy 1: Extract genus from botanicalName or name
      let genus: string | null = null;

      if (botanicalName) {
        genus = botanicalName.trim().split(/\s+/)[0].toLowerCase();
      } else if (nameParts.length > 0) {
        // Try to extract genus from product name (first capitalized word)
        const firstWord = nameParts[0];
        if (
          firstWord.length >= 2 &&
          firstWord[0] === firstWord[0].toUpperCase() &&
          /^[A-Za-z]+$/.test(firstWord)
        ) {
          genus = firstWord.toLowerCase();
        }
      }

      // Check genus mappings
      if (genus && GENUS_CATEGORY_MAPPINGS[genus]) {
        return GENUS_CATEGORY_MAPPINGS[genus];
      }

      // Strategy 2: Check URL path for category hints
      if (sourceUrl) {
        try {
          const url = new URL(sourceUrl);
          const pathParts = url.pathname.split('/').filter((p) => p && p !== 'plant-finder');
          const categorySlug = pathParts[0]?.toLowerCase();
          if (categorySlug) {
            const categoryMap: Record<string, string> = {
              trees: 'Trees',
              shrubs: 'Shrubs',
              perennials: 'Perennials',
              annuals: 'Annuals',
              succulents: 'Succulents',
              palms: 'Palms',
              grasses: 'Grasses',
              ferns: 'Ferns',
              climbers: 'Climbers',
              groundcovers: 'Groundcovers',
              'ground-covers': 'Groundcovers',
              'indoor-plants': 'Indoor Plants',
              indoor: 'Indoor Plants',
              houseplants: 'Indoor Plants',
              roses: 'Roses',
            };
            if (categoryMap[categorySlug]) {
              return categoryMap[categorySlug];
            }
          }
        } catch {
          // Invalid URL, skip
        }
      }

      // Strategy 3: Keyword matching in product name
      if (nameLower.includes('rose') || nameLower.startsWith('rosa ') || nameLower.includes(' rosa')) {
        return 'Roses';
      }
      if (nameLower.includes('tree') && !nameLower.includes('shrub') && !nameLower.includes('ground')) {
        return 'Trees';
      }
      if (nameLower.includes('shrub') || nameLower.includes('bush')) {
        return 'Shrubs';
      }
      if (nameLower.includes('succulent') || nameLower.includes('cactus')) {
        return 'Succulents';
      }
      if (nameLower.includes('palm')) {
        return 'Palms';
      }
      if (nameLower.includes('grass') || nameLower.includes('sedge')) {
        return 'Grasses';
      }
      if (nameLower.includes('fern')) {
        return 'Ferns';
      }
      if (nameLower.includes('climber') || nameLower.includes('vine') || nameLower.includes('creeper')) {
        return 'Climbers';
      }
      if (nameLower.includes('groundcover') || nameLower.includes('ground cover') || nameLower.includes('ground-cover')) {
        return 'Groundcovers';
      }
      if (nameLower.includes('perennial')) {
        return 'Perennials';
      }
      if (nameLower.includes('indoor') || nameLower.includes('houseplant') || nameLower.includes('house plant')) {
        return 'Indoor Plants';
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
          const categoryName = inferCategoryFromProduct(
            product.name,
            product.botanicalName,
            product.sourceUrl
          );

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

