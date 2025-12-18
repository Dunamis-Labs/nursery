import { Card } from "@/components/ui/card"
import { Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

type ArticleContent = {
  heading: string
  text: string
}

type Article = {
  title: string
  category: string
  readTime: string
  intro: string
  content: ArticleContent[]
  nurseryNote: string
  relatedLinks: { text: string; href: string }[]
}

export function BlogArticle({ article }: { article: Article }) {
  return (
    <article className="py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[#2d5016] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all articles
        </Link>

        <div className="mb-6">
          <span className="inline-block bg-[#87a96b]/20 text-[#2d5016] px-3 py-1 rounded-md text-sm font-medium mb-4">
            {article.category}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#2d5016] mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{article.readTime}</span>
          </div>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-[#2c2c2c] leading-relaxed mb-8 pb-8 border-b border-border">{article.intro}</p>

          {article.content.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="font-serif text-2xl font-bold text-[#2d5016] mb-4">{section.heading}</h2>
              <p className="text-[#2c2c2c] leading-relaxed">{section.text}</p>
            </div>
          ))}

          <Card className="bg-[#faf9f6] border-[#87a96b]/30 p-6 my-8">
            <h3 className="font-semibold text-lg text-[#2d5016] mb-3">How We Think About This at the Nursery</h3>
            <p className="text-[#2c2c2c] leading-relaxed">{article.nurseryNote}</p>
          </Card>

          {article.relatedLinks && article.relatedLinks.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <h3 className="font-semibold text-lg text-[#2d5016] mb-4">Related Resources</h3>
              <div className="flex flex-wrap gap-3">
                {article.relatedLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="inline-flex items-center px-4 py-2 rounded-md border border-[#87a96b] text-[#2d5016] hover:bg-[#87a96b]/10 transition-colors text-sm font-medium"
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
