import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CategoryHero } from "@/components/category-hero"
import { CategoryContent } from "@/components/category-content"

// Sample category data - in production, this would come from a database
const categories = {
  "indoor-plants": {
    name: "Indoor Plants",
    description: "Transform your living space with air-purifying houseplants that thrive in indoor environments",
    image: "/potted-indoor-plants-monstera.jpg",
    totalProducts: 156,
    explainer: {
      paragraphs: [
        "Our indoor plants are chosen for real living spaces, not ideal greenhouse conditions. We prioritize plants that adapt well to common indoor light levels, tolerate occasional missed watering, and recover reliably in homes and apartments. Each selection has proven itself in typical household environments where temperature and humidity fluctuate.",
        "These plants respond clearly to their conditions, making them suitable for both beginners and experienced growers. We focus on species that show visible, predictable growth when their needs are met, rather than temperamental varieties that require precise care schedules.",
      ],
    },
  },
  "outdoor-plants": {
    name: "Outdoor Plants",
    description: "Hardy garden plants that flourish in outdoor conditions year-round",
    image: "/outdoor-garden-plants-flowers.jpg",
    totalProducts: 243,
    explainer: {
      paragraphs: [
        "Our outdoor plant selection emphasizes adaptability to variable weather, tolerance of imperfect soil conditions, and recovery from typical garden stresses. These are plants that establish reliably when given basic care and continue performing through seasonal changes.",
        "We choose varieties that respond predictably to pruning, fertilization, and watering adjustments. Each plant is selected based on observed performance in diverse garden settings, not just optimal conditions.",
      ],
    },
  },
  succulents: {
    name: "Succulents",
    description: "Low-maintenance, drought-tolerant plants perfect for beginners and busy plant parents",
    image: "/succulent-collection.png",
    totalProducts: 89,
    explainer: {
      paragraphs: [
        "Our succulent collection focuses on species that forgive underwatering and adapt to varying light levels found in typical homes. These plants recover well from temporary neglect and show clear signs when they need adjustment, making them reliable for beginners and travelers.",
        "We select varieties that tolerate typical indoor humidity rather than requiring specialized environments. Each succulent demonstrates consistent growth patterns and clear visual feedback about watering needs.",
      ],
    },
  },
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = categories[params.slug as keyof typeof categories]

  if (!category) {
    return <div>Category not found</div>
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <CategoryHero name={category.name} description={category.description} image={category.image} />
      <CategoryContent
        categoryName={category.name}
        totalProducts={category.totalProducts}
        explainer={category.explainer}
      />
      <Footer />
    </div>
  )
}
