#!/usr/bin/env tsx
/**
 * Apply the product enrichment migration directly via SQL
 * This bypasses Prisma's migration system to avoid connection pooling issues
 */

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL not set');
  process.exit(1);
}

// Create Prisma client with direct connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function applyMigration() {
  console.log('🔄 Applying product enrichment migration...\n');

  try {
    // Check if columns already exist
    const existingColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ProductContent' 
      AND column_name IN ('idealFor', 'notIdealFor')
    `;

    const hasIdealFor = existingColumns.some(c => c.column_name === 'idealFor');
    const hasNotIdealFor = existingColumns.some(c => c.column_name === 'notIdealFor');

    // Add columns if they don't exist
    if (!hasIdealFor) {
      console.log('  Adding idealFor column...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ProductContent" 
        ADD COLUMN IF NOT EXISTS "idealFor" TEXT[] DEFAULT ARRAY[]::TEXT[];
      `);
      console.log('  ✅ idealFor column added');
    } else {
      console.log('  ✅ idealFor column already exists');
    }

    if (!hasNotIdealFor) {
      console.log('  Adding notIdealFor column...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ProductContent" 
        ADD COLUMN IF NOT EXISTS "notIdealFor" TEXT[] DEFAULT ARRAY[]::TEXT[];
      `);
      console.log('  ✅ notIdealFor column added');
    } else {
      console.log('  ✅ notIdealFor column already exists');
    }

    // Check if ProductSpecification table exists
    const specTable = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'ProductSpecification'
    `;

    if (specTable.length === 0) {
      console.log('  Creating ProductSpecification table...');
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "ProductSpecification" (
          "id" TEXT NOT NULL,
          "productId" TEXT NOT NULL,
          "lightRequirements" TEXT,
          "humidity" TEXT,
          "growthRate" TEXT,
          "toxicity" TEXT,
          "watering" TEXT,
          "temperature" TEXT,
          "difficulty" TEXT,
          "origin" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("id")
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX "ProductSpecification_productId_key" ON "ProductSpecification"("productId");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX "ProductSpecification_productId_idx" ON "ProductSpecification"("productId");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX "ProductSpecification_lightRequirements_idx" ON "ProductSpecification"("lightRequirements");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX "ProductSpecification_humidity_idx" ON "ProductSpecification"("humidity");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX "ProductSpecification_growthRate_idx" ON "ProductSpecification"("growthRate");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX "ProductSpecification_toxicity_idx" ON "ProductSpecification"("toxicity");
      `);

      await prisma.$executeRawUnsafe(`
        CREATE INDEX "ProductSpecification_difficulty_idx" ON "ProductSpecification"("difficulty");
      `);

      await prisma.$executeRawUnsafe(`
        ALTER TABLE "ProductSpecification" 
        ADD CONSTRAINT "ProductSpecification_productId_fkey" 
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);

      console.log('  ✅ ProductSpecification table created');
    } else {
      console.log('  ✅ ProductSpecification table already exists');
    }

    console.log('\n✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

