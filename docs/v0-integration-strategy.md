# v0.dev Integration Strategy

## Overview

Using v0.dev (Vercel's AI UI generator) to accelerate frontend development while maintaining code quality and architectural consistency.

---

## ✅ Advantages of Using v0.dev

1. **Rapid Prototyping**: Generate complete component layouts in minutes
2. **Modern Patterns**: Uses latest React patterns, shadcn/ui components
3. **Visual Feedback**: See components before implementing
4. **Iteration Speed**: Quick iterations with prompt-based changes
5. **Component Library**: Built on shadcn/ui (matches our plan)

---

## ⚠️ Considerations & Challenges

1. **Customization Required**: Generated code needs integration with our APIs
2. **Design System Alignment**: May need adjustments to match our color palette/typography
3. **Data Integration**: Need to wire up Prisma queries and API routes
4. **Architecture Consistency**: Ensure generated code follows our patterns
5. **TypeScript Types**: May need to add proper types for our data models

---

## 🎯 Recommended Approach

### Phase 1: Component Generation (v0.dev)
Use v0.dev to generate:
- ✅ **Layout Components** (Header, Footer, Navigation)
- ✅ **Product Cards** (Grid and List views)
- ✅ **Product Detail Page** (Image gallery, tabs, specs)
- ✅ **Category Browse Page** (Filters, grid layout)
- ✅ **Search Interface** (Search bar, results)
- ✅ **Homepage Layout** (Hero, category grid, featured products)

### Phase 2: Integration & Customization
After generation:
1. **Extract Components**: Copy generated code to our component structure
2. **Add TypeScript Types**: Replace `any` types with our Prisma types
3. **Wire Up APIs**: Connect to our existing API routes
4. **Customize Styling**: Adjust colors, fonts to match our design system
5. **Add Server Components**: Convert client components to server where appropriate
6. **Optimize**: Add lazy loading, image optimization, etc.

---

## 📋 v0.dev Prompt Templates

### Design System Specifications

**Include these design system details in ALL prompts:**

```
DESIGN SYSTEM:
- Colors:
  - Primary: #2d5016 (Forest Green) - use for buttons, links, primary actions
  - Secondary: #87a96b (Sage Green) - use for accents, secondary buttons
  - Accent: #8b6f47 (Warm Earth) - use sparingly for highlights
  - Background: #faf9f6 (Cream White) - main background color
  - Text: #2c2c2c (Charcoal) - primary text color
  - Muted text: #6b7280 (Gray) - secondary text
  - Border: #e5e7eb (Light Gray) - borders and dividers

- Typography:
  - Headings: 'Playfair Display', serif - elegant, botanical feel
  - Body: 'Inter', sans-serif - clean, readable
  - Botanical names: 'JetBrains Mono', monospace - technical precision, italic style
  - Font sizes: Use Tailwind defaults (text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl)

- Spacing:
  - Use Tailwind spacing scale (4px base: p-4, p-6, p-8, etc.)
  - Consistent padding: p-4 (16px) for cards, p-6 (24px) for sections
  - Gap between elements: gap-4 (16px) or gap-6 (24px)

- Border Radius:
  - Cards: rounded-lg (8px)
  - Buttons: rounded-md (6px)
  - Images: rounded-lg (8px)

- Shadows:
  - Cards: shadow-sm or shadow-md
  - Hover effects: shadow-lg on hover
  - Subtle, natural shadows

- Imagery:
  - High-quality plant photos
  - Rounded corners (rounded-lg)
  - Aspect ratio: 1:1 for product cards, 16:9 for hero images
  - Hover: slight scale transform (scale-105) with transition
```

### Homepage Prompt
```
Create a modern plant nursery homepage with the following design system:

DESIGN SYSTEM:
- Colors: Primary #2d5016 (Forest Green), Secondary #87a96b (Sage Green), Accent #8b6f47 (Warm Earth), Background #faf9f6 (Cream White), Text #2c2c2c (Charcoal)
- Typography: Headings use 'Playfair Display' serif, Body text uses 'Inter' sans-serif
- Spacing: Use Tailwind spacing scale, consistent padding (p-4 for cards, p-6 for sections)
- Border radius: rounded-lg for cards, rounded-md for buttons

LAYOUT:
- Hero section: Full-width with large plant image background, overlay text with heading and CTA button (primary green #2d5016)
- Category grid: 6-8 category cards in responsive grid (2 cols mobile, 3-4 cols desktop), each card shows image, category name, product count
- "Shop by Purpose" section: Horizontal scrollable row with icon cards (Privacy, Shade, Edible, Flowering, Native, etc.) - use sage green (#87a96b) accents
- Featured products carousel: Horizontal scroll carousel with product cards (image, name, botanical name in italic monospace font, price)
- Latest guides section: 3-4 guide cards in grid, each with image, title, excerpt, read time
- Clean, botanical design aesthetic
- Responsive mobile-first layout (stack on mobile, grid on desktop)
- Use shadcn/ui components (Card, Button, etc.)
- Next.js 14 App Router
- Add subtle hover effects and transitions
```

### Product Detail Page Prompt
```
Create a product detail page for a plant nursery with the following design system:

DESIGN SYSTEM:
- Colors: Primary #2d5016 (Forest Green), Secondary #87a96b (Sage Green), Accent #8b6f47 (Warm Earth), Background #faf9f6 (Cream White), Text #2c2c2c (Charcoal)
- Typography: Headings use 'Playfair Display' serif, Body text uses 'Inter' sans-serif, Botanical names use 'JetBrains Mono' monospace italic
- Spacing: Use Tailwind spacing scale, consistent padding
- Border radius: rounded-lg for images and cards

LAYOUT:
- Image gallery on left (60% width desktop): Main large image with thumbnail strip below, zoom on hover
- Product info on right (40% width desktop): 
  - Product name (Playfair Display, large, bold)
  - Botanical name (JetBrains Mono, italic, smaller, gray)
  - Price (large, bold, primary green)
  - Variants selector (size dropdown with sage green accent)
  - Availability badge (green for in stock, red for out of stock)
  - Add to cart button (primary green #2d5016, rounded-md)
  - Share buttons (social icons)
- Tabs section below: Tabs for Description, Specifications, Care Instructions (use shadcn/ui Tabs)
- FAQ accordion section: Expandable questions/answers (use shadcn/ui Accordion)
- Related products carousel at bottom: Horizontal scroll with product cards
- Responsive layout: Stack vertically on mobile (image first, then info)
- Use shadcn/ui components (Card, Button, Tabs, Accordion, Select)
- Next.js 14 App Router
- Add smooth transitions and hover effects
```

### Category Browse Page Prompt
```
Create a category browse page with the following design system:

DESIGN SYSTEM:
- Colors: 
  - Primary: #2d5016 (Forest Green) - use for buttons, active states, checked checkboxes
  - Secondary: #87a96b (Sage Green) - use for accents, secondary buttons, slider track
  - Accent: #8b6f47 (Warm Earth) - use sparingly for highlights
  - Background: #faf9f6 (Cream White) - main background color
  - Text: #2c2c2c (Charcoal) - primary text color
  - Muted text: #6b7280 (Gray) - secondary text, labels
  - Border: #e5e7eb (Light Gray) - borders and dividers
- Typography: 
  - Headings: 'Playfair Display', serif - use for category name, section titles
  - Body: 'Inter', sans-serif - use for all body text, labels, buttons
  - Botanical names: 'JetBrains Mono', monospace, italic - use for botanical names in product cards
- Spacing: 
  - Use Tailwind spacing scale (4px base: p-4, p-6, p-8, etc.)
  - Filter sidebar: p-6 (24px) padding
  - Product grid: gap-4 (16px) or gap-6 (24px) between cards
  - Section spacing: mb-8 (32px) between major sections
- Border radius: 
  - Cards: rounded-lg (8px)
  - Buttons: rounded-md (6px)
  - Inputs: rounded-md (6px)
  - Badges/chips: rounded-full
- Shadows: 
  - Cards: shadow-sm default, shadow-md on hover
  - Filter sidebar: shadow-sm on mobile when expanded
  - Dropdowns: shadow-md

LAYOUT:
- Category hero section at top: 
  - Full-width large image (aspect ratio 16:9 or 21:9)
  - Overlay with gradient (dark to transparent)
  - Category name: Playfair Display, text-4xl or text-5xl, white text, bold
  - Category description: Inter, text-lg, white/light text, max 2 lines
  - Padding: p-8 or p-12
- Filter sidebar (left, 25% width desktop, w-64 fixed): 
  - White background, rounded-lg, shadow-sm
  - Sticky positioning (sticky top-4)
  - Section headers: Playfair Display, text-lg, font-bold, primary green color
  - Price range slider: 
    - Use sage green (#87a96b) for active track
    - Primary green (#2d5016) for thumb/handle
    - Show min/max values below slider
  - Checkbox groups: 
    - Sun requirements: "Full Sun", "Partial Shade", "Full Shade"
    - Water needs: "Low", "Medium", "High"
    - Size: "Small", "Medium", "Large", "Extra Large"
    - Checked state: Primary green background (#2d5016), white checkmark
    - Unchecked: White background, gray border
    - Label: Inter, text-sm, charcoal color
  - Clear filters button: 
    - Secondary style (sage green #87a96b background)
    - Full width, rounded-md
    - Inter font, text-sm
- Product grid (right, 75% width desktop): 
  - Responsive grid: 
    - Mobile: 1 column (w-full)
    - Tablet: 2 columns (grid-cols-2)
    - Desktop: 3-4 columns (grid-cols-3 or grid-cols-4)
  - Gap: gap-4 (16px) or gap-6 (24px)
  - Product cards: 
    - White background, rounded-lg, shadow-sm
    - Image: Aspect ratio 1:1, rounded-lg, object-cover
    - Product name: Playfair Display, text-lg, font-bold, charcoal
    - Botanical name: JetBrains Mono, text-sm, italic, gray-600, below common name
    - Price: Inter, text-xl, font-bold, primary green (#2d5016)
    - Hover effect: scale-105 transform, shadow-md, transition-all duration-200
- Top bar above grid: 
  - Flex layout: justify-between items-center
  - Results count: Inter, text-sm, gray-600 ("Showing X of Y products")
  - Sort dropdown: 
    - shadcn/ui Select component
    - Options: "Price: Low to High", "Price: High to Low", "Name: A-Z", "Name: Z-A", "Popularity"
    - Border: gray-300, focus: primary green ring
  - Active filter tags: 
    - Chips/badges with primary green background (#2d5016)
    - White text, rounded-full
    - Remove button (X icon) on right
    - Flex wrap layout
- Pagination at bottom: 
  - Numbered buttons: rounded-md, gray background, primary green on active
  - Previous/Next buttons: Primary green (#2d5016) background
  - Inter font, text-sm
  - Center aligned
- Responsive behavior: 
  - Mobile: 
    - Filters collapse to accordion (shadcn/ui Accordion)
    - Full-width product grid (1 column)
    - Top bar stacks vertically
    - Category hero: Smaller text, less padding
  - Tablet: 
    - Filters in sidebar (collapsible)
    - 2-column product grid
  - Desktop: 
    - Always-visible filter sidebar
    - 3-4 column product grid
- Loading states: 
  - Skeleton loaders for product cards (shadcn/ui Skeleton)
  - Match card dimensions
  - Animated pulse effect
- Use shadcn/ui components: Card, Select, Checkbox, Slider, Badge, Button, Accordion, Skeleton
- Next.js 14 App Router
- Add smooth transitions for all interactive elements
- Ensure proper keyboard navigation for filters
```

### Product Card Prompt
```
Create a product card component with the following design system:

DESIGN SYSTEM:
- Colors: Primary #2d5016 (Forest Green), Secondary #87a96b (Sage Green), Background white, Text #2c2c2c (Charcoal)
- Typography: Product name uses 'Playfair Display' serif, Botanical name uses 'JetBrains Mono' monospace italic, Price uses 'Inter' sans-serif
- Border radius: rounded-lg for card and image
- Shadows: shadow-sm default, shadow-md on hover

COMPONENT STRUCTURE:
- Card container: White background, rounded-lg, shadow-sm, hover:shadow-md transition
- Product image: 
  - Aspect ratio 1:1, rounded-lg, object-cover
  - Hover: scale-105 transform with transition
  - Placeholder if no image
- Product name: Playfair Display, text-lg, font-bold, text-charcoal
- Botanical name: JetBrains Mono, text-sm, italic, text-gray-600, below common name
- Price: Inter, text-xl, font-bold, text-primary-green (#2d5016)
- Availability badge: Small badge (green for in stock, red for out of stock)
- Quick view button: Secondary style button (sage green #87a96b), appears on hover
- Responsive: Full width on mobile, fixed width in grid on desktop
- Use shadcn/ui Card component as base
- Add smooth transitions for all hover effects
```

### Search Bar Prompt
```
Create a search bar component with autocomplete dropdown with the following design system:

DESIGN SYSTEM:
- Colors: Primary #2d5016 (Forest Green), Secondary #87a96b (Sage Green), Background white, Text #2c2c2c (Charcoal)
- Typography: Input text uses 'Inter' sans-serif, Suggestions use 'Inter' sans-serif
- Border radius: rounded-md for input, rounded-lg for dropdown
- Shadows: shadow-md for dropdown

COMPONENT STRUCTURE:
- Search input: 
  - Full width, rounded-md, border-gray-300
  - Focus: border-primary-green (#2d5016), ring-2 ring-primary-green
  - Placeholder: "Search for plants..."
  - Search icon on left (lucide-react Search icon)
- Autocomplete dropdown (appears below input):
  - White background, rounded-lg, shadow-md
  - Grouped results: "Products", "Guides", "Categories"
  - Each result: 
    - Product: Image thumbnail, name (Playfair Display), botanical name (JetBrains Mono italic), price
    - Guide: Icon, title, excerpt
    - Category: Icon, name, product count
  - Hover: Background sage green (#87a96b) with white text
  - Keyboard navigation: Arrow keys to navigate, Enter to select
  - "View all results" link at bottom (primary green)
- Recent searches section (if available): Show below dropdown
- Use shadcn/ui Input and Command components
- Add smooth transitions
```

### Header/Navigation Prompt
```
Create a header/navigation component with the following design system:

DESIGN SYSTEM:
- Colors: Primary #2d5016 (Forest Green), Secondary #87a96b (Sage Green), Background white, Text #2c2c2c (Charcoal)
- Typography: Logo uses 'Playfair Display' serif, Navigation links use 'Inter' sans-serif
- Border: border-b with light gray (#e5e7eb)

COMPONENT STRUCTURE:
- Header container: White background, sticky top, border-b, shadow-sm
- Logo: Left side, Playfair Display font, large, primary green color
- Navigation menu: Center (desktop) or hamburger (mobile)
  - Links: Categories, Guides, Blog, About
  - Hover: Underline with primary green, or background sage green
  - Active: Primary green color, bold
- Search bar: Right side (or below nav on mobile), integrated search input
- Cart icon: Right side, badge with count (primary green background)
- Category dropdown: Mega-menu on hover showing category grid with images
- Mobile: Hamburger menu, slide-out drawer
- Use shadcn/ui components (Button, Sheet for mobile menu)
- Add smooth transitions
```

---

## 🔧 Integration Checklist

After generating components in v0.dev:

### 1. Component Structure
- [ ] Copy components to correct directory (`components/product/`, etc.)
- [ ] Rename files to match our naming convention
- [ ] Ensure proper exports

### 2. TypeScript Integration
- [ ] Replace placeholder types with Prisma-generated types
- [ ] Add proper interfaces for props
- [ ] Import types from `@prisma/client` or our shared types

### 3. Data Fetching
- [ ] Replace mock data with Prisma queries
- [ ] Use Server Components for data fetching
- [ ] Add loading states and error handling
- [ ] Implement proper caching strategies

### 4. API Integration
- [ ] Connect to existing API routes (`/api/products`, `/api/categories`)
- [ ] Handle API errors gracefully
- [ ] Add loading skeletons
- [ ] Implement optimistic updates where appropriate

### 5. Styling Customization
- [ ] Update Tailwind config with our color palette
- [ ] Add custom fonts (Playfair Display, Inter)
- [ ] Adjust spacing to match design system
- [ ] Ensure responsive breakpoints match our plan

### 6. SEO & Performance
- [ ] Add metadata generation functions
- [ ] Implement structured data (JSON-LD)
- [ ] Optimize images (Next.js Image component)
- [ ] Add lazy loading where appropriate
- [ ] Ensure proper semantic HTML

### 7. Accessibility
- [ ] Add ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Test with screen readers
- [ ] Verify color contrast ratios

---

## 🚀 Workflow

### Step 1: Generate in v0.dev
1. Use prompts above to generate components
2. Review generated code
3. Iterate with prompts to refine
4. Export code

### Step 2: Local Integration
1. Create component files in our structure
2. Copy generated code
3. Install any missing dependencies
4. Fix import paths

### Step 3: Customization
1. Replace mock data with real queries
2. Add TypeScript types
3. Customize styling
4. Add missing features

### Step 4: Testing
1. Test on different screen sizes
2. Verify API integration
3. Check performance
4. Accessibility audit

---

## 📦 Dependencies to Add

After generating components, ensure these are installed:

```bash
npm install @radix-ui/react-accordion
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install lucide-react
npm install clsx tailwind-merge
```

---

## 🎨 Design System Override

After generating, update `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d5016',
          light: '#4a7c2a',
          dark: '#1a3009',
        },
        secondary: {
          DEFAULT: '#87a96b',
          light: '#a8c48a',
          dark: '#6b8554',
        },
        accent: '#8b6f47',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
}
```

---

## 💡 Best Practices

1. **Start with Layouts**: Generate homepage and product detail first
2. **Component-by-Component**: Generate one component type at a time
3. **Review Before Integration**: Check code quality before copying
4. **Iterate Locally**: Make adjustments in our codebase, not just v0.dev
5. **Keep It Simple**: Don't over-engineer - v0.dev generates good defaults
6. **Test Early**: Test components as you integrate them

---

## 🔄 Iteration Strategy

1. **Generate** → Create component in v0.dev
2. **Review** → Check code quality and structure
3. **Integrate** → Copy to our codebase
4. **Customize** → Add our data, types, styling
5. **Test** → Verify functionality
6. **Refine** → Make improvements based on testing

---

## 📝 Example: Product Card Integration

### Generated Code (v0.dev)
```tsx
// May have placeholder data
export function ProductCard({ product }) {
  return (
    <Card>
      <img src={product.image} />
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </Card>
  );
}
```

### After Integration
```tsx
import { Product } from '@prisma/client';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface ProductCardProps {
  product: Product & { category: { name: string } };
}

export function ProductCard({ product }: ProductCardProps) {
  const images = (product.images as string[]) || [];
  
  return (
    <Card>
      <Image 
        src={images[0] || product.imageUrl || '/placeholder.jpg'}
        alt={product.name}
        width={400}
        height={400}
      />
      <h3>{product.name}</h3>
      {product.botanicalName && (
        <p className="italic text-sm">{product.botanicalName}</p>
      )}
      <p>${product.price.toString()}</p>
    </Card>
  );
}
```

---

## ✅ Success Criteria

Components are ready when:
- ✅ TypeScript types are correct
- ✅ Data comes from our APIs/Prisma
- ✅ Styling matches our design system
- ✅ Responsive on all screen sizes
- ✅ Accessible (keyboard nav, ARIA labels)
- ✅ Performance optimized (images, lazy loading)
- ✅ SEO friendly (meta tags, structured data)

---

## 🎯 Recommended Order

1. **Homepage** (establishes design system)
2. **Product Card** (reusable component)
3. **Product Detail Page** (most complex)
4. **Category Browse** (filters + grid)
5. **Search** (autocomplete + results)
6. **Layout Components** (Header, Footer)

---

*This strategy balances speed (v0.dev) with quality (customization and integration).*

