import { NavigationWrapper } from "@/components/layout/navigation-wrapper"
import { Footer } from "@/components/layout/footer"
import { PlantFinderFlow } from "@/components/plant-finder-flow"

export const metadata = {
  title: "Plant Finder - Find the Right Plant for Your Space | The Plant Nursery",
  description:
    "Answer a few simple questions and we'll recommend plants that are most likely to thrive in your home or garden.",
}

export default function PlantFinderPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationWrapper />
      <main className="flex-1">
        <PlantFinderFlow />
      </main>
      <Footer />
    </div>
  )
}

