import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Leaf, Home, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl">
          {/* Large 404 with leaf decoration */}
          <div className="mb-8 relative">
            <h1 className="font-serif text-9xl md:text-[12rem] font-bold text-primary/10">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-secondary/20 rounded-full p-8">
                <Leaf className="h-16 w-16 md:h-24 md:w-24 text-primary" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Looks like this plant has wandered off to greener pastures. The page you're looking for doesn't exist or may
            have been moved.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-[#2d5016] hover:bg-[#2d5016]/90">
              <Link href="/">
                <Home className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/categories/indoor-plants">
                <Search className="h-5 w-5 mr-2" />
                Browse Plants
              </Link>
            </Button>
          </div>

          {/* Helpful links */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/categories/indoor-plants" className="text-primary hover:underline">
                Indoor Plants
              </Link>
              <Link href="/categories/outdoor-plants" className="text-primary hover:underline">
                Outdoor Plants
              </Link>
              <Link href="/plant-finder" className="text-primary hover:underline">
                Plant Finder
              </Link>
              <Link href="/#guides" className="text-primary hover:underline">
                Care Guides
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
