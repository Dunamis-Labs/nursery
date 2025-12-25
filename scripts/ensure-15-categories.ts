import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;
process.env.DATABASE_URL = databaseUrl;

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

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

async function main() {
  console.log('🌱 Ensuring all 15 Plantmark categories exist...\n');

  const categoryMap = new Map<string, { id: string; name: string; slug: string; productCount: number }>();
  
  for (const categoryName of PLANTMARK_CATEGORIES) {
    let category = await prisma.category.findFirst({
      where: { name: categoryName },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    
    if (!category) {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug,
          description: `${categoryName} from Plantmark`,
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
      });
      console.log(`  ✅ Created: ${categoryName} (${category._count.products} products)`);
    } else {
      console.log(`  ✓ Exists: ${categoryName} (${category._count.products} products)`);
    }
    
    categoryMap.set(categoryName, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category._count.products,
    });
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`  Total categories: ${categoryMap.size}`);
  
  const totalProducts = await prisma.product.count();
  const productsWithoutCategory = await prisma.product.count({
    where: { categoryId: null },
  });
  const productsWithCategory = totalProducts - productsWithoutCategory;
  
  console.log(`  Total products in database: ${totalProducts}`);
  console.log(`  Products with category: ${productsWithCategory}`);
  console.log(`  Products without category: ${productsWithoutCategory}`);
  
  console.log('\n📁 Category breakdown:');
  const sortedCategories = Array.from(categoryMap.values()).sort((a, b) => b.productCount - a.productCount);
  for (const cat of sortedCategories) {
    console.log(`  ${cat.name.padEnd(30)} ${cat.productCount.toString().padStart(4)} products (slug: ${cat.slug})`);
  }
  
  console.log('\n✅ Done!');
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  process.exit(0);
});

