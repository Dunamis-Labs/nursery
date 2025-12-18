# Components Directory

This directory contains all React components for the Nursery web application.

## Structure

```
components/
├── ui/              # shadcn/ui base components (Button, Card, Input, etc.)
├── layout/          # Layout components (Header, Footer, Navigation)
├── product/         # Product-related components (ProductCard, ProductGrid, etc.)
├── category/        # Category components (CategoryCard, CategoryGrid)
└── search/          # Search components (SearchBar, SearchResults)
```

## Adding Components from v0.dev

1. **Copy the component code** from v0.dev
2. **Create a new file** in the appropriate directory:
   ```bash
   # Example: Product card component
   touch components/product/product-card.tsx
   ```
3. **Paste and adapt**:
   - Fix imports to use `@/` aliases
   - Replace mock data with real Prisma queries
   - Add TypeScript types
   - Update styling to match design system
4. **Export** the component:
   ```tsx
   export { ProductCard } from './product-card';
   ```

## Design System

- **Colors**: See `tailwind.config.js` and `app/globals.css`
- **Fonts**: 
  - Headings: `font-heading` (Playfair Display)
  - Body: `font-body` (Inter)
  - Botanical names: `font-mono` (JetBrains Mono)
- **Spacing**: Use Tailwind spacing scale (p-4, p-6, gap-4, etc.)
- **Border Radius**: `rounded-lg` (8px) for cards, `rounded-md` (6px) for buttons

## TypeScript Types

Import types from Prisma:
```tsx
import { Product, Category } from '@prisma/client';

type ProductWithCategory = Product & {
  category: Category | null;
};
```

## Utilities

Use the `cn()` utility for merging Tailwind classes:
```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-classes', condition && 'conditional-classes')} />
```

## Next Steps

See `docs/v0-integration-guide.md` for detailed integration instructions.

