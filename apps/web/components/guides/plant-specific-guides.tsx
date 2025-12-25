import { Card } from "@/components/ui/card";
import { Clock, TreeDeciduous, TreePine, Palmtree, Sun } from "lucide-react";
import Link from "next/link";

const plantSpecificGuides = [
  {
    id: "indoor-trees",
    title: "How to Care for Indoor Trees",
    description:
      "Large statement plants like Fiddle Leaf Figs, Rubber Plants, and Money Trees that need different care than smaller houseplants.",
    readTime: "10 min read",
    icon: TreeDeciduous,
    category: "Indoor Plants",
  },
  {
    id: "outdoor-trees",
    title: "How to Care for Outdoor Trees",
    description: "Establishing and maintaining trees in gardens and landscapes, from planting to seasonal maintenance.",
    readTime: "12 min read",
    icon: TreePine,
    category: "Outdoor Plants",
  },
  {
    id: "tropical-plants",
    title: "Caring for Tropical Plants Indoors",
    description:
      "Monstera, Pothos, Philodendron, and other tropical species adapted to typical household humidity and light.",
    readTime: "9 min read",
    icon: Palmtree,
    category: "Indoor Plants",
  },
  {
    id: "drought-tolerant",
    title: "Caring for Drought-Tolerant Plants",
    description: "Succulents, cacti, and other plants adapted to infrequent watering and dry conditions.",
    readTime: "8 min read",
    icon: Sun,
    category: "Succulents",
  },
];

export function PlantSpecificGuides() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Plant-Specific Care</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Deep-dive care instructions for specific plant types and categories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plantSpecificGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link key={guide.id} href={`/guides/${guide.id}`}>
                <Card className="p-6 hover:shadow-lg transition-all hover:border-accent/50 cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/30 transition-colors">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-balance group-hover:text-accent transition-colors">
                          {guide.title}
                        </h3>
                        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-md whitespace-nowrap ml-2">
                          {guide.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{guide.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{guide.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

