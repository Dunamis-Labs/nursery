"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Share2, Check, X } from "lucide-react"

interface ProductInfoProps {
  product: {
    name: string
    botanical: string
    price: number
    inStock: boolean
    sizes: string[]
    idealFor?: string[]
    notIdealFor?: string[]
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0])
  const [isFavorited, setIsFavorited] = useState(false)

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2 text-balance">{product.name}</h1>
        <p className="font-mono italic text-lg text-muted-foreground">{product.botanical}</p>
      </div>

      {/* Price */}
      <div className="text-4xl font-bold text-[#2d5016]">${product.price.toFixed(2)}</div>

      {/* Availability Badge */}
      <div>
        {product.inStock ? (
          <Badge className="bg-[#87a96b] hover:bg-[#87a96b]/90 text-white flex items-center gap-2 w-fit">
            <Check className="h-4 w-4" />
            In Stock
          </Badge>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-2 w-fit">
            <X className="h-4 w-4" />
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Size Selector */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Select Size</label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger className="w-full border-border focus:ring-[#87a96b]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {product.sizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90 text-white font-medium"
          disabled={!product.inStock}
        >
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className={`flex-1 ${isFavorited ? "bg-[#87a96b]/10 border-[#87a96b]" : ""}`}
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <Heart className={`mr-2 h-5 w-5 ${isFavorited ? "fill-[#87a96b] text-[#87a96b]" : ""}`} />
            {isFavorited ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" size="lg" className="flex-1 bg-transparent">
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
        </div>
      </div>

      {/* Ideal For / Not Ideal For section */}
      {(product.idealFor || product.notIdealFor) && (
        <div className="border-t border-border pt-6 space-y-4">
          {product.idealFor && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Ideal for:</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {product.idealFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#87a96b] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.notIdealFor && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Not ideal for:</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {product.notIdealFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Quick Info */}
      <div className="border-t border-border pt-6 space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Free shipping on orders over $75</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">30-day plant guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Expert care support included</span>
        </div>
      </div>
    </div>
  )
}
