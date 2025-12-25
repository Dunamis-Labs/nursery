import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@nursery/db';
import { MAIN_CATEGORIES } from '@/lib/constants/categories';

export async function GET(request: NextRequest) {
  try {
    // Only return the 15 main categories - no subcategories
    const categories = await prisma.category.findMany({
      where: {
        name: { in: MAIN_CATEGORIES },
        parentId: null, // Only top-level categories
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Deduplicate by name (keep first occurrence)
    const seen = new Set<string>();
    const uniqueCategories = categories.filter(cat => {
      if (seen.has(cat.name)) {
        return false;
      }
      seen.add(cat.name);
      return true;
    });

    return NextResponse.json(uniqueCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

