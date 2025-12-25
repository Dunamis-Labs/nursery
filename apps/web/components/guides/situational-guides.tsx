"use client";

import { Card } from "@/components/ui/card";
import { Clock, Moon, Sprout, PawPrint, Maximize2, TrendingUp } from "lucide-react";
import Link from "next/link";

const situationalGuides = [
  {
    id: "low-light-plants",
    title: "Best Plants for Low-Light Homes",
    description:
      "For spaces with limited natural light or north-facing windows. Helps you choose plants that survive and grow in dim conditions.",
    readTime: "8 min read",
    icon: Moon,
    finderLink: true,
  },
  {
    id: "beginner-plants",
    title: "Best Plants for Beginners",
    description:
      "For first-time plant owners who want reliable success. Focuses on forgiving plants that tolerate mistakes.",
    readTime: "7 min read",
    icon: Sprout,
    finderLink: true,
  },
  {
    id: "pet-safe-plants",
    title: "Pet-Safe Indoor Plants",
    description: "For homes with cats or dogs. Identifies non-toxic plants that won't harm curious pets.",
    readTime: "6 min read",
    icon: PawPrint,
    finderLink: true,
  },
  {
    id: "small-spaces",
    title: "Plants for Small Spaces",
    description: "For apartments, studios, or compact areas. Compact plants that make an impact without taking over.",
    readTime: "7 min read",
    icon: Maximize2,
    finderLink: true,
  },
  {
    id: "fast-growing",
    title: "Fast-Growing Statement Plants",
    description: "For impatient growers who want visible progress. Plants that show dramatic growth in the first year.",
    readTime: "8 min read",
    icon: TrendingUp,
    finderLink: true,
  },
];

export function SituationalGuides() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto">
        <div className="mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Choosing the Right Plant</h2>
          <p className="text-muted-foreground text-lg max-w-3xl">
            Decision guides aligned with common situations and constraints
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {situationalGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Link key={guide.id} href={`/guides/${guide.id}`}>
                <Card className="p-6 hover:shadow-lg transition-all hover:border-secondary/50 cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/30 transition-colors">
                      <Icon className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 text-balance group-hover:text-secondary transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{guide.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{guide.readTime}</span>
                        </div>
                        {guide.finderLink && (
                          <Link
                            href="/plant-finder"
                            className="text-xs text-secondary hover:text-primary transition-colors font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Try Plant Finder →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/plant-finder"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-secondary transition-colors"
          >
            Not sure what you need? Use our Plant Finder tool →
          </Link>
        </div>
      </div>
    </section>
  );
}

