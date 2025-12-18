"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import type { FilterState } from "@/components/category-content"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState } from "react"

// Sample product data
const products = [
  {
    id: 1,
    name: "Monstera Deliciosa",
    botanical: "Monstera deliciosa",
    price: 45.99,
    image: "/monstera-deliciosa-full-plant-pot.jpg",
  },
  {
    id: 2,
    name: "Snake Plant",
    botanical: "Sansevieria trifasciata",
    price: 32.99,
    image: "/snake-plant-sansevieria-pot.jpg",
  },
  {
    id: 3,
    name: "Fiddle Leaf Fig",
    botanical: "Ficus lyrata",
    price: 68.99,
    image: "/fiddle-leaf-fig-tree-pot.jpg",
  },
  {
    id: 4,
    name: "Peace Lily",
    botanical: "Spathiphyllum",
    price: 29.99,
    image: "/peace-lily-white-flower-pot.jpg",
  },
  {
    id: 5,
    name: "Rubber Plant",
    botanical: "Ficus elastica",
    price: 39.99,
    image: "/rubber-plant-ficus-elastica-pot.jpg",
  },
  {
    id: 6,
    name: "Pothos",
    botanical: "Epipremnum aureum",
    price: 24.99,
    image: "/pothos-hanging-plant-pot.jpg",
  },
  {
    id: 7,
    name: "ZZ Plant",
    botanical: "Zamioculcas zamiifolia",
    price: 36.99,
    image: "/zz-plant-zamioculcas-pot.jpg",
  },
  {
    id: 8,
    name: "Spider Plant",
    botanical: "Chlorophytum comosum",
    price: 22.99,
    image: "/spider-plant-hanging-pot.jpg",
  },
]

interface ProductGridProps {
  categoryName: string
  filters: FilterState
  sortBy: string
}

export function ProductGrid({ categoryName, filters, sortBy }: ProductGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  // In production, filtering and sorting would happen on the server
  const filteredProducts = products
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {displayedProducts.map((product) => (
          <Card
            key={product.id}
            className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-105 border-[#e5e7eb]"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-3 right-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <h3 className="font-serif text-lg font-bold text-[#2c2c2c] mb-1">{product.name}</h3>
              <p className="font-mono text-sm italic text-[#6b7280] mb-3">{product.botanical}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-[#2d5016]">${product.price}</span>
                <Button size="sm" className="bg-[#2d5016] hover:bg-[#2d5016]/90 text-white rounded-md">
                  Add
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

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
