// This script uses the same Prisma setup as Next.js (which works)
// It will use DATABASE_URL which is the pooler connection that Next.js uses successfully

import { prisma } from '@nursery/db';

function extractCategoryFromUrl(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  try {
    const url = new URL(sourceUrl);
    const pathParts = url.pathname.split('/').filter(p => p && p !== 'plant-finder');
    if (pathParts.length === 0) return null;
    
    const slug = pathParts[0].toLowerCase();
    const map: Record<string, string> = {
      'trees': 'Trees', 'shrubs': 'Shrubs', 'perennials': 'Perennials',
      'succulents': 'Succulents', 'palms': 'Palms', 'grasses': 'Grasses',
      'ferns': 'Ferns', 'climbers': 'Climbers', 'groundcovers': 'Groundcovers',
      'ground-covers': 'Groundcovers', 'indoor-plants': 'Indoor Plants',
      'indoor': 'Indoor Plants', 'roses': 'Roses'
    };
    
    return map[slug] || slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  } catch {
    return null;
  }
}

async function main() {
  console.log('Fixing categories from Plantmark URLs...\n');
  
  const products = await prisma.product.findMany({
    where: { sourceUrl: { not: null } },
    select: { id: true, sourceUrl: true, categoryId: true }
  });
  
  console.log(`Found ${products.length} products\n`);
  
  const catMap = new Map<string, string>();
  (await prisma.category.findMany()).forEach(c => catMap.set(c.name.toLowerCase(), c.id));
  
  let updated = 0, created = 0, skipped = 0;
  
  for (const p of products) {
    const catName = extractCategoryFromUrl(p.sourceUrl);
    if (!catName) { skipped++; continue; }
    
    let catId = catMap.get(catName.toLowerCase());
    if (!catId) {
      const newCat = await prisma.category.create({
        data: { name: catName, slug: catName.toLowerCase().replace(/\s+/g, '-'), description: `${catName} plants` }
      });
      catId = newCat.id;
      catMap.set(catName.toLowerCase(), catId);
      created++;
    }
    
    if (p.categoryId !== catId) {
      await prisma.product.update({ where: { id: p.id }, data: { categoryId: catId } });
      updated++;
    }
  }
  
  console.log(`\n✅ Done! Updated: ${updated}, Created: ${created}, Skipped: ${skipped}\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

