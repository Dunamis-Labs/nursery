import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const relatedProducts = [
  {
    id: "2",
    name: "Fiddle Leaf Fig",
    botanical: "Ficus lyrata",
    price: 68.99,
    image: "/fiddle-leaf-fig-tree-pot.jpg",
  },
  {
    id: "3",
    name: "Bird of Paradise",
    botanical: "Strelitzia reginae",
    price: 52.99,
    image: "/bird-of-paradise-plant-pot.jpg",
  },
  {
    id: "4",
    name: "Rubber Plant",
    botanical: "Ficus elastica",
    price: 39.99,
    image: "/rubber-plant-ficus-elastica-pot.jpg",
  },
  {
    id: "5",
    name: "Philodendron Brasil",
    botanical: "Philodendron hederaceum",
    price: 34.99,
    image: "/philodendron-brasil-hanging-plant.jpg",
  },
  {
    id: "6",
    name: "ZZ Plant",
    botanical: "Zamioculcas zamiifolia",
    price: 42.99,
    image: "/zz-plant-zamioculcas-pot.jpg",
  },
]

interface RelatedProductsProps {
  currentProductId: string
}

export function RelatedProducts({ currentProductId }: RelatedProductsProps) {
  return (
    <section>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">You May Also Like</h2>

      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-6 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
          {relatedProducts.map((product) => (
            <Card
              key={product.id}
              className="flex-shrink-0 w-64 lg:w-auto group cursor-pointer overflow-hidden transition-all hover:shadow-lg border-border"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                <p className="text-sm font-mono italic text-muted-foreground mb-3">{product.botanical}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-[#2d5016]">${product.price.toFixed(2)}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-[#87a96b] hover:text-white hover:border-[#87a96b] bg-transparent"
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
