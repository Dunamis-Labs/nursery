# Plant & Tree Website UI Plan

## Executive Summary

This document outlines the complete UI/UX plan for the Nursery e-commerce platform - a modern, SEO-optimized website for browsing, discovering, and learning about plants and trees. The design prioritizes visual appeal, educational content, and seamless browsing experience.

---

## 1. Design Philosophy & Principles

### Core Principles
1. **Visual-First**: High-quality plant images are the hero - showcase them prominently
2. **Educational**: Help users learn about plants, not just buy them
3. **Trust-Building**: Botanical names, care instructions, and detailed specs build credibility
4. **Mobile-First**: Responsive design optimized for all devices
5. **Performance**: Fast loading, optimized images, smooth interactions
6. **Accessibility**: WCAG 2.1 AA compliance

### Visual Identity
- **Color Palette**: 
  - Primary: Forest Green (#2d5016)
  - Secondary: Sage Green (#87a96b)
  - Accent: Warm Earth (#8b6f47)
  - Background: Cream White (#faf9f6)
  - Text: Charcoal (#2c2c2c)
- **Typography**: 
  - Headings: Playfair Display (elegant, botanical feel)
  - Body: Inter (clean, readable)
  - Code/Botanical Names: JetBrains Mono (technical precision)
- **Imagery Style**: Natural, high-quality photos with soft shadows, consistent lighting

---

## 2. User Journeys & Key Pages

### 2.1 Discovery Journey
**Goal**: Help users discover plants that match their needs

**Pages**:
1. **Homepage** (`/`)
   - Hero section with seasonal featured plants
   - Category grid (Trees, Shrubs, Perennials, etc.)
   - "Shop by Purpose" (Privacy, Shade, Edible, etc.)
   - Featured guides/blog posts
   - Search bar (prominent)

2. **Category Browse** (`/categories/[slug]`)
   - Category hero image + description
   - Filter sidebar (price, size, sun requirements, etc.)
   - Product grid with images, names, prices
   - Sort options (price, name, popularity)
   - Pagination

3. **Search Results** (`/search?q=...`)
   - Search bar with autocomplete
   - Results grouped by type (products, guides, categories)
   - Filters for refining results
   - "Did you mean?" suggestions

### 2.2 Product Discovery Journey
**Goal**: Provide comprehensive product information to aid decision-making

**Pages**:
1. **Product Detail** (`/products/[category]/[slug]`)
   - Image gallery (main + thumbnails)
   - Product name (common + botanical)
   - Price + availability + variants (sizes)
   - Quick specs (mature size, sun, water)
   - Detailed description
   - Care instructions
   - Growing requirements
   - FAQs
   - Related products
   - "Add to Cart" / "Request Quote" CTA

### 2.3 Learning Journey
**Goal**: Educate users about plant care and gardening

**Pages**:
1. **Guides Listing** (`/guides`)
   - Grid of guide cards
   - Filter by type (How-To, Care, Seasonal, Comparison)
   - Featured guides

2. **Guide Detail** (`/guides/[slug]`)
   - Full article content
   - Related products mentioned
   - Related guides
   - Author info
   - Share buttons

3. **Blog Listing** (`/blog`)
   - Latest posts
   - Categories/tags
   - Featured posts

4. **Blog Post** (`/blog/[slug]`)
   - Article content
   - Related products
   - Related posts
   - Comments (future)

### 2.4 Comparison Journey
**Goal**: Help users compare similar plants

**Pages**:
1. **Product Comparison** (`/compare/[slug]`)
   - Side-by-side comparison table
   - Key differences highlighted
   - "Add to Cart" for each product

---

## 3. Component Architecture

### 3.1 Layout Components

#### Header (`components/layout/Header.tsx`)
```
┌─────────────────────────────────────────┐
│ [Logo]  Navigation  [Search]  [Cart]    │
├─────────────────────────────────────────┤
│ Category Dropdown Menu                  │
└─────────────────────────────────────────┘
```

**Features**:
- Sticky header on scroll
- Mobile hamburger menu
- Search bar with autocomplete
- Cart icon with count badge
- Category mega-menu on hover

#### Footer (`components/layout/Footer.tsx`)
```
┌─────────────────────────────────────────┐
│ About  Categories  Resources  Contact    │
│                                         │
│ Newsletter Signup                       │
│                                         │
│ Social Links  Copyright  Privacy        │
└─────────────────────────────────────────┘
```

**Features**:
- Links to key pages
- Newsletter signup
- Social media links
- Legal links

#### Breadcrumbs (`components/layout/Breadcrumbs.tsx`)
- Shows navigation path
- Clickable parent categories
- Current page highlighted

### 3.2 Product Components

#### ProductCard (`components/product/ProductCard.tsx`)
```
┌──────────────┐
│   [Image]    │
│              │
├──────────────┤
│ Common Name  │
│ Botanical    │
│ $XX.XX       │
│ [View]       │
└──────────────┘
```

**Props**:
- `product`: Product object
- `showQuickView`: boolean
- `variant`: 'grid' | 'list'

**Features**:
- Hover effect (zoom image)
- Quick view modal
- Price display
- Availability badge
- Botanical name (smaller, italic)

#### ProductImage (`components/product/ProductImage.tsx`)
- Image gallery with thumbnails
- Zoom on hover/click
- Full-screen lightbox
- Lazy loading
- Placeholder for missing images

#### ProductDetail (`components/product/ProductDetail.tsx`)
- Main product information display
- Variant selector (sizes)
- Add to cart button
- Share buttons
- Print-friendly option

#### ProductSpecs (`components/product/ProductSpecs.tsx`)
- Key-value pairs display
- Icons for visual clarity
- Expandable sections
- Copy-to-clipboard for botanical names

#### ProductFAQ (`components/product/ProductFAQ.tsx`)
- Accordion-style FAQ
- Search within FAQs
- "Was this helpful?" feedback

#### RelatedProducts (`components/product/RelatedProducts.tsx`)
- Horizontal scroll carousel
- "You may also like" section
- Based on category + metadata similarity

### 3.3 Category Components

#### CategoryCard (`components/category/CategoryCard.tsx`)
```
┌──────────────┐
│   [Image]    │
│              │
├──────────────┤
│ Category Name│
│ XX Products  │
│ [Explore]    │
└──────────────┘
```

#### CategoryFilter (`components/category/CategoryFilter.tsx`)
- Sidebar filters
- Price range slider
- Checkboxes for attributes (sun, water, etc.)
- Clear filters button
- Active filter tags

#### CategoryGrid (`components/category/CategoryGrid.tsx`)
- Responsive grid layout
- Loading skeletons
- Empty state
- Pagination

### 3.4 Search Components

#### SearchBar (`components/search/SearchBar.tsx`)
- Autocomplete dropdown
- Recent searches
- Popular searches
- Search suggestions
- Keyboard navigation

#### SearchResults (`components/search/SearchResults.tsx`)
- Grouped results (Products, Guides, Categories)
- Highlighted search terms
- "No results" state
- Search suggestions

#### SearchFilters (`components/search/SearchFilters.tsx`)
- Filter by type (products only, guides only, etc.)
- Sort options
- Result count

### 3.5 Content Components

#### BlogCard (`components/content/BlogCard.tsx`)
- Featured image
- Title + excerpt
- Author + date
- Read time estimate
- Category tags

#### GuideCard (`components/content/GuideCard.tsx`)
- Similar to BlogCard
- Guide type badge
- Related products preview

#### ComparisonTable (`components/content/ComparisonTable.tsx`)
- Side-by-side comparison
- Highlighted differences
- Sticky header on scroll
- Mobile: Stacked view

#### RichText (`components/content/RichText.tsx`)
- Markdown/HTML rendering
- Image optimization
- Code syntax highlighting
- Table of contents

### 3.6 UI Components (shadcn/ui)

**Required Components**:
- `Button` - Primary, secondary, ghost variants
- `Card` - Product cards, content cards
- `Input` - Search, forms
- `Select` - Filters, dropdowns
- `Dialog` - Modals, quick view
- `Accordion` - FAQs, expandable content
- `Tabs` - Product details sections
- `Badge` - Availability, categories
- `Skeleton` - Loading states
- `Toast` - Notifications

---

## 4. Page Layouts & Wireframes

### 4.1 Homepage Layout

```
┌─────────────────────────────────────────┐
│              HEADER                     │
├─────────────────────────────────────────┤
│                                         │
│         HERO SECTION                    │
│    [Large Plant Image + CTA]            │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│      SHOP BY CATEGORY                   │
│   [Grid of 6-8 Category Cards]         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│      SHOP BY PURPOSE                    │
│   [Privacy | Shade | Edible | etc.]    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│      FEATURED PRODUCTS                  │
│   [Horizontal Scroll Carousel]          │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│      LATEST GUIDES                      │
│   [3-4 Guide Cards]                     │
│                                         │
├─────────────────────────────────────────┤
│              FOOTER                     │
└─────────────────────────────────────────┘
```

### 4.2 Product Detail Page Layout

```
┌─────────────────────────────────────────┐
│              HEADER                     │
├─────────────────────────────────────────┤
│ [Home] > [Category] > [Product]        │
├─────────────────────────────────────────┤
│                                         │
│  [Image Gallery]  │  Product Info      │
│                   │  - Name            │
│                   │  - Botanical Name  │
│                   │  - Price           │
│                   │  - Variants        │
│                   │  - Quick Specs     │
│                   │  - Add to Cart     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  TABS: Description | Specs | Care      │
│                                         │
│  [Detailed Content Sections]           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│      FREQUENTLY ASKED QUESTIONS         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│      RELATED PRODUCTS                   │
│   [Horizontal Scroll Carousel]          │
│                                         │
├─────────────────────────────────────────┤
│              FOOTER                     │
└─────────────────────────────────────────┘
```

### 4.3 Category Browse Page Layout

```
┌─────────────────────────────────────────┐
│              HEADER                     │
├─────────────────────────────────────────┤
│ [Home] > [Category]                     │
├─────────────────────────────────────────┤
│                                         │
│  FILTERS │  Category Hero               │
│  Sidebar │  [Image + Description]       │
│          │                              │
│  - Price │  Sort: [Dropdown]           │
│  - Size  │                              │
│  - Sun   │  [Product Grid]              │
│  - Water │  [Product Cards]             │
│  - etc.  │                              │
│          │  [Pagination]                │
│                                         │
├─────────────────────────────────────────┤
│              FOOTER                     │
└─────────────────────────────────────────┘
```

---

## 5. Key Features & Interactions

### 5.1 Search & Discovery
- **Autocomplete**: Real-time suggestions as user types
- **Visual Search**: Upload image to find similar plants (future)
- **Smart Filters**: Remember user preferences
- **Saved Searches**: Allow users to save filter combinations

### 5.2 Product Interaction
- **Image Zoom**: Hover/click to zoom product images
- **Quick View**: Modal with product details without leaving page
- **Variant Selection**: Easy size/variant picker
- **Compare**: Add products to comparison list
- **Wishlist**: Save products for later (future)

### 5.3 Content Features
- **Print-Friendly**: One-click print for guides/care instructions
- **Share**: Social sharing buttons
- **Related Content**: Smart suggestions based on viewing history
- **Reading Progress**: Progress bar for long articles

### 5.4 Performance Features
- **Lazy Loading**: Images load as user scrolls
- **Image Optimization**: Next.js Image component with blur placeholders
- **Skeleton Loading**: Show loading states for better perceived performance
- **Infinite Scroll**: Option for category pages (with "Load More")

---

## 6. Responsive Design Breakpoints

- **Mobile**: < 640px
  - Single column layout
  - Hamburger menu
  - Stacked filters
  - Full-width product cards

- **Tablet**: 640px - 1024px
  - 2-column product grid
  - Sidebar filters (collapsible)
  - Touch-optimized interactions

- **Desktop**: > 1024px
  - 3-4 column product grid
  - Always-visible filters
  - Hover effects
  - Mega-menu navigation

---

## 7. Accessibility Considerations

- **Keyboard Navigation**: All interactive elements keyboard accessible
- **Screen Reader Support**: Proper ARIA labels, semantic HTML
- **Color Contrast**: WCAG AA compliant (4.5:1 ratio)
- **Focus Indicators**: Clear focus states for keyboard users
- **Alt Text**: Descriptive alt text for all images
- **Skip Links**: Skip to main content link

---

## 8. SEO Optimization

### On-Page SEO
- **Meta Tags**: Dynamic meta titles/descriptions per page
- **Structured Data**: JSON-LD for products, articles, breadcrumbs
- **Open Graph**: Social sharing previews
- **Canonical URLs**: Prevent duplicate content
- **Sitemap**: Auto-generated XML sitemap

### Content SEO
- **URL Structure**: Clean, descriptive URLs (`/products/trees/acer-freemanii`)
- **Heading Hierarchy**: Proper H1-H6 structure
- **Internal Linking**: Link related products/content
- **Image SEO**: Descriptive filenames, alt text, captions

---

## 9. Implementation Phases

### Phase 1: Core Pages (MVP)
1. ✅ Homepage
2. ✅ Category browse page
3. ✅ Product detail page
4. ✅ Search results page
5. ✅ Basic header/footer

### Phase 2: Enhanced Features
1. Product comparison
2. Guide/blog pages
3. Advanced filters
4. Quick view modal
5. Image gallery enhancements

### Phase 3: Advanced Features
1. User accounts (wishlist, saved searches)
2. Reviews/ratings
3. Visual search
4. Personalized recommendations
5. Live chat support

---

## 10. Component File Structure

```
apps/web/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── Breadcrumbs.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductImage.tsx
│   │   ├── ProductSpecs.tsx
│   │   ├── ProductFAQ.tsx
│   │   └── RelatedProducts.tsx
│   ├── category/
│   │   ├── CategoryCard.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── CategoryGrid.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchFilters.tsx
│   ├── content/
│   │   ├── BlogCard.tsx
│   │   ├── GuideCard.tsx
│   │   ├── ComparisonTable.tsx
│   │   └── RichText.tsx
│   └── seo/
│       ├── StructuredData.tsx
│       └── MetaTags.tsx
```

---

## 11. Design Tokens & Styling

### Tailwind Config Extensions
```javascript
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
}
```

### Spacing System
- Base: 4px (0.25rem)
- Consistent spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

---

## 12. Next Steps

1. **Design Mockups**: Create high-fidelity mockups in Figma
2. **Component Library**: Set up shadcn/ui and create base components
3. **Homepage**: Build homepage with hero, categories, featured products
4. **Product Pages**: Implement product detail page with all sections
5. **Category Pages**: Build browse page with filters and grid
6. **Search**: Implement search with autocomplete
7. **Testing**: User testing and iteration
8. **Performance**: Optimize images, implement lazy loading
9. **SEO**: Add structured data, meta tags, sitemap
10. **Accessibility Audit**: WCAG compliance testing

---

## Appendix: Data Mapping

### Product Display Fields
- **Card View**: Image, Common Name, Botanical Name (small), Price, Availability Badge
- **Detail View**: 
  - Hero: Image Gallery, Name, Botanical Name, Price, Variants, Quick Specs
  - Tabs: Description, Full Specifications, Care Instructions, FAQs
  - Footer: Related Products

### Category Display Fields
- **Card View**: Image, Name, Product Count, Description (truncated)
- **Page View**: Hero Image, Name, Description, Filters, Product Grid

### Search Result Display
- **Products**: Image, Name, Botanical Name, Price, Category
- **Guides**: Image, Title, Excerpt, Type Badge
- **Categories**: Image, Name, Product Count

---

*Document Version: 1.0*  
*Last Updated: 2025-12-13*  
*Author: BMAD Master*

