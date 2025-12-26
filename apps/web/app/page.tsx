import { prisma } from '@nursery/db';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { HeroSection } from '@/components/layout/hero-section';
import { CategoryGrid } from '@/components/category/category-grid';
import { FeaturedProducts } from '@/components/product/featured-products';
import { Footer } from '@/components/layout/footer';
import { MAIN_CATEGORIES } from '@/lib/constants/categories';

export default async function HomePage() {
  // Fetch only the 15 main categories
  let categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    _count: { products: number };
  }> = [];
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
        image: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Continue with empty array if database fails
    categories = [];
  }

  // Fetch featured products (in stock, recently added)
  let featuredProducts: Array<any> = [];
  try {
    const featuredProductsRaw = await prisma.product.findMany({
      take: 8,
      where: {
        availability: 'IN_STOCK',
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert Decimal to number for client components
    featuredProducts = featuredProductsRaw.map(product => ({
      ...product,
      price: product.price ? Number(product.price) : null,
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    // Continue with empty array if database fails
    featuredProducts = [];
  }

  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <main>
        <HeroSection />
        <CategoryGrid categories={categories as any} />
        <FeaturedProducts products={featuredProducts as any} />
      </main>
      <Footer />
    </div>
  );
}
