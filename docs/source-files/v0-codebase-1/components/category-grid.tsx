import { Card } from "@/components/ui/card"
import Link from "next/link"

const categories = [
  {
    name: "Indoor Plants",
    slug: "indoor-plants",
    count: 156,
    image: "/potted-indoor-plants-monstera.jpg",
    description: "Low-light and bright-light houseplants for homes and apartments",
  },
  {
    name: "Outdoor Plants",
    slug: "outdoor-plants",
    count: 243,
    image: "/outdoor-garden-plants-flowers.jpg",
    description: "Hardy plants for gardens, patios, and year-round outdoor spaces",
  },
  {
    name: "Succulents",
    slug: "succulents",
    count: 89,
    image: "/succulent-collection.png",
    description: "Drought-tolerant, low-maintenance plants for beginners",
  },
  {
    name: "Trees & Shrubs",
    slug: "trees-and-shrubs",
    count: 127,
    image: "/young-trees-and-shrubs-nursery.jpg",
    description: "Structural plants for privacy, shade, and landscaping",
  },
  {
    name: "Herbs & Vegetables",
    slug: "herbs-and-vegetables",
    count: 94,
    image: "/herb-garden-vegetable-plants.jpg",
    description: "Edible plants for kitchens, balconies, and gardens",
  },
  {
    name: "Pots & Planters",
    slug: "pots-and-planters",
    count: 178,
    image: "/ceramic-pots-and-planters.jpg",
    description: "Indoor and outdoor containers designed for healthy root growth",
  },
]

export function CategoryGrid() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Shop by Category</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our carefully curated collection of plants and gardening essentials
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link key={category.name} href={`/categories/${category.slug}`}>
              <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg border-border">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} products</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{category.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
