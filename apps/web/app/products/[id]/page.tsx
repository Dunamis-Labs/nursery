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
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  // Support both old UUID format and new SEO slug format
  // Try to find by slug first (SEO-friendly), then by ID (UUID) for backwards compatibility
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: id }, // SEO-friendly slug
        { id }, // UUID for backwards compatibility
      ],
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
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

  // Get related products (same category, limit 5)
  const relatedProductsRaw = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      availability: 'IN_STOCK',
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
  // Filter out Plantmark URLs - use local images only or placeholder
  const localImages = images.filter(img => img && !img.includes('plantmark.com.au'));
  const localImageUrl = product.imageUrl && !product.imageUrl.includes('plantmark.com.au') 
    ? product.imageUrl 
    : null;
  const allImages = localImages.length > 0 
    ? localImages 
    : (localImageUrl ? [localImageUrl] : ['/placeholder.svg']);

  // Convert Decimal to number for client components
  // Include content for idealFor/notIdealFor display
  const productForClient = {
    ...product,
    price: product.price ? Number(product.price) : null,
    content: product.content, // Pass content for idealFor/notIdealFor
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

