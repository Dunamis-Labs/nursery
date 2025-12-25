import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function extractCategoryFromUrl(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  
  try {
    const url = new URL(sourceUrl);
    const pathParts = url.pathname.split('/').filter(p => p && p !== 'plant-finder');
    
    if (pathParts.length > 0) {
      const categorySlug = pathParts[0].toLowerCase();
      
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
      
      return categorySlug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
  } catch {
    // Invalid URL
  }
  
  return null;
}

async function main() {
  console.log('Fixing categories from Plantmark URLs...\n');

  const products = await prisma.product.findMany({
    where: { sourceUrl: { not: null } },
    include: { category: true },
  });

  console.log(`Found ${products.length} products\n`);

  const categoryMap = new Map<string, string>();
  const existing = await prisma.category.findMany();
  existing.forEach(cat => categoryMap.set(cat.name.toLowerCase(), cat.id));

  let updated = 0;
  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const categoryName = extractCategoryFromUrl(product.sourceUrl);
    
    if (!categoryName) {
      skipped++;
      continue;
    }

    let categoryId = categoryMap.get(categoryName.toLowerCase());
    if (!categoryId) {
      const newCat = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          description: `${categoryName} plants`,
        },
      });
      categoryId = newCat.id;
      categoryMap.set(categoryName.toLowerCase(), categoryId);
      created++;
    }

    if (product.categoryId !== categoryId) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId },
      });
      updated++;
    }
  }

  console.log(`\nDone! Updated: ${updated}, Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

