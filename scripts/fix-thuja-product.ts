#!/usr/bin/env tsx
/**
 * Fix the specific Thuja product - correct slug and category
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

async function main() {
  const { prisma } = await import('@nursery/db');

  console.log('🔧 Fixing Thuja orientalis nana aurea product...\n');

  // Find the product
  const product = await prisma.product.findFirst({
    where: {
      sourceUrl: { contains: 'thuja-orientalis-nana-aurea' },
    },
  });

  if (!product) {
    console.log('❌ Product not found');
    return;
  }

  // Get Conifers category
  const conifers = await prisma.category.findFirst({
    where: {
      name: 'Conifers',
      parentId: null,
    },
  });

  if (!conifers) {
    console.log('❌ Conifers category not found');
    return;
  }

  // Update product with correct slug and category
  const correctSlug = 'thuja-orientalis-nana-aurea';
  
  await prisma.product.update({
    where: { id: product.id },
    data: {
      slug: correctSlug,
      categoryId: conifers.id,
    },
  });

  console.log(`✅ Fixed product:`);
  console.log(`   Slug: ${product.slug} → ${correctSlug}`);
  console.log(`   Category: ${product.categoryId} → Conifers (${conifers.id})`);
  console.log(`\n✅ Product should now be accessible at:`);
  console.log(`   http://localhost:3000/products/${correctSlug}`);
  console.log(`   And should appear in Conifers category\n`);
}

main().catch(console.error);

