import { Card } from "@/components/ui/card"
import { Leaf, TreeDeciduous, Carrot, Flower2, Sprout, Shield, Sun, Droplets } from "lucide-react"

const purposes = [
  { name: "Privacy", icon: Shield, color: "bg-[#87a96b]" },
  { name: "Shade", icon: TreeDeciduous, color: "bg-[#87a96b]" },
  { name: "Edible", icon: Carrot, color: "bg-[#87a96b]" },
  { name: "Flowering", icon: Flower2, color: "bg-[#87a96b]" },
  { name: "Native", icon: Leaf, color: "bg-[#87a96b]" },
  { name: "Drought Tolerant", icon: Sun, color: "bg-[#87a96b]" },
  { name: "Water Plants", icon: Droplets, color: "bg-[#87a96b]" },
  { name: "Fast Growing", icon: Sprout, color: "bg-[#87a96b]" },
]

export function ShopByPurpose() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-8 text-center md:text-left">
          Shop by Purpose
        </h2>
        <p className="text-muted-foreground mb-6 text-center md:text-left">
          Find plants based on what you want to achieve in your garden or home.
        </p>

        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-4 lg:grid-cols-8">
            {purposes.map((purpose) => {
              const Icon = purpose.icon
              return (
                <Card
                  key={purpose.name}
                  className="flex-shrink-0 w-32 md:w-auto cursor-pointer transition-all hover:shadow-md border-border"
                >
                  <div className="p-6 flex flex-col items-center gap-3">
                    <div
                      className={`${purpose.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-center">{purpose.name}</span>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
