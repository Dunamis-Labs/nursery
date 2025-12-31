# Scripts Directory

This directory contains utility scripts for managing the Nursery application, including data import, verification, category management, image processing, and more.

## Table of Contents

- [Data Import & Verification](#data-import--verification)
- [Category Management](#category-management)
- [Image Management](#image-management)
- [Data Enrichment](#data-enrichment)
- [Testing & Inspection](#testing--inspection)
- [Database Migrations](#database-migrations)
- [Utility Scripts](#utility-scripts)

---

## Data Import & Verification

### `comprehensive-plantmark-verification.ts` ⭐ **RECOMMENDED**

**The main script for ensuring complete and accurate Plantmark data.**

Performs a complete verification and fix of all Plantmark data with support for VPN workarounds.

**Usage:**
```bash
# Full verification (requires database connection)
npm run verify:plantmark

# Two-phase mode for VPN users:
# Phase 1: Scrape with VPN (saves to files)
npm run verify:plantmark -- --scrape-only

# Phase 2: Import without VPN (reads from files)
npm run verify:plantmark -- --import-only
```

**What it does:**
1. **Product Completeness**: Scrapes all products from Plantmark and compares with database to find missing products
2. **Category Mapping**: Verifies and fixes category assignments (PRIMARY CATEGORIES ONLY - no sub-categories)
3. **Content Completeness**: Checks and updates ProductContent fields (detailedDescription, careInstructions, etc.)
4. **Image Completeness**: Verifies and downloads all product images (main + additional)

**Environment Variables:**
- `TEST_MODE=true` - Process only first 10 products for testing
- `SKIP_PRODUCT_CHECK=true` - Skip product completeness check
- `SKIP_CATEGORY_CHECK=true` - Skip category verification
- `SKIP_CONTENT_CHECK=true` - Skip content completeness check
- `SKIP_IMAGE_CHECK=true` - Skip image verification
- `PLANTMARK_EMAIL` - Plantmark account email (for logged-in scraping)
- `PLANTMARK_PASSWORD` - Plantmark account password
- `PLANTMARK_RATE_LIMIT_MS` - Rate limit between requests (default: 2000ms)

**Examples:**
```bash
# Full verification
npm run verify:plantmark

# Test mode (first 10 products only)
TEST_MODE=true npm run verify:plantmark

# Only check categories and images
SKIP_PRODUCT_CHECK=true SKIP_CONTENT_CHECK=true npm run verify:plantmark

# VPN workaround: scrape first, then import
npm run verify:plantmark -- --scrape-only  # With VPN
npm run verify:plantmark -- --import-only   # Without VPN
```

**Output:**
- Comprehensive summary report with statistics
- Scraped data saved to `.scraped-data/` directory (in scrape-only mode)
- All missing products, content, and images are automatically fixed

---

### `full-plantmark-import.ts`

Performs a full import of all Plantmark products into the database.

**Usage:**
```bash
npm run import:full
```

**What it does:**
- Scrapes all products from Plantmark
- Imports products into database
- Creates categories as needed
- Downloads product images

---

### `rescrape-all-plantmark-products.ts`

Re-scrapes all existing products from Plantmark to update their data.

**Usage:**
```bash
tsx scripts/rescrape-all-plantmark-products.ts
```

---

### `trigger-full-import.ts`

Triggers a full data import job.

**Usage:**
```bash
tsx scripts/trigger-full-import.ts
```

---

## Category Management

### `ensure-15-categories.ts`

Ensures the 15 primary Plantmark categories exist in the database.

**Usage:**
```bash
tsx scripts/ensure-15-categories.ts
```

**What it does:**
- Creates the 15 main categories if they don't exist
- Ensures they have `parentId: null` (primary categories only)

---

### `remove-subcategories-and-reassign-products.ts`

Removes all sub-categories and reassigns products to primary categories.

**Usage:**
```bash
tsx scripts/remove-subcategories-and-reassign-products.ts
```

**What it does:**
- Finds all sub-categories (categories with `parentId` not null)
- Reassigns products from sub-categories to their parent categories
- Deletes empty sub-categories

---

### `fix-categories.ts`

Fixes category assignments for products based on various heuristics.

**Usage:**
```bash
npm run fix:categories
```

**What it does:**
- Maps products to correct categories
- Uses URL patterns, product names, and other signals
- Ensures products are in primary categories only

---

### `fix-categories-from-url.ts`

Fixes category assignments by extracting category from product URLs.

**Usage:**
```bash
tsx scripts/fix-categories-from-url.ts
```

---

### `merge-duplicate-categories.ts`

Merges duplicate categories and reassigns products.

**Usage:**
```bash
tsx scripts/merge-duplicate-categories.ts
```

**What it does:**
- Finds duplicate categories (by normalized name)
- Merges them into a single category
- Reassigns all products to the merged category

---

### `cleanup-categories-simple.ts`

Simple cleanup script that keeps only the 15 main categories.

**Usage:**
```bash
tsx scripts/cleanup-categories-simple.ts
```

---

### `fix-orphaned-categories.ts`

Fixes categories that have invalid parent references.

**Usage:**
```bash
tsx scripts/fix-orphaned-categories.ts
```

---

### `re-scrape-categories.ts`

Re-scrapes category information from Plantmark.

**Usage:**
```bash
tsx scripts/re-scrape-categories.ts
```

---

### `full-category-scrape.ts`

Performs a full scrape of all categories from Plantmark.

**Usage:**
```bash
tsx scripts/full-category-scrape.ts
```

---

### `check-category-products.ts`

Checks which products are assigned to which categories.

**Usage:**
```bash
tsx scripts/check-category-products.ts
```

---

### `check-actual-category-assignments.ts`

Checks the actual category assignments in the database.

**Usage:**
```bash
tsx scripts/check-actual-category-assignments.ts
```

---

### `diagnose-category-products.ts`

Diagnoses issues with category-product relationships.

**Usage:**
```bash
tsx scripts/diagnose-category-products.ts
```

---

### `fix-product-categories-now.ts`

Fixes product category assignments immediately.

**Usage:**
```bash
tsx scripts/fix-product-categories-now.ts
```

---

## Image Management

### `download-product-images.ts`

Downloads all product images from Plantmark.

**Usage:**
```bash
npm run download:images
```

**What it does:**
- Downloads main product images
- Downloads additional product images
- Saves to local storage (`apps/web/public/products/`)

---

### `download-category-images.ts`

Downloads category images from Plantmark.

**Usage:**
```bash
tsx scripts/download-category-images.ts
```

---

### `optimize-product-images.ts`

Optimizes product images for web use.

**Usage:**
```bash
tsx scripts/optimize-product-images.ts
```

**See also:** `README-optimize-images.md`

---

### `optimize-category-images.ts`

Optimizes category images for web use.

**Usage:**
```bash
tsx scripts/optimize-category-images.ts
```

---

### `fix-category-images.ts`

Fixes category image paths and downloads missing images.

**Usage:**
```bash
tsx scripts/fix-category-images.ts
```

---

### `upload-images-to-vercel-blob.ts`

Uploads images to Vercel Blob storage.

**Usage:**
```bash
tsx scripts/upload-images-to-vercel-blob.ts
```

**See also:** `README-vercel-blob.md`

---

### `add-category-image-column.ts`

Adds image column to categories table (migration script).

**Usage:**
```bash
tsx scripts/add-category-image-column.ts
```

---

## Data Enrichment

### `enrich-products-with-claude.ts`

Enriches product data using Claude AI.

**Usage:**
```bash
tsx scripts/enrich-products-with-claude.ts
```

**What it does:**
- Generates detailed descriptions
- Creates care instructions
- Adds SEO-friendly content

---

### `enrich-products-with-openai.ts`

Enriches product data using OpenAI.

**Usage:**
```bash
tsx scripts/enrich-products-with-openai.ts
```

---

### `enrich-products-wrapper.ts`

Wrapper script for product enrichment with multiple providers.

**Usage:**
```bash
tsx scripts/enrich-products-wrapper.ts
```

---

### `enrich-categories-with-claude.ts`

Enriches category data using Claude AI.

**Usage:**
```bash
tsx scripts/enrich-categories-with-claude.ts
```

**What it does:**
- Generates category descriptions
- Creates marketing copy
- Adds SEO content

**See also:** `README-enrich-products.md`

---

## Testing & Inspection

### `discover-plantmark-api.ts`

Discovers Plantmark API endpoints by monitoring network requests.

**Usage:**
```bash
npm run discover:plantmark
```

**What it does:**
- Opens plantmark.com.au in a headless browser
- Monitors all network requests (XHR, Fetch, etc.)
- Identifies API endpoints that return JSON
- Saves discovered endpoints to `scripts/plantmark-endpoints.json`
- Generates code suggestions for `PlantmarkApiClient`

**Note:** Requires an Australian IP address (use VPN if outside Australia)

---

### `inspect-plantmark-page.ts`

Inspects a Plantmark page to understand its structure.

**Usage:**
```bash
npm run inspect:plantmark
```

---

### `test-plantmark-scraper.ts`

Tests the Plantmark scraper functionality.

**Usage:**
```bash
npm run test:scraper
```

---

### `inspect-product-detail.ts`

Inspects a specific product detail page.

**Usage:**
```bash
tsx scripts/inspect-product-detail.ts
```

---

### `show-product-example.ts`

Shows an example product from the database.

**Usage:**
```bash
tsx scripts/show-product-example.ts
```

---

### `test-category-extraction.ts`

Tests category extraction logic.

**Usage:**
```bash
tsx scripts/test-category-extraction.ts
```

---

### `test-category-query.ts`

Tests category database queries.

**Usage:**
```bash
tsx scripts/test-category-query.ts
```

---

### `check-urls.ts`

Checks product URLs for validity.

**Usage:**
```bash
tsx scripts/check-urls.ts
```

---

## Database Migrations

### `apply-enrichment-migration.ts`

Applies database migration for product enrichment fields.

**Usage:**
```bash
tsx scripts/apply-enrichment-migration.ts
```

---

### `apply-fulltext-search-migration.ts`

Applies database migration for full-text search functionality.

**Usage:**
```bash
tsx scripts/apply-fulltext-search-migration.ts
```

---

### `test-migration.ts`

Tests database migrations.

**Usage:**
```bash
tsx scripts/test-migration.ts
```

---

## Utility Scripts

### Shell Scripts

Various shell scripts for specific tasks:

- `download-correct-roses.sh` - Downloads correct Rose images
- `download-roses-images.sh` - Downloads Rose images
- `download-roses-tile.sh` - Downloads Rose tile images
- `fix-category-images-verified.sh` - Fixes verified category images
- `fix-roses-image.sh` - Fixes Rose images
- `fix-roses-tile.js` - Fixes Rose tile images
- `fix-three-category-images.sh` - Fixes three specific category images
- `get-roses-from-unsplash.sh` - Gets Rose images from Unsplash
- `update-category-images.sh` - Updates category images
- `verify-category-images.sh` - Verifies category images
- `install-v0-dependencies.sh` - Installs v0 dependencies
- `integrate-v0-codebase.sh` - Integrates v0 codebase
- `integrate-v0-specific.sh` - Integrates specific v0 components
- `setup-v0-integration.sh` - Sets up v0 integration

---

## Common Environment Variables

Most scripts use these environment variables:

```bash
# Database
DATABASE_URL                    # Main database connection (pooler)
DATABASE_URL_NON_POOLING        # Direct database connection (recommended for scripts)
POSTGRES_URL                    # Alternative database connection
POSTGRES_PRISMA_URL            # Prisma Data Platform connection

# Plantmark
PLANTMARK_BASE_URL              # Base URL (default: https://www.plantmark.com.au)
PLANTMARK_EMAIL                 # Account email for logged-in scraping
PLANTMARK_PASSWORD              # Account password
PLANTMARK_RATE_LIMIT_MS         # Rate limit between requests (default: 2000ms)
PLANTMARK_USE_PROXY             # Use proxy (true/false)
PLANTMARK_PROXY_URL             # Proxy URL if using proxy

# AI Enrichment
ANTHROPIC_API_KEY               # Claude API key
OPENAI_API_KEY                  # OpenAI API key

# Vercel Blob
BLOB_READ_WRITE_TOKEN           # Vercel Blob token
```

---

## VPN Workaround

If you're outside Australia and need to access Plantmark, use the two-phase mode:

```bash
# Phase 1: With VPN active
npm run verify:plantmark -- --scrape-only

# Phase 2: Disable VPN
npm run verify:plantmark -- --import-only
```

The script will save scraped data to `.scraped-data/` directory in phase 1, then load it in phase 2.

---

## Notes

- Most scripts require database access - ensure your `.env` file is configured correctly
- Scripts that scrape Plantmark require an Australian IP address (use VPN if needed)
- Always test scripts with `TEST_MODE=true` first before running on full dataset
- Check `docs/DEV_NOTES.md` for common pitfalls and troubleshooting tips

---

## Related Documentation

- `README-enrich-products.md` - Product enrichment guide
- `README-optimize-images.md` - Image optimization guide
- `README-vercel-blob.md` - Vercel Blob storage guide
- `docs/DEV_NOTES.md` - Development notes and common issues
