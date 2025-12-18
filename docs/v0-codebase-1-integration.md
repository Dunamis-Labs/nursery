# v0-codebase-1 Integration Guide

This guide is specific to integrating the v0 codebase located at `docs/source-files/v0-codebase-1/`.

## 📋 What's in the v0 Codebase

### Pages (`app/`):
- ✅ Homepage (`page.tsx`)
- ✅ Product detail (`products/[id]/page.tsx`)
- ✅ Category browse (`categories/[slug]/page.tsx`)
- ✅ Blog pages
- ✅ Account pages (sign-in, register, orders, etc.)
- ✅ Cart & Checkout
- ✅ Plant Finder
- ✅ Guides & Plant Care

### Components (`components/`):
- ✅ **UI Components**: Full shadcn/ui library (57+ components)
- ✅ **Layout**: Navigation, Footer, Hero Section
- ✅ **Product**: ProductGrid, ProductImageGallery, ProductInfo, ProductTabs, etc.
- ✅ **Category**: CategoryGrid, CategoryHero, FilterSidebar, etc.
- ✅ **Search**: SearchBar
- ✅ **Blog**: Blog components
- ✅ **Other**: Plant Finder, Guides, Cart, Checkout

### Other:
- ✅ Hooks (`hooks/`)
- ✅ Utilities (`lib/utils.ts`)
- ✅ Public assets (`public/`)
- ✅ Components config (`components.json`)

---

## 🚀 Quick Integration

### Step 1: Run the Integration Script

```bash
cd /Users/benjaminbeath/Documents/Dunamis\ Labs/Nursery
./scripts/integrate-v0-specific.sh
```

This will:
- Copy all UI components to `apps/web/components/ui/`
- Copy custom components to appropriate directories
- Copy hooks to `apps/web/hooks/`
- Merge utilities
- Copy public assets
- Create backups of existing files

### Step 2: Install Missing Dependencies

```bash
cd apps/web

# Install all Radix UI dependencies
npm install @radix-ui/react-accordion@1.2.2
npm install @radix-ui/react-alert-dialog@1.1.4
npm install @radix-ui/react-aspect-ratio@1.1.1
npm install @radix-ui/react-avatar@1.1.2
npm install @radix-ui/react-checkbox@1.1.3
npm install @radix-ui/react-collapsible@1.1.2
npm install @radix-ui/react-context-menu@2.2.4
npm install @radix-ui/react-dialog@1.1.4
npm install @radix-ui/react-dropdown-menu@2.1.4
npm install @radix-ui/react-hover-card@1.1.4
npm install @radix-ui/react-label@2.1.1
npm install @radix-ui/react-menubar@1.1.4
npm install @radix-ui/react-navigation-menu@1.2.3
npm install @radix-ui/react-popover@1.1.4
npm install @radix-ui/react-progress@1.1.1
npm install @radix-ui/react-radio-group@1.2.2
npm install @radix-ui/react-scroll-area@1.2.2
npm install @radix-ui/react-select@2.1.4
npm install @radix-ui/react-separator@1.1.1
npm install @radix-ui/react-slider@1.2.2
npm install @radix-ui/react-slot@1.1.1
npm install @radix-ui/react-switch@1.1.2
npm install @radix-ui/react-tabs@1.1.2
npm install @radix-ui/react-toast@1.2.4
npm install @radix-ui/react-toggle@1.1.1
npm install @radix-ui/react-toggle-group@1.1.1
npm install @radix-ui/react-tooltip@1.1.6

# Install other dependencies
npm install @hookform/resolvers@^3.10.0
npm install class-variance-authority@^0.7.1
npm install cmdk@1.0.4
npm install date-fns@4.1.0
npm install embla-carousel-react@8.5.1
npm install input-otp@1.4.1
npm install next-themes@^0.4.6
npm install react-day-picker@9.8.0
npm install react-hook-form@^7.60.0
npm install react-resizable-panels@^2.1.7
npm install recharts@2.15.4
npm install sonner@^1.7.4
npm install vaul@^1.1.2
```

Or install all at once:
```bash
npm install @hookform/resolvers@^3.10.0 @radix-ui/react-accordion@1.2.2 @radix-ui/react-alert-dialog@1.1.4 @radix-ui/react-aspect-ratio@1.1.1 @radix-ui/react-avatar@1.1.2 @radix-ui/react-checkbox@1.1.3 @radix-ui/react-collapsible@1.1.2 @radix-ui/react-context-menu@2.2.4 @radix-ui/react-dialog@1.1.4 @radix-ui/react-dropdown-menu@2.1.4 @radix-ui/react-hover-card@1.1.4 @radix-ui/react-label@2.1.1 @radix-ui/react-menubar@1.1.4 @radix-ui/react-navigation-menu@1.2.3 @radix-ui/react-popover@1.1.4 @radix-ui/react-progress@1.1.1 @radix-ui/react-radio-group@1.2.2 @radix-ui/react-scroll-area@1.2.2 @radix-ui/react-select@2.1.4 @radix-ui/react-separator@1.1.1 @radix-ui/react-slider@1.2.2 @radix-ui/react-slot@1.1.1 @radix-ui/react-switch@1.1.2 @radix-ui/react-tabs@1.1.2 @radix-ui/react-toast@1.2.4 @radix-ui/react-toggle@1.1.1 @radix-ui/react-toggle-group@1.1.1 @radix-ui/react-tooltip@1.1.6 class-variance-authority@^0.7.1 cmdk@1.0.4 date-fns@4.1.0 embla-carousel-react@8.5.1 input-otp@1.4.1 next-themes@^0.4.6 react-day-picker@9.8.0 react-hook-form@^7.60.0 react-resizable-panels@^2.1.7 recharts@2.15.4 sonner@^1.7.4 vaul@^1.1.2
```

