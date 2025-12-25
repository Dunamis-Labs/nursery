#!/usr/bin/env tsx
/**
 * Product Enrichment Script using OpenAI ChatGPT API
 * 
 * This script iterates through all products and uses OpenAI API to:
 * - Find common name and update Product.commonName
 * - Generate "ideal for" and "not ideal for" lists (max 12 items total)
 * - Write high-quality SEO-optimized description
 * - Generate specifications (light, humidity, growth rate, toxicity, watering, temperature, difficulty, origin)
 * - Write detailed care instructions
 * - Generate at least 5 FAQs
 * 
 * Usage:
 *   tsx scripts/enrich-products-with-openai.ts
 * 
 * Requirements:
 *   - OPENAI_API_KEY must be set in .env file
 *   - DATABASE_URL must be configured
 */

// CRITICAL: Load environment variables FIRST using require (synchronous)
// This must happen before any imports that use process.env
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Now import Prisma (after env vars are loaded)
import { prisma } from '@nursery/db';

// Check for API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY is not set in .env file');
  console.error('   Please add it from your OpenAI account: https://platform.openai.com/api-keys');
  process.exit(1);
}

interface ChatGPTResponse {
  commonName?: string;
  idealFor: string[];
  notIdealFor: string[];
  description: string; // Multi-paragraph SEO-optimized description (with markdown bold)
  specifications: {
    lightRequirements: string;
    humidity: string;
    growthRate: string;
    toxicity: string;
    watering: string;
    temperature: string;
    difficulty: string;
    origin: string;
  };
  careInstructions: string; // Detailed care instructions, SEO-optimized (with markdown bold)
  faqs: Array<{
    question: string;
    answer: string; // May include markdown bold
  }>;
  seoSlug?: string; // SEO-optimized slug suggestion
}

/**
 * Call OpenAI ChatGPT API to enrich product data
 */
