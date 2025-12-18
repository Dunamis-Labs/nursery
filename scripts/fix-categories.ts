import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

// Use non-pooling connection for scripts (prefer non-pooling URLs)
let databaseUrl = process.env.DATABASE_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL, DATABASE_URL_NON_POOLING, or POSTGRES_URL_NON_POOLING must be set');
}

// Check if URL uses pooler hostname
if (databaseUrl.includes('pooler.supabase.com')) {
  console.error('❌ ERROR: Connection URL uses pooler hostname (pooler.supabase.com)');
  console.error('   Scripts cannot use pooler connections. You need the DIRECT connection URL.');
  console.error('');
  console.error('   To fix this:');
  console.error('   1. Go to https://supabase.com/dashboard');
  console.error('   2. Select your project');
  console.error('   3. Settings → Database');
  console.error('   4. Scroll to "Connection string"');
  console.error('   5. Select "URI" (NOT Session mode)');
  console.error('   6. Copy the URL that has hostname: db.xxxxx.supabase.co (NOT pooler.supabase.com)');
  console.error('   7. Update DATABASE_URL_NON_POOLING in your .env file');
  console.error('');
  console.error('   The direct connection URL should look like:');
  console.error('   postgres://postgres.REF:PASSWORD@db.REF.supabase.co:5432/postgres?sslmode=require');
  console.error('');
  throw new Error('Cannot use pooler connection for scripts. Please update .env with direct connection URL.');
}

// Override DATABASE_URL in process.env BEFORE importing Prisma
process.env.DATABASE_URL = databaseUrl;

import { PrismaClient } from '@prisma/client';

// Simple slug generation function
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Add connection timeout to database URL
const urlWithTimeout = new URL(databaseUrl);
urlWithTimeout.searchParams.set('connect_timeout', '10'); // 10 second timeout
const databaseUrlWithTimeout = urlWithTimeout.toString();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrlWithTimeout,
    },
  },
  log: ['error', 'warn'],
});

