"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Search } from "lucide-react"
import Link from "next/link"
import { useState, useMemo } from "react"

const blogPosts = [
  // Choosing Plants
  {
    id: "why-some-trees-struggle-after-planting",
    category: "Choosing Plants",
    title: "Why Some Trees Struggle After Planting",
    summary:
      "Understanding the gap between nursery conditions and garden reality helps explain why some trees take longer to establish than expected.",
    readTime: "7 min read",
    date: "2024-12-10",
  },
  {
    id: "how-to-choose-tree-for-privacy",
    category: "Choosing Plants",
    title: "How to Choose a Tree for Privacy",
    summary:
      "Privacy screening involves tradeoffs between speed, density, maintenance, and long-term scale that aren't always obvious at purchase time.",
    readTime: "9 min read",
    date: "2024-12-08",
  },
  {
    id: "what-low-light-really-means-indoors",
    category: "Choosing Plants",
    title: "What Low Light Really Means Indoors",
    summary:
      "The term 'low light plant' creates confusion because indoor light levels are dramatically lower than most people realize.",
    readTime: "6 min read",
    date: "2024-12-05",
  },
  {
    id: "why-autumn-is-best-for-planting-trees",
    category: "Seasonal Gardening",
    title: "Why Autumn Is Best for Planting Trees in Australia",
    summary:
      "Autumn planting allows trees to establish roots during cooler months before facing the stress of their first summer.",
    readTime: "8 min read",
    date: "2024-12-03",
  },
  {
    id: "managing-plants-through-summer-heat",
    category: "Seasonal Gardening",
    title: "Managing Plants Through Australian Summer Heat",
    summary:
      "Extreme heat affects even drought-tolerant plants, and understanding their limits helps prevent irreversible damage.",
    readTime: "10 min read",
    date: "2024-11-28",
  },
  {
    id: "what-happens-to-plants-in-winter",
    category: "Seasonal Gardening",
    title: "What Happens to Plants in Winter",
    summary:
      "Dormancy is often misunderstood as plant death, but it's actually an active survival strategy with specific care needs.",
    readTime: "7 min read",
    date: "2024-11-25",
  },
  {
    id: "how-big-will-this-tree-actually-get",
    category: "Trees & Landscaping",
    title: "How Big Will This Tree Actually Get",
    summary:
      "Mature tree size is one of the most commonly underestimated factors in landscape planning, with consequences that appear years later.",
    readTime: "8 min read",
    date: "2024-11-20",
  },
  {
    id: "why-native-trees-arent-always-low-maintenance",
    category: "Trees & Landscaping",
    title: "Why Native Trees Aren't Always Low Maintenance",
    summary:
      "The assumption that native plants require no care ignores the reality of garden microclimates and planting context.",
    readTime: "9 min read",
    date: "2024-11-18",
  },
  {
    id: "why-indoor-plants-fail-in-winter",
    category: "Indoor Growing",
    title: "Why Indoor Plants Often Fail in Winter",
    summary:
      "Reduced light, dry air, and continued watering create a mismatch between plant dormancy and owner expectations during colder months.",
    readTime: "8 min read",
    date: "2024-11-15",
  },
  {
    id: "understanding-humidity-for-indoor-plants",
    category: "Indoor Growing",
    title: "Understanding Humidity for Indoor Plants",
    summary:
      "Humidity affects tropical plants more than most other factors, but the solutions aren't always practical in typical homes.",
    readTime: "7 min read",
    date: "2024-11-12",
  },
  {
    id: "should-you-remove-flowers-from-new-plants",
    category: "Common Questions",
    title: "Should You Remove Flowers from New Plants",
    summary:
      "The advice to remove flowers from newly planted specimens confuses many gardeners, but it's based on sound root development principles.",
    readTime: "6 min read",
    date: "2024-11-08",
  },
  {
    id: "why-are-my-plants-leaves-turning-yellow",
    category: "Common Questions",
    title: "Why Are My Plant's Leaves Turning Yellow",
    summary:
      "Yellow leaves signal multiple different problems, and jumping to the wrong conclusion often makes the situation worse.",
    readTime: "8 min read",
    date: "2024-11-05",
  },
  {
    id: "how-we-source-and-test-plants",
    category: "Behind the Nursery",
    title: "How We Source and Test Plants",
    summary:
      "Not every plant that grows well in commercial production performs reliably in home gardens, which shapes our selection decisions.",
    readTime: "9 min read",
    date: "2024-11-01",
  },
  {
    id: "what-we-wish-customers-knew-before-buying",
    category: "Behind the Nursery",
    title: "What We Wish Customers Knew Before Buying",
    summary:
      "Certain questions and expectations come up repeatedly, and addressing them upfront helps ensure better plant outcomes.",
    readTime: "7 min read",
    date: "2024-10-28",
  },
]

