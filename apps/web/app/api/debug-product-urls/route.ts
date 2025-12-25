import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

export async function GET(request: NextRequest) {
  try {
    // Get sample products with their sourceUrls
    const products = await prisma.product.findMany({
      where: { sourceUrl: { not: null } },
      take: 20,
      select: {
        id: true,
        name: true,
        sourceUrl: true,
        categoryId: true,
      },
    });

    // Get category names for the categoryIds
    const categoryIds = [...new Set(products.map(p => p.categoryId).filter(Boolean))];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    return NextResponse.json({
      totalProductsWithUrl: await prisma.product.count({ where: { sourceUrl: { not: null } } }),
      sampleProducts: products.map(p => ({
        name: p.name,
        sourceUrl: p.sourceUrl,
        currentCategory: categoryMap.get(p.categoryId) || 'None',
        categoryId: p.categoryId,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

