import { HeroSection } from "@/components/hero-section"
import { CategoryGrid } from "@/components/category-grid"
import { ShopByPurpose } from "@/components/shop-by-purpose"
import { FeaturedProducts } from "@/components/featured-products"
import { LatestGuides } from "@/components/latest-guides"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <CategoryGrid />
        <ShopByPurpose />
        <FeaturedProducts />
        <LatestGuides />
      </main>
      <Footer />
    </div>
  )
}