### Step 3: Fix Import Paths

The v0 codebase uses `@/components` which should work, but verify:

1. Check `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

2. Update component imports if needed:
```tsx
// Should already work, but verify:
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/product-grid'
```

### Step 4: Adapt Pages

The v0 pages use mock data. You need to:

1. **Homepage** (`app/page.tsx`):
   - Replace mock data with Prisma queries
   - Connect to your database

2. **Product Detail** (`app/products/[id]/page.tsx`):
   - Use your existing API route or Prisma
   - Connect to product data

3. **Category Browse** (`app/categories/[slug]/page.tsx`):
   - Connect to category API
   - Use your category data

### Step 5: Update Layout

The v0 `layout.tsx` might need updates:
- Keep your existing metadata
- Add ThemeProvider if using dark mode
- Ensure fonts are configured

---

## 📝 Component Mapping

### Layout Components:
- `navigation.tsx` → `components/layout/navigation.tsx`
- `footer.tsx` → `components/layout/footer.tsx`
- `hero-section.tsx` → `components/layout/hero-section.tsx`
- `theme-provider.tsx` → `components/layout/theme-provider.tsx`

### Product Components:
- `product-grid.tsx` → `components/product/product-grid.tsx`
- `product-image-gallery.tsx` → `components/product/product-image-gallery.tsx`
- `product-info.tsx` → `components/product/product-info.tsx`
- `product-tabs.tsx` → `components/product/product-tabs.tsx`
- `product-faq.tsx` → `components/product/product-faq.tsx`
- `related-products.tsx` → `components/product/related-products.tsx`
- `featured-products.tsx` → `components/product/featured-products.tsx`

### Category Components:
- `category-grid.tsx` → `components/category/category-grid.tsx`
- `category-hero.tsx` → `components/category/category-hero.tsx`
- `category-content.tsx` → `components/category/category-content.tsx`
- `filter-sidebar.tsx` → `components/category/filter-sidebar.tsx`
- `products-top-bar.tsx` → `components/category/products-top-bar.tsx`
- `shop-by-purpose.tsx` → `components/category/shop-by-purpose.tsx`

### Search Components:
- `search-bar.tsx` → `components/search/search-bar.tsx`

---

## 🔧 Adapting Components

### Example: ProductGrid Component

**Before (v0 with mock data):**
```tsx
export function ProductGrid() {
  const products = [
    { id: '1', name: 'Plant', price: 10 },
    // ...
  ];
  return <div>{/* render products */}</div>;
}
```

**After (integrated with Prisma):**
```tsx
import { Product } from '@prisma/client';

interface ProductGridProps {
  products: (Product & { category?: { name: string } })[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return <div>{/* render products */}</div>;
}
```

### Example: Homepage

**Before (v0):**
```tsx
export default function Home() {
  return (
    <div>
      <Navigation />
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
    </div>
  );
}
```

**After (integrated):**
```tsx
import { prisma } from '@nursery/db';
import { Navigation } from '@/components/layout/navigation';
import { HeroSection } from '@/components/layout/hero-section';
import { CategoryGrid } from '@/components/category/category-grid';
import { FeaturedProducts } from '@/components/product/featured-products';

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      take: 8,
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      take: 8,
      where: { availability: 'IN_STOCK' },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div>
      <Navigation />
      <HeroSection />
      <CategoryGrid categories={categories} />
      <FeaturedProducts products={featuredProducts} />
    </div>
  );
}
```

---

## ✅ Integration Checklist

- [ ] Run integration script: `./scripts/integrate-v0-specific.sh`
- [ ] Install all dependencies
- [ ] Fix import paths (verify `@/` aliases work)
- [ ] Update homepage with Prisma queries
- [ ] Update product detail page
- [ ] Update category browse page
- [ ] Replace mock data in all components
- [ ] Add TypeScript types (Prisma types)
- [ ] Test homepage
- [ ] Test product pages
- [ ] Test category pages
- [ ] Verify responsive design
- [ ] Check for TypeScript errors
- [ ] Test navigation
- [ ] Verify images load

---

## 🚨 Common Issues

### Issue: Import errors
**Solution**: Verify `tsconfig.json` has `@/*` path alias

### Issue: Missing components
**Solution**: All UI components should be copied. Check `components/ui/` directory

### Issue: Type errors
**Solution**: Replace mock types with Prisma types:
```tsx
import { Product, Category } from '@prisma/client';
```

### Issue: Mock data still showing
**Solution**: Replace all mock data arrays with Prisma queries

---

## 📚 Next Steps

1. **Run the integration script**
2. **Install dependencies**
3. **Start adapting pages one by one**
4. **Test as you go**

For detailed instructions, see `docs/v0-full-codebase-integration.md`

