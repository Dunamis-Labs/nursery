"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  ShoppingCart,
  Menu,
  ChevronDown,
  Home,
  BookOpen,
  FileText,
  Info,
  Leaf,
  TreeDeciduous,
  Flower2,
  TreePine,
  Sprout,
  Package,
  Compass,
  User,
  Droplets,
  Apple,
  Carrot,
  Waves,
  Layers,
  CircleDot,
  Grid3x3,
  Scissors,
  Search,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Category } from "@prisma/client"

interface NavigationProps {
  categories?: Category[]
}

// Comprehensive icon mapping for all 15 Plantmark categories
// Icons chosen to be visually distinct and representative of each category
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Trees': TreePine,
  'Shrubs': TreeDeciduous,
  'Grasses': Grid3x3,
  'Hedging and Screening': Layers,
  'Groundcovers': CircleDot,
  'Climbers': Sprout,
  'Palms, Ferns & Tropical': TreePine,
  'Conifers': TreePine,
  'Roses': Flower2,
  'Succulents & Cacti': Flower2,
  'Citrus & Fruit': Apple,
  'Herbs & Vegetables': Carrot,
  'Water Plants': Waves,
  'Indoor Plants': Leaf,
  'Garden Products': Package,
  'Succulents': Flower2,
  'Perennials': Flower2,
  'Outdoor Plants': TreeDeciduous,
  'Pots & Planters': Package,
  'Palms': TreePine,
}

