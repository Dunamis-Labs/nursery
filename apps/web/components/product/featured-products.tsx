"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Product } from "@prisma/client"

interface FeaturedProductsProps {
  products: (Product & {
    category?: { name: string; slug: string } | null
  })[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Plants</h2>
            <p className="text-muted-foreground">Hand-picked favorites for your home</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" className="hidden md:flex text-primary hover:text-primary/80">
              View All →
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-6 min-w-max md:min-w-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {products.map((product) => {
              const images = (product.images as string[]) || []
              // Use database URLs (Vercel Blob Storage) directly, fallback to placeholder
              const imageUrl = product.imageUrl || images[0] || "/placeholder.svg"
              
            return (
              <Card key={product.id} className="flex-shrink-0 w-64 md:w-auto group relative overflow-hidden transition-all hover:shadow-lg border-border">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized={imageUrl.startsWith('/products/') || imageUrl.startsWith('/categories/')}
                    />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          // TODO: Add to favorites
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                    {product.botanicalName && (
                      <p className="text-sm font-mono italic text-muted-foreground mb-3">{product.botanicalName}</p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary">
                        {product.price ? `$${Number(product.price).toFixed(2)}` : 'Price on request'}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90 text-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        // TODO: Add to cart
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </Link>
              </Card>
            )
            })}
          </div>
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link href="/products">
            <Button variant="outline" className="w-full max-w-xs bg-transparent">
              View All Plants
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
