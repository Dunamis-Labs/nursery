#!/usr/bin/env tsx
/**
 * Upload images to Vercel Blob Storage
 * 
 * This script uploads category and product images to Vercel Blob Storage
 * and updates the database with the new CDN URLs.
 * 
 * Prerequisites:
 * 1. Install @vercel/blob: npm install @vercel/blob
 * 2. Set BLOB_READ_WRITE_TOKEN in .env (get from Vercel dashboard)
 * 
 * Usage:
 *   npx tsx scripts/upload-images-to-vercel-blob.ts
 *   npx tsx scripts/upload-images-to-vercel-blob.ts --categories-only
 *   npx tsx scripts/upload-images-to-vercel-blob.ts --products-only
 *   npx tsx scripts/upload-images-to-vercel-blob.ts --dry-run
 */

// Load environment variables FIRST before any other imports
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';

// Dynamic import for @vercel/blob to handle monorepo structure
let put: (path: string, data: Buffer, options: { access: string; token: string }) => Promise<{ url: string }>;

try {
  // Try to require from root node_modules first
  const blobModule = require('@vercel/blob');
  put = blobModule.put;
} catch {
  try {
    // Try from apps/web/node_modules
    const blobPath = require.resolve('@vercel/blob', { paths: [join(__dirname, '../apps/web')] });
    const blobModule = require(blobPath);
    put = blobModule.put;
  } catch {
    console.error('❌ @vercel/blob not found!');
    console.error('\nPlease install it first:');
    console.error('  npm install @vercel/blob');
    console.error('  OR');
    console.error('  cd apps/web && npm install @vercel/blob\n');
    process.exit(1);
  }
}

// Environment variables already loaded at top

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');
const CATEGORIES_ONLY = process.argv.includes('--categories-only');
const PRODUCTS_ONLY = process.argv.includes('--products-only');

interface ImageInfo {
  path: string;
  size: number;
  relativePath: string;
  type: 'category' | 'product';
}

function checkBlobToken(): void {
  if (!BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment variables!');
    console.error('\nTo get your token:');
    console.error('1. Go to https://vercel.com/dashboard');
    console.error('2. Select your project');
    console.error('3. Go to Settings > Storage');
    console.error('4. Create a Blob store (if not exists)');
    console.error('5. Copy the BLOB_READ_WRITE_TOKEN');
    console.error('6. Add it to your .env file:\n');
    console.error('   BLOB_READ_WRITE_TOKEN=your_token_here\n');
    process.exit(1);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getAllImageFiles(dir: string, type: 'category' | 'product', fileList: ImageInfo[] = []): ImageInfo[] {
  if (!existsSync(dir)) {
    return fileList;
  }

  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(dir, file.name);

    if (file.isDirectory() && type === 'product') {
      // Recursively scan product subdirectories
      getAllImageFiles(filePath, type, fileList);
    } else if (/\.(jpg|jpeg|png)$/i.test(file.name)) {
      // Skip backup directories
      if (filePath.includes('/backup/')) {
        continue;
      }

      const size = statSync(filePath).size;
      if (size > 0) {
        fileList.push({
          path: filePath,
          size,
          relativePath: filePath.replace(join(process.cwd(), 'apps/web/public'), ''),
          type,
        });
      }
    }
  }

  return fileList;
}

const ALLOW_OVERWRITE = process.argv.includes('--allow-overwrite');

async function uploadImage(imageInfo: ImageInfo): Promise<string | null> {
  try {
    const fileBuffer = readFileSync(imageInfo.path);
    const filename = basename(imageInfo.path);
    
    // Create a path in blob storage
    // Format: images/{type}/{filename}
    const blobPath = `images/${imageInfo.type}/${filename}`;

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would upload: ${imageInfo.relativePath} → ${blobPath}`);
      return `https://your-blob-store.public.blob.vercel-storage.com/${blobPath}`;
    }

    const blob = await put(blobPath, fileBuffer, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN!,
      // Allow replacing existing blobs when rerunning uploads
      allowOverwrite: ALLOW_OVERWRITE,
    });

    return blob.url;
  } catch (error) {
    console.error(`  ❌ Failed to upload ${imageInfo.relativePath}:`, error);
    return null;
  }
}

async function updateCategoryImage(categoryName: string, blobUrl: string, prisma: any): Promise<void> {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would update category "${categoryName}" with ${blobUrl}`);
    return;
  }

  try {
    await prisma.category.updateMany({
      where: { name: categoryName },
      data: { image: blobUrl },
    });
  } catch (error) {
    console.error(`  ❌ Failed to update category "${categoryName}":`, error);
  }
}

async function updateProductImages(productSlug: string, imageUrl: string, images: string[], prisma: any): Promise<void> {
  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would update product "${productSlug}" with new image URLs`);
    return;
  }

  try {
    await prisma.product.updateMany({
      where: { slug: productSlug },
      data: {
        imageUrl,
        images: images.length > 0 ? images : null, // Set to null if empty array
      },
    });
  } catch (error) {
    console.error(`  ❌ Failed to update product "${productSlug}":`, error);
  }
}

