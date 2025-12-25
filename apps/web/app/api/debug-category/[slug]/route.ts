import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: slugParam } = await params;
    const slug = slugParam.toLowerCase().trim();
    
    // Find category
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Count products
    const count = await prisma.product.count({
      where: { categoryId: category.id },
    });

    // Get first 5 products to verify
    const sampleProducts = await prisma.product.findMany({
      where: { categoryId: category.id },
      take: 5,
      select: {
        id: true,
        name: true,
        categoryId: true,
      },
    });

    // Check if ALL products have this categoryId
    const totalProducts = await prisma.product.count();
    const allHaveThisCategory = count === totalProducts;

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      productCount: count,
      totalProducts,
      allProductsHaveThisCategory: allHaveThisCategory,
      sampleProducts: sampleProducts.map(p => ({
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        matches: p.categoryId === category.id,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

