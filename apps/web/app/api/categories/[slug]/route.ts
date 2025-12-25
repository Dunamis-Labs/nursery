import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';
import { MAIN_CATEGORIES } from '@/lib/constants/categories';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        parentId: true,
        content: true,
        products: {
          take: 20,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            availability: true,
            imageUrl: true,
            images: true,
            botanicalName: true,
            commonName: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // BLOCK SUBCATEGORIES: Only return main categories
    if (category.parentId !== null) {
      return NextResponse.json(
        { error: 'Subcategories are not supported' },
        { status: 404 }
      );
    }

    // BLOCK NON-MAIN CATEGORIES: Only allow the 15 main categories
    if (!MAIN_CATEGORIES.includes(category.name as any)) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

