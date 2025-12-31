#!/usr/bin/env tsx
import { prisma } from '@nursery/db';

async function checkProduct() {
  const product = await prisma.product.findFirst({
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
        },
      },
      sourceUrl: true,
      sourceId: true,
    },
  });

  console.log(JSON.stringify(product, null, 2));
  
  // Also check if there are other products with similar names
  const similar = await prisma.product.findMany({
    where: {
      name: { contains: 'Thuja' },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      category: {
        select: { name: true },
      },
    },
    take: 5,
  });
  
  console.log('\nSimilar products:');
  console.log(JSON.stringify(similar, null, 2));
}

checkProduct();