async function main() {
  console.log('☁️  Vercel Blob Storage Upload\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be uploaded\n');
  }

  checkBlobToken();

  // Import prisma only when needed (after env vars are loaded)
  // Skip in dry-run mode - we don't need database connection
  let prisma: any = null;
  if (!DRY_RUN) {
    // Check if DATABASE_URL is set before trying to import
    const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_URL_NON_POOLING || process.env.POSTGRES_URL_NON_POOLING;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not set in .env');
      console.error('   Required for updating database with blob URLs');
      console.error('   For dry-run mode, use --dry-run flag\n');
      process.exit(1);
    }
    
    try {
      const { prisma: prismaClient } = await import('@nursery/db');
      prisma = prismaClient;
    } catch (error: any) {
      console.error('❌ Failed to import Prisma:', error.message);
      process.exit(1);
    }
  } else {
    console.log('💡 Dry-run mode: Database updates will be skipped\n');
  }

  const categoriesDir = join(process.cwd(), 'apps/web/public/categories');
  const productsDir = join(process.cwd(), 'apps/web/public/products');

  // Get images to upload
  const imagesToUpload: ImageInfo[] = [];

  if (!PRODUCTS_ONLY) {
    console.log('📂 Scanning category images...');
    const categoryImages = getAllImageFiles(categoriesDir, 'category');
    imagesToUpload.push(...categoryImages);
    console.log(`  Found ${categoryImages.length} category images\n`);
  }

  if (!CATEGORIES_ONLY) {
    console.log('📂 Scanning product images...');
    const productImages = getAllImageFiles(productsDir, 'product');
    imagesToUpload.push(...productImages);
    console.log(`  Found ${productImages.length} product images\n`);
  }

  if (imagesToUpload.length === 0) {
    console.log('⚠️  No images found to upload');
    process.exit(0);
  }

  const totalSize = imagesToUpload.reduce((sum, img) => sum + img.size, 0);
  console.log(`📊 Total: ${imagesToUpload.length} images (${formatBytes(totalSize)})\n`);

  // Upload images
  console.log('☁️  Uploading to Vercel Blob Storage...\n');

  let uploaded = 0;
  let failed = 0;
  const categoryUrlMap = new Map<string, string>();
  const productUrlMap = new Map<string, { imageUrl: string; images: string[] }>();

  for (let i = 0; i < imagesToUpload.length; i++) {
    const img = imagesToUpload[i];
    const progress = `[${i + 1}/${imagesToUpload.length}]`;

    process.stdout.write(`\r${progress} Uploading ${basename(img.path)}...`);

    const blobUrl = await uploadImage(img);

    if (blobUrl) {
      uploaded++;

      if (img.type === 'category') {
        // Extract category name from filename
        const filename = basename(img.path, extname(img.path));
        const categoryName = filename.replace('-header', '').replace(/-/g, ' ');
        // Try to match with actual category names
        categoryUrlMap.set(img.relativePath, blobUrl);
      } else {
        // For products, store by filename (with extension) to match by existing imageUrl
        // Format: slug-hash.ext (e.g., "acer-palmatum-0ffbd9a2.jpg")
        const filename = basename(img.path); // Keep extension for matching
        if (!productUrlMap.has(filename)) {
          productUrlMap.set(filename, { imageUrl: '', images: [] });
        }
        const productData = productUrlMap.get(filename)!;
        // First image becomes the main imageUrl, rest go in images array
        if (productData.images.length === 0) {
          productData.imageUrl = blobUrl;
        }
        productData.images.push(blobUrl);
      }
    } else {
      failed++;
    }

    // Rate limiting - be nice to Vercel
    if ((i + 1) % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n\n📝 Updating database...\n');

  // Update categories - match by filename to category name
  if (categoryUrlMap.size > 0 && !PRODUCTS_ONLY) {
    console.log(`Updating ${categoryUrlMap.size} category image references...`);
    
    // Import category mapping
    const { categoryImageMap, categoryHeaderImageMap } = await import('../apps/web/lib/constants/categories');
    
    // Create reverse mapping: filename -> category name
    const filenameToCategory = new Map<string, string>();
    Object.entries(categoryImageMap).forEach(([categoryName, path]) => {
      const filename = basename(path);
      filenameToCategory.set(filename, categoryName);
    });
    Object.entries(categoryHeaderImageMap).forEach(([categoryName, path]) => {
      const filename = basename(path);
      filenameToCategory.set(filename, categoryName);
    });

    for (const [relativePath, blobUrl] of categoryUrlMap.entries()) {
      const filename = basename(relativePath);
      const categoryName = filenameToCategory.get(filename);
      
      if (categoryName) {
        if (prisma) {
          await updateCategoryImage(categoryName, blobUrl, prisma);
          console.log(`  ✅ Updated ${categoryName}: ${filename}`);
        } else {
          console.log(`  [DRY RUN] Would update ${categoryName}: ${filename}`);
        }
      } else {
        console.log(`  ⚠️  Could not match ${filename} to a category`);
      }
    }
  }

  // Update products - match by existing imageUrl paths
  if (productUrlMap.size > 0 && !CATEGORIES_ONLY) {
    console.log(`\nUpdating ${productUrlMap.size} product image references...\n`);
    let updated = 0;
    let notFound = 0;
    
    // Get all products to check for local image paths
    const allProducts = await prisma.product.findMany({
      select: { id: true, name: true, slug: true, imageUrl: true, images: true },
    });
    
    console.log(`  Checking ${allProducts.length} products for local image paths...\n`);
    
    // Create a map of filename -> product(s) for quick lookup
    const filenameToProducts = new Map<string, typeof allProducts>();
    
    for (const product of allProducts) {
      // Check imageUrl
      if (product.imageUrl && (product.imageUrl.startsWith('/products/') || product.imageUrl.includes('.jpg') || product.imageUrl.includes('.jpeg') || product.imageUrl.includes('.png'))) {
        const filename = basename(product.imageUrl);
        if (!filenameToProducts.has(filename)) {
          filenameToProducts.set(filename, []);
        }
        filenameToProducts.get(filename)!.push(product);
      }
      
      // Also check images array (JSON field)
      if (product.images) {
        const imagesArray = Array.isArray(product.images) ? product.images : [];
        for (const img of imagesArray) {
          if (typeof img === 'string' && (img.startsWith('/products/') || img.includes('.jpg') || img.includes('.jpeg') || img.includes('.png'))) {
            const filename = basename(img);
            if (!filenameToProducts.has(filename)) {
              filenameToProducts.set(filename, []);
            }
            // Only add if not already added from imageUrl
            if (!filenameToProducts.get(filename)!.some(p => p.id === product.id)) {
              filenameToProducts.get(filename)!.push(product);
            }
          }
        }
      }
    }
    
    console.log(`  Found ${filenameToProducts.size} unique filenames to match\n`);
    
    // Update products by matching filenames
    for (const [filename, imageData] of productUrlMap.entries()) {
      if (prisma) {
        const matchingProducts = filenameToProducts.get(filename) || [];
        
        if (matchingProducts.length > 0) {
          for (const product of matchingProducts) {
            await updateProductImages(product.slug, imageData.imageUrl, imageData.images, prisma);
            console.log(`  ✅ Updated ${product.name} (${product.slug}): ${imageData.images.length} image(s)`);
            updated++;
          }
        } else {
          // Try to extract slug from filename and match that way as fallback
          const match = filename.match(/^(.+?)-[a-f0-9]{8}\./i);
          if (match) {
            const slug = match[1];
            const product = await prisma.product.findFirst({
              where: { slug },
              select: { id: true, name: true, slug: true },
            });
            
            if (product) {
              await updateProductImages(product.slug, imageData.imageUrl, imageData.images, prisma);
              console.log(`  ✅ Updated ${product.name} (${product.slug}) by slug: ${imageData.images.length} image(s)`);
              updated++;
            } else {
              console.log(`  ⚠️  Product not found for filename: ${filename}`);
              notFound++;
            }
          } else {
            console.log(`  ⚠️  Could not parse filename: ${filename}`);
            notFound++;
          }
        }
      } else {
        console.log(`  [DRY RUN] Would update product with filename ${filename} (${imageData.images.length} image(s))`);
      }
    }
    
    if (updated > 0 || notFound > 0) {
      console.log(`\n  Summary: ${updated} updated, ${notFound} not found in database`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Upload Summary\n');
  console.log(`  Total images:     ${imagesToUpload.length}`);
  console.log(`  Uploaded:         ${uploaded}`);
  console.log(`  Failed:            ${failed}`);
  console.log(`  Category URLs:     ${categoryUrlMap.size}`);
  console.log(`  Product URLs:      ${productUrlMap.size}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    console.error(`\n⚠️  ${failed} images failed to upload`);
    process.exit(1);
  }

  console.log('\n✅ All images uploaded successfully!');
  console.log('\n💡 Next steps:');
  console.log('1. Update your components to use blob URLs');
  console.log('2. Add image directories to .gitignore');
  console.log('3. Remove local images (after verifying blob URLs work)');
}

if (require.main === module) {
  main()
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    })
    .finally(async () => {
      // Only disconnect if prisma was initialized
      try {
        const { prisma } = await import('@nursery/db');
        await prisma.$disconnect();
      } catch {
        // Prisma not initialized, skip disconnect
      }
    });
}

