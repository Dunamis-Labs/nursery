import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] });
    }

    const searchQuery = query.trim();

    // PostgreSQL full-text search
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { botanicalName: { contains: searchQuery, mode: 'insensitive' } },
          { commonName: { contains: searchQuery, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      products,
      query: searchQuery,
      count: products.length,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

