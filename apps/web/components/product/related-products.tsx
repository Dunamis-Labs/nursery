"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Product } from "@prisma/client"

interface RelatedProductsProps {
  currentProductId: string
  products: (Product & {
    category?: { name: string; slug: string } | null
  })[]
}

export function RelatedProducts({ currentProductId, products }: RelatedProductsProps) {
  if (products.length === 0) return null
  return (
    <section>
      <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">You May Also Like</h2>

      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-6 min-w-max lg:min-w-0 lg:grid lg:grid-cols-5">
          {products.map((product) => {
            const images = (product.images as string[]) || []
            // Filter out Plantmark URLs - use local images only or placeholder
            const localImages = images.filter(img => img && !img.includes('plantmark.com.au'))
            const localImageUrl = product.imageUrl && !product.imageUrl.includes('plantmark.com.au') 
              ? product.imageUrl 
              : null
            const imageUrl = localImages[0] || localImageUrl || "/placeholder.svg"
            
            return (
              <RelatedProductCard key={product.id} product={product} imageUrl={imageUrl} />
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Separate component for related product card with image error handling
function RelatedProductCard({
  product,
  imageUrl,
}: {
  product: Product & {
    category?: { name: string; slug: string } | null
  }
  imageUrl: string
}) {
  const [imgSrc, setImgSrc] = useState(imageUrl)
  const [hasError, setHasError] = useState(false)

  // Reset image source when imageUrl prop changes
  useEffect(() => {
    setImgSrc(imageUrl)
    setHasError(false)
  }, [imageUrl])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc("/placeholder.svg")
    }
  }

  return (
    <Card className="flex-shrink-0 w-64 lg:w-auto group cursor-pointer overflow-hidden transition-all hover:shadow-lg border-border">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleError}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base mb-1">
            {product.commonName || product.name}
          </h3>
          {product.commonName && product.name && (
            <p className="text-sm font-mono italic text-muted-foreground mb-3">{product.name}</p>
          )}
          {!product.commonName && product.botanicalName && (
            <p className="text-sm font-mono italic text-muted-foreground mb-3">{product.botanicalName}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#2d5016]">
              {product.price ? `$${Number(product.price).toFixed(2)}` : 'Price on request'}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="hover:bg-[#87a96b] hover:text-white hover:border-[#87a96b] bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                window.location.href = `/products/${product.slug}`
              }}
            >
              View
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  )
}
