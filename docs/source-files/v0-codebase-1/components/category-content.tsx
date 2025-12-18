"use client"

import { useState } from "react"
import { FilterSidebar } from "@/components/filter-sidebar"
import { ProductGrid } from "@/components/product-grid"
import { ProductsTopBar } from "@/components/products-top-bar"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface CategoryContentProps {
  categoryName: string
  totalProducts: number
  explainer?: {
    paragraphs: string[]
  }
}

export type FilterState = {
  priceRange: [number, number]
  sunRequirements: string[]
  waterNeeds: string[]
  size: string[]
}

export function CategoryContent({ categoryName, totalProducts, explainer }: CategoryContentProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 200],
    sunRequirements: [],
    waterNeeds: [],
    size: [],
  })
  const [sortBy, setSortBy] = useState("popularity")

  // Calculate filtered product count (in production, this would be from API)
  const filteredCount = totalProducts

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
            <div className="sticky top-20">
              <FilterSidebar filters={filters} setFilters={setFilters} />
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
                <FilterSidebar filters={filters} setFilters={setFilters} />
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
            <ProductGrid categoryName={categoryName} filters={filters} sortBy={sortBy} />
          </div>
        </div>
      </div>
    </>
  )
}
