import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

export async function GET(request: NextRequest) {
  try {
    // Get sample products with their metadata
    const products = await prisma.product.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        sourceUrl: true,
        metadata: true,
        categoryId: true,
      },
    });

    // Get category names
    const categoryIds = [...new Set(products.map(p => p.categoryId).filter(Boolean))];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    return NextResponse.json({
      sampleProducts: products.map(p => ({
        name: p.name,
        sourceUrl: p.sourceUrl,
        currentCategory: categoryMap.get(p.categoryId) || 'None',
        metadata: p.metadata,
        metadataKeys: p.metadata && typeof p.metadata === 'object' ? Object.keys(p.metadata as object) : [],
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

