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
import { useState, useMemo, useEffect } from "react"
import { Product } from "@prisma/client"
import { mapWateringToLevel, mapLightToSunRequirement } from "@/lib/utils/category-filters"

interface ProductGridProps {
  products: (Product & {
    category?: { name: string; slug: string } | null
    specification?: {
      lightRequirements: string | null
      humidity: string | null
      growthRate: string | null
      toxicity: string | null
      watering: string | null
      temperature: string | null
      difficulty: string | null
      origin: string | null
    } | null
  })[]
  filters: FilterState
  sortBy: string
  categoryName: string
}

export function ProductGrid({ products, filters, sortBy, categoryName }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 24

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by price range (only if price is set, otherwise include product)
    filtered = filtered.filter((product) => {
      if (product.price === null || product.price === undefined) {
        // Include products without prices
        return true
      }
      const price = Number(product.price) || 0
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Filter by sun requirements (from ProductSpecification or metadata)
    if (filters.sunRequirements && filters.sunRequirements.length > 0) {
      filtered = filtered.filter((product) => {
        // Try ProductSpecification first
        if (product.specification?.lightRequirements) {
          const mapped = mapLightToSunRequirement(product.specification.lightRequirements)
          return mapped && filters.sunRequirements.includes(mapped)
        }
        
        // Fallback to metadata
        const metadata = (product.metadata as Record<string, unknown>) || {}
        const specs = (metadata.specifications as Record<string, unknown>) || {}
        const position = specs.position || specs.sunRequirements
        if (position) {
          const positionArray = Array.isArray(position) ? position : [position]
          return filters.sunRequirements.some((req) =>
            positionArray.some((pos: unknown) => {
              const mapped = mapLightToSunRequirement(String(pos))
              return mapped === req
            })
          )
        }
        
        return false
      })
    }

    // Filter by water needs (from ProductSpecification or metadata)
    if (filters.waterNeeds && filters.waterNeeds.length > 0) {
      filtered = filtered.filter((product) => {
        // Try ProductSpecification first
        if (product.specification?.watering) {
          const mapped = mapWateringToLevel(product.specification.watering)
          return mapped && filters.waterNeeds.includes(mapped)
        }
        
        // Fallback to metadata
        const metadata = (product.metadata as Record<string, unknown>) || {}
        const specs = (metadata.specifications as Record<string, unknown>) || {}
        const waterReq = specs.waterRequirements || specs.watering
        if (waterReq) {
          const mapped = mapWateringToLevel(String(waterReq))
          return mapped && filters.waterNeeds.includes(mapped)
        }
        
        return false
      })
    }

    // Filter by humidity
    if (filters.humidity && filters.humidity.length > 0) {
      filtered = filtered.filter((product) => {
        if (product.specification?.humidity) {
          // Normalize humidity values
          const humidity = product.specification.humidity.toLowerCase()
          return filters.humidity!.some(filter => {
            const filterLower = filter.toLowerCase()
            return humidity.includes(filterLower) || 
                   (filterLower === 'moderate' && humidity.includes('medium'))
          })
        }
        return false
      })
    }

    // Filter by growth rate
    if (filters.growthRate && filters.growthRate.length > 0) {
      filtered = filtered.filter((product) => {
        if (product.specification?.growthRate) {
          const growthRate = product.specification.growthRate.toLowerCase()
          return filters.growthRate!.some(filter => 
            growthRate.includes(filter.toLowerCase())
          )
        }
        return false
      })
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter((product) => {
        if (product.specification?.difficulty) {
          const difficulty = product.specification.difficulty.toLowerCase()
          return filters.difficulty!.some(filter => 
            difficulty.includes(filter.toLowerCase())
          )
        }
        return false
      })
    }

    // Filter by toxicity
    if (filters.toxicity && filters.toxicity.length > 0) {
      filtered = filtered.filter((product) => {
        if (product.specification?.toxicity) {
          const toxicity = product.specification.toxicity.toLowerCase()
          return filters.toxicity!.some(filter => {
            const filterLower = filter.toLowerCase()
            if (filterLower === 'non-toxic') {
              return toxicity.includes('non-toxic') || toxicity.includes('non toxic')
            }
            return toxicity.includes(filterLower)
          })
        }
        return false
      })
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (Number(a.price) || 0) - (Number(b.price) || 0)
        case 'price-high':
          return (Number(b.price) || 0) - (Number(a.price) || 0)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'name-asc':
        default:
          // Default to A-Z alphabetical sorting
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [products, filters, sortBy, categoryName])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const displayedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage)

  return (
    <>
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your filters.</p>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products on this page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {displayedProducts.map((product) => {
            const images = (product.images as string[]) || []
            // Filter out Plantmark URLs - use local images only or placeholder
            const localImages = images.filter(img => img && !img.includes('plantmark.com.au'))
            const localImageUrl = product.imageUrl && !product.imageUrl.includes('plantmark.com.au') 
              ? product.imageUrl 
              : null
            const imageUrl = localImages[0] || localImageUrl || "/logo.svg"
            
            return (
              <ProductCard key={product.id} product={product} imageUrl={imageUrl} categoryName={categoryName} />
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

// Separate component for product card with image error handling
function ProductCard({ 
  product, 
  imageUrl,
  categoryName
}: { 
  product: Product & {
    category?: { name: string; slug: string } | null
    specification?: {
      lightRequirements: string | null
      humidity: string | null
      growthRate: string | null
      toxicity: string | null
      watering: string | null
      temperature: string | null
      difficulty: string | null
      origin: string | null
    } | null
  }
  imageUrl: string
  categoryName?: string
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
      setImgSrc("/logo.svg")
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-105 border-[#e5e7eb]">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className={`transition-transform duration-300 group-hover:scale-105 ${
              hasError ? "grayscale opacity-50 object-contain" : "object-cover"
            }`}
            unoptimized={imgSrc.startsWith('/products/') || hasError}
            priority={false}
            onError={handleError}
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
          <h3 className="font-serif text-lg font-bold text-[#2c2c2c] mb-1">
            {product.commonName || product.name}
          </h3>
          {/* Hide botanical names for Garden Products category */}
          {categoryName && categoryName !== 'Garden Products' && product.commonName && product.name && (
            <p className="font-mono text-sm italic text-[#6b7280] mb-3">{product.name}</p>
          )}
          {categoryName && categoryName !== 'Garden Products' && !product.commonName && product.botanicalName && (
            <p className="font-mono text-sm italic text-[#6b7280] mb-3">{product.botanicalName}</p>
          )}
          {/* Fallback: show botanical name if categoryName is not provided */}
          {!categoryName && product.commonName && product.name && (
            <p className="font-mono text-sm italic text-[#6b7280] mb-3">{product.name}</p>
          )}
          {!categoryName && !product.commonName && product.botanicalName && (
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
}