const categoryDescriptions: Record<string, string> = {
  All: "Browse all articles from our nursery team",
  "Choosing Plants": "Guidance on plant selection decisions and what factors matter most in different contexts.",
  "Seasonal Gardening": "How seasonal changes affect plant care and timing decisions throughout the year.",
  "Trees & Landscaping": "Considerations for larger plants and long-term landscape planning.",
  "Indoor Growing": "Understanding the unique challenges of growing plants inside homes.",
  "Common Questions": "Clear explanations for frequently misunderstood plant care topics.",
  "Behind the Nursery": "Insights into how we select, grow, and support the plants we sell.",
}

const POSTS_PER_PAGE = 12

export function BlogContent({
  selectedCategory,
  currentPage = 1,
}: {
  selectedCategory?: string
  currentPage?: number
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const activeCategory = selectedCategory || "All"

  const filteredPosts = useMemo(() => {
    let filtered = blogPosts

    // Filter by category
    if (activeCategory !== "All") {
      filtered = filtered.filter((post) => post.category === activeCategory)
    }

    // Search by title or summary
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) => post.title.toLowerCase().includes(query) || post.summary.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [activeCategory, searchQuery])

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

  const categories = ["All", ...new Set(blogPosts.map((post) => post.category))]

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const categoryCount =
                  category === "All" ? blogPosts.length : blogPosts.filter((post) => post.category === category).length

                return (
                  <Link
                    key={category}
                    href={`/blog${category !== "All" ? `?category=${encodeURIComponent(category)}` : ""}`}
                    scroll={false}
                  >
                    <Button
                      variant={activeCategory === category ? "default" : "outline"}
                      className={
                        activeCategory === category
                          ? "bg-[#2d5016] hover:bg-[#2d5016]/90 text-white"
                          : "hover:bg-[#87a96b]/10"
                      }
                    >
                      {category} ({categoryCount})
                    </Button>
                  </Link>
                )
              })}
            </div>

            <div className="relative w-full md:w-auto md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {categoryDescriptions[activeCategory]}
            {searchQuery && ` • Found ${filteredPosts.length} result${filteredPosts.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} articles
          </p>
        </div>

        {paginatedPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {paginatedPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <Card className="h-full p-6 hover:shadow-lg transition-all border-border group cursor-pointer">
                    <div className="flex flex-col h-full">
                      <div className="mb-3">
                        <span className="text-xs font-medium text-[#87a96b]">{post.category}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-3 text-[#2c2c2c] group-hover:text-[#2d5016] transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-grow">{post.summary}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Link
                  href={`/blog?${new URLSearchParams({
                    ...(activeCategory !== "All" && { category: activeCategory }),
                    page: String(Math.max(1, currentPage - 1)),
                  }).toString()}`}
                  scroll={false}
                >
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    className="hover:bg-[#87a96b]/10 bg-transparent"
                  >
                    Previous
                  </Button>
                </Link>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/blog?${new URLSearchParams({
                          ...(activeCategory !== "All" && { category: activeCategory }),
                          page: String(pageNum),
                        }).toString()}`}
                        scroll={false}
                      >
                        <Button
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className={
                            currentPage === pageNum
                              ? "bg-[#2d5016] hover:bg-[#2d5016]/90 text-white w-10"
                              : "hover:bg-[#87a96b]/10 w-10"
                          }
                        >
                          {pageNum}
                        </Button>
                      </Link>
                    )
                  })}
                </div>

                <Link
                  href={`/blog?${new URLSearchParams({
                    ...(activeCategory !== "All" && { category: activeCategory }),
                    page: String(Math.min(totalPages, currentPage + 1)),
                  }).toString()}`}
                  scroll={false}
                >
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    className="hover:bg-[#87a96b]/10 bg-transparent"
                  >
                    Next
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No articles found matching your search.</p>
            <Button variant="outline" onClick={() => setSearchQuery("")} className="hover:bg-[#87a96b]/10">
              Clear search
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
