"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { FilterState } from "@/components/category/category-content"
import { getCategoryFilterConfig } from "@/lib/utils/category-filters"

interface FilterSidebarProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  categoryName: string
  priceRange: [number, number]
}

export function FilterSidebar({ filters, setFilters, categoryName, priceRange }: FilterSidebarProps) {
  const config = getCategoryFilterConfig(categoryName)
  const [minPrice, maxPrice] = priceRange

  const handlePriceChange = (value: number[]) => {
    setFilters({ ...filters, priceRange: [value[0], value[1]] })
  }

  const handleCheckboxChange = (category: keyof FilterState, value: string, checked: boolean) => {
    const currentValues = (filters[category] as string[]) || []
    if (checked) {
      setFilters({ ...filters, [category]: [...currentValues, value] })
    } else {
      setFilters({ ...filters, [category]: currentValues.filter((v) => v !== value) })
    }
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange,
      sunRequirements: [],
      waterNeeds: [],
      humidity: [],
      growthRate: [],
      difficulty: [],
      toxicity: [],
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold text-[#2d5016]">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>

      {/* Price Range */}
      {config.availableFilters.includes('price') && (
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#2d5016]">Price Range</h3>
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            min={minPrice}
            max={maxPrice}
            step={Math.max(5, Math.floor(maxPrice / 20))}
            className="[&_[role=slider]]:bg-[#2d5016] [&_[role=slider]]:border-[#2d5016] [&_.bg-primary]:bg-[#87a96b]"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      )}

      {/* Sun Requirements */}
      {config.availableFilters.includes('sunRequirements') && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#2d5016]">Sun Requirements</h3>
          <div className="space-y-2">
            {["Full Sun", "Partial Shade", "Full Shade"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`sun-${option}`}
                  checked={filters.sunRequirements?.includes(option) || false}
                  onCheckedChange={(checked) => handleCheckboxChange("sunRequirements", option, checked as boolean)}
                  className="data-[state=checked]:bg-[#2d5016] data-[state=checked]:border-[#2d5016]"
                />
                <Label htmlFor={`sun-${option}`} className="text-sm text-[#2c2c2c] cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Water Needs */}
      {config.availableFilters.includes('waterNeeds') && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#2d5016]">Water Needs</h3>
          <div className="space-y-2">
            {["Low", "Medium", "High"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`water-${option}`}
                  checked={filters.waterNeeds?.includes(option) || false}
                  onCheckedChange={(checked) => handleCheckboxChange("waterNeeds", option, checked as boolean)}
                  className="data-[state=checked]:bg-[#2d5016] data-[state=checked]:border-[#2d5016]"
                />
                <Label htmlFor={`water-${option}`} className="text-sm text-[#2c2c2c] cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Humidity */}
      {config.availableFilters.includes('humidity') && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#2d5016]">Humidity</h3>
          <div className="space-y-2">
            {["Low", "Moderate", "High"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`humidity-${option}`}
                  checked={filters.humidity?.includes(option) || false}
                  onCheckedChange={(checked) => handleCheckboxChange("humidity", option, checked as boolean)}
                  className="data-[state=checked]:bg-[#2d5016] data-[state=checked]:border-[#2d5016]"
                />
                <Label htmlFor={`humidity-${option}`} className="text-sm text-[#2c2c2c] cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth Rate */}
      {config.availableFilters.includes('growthRate') && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#2d5016]">Growth Rate</h3>
          <div className="space-y-2">
            {["Slow", "Moderate", "Fast"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`growth-${option}`}
                  checked={filters.growthRate?.includes(option) || false}
                  onCheckedChange={(checked) => handleCheckboxChange("growthRate", option, checked as boolean)}
                  className="data-[state=checked]:bg-[#2d5016] data-[state=checked]:border-[#2d5016]"
                />
                <Label htmlFor={`growth-${option}`} className="text-sm text-[#2c2c2c] cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty */}
      {config.availableFilters.includes('difficulty') && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#2d5016]">Difficulty</h3>
          <div className="space-y-2">
            {["Easy", "Moderate", "Difficult"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`difficulty-${option}`}
                  checked={filters.difficulty?.includes(option) || false}
                  onCheckedChange={(checked) => handleCheckboxChange("difficulty", option, checked as boolean)}
                  className="data-[state=checked]:bg-[#2d5016] data-[state=checked]:border-[#2d5016]"
                />
                <Label htmlFor={`difficulty-${option}`} className="text-sm text-[#2c2c2c] cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toxicity */}
      {config.availableFilters.includes('toxicity') && (
        <div className="space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#2d5016]">Toxicity</h3>
          <div className="space-y-2">
            {["Non-toxic", "Mildly toxic", "Toxic to pets"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`toxicity-${option}`}
                  checked={filters.toxicity?.includes(option) || false}
                  onCheckedChange={(checked) => handleCheckboxChange("toxicity", option, checked as boolean)}
                  className="data-[state=checked]:bg-[#2d5016] data-[state=checked]:border-[#2d5016]"
                />
                <Label htmlFor={`toxicity-${option}`} className="text-sm text-[#2c2c2c] cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear Filters Button */}
      <Button onClick={clearAllFilters} className="w-full bg-[#87a96b] hover:bg-[#87a96b]/90 text-white rounded-md">
        Clear All Filters
      </Button>
    </div>
  )
}
