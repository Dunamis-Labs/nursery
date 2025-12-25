import { Card } from "@/components/ui/card";
import { Clock, Droplets, Sun, Home, AlertCircle, Package } from "lucide-react";
import Link from "next/link";

const coreGuides = [
  {
    id: "watering",
    title: "How to Water Plants Properly",
    description:
      "Learn when plants actually need water and how to avoid the most common watering mistakes that kill houseplants.",
    readTime: "7 min read",
    icon: Droplets,
  },
  {
    id: "light-levels",
    title: "Understanding Light Levels (Low, Medium, Bright)",
    description: "Identify the actual light conditions in your space and match them to plants that will thrive there.",
    readTime: "6 min read",
    icon: Sun,
  },
  {
    id: "choosing-plants",
    title: "Choosing the Right Plant for Your Space",
    description: "Match plants to your lifestyle, available light, and maintenance capacity for long-term success.",
    readTime: "8 min read",
    icon: Home,
  },
  {
    id: "plant-problems",
    title: "Common Plant Problems and How to Fix Them",
    description: "Identify yellow leaves, brown tips, drooping stems, and other issues with clear solutions that work.",
    readTime: "10 min read",
    icon: AlertCircle,
  },
  {
    id: "repotting",
    title: "Repotting Plants: When and Why",
    description: "Recognize when plants need repotting and how to do it without shocking the plant or damaging roots.",
    readTime: "9 min read",
    icon: Package,
  },
];

export function CoreCareGuides() {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Plant Care Basics</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Foundational knowledge for keeping plants alive and healthy in real-world conditions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link key={guide.id} href={`/guides/${guide.id}`}>
                <Card className="h-full p-6 hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 text-balance group-hover:text-primary transition-colors">
                        {guide.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{guide.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{guide.readTime}</span>
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

