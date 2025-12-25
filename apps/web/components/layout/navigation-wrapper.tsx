import { prisma } from '@nursery/db';
import { Navigation } from './navigation';
import { MAIN_CATEGORIES } from '@/lib/constants/categories';

/**
 * Server component wrapper that fetches categories and passes them to Navigation
 */
export async function NavigationWrapper() {
  const categories = await prisma.category.findMany({
    where: {
      name: { in: MAIN_CATEGORIES },
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

  return <Navigation categories={uniqueCategories} />;
}

