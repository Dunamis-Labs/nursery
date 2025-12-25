import { Metadata } from 'next';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { Footer } from '@/components/layout/footer';
import { GuidesIntro } from '@/components/guides/guides-intro';
import { CoreCareGuides } from '@/components/guides/core-care-guides';
import { SituationalGuides } from '@/components/guides/situational-guides';
import { PlantSpecificGuides } from '@/components/guides/plant-specific-guides';
import { GuidesAuthority } from '@/components/guides/guides-authority';

export const metadata: Metadata = {
  title: "Plant Care Guides & Growing Advice | The Plant Nursery",
  description:
    "Expert plant care guides based on real-world growing experience. Learn how to help plants succeed in actual homes and gardens, not just ideal conditions.",
};

export default function GuidesPage() {
  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <main>
        <GuidesIntro />
        <CoreCareGuides />
        <SituationalGuides />
        <PlantSpecificGuides />
        <GuidesAuthority />
      </main>
      <Footer />
    </div>
  );
}

