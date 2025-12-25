"use client"

import { useState, useMemo } from "react"
import { FilterSidebar } from "@/components/category/filter-sidebar"
import { ProductGrid } from "@/components/product/product-grid"
import { ProductsTopBar } from "@/components/category/products-top-bar"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Product } from "@prisma/client"
import { mapWateringToLevel, mapLightToSunRequirement } from "@/lib/utils/category-filters"


export type FilterState = {
  priceRange: [number, number]
  sunRequirements: string[]
  waterNeeds: string[]
  humidity?: string[]
  growthRate?: string[]
  difficulty?: string[]
  toxicity?: string[]
}

interface CategoryContentProps {
  categoryName: string
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
  priceRange: [number, number]
  explainer?: {
    paragraphs: string[]
  }
}

export function CategoryContent({ categoryName, products, priceRange, explainer }: CategoryContentProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange,
    sunRequirements: [],
    waterNeeds: [],
  })
  const [sortBy, setSortBy] = useState("name-asc")

  const totalProducts = products.length

  // Calculate filtered count using the same logic as ProductGrid
  const filteredCount = useMemo(() => {
    let filtered = [...products]

    // Filter by price range
    filtered = filtered.filter((product) => {
      if (product.price === null || product.price === undefined) {
        return true
      }
      const price = Number(product.price) || 0
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    // Filter by sun requirements
    if (filters.sunRequirements && filters.sunRequirements.length > 0) {
      filtered = filtered.filter((product) => {
        if (product.specification?.lightRequirements) {
          const mapped = mapLightToSunRequirement(product.specification.lightRequirements)
          return mapped && filters.sunRequirements.includes(mapped)
        }
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

    // Filter by water needs
    if (filters.waterNeeds && filters.waterNeeds.length > 0) {
      filtered = filtered.filter((product) => {
        if (product.specification?.watering) {
          const mapped = mapWateringToLevel(product.specification.watering)
          return mapped && filters.waterNeeds.includes(mapped)
        }
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
          const humidity = product.specification.humidity.toLowerCase()
          return filters.humidity.some(filter => {
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
          return filters.growthRate.some(filter => 
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
          return filters.difficulty.some(filter => 
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
          return filters.toxicity.some(filter => {
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

    return filtered.length
  }, [products, filters])

  return (
    <>
      {explainer && (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-6">About Our {categoryName}</h2>
          <div className="space-y-4">
            {explainer.paragraphs.map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters}
                categoryName={categoryName}
                priceRange={priceRange}
              />
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-4 right-4 z-40">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white rounded-full shadow-lg">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-6">
                <SheetTitle className="sr-only">Filters</SheetTitle>
                <FilterSidebar 
                  filters={filters} 
                  setFilters={setFilters}
                  categoryName={categoryName}
                  priceRange={priceRange}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <ProductsTopBar
              totalProducts={totalProducts}
              filteredCount={filteredCount}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filters={filters}
              setFilters={setFilters}
            />
            <ProductGrid 
              products={products} 
              filters={filters} 
              sortBy={sortBy}
              categoryName={categoryName}
            />
          </div>
        </div>
      </div>
    </>
  )
}
