import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    const where: any = {};
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null; // Top-level categories only
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

