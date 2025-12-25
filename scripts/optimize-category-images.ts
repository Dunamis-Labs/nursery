#!/usr/bin/env tsx
/**
 * Optimize category images for web use
 * 
 * Requirements:
 * - ImageMagick: brew install imagemagick
 * 
 * Usage:
 *   npx tsx scripts/optimize-category-images.ts
 */

import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const CATEGORIES_DIR = join(process.cwd(), 'apps/web/public/categories');
const MAX_WIDTH = 1920; // Max width for hero images
const MAX_TILE_WIDTH = 800; // Max width for tile images
const QUALITY = 85; // JPEG quality (0-100)

interface ImageInfo {
  name: string;
  path: string;
  size: number;
  isHeader: boolean;
}

function checkImageMagick(): boolean {
  try {
    execSync('which magick', { stdio: 'ignore' });
    return true;
  } catch {
    // Fallback to convert for older ImageMagick versions
    try {
      execSync('which convert', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

function getImageSize(path: string): number {
  try {
    return statSync(path).size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function optimizeImage(inputPath: string, outputPath: string, maxWidth: number): void {
  try {
    // Use ImageMagick to optimize (magick for v7+, convert for v6)
    // -quality: JPEG quality
    // -resize: Resize if larger than maxWidth, maintain aspect ratio
    // -strip: Remove metadata
    // -interlace Plane: Progressive JPEG
    const command = `magick "${inputPath}" -quality ${QUALITY} -resize ${maxWidth}x${maxWidth}\\> -strip -interlace Plane "${outputPath}"`;
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    // Fallback to convert for ImageMagick v6
    try {
      const fallbackCommand = `convert "${inputPath}" -quality ${QUALITY} -resize ${maxWidth}x${maxWidth}\\> -strip -interlace Plane "${outputPath}"`;
      execSync(fallbackCommand, { stdio: 'inherit' });
    } catch (fallbackError) {
      console.error(`❌ Error optimizing ${inputPath}:`, error);
      throw error;
    }
  }
}

async function main() {
  console.log('🖼️  Category Image Optimizer\n');

  // Check ImageMagick
  if (!checkImageMagick()) {
    console.error('❌ ImageMagick not found!');
    console.error('   Install with: brew install imagemagick');
    process.exit(1);
  }

  // Get all images
  const files = readdirSync(CATEGORIES_DIR)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
    .map(file => {
      const path = join(CATEGORIES_DIR, file);
      const isHeader = file.includes('-header');
      return {
        name: file,
        path,
        size: getImageSize(path),
        isHeader,
      };
    })
    .sort((a, b) => b.size - a.size); // Sort by size (largest first)

  if (files.length === 0) {
    console.log('⚠️  No images found in', CATEGORIES_DIR);
    process.exit(0);
  }

  console.log(`Found ${files.length} images to optimize:\n`);

  // Show current sizes
  const totalSizeBefore = files.reduce((sum, file) => sum + file.size, 0);
  files.forEach(file => {
    console.log(`  ${file.name.padEnd(30)} ${formatBytes(file.size).padStart(10)} ${file.isHeader ? '(header)' : '(tile)'}`);
  });
  console.log(`\n  Total: ${formatBytes(totalSizeBefore)}\n`);

  // Create backup directory
  const backupDir = join(CATEGORIES_DIR, 'backup');
  try {
    execSync(`mkdir -p "${backupDir}"`, { stdio: 'ignore' });
  } catch {
    // Backup dir might already exist
  }

  // Optimize each image
  let totalSizeAfter = 0;
  const optimized: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const maxWidth = file.isHeader ? MAX_WIDTH : MAX_TILE_WIDTH;
      const backupPath = join(backupDir, file.name);
      const tempPath = join(CATEGORIES_DIR, `temp_${file.name}`);

      // Backup original
      console.log(`\n📸 Optimizing ${file.name}...`);
      execSync(`cp "${file.path}" "${backupPath}"`, { stdio: 'ignore' });

      // Optimize to temp file
      optimizeImage(file.path, tempPath, maxWidth);

      // Replace original with optimized
      execSync(`mv "${tempPath}" "${file.path}"`, { stdio: 'ignore' });

      const newSize = getImageSize(file.path);
      const savings = file.size - newSize;
      const savingsPercent = ((savings / file.size) * 100).toFixed(1);

      totalSizeAfter += newSize;
      optimized.push(file.name);

      console.log(`  ✅ Optimized: ${formatBytes(file.size)} → ${formatBytes(newSize)} (saved ${formatBytes(savings)}, ${savingsPercent}%)`);
    } catch (error) {
      console.error(`  ❌ Failed to optimize ${file.name}`);
      errors.push(file.name);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Optimization Summary\n');
  console.log(`  Optimized: ${optimized.length} images`);
  if (errors.length > 0) {
    console.log(`  Errors: ${errors.length} images`);
  }
  console.log(`  Total size before: ${formatBytes(totalSizeBefore)}`);
  console.log(`  Total size after:  ${formatBytes(totalSizeAfter)}`);
  const totalSavings = totalSizeBefore - totalSizeAfter;
  const totalSavingsPercent = ((totalSavings / totalSizeBefore) * 100).toFixed(1);
  console.log(`  Total savings:     ${formatBytes(totalSavings)} (${totalSavingsPercent}%)`);
  console.log(`\n  Backups saved to: ${backupDir}`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.error('\n⚠️  Some images failed to optimize:', errors.join(', '));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

