import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"

const guides = [
  {
    id: 1,
    title: "Beginner's Guide to Indoor Plant Care",
    excerpt:
      "Learn the essentials of keeping your indoor plants thriving with proper watering, lighting, and maintenance tips.",
    image: "/indoor-plant-care.png",
    readTime: "8 min read",
    category: "Care Guide",
  },
  {
    id: 2,
    title: "Creating a Drought-Tolerant Garden",
    excerpt:
      "Discover how to design a beautiful, water-wise garden that thrives in dry conditions with native and adapted plants.",
    image: "/drought-tolerant-garden-succulents.jpg",
    readTime: "12 min read",
    category: "Design",
  },
  {
    id: 3,
    title: "Best Plants for Low-Light Spaces",
    excerpt:
      "Transform dim corners and shaded areas with these resilient plants that flourish without direct sunlight.",
    image: "/low-light-plants-in-dark-room.jpg",
    readTime: "6 min read",
    category: "Selection",
  },
  {
    id: 4,
    title: "Propagating Your Favorite Plants",
    excerpt:
      "Master the art of plant propagation and multiply your collection with these simple techniques for various plant types.",
    image: "/plant-propagation-cuttings-in-water.jpg",
    readTime: "10 min read",
    category: "Tutorial",
  },
]

export function LatestGuides() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Expert Gardening Guides</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Learn from our experts and grow your gardening knowledge
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            All guides are written by experienced growers and horticultural specialists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map((guide) => (
            <Card
              key={guide.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg border-border"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={guide.image || "/placeholder.svg"}
                  alt={guide.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#87a96b] text-white px-3 py-1 rounded-md text-xs font-medium">
                    {guide.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-balance group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{guide.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{guide.readTime}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
