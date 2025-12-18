import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CheckoutForm } from "@/components/checkout-form"

export const metadata = {
  title: "Checkout - The Plant Nursery",
  description: "Complete your order securely",
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground mb-8">Complete your order securely with Stripe</p>
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
