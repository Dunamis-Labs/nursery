import { notFound } from 'next/navigation';
import { prisma } from '@nursery/db';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { Footer } from '@/components/layout/footer';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductTabs } from '@/components/product/product-tabs';
import { ProductFAQ } from '@/components/product/product-faq';
import { RelatedProducts } from '@/components/product/related-products';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  // Support both old UUID format and new SEO slug format
  // Try to find by slug first (SEO-friendly), then by ID (UUID) for backwards compatibility
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug }, // SEO-friendly slug
        { id: slug }, // UUID for backwards compatibility (if slug is actually a UUID)
      ],
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      categories: {
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
      content: true, // ProductContent with idealFor, notIdealFor, careInstructions, detailedDescription
      specification: true, // ProductSpecification with all spec fields
      faqs: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Get related products (same categories, limit 5)
  // Use many-to-many relationship to find products in any of the same categories
  const productCategoryIds = product.categories?.map(pc => pc.categoryId) || 
                             (product.categoryId ? [product.categoryId] : []);
  
  const relatedProductsRaw = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      // Show all products regardless of availability (since all are out of stock)
      OR: [
        { categoryId: { in: productCategoryIds } }, // Backwards compatibility
        { categories: { some: { categoryId: { in: productCategoryIds } } } }, // Many-to-many
      ],
    },
    take: 5,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  // Use enriched content from ProductContent and ProductSpecification
  // Fallback to metadata if enriched content doesn't exist
  const metadata = (product.metadata as Record<string, unknown>) || {};
  
  // Get specifications from ProductSpecification table, fallback to metadata
  const specifications: Record<string, string> = product.specification ? {
    'Light Requirements': product.specification.lightRequirements || 'N/A',
    'Humidity': product.specification.humidity || 'N/A',
    'Growth Rate': product.specification.growthRate || 'N/A',
    'Toxicity': product.specification.toxicity || 'N/A',
    'Watering': product.specification.watering || 'N/A',
    'Temperature': product.specification.temperature || 'N/A',
    'Difficulty': product.specification.difficulty || 'N/A',
    'Origin': product.specification.origin || 'N/A',
  } : (metadata.specifications as Record<string, string>) || {};
  
  // Get care instructions from ProductContent, fallback to metadata
  const careInstructions = product.content?.careInstructions || (metadata.careInstructions as string) || '';
  
  // Get detailed description from ProductContent, fallback to basic description
  const detailedDescription = product.content?.detailedDescription || product.description || 'No description available.';
  const images = (product.images as string[]) || [];
  // Use database URLs (Vercel Blob Storage) directly, fallback to placeholder
  const allImages = images.length > 0 
    ? images 
    : (product.imageUrl ? [product.imageUrl] : ['/placeholder.svg']);

  // Convert Decimal to number for client components
  // Include content for idealFor/notIdealFor display
  // Include metadata for variants (sizes)
  const productForClient = {
    ...product,
    price: product.price ? Number(product.price) : null,
    content: product.content, // Pass content for idealFor/notIdealFor
    metadata: product.metadata, // Pass metadata for variants (sizes)
  };

  const relatedProducts = relatedProductsRaw.map(p => ({
    ...p,
    price: p.price ? Number(p.price) : null,
  }));

  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <main className="py-8 px-4">
        <div className="container mx-auto">
          {/* Product Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 mb-16">
            <ProductImageGallery images={allImages} name={product.name} />
            <ProductInfo product={productForClient as any} />
          </div>

          {/* Product Details Tabs */}
          <ProductTabs
            description={detailedDescription}
            specifications={specifications}
            careInstructions={careInstructions}
          />

          {/* FAQ Section */}
          <ProductFAQ faqs={product.faqs} />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <RelatedProducts currentProductId={product.id} products={relatedProducts as any} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

