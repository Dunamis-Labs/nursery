import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/layout/footer"
import { CartContent } from "@/components/cart-content"

export const metadata = {
  title: "Shopping Cart - The Plant Nursery",
  description: "Review your selected plants and garden supplies",
}

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2d5016] mb-8">Shopping Cart</h1>
          <CartContent />
        </div>
      </main>
      <Footer />
    </div>
  )
}

