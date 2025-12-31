import { Card } from "@/components/ui/card"
import { Clock, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

type GuideSection = {
  heading: string
  text: string
}

type Guide = {
  title: string
  category: string
  readTime: string
  intro: string
  sections: GuideSection[]
  practicalTips?: string[]
  nurseryNote: string
  relatedLinks: { text: string; href: string }[]
}

export function GuideArticle({ guide }: { guide: Guide }) {
  return (
    <article className="py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2d5016] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all guides
        </Link>

        <div className="mb-8">
          <span className="inline-block bg-[#2d5016]/10 text-[#2d5016] px-3 py-1 rounded-md text-sm font-medium mb-4">
            {guide.category}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2d5016] mb-4 leading-tight text-balance">
            {guide.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{guide.readTime}</span>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-[#87a96b]/10 border-l-4 border-[#2d5016] p-6 mb-8">
            <p className="text-lg text-[#2c2c2c] leading-relaxed mb-0">{guide.intro}</p>
          </div>

          {guide.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">{section.heading}</h2>
              <p className="text-[#2c2c2c] leading-relaxed">{section.text}</p>
            </div>
          ))}

          {guide.practicalTips && guide.practicalTips.length > 0 && (
            <Card className="bg-[#faf9f6] border-[#87a96b]/30 p-6 my-8">
              <h3 className="font-semibold text-lg text-[#2d5016] mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Practical Tips
              </h3>
              <ul className="space-y-2 list-none p-0 m-0">
                {guide.practicalTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-[#2c2c2c]">
                    <span className="text-[#87a96b] mt-1">•</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-[#2d5016]/5 to-[#87a96b]/10 border-[#2d5016]/20 p-6 my-8">
            <h3 className="font-semibold text-lg text-[#2d5016] mb-3">From The Plant Nursery</h3>
            <p className="text-[#2c2c2c] leading-relaxed mb-0">{guide.nurseryNote}</p>
          </Card>

          {guide.relatedLinks && guide.relatedLinks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="font-semibold text-lg text-[#2d5016] mb-4">Related Resources</h3>
              <div className="flex flex-wrap gap-3">
                {guide.relatedLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="inline-flex items-center px-4 py-2 rounded-md border border-[#2d5016] text-[#2d5016] hover:bg-[#2d5016] hover:text-white transition-colors text-sm font-medium"
                  >
                    {link.text}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
