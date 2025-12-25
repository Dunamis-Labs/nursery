"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Share2, Check, X } from "lucide-react"

import { Product } from "@prisma/client"

interface ProductInfoProps {
  product: Product & {
    category?: { name: string; slug: string } | null
    content?: {
      idealFor: string[]
      notIdealFor: string[]
    } | null
  }
}

// Helper function to parse size and extract numeric value for sorting
function parseSizeValue(size: string): number {
  // Extract numbers from size strings like "20cm", "25cm", "40cm", "45L", "150L"
  const match = size.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  // If no number found, return a large value to sort to the end
  return Infinity;
}

// Helper function to sort sizes intelligently
function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const aValue = parseSizeValue(a);
    const bValue = parseSizeValue(b);
    return aValue - bValue;
  });
}

export function ProductInfo({ product }: ProductInfoProps) {
  const metadata = (product.metadata as Record<string, unknown>) || {}
  const variants = (metadata.variants as Array<{ size?: string; price?: number; availability?: string }>) || []
  
  // Extract and sort sizes
  const sizes = useMemo(() => {
    const rawSizes = variants.map(v => v.size || '').filter(Boolean)
    return rawSizes.length > 0 ? sortSizes(rawSizes) : []
  }, [variants])
  
  const specifications = (metadata.specifications as Record<string, unknown>) || {}
  
  // Set smallest size as default (first in sorted array)
  const defaultSize = useMemo(() => sizes.length > 0 ? sizes[0] : 'Standard', [sizes])
  const [selectedSize, setSelectedSize] = useState(() => defaultSize)
  const [isFavorited, setIsFavorited] = useState(false)
  
  // Update selected size when sizes change (e.g., when product changes)
  useEffect(() => {
    if (sizes.length > 0) {
      // If current selection is not in available sizes, or sizes changed, reset to smallest
      if (!sizes.includes(selectedSize)) {
        setSelectedSize(defaultSize)
      }
    }
  }, [sizes, defaultSize, selectedSize])
  
  const selectedVariant = variants.find(v => v.size === selectedSize) || variants[0]
  const displayPrice = Number(selectedVariant?.price || product.price || 0)
  const isInStock = product.availability === 'IN_STOCK' || selectedVariant?.availability === 'IN_STOCK'

  return (
    <div className="space-y-6">
      {/* Product Name */}
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2 text-balance">
          {product.commonName || product.name}
        </h1>
        {product.botanicalName && (
          <p className="font-mono italic text-lg text-muted-foreground">
            {product.botanicalName}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="text-4xl font-bold text-[#2d5016]">
        {displayPrice > 0 ? `$${displayPrice.toFixed(2)}` : 'Price on request'}
      </div>

      {/* Availability Badge */}
      <div>
        {isInStock ? (
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

      {/* Size Selector - Show if there are any sizes */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            {sizes.length > 1 ? 'Select Size' : 'Size'}
          </label>
          {sizes.length > 1 ? (
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full border-border focus:ring-[#87a96b]">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-foreground font-medium py-2 px-3 border border-border rounded-md bg-muted/50">
              {sizes[0]}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90 text-white font-medium"
          disabled={!isInStock}
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
      {(() => {
        // Get idealFor/notIdealFor from ProductContent (enriched data)
        const idealFor = product.content?.idealFor || [];
        const notIdealFor = product.content?.notIdealFor || [];
        
        if (idealFor.length > 0 || notIdealFor.length > 0) {
          return (
            <div className="border-t border-border pt-6 space-y-4">
              {idealFor.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Ideal for:</h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {idealFor.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#87a96b] mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {notIdealFor.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Not ideal for:</h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {notIdealFor.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <X className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        }
        return null;
      })()}

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
