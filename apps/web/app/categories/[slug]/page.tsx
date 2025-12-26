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
  try {
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
        image: true,
        content: {
          select: {
            navTagline: true,
            heroSubheading: true,
            aboutParagraph: true,
          },
        },
      },
    });

    if (!category) {
      notFound();
    }

    // Use database image (Vercel Blob Storage), fallback to header image map, then tile image map, then placeholder
    let categoryImage = category.image || categoryHeaderImageMap[category.name] || categoryImageMap[category.name] || '/placeholder.svg';
    
    // Ensure categoryImage is always a string - use placeholder if invalid
    if (!categoryImage || typeof categoryImage !== 'string') {
      console.warn(`Invalid category image for ${category.name}, using placeholder`);
      categoryImage = '/placeholder.svg';
    }

    // Fetch products for this category with specifications and metadata
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
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
    // Also ensure images is always an array and metadata is serializable
    const finalProductsForClient = products.map(product => {
      // Safely serialize metadata (Prisma JsonValue type)
      let serializedMetadata = null;
      if (product.metadata) {
        try {
          serializedMetadata = JSON.parse(JSON.stringify(product.metadata));
        } catch (e) {
          console.warn(`Failed to serialize metadata for product ${product.id}:`, e);
          serializedMetadata = null;
        }
      }

      return {
        ...product,
        price: product.price ? Number(product.price) : null,
        createdAt: product.createdAt ? product.createdAt.toISOString() : null,
        images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
        metadata: serializedMetadata,
        specification: product.specification ? {
          lightRequirements: product.specification.lightRequirements ?? null,
          humidity: product.specification.humidity ?? null,
          growthRate: product.specification.growthRate ?? null,
          toxicity: product.specification.toxicity ?? null,
          watering: product.specification.watering ?? null,
          temperature: product.specification.temperature ?? null,
          difficulty: product.specification.difficulty ?? null,
          origin: product.specification.origin ?? null,
        } : null,
      };
    });

    // Ensure subheading is always a string - use fallback if invalid
    let subheading = category.content?.heroSubheading
      || category.description
      || `${category.name} plants`;
    
    if (!subheading || typeof subheading !== 'string') {
      console.warn(`Invalid subheading for category ${category.name}, using fallback`);
      subheading = `${category.name} plants`;
    }

    return (
      <div className="min-h-screen">
        <NavigationWrapper />
        <CategoryHero
          name={category.name}
          subheading={subheading}
          image={categoryImage}
        />
        <CategoryContent
          categoryName={category.name}
          products={finalProductsForClient as any} // Type assertion needed due to Decimal/Date transformation
          priceRange={[minPrice, maxPrice]}
          explainer={
            (() => {
              const about = category.content?.aboutParagraph || category.description
              if (about && typeof about === 'string') {
                return { paragraphs: [about] }
              }
              return undefined
            })()
          }
        />
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error rendering category page:', error);
    // Return error page instead of throwing to prevent complete page failure
    return (
      <div className="min-h-screen">
        <NavigationWrapper />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-8">
              We encountered an error loading this category page. Please try again later.
            </p>
            <a href="/" className="text-primary hover:underline">Return to homepage</a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
