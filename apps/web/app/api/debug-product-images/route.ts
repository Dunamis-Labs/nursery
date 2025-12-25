import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get sample products with their images
    const products = await prisma.product.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        images: true,
      },
    });

    // Fix path - process.cwd() is already at root, so we need to go to apps/web/public/products
    const publicDir = join(process.cwd(), 'apps', 'web', 'public', 'products');

    const results = products.map(product => {
      const images = (product.images as string[]) || [];
      const imageUrl = product.imageUrl;
      
      // Check if main image exists
      let mainImageExists = false;
      let mainImagePath = null;
      if (imageUrl && !imageUrl.includes('plantmark.com.au') && imageUrl.startsWith('/products/')) {
        const filename = imageUrl.replace('/products/', '');
        mainImagePath = join(publicDir, filename);
        mainImageExists = existsSync(mainImagePath);
      }
      
      // Check if additional images exist
      const localImages = images.filter(img => img && !img.includes('plantmark.com.au'));
      const imageChecks = localImages.map(img => {
        if (img.startsWith('/products/')) {
          const filename = img.replace('/products/', '');
          const fullPath = join(publicDir, filename);
          return {
            path: img,
            exists: existsSync(fullPath),
          };
        }
        return {
          path: img,
          exists: false,
        };
      });

      return {
        name: product.name,
        slug: product.slug,
        imageUrl,
        mainImageExists,
        mainImagePath: imageUrl && !imageUrl.includes('plantmark.com.au') ? imageUrl : null,
        images: images.length,
        localImages: localImages.length,
        imageChecks,
      };
    });

    return NextResponse.json({
      publicDir,
      publicDirExists: existsSync(publicDir),
      products: results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

