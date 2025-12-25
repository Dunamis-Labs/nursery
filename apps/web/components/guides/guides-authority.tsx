import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export function GuidesAuthority() {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <Card className="p-8 md:p-12 border-primary/20 bg-gradient-to-br from-background to-muted/30">
          <div className="flex items-start gap-6">
            <div className="hidden md:block w-16 h-16 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                How Our Guides Are Written
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Our guides are written to reflect how plants actually perform in homes and gardens, not ideal
                  greenhouse conditions. Advice focuses on what works consistently for most people in typical household
                  environments where light, temperature, and humidity vary.
                </p>
                <p>
                  Each recommendation is based on observed plant behavior across diverse growing conditions. We
                  prioritize plants that show clear, predictable responses to care adjustments and forgive the imperfect
                  conditions found in real living spaces. The goal is reliable success through plants that adapt rather
                  than require perfection.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

