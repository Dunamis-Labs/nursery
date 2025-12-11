import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { prisma, Prisma } from '@nursery/db';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  productType: z.enum(['DIGITAL', 'DROPSHIPPED', 'PHYSICAL', 'BUNDLE']),
  price: z.number().positive(),
  availability: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER', 'DISCONTINUED']).default('IN_STOCK'),
  categoryId: z.string().uuid(),
  source: z.enum(['SCRAPED', 'MANUAL', 'API']).default('MANUAL'),
  sourceId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  botanicalName: z.string().optional(),
  commonName: z.string().optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

async function handler(request: NextRequest) {
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const validatedData = createProductSchema.parse(body);

      // Convert metadata to Prisma's InputJsonValue type and handle category relation
      const { categoryId, metadata, images, ...restData } = validatedData;
      
      const productData: Prisma.ProductUncheckedCreateInput = {
        ...restData,
        categoryId,
        metadata: metadata
          ? (metadata as Prisma.InputJsonValue)
          : undefined,
        images: images
          ? (images as Prisma.InputJsonValue)
          : undefined,
      };

      const product = await prisma.product.create({
        data: productData,
        include: {
          category: true,
        },
      });

      return NextResponse.json(product, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Error creating product:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const POST = withAuth(handler);

