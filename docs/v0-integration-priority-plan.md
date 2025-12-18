# v0 Codebase Integration - Priority Plan

Based on your complete v0 frontend, here's a prioritized plan to integrate it with your Nursery database and APIs.

---

## 🎯 Integration Priority

### **Phase 1: Core Shopping Experience** (Week 1)
**Goal**: Get the main shopping flow working with real data

#### 1.1 Homepage (`app/page.tsx`)
**Status**: ✅ Components copied, needs data integration

**Components to Connect**:
- `CategoryGrid` → Connect to `prisma.category.findMany()`
- `FeaturedProducts` → Connect to `prisma.product.findMany()` with filters
- `ShopByPurpose` → Can use static data initially, or create purpose-based categories
- `LatestGuides` → Can be static initially, or create a guides/blog system later

**Action Items**:
```tsx
// Update app/page.tsx
import { prisma } from '@nursery/db';
import { CategoryGrid } from '@/components/category-grid';
import { FeaturedProducts } from '@/components/featured-products';

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      take: 6,
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
      <ShopByPurpose />
      <FeaturedProducts products={featuredProducts} />
      <LatestGuides />
      <Footer />
    </div>
  );
}
```

#### 1.2 Category Browse Page (`app/categories/[slug]/page.tsx`)
**Status**: ✅ Components copied, needs data integration

**Components to Connect**:
- `CategoryHero` → Get category from database
- `FilterSidebar` → Connect filters to product queries
- `ProductGrid` → Connect to filtered products
- `ProductsTopBar` → Show actual product counts

**Action Items**:
```tsx
// Update app/categories/[slug]/page.tsx
import { prisma } from '@nursery/db';
import { notFound } from 'next/navigation';
import { CategoryHero } from '@/components/category-hero';
import { FilterSidebar } from '@/components/filter-sidebar';
import { ProductGrid } from '@/components/product-grid';

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id },
    include: { category: true },
  });

  return (
    <div>
      <Navigation />
      <CategoryHero category={category} />
      <div className="container grid grid-cols-1 lg:grid-cols-4 gap-8">
        <FilterSidebar />
        <div className="lg:col-span-3">
          <ProductsTopBar total={products.length} />
          <ProductGrid products={products} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
```

#### 1.3 Product Detail Page (`app/products/[id]/page.tsx`)
**Status**: ✅ Components copied, needs data integration

**Components to Connect**:
- `ProductImageGallery` → Use product images from database
- `ProductInfo` → Display product data (name, botanical name, price, variants)
- `ProductTabs` → Show description, specifications, care instructions from metadata
- `RelatedProducts` → Find products in same category

**Action Items**:
```tsx
// Update app/products/[id]/page.tsx
import { prisma } from '@nursery/db';
import { notFound } from 'next/navigation';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { ProductInfo } from '@/components/product-info';
import { ProductTabs } from '@/components/product-tabs';
import { RelatedProducts } from '@/components/related-products';

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!product) notFound();

  const images = (product.images as string[]) || [];
  const metadata = (product.metadata as Record<string, unknown>) || {};
  const variants = (metadata.variants as any[]) || [];
  const specifications = (metadata.specifications as Record<string, unknown>) || {};

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { category: true },
  });

  return (
    <div>
      <Navigation />
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductImageGallery images={images} />
          <ProductInfo 
            product={product}
            variants={variants}
          />
        </div>
        <ProductTabs
          description={product.description}
          specifications={specifications}
          careInstructions={metadata.careInstructions as string}
          plantingInstructions={metadata.plantingInstructions as string}
        />
        <RelatedProducts products={relatedProducts} />
      </div>
      <Footer />
    </div>
  );
}
```

---

### **Phase 2: Navigation & Layout** (Week 1-2)
**Goal**: Get global navigation working

#### 2.1 Navigation Component
**Status**: ✅ Copied, needs category data

**Action Items**:
- Connect mega-menu to categories from database
- Connect search to your search API (`/api/search`)
- Cart icon (can be placeholder initially)

#### 2.2 Footer Component
**Status**: ✅ Copied, can use as-is (mostly static links)

---

### **Phase 3: Search & Discovery** (Week 2)
**Goal**: Enable product search

#### 3.1 Search Bar Component
**Status**: ✅ Copied, needs API integration

**Action Items**:
- Connect to `/api/search` endpoint
- Update to search products, categories
- Add search history (localStorage is fine)

#### 3.2 Plant Finder (`/plant-finder`)
**Status**: ✅ Copied, needs product filtering logic

**Action Items**:
- Connect questions to product metadata filters
- Filter products based on:
  - Light conditions → `specifications.position`
  - Care effort → Can infer from care instructions
  - Pet safety → `specifications.petSafe` (may need to add)
  - Space size → `specifications.matureHeight`, `matureWidth`
  - Plant goals → `specifications.airPurifying`, etc.

---

### **Phase 4: Content Pages** (Week 2-3)
**Goal**: Add informational content

#### 4.1 Blog System (`/blog`)
**Status**: ⚠️ Needs database schema

**Decision**: 
- **Option A**: Use static markdown files (simpler)
- **Option B**: Create blog schema in Prisma (more flexible)

**Recommendation**: Start with Option A, migrate to Option B later if needed.

#### 4.2 Guides (`/guides`)
**Status**: ⚠️ Can be static initially

**Action Items**:
- Can use static content initially
- Or create a guides schema later

