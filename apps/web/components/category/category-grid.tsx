"use client"

import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Category } from "@prisma/client"
import { categoryImageMap } from "@/lib/constants/categories"
import { useState } from "react"

interface CategoryGridProps {
  categories: (Category & {
    _count?: { products: number }
  })[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Shop by Category</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse our carefully curated collection of plants and gardening essentials
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => {
            const productCount = category._count?.products || 0
            // Use category image from database (Vercel Blob Storage), fallback to hardcoded map, then placeholder
            const imageUrl = category.image || categoryImageMap[category.name] || "/placeholder.svg"
            
            return (
              <CategoryTile 
                key={category.id} 
                category={category} 
                imageUrl={imageUrl}
                productCount={productCount}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CategoryTile({ 
  category, 
  imageUrl, 
  productCount 
}: { 
  category: Category & { _count?: { products: number } }
  imageUrl: string
  productCount: number
}) {
  const [imgSrc, setImgSrc] = useState(imageUrl)
  const [hasError, setHasError] = useState(false)

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      console.error(`❌ Image failed to load for ${category.name}:`, {
        imageUrl,
        src: (e.target as HTMLImageElement)?.src,
        error: e
      })
      setHasError(true)
      setImgSrc("/placeholder.svg")
    }
  }

  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg border-border">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={imgSrc}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={85}
            onError={handleError}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{productCount} {productCount === 1 ? 'product' : 'products'}</p>
        </div>
      </Card>
    </Link>
  )
}
