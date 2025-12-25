import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { Footer } from '@/components/layout/footer';

interface GuidePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')} | Plant Care Guide | The Plant Nursery`,
    description: `Expert plant care guide for ${id.replace(/-/g, ' ')}. Learn practical tips based on real-world growing experience.`,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <main>
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2d5016] mb-4">
              {id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')}
            </h1>
            <p className="text-lg text-muted-foreground">
              Guide content coming soon
            </p>
          </div>

          <div className="prose prose-lg max-w-none bg-muted/30 p-8 rounded-lg border border-[#9ca3af]">
            <p className="text-muted-foreground leading-relaxed">
              This guide is currently being developed. Check back soon for comprehensive, practical advice based on
              real-world growing experience.
            </p>
            <div className="mt-6">
              <a
                href="/guides"
                className="text-primary hover:text-secondary transition-colors font-medium"
              >
                ← Back to all guides
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

