"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { FilterState } from "@/components/category/category-content"

interface FilterSidebarProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
}

export function FilterSidebar({ filters, setFilters }: FilterSidebarProps) {
  const handlePriceChange = (value: number[]) => {
    setFilters({ ...filters, priceRange: [value[0], value[1]] })
  }

  const handleCheckboxChange = (category: keyof FilterState, value: string, checked: boolean) => {
    const currentValues = filters[category] as string[]
    if (checked) {
      setFilters({ ...filters, [category]: [...currentValues, value] })
    } else {
      setFilters({ ...filters, [category]: currentValues.filter((v) => v !== value) })
    }
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 200],
      sunRequirements: [],
      waterNeeds: [],
      size: [],
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
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#2d5016]">Price Range</h3>
        <Slider
          value={filters.priceRange}
          onValueChange={handlePriceChange}
          max={200}
          step={5}
          className="[&_[role=slider]]:bg-[#2d5016] [&_[role=slider]]:border-[#2d5016] [&_.bg-primary]:bg-[#87a96b]"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Sun Requirements */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold text-[#2d5016]">Sun Requirements</h3>
        <div className="space-y-2">
          {["Full Sun", "Partial Shade", "Full Shade"].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`sun-${option}`}
                checked={filters.sunRequirements.includes(option)}
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

      {/* Water Needs */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold text-[#2d5016]">Water Needs</h3>
        <div className="space-y-2">
          {["Low", "Medium", "High"].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`water-${option}`}
                checked={filters.waterNeeds.includes(option)}
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

      {/* Size */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold text-[#2d5016]">Size</h3>
        <div className="space-y-2">
          {["Small", "Medium", "Large", "Extra Large"].map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${option}`}
                checked={filters.size.includes(option)}
                onCheckedChange={(checked) => handleCheckboxChange("size", option, checked as boolean)}
                className="data-[state=checked]:bg-[#2d5016] data-[state=checked]:border-[#2d5016]"
              />
              <Label htmlFor={`size-${option}`} className="text-sm text-[#2c2c2c] cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <Button onClick={clearAllFilters} className="w-full bg-[#87a96b] hover:bg-[#87a96b]/90 text-white rounded-md">
        Clear All Filters
      </Button>
    </div>
  )
}
