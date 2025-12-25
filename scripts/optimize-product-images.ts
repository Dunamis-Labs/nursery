#!/usr/bin/env tsx
/**
 * Optimize product images for web use
 * 
 * Requirements:
 * - ImageMagick: brew install imagemagick
 * 
 * Usage:
 *   npx tsx scripts/optimize-product-images.ts
 *   npx tsx scripts/optimize-product-images.ts --dry-run  # Preview only
 *   npx tsx scripts/optimize-product-images.ts --limit 100  # Process first 100 only
 */

import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';

const PRODUCTS_DIR = join(process.cwd(), 'apps/web/public/products');
const MAX_WIDTH = 1200; // Max width for product images
const QUALITY = 85; // JPEG quality (0-100)
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT_ARG = process.argv.find(arg => arg.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : undefined;

interface ImageInfo {
  path: string;
  size: number;
  relativePath: string;
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

function getAllImageFiles(dir: string, fileList: ImageInfo[] = []): ImageInfo[] {
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(dir, file.name);
    const relativePath = filePath.replace(PRODUCTS_DIR + '/', '');

    if (file.isDirectory()) {
      getAllImageFiles(filePath, fileList);
    } else if (/\.(jpg|jpeg|png)$/i.test(file.name)) {
      const size = getImageSize(filePath);
      if (size > 0) {
        fileList.push({
          path: filePath,
          size,
          relativePath,
        });
      }
    }
  }

  return fileList;
}

function optimizeImage(inputPath: string, outputPath: string): void {
  try {
    // Use ImageMagick to optimize (magick for v7+, convert for v6)
    // -quality: JPEG quality
    // -resize: Resize if larger than maxWidth, maintain aspect ratio
    // -strip: Remove metadata
    // -interlace Plane: Progressive JPEG
    // -auto-orient: Fix orientation based on EXIF
    const command = `magick "${inputPath}" -quality ${QUALITY} -resize ${MAX_WIDTH}x${MAX_WIDTH}\\> -strip -interlace Plane -auto-orient "${outputPath}"`;
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    // Fallback to convert for ImageMagick v6
    try {
      const fallbackCommand = `convert "${inputPath}" -quality ${QUALITY} -resize ${MAX_WIDTH}x${MAX_WIDTH}\\> -strip -interlace Plane -auto-orient "${outputPath}"`;
      execSync(fallbackCommand, { stdio: 'inherit' });
    } catch (fallbackError) {
      console.error(`❌ Error optimizing ${inputPath}:`, error);
      throw error;
    }
  }
}

async function main() {
  console.log('🖼️  Product Image Optimizer\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  // Check ImageMagick
  if (!checkImageMagick()) {
    console.error('❌ ImageMagick not found!');
    console.error('   Install with: brew install imagemagick');
    process.exit(1);
  }

  // Check if products directory exists
  if (!existsSync(PRODUCTS_DIR)) {
    console.error(`❌ Products directory not found: ${PRODUCTS_DIR}`);
    process.exit(1);
  }

  // Get all images recursively
  console.log('📂 Scanning for images...');
  const allImages = getAllImageFiles(PRODUCTS_DIR)
    .sort((a, b) => b.size - a.size); // Sort by size (largest first)

  if (allImages.length === 0) {
    console.log('⚠️  No images found in', PRODUCTS_DIR);
    process.exit(0);
  }

  // Apply limit if specified
  const imagesToProcess = LIMIT ? allImages.slice(0, LIMIT) : allImages;

  console.log(`\nFound ${allImages.length} total images`);
  if (LIMIT) {
    console.log(`Processing first ${LIMIT} images (largest first)\n`);
  } else {
    console.log(`Processing all ${imagesToProcess.length} images\n`);
  }

  // Show size distribution
  const totalSizeBefore = imagesToProcess.reduce((sum, img) => sum + img.size, 0);
  const sizeRanges = {
    '> 1 MB': 0,
    '500 KB - 1 MB': 0,
    '100 KB - 500 KB': 0,
    '< 100 KB': 0,
  };

  imagesToProcess.forEach(img => {
    if (img.size > 1024 * 1024) sizeRanges['> 1 MB']++;
    else if (img.size > 500 * 1024) sizeRanges['500 KB - 1 MB']++;
    else if (img.size > 100 * 1024) sizeRanges['100 KB - 500 KB']++;
    else sizeRanges['< 100 KB']++;
  });

  console.log('Size distribution:');
  Object.entries(sizeRanges).forEach(([range, count]) => {
    if (count > 0) {
      console.log(`  ${range.padEnd(20)} ${count} images`);
    }
  });
  console.log(`\n  Total size: ${formatBytes(totalSizeBefore)}\n`);

  if (DRY_RUN) {
    console.log('✅ Dry run complete. Run without --dry-run to optimize images.');
    process.exit(0);
  }

  // Create backup directory
  const backupDir = join(PRODUCTS_DIR, 'backup');
  try {
    mkdirSync(backupDir, { recursive: true });
  } catch {
    // Backup dir might already exist
  }

  // Optimize images
  let totalSizeAfter = 0;
  let optimized = 0;
  let skipped = 0;
  let errors = 0;
  const errorFiles: string[] = [];

  console.log('🔄 Optimizing images...\n');

  for (let i = 0; i < imagesToProcess.length; i++) {
    const img = imagesToProcess[i];
    const progress = `[${i + 1}/${imagesToProcess.length}]`;

    try {
      // Create backup path maintaining directory structure
      const relativeDir = dirname(img.relativePath);
      const backupSubDir = join(backupDir, relativeDir);
      const backupPath = join(backupDir, img.relativePath);

      // Skip if already optimized (check if backup exists and file is small)
      if (existsSync(backupPath)) {
        const currentSize = getImageSize(img.path);
        const backupSize = getImageSize(backupPath);
        // If current file is smaller than backup, it's likely already optimized
        if (currentSize < backupSize * 0.9) {
          skipped++;
          if ((i + 1) % 100 === 0) {
            process.stdout.write(`\r${progress} Skipped ${skipped} (already optimized), optimized ${optimized}...`);
          }
          continue;
        }
      }

      // Create backup directory if needed
      if (relativeDir !== '.') {
        mkdirSync(backupSubDir, { recursive: true });
      }

      // Backup original
      if (!existsSync(backupPath)) {
        execSync(`cp "${img.path}" "${backupPath}"`, { stdio: 'ignore' });
      }

      // Optimize to temp file
      const tempPath = img.path + '.tmp';
      optimizeImage(img.path, tempPath);

      // Replace original with optimized
      execSync(`mv "${tempPath}" "${img.path}"`, { stdio: 'ignore' });

      const newSize = getImageSize(img.path);
      const savings = img.size - newSize;
      const savingsPercent = ((savings / img.size) * 100).toFixed(1);

      totalSizeAfter += newSize;
      optimized++;

      // Show progress every 50 images or for large files
      if ((i + 1) % 50 === 0 || img.size > 1024 * 1024) {
        process.stdout.write(
          `\r${progress} Optimized ${optimized}, skipped ${skipped}, errors ${errors} | ` +
          `Latest: ${formatBytes(img.size)} → ${formatBytes(newSize)} (${savingsPercent}% saved)`
        );
      }
    } catch (error) {
      errors++;
      errorFiles.push(img.relativePath);
      if (errors <= 10) {
        console.error(`\n  ❌ Failed: ${img.relativePath}`);
      }
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 Optimization Summary\n');
  console.log(`  Total images:     ${imagesToProcess.length}`);
  console.log(`  Optimized:        ${optimized}`);
  console.log(`  Skipped:          ${skipped} (already optimized)`);
  console.log(`  Errors:           ${errors}`);
  console.log(`  Total size before: ${formatBytes(totalSizeBefore)}`);
  console.log(`  Total size after:  ${formatBytes(totalSizeAfter)}`);
  const totalSavings = totalSizeBefore - totalSizeAfter;
  const totalSavingsPercent = ((totalSavings / totalSizeBefore) * 100).toFixed(1);
  console.log(`  Total savings:     ${formatBytes(totalSavings)} (${totalSavingsPercent}%)`);
  console.log(`\n  Backups saved to: ${backupDir}`);
  console.log('='.repeat(60));

  if (errors > 0) {
    console.error(`\n⚠️  ${errors} images failed to optimize`);
    if (errorFiles.length <= 20) {
      console.error('Failed files:', errorFiles.join(', '));
    } else {
      console.error('First 20 failed files:', errorFiles.slice(0, 20).join(', '));
      console.error(`... and ${errorFiles.length - 20} more`);
    }
    process.exit(1);
  }

  if (LIMIT && allImages.length > LIMIT) {
    console.log(`\n💡 Tip: ${allImages.length - LIMIT} more images remain. Run again to process them.`);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

