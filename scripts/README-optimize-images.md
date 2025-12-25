# Image Optimization Scripts

These scripts optimize images for web use, reducing file sizes while maintaining quality.

## Scripts

1. **`optimize-category-images.ts`** - Optimizes category images (17 images)
2. **`optimize-product-images.ts`** - Optimizes product images (1000+ images)

## Prerequisites

Install ImageMagick (required for image processing):

```bash
brew install imagemagick
```

## Quick Start

Optimize all images:

```bash
# Optimize category images (fast, ~17 images)
npx tsx scripts/optimize-category-images.ts

# Optimize product images (slower, ~1000+ images)
npx tsx scripts/optimize-product-images.ts
```

## Category Image Optimization

## Prerequisites

Install ImageMagick (required for image processing):

```bash
brew install imagemagick
```

## Usage

Run the optimization script:

```bash
npx tsx scripts/optimize-category-images.ts
```

## What It Does

1. **Finds all images** in `apps/web/public/categories/`
2. **Creates backups** in `apps/web/public/categories/backup/`
3. **Optimizes images** with these settings:
   - **Hero images** (with `-header` in filename): Max width 1920px
   - **Tile images**: Max width 800px
   - **Quality**: 85% (good balance of quality and file size)
   - **Progressive JPEG**: Enabled for faster perceived loading
   - **Metadata stripped**: Removes EXIF data to reduce file size

4. **Shows summary** with before/after file sizes and savings

## Image Sizes

- **Tile images** (homepage category grid): Optimized to max 800px width
- **Header images** (category page hero): Optimized to max 1920px width

## Next.js Image Optimization

The components now use Next.js `Image` component with:

- **CategoryGrid**: Responsive sizes `(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw`
- **CategoryHero**: Full width `100vw` with `priority` loading

Next.js will automatically:
- Generate multiple sizes (srcset)
- Serve WebP/AVIF when supported
- Lazy load images (except priority images)
- Optimize on-the-fly

## Restoring Backups

If you need to restore original images:

```bash
cp apps/web/public/categories/backup/*.jpg apps/web/public/categories/
```

## Expected Results

Typical file size reductions:
- **Large images** (2-5MB): 60-80% reduction
- **Medium images** (500KB-2MB): 40-60% reduction
- **Small images** (<500KB): 20-40% reduction

Total savings usually range from 50-70% of original size.

---

## Product Image Optimization

Optimizes all product images in `apps/web/public/products/` (recursively processes all subdirectories).

### Usage

```bash
# Optimize all product images
npx tsx scripts/optimize-product-images.ts

# Preview what would be optimized (dry run)
npx tsx scripts/optimize-product-images.ts --dry-run

# Process only first 100 images (for testing)
npx tsx scripts/optimize-product-images.ts --limit=100
```

### What It Does

1. **Recursively scans** `apps/web/public/products/` for all images
2. **Creates backups** maintaining directory structure in `apps/web/public/products/backup/`
3. **Optimizes images** with these settings:
   - **Max width**: 1200px (maintains aspect ratio)
   - **Quality**: 85% JPEG
   - **Progressive JPEG**: Enabled
   - **Auto-orient**: Fixes EXIF orientation
   - **Metadata stripped**: Removes EXIF data

4. **Shows progress** every 50 images
5. **Skips already optimized** images (if backup exists and file is smaller)

### Performance

- **Processing time**: ~1-2 seconds per image
- **1000 images**: ~15-30 minutes
- **Progress updates**: Every 50 images

### Options

- `--dry-run`: Preview mode, shows what would be optimized without making changes
- `--limit=N`: Process only the first N largest images (useful for testing)

### Expected Results

Typical file size reductions:
- **Large images** (>1MB): 60-80% reduction
- **Medium images** (500KB-1MB): 40-60% reduction  
- **Small images** (<500KB): 20-40% reduction

Total savings usually range from 40-60% of original size for product images.

### Restoring Backups

If you need to restore original images:

```bash
# Restore all backups
cp -r apps/web/public/products/backup/* apps/web/public/products/
```

---

## Running Both Scripts

To optimize all images:

```bash
# 1. Optimize category images (fast)
npx tsx scripts/optimize-category-images.ts

# 2. Optimize product images (takes longer)
npx tsx scripts/optimize-product-images.ts
```

Or test with a small batch first:

```bash
# Test with first 50 product images
npx tsx scripts/optimize-product-images.ts --limit=50
```

