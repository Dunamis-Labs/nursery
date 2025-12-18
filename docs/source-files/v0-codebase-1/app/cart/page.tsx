import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CartContent } from "@/components/cart-content"

export const metadata = {
  title: "Shopping Cart - The Plant Nursery",
  description: "Review your selected plants and garden supplies",
}

export default function CartPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8">Shopping Cart</h1>
          <CartContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}
