# v0.dev Quick Start Guide

## 🎯 Quick Integration Steps

### 1. Copy Your v0 Components

Copy your v0.dev-generated components to:
- `apps/web/components/[category]/[component-name].tsx`

### 2. Fix Imports

Replace relative imports with `@/` aliases:
```tsx
// Before (v0.dev)
import { Button } from './ui/button'

// After (integrated)
import { Button } from '@/components/ui/button'
```

### 3. Replace Mock Data

Replace placeholder data with Prisma queries:
```tsx
// Before
const products = [{ name: 'Plant', price: 10 }]

// After
const products = await prisma.product.findMany({
  include: { category: true },
})
```

### 4. Add TypeScript Types

```tsx
// Before
export function ProductCard({ product }) {

// After
import { Product } from '@prisma/client'

interface ProductCardProps {
  product: Product & { category?: { name: string } }
}

export function ProductCard({ product }: ProductCardProps) {
```

### 5. Update Styling

Ensure components use design system classes:
- `font-heading` for headings
- `text-primary` for primary color (#2d5016)
- `text-secondary` for secondary color (#87a96b)
- `rounded-lg` for cards (8px)
- `rounded-md` for buttons (6px)

---

## 📋 Integration Checklist

- [ ] Component copied to correct directory
- [ ] Imports fixed (`@/` aliases)
- [ ] Mock data replaced with Prisma queries
- [ ] TypeScript types added
- [ ] Design system colors applied
- [ ] Images use `next/image`
- [ ] Links use `next/link`
- [ ] Responsive design tested

---

## 🔄 Future v0 Development

When creating new pages/features:

1. **Generate in v0.dev** using prompts from `docs/v0-integration-strategy.md`
2. **Copy code** to appropriate component file
3. **Adapt** following steps above
4. **Test** and commit

---

## 📚 Full Documentation

- **Integration Guide**: `docs/v0-integration-guide.md`
- **Strategy & Prompts**: `docs/v0-integration-strategy.md`
- **UI Plan**: `docs/ui-plan.md`

---

## 🆘 Need Help?

Common issues:
- **Import errors**: Check `tsconfig.json` has `@/*` path alias
- **Missing components**: Run `npx shadcn-ui@latest add [component]`
- **Colors wrong**: Verify `tailwind.config.js` and `globals.css`

