import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: resolve(process.cwd(), '.env') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Adding image column to Category table...');
  
  try {
    // Add the image column if it doesn't exist
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Category" 
      ADD COLUMN IF NOT EXISTS "image" VARCHAR(500);
    `);
    console.log('✅ Image column added successfully');
  } catch (error) {
    console.error('❌ Error adding column:', error);
    throw error;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

