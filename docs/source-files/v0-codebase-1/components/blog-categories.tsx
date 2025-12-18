import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import Link from "next/link"

const blogPosts = [
  // Choosing Plants
  {
    id: "why-some-trees-struggle-after-planting",
    category: "Choosing Plants",
    title: "Why Some Trees Struggle After Planting",
    summary:
      "Understanding the gap between nursery conditions and garden reality helps explain why some trees take longer to establish than expected.",
    readTime: "7 min read",
  },
  {
    id: "how-to-choose-tree-for-privacy",
    category: "Choosing Plants",
    title: "How to Choose a Tree for Privacy",
    summary:
      "Privacy screening involves tradeoffs between speed, density, maintenance, and long-term scale that aren't always obvious at purchase time.",
    readTime: "9 min read",
  },
  {
    id: "what-low-light-really-means-indoors",
    category: "Choosing Plants",
    title: "What Low Light Really Means Indoors",
    summary:
      "The term 'low light plant' creates confusion because indoor light levels are dramatically lower than most people realize.",
    readTime: "6 min read",
  },

  // Seasonal Gardening
  {
    id: "why-autumn-is-best-for-planting-trees",
    category: "Seasonal Gardening",
    title: "Why Autumn Is Best for Planting Trees in Australia",
    summary:
      "Autumn planting allows trees to establish roots during cooler months before facing the stress of their first summer.",
    readTime: "8 min read",
  },
  {
    id: "managing-plants-through-summer-heat",
    category: "Seasonal Gardening",
    title: "Managing Plants Through Australian Summer Heat",
    summary:
      "Extreme heat affects even drought-tolerant plants, and understanding their limits helps prevent irreversible damage.",
    readTime: "10 min read",
  },
  {
    id: "what-happens-to-plants-in-winter",
    category: "Seasonal Gardening",
    title: "What Happens to Plants in Winter",
    summary:
      "Dormancy is often misunderstood as plant death, but it's actually an active survival strategy with specific care needs.",
    readTime: "7 min read",
  },

  // Trees & Landscaping
  {
    id: "how-big-will-this-tree-actually-get",
    category: "Trees & Landscaping",
    title: "How Big Will This Tree Actually Get",
    summary:
      "Mature tree size is one of the most commonly underestimated factors in landscape planning, with consequences that appear years later.",
    readTime: "8 min read",
  },
  {
    id: "why-native-trees-arent-always-low-maintenance",
    category: "Trees & Landscaping",
    title: "Why Native Trees Aren't Always Low Maintenance",
    summary:
      "The assumption that native plants require no care ignores the reality of garden microclimates and planting context.",
    readTime: "9 min read",
  },

  // Indoor Growing
  {
    id: "why-indoor-plants-fail-in-winter",
    category: "Indoor Growing",
    title: "Why Indoor Plants Often Fail in Winter",
    summary:
      "Reduced light, dry air, and continued watering create a mismatch between plant dormancy and owner expectations during colder months.",
    readTime: "8 min read",
  },
  {
    id: "understanding-humidity-for-indoor-plants",
    category: "Indoor Growing",
    title: "Understanding Humidity for Indoor Plants",
    summary:
      "Humidity affects tropical plants more than most other factors, but the solutions aren't always practical in typical homes.",
    readTime: "7 min read",
  },

  // Common Questions
  {
    id: "should-you-remove-flowers-from-new-plants",
    category: "Common Questions",
    title: "Should You Remove Flowers from New Plants",
    summary:
      "The advice to remove flowers from newly planted specimens confuses many gardeners, but it's based on sound root development principles.",
    readTime: "6 min read",
  },
  {
    id: "why-are-my-plants-leaves-turning-yellow",
    category: "Common Questions",
    title: "Why Are My Plant's Leaves Turning Yellow",
    summary:
      "Yellow leaves signal multiple different problems, and jumping to the wrong conclusion often makes the situation worse.",
    readTime: "8 min read",
  },

  // Behind the Nursery
  {
    id: "how-we-source-and-test-plants",
    category: "Behind the Nursery",
    title: "How We Source and Test Plants",
    summary:
      "Not every plant that grows well in commercial production performs reliably in home gardens, which shapes our selection decisions.",
    readTime: "9 min read",
  },
  {
    id: "what-we-wish-customers-knew-before-buying",
    category: "Behind the Nursery",
    title: "What We Wish Customers Knew Before Buying",
    summary:
      "Certain questions and expectations come up repeatedly, and addressing them upfront helps ensure better plant outcomes.",
    readTime: "7 min read",
  },
]

const categoryDescriptions: Record<string, string> = {
  "Choosing Plants": "Guidance on plant selection decisions and what factors matter most in different contexts.",
  "Seasonal Gardening": "How seasonal changes affect plant care and timing decisions throughout the year.",
  "Trees & Landscaping": "Considerations for larger plants and long-term landscape planning.",
  "Indoor Growing": "Understanding the unique challenges of growing plants inside homes.",
  "Common Questions": "Clear explanations for frequently misunderstood plant care topics.",
  "Behind the Nursery": "Insights into how we select, grow, and support the plants we sell.",
}

export function BlogCategories() {
  const categories = [...new Set(blogPosts.map((post) => post.category))]

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {categories.map((category) => (
          <div key={category} className="mb-16 last:mb-0">
            <div className="mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2d5016] mb-2">{category}</h2>
              <p className="text-sm text-muted-foreground">{categoryDescriptions[category]}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts
                .filter((post) => post.category === category)
                .map((post) => (
                  <Link key={post.id} href={`/blog/${post.id}`}>
                    <Card className="h-full p-6 hover:shadow-lg transition-all border-border group cursor-pointer">
                      <div className="flex flex-col h-full">
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
          </div>
        ))}
      </div>
    </section>
  )
}
