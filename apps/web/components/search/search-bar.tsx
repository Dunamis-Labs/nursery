"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Search, Clock, Package, BookOpen, Grid3x3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface SearchResult {
  type: "product" | "guide" | "category"
  id: string
  name: string
  botanicalName?: string
  price?: number
  excerpt?: string
  productCount?: number
  image?: string
  slug?: string
}

const mockSearchData: SearchResult[] = [
  {
    type: "product",
    id: "1",
    name: "Monstera Deliciosa",
    botanicalName: "Monstera deliciosa",
    price: 45.99,
    image: "/monstera-deliciosa-full-plant-pot.jpg",
  },
  {
    type: "product",
    id: "2",
    name: "Snake Plant",
    botanicalName: "Sansevieria trifasciata",
    price: 32.99,
    image: "/snake-plant-sansevieria-pot.jpg",
  },
  {
    type: "product",
    id: "3",
    name: "Fiddle Leaf Fig",
    botanicalName: "Ficus lyrata",
    price: 68.99,
    image: "/fiddle-leaf-fig-tree-pot.jpg",
  },
  {
    type: "product",
    id: "4",
    name: "Peace Lily",
    botanicalName: "Spathiphyllum",
    price: 29.99,
    image: "/peace-lily-white-flower-pot.jpg",
  },
  {
    type: "guide",
    id: "1",
    name: "Beginner's Guide to Indoor Plant Care",
    excerpt: "Learn the essentials of keeping your indoor plants thriving",
  },
  {
    type: "guide",
    id: "2",
    name: "Creating a Drought-Tolerant Garden",
    excerpt: "Design a beautiful, water-wise garden",
  },
  {
    type: "category",
    id: "1",
    name: "Indoor Plants",
    productCount: 156,
    slug: "indoor-plants",
  },
  {
    type: "category",
    id: "2",
    name: "Succulents",
    productCount: 89,
    slug: "succulents",
  },
]

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Search functionality
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const filtered = mockSearchData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.botanicalName && item.botanicalName.toLowerCase().includes(searchQuery.toLowerCase())),
    )

    setResults(filtered)
    setSelectedIndex(0)
  }, [])

  useEffect(() => {
    performSearch(query)
  }, [query, performSearch])

  // Save recent search
  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault()
      handleResultClick(results[selectedIndex])
    }
  }

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query)
    setOpen(false)
    setQuery("")

    if (result.type === "product") {
      router.push(`/products/${result.id}`)
    } else if (result.type === "category") {
      router.push(`/categories/${result.slug}`)
    } else if (result.type === "guide") {
      router.push(`/guides`)
    }
  }

  const handleRecentSearchClick = (search: string) => {
    setQuery(search)
    performSearch(search)
  }

  // Group results by type
  const groupedResults = {
    products: results.filter((r) => r.type === "product"),
    guides: results.filter((r) => r.type === "guide"),
    categories: results.filter((r) => r.type === "category"),
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Search className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for plants..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-14 pl-12 pr-4 text-base border-0 border-b rounded-none focus-visible:ring-0 focus-visible:border-primary"
              autoFocus
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {!query && recentSearches.length > 0 && (
              <div className="p-4 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="px-3 py-1 text-sm bg-muted rounded-md hover:bg-muted/80 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query && results.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No results found for "{query}"</div>
            )}

            {query && results.length > 0 && (
              <div className="py-2">
                {groupedResults.products.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Products
                    </h3>
                    <div>
                      {groupedResults.products.map((result, index) => {
                        const globalIndex = results.indexOf(result)
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                              selectedIndex === globalIndex ? "bg-[#87a96b] text-white" : "hover:bg-muted"
                            }`}
                          >
                            {result.image && (
                              <img
                                src={result.image || "/placeholder.svg"}
                                alt={result.name}
                                className="w-12 h-12 object-cover rounded-md"
                              />
                            )}
                            <div className="flex-1 text-left">
                              <p
                                className={`font-serif font-semibold ${selectedIndex === globalIndex ? "text-white" : ""}`}
                              >
                                {result.name}
                              </p>
                              <p
                                className={`text-xs font-mono italic ${selectedIndex === globalIndex ? "text-white/80" : "text-muted-foreground"}`}
                              >
                                {result.botanicalName}
                              </p>
                            </div>
                            <span
                              className={`font-bold ${selectedIndex === globalIndex ? "text-white" : "text-primary"}`}
                            >
                              ${result.price}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {groupedResults.guides.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Guides
                    </h3>
                    <div>
                      {groupedResults.guides.map((result) => {
                        const globalIndex = results.indexOf(result)
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                              selectedIndex === globalIndex ? "bg-[#87a96b] text-white" : "hover:bg-muted"
                            }`}
                          >
                            <BookOpen
                              className={`h-5 w-5 ${selectedIndex === globalIndex ? "text-white" : "text-muted-foreground"}`}
                            />
                            <div className="flex-1 text-left">
                              <p className={`font-semibold ${selectedIndex === globalIndex ? "text-white" : ""}`}>
                                {result.name}
                              </p>
                              <p
                                className={`text-xs ${selectedIndex === globalIndex ? "text-white/80" : "text-muted-foreground"}`}
                              >
                                {result.excerpt}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {groupedResults.categories.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Grid3x3 className="h-4 w-4" />
                      Categories
                    </h3>
                    <div>
                      {groupedResults.categories.map((result) => {
                        const globalIndex = results.indexOf(result)
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                              selectedIndex === globalIndex ? "bg-[#87a96b] text-white" : "hover:bg-muted"
                            }`}
                          >
                            <Grid3x3
                              className={`h-5 w-5 ${selectedIndex === globalIndex ? "text-white" : "text-muted-foreground"}`}
                            />
                            <div className="flex-1 text-left">
                              <p className={`font-semibold ${selectedIndex === globalIndex ? "text-white" : ""}`}>
                                {result.name}
                              </p>
                              <p
                                className={`text-xs ${selectedIndex === globalIndex ? "text-white/80" : "text-muted-foreground"}`}
                              >
                                {result.productCount} products
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t pt-2 pb-2">
                  <button
                    onClick={() => {
                      saveRecentSearch(query)
                      setOpen(false)
                    }}
                    className="w-full px-4 py-3 text-sm font-medium text-primary hover:bg-muted transition-colors text-center"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
