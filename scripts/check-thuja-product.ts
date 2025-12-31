#!/usr/bin/env tsx
/**
 * Check the specific Thuja product issue
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

async function main() {
  const { prisma } = await import('@nursery/db');

  console.log('🔍 Checking Thuja orientalis nana aurea product...\n');

  // Check by source URL
  const byUrl = await prisma.product.findFirst({
    where: {
      sourceUrl: { contains: 'thuja-orientalis-nana-aurea' },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      category: {
        select: {
          name: true,
          slug: true,
          parentId: true,
        },
      },
      sourceUrl: true,
      sourceId: true,
    },
  });

  console.log('Product found by URL:');
  console.log(JSON.stringify(byUrl, null, 2));
  console.log('');

  // Check by ID (the UUID from the 404 URL)
  const byId = await prisma.product.findUnique({
    where: {
      id: '97748b90-1a62-417f-a178-2681127999cb',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      category: {
        select: {
          name: true,
          slug: true,
          parentId: true,
        },
      },
      sourceUrl: true,
    },
  });

  console.log('Product found by ID (97748b90-1a62-417f-a178-2681127999cb):');
  console.log(JSON.stringify(byId, null, 2));
  console.log('');

  // Check by slug
  const bySlug = await prisma.product.findFirst({
    where: {
      slug: { contains: 'thuja' },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log('Product found by slug (thuja):');
  console.log(JSON.stringify(bySlug, null, 2));
  console.log('');

  // Check Conifers category
  const conifers = await prisma.category.findFirst({
    where: {
      name: 'Conifers',
      parentId: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { products: true },
      },
    },
  });

  console.log('Conifers category:');
  console.log(JSON.stringify(conifers, null, 2));
  console.log('');

  // Check products in Conifers
  const coniferProducts = await prisma.product.findMany({
    where: {
      categoryId: conifers?.id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    take: 5,
  });

  console.log(`Sample products in Conifers (${coniferProducts.length} shown):`);
  console.log(JSON.stringify(coniferProducts, null, 2));
}

main().catch(console.error);

