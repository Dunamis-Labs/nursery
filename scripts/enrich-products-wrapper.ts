#!/usr/bin/env tsx
/**
 * Wrapper script that loads environment variables before importing the main script
 */

// Load environment variables FIRST
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL && !process.env.DATABASE_URL_NON_POOLING && !process.env.POSTGRES_URL_NON_POOLING) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file');
  process.exit(1);
}

// Now import and run the main script
// Default to Anthropic Claude, or set USE_OPENAI=true to use OpenAI
const useOpenAI = process.env.USE_OPENAI === 'true';
if (useOpenAI) {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ ERROR: USE_OPENAI=true but OPENAI_API_KEY is not set in .env file');
    process.exit(1);
  }
  import('./enrich-products-with-openai');
} else {
  // Default to Anthropic Claude
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ERROR: ANTHROPIC_API_KEY is not set in .env file');
    console.error('   Please add it from Cursor Settings > Models > Anthropic API Key');
    console.error('   Or set USE_OPENAI=true to use OpenAI instead');
    process.exit(1);
  }
  import('./enrich-products-with-claude');
}

