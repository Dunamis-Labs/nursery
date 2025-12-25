#!/usr/bin/env tsx
/**
 * Test script to check if migration was applied
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { prisma } from '@nursery/db';

async function testMigration() {
  try {
    // Test 1: Check if ProductSpecification table exists
    const specTable = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'ProductSpecification'
    `;
    
    console.log('✅ ProductSpecification table:', specTable.length > 0 ? 'EXISTS' : '❌ NOT FOUND');
    
    // Test 2: Check if ProductContent has new columns
    const contentColumns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'ProductContent' 
      AND column_name IN ('idealFor', 'notIdealFor')
    `;
    
    const hasIdealFor = contentColumns.some(c => c.column_name === 'idealFor');
    const hasNotIdealFor = contentColumns.some(c => c.column_name === 'notIdealFor');
    
    console.log('✅ ProductContent.idealFor:', hasIdealFor ? 'EXISTS' : '❌ NOT FOUND');
    console.log('✅ ProductContent.notIdealFor:', hasNotIdealFor ? 'EXISTS' : '❌ NOT FOUND');
    
    // Test 3: Try to create a test ProductSpecification (will fail if table doesn't exist)
    if (specTable.length > 0 && hasIdealFor && hasNotIdealFor) {
      console.log('\n✅ Migration appears to be applied!');
      process.exit(0);
    } else {
      console.log('\n❌ Migration NOT applied. Please run: npm run db:migrate');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error checking migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testMigration();

