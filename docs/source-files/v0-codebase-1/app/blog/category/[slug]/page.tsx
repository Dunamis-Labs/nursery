import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BlogContent } from "@/components/blog-content"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const categoryDescriptions: Record<string, { name: string; description: string; longDescription: string }> = {
  "choosing-plants": {
    name: "Choosing Plants",
    description: "Guidance on plant selection decisions and what factors matter most in different contexts.",
    longDescription:
      "These articles help you make informed decisions when selecting plants by explaining the real-world tradeoffs and considerations that matter beyond basic care requirements. We focus on matching plants to actual conditions and realistic expectations.",
  },
  "seasonal-gardening": {
    name: "Seasonal Gardening",
    description: "How seasonal changes affect plant care and timing decisions throughout the year.",
    longDescription:
      "Understanding how seasons affect plants in Australian climates helps you time planting, adjust care routines, and set appropriate expectations. These articles explain seasonal plant behavior and optimal timing for garden activities.",
  },
}

export default function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { page?: string }
}) {
  const categorySlug = params.slug
  const categoryInfo = categoryDescriptions[categorySlug]

  if (!categoryInfo) {
    return <div>Category not found</div>
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        {/* Category header */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <Link href="/blog">
              <Button variant="ghost" className="mb-6 hover:bg-[#87a96b]/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to all articles
              </Button>
            </Link>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2d5016] mb-4">{categoryInfo.name}</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">{categoryInfo.longDescription}</p>
          </div>
        </section>

        <BlogContent selectedCategory={categoryInfo.name} currentPage={Number(searchParams.page) || 1} />
      </main>
      <Footer />
    </div>
  )
}