async function enrichProductWithChatGPT(product: {
  id: string;
  name: string;
  botanicalName: string | null;
  commonName: string | null;
  description: string | null;
  category: { name: string; slug: string };
}): Promise<ChatGPTResponse> {
  const prompt = `You are a plant expert helping to create comprehensive product information for an online plant nursery in AUSTRALIA.

IMPORTANT: All content must be tailored specifically for Australian audiences, including:
- Australian climate zones and growing conditions
- Australian seasons (opposite to Northern Hemisphere)
- Australian native wildlife considerations (possums, birds, etc.)
- Australian soil types and conditions
- Australian gardening practices and terminology
- Australian plant hardiness zones
- References to Australian cities, regions, and climates where relevant

Product Information:
- Current Name: ${product.name}
- Botanical Name: ${product.botanicalName || 'Not provided'}
- Current Common Name: ${product.commonName || 'Not provided'}
- Category: ${product.category.name}
- Current Description: ${product.description || 'None'}

Please provide the following information in JSON format:

1. **commonName**: The most commonly used name for this plant (if different from current name). If the current name is already the common name, use that.

2. **idealFor**: An array of strings (maximum 6 items) describing who this plant is ideal for. Examples:
   - "Beginners and first-time plant owners"
   - "Bright indoor spaces with indirect light"
   - "Homes looking for a bold statement plant"
   - "Plant enthusiasts who enjoy watching rapid growth"

3. **notIdealFor**: An array of strings (maximum 6 items) describing who this plant is NOT ideal for. Examples:
   - "Very low-light rooms without windows"
   - "Homes with pets that chew leaves (plant is toxic)"
   - "Spaces with limited vertical room for climbing growth"

4. **description**: A high-quality, SEO-optimized description (3-5 paragraphs) that:
   - Is optimized for ChatGPT and search engines
   - Includes relevant keywords naturally
   - Describes the plant's appearance, characteristics, and appeal
   - Mentions care requirements briefly
   - Is engaging and informative
   - Tailored for Australian climate and conditions
   - Use **bold text** (markdown **text**) to emphasize key features, benefits, or important information naturally throughout the text
   - Format: Use markdown with **bold** for emphasis where it feels natural (e.g., "**Drought-tolerant** and perfect for Australian gardens")

5. **specifications**: An object with these exact fields (all strings):
   - lightRequirements: e.g., "Bright indirect light", "Full sun", "Partial shade" (consider Australian sun intensity)
   - humidity: e.g., "High", "Moderate", "Low" (consider Australian climate zones)
   - growthRate: e.g., "Fast", "Moderate", "Slow"
   - toxicity: e.g., "Toxic to pets", "Non-toxic", "Mildly toxic" (consider Australian native wildlife)
   - watering: e.g., "Weekly in summer", "When soil is dry", "Keep moist" (use Australian seasonal references)
   - temperature: e.g., "18-24°C", "Warm", "Cool" (use Celsius, consider Australian temperature ranges)
   - difficulty: e.g., "Easy", "Moderate", "Difficult"
   - origin: e.g., "Tropical Asia", "South America", "Australia" (note if Australian native)

6. **careInstructions**: Detailed care instructions (3-5 paragraphs) optimized for SEO, covering:
   - Watering schedule and methods (tailored to Australian seasons and climate)
   - Light requirements in detail (consider Australian sun intensity and UV levels)
   - Soil and potting requirements (Australian soil types and conditions)
   - Fertilization (Australian growing seasons and products)
   - Pruning and maintenance (Australian timing and practices)
   - Common issues and solutions (Australian pests, diseases, and environmental challenges)
   - Use **bold text** (markdown **text**) to emphasize important care tips, warnings, or key information naturally
   - Format: Use markdown with **bold** for emphasis (e.g., "**Water deeply** during summer months")

7. **faqs**: An array of at least 5 FAQ objects, each with:
   - question: A common question about this plant (consider Australian-specific concerns)
   - answer: A detailed, helpful answer (2-3 sentences minimum) tailored for Australian conditions
   - Use **bold text** in answers to emphasize key points where natural

CRITICAL: Return ONLY valid JSON. Do NOT include any explanatory text, markdown code blocks, or additional commentary before or after the JSON. Start your response directly with the opening brace { and end with the closing brace }.

Return ONLY valid JSON in this exact format:
{
  "commonName": "string",
  "idealFor": ["string", "string", ...],
  "notIdealFor": ["string", "string", ...],
  "description": "string (multiple paragraphs)",
  "specifications": {
    "lightRequirements": "string",
    "humidity": "string",
    "growthRate": "string",
    "toxicity": "string",
    "watering": "string",
    "temperature": "string",
    "difficulty": "string",
    "origin": "string"
  },
  "careInstructions": "string (multiple paragraphs)",
  "faqs": [
    {"question": "string", "answer": "string"},
    ...
  ]
}`;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // Using GPT-4o (or you can use 'gpt-4-turbo-preview' or 'gpt-3.5-turbo' for faster/cheaper)
          messages: [
            {
              role: 'system',
              content: 'You are a helpful plant expert. Always respond with valid JSON only, no additional text or markdown formatting.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' }, // Force JSON response
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit - wait and retry
          const retryAfter = parseInt(response.headers.get('retry-after') || '60', 10);
          console.log(`⏳ Rate limited. Waiting ${retryAfter} seconds before retry ${attempt}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }
        // Get error details
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`  API Error Response: ${errorText}`);
        throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content in API response');
      }

      // Extract JSON from response (handle markdown code blocks and explanatory text)
      let jsonText = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      
      // Remove any explanatory text before the JSON (look for first {)
      const firstBrace = jsonText.indexOf('{');
      if (firstBrace > 0) {
        jsonText = jsonText.substring(firstBrace);
      }
      
      // Remove any text after the last } (handle trailing explanations)
      const lastBrace = jsonText.lastIndexOf('}');
      if (lastBrace >= 0 && lastBrace < jsonText.length - 1) {
        jsonText = jsonText.substring(0, lastBrace + 1);
      }

      const result = JSON.parse(jsonText.trim()) as ChatGPTResponse;

      // Validate response structure
      if (!result.idealFor || !result.notIdealFor || !result.description || !result.specifications || !result.careInstructions || !result.faqs) {
        throw new Error('Invalid response structure from ChatGPT API');
      }

      // Ensure total items don't exceed 12
      const totalItems = result.idealFor.length + result.notIdealFor.length;
      if (totalItems > 12) {
        // Trim to fit
        const excess = totalItems - 12;
        if (result.notIdealFor.length >= excess) {
          result.notIdealFor = result.notIdealFor.slice(0, result.notIdealFor.length - excess);
        } else {
          const remaining = excess - result.notIdealFor.length;
          result.notIdealFor = [];
          result.idealFor = result.idealFor.slice(0, result.idealFor.length - remaining);
        }
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`  ⚠️  Attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : error);
      
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`  ⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError || new Error('Failed to enrich product after all retries');
}

/**
 * Generate SEO-friendly slug from product name
 */
function generateSEOSlug(name: string, categorySlug: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length for SEO
}

/**
 * Save enriched data to database
 */
async function saveEnrichedData(
  productId: string,
  categorySlug: string,
  currentName: string,
  data: ChatGPTResponse
): Promise<void> {
  // Generate SEO-friendly slug from common name (or current name)
  const displayName = data.commonName || currentName;
  const newSlug = generateSEOSlug(displayName, categorySlug);
  
  // Check if slug already exists (for another product)
  const existingProduct = await prisma.product.findFirst({
    where: {
      slug: newSlug,
      id: { not: productId },
    },
  });
  
  // If slug exists, append a unique identifier
  const finalSlug = existingProduct 
    ? `${newSlug}-${productId.substring(0, 8)}`
    : newSlug;

  // Update Product with commonName and SEO-optimized slug
  await prisma.product.update({
    where: { id: productId },
    data: {
      commonName: data.commonName || undefined,
      slug: finalSlug, // Update to SEO-friendly slug
    },
  });

  // Upsert ProductContent
  await prisma.productContent.upsert({
    where: { productId },
    create: {
      productId,
      detailedDescription: data.description,
      careInstructions: data.careInstructions,
      idealFor: data.idealFor,
      notIdealFor: data.notIdealFor,
    },
    update: {
      detailedDescription: data.description,
      careInstructions: data.careInstructions,
      idealFor: data.idealFor,
      notIdealFor: data.notIdealFor,
    },
  });

  // Upsert ProductSpecification
  await prisma.productSpecification.upsert({
    where: { productId },
    create: {
      productId,
      lightRequirements: data.specifications.lightRequirements,
      humidity: data.specifications.humidity,
      growthRate: data.specifications.growthRate,
      toxicity: data.specifications.toxicity,
      watering: data.specifications.watering,
      temperature: data.specifications.temperature,
      difficulty: data.specifications.difficulty,
      origin: data.specifications.origin,
    },
    update: {
      lightRequirements: data.specifications.lightRequirements,
      humidity: data.specifications.humidity,
      growthRate: data.specifications.growthRate,
      toxicity: data.specifications.toxicity,
      watering: data.specifications.watering,
      temperature: data.specifications.temperature,
      difficulty: data.specifications.difficulty,
      origin: data.specifications.origin,
    },
  });

  // Delete existing FAQs and create new ones
  await prisma.fAQ.deleteMany({
    where: { productId },
  });

  // Create FAQs with display order (only if we have FAQs)
  if (data.faqs.length > 0) {
    await prisma.fAQ.createMany({
      data: data.faqs.map((faq, index) => ({
        productId,
        question: faq.question,
        answer: faq.answer,
        displayOrder: index,
      })),
    });
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🌱 Starting Product Enrichment with OpenAI ChatGPT API...\n');

  // Get total product count
  const totalProducts = await prisma.product.count();
  console.log(`📊 Found ${totalProducts} products to process\n`);

  // Fetch all products with category (or just one for testing)
  const TEST_MODE = process.env.TEST_MODE === 'true' || process.argv.includes('--test');
  const limit = TEST_MODE ? 1 : undefined;
  
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      botanicalName: true,
      commonName: true,
      description: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: limit, // Only get 1 product in test mode
  });
  
  if (TEST_MODE) {
    console.log('🧪 TEST MODE: Processing only 1 product\n');
  }

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  const errors: Array<{ productId: string; productName: string; error: string }> = [];

  for (const product of products) {
    processed++;
    const progress = TEST_MODE ? 'N/A' : ((processed / totalProducts) * 100).toFixed(1);

    console.log(`\n[${processed}${TEST_MODE ? '' : `/${totalProducts} (${progress}%)`}] Processing: ${product.name}`);
    console.log(`  ID: ${product.id}`);

    try {
      // Enrich with ChatGPT
      const enrichedData = await enrichProductWithChatGPT(product);
      console.log(`  ✅ Enriched successfully`);

      // Save to database
      await saveEnrichedData(
        product.id, 
        product.category.slug, 
        product.name,
        enrichedData
      );
      console.log(`  💾 Saved to database`);

      succeeded++;
    } catch (error) {
      failed++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Failed: ${errorMessage}`);
      errors.push({
        productId: product.id,
        productName: product.name,
        error: errorMessage,
      });
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ENRICHMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Products: ${TEST_MODE ? '1 (test mode)' : totalProducts}`);
  console.log(`✅ Succeeded: ${succeeded}`);
  console.log(`❌ Failed: ${failed}`);
  if (!TEST_MODE) {
    console.log(`📈 Success Rate: ${((succeeded / totalProducts) * 100).toFixed(1)}%`);
  }

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(({ productName, error }) => {
      console.log(`  - ${productName}: ${error}`);
    });
  }

  console.log('\n✨ Enrichment complete!');
}

// Run the script
main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

