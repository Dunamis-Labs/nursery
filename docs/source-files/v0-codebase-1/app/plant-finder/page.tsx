import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PlantFinderFlow } from "@/components/plant-finder-flow"

export const metadata = {
  title: "Plant Finder - Find the Right Plant for Your Space | The Plant Nursery",
  description:
    "Answer a few simple questions and we'll recommend plants that are most likely to thrive in your home or garden.",
}

export default function PlantFinderPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <PlantFinderFlow />
      </main>
      <Footer />
    </div>
  )
}