// Botanical name patterns to category mappings
const GENUS_CATEGORY_MAPPINGS: Record<string, string> = {
  // Roses
  rosa: 'Roses',
  
  // Trees
  acer: 'Trees',
  eucalyptus: 'Trees',
  quercus: 'Trees',
  betula: 'Trees',
  prunus: 'Trees',
  malus: 'Trees',
  pyrus: 'Trees',
  fraxinus: 'Trees',
  ulmus: 'Trees',
  zelkova: 'Trees',
  ficus: 'Trees',
  magnolia: 'Trees',
  liquidambar: 'Trees',
  citrus: 'Trees', // Citrus trees
  corymbia: 'Trees',
  lophostemon: 'Trees',
  tristania: 'Trees',
  brachychiton: 'Trees',
  lagerstroemia: 'Trees',
  pterocarpus: 'Trees',
  schinus: 'Trees',
  tipuana: 'Trees',
  corymbia: 'Trees',
  angophora: 'Trees',
  casuarina: 'Trees',
  cupressus: 'Trees',
  pinus: 'Trees',
  cedrus: 'Trees',
  ginkgo: 'Trees',
  liriodendron: 'Trees',
  platanus: 'Trees',
  tilia: 'Trees',
  carpinus: 'Trees',
  celtis: 'Trees',
  gleditsia: 'Trees',
  koelreuteria: 'Trees',
  sophora: 'Trees',
  robinia: 'Trees',
  acacia: 'Trees', // Some are trees, some shrubs - default to trees
  brachychiton: 'Trees',
  lophostemon: 'Trees',
  tristania: 'Trees',
  syncarpia: 'Trees',
  allocasuarina: 'Trees',
  
  // Shrubs
  camellia: 'Shrubs',
  azalea: 'Shrubs',
  rhododendron: 'Shrubs',
  viburnum: 'Shrubs',
  hydrangea: 'Shrubs',
  buxus: 'Shrubs',
  pittosporum: 'Shrubs',
  westringia: 'Shrubs',
  callistemon: 'Shrubs',
  grevillea: 'Shrubs',
  banksia: 'Shrubs',
  leptospermum: 'Shrubs',
  melaleuca: 'Shrubs',
  syzygium: 'Shrubs',
  lillypilly: 'Shrubs',
  correa: 'Shrubs',
  acmena: 'Shrubs',
  aucuba: 'Shrubs',
  gardenia: 'Shrubs',
  protea: 'Shrubs',
  boronia: 'Shrubs',
  eremophila: 'Shrubs',
  hakea: 'Shrubs',
  kunzea: 'Shrubs',
  lomandra: 'Shrubs', // Some are grasses, but many are shrubs
  olearia: 'Shrubs',
  prostanthera: 'Shrubs',
  pultenaea: 'Shrubs',
  telopea: 'Shrubs',
  waratah: 'Shrubs',
  xanthorrhoea: 'Shrubs',
  hibiscus: 'Shrubs',
  abelia: 'Shrubs',
  weigela: 'Shrubs',
  forsythia: 'Shrubs',
  buddleja: 'Shrubs',
  lavandula: 'Shrubs',
  rosmarinus: 'Shrubs',
  thymus: 'Shrubs',
  cistus: 'Shrubs',
  hebe: 'Shrubs',
  choisya: 'Shrubs',
  cotoneaster: 'Shrubs',
  pyracantha: 'Shrubs',
  berberis: 'Shrubs',
  euonymus: 'Shrubs',
  ilex: 'Shrubs',
  osmanthus: 'Shrubs',
  photinia: 'Shrubs',
  pieris: 'Shrubs',
  skimmia: 'Shrubs',
  spiraea: 'Shrubs',
  
  // Perennials
  agapanthus: 'Perennials',
  hemerocallis: 'Perennials',
  hosta: 'Perennials',
  salvia: 'Perennials',
  penstemon: 'Perennials',
  echinacea: 'Perennials',
  rudbeckia: 'Perennials',
  coreopsis: 'Perennials',
  campanula: 'Perennials',
  geranium: 'Perennials',
  dianthus: 'Perennials',
  arctotis: 'Perennials',
  zephyranthes: 'Perennials',
  achillea: 'Perennials',
  ajuga: 'Perennials',
  osteospermum: 'Perennials',
  petunia: 'Perennials',
  gazania: 'Perennials',
  verbena: 'Perennials',
  lobelia: 'Perennials',
  begonia: 'Perennials',
  impatiens: 'Perennials',
  coleus: 'Perennials',
  calibrachoa: 'Perennials',
  gazania: 'Perennials',
  verbena: 'Perennials',
  lobelia: 'Perennials',
  begonia: 'Perennials',
  impatiens: 'Perennials',
  coleus: 'Perennials',
  calibrachoa: 'Perennials',
  alstroemeria: 'Perennials',
  anemone: 'Perennials',
  astilbe: 'Perennials',
  bergenia: 'Perennials',
  brunnera: 'Perennials',
  delphinium: 'Perennials',
  digitalis: 'Perennials',
  echinops: 'Perennials',
  euphorbia: 'Perennials',
  gaillardia: 'Perennials',
  geum: 'Perennials',
  helenium: 'Perennials',
  helianthus: 'Perennials',
  heuchera: 'Perennials',
  iris: 'Perennials',
  kniphofia: 'Perennials',
  liatris: 'Perennials',
  lupinus: 'Perennials',
  monarda: 'Perennials',
  nepeta: 'Perennials',
  oenothera: 'Perennials',
  papaver: 'Perennials',
  phlox: 'Perennials',
  physostegia: 'Perennials',
  platycodon: 'Perennials',
  pulmonaria: 'Perennials',
  scabiosa: 'Perennials',
  sedum: 'Perennials', // Some sedums are perennials, some succulents
  stachys: 'Perennials',
  veronica: 'Perennials',
  viola: 'Perennials',
  yarrow: 'Perennials',
  
  // Climbers
  clematis: 'Climbers',
  wisteria: 'Climbers',
  jasmine: 'Climbers',
  honeysuckle: 'Climbers',
  ivy: 'Climbers',
  solanum: 'Climbers',
  distictis: 'Climbers',
  
  // Succulents
  aeonium: 'Succulents',
  echeveria: 'Succulents',
  crassula: 'Succulents',
  sedum: 'Succulents',
  kalanchoe: 'Succulents',
  haworthia: 'Succulents',
  aloe: 'Succulents',
  agave: 'Succulents',
  senecio: 'Succulents',
  portulaca: 'Succulents',
  graptopetalum: 'Succulents',
  sempervivum: 'Succulents',
  cotyledon: 'Succulents',
  delosperma: 'Succulents',
  mesembryanthemum: 'Succulents',
  
  // Palms
  phoenix: 'Palms',
  trachycarpus: 'Palms',
  livistona: 'Palms',
  archontophoenix: 'Palms',
  
  // Grasses
  miscanthus: 'Grasses',
  pennisetum: 'Grasses',
  carex: 'Grasses',
  lomandra: 'Grasses',
  
  // Groundcovers
  myoporum: 'Groundcovers',
  dichondra: 'Groundcovers',
  ajuga: 'Groundcovers',
  vinca: 'Groundcovers',
  
  // Ferns
  dicksonia: 'Ferns',
  cyathea: 'Ferns',
  platycerium: 'Ferns',
  asplenium: 'Ferns',
  
  // Indoor Plants / Houseplants
  spathiphyllum: 'Indoor Plants',
  billbergia: 'Indoor Plants',
  monstera: 'Indoor Plants',
  philodendron: 'Indoor Plants',
  sansevieria: 'Indoor Plants',
  dracaena: 'Indoor Plants',
  ficus: 'Indoor Plants', // Some Ficus are indoor
  zamioculcas: 'Indoor Plants',
  syngonium: 'Indoor Plants',
  epipremnum: 'Indoor Plants',
  scindapsus: 'Indoor Plants',
  pothos: 'Indoor Plants',
  schefflera: 'Indoor Plants',
  dieffenbachia: 'Indoor Plants',
  calathea: 'Indoor Plants',
  maranta: 'Indoor Plants',
  peperomia: 'Indoor Plants',
  pilea: 'Indoor Plants',
  tradescantia: 'Indoor Plants',
  
  // Bromeliads (often indoor)
  aechmea: 'Indoor Plants',
  guzmania: 'Indoor Plants',
  tillandsia: 'Indoor Plants',
  
  // Grasses (additional)
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
};

