import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Force server-side only
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { limit } = await request.json().catch(() => ({}));
    const maxProducts = limit ? parseInt(limit) : 100;

    console.log(`🔧 Starting image path fix (limit: ${maxProducts})...`);

    // Find the products directory - try multiple possible paths
    const possiblePaths = [
      join(process.cwd(), 'public', 'products'), // If cwd is apps/web
      join(process.cwd(), 'apps', 'web', 'public', 'products'), // If cwd is project root
      join(process.cwd(), '..', '..', 'apps', 'web', 'public', 'products'), // Fallback
    ];
    
    let publicDir: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        publicDir = path;
        break;
      }
    }
    
    if (!publicDir) {
      return NextResponse.json(
        { 
          error: 'Products directory not found',
          triedPaths: possiblePaths,
          currentWorkingDir: process.cwd(),
        },
        { status: 404 }
      );
    }

    // Get all image files
    const imageFiles = readdirSync(publicDir).filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );

    console.log(`Found ${imageFiles.length} image files in public/products`);

    // Create a map of slug -> image files
    const imageMap = new Map<string, string[]>();
    imageFiles.forEach(file => {
      // Extract slug from filename (format: slug-hash.ext)
      const match = file.match(/^(.+?)-[a-f0-9]{8}\.(jpg|jpeg|png|webp|gif)$/i);
      if (match) {
        const slug = match[1];
        if (!imageMap.has(slug)) {
          imageMap.set(slug, []);
        }
        imageMap.get(slug)!.push(`/products/${file}`);
      }
    });

    console.log(`Mapped ${imageMap.size} unique product slugs to images`);

    // Get products with Plantmark URLs OR products with local paths that might be broken
    const products = await prisma.product.findMany({
      where: {
        OR: [
          {
            imageUrl: {
              contains: 'plantmark.com.au',
            },
          },
          {
            imageUrl: {
              contains: 'www.plantmark.com.au',
            },
          },
          {
            // Also check products with local paths that might not exist
            imageUrl: {
              startsWith: '/products/',
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        images: true,
      },
      take: maxProducts,
    });

    console.log(`Found ${products.length} products with Plantmark URLs`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      const productImages = imageMap.get(product.slug) || [];
      
      // Check if current imageUrl exists
      const currentImageUrl = product.imageUrl;
      let needsUpdate = false;
      let hasValidImage = false;
      
      if (currentImageUrl && currentImageUrl.startsWith('/products/')) {
        // Check if file exists
        const filename = currentImageUrl.replace('/products/', '');
        const filePath = join(publicDir, filename);
        if (existsSync(filePath)) {
          hasValidImage = true;
        } else {
          needsUpdate = true;
        }
      } else if (currentImageUrl && currentImageUrl.includes('plantmark.com.au')) {
        // Has Plantmark URL, needs update
        needsUpdate = true;
      } else if (!currentImageUrl) {
        // No image URL, needs update
        needsUpdate = true;
      }

      if (!needsUpdate && hasValidImage) {
        skipped++;
        continue;
      }

      // If we have local images for this product, use them
      if (productImages.length > 0) {
        const newImageUrl = productImages[0];
        const newImages = productImages;

        await prisma.product.update({
          where: { id: product.id },
          data: {
            imageUrl: newImageUrl,
            images: newImages,
          },
        });

        updated++;
      } else {
        // No local images found - set to null so placeholder is used
        await prisma.product.update({
          where: { id: product.id },
          data: {
            imageUrl: null,
            images: [],
          },
        });

        updated++;
      }
    }

    // Get final stats
    const totalWithPlantmark = await prisma.product.count({
      where: {
        OR: [
          {
            imageUrl: {
              contains: 'plantmark.com.au',
            },
          },
          {
            imageUrl: {
              contains: 'www.plantmark.com.au',
            },
          },
        ],
      },
    });

    const totalWithLocal = await prisma.product.count({
      where: {
        imageUrl: {
          startsWith: '/products/',
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Image paths fixed',
      stats: {
        productsProcessed: products.length,
        updated,
        skipped,
        totalImageFiles: imageFiles.length,
        totalWithPlantmark,
        totalWithLocal,
      },
    });
  } catch (error) {
    console.error('Error fixing image paths:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

