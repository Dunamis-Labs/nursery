#!/usr/bin/env tsx
/**
 * Fix specific category images: Roses, Water Plants, and Climbers
 */

import { execSync } from 'child_process';
import { join } from 'path';

const categoriesDir = join(process.cwd(), 'apps', 'web', 'public', 'categories');

// Better Unsplash URLs for the problematic categories
// Using specific photo IDs that match the categories
const FIXES: Record<string, string> = {
  'roses.jpg': 'https://images.unsplash.com/photo-1518621012420-9916c1c86a5a?w=1920&q=80&fit=crop', // Rose garden - photo by Annie Spratt
  'water-plants.jpg': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80&fit=crop', // Water lilies - photo by David Clode
  'climbers.jpg': 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1920&q=80&fit=crop', // Climbing plants/vines
};

async function downloadImage(filename: string, url: string): Promise<boolean> {
  const filepath = join(categoriesDir, filename);
  try {
    console.log(`📥 Downloading ${filename}...`);
    execSync(`curl -L --max-time 30 --retry 3 --retry-delay 2 -o "${filepath}" "${url}"`, {
      stdio: 'inherit',
    });
    
    // Verify the file was created and has content
    const fs = require('fs');
    const stats = fs.statSync(filepath);
    if (stats.size > 0) {
      console.log(`  ✅ Downloaded ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
      return true;
    } else {
      console.log(`  ❌ File is empty: ${filename}`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Failed to download ${filename}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing category images...\n');

  for (const [filename, url] of Object.entries(FIXES)) {
    await downloadImage(filename, url);
    console.log('');
  }

  console.log('✅ Complete!');
}

main().catch(console.error);

