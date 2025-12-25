# Vercel Blob Storage Setup

This guide explains how to set up Vercel Blob Storage for images, moving them out of git and serving them via Vercel's CDN.

## Benefits

- ✅ **Removes large files from git** - Solves push timeout issues
- ✅ **Global CDN delivery** - Fast image loading worldwide
- ✅ **Automatic optimization** - Vercel optimizes images automatically
- ✅ **Next.js integration** - Works seamlessly with Next.js Image component
- ✅ **Free tier** - 1GB storage, 100GB bandwidth/month

## Setup Steps

### 1. Install Vercel Blob Package

```bash
cd apps/web
npm install @vercel/blob
```

### 2. Create Blob Store in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Storage**
4. Click **Create Database** or **Add Storage**
5. Select **Blob**
6. Name it (e.g., "nursery-images")
7. Copy the `BLOB_READ_WRITE_TOKEN`

### 3. Add Environment Variable

Add to your `.env` file (root of project):

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

Also add it to Vercel project settings:
1. Go to **Settings** > **Environment Variables**
2. Add `BLOB_READ_WRITE_TOKEN` with your token
3. Apply to all environments (Production, Preview, Development)

### 4. Update Next.js Config

The `next.config.js` already has remote patterns configured. Vercel Blob URLs will work automatically with Next.js Image component.

### 5. Upload Existing Images

```bash
# Upload all images (categories + products)
npx tsx scripts/upload-images-to-vercel-blob.ts

# Upload only category images
npx tsx scripts/upload-images-to-vercel-blob.ts --categories-only

# Upload only product images
npx tsx scripts/upload-images-to-vercel-blob.ts --products-only

# Preview what would be uploaded (dry run)
npx tsx scripts/upload-images-to-vercel-blob.ts --dry-run
```

### 6. Update .gitignore

Add image directories to `.gitignore`:

```gitignore
# Vercel Blob - images stored in cloud
apps/web/public/categories/*.jpg
apps/web/public/categories/*.jpeg
apps/web/public/categories/*.png
apps/web/public/products/**/*.jpg
apps/web/public/products/**/*.jpeg
apps/web/public/products/**/*.png
```

### 7. Remove Images from Git (After Verification)

Once you've verified blob URLs work:

```bash
# Remove from git (keeps local files)
git rm --cached apps/web/public/categories/*.jpg
git rm --cached apps/web/public/products/**/*.jpg

# Commit the removal
git commit -m "Move images to Vercel Blob Storage"
```

## Usage in Components

### Category Images

Images will be stored in the database as blob URLs. Components will automatically use them:

```tsx
// CategoryGrid - already uses imageUrl from database
<Image src={category.image || imageUrl} ... />

// CategoryHero - already uses image prop
<Image src={image} ... />
```

### Product Images

Product images will be updated in the database. The existing components will work automatically:

```tsx
// ProductImageGallery - uses images array from product
<Image src={images[selectedImage]} ... />
```

## Blob URL Format

Vercel Blob URLs look like:
```
https://your-blob-store.public.blob.vercel-storage.com/images/category/roses.jpg
https://your-blob-store.public.blob.vercel-storage.com/images/product/slug-hash.jpg
```

## Migration Strategy

1. **Upload images** to Vercel Blob (script updates database)
2. **Verify** images load correctly on your site
3. **Add to .gitignore** to prevent future commits
4. **Remove from git** (but keep local backups)
5. **Push to GitHub** - much smaller repo size!

## Troubleshooting

### "BLOB_READ_WRITE_TOKEN not found"
- Make sure you've added the token to `.env`
- Check the token is correct in Vercel dashboard

### Images not loading
- Check blob URLs in database are correct
- Verify Next.js Image remote patterns include blob domain
- Check Vercel project has blob store created

### Upload fails
- Check your internet connection
- Verify blob store exists in Vercel
- Check token permissions (needs read/write)

## Cost Considerations

**Free Tier:**
- 1GB storage
- 100GB bandwidth/month
- Perfect for getting started

**Paid Plans:**
- $0.15/GB storage/month
- $0.40/GB bandwidth
- Very affordable for most use cases

## Next Steps

After migration:
1. Images are served from CDN (faster)
2. Git repo is much smaller (easier pushes)
3. Automatic image optimization via Vercel
4. Better performance globally

