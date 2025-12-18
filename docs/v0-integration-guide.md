# v0.dev Integration Guide

## Quick Start: Integrating Your v0 Frontend

This guide walks you through integrating your v0.dev-generated frontend with the Nursery codebase and setting up a workflow for future v0 development.

---

## 📋 Pre-Integration Checklist

Before integrating your v0 components, ensure:

- [ ] You have exported the code from v0.dev
- [ ] You've reviewed the components for quality
- [ ] You know which pages/components you've built
- [ ] You have the design system colors/fonts documented

---

## 🏗️ Step 1: Set Up Component Structure

### Create Component Directories

```bash
cd apps/web
mkdir -p components/ui          # shadcn/ui base components
mkdir -p components/layout       # Header, Footer, Navigation
mkdir -p components/product      # ProductCard, ProductGrid, etc.
mkdir -p components/category     # CategoryCard, CategoryGrid
mkdir -p components/search       # SearchBar, SearchResults
mkdir -p lib/utils               # Utility functions (cn, etc.)
```

---

## 🎨 Step 2: Configure Design System

### Update Tailwind Config

Update `apps/web/tailwind.config.js` with your design system:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Design System Colors
        primary: {
          DEFAULT: '#2d5016',  // Forest Green
          light: '#4a7c2a',
          dark: '#1a3009',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#87a96b',  // Sage Green
          light: '#a8c48a',
          dark: '#6b8554',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#8b6f47',  // Warm Earth
          foreground: '#ffffff',
        },
        background: '#faf9f6',  // Cream White
        foreground: '#2c2c2c',   // Charcoal
        muted: {
          DEFAULT: '#6b7280',   // Gray
          foreground: '#ffffff',
        },
        border: '#e5e7eb',      // Light Gray
        // shadcn/ui compatibility
        card: {
          DEFAULT: '#ffffff',
          foreground: '#2c2c2c',
        },
        input: '#ffffff',
        ring: '#2d5016',
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#2c2c2c',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### Update Layout with Fonts

Update `apps/web/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
});

export const metadata: Metadata = {
  title: 'Online Nursery - Plants, Trees & Garden Supplies',
  description: 'Discover a wide selection of plants, trees, and garden supplies. Expert advice and quality products for your garden.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-body`}>
        {children}
      </body>
    </html>
  );
}
```

### Update Global CSS

Update `apps/web/app/globals.css` with design system variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 250 249 246; /* #faf9f6 */
    --foreground: 44 44 44;     /* #2c2c2c */
    
    --primary: 45 80 22;        /* #2d5016 */
    --primary-foreground: 255 255 255;
    
    --secondary: 135 169 107;   /* #87a96b */
    --secondary-foreground: 255 255 255;
    
    --accent: 139 111 71;       /* #8b6f47 */
    --accent-foreground: 255 255 255;
    
    --muted: 107 114 128;       /* #6b7280 */
    --muted-foreground: 255 255 255;
    
    --border: 229 231 235;      /* #e5e7eb */
    --input: 255 255 255;
    --ring: 45 80 22;           /* #2d5016 */
    
    --radius: 8px;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading;
  }
}
```

---

## 📦 Step 3: Install Required Dependencies

Install shadcn/ui and required Radix UI components:

```bash
cd apps/web

# Install shadcn/ui CLI (if not already installed globally)
npm install -g shadcn-ui@latest

# Initialize shadcn/ui (if not already done)
npx shadcn-ui@latest init

# Install common components you'll need
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add checkbox
```

Or install manually:

```bash
npm install @radix-ui/react-accordion
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-slider
npm install lucide-react
npm install clsx tailwind-merge
```

---

## 🔧 Step 4: Create Utility Functions

Create `apps/web/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 📝 Step 5: Integration Workflow

### A. Copy Components from v0.dev

1. **Review Generated Code**
   - Check component structure
   - Note any dependencies
   - Identify mock data that needs replacement

2. **Copy to Correct Location**
   ```bash
   # Example: Copying a ProductCard component
   # From v0.dev → apps/web/components/product/product-card.tsx
   ```

3. **Fix Import Paths**
   - Update relative imports to use `@/` alias
   - Ensure shadcn/ui components use `@/components/ui/`
   - Update image imports to use `next/image`

### B. Replace Mock Data with Real Data

**Before (v0.dev generated):**
```tsx
export function ProductCard({ product }) {
  return (
    <Card>
      <img src={product.image} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
    </Card>
  );
}
```

**After (Integrated):**
```tsx
import { Product } from '@prisma/client';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product & { category?: { name: string } };
}

