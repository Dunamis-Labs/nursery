import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BlogIntro } from "@/components/blog-intro"
import { BlogContent } from "@/components/blog-content"

export const metadata = {
  title: "From the Nursery - Plant Care Insights & Perspectives | The Plant Nursery",
  description:
    "Thoughtful explanations about plant care decisions, seasonal considerations, and real-world observations from running an Australian plant nursery.",
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string }
}) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <BlogIntro />
        <BlogContent selectedCategory={searchParams.category} currentPage={Number(searchParams.page) || 1} />
      </main>
      <Footer />
    </div>
  )
}
