import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "About The Plant Nursery | Growing & Supplying Trees and Plants",
  description:
    "The Plant Nursery specializes in growing, selecting, and supplying trees and plants for real homes and gardens, focusing on long-term success rather than ideal conditions.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Page Intro / Identity */}
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2d5016] mb-6">About The Plant Nursery</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-[#2c2c2c] leading-relaxed mb-8">
              The Plant Nursery specializes in growing, selecting, and supplying trees and plants for real homes and
              gardens. The focus is on long-term success in actual conditions rather than ideal greenhouse environments.
              Plants are chosen for their ability to establish, adapt, and perform consistently over time.
            </p>

            {/* What We Do */}
            <section className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">What We Focus On</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  The nursery grows and supplies trees, shrubs, and plants for residential and garden use. This includes
                  indoor plants, outdoor ornamentals, edible plants, and structural trees.
                </p>

                <p>
                  Selection assistance is provided to help customers choose plants that will succeed in their specific
                  conditions. This includes light levels, space constraints, care capacity, and environmental factors
                  like humidity and temperature variation.
                </p>

                <p>
                  Post-purchase guidance focuses on helping plants establish and recover from common issues.
                  Instructions are written for real-world scenarios, not controlled environments.
                </p>

                <p>
                  The emphasis is on survivability, suitability, and building customer confidence in plant care. Plants
                  are selected and recommended based on their tolerance for variation and ability to recover from
                  stress.
                </p>
              </div>
            </section>

            {/* How Plants Are Selected */}
            <section className="mb-12 bg-[#faf9f6] p-8 rounded-lg border border-[#e5e7eb]">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">How We Select Our Plants</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  Plants are selected based on adaptability to real conditions, tolerance for variation in care, and
                  demonstrated performance over time. The selection process prioritizes plants that establish well,
                  recover from stress, and perform consistently in real gardens and homes.
                </p>

                <p>
                  Trees are evaluated as long-term investments. Factors include growth rate, mature size, root behavior,
                  seasonal changes, and maintenance requirements over years rather than months.
                </p>

                <p>
                  Indoor plants are chosen for their ability to tolerate lower light than their ideal range,
                  inconsistent watering, and variable humidity. Outdoor plants are selected for their tolerance of soil
                  variation, weather fluctuations, and establishment periods.
                </p>

                <p>
                  Plants that require precise conditions or constant attention are not prioritized. The goal is to
                  supply plants that succeed with practical, realistic care.
                </p>
              </div>
            </section>

            {/* How Guidance Is Written */}
            <section className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">How Our Guidance Is Written</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  Care instructions distinguish between ideal conditions and practical care. Ideal conditions describe
                  what would produce the most growth or best appearance. Practical care describes what will keep a plant
                  alive and healthy in real environments.
                </p>

                <p>
                  Most guidance focuses on practical care because that is what works for most people. Instructions
                  account for missed waterings, imperfect light, and normal household conditions.
                </p>

                <p>
                  The Plant Finder tool uses the same logic. Recommendations are based on tolerance ranges, not optimal
                  conditions. If a plant is recommended for low light, it means it survives in low light, not that it
                  thrives there.
                </p>

                <p>
                  This approach builds confidence by setting realistic expectations. Success is defined as a plant that
                  establishes and continues growing, not perfection.
                </p>
              </div>
            </section>

            {/* What Makes a Nursery Different */}
            <section className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">What "Nursery" Means to Us</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  A nursery grows plants rather than reselling them. This means familiarity with how plants develop,
                  what affects their health, and how they respond to different conditions over time.
                </p>

                <p>
                  Growing plants involves long-term thinking. Trees take years to mature. Perennials go dormant and
                  return. Shrubs change shape as they age. This perspective shapes how plants are selected and
                  recommended.
                </p>

                <p>
                  The responsibility extends beyond the point of sale. A nursery understands that success depends on
                  what happens after the customer takes the plant home.
                </p>

                <p>
                  Trees, plants, and shrubs are living systems that respond to their environment. They are not
                  decorative objects. Understanding this difference is central to how the nursery operates.
                </p>
              </div>
            </section>

            {/* How This Site Is Structured */}
            <section className="mb-12 bg-[#87a96b]/10 p-8 rounded-lg border border-[#87a96b]/20">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">How to Use This Site</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  <strong className="text-[#2d5016]">Guides</strong> explain how to care for plants. They cover
                  watering, light, soil, pruning, troubleshooting, and seasonal care. Guides are organized by topic and
                  plant type.
                </p>

                <p>
                  <strong className="text-[#2d5016]">Plant Finder</strong> helps you choose plants based on your
                  conditions. It asks about light, space, care capacity, and goals, then recommends plants that match
                  those requirements.
                </p>

                <p>
                  <strong className="text-[#2d5016]">Blog</strong> addresses how to think about plant decisions.
                  Articles explain why certain approaches work, how to evaluate trade-offs, and how to build confidence
                  in plant selection and care.
                </p>

                <p>
                  These sections work together. The Plant Finder suggests plants, Guides explain how to care for them,
                  and the Blog provides context for decision-making.
                </p>
              </div>
            </section>

            {/* Closing Statement */}
            <section className="text-[#2c2c2c] leading-relaxed">
              <p>
                The Plant Nursery operates on the principle that plants should be selected for their suitability, not
                their appearance alone. Guidance is provided based on practical experience with how plants perform in
                real environments. The goal is to supply plants that customers can grow successfully and provide
                information that builds confidence in plant care.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
