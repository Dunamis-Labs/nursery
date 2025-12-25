"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { FilterState } from "@/components/category/category-content"

interface ProductsTopBarProps {
  totalProducts: number
  filteredCount: number
  sortBy: string
  setSortBy: (value: string) => void
  filters: FilterState
  setFilters: (filters: FilterState) => void
}

export function ProductsTopBar({
  totalProducts,
  filteredCount,
  sortBy,
  setSortBy,
  filters,
  setFilters,
}: ProductsTopBarProps) {
  const activeFilters = [
    ...(filters.sunRequirements || []).map((f) => ({ type: "sunRequirements", value: f })),
    ...(filters.waterNeeds || []).map((f) => ({ type: "waterNeeds", value: f })),
    ...(filters.humidity || []).map((f) => ({ type: "humidity", value: f })),
    ...(filters.growthRate || []).map((f) => ({ type: "growthRate", value: f })),
    ...(filters.difficulty || []).map((f) => ({ type: "difficulty", value: f })),
    ...(filters.toxicity || []).map((f) => ({ type: "toxicity", value: f })),
  ]

  const removeFilter = (type: string, value: string) => {
    const currentValues = (filters[type as keyof FilterState] as string[]) || []
    setFilters({
      ...filters,
      [type]: currentValues.filter((v) => v !== value),
    })
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-[#6b7280]">
          Showing {filteredCount} of {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#6b7280]">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] border-[#e5e7eb] focus:ring-[#2d5016]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name: A-Z</SelectItem>
              <SelectItem value="name-desc">Name: Z-A</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={`${filter.type}-${filter.value}-${index}`}
              className="bg-[#2d5016] text-white hover:bg-[#2d5016]/90 rounded-full px-3 py-1"
            >
              {filter.value}
              <button onClick={() => removeFilter(filter.type, filter.value)} className="ml-2 hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
