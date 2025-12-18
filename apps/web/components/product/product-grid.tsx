"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { FilterState } from "@/components/category/category-content"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState, useMemo } from "react"
import { Product } from "@prisma/client"

interface ProductGridProps {
  products: (Product & {
    category?: { name: string; slug: string } | null
  })[]
  filters: FilterState
  sortBy: string
}

export function ProductGrid({ products, filters, sortBy }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 24

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by price range
    filtered = filtered.filter((product) => {
      const price = product.price || 0
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Filter by sun requirements (from metadata)
    if (filters.sunRequirements.length > 0) {
      filtered = filtered.filter((product) => {
        const metadata = (product.metadata as Record<string, unknown>) || {}
        const specs = (metadata.specifications as Record<string, unknown>) || {}
        const position = specs.position
        if (!position) return false
        
        const positionArray = Array.isArray(position) ? position : [position]
        return filters.sunRequirements.some((req) =>
          positionArray.some((pos: unknown) =>
            String(pos).toLowerCase().includes(req.toLowerCase().replace(' ', ''))
          )
        )
      })
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0)
        case 'price-high':
          return (b.price || 0) - (a.price || 0)
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'popularity':
        default:
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
      }
    })

    return filtered
  }, [products, filters, sortBy])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const displayedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage)

  return (
    <>
      {displayedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {displayedProducts.map((product) => {
            const images = (product.images as string[]) || []
            // Filter out Plantmark URLs - use local images only or placeholder
            const localImages = images.filter(img => !img.includes('plantmark.com.au'))
            const localImageUrl = product.imageUrl && !product.imageUrl.includes('plantmark.com.au') 
              ? product.imageUrl 
              : null
            const imageUrl = localImages[0] || localImageUrl || "/placeholder.svg"
            
            return (
              <Card key={product.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-105 border-[#e5e7eb]">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                    <h3 className="font-serif text-lg font-bold text-[#2c2c2c] mb-1">{product.name}</h3>
                    {product.botanicalName && (
                      <p className="font-mono text-sm italic text-[#6b7280] mb-3">{product.botanicalName}</p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-[#2d5016]">
                        {product.price ? `$${Number(product.price).toFixed(2)}` : 'Price on request'}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-[#2d5016] hover:bg-[#2d5016]/90 text-white rounded-md"
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className={currentPage === i + 1 ? "bg-[#2d5016] text-white" : "cursor-pointer"}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  )
}
