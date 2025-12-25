import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

// Build direct connection URL from .env variables
const host = process.env.POSTGRES_HOST || 'db.pahkmqhomlzfbnizwryw.supabase.co';
const user = process.env.POSTGRES_USER || 'postgres.pahkmqhomlzfbnizwryw';
const password = process.env.POSTGRES_PASSWORD || '';
const database = process.env.POSTGRES_DATABASE || 'postgres';

// Direct connection URL (not pooler)
const directUrl = `postgres://${user}:${password}@${host}:5432/${database}?sslmode=require`;

// Override DATABASE_URL before importing Prisma
process.env.DATABASE_URL = directUrl;

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl,
    },
  },
});

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

