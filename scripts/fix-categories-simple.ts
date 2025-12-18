import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

// Simple slug generation
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Genus to category mappings
const GENUS_CATEGORY_MAPPINGS: Record<string, string> = {
  rosa: 'Roses',
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
  agapanthus: 'Perennials',
  hemerocallis: 'Perennials',
  salvia: 'Perennials',
  campanula: 'Perennials',
  clematis: 'Climbers',
  wisteria: 'Climbers',
  solanum: 'Climbers',
  distictis: 'Climbers',
  aeonium: 'Succulents',
  echeveria: 'Succulents',
  crassula: 'Succulents',
  sedum: 'Succulents',
  kalanchoe: 'Succulents',
  haworthia: 'Succulents',
  aloe: 'Succulents',
  agave: 'Succulents',
};

function isBotanicalName(text: string): boolean {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return false;
  const firstWord = parts[0];
  const secondWord = parts[1];
  return (
    firstWord.length > 0 &&
    firstWord[0] === firstWord[0].toUpperCase() &&
    secondWord.length > 0 &&
    secondWord[0] === secondWord[0].toLowerCase()
  );
}

function inferCategory(name: string, botanicalName: string | null | undefined): string | null {
  const botanical = botanicalName || (isBotanicalName(name) ? name : null);
  if (botanical) {
    const genus = botanical.split(' ')[0].toLowerCase();
    return GENUS_CATEGORY_MAPPINGS[genus] || null;
  }
  return null;
}

async function findOrCreateCategory(name: string): Promise<{ id: string; name: string }> {
  const slug = generateSlug(name);
  
  let category = await prisma.category.findFirst({
    where: { slug },
  });

  if (!category) {
    category = await prisma.category.create({
      data: { name, slug },
    });
  }

  return category;
}

async function fixCategories(limit?: number) {
  console.log('🌱 Starting category fix...\n');

  try {
    // Get products with limit for testing
    const products = await prisma.product.findMany({
      where: { sourceUrl: { not: null } },
      take: limit,
      select: {
        id: true,
        name: true,
        botanicalName: true,
        categoryId: true,
        category: { select: { name: true } },
      },
    });

    console.log(`📦 Processing ${products.length} products\n`);

    let updated = 0;
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      if ((i + 1) % 50 === 0) {
        console.log(`Processed ${i + 1}/${products.length}...`);
      }

      try {
        const categoryName = inferCategory(product.name, product.botanicalName);
        
        if (!categoryName) {
          skipped++;
          continue;
        }

        if (product.category?.name === categoryName) {
          skipped++;
          continue;
        }

        const category = await findOrCreateCategory(categoryName);
        
        if (category.id === product.categoryId) {
          skipped++;
          continue;
        }

        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: category.id },
        });

        if (product.category?.name === 'Uncategorized') {
          created++;
        } else {
          updated++;
        }
      } catch (error) {
        errors++;
        if (errors <= 5) {
          console.error(`   Error: ${product.name} - ${error instanceof Error ? error.message : 'Unknown'}`);
        }
      }
    }

    console.log('\n✅ Category fix completed!\n');
    console.log(`📊 Summary:`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Created: ${created} new category assignments`);
    console.log(`   Skipped: ${skipped} products`);
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

// Get limit from command line or use default
const limit = process.argv[2] ? parseInt(process.argv[2]) : undefined;
fixCategories(limit);

