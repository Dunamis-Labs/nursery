import { notFound } from 'next/navigation';
import { prisma } from '@nursery/db';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { Footer } from '@/components/layout/footer';
import { CategoryHero } from '@/components/category/category-hero';
import { CategoryContent } from '@/components/category/category-content';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
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
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <CategoryHero
        name={category.name}
        description={category.description || `${category.name} plants`}
        image="/placeholder.svg" // TODO: Add image field to Category model
      />
      <CategoryContent
        categoryName={category.name}
        products={category.products}
        explainer={
          category.description
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

