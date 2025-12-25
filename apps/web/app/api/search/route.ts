import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

interface ProductWithRank {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  availability: string;
  imageUrl: string | null;
  images: unknown; // JSON array
  botanicalName: string | null;
  commonName: string | null;
  categoryId: string;
  rank: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [], query: '', count: 0 });
    }

    const searchQuery = query.trim();

    // Use PostgreSQL full-text search with ranking
    // This uses the searchVector column and ts_rank for relevance scoring
    const products = await prisma.$queryRaw<ProductWithRank[]>`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.availability,
        p."imageUrl",
        p.images,
        p."botanicalName",
        p."commonName",
        p."categoryId",
        ts_rank(p."searchVector", plainto_tsquery('english', ${searchQuery})) as rank
      FROM "Product" p
      WHERE p."searchVector" @@ plainto_tsquery('english', ${searchQuery})
      ORDER BY rank DESC, p.name ASC
      LIMIT ${limit}
    `;

    // Fetch category information for each product
    const productsWithCategories = await Promise.all(
      products.map(async (product) => {
        const category = await prisma.category.findUnique({
          where: { id: product.categoryId },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        });

        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          availability: product.availability,
          imageUrl: product.imageUrl,
          images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
          botanicalName: product.botanicalName,
          commonName: product.commonName,
          category: category || null,
        };
      })
    );

    return NextResponse.json({
      products: productsWithCategories,
      query: searchQuery,
      count: productsWithCategories.length,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    
    // Fallback to simple search if full-text search fails (e.g., searchVector not set up yet)
    try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get('q');
      const limit = parseInt(searchParams.get('limit') || '20');

      if (!query || query.trim().length === 0) {
        return NextResponse.json({ products: [], query: '', count: 0 });
      }

      const searchQuery = query.trim();

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
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      return NextResponse.json({
        products,
        query: searchQuery,
        count: products.length,
        fallback: true, // Indicate this is a fallback search
      });
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      return NextResponse.json(
        { error: 'Internal server error', products: [], query: '', count: 0 },
        { status: 500 }
      );
    }
  }
}
