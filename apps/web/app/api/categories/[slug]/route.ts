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
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Fetch products using many-to-many relationship
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { categoryId: category.id }, // Backwards compatibility
          { categories: { some: { categoryId: category.id } } }, // Many-to-many relationship
        ],
      },
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
    });

    const productCount = await prisma.product.count({
      where: {
        OR: [
          { categoryId: category.id },
          { categories: { some: { categoryId: category.id } } },
        ],
      },
    });

    const categoryWithProducts = {
      ...category,
      products,
      _count: {
        products: productCount,
      },
    };

    // BLOCK SUBCATEGORIES: Only return main categories
    if (categoryWithProducts.parentId !== null) {
      return NextResponse.json(
        { error: 'Subcategories are not supported' },
        { status: 404 }
      );
    }

    // BLOCK NON-MAIN CATEGORIES: Only allow the 15 main categories
    if (!MAIN_CATEGORIES.includes(categoryWithProducts.name as any)) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(categoryWithProducts);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

