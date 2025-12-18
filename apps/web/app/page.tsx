import { prisma } from '@nursery/db';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { HeroSection } from '@/components/layout/hero-section';
import { CategoryGrid } from '@/components/category/category-grid';
import { FeaturedProducts } from '@/components/product/featured-products';
import { Footer } from '@/components/layout/footer';

// Import other components if they exist, or create placeholder versions
// import { ShopByPurpose } from '@/components/shop-by-purpose';
// import { LatestGuides } from '@/components/latest-guides';

export default async function HomePage() {
  // Fetch categories with product counts (exclude Uncategorized)
  const categories = await prisma.category.findMany({
    where: {
      name: { not: 'Uncategorized' },
    },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: {
      name: 'asc',
    },
    take: 8,
  });

  // Fetch featured products (in stock, recently added)
  const featuredProducts = await prisma.product.findMany({
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
