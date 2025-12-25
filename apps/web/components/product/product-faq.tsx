import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Default FAQs as fallback
const defaultFaqs = [
  {
    question: "How big will this plant grow?",
    answer:
      "Plant size varies by species and growing conditions. Check the product specifications for mature height and width information. Most plants can be controlled through regular pruning and appropriate pot sizing.",
  },
  {
    question: "Is this plant safe for pets?",
    answer:
      "Plant toxicity varies by species. Please check the product specifications for toxicity information. If you have pets, we recommend keeping plants out of reach or choosing pet-safe varieties.",
  },
  {
    question: "How often should I repot this plant?",
    answer:
      "Most plants benefit from repotting every 1-2 years in spring when they're entering their active growing season. Signs your plant needs repotting include roots growing through drainage holes or water running straight through without absorbing.",
  },
  {
    question: "Why aren't my leaves splitting?",
    answer:
      "Leaf characteristics develop as plants mature and receive adequate light. Young plants naturally produce different leaves than mature specimens. Ensure your plant receives proper light, nutrition, and care as specified in the care instructions.",
  },
  {
    question: "What's your shipping and return policy?",
    answer:
      "We offer free shipping on all orders over $75, and plants are carefully packaged with protective materials to ensure safe arrival. Orders ship within 2-3 business days via our trusted carriers who specialize in live plant delivery. We stand behind our plants with a 30-day guarantee - if your plant arrives damaged, unhealthy, or doesn't thrive despite proper care, we'll replace it free of charge or issue a full refund.",
  },
]

interface ProductFAQProps {
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
    displayOrder: number;
  }>;
}

export function ProductFAQ({ faqs }: ProductFAQProps) {
  // Use database FAQs if available, otherwise fallback to defaults
  const displayFaqs = faqs && faqs.length > 0 
    ? faqs.map(faq => ({ question: faq.question, answer: faq.answer }))
    : defaultFaqs;

  if (displayFaqs.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {displayFaqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-border">
            <AccordionTrigger className="text-left font-semibold text-foreground hover:text-[#2d5016] hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {(() => {
                // Render markdown bold (**text**) as <strong>
                const renderMarkdown = (text: string) => {
                  const parts = text.split(/(\*\*[^*]+\*\*)/g);
                  return parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={i}>{part}</span>;
                  });
                };
                return renderMarkdown(faq.answer);
              })()}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
