#!/usr/bin/env tsx
/**
 * Check product variants for a specific product
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env') });

async function main() {
  const { prisma } = await import('@nursery/db');

  const productId = process.argv[2] || 'b3bfd74e-3ff0-47dc-bce0-4aa21cfc5ab0';

  console.log(`🔍 Checking product variants for: ${productId}\n`);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      commonName: true,
      sourceUrl: true,
      metadata: true,
    },
  });

  if (!product) {
    console.log('❌ Product not found');
    return;
  }

  console.log('Product:');
  console.log(`  Name: ${product.name}`);
  console.log(`  Common Name: ${product.commonName || 'N/A'}`);
  console.log(`  Source URL: ${product.sourceUrl}\n`);

  const metadata = (product.metadata as Record<string, unknown>) || {};
  console.log('Metadata keys:', Object.keys(metadata));
  console.log('\nVariants:', JSON.stringify(metadata.variants, null, 2));
}

main().catch(console.error);