#### 4.3 About, Plant Care, etc.
**Status**: ✅ Can use as-is (static content)

---

### **Phase 5: E-commerce Features** (Week 3-4)
**Goal**: Shopping cart and checkout

#### 5.1 Cart (`/cart`)
**Status**: ✅ Copied, needs state management

**Action Items**:
- Implement cart state (localStorage or database)
- Connect to product data
- Calculate totals

#### 5.2 Checkout (`/checkout`)
**Status**: ✅ Copied, needs payment integration

**Action Items**:
- Connect to Stripe (or payment provider)
- Save orders to database
- Create order schema if not exists

#### 5.3 Account Pages (`/account/*`)
**Status**: ✅ Copied, needs authentication

**Action Items**:
- Implement authentication (NextAuth.js or similar)
- Create user/order schemas
- Connect order history to database

---

## 📋 Component Adaptation Checklist

### Components That Need Props Updates:

#### `ProductGrid`
```tsx
// Before (v0)
export function ProductGrid() {
  const products = [/* mock data */];
}

// After (integrated)
interface ProductGridProps {
  products: (Product & { category?: { name: string } })[];
}

export function ProductGrid({ products }: ProductGridProps) {
  // Use products prop
}
```

#### `CategoryGrid`
```tsx
// Before (v0)
export function CategoryGrid() {
  const categories = [/* mock data */];
}

// After (integrated)
interface CategoryGridProps {
  categories: (Category & { _count: { products: number } })[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Use categories prop
}
```

#### `ProductInfo`
```tsx
// Before (v0)
export function ProductInfo() {
  const product = {/* mock data */};
}

// After (integrated)
interface ProductInfoProps {
  product: Product & { category?: { name: string } };
  variants?: ProductVariant[];
}

export function ProductInfo({ product, variants }: ProductInfoProps) {
  // Use product and variants props
}
```

---

## 🔧 Database Schema Considerations

### Existing Schema (Good to Go):
- ✅ `Product` - Has all needed fields
- ✅ `Category` - Ready for use
- ✅ Metadata field supports variants, specifications, etc.

### May Need to Add:
- ⚠️ `User` - For authentication/accounts
- ⚠️ `Order` - For checkout/orders
- ⚠️ `OrderItem` - For order line items
- ⚠️ `BlogPost` - If you want dynamic blog (optional)
- ⚠️ `Guide` - If you want dynamic guides (optional)

---

## 🚀 Quick Start Integration Order

1. **Day 1**: Homepage
   - Copy `app/page.tsx` from v0
   - Connect `CategoryGrid` and `FeaturedProducts` to database
   - Test homepage loads

2. **Day 2**: Product Detail Page
   - Copy `app/products/[id]/page.tsx` from v0
   - Connect all product components
   - Test product pages

3. **Day 3**: Category Browse Page
   - Copy `app/categories/[slug]/page.tsx` from v0
   - Connect filters and product grid
   - Test category pages

4. **Day 4**: Navigation & Footer
   - Update Navigation with real categories
   - Test navigation works

5. **Day 5**: Search
   - Connect SearchBar to search API
   - Test search functionality

---

## 📝 Component Props Reference

### Product Component Props:
```tsx
interface ProductCardProps {
  product: Product & {
    category?: { name: string; slug: string };
  };
}

interface ProductDetailProps {
  product: Product & {
    category?: { name: string };
  };
  images: string[];
  variants?: ProductVariant[];
  specifications?: Record<string, unknown>;
  careInstructions?: string;
  plantingInstructions?: string;
}
```

### Category Component Props:
```tsx
interface CategoryCardProps {
  category: Category & {
    _count?: { products: number };
  };
}

interface CategoryPageProps {
  category: Category;
  products: (Product & { category?: { name: string } })[];
}
```

---

## ✅ Integration Status Tracker

### Phase 1: Core Shopping
- [ ] Homepage (`app/page.tsx`)
- [ ] Category Browse (`app/categories/[slug]/page.tsx`)
- [ ] Product Detail (`app/products/[id]/page.tsx`)

### Phase 2: Navigation
- [ ] Navigation component (categories in mega-menu)
- [ ] Footer component
- [ ] Search bar integration

### Phase 3: Search & Discovery
- [ ] Search functionality
- [ ] Plant Finder filtering

### Phase 4: Content
- [ ] Blog (static or dynamic)
- [ ] Guides (static or dynamic)
- [ ] Static pages (About, Plant Care, etc.)

### Phase 5: E-commerce
- [ ] Cart functionality
- [ ] Checkout integration
- [ ] Account/authentication
- [ ] Order management

---

## 🎯 Success Criteria

You'll know integration is successful when:
- ✅ Homepage shows real categories and products
- ✅ Clicking a category shows filtered products
- ✅ Clicking a product shows full details with images
- ✅ Search finds products
- ✅ Navigation works
- ✅ All pages load without errors
- ✅ Responsive design works on mobile/tablet/desktop

---

## 📚 Next Steps

1. **Start with Homepage** - Easiest win, establishes pattern
2. **Then Product Detail** - Core functionality
3. **Then Category Browse** - Completes shopping flow
4. **Then Navigation** - Makes site navigable
5. **Then Search** - Enhances discovery

For each page:
1. Copy the page from v0 codebase
2. Update imports to use `@/` aliases
3. Replace mock data with Prisma queries
4. Add TypeScript types
5. Test and iterate

---

*This plan prioritizes getting the core shopping experience working first, then adds features incrementally.*

