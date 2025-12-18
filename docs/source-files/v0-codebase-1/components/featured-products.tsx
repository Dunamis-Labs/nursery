import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    botanical: "Monstera deliciosa",
    price: 45.99,
    image: "/monstera-deliciosa-plant-pot.jpg",
  },
  {
    id: 2,
    name: "Snake Plant",
    botanical: "Sansevieria trifasciata",
    price: 32.99,
    image: "/snake-plant-sansevieria-pot.jpg",
  },
  {
    id: 3,
    name: "Fiddle Leaf Fig",
    botanical: "Ficus lyrata",
    price: 68.99,
    image: "/fiddle-leaf-fig-tree-pot.jpg",
  },
  {
    id: 4,
    name: "Peace Lily",
    botanical: "Spathiphyllum",
    price: 29.99,
    image: "/peace-lily-white-flower-pot.jpg",
  },
  {
    id: 5,
    name: "Rubber Plant",
    botanical: "Ficus elastica",
    price: 39.99,
    image: "/rubber-plant-ficus-elastica-pot.jpg",
  },
  {
    id: 6,
    name: "Pothos",
    botanical: "Epipremnum aureum",
    price: 24.99,
    image: "/pothos-hanging-plant-pot.jpg",
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Plants</h2>
            <p className="text-muted-foreground">Hand-picked favorites for your home</p>
          </div>
          <Button variant="ghost" className="hidden md:flex text-primary hover:text-primary/80">
            View All →
          </Button>
        </div>

        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-6 min-w-max md:min-w-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="flex-shrink-0 w-64 md:w-auto group cursor-pointer overflow-hidden transition-all hover:shadow-lg border-border"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                  <p className="text-sm font-mono italic text-muted-foreground mb-3">{product.botanical}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">${product.price}</span>
                    <Button size="sm" className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white">
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button variant="outline" className="w-full max-w-xs bg-transparent">
            View All Plants
          </Button>
        </div>
      </div>
    </section>
  )
}
