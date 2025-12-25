"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Search, Clock, Package, BookOpen, Grid3x3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import Image from "next/image"

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

interface ProductSearchResult {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  availability: string
  imageUrl: string | null
  images: string[]
  botanicalName: string | null
  commonName: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
}

export function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Search functionality with debouncing
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
      const data = await response.json()
      
      // Convert API products to SearchResult format
      const productResults: SearchResult[] = (data.products || []).map((product: ProductSearchResult) => {
        // Get image URL - filter out Plantmark URLs, use local images only
        const images = (product.images as string[]) || []
        const localImages = images.filter((img: string) => img && !img.includes('plantmark.com.au'))
        const localImageUrl = product.imageUrl && !product.imageUrl.includes('plantmark.com.au') 
          ? product.imageUrl 
          : null
        const imageUrl = localImages[0] || localImageUrl || "/placeholder.svg"

        return {
          type: "product" as const,
          id: product.id,
          name: product.commonName || product.name,
          botanicalName: product.botanicalName || undefined,
          price: Number(product.price) || undefined,
          image: imageUrl,
          slug: product.slug,
        }
      })

      setResults(productResults)
      setSelectedIndex(0)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce search requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
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
          <DialogTitle className="sr-only">Search for plants</DialogTitle>
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

            {query && isLoading && (
              <div className="p-8 text-center text-muted-foreground">Searching...</div>
            )}

            {query && !isLoading && results.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No results found for "{query}"</div>
            )}

            {query && !isLoading && results.length > 0 && (
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
                          <ProductSearchResultItem
                            key={result.id}
                            result={result}
                            globalIndex={globalIndex}
                            selectedIndex={selectedIndex}
                            onResultClick={handleResultClick}
                          />
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
                      router.push(`/search?q=${encodeURIComponent(query)}`)
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

// Separate component for product search result with image error handling
function ProductSearchResultItem({
  result,
  globalIndex,
  selectedIndex,
  onResultClick,
}: {
  result: SearchResult
  globalIndex: number
  selectedIndex: number
  onResultClick: (result: SearchResult) => void
}) {
  const [imgSrc, setImgSrc] = useState(result.image || "/placeholder.svg")
  const [hasError, setHasError] = useState(false)

  // Reset image source when result changes
  useEffect(() => {
    setImgSrc(result.image || "/placeholder.svg")
    setHasError(false)
  }, [result.image])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc("/placeholder.svg")
    }
  }

  return (
    <button
      onClick={() => onResultClick(result)}
      className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
        selectedIndex === globalIndex ? "bg-[#87a96b] text-white" : "hover:bg-muted"
      }`}
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src={imgSrc}
          alt={result.name}
          fill
          className="object-cover rounded-md"
          unoptimized={imgSrc.startsWith('/products/')}
          onError={handleError}
        />
      </div>
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
}
