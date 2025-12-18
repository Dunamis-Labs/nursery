import { notFound } from 'next/navigation';
import { prisma } from '@nursery/db';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { Footer } from '@/components/layout/footer';
import { ProductImageGallery } from '@/components/product/product-image-gallery';
import { ProductInfo } from '@/components/product/product-info';
import { ProductTabs } from '@/components/product/product-tabs';
import { RelatedProducts } from '@/components/product/related-products';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Try to find by ID (UUID) or slug
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id },
      ],
    },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Get related products (same category, limit 5)
  const relatedProducts = await prisma.product.findMany({
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

  // Extract metadata
  const metadata = (product.metadata as Record<string, unknown>) || {};
  const specifications = (metadata.specifications as Record<string, unknown>) || {};
  const careInstructions = (metadata.careInstructions as string) || '';
  const images = (product.images as string[]) || [];
  // Filter out Plantmark URLs - use local images only or placeholder
  const localImages = images.filter(img => img && !img.includes('plantmark.com.au'));
  const localImageUrl = product.imageUrl && !product.imageUrl.includes('plantmark.com.au') 
    ? product.imageUrl 
    : null;
  const allImages = localImages.length > 0 
    ? localImages 
    : (localImageUrl ? [localImageUrl] : ['/placeholder.svg']);

  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <main className="py-8 px-4">
        <div className="container mx-auto">
          {/* Product Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 lg:gap-12 mb-16">
            <ProductImageGallery images={allImages} name={product.name} />
            <ProductInfo product={product} />
          </div>

          {/* Product Details Tabs */}
          <ProductTabs
            description={product.description || 'No description available.'}
            specifications={specifications as Record<string, string>}
            careInstructions={careInstructions}
          />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <RelatedProducts currentProductId={product.id} products={relatedProducts} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

