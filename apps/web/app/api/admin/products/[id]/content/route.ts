import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/middleware/auth';
import { prisma } from '@nursery/db';
import { z } from 'zod';

const contentSchema = z.object({
  detailedDescription: z.string().optional(),
  growingRequirements: z.string().optional(),
  careInstructions: z.string().optional(),
  uses: z.string().optional(),
  benefits: z.string().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function handlerWithParams(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params;
  
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const validatedContent = contentSchema.parse(body);

      // Find product by ID or slug
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      // Upsert product content
      const content = await prisma.productContent.upsert({
        where: { productId: product.id },
        update: {
          ...validatedContent,
          lastUpdatedAt: new Date(),
        },
        create: {
          productId: product.id,
          ...validatedContent,
          lastUpdatedAt: new Date(),
        },
      });

      return NextResponse.json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Error updating product content:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  if (request.method === 'GET') {
    try {
      const product = await prisma.product.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        include: {
          content: true,
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(product.content || {});
    } catch (error) {
      console.error('Error fetching product content:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey || !(await validateApiKey(apiKey))) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing API key' },
      { status: 401 }
    );
  }
  return handlerWithParams(request, { params });
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey || !(await validateApiKey(apiKey))) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing API key' },
      { status: 401 }
    );
  }
  return handlerWithParams(request, { params });
}

