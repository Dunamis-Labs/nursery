import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How big will this plant grow?",
    answer:
      "Monstera Deliciosa can grow quite large indoors, typically reaching heights of 6-8 feet with proper care and support. The mature leaves can span 1-2 feet across when the plant receives adequate light and nutrients. You can control the size of your Monstera through regular pruning and by choosing an appropriately sized pot, as smaller containers naturally restrict growth. With ideal conditions and vertical support like a moss pole, some indoor Monstera plants can even reach 10 feet or more.",
  },
  {
    question: "Is this plant safe for pets?",
    answer:
      "No, Monstera Deliciosa is toxic to cats, dogs, and other household pets. The plant contains calcium oxalate crystals which cause oral irritation, excessive drooling, difficulty swallowing, and digestive upset if ingested. Keep your Monstera out of reach of curious pets by placing it on high shelves or in rooms pets don't access. If you suspect your pet has eaten any part of a Monstera, contact your veterinarian immediately.",
  },
  {
    question: "How often should I repot this plant?",
    answer:
      "Repot your Monstera Deliciosa every 1-2 years in spring when the plant is entering its active growing season. Signs your Monstera needs repotting include roots growing through drainage holes, water running straight through the pot without absorbing, or noticeably stunted growth despite proper care. When repotting, choose a container 2-3 inches larger in diameter than the current pot and use well-draining potting mix designed for tropical plants.",
  },
  {
    question: "Why aren't my leaves splitting?",
    answer:
      "Leaf splits, also called fenestrations, develop on Monstera Deliciosa as the plant matures and receives adequate bright, indirect light. Young plants under 2-3 years old naturally produce solid leaves without splits, which is completely normal. If your mature Monstera isn't developing splits, the most common cause is insufficient light - move it closer to a bright window but avoid direct sun. Additionally, ensure the plant is receiving proper nutrition through regular fertilizing during the growing season.",
  },
  {
    question: "What's your shipping and return policy?",
    answer:
      "We offer free shipping on all orders over $75, and plants are carefully packaged with protective materials to ensure safe arrival. Orders ship within 2-3 business days via our trusted carriers who specialize in live plant delivery. We stand behind our plants with a 30-day guarantee - if your Monstera arrives damaged, unhealthy, or doesn't thrive despite proper care, we'll replace it free of charge or issue a full refund. Simply contact our customer service team with photos within 30 days of delivery.",
  },
]

export function ProductFAQ() {
  return (
    <section className="mb-16">
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-border">
            <AccordionTrigger className="text-left font-semibold text-foreground hover:text-[#2d5016] hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