export function Navigation({ categories = [] }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering Sheet after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Deduplicate categories by slug and map to navigation format with icons
  const seenSlugs = new Set<string>()
  const navCategories = categories
    .filter(cat => {
      if (seenSlugs.has(cat.slug)) {
        return false
      }
      seenSlugs.add(cat.slug)
      return true
    })
    .map(cat => ({
      name: cat.name,
      slug: cat.slug,
      image: "/placeholder.svg", // TODO: Add image field to Category model
      description: `${cat.name} plants`,
      icon: categoryIcons[cat.name] || Leaf,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Don't render Sheet/Dialog on server to avoid Context Provider issues
  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <button className="lg:hidden p-2 hover:bg-[#87a96b]/10 rounded-md transition-colors" aria-label="Menu">
                <Menu className="h-6 w-6 text-[#2c2c2c]" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.svg" alt="The Plant Nursery" className="h-10 w-auto" />
              </Link>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/plant-finder" className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2">Plant Finder</Link>
              <Link href="/plant-care" className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2">Plant Care</Link>
              <Link href="/guides" className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2">Guides</Link>
              <Link href="/blog" className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2">Blog</Link>
              <Link href="/about" className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2">About</Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
                <Search className="h-5 w-5" />
              </button>
              <Link href="/account" aria-label="Account">
                <Button variant="ghost" size="icon" className="hover:bg-[#87a96b]/10">
                  <User className="h-5 w-5 text-[#2c2c2c]" />
                </Button>
              </Link>
              <Link href="/cart" aria-label="Cart">
                <Button variant="ghost" size="icon" className="hover:bg-[#87a96b]/10">
                  <ShoppingCart className="h-5 w-5 text-[#2c2c2c]" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e5e7eb] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2 hover:bg-[#87a96b]/10 rounded-md transition-colors">
                    <Menu className="h-6 w-6 text-[#2c2c2c]" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] bg-gradient-to-b from-white to-[#faf9f6] overflow-y-auto">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-4 mt-4 pb-6">
                  <Link href="/" className="flex items-center gap-2 px-4 mb-1" onClick={() => setOpen(false)}>
                    <Image src="/logo.svg" alt="The Plant Nursery" width={40} height={40} className="h-10" style={{ width: 'auto' }} />
                    <span className="font-serif text-2xl font-bold text-[#2d5016]">The Plant Nursery</span>
                  </Link>

                  <div className="flex flex-col gap-1">
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-4 py-2 text-base font-medium text-[#2c2c2c] hover:bg-[#87a96b]/10 hover:text-[#2d5016] transition-all rounded-lg mx-2"
                      onClick={() => setOpen(false)}
                    >
                      <Home className="h-5 w-5" />
                      <span>Home</span>
                    </Link>

                    <div className="flex flex-col gap-1 mt-2">
                      <div className="px-4 mb-1">
                        <span className="text-xs font-bold text-[#87a96b] uppercase tracking-wider">
                          Shop by Category
                        </span>
                      </div>
                      {navCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <Link
                            key={category.slug}
                            href={`/categories/${category.slug}`}
                            className="flex items-center gap-3 px-4 py-2 text-base font-medium text-[#2c2c2c] hover:bg-[#87a96b]/10 hover:text-[#2d5016] transition-all rounded-lg mx-2 group"
                            onClick={() => setOpen(false)}
                          >
                            <div className="w-9 h-9 rounded-lg bg-[#87a96b]/20 flex items-center justify-center group-hover:bg-[#2d5016] transition-colors">
                              <Icon className="h-4 w-4 text-[#2d5016] group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{category.name}</div>
                              <div className="text-xs text-muted-foreground">{category.description}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    <div className="border-t border-[#e5e7eb] mt-2 pt-2 flex flex-col gap-1">
                      <Link
                        href="/plant-finder"
                        className="flex items-center gap-3 px-4 py-2 text-base font-medium text-[#2c2c2c] hover:bg-[#87a96b]/10 hover:text-[#2d5016] transition-all rounded-lg mx-2"
                        onClick={() => setOpen(false)}
                      >
                        <Compass className="h-5 w-5" />
                        <span>Plant Finder</span>
                      </Link>
                      <Link
                        href="/plant-care"
                        className="flex items-center gap-3 px-4 py-2 text-base font-medium text-[#2c2c2c] hover:bg-[#87a96b]/10 hover:text-[#2d5016] transition-all rounded-lg mx-2"
                        onClick={() => setOpen(false)}
                      >
                        <Droplets className="h-5 w-5" />
                        <span>Plant Care</span>
                      </Link>
                      <Link
                        href="/guides"
                        className="flex items-center gap-3 px-4 py-2 text-base font-medium text-[#2c2c2c] hover:bg-[#87a96b]/10 hover:text-[#2d5016] transition-all rounded-lg mx-2"
                        onClick={() => setOpen(false)}
                      >
                        <BookOpen className="h-5 w-5" />
                        <span>Guides</span>
                      </Link>
                      <Link
                        href="/blog"
                        className="flex items-center gap-3 px-4 py-2 text-base font-medium text-[#2c2c2c] hover:bg-[#87a96b]/10 hover:text-[#2d5016] transition-all rounded-lg mx-2"
                        onClick={() => setOpen(false)}
                      >
                        <FileText className="h-5 w-5" />
                        <span>Blog</span>
                      </Link>
                      <Link
                        href="/about"
                        className="flex items-center gap-3 px-4 py-2 text-base font-medium text-[#2c2c2c] hover:bg-[#87a96b]/10 hover:text-[#2d5016] transition-all rounded-lg mx-2"
                        onClick={() => setOpen(false)}
                      >
                        <Info className="h-5 w-5" />
                        <span>About</span>
                      </Link>
                      <Link
                        href="/account"
                        className="flex items-center gap-3 px-4 py-2 text-base font-medium text-[#2c2c2c] hover:bg-[#87a96b]/10 hover:text-[#2d5016] transition-all rounded-lg mx-2"
                        onClick={() => setOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>My Account</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="The Plant Nursery" className="h-9 w-auto" />
              <span className="font-serif text-2xl font-bold text-[#2d5016]">The Plant Nursery</span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <div className="group relative">
                <button className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors flex items-center gap-1 py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#2d5016] hover:after:w-full after:transition-all after:duration-300">
                  Categories
                  <ChevronDown className="h-4 w-4" />
                </button>

                <div className="absolute top-full left-0 mt-2 w-[900px] max-h-[600px] overflow-y-auto bg-white border border-[#e5e7eb] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-3">
                      {navCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <Link
                            key={category.slug}
                            href={`/categories/${category.slug}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#87a96b]/10 transition-colors group/item"
                          >
                            <div className="w-12 h-12 rounded-md bg-[#87a96b]/20 flex items-center justify-center flex-shrink-0 group-hover/item:bg-[#2d5016] transition-colors">
                              <Icon className="h-6 w-6 text-[#2d5016] group-hover/item:text-white transition-colors" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-[#2c2c2c] group-hover/item:text-[#2d5016] transition-colors truncate">
                                {category.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">{category.description}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/plant-finder"
                className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#2d5016] hover:after:w-full after:transition-all after:duration-300"
              >
                Plant Finder
              </Link>
              <Link
                href="/plant-care"
                className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#2d5016] hover:after:w-full after:transition-all after:duration-300"
              >
                Plant Care
              </Link>
              <Link
                href="/guides"
                className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#2d5016] hover:after:w-full after:transition-all after:duration-300"
              >
                Guides
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#2d5016] hover:after:w-full after:transition-all after:duration-300"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-[#2c2c2c] hover:text-[#2d5016] transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#2d5016] hover:after:w-full after:transition-all after:duration-300"
              >
                About
              </Link>
              <Link href="/account">
                <Button variant="ghost" size="icon" className="hover:bg-[#87a96b]/10">
                  <User className="h-5 w-5 text-[#2c2c2c]" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Temporarily removed SearchBar to test */}
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/account">
              <Button variant="ghost" size="icon" className="hover:bg-[#87a96b]/10">
                <User className="h-5 w-5 text-[#2c2c2c]" />
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-[#87a96b]/10">
                <ShoppingCart className="h-5 w-5 text-[#2c2c2c]" />
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#2d5016] text-white text-xs flex items-center justify-center font-medium">
                  2
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
