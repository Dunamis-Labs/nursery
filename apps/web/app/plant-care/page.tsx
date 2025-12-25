import { Metadata } from 'next';
import { NavigationWrapper } from '@/components/layout/navigation-wrapper';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: "How to Care for Plants | The Plant Nursery",
  description:
    "The Plant Nursery's comprehensive philosophy on plant care based on real-world growing conditions. Learn about light, water, soil, and how plants adapt to stress.",
};

export default function PlantCarePage() {
  return (
    <div className="min-h-screen">
      <NavigationWrapper />
      <main>
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2d5016] mb-4">How to Care for Plants</h1>
          <p className="text-lg text-muted-foreground mb-12">
            A practical approach based on real-world growing conditions
          </p>

          <div className="prose prose-lg max-w-none">
            {/* Introduction: Care as a System */}
            <section className="mb-12">
              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  Plant care is about observation and response rather than following rigid rules. Plants are living
                  systems that adapt to their environment. Successful care depends on understanding how plants respond
                  to their conditions and adjusting accordingly.
                </p>

                <p>
                  Most plant failures result from misunderstanding light requirements or watering inappropriately for
                  the environment. These two factors determine whether a plant establishes and continues growing. Other
                  care aspects matter, but light and water are foundational.
                </p>

                <p>
                  Real homes and gardens differ significantly from ideal growing conditions. Plants sold commercially
                  are often grown in controlled environments with consistent temperature, humidity, and light. Home
                  environments vary. Understanding this difference helps set realistic expectations for plant
                  performance.
                </p>
              </div>
            </section>

            {/* Light: The Primary Driver */}
            <section className="mb-12 bg-[#faf9f6] p-8 rounded-lg border border-[#9ca3af]">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">Understanding Light</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  Light drives photosynthesis and determines how plants grow. Insufficient light prevents plants from
                  producing the energy they need. Too much direct light can burn foliage. Light matters more than
                  watering because water requirements depend on light levels.
                </p>

                <p>
                  Direct light means sunlight that reaches the plant without obstruction. Indirect light is filtered
                  through a curtain or reflected from nearby surfaces. Medium light is bright enough to cast a faint
                  shadow. Low light is ambient room lighting without direct sun exposure. These distinctions matter
                  because plants respond differently to each condition.
                </p>

                <p>
                  Indoor light differs from outdoor light in intensity and consistency. A bright indoor room receives
                  significantly less light than an outdoor shaded area. Windows filter and reduce light. The direction a
                  window faces affects light quality throughout the day.
                </p>

                <p>
                  Trees are particularly sensitive to light during establishment. Young trees require consistent light
                  to develop strong root systems. Sudden changes in light exposure can stress trees and slow growth.
                  This is why planting location matters more for trees than for smaller plants.
                </p>
              </div>
            </section>

            {/* Water: Response, Not Schedule */}
            <section className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">Watering Plants Properly</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  Watering schedules fail because water needs change based on light, temperature, humidity, and plant
                  growth stage. A plant in bright light uses water faster than the same plant in low light. Temperature
                  affects evaporation rates. Humidity influences how quickly soil dries.
                </p>

                <p>
                  Roots, soil composition, and drainage determine how plants process water. Roots absorb water and
                  oxygen from soil. Waterlogged soil prevents oxygen from reaching roots. This causes root rot, which is
                  more common than drought stress in indoor plants.
                </p>

                <p>
                  Overwatering occurs when soil remains wet without drying between waterings. Roots suffocate and decay.
                  Underwatering causes wilting and leaf drop but is usually reversible. Overwatering damage is often
                  permanent. This is why allowing soil to dry slightly between waterings is generally safer.
                </p>

                <p>
                  Plants signal stress through visible changes. Wilting indicates insufficient water or root damage.
                  Yellow leaves can mean overwatering or nutrient deficiency. Leaf drop suggests environmental stress or
                  inadequate light. Observing these signals and responding appropriately is more effective than
                  following fixed schedules.
                </p>
              </div>
            </section>

            {/* Soil, Roots, and Establishment */}
            <section className="mb-12 bg-[#87a96b]/10 p-8 rounded-lg border border-[#87a96b]/40">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">Soil and Root Health</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  Roots determine plant health more than visible foliage. Strong root systems support consistent growth
                  and stress recovery. Weak or damaged roots limit what a plant can achieve regardless of care quality
                  above ground.
                </p>

                <p>
                  Establishment period refers to the time a plant needs to adapt to new conditions and develop
                  functional roots. This period varies by plant type. Trees require months to years to establish. Shrubs
                  need weeks to months. Small plants may establish within days to weeks. During establishment, plants
                  are more vulnerable to stress.
                </p>

                <p>
                  Drainage and oxygen availability in soil affect root development. Well-draining soil allows water to
                  move through without pooling. This prevents root rot and ensures oxygen reaches roots. Poor drainage
                  is one of the most common causes of plant failure in both containers and ground plantings.
                </p>

                <p>
                  Newly planted trees behave differently than established trees. They require consistent watering to
                  prevent root stress. Growth is slower during the first year as energy goes into root development
                  rather than foliage. Fertilizing too early can stress young trees. Patience during establishment is
                  critical for long-term tree success.
                </p>
              </div>
            </section>

            {/* Indoor vs Outdoor Care */}
            <section className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">
                Caring for Plants Indoors and Outdoors
              </h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  Indoor environments provide stability. Temperature, humidity, and light remain relatively constant.
                  Plants adapt to these conditions but may struggle if moved between indoor locations with different
                  light levels. The primary challenges indoors are insufficient light and stagnant air.
                </p>

                <p>
                  Outdoor environments expose plants to seasonal changes, weather variation, and fluctuating conditions.
                  Wind increases water loss and can physically damage plants. Temperature extremes stress plants.
                  Rainfall patterns affect watering needs. Outdoor plants must tolerate greater variation than indoor
                  plants.
                </p>

                <p>
                  Seasonal shifts require adjustments in care. Plants grow actively during warm months and slow or stop
                  growth during cold months. Watering and feeding schedules must reflect these changes. Ignoring
                  seasonal patterns often results in overwatering during dormancy or underfeeding during active growth.
                </p>

                <p>
                  Microclimates within gardens create localized conditions that differ from general weather patterns.
                  Areas near walls retain heat. Low spots collect water. Shaded zones stay cooler. Understanding
                  microclimates helps place plants where they will succeed. Indoor plants fail for different reasons
                  than outdoor plants because the environmental challenges differ fundamentally.
                </p>
              </div>
            </section>

            {/* Stress, Adaptation, and Recovery */}
            <section className="mb-12 bg-[#faf9f6] p-8 rounded-lg border border-[#9ca3af]">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">How Plants Respond to Stress</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  Transplant shock occurs when plants are moved between environments. Roots are disturbed. Light and
                  humidity levels change. Plants may drop leaves, pause growth, or wilt temporarily. This is a normal
                  response. Most plants recover within weeks if basic needs are met.
                </p>

                <p>
                  Leaf drop is a common stress response. Plants shed older leaves to conserve resources when conditions
                  change. This can happen after repotting, moving locations, or seasonal transitions. Leaf drop does not
                  always indicate a problem. New growth indicates the plant is adapting successfully.
                </p>

                <p>
                  Slow growth often reflects inadequate light or nutrient availability rather than poor care. Plants
                  prioritize survival over growth when conditions are marginal. A plant that maintains its existing
                  foliage without growing is managing its environment. Faster growth resumes when conditions improve.
                </p>

                <p>
                  Stress is not always failure. Plants that survive challenging conditions are building resilience.
                  Recovery from stress demonstrates a plant's suitability for an environment. Plants that repeatedly
                  decline despite intervention may be unsuited to their location. Understanding when to adjust care
                  versus when to accept a plant's limits is part of successful long-term plant management.
                </p>
              </div>
            </section>

            {/* How This Philosophy Is Used on the Site */}
            <section className="mb-12 bg-[#87a96b]/10 p-8 rounded-lg border border-[#87a96b]/40">
              <h2 className="font-serif text-3xl font-bold text-[#2d5016] mb-6">How We Apply This Approach</h2>

              <div className="space-y-4 text-[#2c2c2c] leading-relaxed">
                <p>
                  Guides provide practical steps for specific care activities. They explain how to water correctly,
                  adjust light, address problems, and maintain plants through seasonal changes. Guides translate the
                  principles described on this page into actionable instructions.
                </p>

                <p>
                  Plant Finder uses these care principles to recommend plants that match real conditions. It asks about
                  light availability, care capacity, space constraints, and goals. Recommendations are based on plant
                  tolerance ranges rather than ideal conditions. If a plant is suggested for low light, it means the
                  plant survives in low light even if it does not thrive there.
                </p>

                <p>
                  Product care tabs on plant pages summarize key needs. They state light requirements, watering
                  frequency ranges, and common issues. These summaries are based on the same understanding of how plants
                  respond to their environment. They assume real-world conditions rather than controlled greenhouse
                  settings.
                </p>

                <p>
                  Blog articles explore the reasoning behind plant decisions. They address why certain approaches work,
                  how to evaluate trade-offs, and how to build confidence in plant selection. The blog provides context
                  for understanding plant behavior and care choices. Together, these sections support practical,
                  informed plant care.
                </p>
              </div>
            </section>

            {/* Closing Statement */}
            <section className="text-[#2c2c2c] leading-relaxed">
              <p>
                Long-term plant success depends on matching plants to conditions and understanding how they respond to
                their environment. Confidence in plant care develops through observation and experience. Perfection is
                not the goal. Consistent growth and healthy adaptation to real conditions define success.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

