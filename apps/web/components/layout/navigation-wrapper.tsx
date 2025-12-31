import { Navigation } from './navigation';
import { MAIN_CATEGORIES } from '@/lib/constants/categories';

/**
 * Server component wrapper that fetches categories and passes them to Navigation
 */
export async function NavigationWrapper() {
  // Lazy import prisma to avoid module evaluation error if DATABASE_URL is missing
  let prisma: any;
  try {
    const dbModule = await import('@nursery/db');
    prisma = dbModule.prisma;
  } catch (error: any) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#2d5016]">The Plant Nursery</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  let categories: any[] = [];
  try {
    categories = await prisma.category.findMany({
      where: {
        name: { in: [...MAIN_CATEGORIES] }, // Convert readonly array to mutable
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
      // Force fresh fetch (no cache)
      cache: false,
    });
  } catch (dbError: any) {
    // Return empty navigation if database fails
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#2d5016]">The Plant Nursery</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Deduplicate by name (keep first occurrence)
  const seen = new Set<string>();
  const uniqueCategories = categories.filter(cat => {
    if (seen.has(cat.name)) {
      return false;
    }
    seen.add(cat.name);
    return true;
  });

  try {
    return <Navigation categories={uniqueCategories} />;
  } catch (error: any) {
    // Return fallback navigation instead of throwing
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-[#2d5016]">The Plant Nursery</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

