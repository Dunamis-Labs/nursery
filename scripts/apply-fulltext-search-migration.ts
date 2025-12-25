#!/usr/bin/env tsx
/**
 * Apply Full-Text Search Migration
 * 
 * This script adds PostgreSQL full-text search capabilities to the Product table.
 * It creates a searchVector column, trigger, and GIN index for fast text search.
 * 
 * Usage:
 *   npx tsx scripts/apply-fulltext-search-migration.ts
 */

// Load environment variables FIRST (before any imports)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL not set');
  console.error('   Please set DATABASE_URL, DATABASE_URL_NON_POOLING, or POSTGRES_URL_NON_POOLING in your .env file');
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
  console.log('🔍 Applying full-text search migration...\n');

  try {
    // Check if searchVector column already exists
    const columnCheck = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'Product'
      AND column_name = 'searchVector'
    `;

    if (columnCheck.length > 0) {
      console.log('  ⚠️  searchVector column already exists. Skipping column creation.');
    } else {
      console.log('  Adding searchVector column...');
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Product" ADD COLUMN "searchVector" tsvector;
      `);
      console.log('  ✅ searchVector column added');
    }

    // Create or replace the function
    console.log('  Creating update_product_search_vector function...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION update_product_search_vector()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Build search vector from product fields with weights:
        -- A (highest): name, commonName
        -- B (high): botanicalName
        -- C (medium): description
        -- D (low): ProductContent detailedDescription
        NEW."searchVector" := 
          setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW."commonName", '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(NEW."botanicalName", '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
          COALESCE(
            (SELECT setweight(to_tsvector('english', COALESCE(pc."detailedDescription", '')), 'D')
             FROM "ProductContent" pc
             WHERE pc."productId" = NEW.id),
            to_tsvector('')
          );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('  ✅ Function created');

    // Drop existing trigger if it exists, then create new one
    console.log('  Creating trigger...');
    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS product_search_vector_update ON "Product";
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER product_search_vector_update
      BEFORE INSERT OR UPDATE ON "Product"
      FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();
    `);
    console.log('  ✅ Trigger created');

    // Check if index exists
    const indexCheck = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname = 'Product_searchVector_idx'
    `;

    if (indexCheck.length > 0) {
      console.log('  ⚠️  GIN index already exists. Skipping index creation.');
    } else {
      console.log('  Creating GIN index...');
      await prisma.$executeRawUnsafe(`
        CREATE INDEX "Product_searchVector_idx" 
        ON "Product" USING GIN ("searchVector");
      `);
      console.log('  ✅ GIN index created');
    }

    // Update existing products to populate search vector
    console.log('  Updating existing products to populate search vectors...');
    const updateResult = await prisma.$executeRawUnsafe(`
      UPDATE "Product" 
      SET "updatedAt" = "updatedAt"
      WHERE "searchVector" IS NULL OR "searchVector" = to_tsvector('');
    `);
    console.log(`  ✅ Updated existing products`);

    console.log('\n✅ Full-text search migration completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('  1. The search API will now use full-text search automatically');
    console.log('  2. Search vectors are automatically updated when products are created/updated');
    console.log('  3. Test the search functionality at /api/search?q=your+query\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  applyMigration();
}

