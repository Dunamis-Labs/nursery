import { prisma } from '@nursery/db';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { HeroSection } from '@/components/layout/hero-section';
import { CategoryGrid } from '@/components/category/category-grid';
import { FeaturedProducts } from '@/components/product/featured-products';
import { Footer } from '@/components/layout/footer';
import { MAIN_CATEGORIES } from '@/lib/constants/categories';

// Import other components if they exist, or create placeholder versions
// import { ShopByPurpose } from '@/components/shop-by-purpose';
// import { LatestGuides } from '@/components/latest-guides';

export default async function HomePage() {
  // Fetch only the 15 main categories
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
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Fetch featured products (in stock, recently added)
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
  const featuredProducts = featuredProductsRaw.map(product => ({
    ...product,
    price: product.price ? Number(product.price) : null,
  }));

  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <main>
        <HeroSection />
        <CategoryGrid categories={categories} />
        {/* <ShopByPurpose /> */}
        <FeaturedProducts products={featuredProducts} />
        {/* <LatestGuides /> */}
      </main>
      <Footer />
    </div>
  );
}
