"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, X, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock cart data - in production this would come from a state management solution
const initialCartItems = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    botanical: "Monstera deliciosa",
    price: 45.99,
    quantity: 1,
    size: 'Medium (6" pot)',
    image: "/monstera-deliciosa-full-plant-pot.jpg",
  },
  {
    id: 2,
    name: "Snake Plant",
    botanical: "Sansevieria trifasciata",
    price: 32.99,
    quantity: 2,
    size: 'Small (4" pot)',
    image: "/snake-plant-sansevieria-pot.jpg",
  },
]

export function CartContent() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [promoCode, setPromoCode] = useState("")

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 12.95
  const total = subtotal + shipping

  if (cartItems.length === 0) {
    return (
      <Card className="py-16">
        <CardContent className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some beautiful plants to get started</p>
          <Button asChild className="bg-[#2d5016] hover:bg-[#2d5016]/90">
            <Link href="/categories/indoor-plants">Browse Plants</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {cartItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 md:p-6">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="font-mono italic text-sm text-muted-foreground mb-2">{item.botanical}</p>
                      <p className="text-sm text-muted-foreground">{item.size}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="flex-shrink-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardContent className="p-6">
            <h2 className="font-serif text-2xl font-bold mb-6">Order Summary</h2>

            {/* Promo Code */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Promo Code</label>
              <div className="flex gap-2">
                <Input placeholder="Enter code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                <Button variant="outline">Apply</Button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              {subtotal < 100 && (
                <p className="text-xs text-muted-foreground">
                  Add ${(100 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-2xl text-primary">${total.toFixed(2)}</span>
            </div>

            {/* Checkout Button */}
            <Button asChild className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90" size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            {/* Continue Shopping */}
            <Button asChild variant="ghost" className="w-full mt-3">
              <Link href="/categories/indoor-plants">Continue Shopping</Link>
            </Button>

            {/* Trust Signals */}
            <div className="mt-6 pt-6 border-t space-y-2 text-sm text-muted-foreground">
              <p>✓ Secure checkout</p>
              <p>✓ 30-day money back guarantee</p>
              <p>✓ Expert plant care support</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
