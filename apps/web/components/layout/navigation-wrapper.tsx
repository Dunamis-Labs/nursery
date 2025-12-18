import { prisma } from '@nursery/db';
import { Navigation } from './navigation';

/**
 * Server component wrapper that fetches categories and passes them to Navigation
 */
export async function NavigationWrapper() {
  const categories = await prisma.category.findMany({
    where: {
      name: { not: 'Uncategorized' },
    },
    orderBy: {
      name: 'asc',
    },
    take: 10,
  });

  return <Navigation categories={categories} />;
}

