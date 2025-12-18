# Integrating a Full v0.dev Frontend Codebase

When v0.dev exports a complete frontend codebase (zip file or full project), here's how to integrate it with your existing Nursery codebase.

---

## 📦 What v0.dev Exports

v0.dev typically exports:
- A complete Next.js project structure
- Components in `app/` or `components/` directories
- `package.json` with dependencies
- Tailwind config
- Type definitions

---

## 🎯 Integration Strategy

**Don't replace your entire codebase!** Instead, extract and integrate the components you need.

---

## Step 1: Extract the v0 Codebase

### Option A: If v0 gave you a ZIP file
```bash
# Extract to a temporary location
cd ~/Downloads  # or wherever you downloaded it
unzip v0-frontend.zip -d v0-temp
cd v0-temp
```

### Option B: If v0 gave you code blocks
- Copy all the code into a temporary directory
- Create the file structure manually

---

## Step 2: Identify What to Copy

### ✅ Copy These:
- **Components** (`components/` or `app/components/`)
- **Page components** (`app/` pages - but adapt them)
- **UI components** (shadcn/ui components if custom)
- **Types** (`types/` or type definitions)
- **Utilities** (`lib/utils.ts` - merge with existing)

### ❌ Don't Copy These:
- `package.json` (we'll merge dependencies)
- `next.config.js` (keep your existing)
- `tsconfig.json` (keep your existing)
- `tailwind.config.js` (we've already configured it)
- `app/api/` routes (keep your existing API routes)
- Database/Prisma files (keep your existing)

---

## Step 3: Copy Components

### A. Copy UI Components (shadcn/ui)

If v0 generated custom shadcn/ui components:

```bash
# From v0 codebase
cd /path/to/v0-temp

# Copy shadcn/ui components (if they exist)
cp -r components/ui/* /path/to/nursery/apps/web/components/ui/

# Or copy specific components
cp components/ui/button.tsx /path/to/nursery/apps/web/components/ui/
cp components/ui/card.tsx /path/to/nursery/apps/web/components/ui/
# ... etc
```

**Note**: If components already exist, compare and merge manually.

### B. Copy Your Custom Components

```bash
# Copy layout components
cp -r components/layout/* /path/to/nursery/apps/web/components/layout/

# Copy product components
cp -r components/product/* /path/to/nursery/apps/web/components/product/

# Copy category components
cp -r components/category/* /path/to/nursery/apps/web/components/category/

# Copy search components
cp -r components/search/* /path/to/nursery/apps/web/components/search/
```

### C. Copy Page Components (Adapt Them)

v0 might have created pages in `app/`. Copy them but adapt for your structure:

```bash
# Example: Copy homepage
cp app/page.tsx /path/to/nursery/apps/web/app/page.tsx.backup

# Then manually merge/adapt the content
```

---

## Step 4: Fix Import Paths

v0 components will have import paths that need updating. Use find/replace:

### Common Fixes:

1. **Update component imports**:
   ```tsx
   // Before (v0)
   import { Button } from '@/components/ui/button'
   
   // After (should work, but verify @/ alias)
   import { Button } from '@/components/ui/button'
   ```

2. **Update relative imports**:
   ```tsx
   // Before (v0)
   import { ProductCard } from '../components/product-card'
   
   // After
   import { ProductCard } from '@/components/product/product-card'
   ```

3. **Update image imports**:
   ```tsx
   // Before (v0)
   import Image from 'next/image'  // ✅ This is fine
   ```

### Automated Fix Script

Create a script to fix common import issues:

```bash
#!/bin/bash
# scripts/fix-v0-imports.sh

cd apps/web

# Fix common import patterns
find components -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e "s|from '@/components/ui|from '@/components/ui|g" \
  -e "s|from '../ui/|from '@/components/ui/|g" \
  -e "s|from './ui/|from '@/components/ui/|g" \
  -e "s|from '@/lib/utils|from '@/lib/utils|g"
```

---

## Step 5: Merge Dependencies

Check v0's `package.json` and add missing dependencies:

```bash
cd apps/web

# Check what v0 used
cat /path/to/v0-temp/package.json | grep -A 50 '"dependencies"'

# Install missing packages
npm install @radix-ui/react-accordion
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
# ... etc (see list below)
```

### Common v0 Dependencies:

```bash
npm install @radix-ui/react-accordion
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-slider
npm install @radix-ui/react-label
npm install @radix-ui/react-popover
npm install lucide-react
npm install clsx
npm install tailwind-merge
npm install class-variance-authority  # If v0 uses it
```

---

## Step 6: Replace Mock Data with Real Data

v0 components will have placeholder/mock data. Replace with Prisma queries:

### Example: Homepage

**Before (v0 generated):**
```tsx
// app/page.tsx
export default function HomePage() {
  const products = [
    { id: '1', name: 'Plant', price: 10 },
    { id: '2', name: 'Tree', price: 20 },
  ];
  
  return <ProductGrid products={products} />;
}
```

**After (integrated):**
```tsx
// app/page.tsx
import { prisma } from '@nursery/db';
import { ProductGrid } from '@/components/product/product-grid';

export default async function HomePage() {
  const products = await prisma.product.findMany({
    take: 12,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
  
  return <ProductGrid products={products} />;
}
```

### Example: Product Card Component

**Before (v0):**
```tsx
// components/product/product-card.tsx
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

**After (integrated):**
```tsx
// components/product/product-card.tsx
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

---

## Step 7: Update Page Routes

v0 might have created pages in `app/` that need to match your route structure:

### Your Route Structure:
```
app/
├── page.tsx                    # Homepage
├── products/
│   ├── page.tsx                # Products listing
│   └── [id]/
│       └── page.tsx            # Product detail
├── categories/
│   └── [slug]/
│       └── page.tsx            # Category page
└── admin/
    └── import/
        └── page.tsx            # Admin (keep existing)
```

### Adapt v0 Pages:

1. **Homepage** (`app/page.tsx`):
   - Copy v0's homepage component
   - Replace mock data with Prisma queries
   - Keep your existing metadata

2. **Product Pages**:
   - Copy v0's product detail component to `app/products/[id]/page.tsx`
   - Adapt to use your API route or Prisma directly

3. **Category Pages**:
   - Copy v0's category browse to `app/categories/[slug]/page.tsx`
   - Connect to your category API

---

## Step 8: Handle Type Definitions

If v0 created type definitions:

```bash
# Copy types (if they exist)
cp -r /path/to/v0-temp/types/* apps/web/types/ 2>/dev/null || true

# Or merge manually into existing types
```

Update types to use Prisma types:

```tsx
// Before (v0)
export type Product = {
  id: string;
  name: string;
  price: number;
};

// After (integrated)
import { Product } from '@prisma/client';

export type ProductWithCategory = Product & {
  category: { name: string } | null;
};
```

---

## Step 9: Merge Utilities

If v0 created `lib/utils.ts`, merge with your existing:

```bash
# Compare utilities
diff apps/web/lib/utils.ts /path/to/v0-temp/lib/utils.ts

# Manually merge any additional utility functions
```

Your existing `utils.ts` has `cn()` - v0's should be the same. If v0 has additional utilities, add them.

---

## Step 10: Test Everything

```bash
cd apps/web

# Install dependencies
npm install

# Type check
npm run type-check

# Start dev server
npm run dev
```

### Test Checklist:
- [ ] Homepage loads
- [ ] Product pages work
- [ ] Category pages work
- [ ] Components render correctly
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Images load
- [ ] Links work
- [ ] Responsive design works

---

## 🚨 Common Issues & Solutions

### Issue: Import errors with `@/` alias
**Solution**: Verify `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: Missing shadcn/ui components
**Solution**: Install missing components:
```bash
npx shadcn-ui@latest add [component-name]
```

### Issue: Type errors with Product/Category types
**Solution**: Import from Prisma:
```tsx
import { Product, Category } from '@prisma/client';
```

### Issue: Colors/styles don't match
**Solution**: Your Tailwind config is already set up. Components should use:
- `text-primary` for Forest Green (#2d5016)
- `text-secondary` for Sage Green (#87a96b)
- `font-heading` for Playfair Display
- `font-body` for Inter

### Issue: Images not loading
**Solution**: Ensure images use `next/image` and have proper `src` paths:
```tsx
import Image from 'next/image';

<Image 
  src={product.imageUrl || '/placeholder.jpg'}
  alt={product.name}
  width={400}
  height={400}
/>
```

---

## 📋 Quick Integration Checklist

- [ ] Extracted v0 codebase to temporary location
- [ ] Identified components to copy
- [ ] Copied UI components to `components/ui/`
- [ ] Copied custom components to appropriate directories
- [ ] Fixed all import paths (`@/` aliases)
- [ ] Installed missing npm dependencies
- [ ] Replaced mock data with Prisma queries
- [ ] Added TypeScript types (Prisma types)
- [ ] Updated page routes to match your structure
- [ ] Merged utilities if needed
- [ ] Tested all pages
- [ ] Verified no TypeScript errors
- [ ] Verified responsive design works

---

## 🎯 Recommended Integration Order

1. **Start with UI components** (Button, Card, etc.) - least dependencies
2. **Then layout components** (Header, Footer) - foundation
3. **Then product components** (ProductCard, ProductGrid) - core functionality
4. **Then pages** (Homepage, Product Detail) - full integration
5. **Finally, polish** (animations, loading states, error handling)

---

## 💡 Pro Tips

1. **Copy incrementally**: Don't copy everything at once. Copy one component type at a time, test, then move on.

2. **Keep backups**: Before overwriting existing files, create backups:
   ```bash
   cp app/page.tsx app/page.tsx.backup
   ```

3. **Use Git**: Commit after each successful integration step:
   ```bash
   git add components/product/
   git commit -m "Add product components from v0"
   ```

4. **Test as you go**: After copying each component, test it immediately.

5. **Compare files**: Use `diff` to see what changed:
   ```bash
   diff apps/web/components/product/product-card.tsx /path/to/v0-temp/components/product-card.tsx
   ```

---

## 📚 Related Documentation

- **Integration Guide**: `docs/v0-integration-guide.md`
- **Quick Start**: `docs/v0-quick-start.md`
- **Strategy & Prompts**: `docs/v0-integration-strategy.md`

---

*This guide assumes v0 exported a complete Next.js project. If v0 gave you individual components, use `docs/v0-integration-guide.md` instead.*

