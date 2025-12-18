import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BlogArticle } from "@/components/blog-article"
import { notFound } from "next/navigation"

const articles: Record<string, any> = {
  "why-some-trees-struggle-after-planting": {
    title: "Why Some Trees Struggle After Planting",
    category: "Choosing Plants",
    readTime: "7 min read",
    intro:
      "Many customers express concern when newly planted trees show signs of stress or slow growth in their first year. This situation is common and often misunderstood as a problem with the tree itself.",
    content: [
      {
        heading: "The Nursery-to-Garden Transition",
        text: "Trees grown in nursery containers experience highly controlled conditions. Regular watering, optimal fertilizer, and protection from extreme weather create an environment that supports rapid growth. When planted in a garden, trees encounter variable soil, inconsistent moisture, exposure to wind, and competition from surrounding plants. This transition requires significant energy for root system expansion and adaptation.",
      },
      {
        heading: "Root Development Takes Priority",
        text: "After planting, trees redirect energy toward establishing roots rather than producing visible top growth. This period can last six months to two years depending on tree size and species. During this time, minimal leaf or branch growth is normal and expected. Trees that push new shoots too quickly may struggle later because they haven't developed adequate root systems to support that growth through dry periods.",
      },
      {
        heading: "Species Variation in Establishment",
        text: "Different tree species establish at different rates. Fast-growing species like eucalyptus may show rapid adaptation within months. Slower species like conifers or deciduous fruit trees often take longer to resume vigorous growth. Understanding these patterns helps set realistic expectations and prevents unnecessary intervention.",
      },
      {
        heading: "Common Mistakes That Delay Establishment",
        text: "Over-watering is the most frequent error with newly planted trees. While consistent moisture is important, soggy soil prevents root oxygen access and encourages root rot. Another common issue is excessive fertilizer application. Trees establishing new roots cannot efficiently use heavy nutrients, and excess fertilizer can damage developing root tips. The best approach is consistent moisture, mulch to moderate soil temperature, and patience.",
      },
    ],
    nurseryNote:
      "We see this concern frequently during the first growing season after sale. Trees that appear to struggle initially often become the strongest performers once their root systems adapt to garden conditions.",
    relatedLinks: [
      { text: "Tree Care Guide", href: "/guides#tree-care" },
      { text: "Find Trees & Shrubs", href: "/categories/trees-shrubs" },
    ],
  },
  "what-low-light-really-means-indoors": {
    title: "What Low Light Really Means Indoors",
    category: "Choosing Plants",
    readTime: "6 min read",
    intro:
      "The term 'low light plant' causes considerable confusion because people assume it means plants will thrive in any dim indoor space. The reality is more nuanced and involves understanding how light indoors compares to outdoor conditions.",
    content: [
      {
        heading: "Indoor Light Is Much Lower Than You Think",
        text: "Even a bright room with large windows receives only 10-20% of the light available outdoors on an overcast day. What feels bright to human eyes registers as quite dim to plants because our vision adapts to low light better than photosynthesis does. A 'low light' plant doesn't mean it prefers darkness - it means it can tolerate significantly reduced light compared to most other plants.",
      },
      {
        heading: "Distance from Windows Matters Dramatically",
        text: "Light intensity drops rapidly as distance from a window increases. A plant placed two meters from a window receives roughly half the light of one placed one meter away. By the time you're three to four meters from a window, light levels are often insufficient even for 'low light' species. This explains why plants positioned far from windows often decline regardless of their stated light tolerance.",
      },
      {
        heading: "What Low Light Plants Actually Tolerate",
        text: "Plants labeled as low light tolerant - such as pothos, snake plants, or cast iron plants - evolved in forest understories where they receive filtered, indirect light. They can survive in reduced indoor light, but 'survive' and 'thrive' are different states. These plants will maintain their foliage and basic health in low light but often won't produce new growth or achieve their full potential unless given brighter conditions.",
      },
      {
        heading: "Signs Your Light Is Too Low",
        text: "Plants in insufficient light exhibit specific symptoms. New growth becomes pale, smaller, and spaced further apart on stems. Variegated varieties lose their patterns and revert to solid green. Stems stretch toward light sources and become leggy. Eventually, lower leaves yellow and drop. These signs indicate the plant is depleting stored energy faster than photosynthesis can replenish it.",
      },
    ],
    nurseryNote:
      "When customers describe their space as 'low light,' we ask specific questions about window proximity and direction. This helps identify whether the space suits true low-light species or whether expectations need adjustment.",
    relatedLinks: [
      { text: "Indoor Plant Care Guide", href: "/guides#indoor-care" },
      { text: "Plant Finder", href: "/plant-finder" },
      { text: "Browse Indoor Plants", href: "/categories/indoor-plants" },
    ],
  },
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const article = articles[slug]

  if (!article) {
    return {
      title: "Article Not Found | The Plant Nursery",
    }
  }

  return {
    title: `${article.title} | From the Nursery`,
    description: article.intro,
  }
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = articles[slug]

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <BlogArticle article={article} />
      </main>
      <Footer />
    </div>
  )
}
