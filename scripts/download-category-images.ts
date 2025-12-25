import { config } from 'dotenv';
import { resolve } from 'path';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

config({ path: resolve(process.cwd(), '.env') });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Category to Unsplash image mapping
// Using Unsplash Source API (no auth required for direct image access)
const CATEGORY_IMAGES: Record<string, { searchTerm: string; imageId: string }> = {
  'Trees': { searchTerm: 'trees forest', imageId: 'HdrmjCF-SYU' }, // Large trees
  'Shrubs': { searchTerm: 'shrubs bushes', imageId: 'hfwWrllScLs' }, // Green shrubs
  'Grasses': { searchTerm: 'ornamental grasses', imageId: 'SzpEYT7ZaXI' }, // Grasses
  'Hedging and Screening': { searchTerm: 'hedge privacy screen', imageId: 'hfwWrllScLs' }, // Hedges
  'Groundcovers': { searchTerm: 'groundcover plants', imageId: 'HdrmjCF-SYU' }, // Groundcover
  'Climbers': { searchTerm: 'climbing vines plants', imageId: 'SJpZDX0ZrHU' }, // Vines
  'Palms, Ferns & Tropical': { searchTerm: 'tropical palms ferns', imageId: 'SJpZDX0ZrHU' }, // Tropical
  'Conifers': { searchTerm: 'conifer pine trees', imageId: 'HdrmjCF-SYU' }, // Conifers
  'Roses': { searchTerm: 'rose flowers garden', imageId: '9WbwHrX0m8U' }, // Roses
  'Succulents & Cacti': { searchTerm: 'succulents cacti', imageId: 'SzpEYT7ZaXI' }, // Succulents
  'Citrus & Fruit': { searchTerm: 'citrus fruit trees', imageId: 'LMYP-PlmuI0' }, // Fruit trees
  'Herbs & Vegetables': { searchTerm: 'herbs vegetables garden', imageId: 'LMYP-PlmuI0' }, // Herbs
  'Water Plants': { searchTerm: 'water plants aquatic', imageId: '9WbwHrX0m8U' }, // Water plants
  'Indoor Plants': { searchTerm: 'indoor house plants', imageId: 'HdrmjCF-SYU' }, // Indoor
  'Garden Products': { searchTerm: 'garden tools supplies', imageId: 'hfwWrllScLs' }, // Garden products
};

// Direct Unsplash photo URLs (using specific photo IDs for reliable downloads)
// Format: https://images.unsplash.com/photo-{id}?w=1920&q=80
const UPDATED_CATEGORY_IMAGES: Record<string, string> = {
  'Trees': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
  'Shrubs': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
  'Grasses': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80',
  'Hedging and Screening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
  'Groundcovers': 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1920&q=80',
  'Climbers': 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1920&q=80', // Climbing vines/ivy on wall
  'Palms, Ferns & Tropical': 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1920&q=80',
  'Conifers': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80',
  'Roses': 'https://images.unsplash.com/photo-1518621012420-9916c1c86a5a?w=1920&q=80', // Rose garden with multiple roses
  'Succulents & Cacti': 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=1920&q=80',
  'Citrus & Fruit': 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=1920&q=80',
  'Herbs & Vegetables': 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1920&q=80',
  'Water Plants': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80', // Water lilies and aquatic plants in pond
  'Indoor Plants': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1920&q=80',
  'Garden Products': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80',
};

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    // Use curl with timeout and retry
    execSync(`curl -L --max-time 30 --retry 3 --retry-delay 2 -o "${filepath}" "${url}"`, {
      stdio: 'pipe',
    });
    return true;
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    return false;
  }
}

async function main() {
  console.log('🖼️  Downloading category header images from Unsplash...\n');

  // Ensure categories directory exists
  const categoriesDir = join(process.cwd(), 'apps', 'web', 'public', 'categories');
  if (!existsSync(categoriesDir)) {
    mkdirSync(categoriesDir, { recursive: true });
  }

  // Get all categories
  const categories = await prisma.category.findMany({
    where: {
      name: { in: Object.keys(UPDATED_CATEGORY_IMAGES) },
    },
  });

  console.log(`Found ${categories.length} categories to update\n`);

  let downloaded = 0;
  let updated = 0;

  for (const category of categories) {
    const imageUrl = UPDATED_CATEGORY_IMAGES[category.name];
    if (!imageUrl) {
      console.log(`⚠️  No image URL for category: ${category.name}`);
      continue;
    }

    // Generate filename from category slug
    const filename = `${category.slug}.jpg`;
    const filepath = join(categoriesDir, filename);
    const relativePath = `/categories/${filename}`;

    // Download image
    console.log(`📥 Downloading image for ${category.name}...`);
    const success = await downloadImage(imageUrl, filepath);

    if (success) {
      downloaded++;
      console.log(`  ✅ Downloaded: ${filename}`);

      // Update with image path using Prisma
      try {
        await prisma.category.update({
          where: { id: category.id },
          data: { image: relativePath },
        });
        updated++;
        console.log(`  ✅ Updated database: ${relativePath}`);
      } catch (error) {
        console.error(`  ❌ Failed to update database:`, error);
      }
    } else {
      console.log(`  ❌ Failed to download image for ${category.name}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Complete!`);
  console.log(`  Downloaded: ${downloaded} images`);
  console.log(`  Updated: ${updated} categories`);
  console.log(`  Images stored in: ${categoriesDir}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

