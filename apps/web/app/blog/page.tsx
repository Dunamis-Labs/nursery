import { Metadata } from 'next';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { Footer } from '@/components/layout/footer';
import { BlogContent } from '@/components/blog/blog-content';

export const metadata: Metadata = {
  title: "Blog - Plant Care Tips & Gardening Advice | The Plant Nursery",
  description:
    "Read our latest articles on plant care, gardening tips, and expert advice to help your plants thrive.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Blog
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Plant care tips, gardening advice, and expert insights
          </p>
        </div>
        <BlogContent />
      </main>
      <Footer />
    </div>
  );
}

