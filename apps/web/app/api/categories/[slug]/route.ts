import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        parent: true,
        children: true,
        content: true,
        products: {
          take: 20,
          include: {
            category: true,
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

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

