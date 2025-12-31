import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { GuideArticle } from "@/components/guide-article"
import { notFound } from "next/navigation"

const guides: Record<string, any> = {
  watering: {
    title: "How to Water Plants Properly",
    category: "Core Care",
    readTime: "7 min read",
    intro:
      "Watering is the most common cause of houseplant death, yet it remains one of the most misunderstood aspects of plant care. The Plant Nursery approaches watering as a response to plant needs rather than a fixed schedule.",
    sections: [
      {
        heading: "Check the Soil, Not the Calendar",
        text: "Plants do not require water on a fixed schedule because their water consumption varies with light, temperature, humidity, and growth stage. A plant in bright light during summer uses water much faster than the same plant in lower light during winter. Instead of watering every X days, check soil moisture before watering. Insert a finger 2-3 cm into the soil. If it feels dry at that depth, the plant likely needs water. If it feels damp, wait.",
      },
      {
        heading: "Water Thoroughly When You Water",
        text: "When soil is ready for water, water thoroughly until excess drains from the bottom of the pot. This ensures the entire root system receives moisture and prevents salt buildup from fertilizer. Light, frequent watering encourages shallow root growth and creates dry pockets deeper in the pot. Thorough watering followed by allowing soil to dry appropriately promotes healthy, deep root systems.",
      },
      {
        heading: "Drainage Is Essential",
        text: "Pots must have drainage holes. Without drainage, excess water accumulates at the bottom, creating anaerobic conditions that cause root rot. If you use a decorative pot without drainage, either drill holes or use it as a cachepot with the plant remaining in a drained inner pot. Remove standing water from saucers after watering.",
      },
      {
        heading: "Different Plants, Different Needs",
        text: "Watering frequency varies by plant type. Succulents and cacti prefer soil that dries completely between waterings. Tropical plants like ferns and calatheas prefer consistently moist (not soggy) soil. Most common houseplants fall in between, preferring soil that dries in the top few centimeters before rewatering. Learn your specific plant's preferences rather than applying a universal approach.",
      },
      {
        heading: "Signs of Overwatering vs. Underwatering",
        text: "Overwatering causes yellowing leaves, soft stems, and root rot. Soil smells sour and remains wet for extended periods. Underwatering causes wilting, crispy brown leaf edges, and leaf drop. Leaves may curl inward. Both conditions stress plants, but overwatering is harder to reverse. When in doubt, underwater slightly rather than overwater.",
      },
      {
        heading: "Seasonal Adjustments",
        text: "Most plants require less water in winter when growth slows and light levels decrease. Heating systems dry indoor air, which can increase water needs despite lower light. Monitor soil moisture rather than maintaining the same watering frequency year-round. Plants that receive more light in summer will need more frequent watering during that period.",
      },
    ],
    practicalTips: [
      "Use room-temperature water to avoid shocking roots",
      "Water in the morning when possible so excess moisture evaporates during the day",
      "Bottom watering (placing pot in water to absorb from drainage holes) works well for plants sensitive to wet foliage",
      "Group plants with similar water needs to simplify care routines",
      "Consider self-watering pots for plants that prefer consistent moisture",
    ],
    nurseryNote:
      "The most common question we receive is 'how often should I water this plant?' We respond by teaching customers how to assess their plant's needs rather than providing a fixed schedule. This builds long-term success rather than short-term convenience.",
    relatedLinks: [
      { text: "Common Plant Problems", href: "/guides/plant-problems" },
      { text: "Choosing the Right Plant", href: "/guides/choosing-plants" },
      { text: "Plant Finder Tool", href: "/plant-finder" },
    ],
  },
  "light-levels": {
    title: "Understanding Light Levels (Low, Medium, Bright)",
    category: "Core Care",
    readTime: "6 min read",
    intro:
      "Light terminology causes significant confusion in plant care. Terms like 'bright indirect' or 'low light' mean different things to different people. The Plant Nursery defines light levels based on measurable criteria that help match plants to actual spaces.",
    sections: [
      {
        heading: "What Is Bright Light?",
        text: "Bright light locations receive direct sun for at least part of the day or very strong indirect light all day. This includes south-facing windows (in the Southern Hemisphere) and areas within 1-2 meters of unobstructed east or west windows. Plants in bright light cast sharp shadows and can often tolerate some direct sun. Most flowering plants, succulents, and cacti require bright light to thrive.",
      },
      {
        heading: "What Is Medium Light?",
        text: "Medium light locations receive bright indirect light but not direct sun. This includes areas 2-3 meters from bright windows, north-facing windows with good sky visibility, or spaces near east/west windows with sheer curtains. Most common houseplants (pothos, philodendron, snake plants, dracaena) perform well in medium light. Plants in medium light cast soft, diffused shadows.",
      },
      {
        heading: "What Is Low Light?",
        text: "Low light locations receive minimal natural light from distant windows or north-facing windows with obstructions. These spaces are typically 3-5 meters from windows. Low light does not mean no light - plants still need some natural light to survive. Only a select group of plants (cast iron plant, ZZ plant, pothos, snake plant) can tolerate these conditions. Plants in low light cast no visible shadows.",
      },
      {
        heading: "Assessing Your Space",
        text: "To assess light levels, observe shadows at midday on a clear day. Sharp, well-defined shadows indicate bright light. Soft, visible shadows indicate medium light. No shadows indicate low light. Also consider seasonal changes - north-facing windows provide less light in winter when the sun angle is lower. Light intensity drops dramatically with distance from windows, so proximity matters more than window size.",
      },
      {
        heading: "Artificial Light as Supplement",
        text: "Standard household lighting does not provide sufficient intensity for most plant growth. Grow lights designed for plants can supplement natural light in low-light areas. LED grow lights placed 30-50 cm above plants and used for 12-14 hours per day can support plant growth where natural light is insufficient. This extends plant placement options significantly.",
      },
      {
        heading: "Light and Other Care Factors",
        text: "Light levels affect watering needs. Plants in brighter light use water faster and may need more frequent watering. Lower light reduces water consumption, meaning longer intervals between waterings. Fertilizer needs also decrease in lower light because photosynthesis occurs more slowly. Match all aspects of care to available light for best results.",
      },
    ],
    practicalTips: [
      "Use the shadow test at midday on a clear day to assess light accurately",
      "Rotate plants weekly if light comes from one direction to encourage even growth",
      "Move plants closer to windows in winter when sun angle lowers",
      "Clean windows regularly to maximize light transmission",
      "Consider sheer curtains for plants that need bright indirect light near sunny windows",
    ],
    nurseryNote:
      "When customers describe their space as having 'bright indirect light,' we ask them to describe shadows and measure distance from windows. This conversation reveals actual light conditions and prevents mismatched plant selections.",
    relatedLinks: [
      { text: "Best Plants for Low-Light Homes", href: "/guides/low-light-plants" },
      { text: "Watering Guide", href: "/guides/watering" },
      { text: "Browse Indoor Plants", href: "/categories/indoor-plants" },
    ],
  },
  "choosing-plants": {
    title: "Choosing the Right Plant for Your Space",
    category: "Core Care",
    readTime: "8 min read",
    intro:
      "Successful plant ownership begins with matching plants to available conditions rather than forcing plants to adapt to unsuitable environments. The Plant Nursery prioritizes realistic assessment of space, lifestyle, and commitment level when helping customers select plants.",
    sections: [
      {
        heading: "Assess Your Light Conditions First",
        text: "Light is the most critical factor in plant success because it cannot be easily changed. Before selecting plants, evaluate the actual light levels in your intended placement area using the shadow test described in our Light Levels guide. Choose plants rated for your available light rather than aspirational light you hope to improve. Most plant deaths result from inadequate light, not care mistakes.",
      },
      {
        heading: "Match Watering Needs to Your Lifestyle",
        text: "Consider your travel frequency, memory for routine tasks, and willingness to check plants regularly. If you travel often or forget to water, choose drought-tolerant plants like snake plants, ZZ plants, or succulents that tolerate infrequent watering. If you enjoy regular plant interaction, ferns, calatheas, or flowering plants that need consistent moisture may suit you better. There is no wrong preference, only mismatched expectations.",
      },
      {
        heading: "Consider Available Space",
        text: "Plants grow. A small monstera in a 15 cm pot can reach 2-3 meters indoors over several years. A fiddle leaf fig eventually needs ceiling height. Before purchasing, research mature size and ensure you can accommodate growth or are prepared to maintain size through pruning. For limited spaces, choose naturally compact plants or varieties bred for smaller size.",
      },
      {
        heading: "Account for Pets and Children",
        text: "Many common houseplants are toxic if ingested. If you have curious pets or young children, select non-toxic varieties like spider plants, Boston ferns, calatheas, or African violets. Alternatively, place toxic plants out of reach, though this limits placement options. Pet safety is non-negotiable - check toxicity before bringing any plant home.",
      },
      {
        heading: "Start Easy, Then Expand",
        text: "Beginners should start with forgiving plants that tolerate mistakes: pothos, snake plants, spider plants, or cast iron plants. These species survive missed waterings, variable light, and temperature fluctuations. Success with easy plants builds confidence and understanding. Complex plants like orchids, bonsai, or carnivorous species require specific conditions and should wait until you have baseline experience.",
      },
      {
        heading: "Buy from Sources That Match Plants to Conditions",
        text: "Nurseries that ask questions about your space, light, and lifestyle help you succeed. Avoid impulse purchases based solely on appearance. Beautiful plants that are unsuited to your conditions will decline regardless of how attractive they are initially. Invest time in selection to avoid frustration and wasted money on plants that cannot thrive in your home.",
      },
    ],
    practicalTips: [
      "Take photos of your space and bring them when shopping for plants",
      "Ask specific questions about light needs, not just 'is this easy?'",
      "Start with one or two plants rather than filling your home at once",
      "Research toxicity before purchasing if you have pets",
      "Consider seasonal changes in light and temperature when placing plants",
    ],
    nurseryNote:
      "We sell fewer plants than nurseries that recommend everything for everyone, but our customers have much higher success rates. A single thriving plant is better than five struggling plants. We prioritize matches that work over sales that don't.",
    relatedLinks: [
      { text: "Plant Finder Tool", href: "/plant-finder" },
      { text: "Best Plants for Beginners", href: "/guides/beginner-plants" },
      { text: "Understanding Light Levels", href: "/guides/light-levels" },
    ],
  },
  "plant-problems": {
    title: "Common Plant Problems and How to Fix Them",
    category: "Core Care",
    readTime: "10 min read",
    intro:
      "Plants communicate stress through visible symptoms. The Plant Nursery teaches customers to read these symptoms as diagnostic clues rather than panicking at the first yellow leaf. Most problems are reversible when addressed early.",
    sections: [
      {
        heading: "Yellow Leaves: Overwatering or Natural Aging",
        text: "Yellow leaves are the most common concern. If yellowing affects the oldest, lowest leaves while new growth looks healthy, this is natural aging. All leaves eventually yellow and drop. If yellowing affects multiple leaves, occurs rapidly, or includes soft stems, this indicates overwatering. Check soil moisture and adjust watering frequency. Remove yellow leaves as they won't recover.",
      },
      {
        heading: "Brown Leaf Tips: Low Humidity or Salt Buildup",
        text: "Brown, crispy leaf tips typically result from low humidity (common in heated or air-conditioned homes) or salt accumulation from fertilizer or tap water. Increase humidity through grouping plants, using a humidifier, or placing pots on water-filled pebble trays. Flush soil with water periodically to remove salt buildup. Trim brown tips with clean scissors for aesthetics.",
      },
      {
        heading: "Wilting or Drooping: Underwatering or Root Problems",
        text: "If soil is dry and leaves perk up after watering, the cause is straightforward underwatering. If soil is wet and wilting persists, this suggests root rot from overwatering. Remove the plant from its pot and inspect roots. Healthy roots are white or tan and firm. Rotted roots are brown, black, soft, and smell sour. Trim rotted roots, repot in fresh soil, and reduce watering frequency.",
      },
      {
        heading: "Leggy Growth: Insufficient Light",
        text: "Plants stretching toward light sources with long gaps between leaves indicate insufficient light. Stems become thin and weak. Move the plant closer to a window or supplement with grow lights. Prune leggy growth to encourage bushier growth patterns. Without addressing light, the problem will recur regardless of other care adjustments.",
      },
      {
        heading: "Pests: Early Detection and Treatment",
        text: "Common houseplant pests include spider mites (tiny webs on leaves), mealybugs (white cottony clusters), scale (brown bumps on stems), and fungus gnats (small flies around soil). Inspect new plants before bringing them near existing plants. Treat infestations with insecticidal soap, neem oil, or systemic treatments depending on pest type. Isolate affected plants to prevent spread.",
      },
      {
        heading: "Lack of Growth: Dormancy or Root-Bound Plants",
        text: "Many plants slow or stop growth in winter due to lower light and shorter days. This is normal dormancy. If a plant hasn't grown during active growing season (spring/summer), it may be root-bound. Check if roots circle the pot or emerge from drainage holes. Repot into a slightly larger container to resume growth.",
      },
    ],
    practicalTips: [
      "Inspect plants weekly to catch problems early when they're easier to fix",
      "Keep a simple journal noting watering dates and observations",
      "Don't fertilize stressed plants - focus on resolving the underlying issue first",
      "Remove severely damaged leaves to redirect plant energy to healthy growth",
      "Isolate new plants for 2 weeks to ensure they aren't harboring pests",
    ],
    nurseryNote:
      "Customers often arrive convinced their plant is dying when we see minor, correctable stress. A few yellow leaves or brown tips do not mean failure. We teach recognition of serious problems versus cosmetic imperfections that don't threaten the plant's survival.",
    relatedLinks: [
      { text: "Watering Guide", href: "/guides/watering" },
      { text: "Repotting Guide", href: "/guides/repotting" },
      { text: "Contact Us", href: "/contact" },
    ],
  },
  repotting: {
    title: "Repotting Plants: When and Why",
    category: "Core Care",
    readTime: "9 min read",
    intro:
      "Repotting serves multiple purposes: providing fresh nutrients, preventing root binding, and accommodating growth. The Plant Nursery recommends repotting based on plant needs rather than calendar schedules.",
    sections: [
      {
        heading: "When to Repot",
        text: "Repot when roots circle the pot, emerge from drainage holes, or when water drains through very quickly because roots displace soil. Most houseplants need repotting every 18-24 months. Fast-growing plants may need annual repotting. Slow-growing plants like succulents or snake plants can remain in the same pot for several years. Spring is ideal because plants enter active growth and recover faster.",
      },
      {
        heading: "Choosing the Right Pot Size",
        text: "Move up only 2-5 cm in diameter when repotting. Oversized pots hold excess soil that stays wet, increasing root rot risk. The goal is accommodating root growth, not anticipating future size. Plants in appropriately sized pots develop healthier root systems than plants in oversized containers.",
      },
      {
        heading: "Selecting Appropriate Soil",
        text: "Use potting mix formulated for your plant type. Standard houseplants use general-purpose potting mix. Cacti and succulents need fast-draining cactus mix. Orchids require bark-based orchid mix. Never use garden soil indoors - it compacts, drains poorly, and may contain pests. Quality potting mix provides drainage, aeration, and water retention balance.",
      },
      {
        heading: "Repotting Process Step by Step",
        text: "Water the plant 1-2 days before repotting to minimize stress. Remove the plant by tipping the pot and supporting the base of the plant. Gently loosen circling roots and remove old soil from the root ball's exterior. Place fresh soil in the new pot, position the plant at the same depth as before, and fill around the sides with more soil. Water thoroughly after repotting.",
      },
      {
        heading: "Post-Repotting Care",
        text: "Keep newly repotted plants out of direct sun for 1-2 weeks to reduce stress. Maintain consistent moisture but don't overwater - roots need time to re-establish. Avoid fertilizing for 4-6 weeks as fresh potting mix contains nutrients. Some leaf drop or temporary wilting is normal as plants adjust to new soil. Most plants recover within 2-3 weeks.",
      },
      {
        heading: "When Not to Repot",
        text: "Avoid repotting during winter dormancy when plants aren't actively growing. Don't repot flowering plants while blooming - wait until after flowers fade. Never repot stressed or diseased plants until they stabilize. If a plant is thriving in its current pot, don't repot just because time has passed. Only repot when the plant demonstrates need.",
      },
    ],
    practicalTips: [
      "Lay down newspaper or plastic sheeting to contain soil mess",
      "Have all materials ready before removing the plant from its pot",
      "Prune any dead or damaged roots during repotting",
      "Label plants if repotting multiple at once to avoid confusion",
      "Reuse old pots after washing with soap and water to prevent disease transfer",
    ],
    nurseryNote:
      "Many customers repot too frequently because they assume bigger pots mean bigger plants. We've seen more problems from overpotting than from leaving plants slightly root-bound. When in doubt, wait another season and observe how the plant responds.",
    relatedLinks: [
      { text: "Watering Guide", href: "/guides/watering" },
      { text: "Common Plant Problems", href: "/guides/plant-problems" },
      { text: "Shop Pots & Planters", href: "/categories/pots-planters" },
    ],
  },
  // Additional guides would be added here following the same pattern
  "low-light-plants": {
    title: "Best Plants for Low-Light Homes",
    category: "Choosing Plants",
    readTime: "8 min read",
    intro:
      "Low-light spaces challenge most plants, but certain species evolved in forest understories and tolerate significantly reduced light. The Plant Nursery defines low-light plants as those that can survive and maintain health in areas receiving minimal natural light, typically 3-5 meters from windows or in spaces with only north-facing exposure.",
    sections: [
      {
        heading: "What Low Light Actually Means",
        text: "Low light is not darkness. Plants still need some natural light to photosynthesize. Spaces described as low light receive enough illumination to read a book comfortably but don't cast sharp shadows. These are areas where you wouldn't place a sun-loving plant but aren't pitch black. If you need artificial light to see clearly during the day, the space is too dark even for low-light plants.",
      },
      {
        heading: "Top Low-Light Plant Choices",
        text: "Snake plants (Sansevieria) tolerate neglect and low light better than almost any other species. ZZ plants (Zamioculcas zamiifolia) have glossy leaves and extremely low water and light needs. Pothos can adapt to low light though growth slows significantly. Cast iron plant (Aspidistra) earned its name by tolerating extremely adverse conditions. Chinese evergreen (Aglaonema) offers colorful foliage in low-light conditions.",
      },
      {
        heading: "Adjusting Expectations for Growth",
        text: "Plants in low light grow more slowly than the same species in brighter conditions. This is normal and expected. New leaves may be smaller and more widely spaced. Some low-light tolerant plants won't produce new growth for months at a time. If growth is your priority, low-light spaces are not ideal. If maintaining existing foliage is acceptable, these plants succeed.",
      },
      {
        heading: "Care Adjustments for Low Light",
        text: "Water less frequently in low light because photosynthesis slows and plants use less water. Check soil moisture carefully before watering. Reduce or eliminate fertilizer in low light - plants cannot use nutrients efficiently without adequate light for photosynthesis. Excess fertilizer accumulates as salts and damages roots. Rotate plants monthly if light comes from one direction to encourage even growth.",
      },
      {
        heading: "Supplementing with Artificial Light",
        text: "LED grow lights can dramatically improve plant performance in low-light areas. Place lights 30-50 cm above plants and run for 12-14 hours daily. This transforms previously unsuitable spaces into viable plant locations. Grow lights are especially useful in windowless rooms, basements, or bathrooms. Initial investment is modest and lights last years.",
      },
    ],
    practicalTips: [
      "Choose plants with darker green foliage - they contain more chlorophyll for low-light photosynthesis",
      "Avoid variegated varieties in low light as they revert to solid green or decline",
      "Clean leaves monthly to maximize light absorption",
      "Consider grouping several low-light plants together for visual impact",
      "Be patient with growth - low-light plants are survivors, not rapid growers",
    ],
    nurseryNote:
      "We discourage customers from purchasing plants for spaces with inadequate light, even low-light species. A slow decline is still a decline. If customers insist on plants for extremely dim areas, we strongly recommend supplemental grow lights.",
    relatedLinks: [
      { text: "Understanding Light Levels", href: "/guides/light-levels" },
      { text: "Plant Finder Tool", href: "/plant-finder" },
      { text: "Browse Indoor Plants", href: "/categories/indoor-plants" },
    ],
  },
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const guide = guides[slug]

  if (!guide) {
    return {
      title: "Guide Not Found | The Plant Nursery",
    }
  }

  return {
    title: `${guide.title} | Plant Care Guides`,
    description: guide.intro,
  }
}

export default async function GuideArticlePage({ params }: PageProps) {
  const { slug } = await params
  const guide = guides[slug]

  if (!guide) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <GuideArticle guide={guide} />
      </main>
      <Footer />
    </div>
  )
}
