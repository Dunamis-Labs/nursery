#!/usr/bin/env tsx
/**
 * Category Enrichment Script using Claude API
 *
 * Generates three text fields for each main category:
 *  - navTagline (<= 28 chars) for navigation tooltip/line
 *  - heroSubheading (1–2 lines) for category hero section
 *  - aboutParagraph (single paragraph) for the About section
 *
 * Usage:
 *   tsx scripts/enrich-categories-with-claude.ts
 *
 * Optional env flags:
 *   TEST_MODE=true        # process only the first category
 *   TARGET_SLUG=trees     # process only this slug
 *   SKIP_ENRICHED=false   # reprocess even if fields already set
 *
 * Requirements:
 *   - ANTHROPIC_API_KEY in .env
 *   - DATABASE_URL (or fallback vars) in .env
 */

// Load env FIRST
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { prisma } from '@nursery/db';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY is missing in .env');
  process.exit(1);
}

const TEST_MODE = process.env.TEST_MODE === 'true';
const TARGET_SLUG = process.env.TARGET_SLUG?.toLowerCase();
const SKIP_ENRICHED = process.env.SKIP_ENRICHED !== 'false';

type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  content: {
    navTagline: string | null;
    heroSubheading: string | null;
    aboutParagraph: string | null;
  } | null;
};

type CategoryCopy = {
  navTagline: string;
  heroSubheading: string;
  aboutParagraph: string;
};

const MAIN_CATEGORIES = [
  'Trees',
  'Shrubs',
  'Grasses',
  'Hedging and Screening',
  'Groundcovers',
  'Climbers',
  'Palms, Ferns & Tropical',
  'Conifers',
  'Roses',
  'Succulents & Cacti',
  'Citrus & Fruit',
  'Herbs & Vegetables',
  'Water Plants',
  'Indoor Plants',
  'Garden Products',
] as const;

async function callClaude(category: CategoryRecord): Promise<CategoryCopy> {
  const prompt = `You are an expert copywriter for an Australian online plant nursery.

Category:
- Name: ${category.name}
- Slug: ${category.slug}
- Existing description (if any): ${category.description || 'None'}

Write concise, high-conversion copy tailored to Australian gardeners (southern hemisphere seasons).

Return ONLY valid JSON (no markdown, no prose) with this shape:
{
  "navTagline": "string <= 28 characters, no trailing punctuation",
  "heroSubheading": "1–2 short lines (~120-160 chars) highlighting value and what shoppers find here",
  "aboutParagraph": "1 paragraph, 80-150 words, clear helpful tone, mention care/uses/appeal relevant to Australia"
}

Rules:
- navTagline must be <= 28 characters; prefer 24-28 chars; no emojis.
- Avoid repeating the category name verbatim if it wastes space; be specific and enticing.
- Hero subheading should read as a short sentence or two fragments; no emojis.
- About paragraph: conversational, specific benefits, light SEO, AU seasons/climate perspective, no fluff.
`;

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 800,
          temperature: 0.6,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error body');
        throw new Error(`API error ${response.status}: ${errorText.slice(0, 200)}`);
      }

      const data = await response.json();
      const raw = data?.content?.[0]?.text;
      if (!raw) {
        throw new Error('Empty response content');
      }

      let jsonText = raw.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const firstBrace = jsonText.indexOf('{');
      if (firstBrace > 0) jsonText = jsonText.slice(firstBrace);
      const lastBrace = jsonText.lastIndexOf('}');
      if (lastBrace >= 0 && lastBrace < jsonText.length - 1) {
        jsonText = jsonText.slice(0, lastBrace + 1);
      }

      const parsed = JSON.parse(jsonText) as CategoryCopy;

      if (!parsed.navTagline || !parsed.heroSubheading || !parsed.aboutParagraph) {
        throw new Error('Missing fields in Claude response');
      }

      // Enforce length guardrails
      if (parsed.navTagline.length > 28) {
        parsed.navTagline = `${parsed.navTagline.slice(0, 27)}…`;
      }
      return parsed;
    } catch (error) {
      lastError = error as Error;
      const delay = Math.min(15000, attempt * 2000);
      console.error(`  ⚠️ Attempt ${attempt}/${maxRetries} failed: ${(error as Error).message}`);
      if (attempt < maxRetries) {
        console.log(`  ⏳ Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError || new Error('Unknown Claude error');
}

async function saveCopy(categoryId: string, copy: CategoryCopy) {
  await prisma.categoryContent.upsert({
    where: { categoryId },
    update: {
      navTagline: copy.navTagline,
      heroSubheading: copy.heroSubheading,
      aboutParagraph: copy.aboutParagraph,
    },
    create: {
      categoryId,
      navTagline: copy.navTagline,
      heroSubheading: copy.heroSubheading,
      aboutParagraph: copy.aboutParagraph,
    },
  });
}

async function main() {
  console.log('🌿 Starting Category Enrichment with Claude...\n');

  const categories = await prisma.category.findMany({
    where: {
      name: { in: [...MAIN_CATEGORIES] },
      parentId: null,
      ...(TARGET_SLUG ? { slug: TARGET_SLUG } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      content: {
        select: {
          navTagline: true,
          heroSubheading: true,
          aboutParagraph: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  if (categories.length === 0) {
    console.log('No categories found. Check DB connection or TARGET_SLUG.');
    return;
  }

  const workList = TEST_MODE ? categories.slice(0, 1) : categories;

  if (SKIP_ENRICHED) {
    console.log('SKIP_ENRICHED=true — categories with all fields set will be skipped.\n');
  }

  let processed = 0;
  let skipped = 0;
  let succeeded = 0;
  let failed = 0;
  const errors: Array<{ slug: string; error: string }> = [];

  for (const category of workList) {
    processed++;
    console.log(`\n[${processed}/${workList.length}] ${category.name} (${category.slug})`);

    const alreadyHasCopy =
      SKIP_ENRICHED &&
      category.content?.navTagline &&
      category.content?.heroSubheading &&
      category.content?.aboutParagraph;

    if (alreadyHasCopy) {
      skipped++;
      console.log('  ⏭️  Already enriched, skipping.');
      continue;
    }

    try {
      const copy = await callClaude(category);
      await saveCopy(category.id, copy);
      console.log('  ✅ Saved');
      succeeded++;
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`  ❌ Failed: ${message}`);
      errors.push({ slug: category.slug, error: message });
    }

    // Gentle pacing
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Categories total: ${categories.length}`);
  console.log(`Processed: ${processed}`);
  console.log(`Succeeded: ${succeeded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  if (errors.length) {
    console.log('\nErrors:');
    for (const err of errors) {
      console.log(` - ${err.slug}: ${err.error}`);
    }
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

