import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { GuidesIntro } from "@/components/guides-intro"
import { CoreCareGuides } from "@/components/core-care-guides"
import { SituationalGuides } from "@/components/situational-guides"
import { PlantSpecificGuides } from "@/components/plant-specific-guides"
import { GuidesAuthority } from "@/components/guides-authority"

export const metadata = {
  title: "Plant Care Guides & Growing Advice | The Plant Nursery",
  description:
    "Expert plant care guides based on real-world growing experience. Learn how to help plants succeed in actual homes and gardens, not just ideal conditions.",
}

export default function GuidesPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <GuidesIntro />
        <CoreCareGuides />
        <SituationalGuides />
        <PlantSpecificGuides />
        <GuidesAuthority />
      </main>
      <Footer />
    </div>
  )
}