/**
 * Check if a string looks like a botanical name (genus species format)
 */
function isBotanicalName(text: string): boolean {
  // Botanical names are typically "Genus species" format
  // First word capitalized, second word lowercase
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return false;
  
  const firstWord = parts[0];
  const secondWord = parts[1];
  
  // Check if first word is capitalized and second is lowercase
  return (
    firstWord.length > 0 &&
    firstWord[0] === firstWord[0].toUpperCase() &&
    secondWord.length > 0 &&
    secondWord[0] === secondWord[0].toLowerCase()
  );
}

/**
 * Extract category from botanical name or specifications
 * This is a comprehensive function that tries multiple strategies
 */
function inferCategoryFromProduct(
  name: string,
  botanicalName: string | null | undefined,
  metadata: unknown,
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
    // This handles cases like "Syngonium podophyllum Pixie" where botanicalName is null
    const firstWord = nameParts[0];
    if (firstWord.length >= 2 && 
        firstWord[0] === firstWord[0].toUpperCase() && 
        /^[A-Za-z]+$/.test(firstWord)) {
      genus = firstWord.toLowerCase();
    }
    
    // Also check if second word looks like a species (lowercase) - confirms it's botanical name
    if (genus && nameParts.length > 1) {
      const secondWord = nameParts[1];
      // If second word starts lowercase, it's likely a species name, confirming genus
      if (secondWord[0] === secondWord[0].toLowerCase() && /^[a-z]/.test(secondWord)) {
        // Confirmed botanical name format - genus is valid
      } else {
        // Might not be botanical, but still try the genus mapping
      }
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
      const pathParts = url.pathname.split('/').filter(p => p && p !== 'plant-finder');
      // Common category slugs in URLs
      const categorySlug = pathParts[0]?.toLowerCase();
      if (categorySlug) {
        const categoryMap: Record<string, string> = {
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
        if (categoryMap[categorySlug]) {
          return categoryMap[categorySlug];
        }
      }
    } catch {
      // Invalid URL, skip
    }
  }
  
  // Strategy 3: Keyword matching in product name (comprehensive)
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
  
  // Strategy 4: Check metadata specifications
  if (metadata && typeof metadata === 'object') {
    const meta = metadata as Record<string, unknown>;
    const specs = meta.specifications as Record<string, unknown> | undefined;
    
    if (specs) {
      // Check plantType (can be string or array)
      if (specs.plantType) {
        const plantType = Array.isArray(specs.plantType)
          ? specs.plantType.map(t => String(t).toLowerCase()).join(' ')
          : String(specs.plantType).toLowerCase();
        
        if (plantType.includes('tree')) return 'Trees';
        if (plantType.includes('shrub')) return 'Shrubs';
        if (plantType.includes('perennial')) return 'Perennials';
        if (plantType.includes('annual')) return 'Annuals';
        if (plantType.includes('climber') || plantType.includes('vine')) return 'Climbers';
        if (plantType.includes('succulent')) return 'Succulents';
        if (plantType.includes('palm')) return 'Palms';
        if (plantType.includes('grass')) return 'Grasses';
        if (plantType.includes('fern')) return 'Ferns';
        if (plantType.includes('groundcover') || plantType.includes('ground cover')) return 'Groundcovers';
        if (plantType.includes('indoor') || plantType.includes('houseplant')) return 'Indoor Plants';
      }
      
      // Check plantHabit
      if (specs.plantHabit) {
        const habit = Array.isArray(specs.plantHabit) 
          ? specs.plantHabit.map(h => String(h).toLowerCase()).join(' ')
          : String(specs.plantHabit).toLowerCase();
        if (habit.includes('tree')) return 'Trees';
        if (habit.includes('shrub')) return 'Shrubs';
        if (habit.includes('climber') || habit.includes('vine')) return 'Climbers';
        if (habit.includes('groundcover') || habit.includes('ground cover')) return 'Groundcovers';
      }
      
      // Check mature height/width for tree vs shrub distinction
      const matureHeight = specs.matureHeight || specs.height;
      if (matureHeight) {
        const heightStr = Array.isArray(matureHeight) ? matureHeight[0] : String(matureHeight);
        const heightMatch = heightStr.match(/(\d+)\s*(m|meter|metre|ft|foot|feet)/i);
        if (heightMatch) {
          const heightValue = parseFloat(heightMatch[1]);
          const unit = heightMatch[2].toLowerCase();
          const heightInMeters = unit.includes('m') ? heightValue : heightValue * 0.3048;
          // If mature height > 3m, likely a tree
          if (heightInMeters > 3 && !nameLower.includes('shrub')) {
            return 'Trees';
          }
        }
      }
    }
  }
  
  // Strategy 5: Common plant name patterns
  // If name starts with common genus names (even if not in mapping)
  if (genus) {
    // Additional heuristics based on common patterns
    if (genus.endsWith('us') && !['ficus', 'cactus'].includes(genus)) {
      // Many tree genera end in 'us' (Quercus, Fraxinus, etc.)
      // But we've already checked mappings, so this is a fallback
    }
  }
  
  return null;
}

