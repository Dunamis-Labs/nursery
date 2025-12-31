import { notFound } from 'next/navigation';
import { prisma } from '@nursery/db';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { Footer } from '@/components/layout/footer';
import { CategoryHero } from '@/components/category/category-hero';
import { CategoryContent } from '@/components/category/category-content';
import { MAIN_CATEGORIES, categoryImageMap, categoryHeaderImageMap } from '@/lib/constants/categories';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Don't cache
export const fetchCache = 'force-no-store'; // Force fresh fetch

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug: slugParam } = await params;
  const requestedSlug = slugParam.toLowerCase().trim();
  
  // Map slug to category name (simple lookup)
  const slugToName: Record<string, string> = {
    'grasses': 'Grasses',
    'hedging-and-screening': 'Hedging and Screening',
    'palms,-ferns-and-tropical': 'Palms, Ferns & Tropical',
    'trees': 'Trees',
    'shrubs': 'Shrubs',
    'groundcovers': 'Groundcovers',
    'climbers': 'Climbers',
    'conifers': 'Conifers',
    'roses': 'Roses',
    'succulents-and-cacti': 'Succulents & Cacti',
    'citrus-and-fruit': 'Citrus & Fruit',
    'herbs-and-vegetables': 'Herbs & Vegetables',
    'water-plants': 'Water Plants',
    'indoor-plants': 'Indoor Plants',
    'garden-products': 'Garden Products',
  };
  
  const categoryName = slugToName[requestedSlug];
  if (!categoryName) {
    notFound();
  }
  
  // Find category by name
  const category = await prisma.category.findFirst({
    where: {
      name: categoryName,
      parentId: null,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });

  if (!category) {
    notFound();
  }

  // Use header image if available, otherwise fall back to tile image
  const categoryImage = categoryHeaderImageMap[category.name] || categoryImageMap[category.name] || '/placeholder.svg';

  // Fetch products for this category with specifications and metadata
  // Use many-to-many relationship (categories) - products can appear in multiple categories
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { categoryId: category.id }, // Backwards compatibility
        { categories: { some: { categoryId: category.id } } }, // Many-to-many relationship
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      availability: true,
      imageUrl: true,
      images: true,
      botanicalName: true,
      commonName: true,
      createdAt: true,
      metadata: true,
      specification: {
        select: {
          lightRequirements: true,
          humidity: true,
          growthRate: true,
          toxicity: true,
          watering: true,
          temperature: true,
          difficulty: true,
          origin: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate dynamic price range for this category
  const prices = products
    .map(p => p.price ? Number(p.price) : null)
    .filter((p): p is number => p !== null);
  
  const maxPrice = prices.length > 0 
    ? Math.ceil(Math.max(...prices) / 10) * 10 // Round up to nearest 10
    : 200; // Default fallback
  const minPrice = 0;

  // Convert Decimal to number and Date to ISO string for client components
  // Date objects can't be serialized from server to client
  // Also ensure images is always an array
  const finalProductsForClient = products.map(product => ({
    ...product,
    price: product.price ? Number(product.price) : null,
    createdAt: product.createdAt ? product.createdAt.toISOString() : null,
    images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
  }));

  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <CategoryHero
        name={category.name}
        description={category.description || `${category.name} plants`}
        image={categoryImage}
      />
      <CategoryContent
        categoryName={category.name}
        products={finalProductsForClient as any} // Type assertion needed due to Decimal/Date transformation
        priceRange={[minPrice, maxPrice]}
        explainer={
          category.description && typeof category.description === 'string'
            ? {
                paragraphs: [category.description],
              }
            : undefined
        }
      />
      <Footer />
    </div>
  );
}