export function ProductCard({ product }: ProductCardProps) {
  const images = (product.images as string[]) || [];
  const imageUrl = images[0] || product.imageUrl || '/placeholder-plant.jpg';
  
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <Image 
          src={imageUrl}
          alt={product.name}
          width={400}
          height={400}
          className="rounded-lg object-cover aspect-square"
        />
        <div className="p-4">
          <h3 className="font-heading text-lg font-bold">{product.name}</h3>
          {product.botanicalName && (
            <p className="font-mono text-sm italic text-muted-foreground">
              {product.botanicalName}
            </p>
          )}
          <p className="text-xl font-bold text-primary mt-2">
            ${product.price?.toFixed(2) || 'N/A'}
          </p>
        </div>
      </Card>
    </Link>
  );
}
```

### C. Convert to Server Components (Where Appropriate)

**For pages that fetch data:**
```tsx
// app/products/page.tsx
import { prisma } from '@nursery/db';
import { ProductGrid } from '@/components/product/product-grid';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    take: 24,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container py-8">
      <h1 className="font-heading text-4xl mb-8">All Products</h1>
      <ProductGrid products={products} />
    </div>
  );
}
```

---

## 🗂️ Step 6: Component Organization

Organize your components like this:

```
apps/web/
├── components/
│   ├── ui/              # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── navigation.tsx
│   ├── product/          # Product-related components
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-detail.tsx
│   │   └── product-gallery.tsx
│   ├── category/         # Category components
│   │   ├── category-card.tsx
│   │   └── category-grid.tsx
│   └── search/           # Search components
│       ├── search-bar.tsx
│       └── search-results.tsx
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Homepage
│   ├── products/
│   │   ├── page.tsx      # Products listing
│   │   └── [id]/
│   │       └── page.tsx  # Product detail
│   └── categories/
│       └── [slug]/
│           └── page.tsx  # Category page
└── lib/
    ├── utils.ts
    └── db/
        └── client.ts
```

---

## 🚀 Step 7: Create Pages

### Homepage (`app/page.tsx`)

```tsx
import { prisma } from '@nursery/db';
import { CategoryGrid } from '@/components/category/category-grid';
import { ProductGrid } from '@/components/product/product-grid';
import { Hero } from '@/components/layout/hero';

export default async function HomePage() {
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
      <Hero />
      <section className="container py-12">
        <h2 className="font-heading text-3xl mb-8">Shop by Category</h2>
        <CategoryGrid categories={categories} />
      </section>
      <section className="container py-12">
        <h2 className="font-heading text-3xl mb-8">Featured Products</h2>
        <ProductGrid products={featuredProducts} />
      </section>
    </div>
  );
}
```

### Product Detail Page (`app/products/[id]/page.tsx`)

```tsx
import { prisma } from '@nursery/db';
import { notFound } from 'next/navigation';
import { ProductDetail } from '@/components/product/product-detail';
import { ProductGrid } from '@/components/product/product-grid';

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Get related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: { category: true },
  });

  return (
    <div className="container py-8">
      <ProductDetail product={product} />
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="font-heading text-3xl mb-8">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
```

---

## 🔄 Step 8: Future v0 Development Workflow

### When Creating New Pages/Features in v0:

1. **Generate in v0.dev**
   - Use the prompt templates from `docs/v0-integration-strategy.md`
   - Include the design system specifications
   - Iterate until satisfied

2. **Export Code**
   - Copy the generated code
   - Review for quality

3. **Create Component File**
   ```bash
   # Create new component file
   touch apps/web/components/[category]/[component-name].tsx
   ```

4. **Paste and Adapt**
   - Paste v0 code
   - Fix imports (`@/` aliases)
   - Replace mock data with Prisma queries
   - Add TypeScript types
   - Update styling to match design system

5. **Test**
   - Check responsive design
   - Verify API integration
   - Test accessibility

6. **Commit**
   ```bash
   git add apps/web/components/[category]/[component-name].tsx
   git commit -m "Add [component-name] from v0.dev"
   ```

---

## 📚 Step 9: TypeScript Types

Create shared types in `apps/web/types/index.ts`:

```typescript
import { Product, Category } from '@prisma/client';

export type ProductWithCategory = Product & {
  category: Category | null;
};

export type CategoryWithCount = Category & {
  _count: {
    products: number;
  };
};
```

---

## ✅ Integration Checklist

After integrating your v0 components:

- [ ] All components copied to correct directories
- [ ] Import paths updated (`@/` aliases)
- [ ] Mock data replaced with Prisma queries
- [ ] TypeScript types added
- [ ] Design system colors applied
- [ ] Fonts configured (Playfair Display, Inter, JetBrains Mono)
- [ ] Images use `next/image`
- [ ] Links use `next/link`
- [ ] Responsive design tested
- [ ] API routes connected
- [ ] Error handling added
- [ ] Loading states added
- [ ] SEO metadata added

---

## 🐛 Common Issues & Solutions

### Issue: Import errors with `@/` alias
**Solution**: Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: shadcn/ui components not found
**Solution**: Run `npx shadcn-ui@latest add [component-name]` for each component

### Issue: Colors not matching design system
**Solution**: Update `tailwind.config.js` and `globals.css` with correct color values

### Issue: Fonts not loading
**Solution**: Ensure fonts are imported in `layout.tsx` and CSS variables are set

---

## 📖 Next Steps

1. **Integrate Your Components**: Follow steps 1-7 above
2. **Test Everything**: Verify all pages work correctly
3. **Optimize**: Add loading states, error boundaries, SEO
4. **Deploy**: Push to production

---

## 🎯 Quick Reference

- **Components**: `apps/web/components/`
- **Pages**: `apps/web/app/`
- **API Routes**: `apps/web/app/api/`
- **Utils**: `apps/web/lib/utils.ts`
- **Types**: `apps/web/types/`
- **Design System**: See `docs/v0-integration-strategy.md`

---

*For detailed prompt templates and design system specs, see `docs/v0-integration-strategy.md`*