/**
 * Find or create category with retry logic
 */
async function findOrCreateCategory(name: string, retries = 3): Promise<{ id: string; name: string }> {
  const slug = generateSlug(name);
  
  while (retries > 0) {
    try {
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
    } catch (error) {
      retries--;
      if (retries === 0) {
        // Fallback to Uncategorized
        const uncategorized = await prisma.category.findFirst({
          where: { slug: 'uncategorized' },
        }) || await prisma.category.create({
          data: {
            name: 'Uncategorized',
            slug: 'uncategorized',
          },
        });
        console.warn(`⚠️  Could not create category "${name}", using Uncategorized`);
        return uncategorized;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
    }
  }
  
  throw new Error('Failed to find or create category');
}

/**
 * Fix category assignments for all products
 */
async function fixCategories() {
  console.log('🌱 Starting category fix...\n');

  try {
    // Get all products with retry logic
    let products;
    let retries = 3;
    while (retries > 0) {
      try {
        products = await prisma.product.findMany({
          where: {
            sourceUrl: { not: null },
          },
          select: {
            id: true,
            name: true,
            botanicalName: true,
            sourceUrl: true,
            categoryId: true,
            metadata: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        });
        break; // Success
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`⚠️  Connection error, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!products) {
      throw new Error('Failed to fetch products after retries');
    }

    console.log(`📦 Found ${products.length} products to process\n`);

    let updated = 0;
    let created = 0;
    let skipped = 0;
    let errors = 0;

    // Process products in batches with connection retry
    const batchSize = 10; // Smaller batches to avoid timeouts
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}...`);

      for (const product of batch) {
        try {
          // Infer category from botanical name, metadata, or URL
          const categoryName = inferCategoryFromProduct(
            product.name, 
            product.botanicalName, 
            product.metadata,
            product.sourceUrl
          );
          
          if (!categoryName) {
            skipped++;
            continue;
          }

          // Skip if already in correct category
          if (product.category?.name === categoryName) {
            skipped++;
            continue;
          }

          // Find or create category with retry
          let category;
          let retries = 3;
          while (retries > 0) {
            try {
              category = await findOrCreateCategory(categoryName);
              break;
            } catch (error) {
              retries--;
              if (retries === 0) throw error;
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (!category || category.id === product.categoryId) {
            skipped++;
            continue;
          }

          // Update product with retry
          retries = 3;
          while (retries > 0) {
            try {
              await prisma.product.update({
                where: { id: product.id },
                data: { categoryId: category.id },
              });
              break;
            } catch (error) {
              retries--;
              if (retries === 0) {
                errors++;
                throw error;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          if (product.category?.name === 'Uncategorized') {
            created++;
          } else {
            updated++;
          }

          if ((updated + created) % 10 === 0) {
            console.log(`   Updated: ${updated}, Created: ${created}, Skipped: ${skipped}`);
          }
        } catch (error) {
          errors++;
          console.error(`   Error processing ${product.name}:`, error instanceof Error ? error.message : error);
        }
      }
    }

    console.log('\n✅ Category fix completed!\n');
    console.log(`📊 Summary:`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Created: ${created} new category assignments`);
    console.log(`   Skipped: ${skipped} products (already correct or no category found)`);
    console.log(`   Errors: ${errors}`);

    // Show category breakdown
    const categoryStats = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: true,
    });

    const categoryIds = categoryStats.map(s => s.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    console.log(`\n📁 Category Breakdown:`);
    categoryStats
      .sort((a, b) => b._count - a._count)
      .forEach(stat => {
        const categoryName = categoryMap.get(stat.categoryId) || 'Unknown';
        console.log(`   ${categoryName}: ${stat._count} products`);
      });

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixCategories();

