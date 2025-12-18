#!/bin/bash

# Specific integration script for v0-codebase-1
# This script copies components and pages from the v0 codebase

set -e

V0_PATH="docs/source-files/v0-codebase-1"
WEB_PATH="apps/web"

echo "🚀 Integrating v0 codebase from: $V0_PATH"
echo ""

# Check if v0 codebase exists
if [ ! -d "$V0_PATH" ]; then
  echo "❌ Error: v0 codebase not found at $V0_PATH"
  exit 1
fi

echo "📋 Step 1: Copying UI components (shadcn/ui)..."
mkdir -p "$WEB_PATH/components/ui"
cp -r "$V0_PATH/components/ui/"* "$WEB_PATH/components/ui/" 2>/dev/null || true
echo "✅ UI components copied"
echo ""

echo "📋 Step 2: Copying custom components..."
mkdir -p "$WEB_PATH/components/layout"
mkdir -p "$WEB_PATH/components/product"
mkdir -p "$WEB_PATH/components/category"
mkdir -p "$WEB_PATH/components/search"
mkdir -p "$WEB_PATH/components/blog"

# Layout components
cp "$V0_PATH/components/navigation.tsx" "$WEB_PATH/components/layout/" 2>/dev/null || true
cp "$V0_PATH/components/footer.tsx" "$WEB_PATH/components/layout/" 2>/dev/null || true
cp "$V0_PATH/components/hero-section.tsx" "$WEB_PATH/components/layout/" 2>/dev/null || true
cp "$V0_PATH/components/search-bar.tsx" "$WEB_PATH/components/search/" 2>/dev/null || true
cp "$V0_PATH/components/theme-provider.tsx" "$WEB_PATH/components/layout/" 2>/dev/null || true

# Product components
cp "$V0_PATH/components/product-grid.tsx" "$WEB_PATH/components/product/" 2>/dev/null || true
cp "$V0_PATH/components/product-image-gallery.tsx" "$WEB_PATH/components/product/" 2>/dev/null || true
cp "$V0_PATH/components/product-info.tsx" "$WEB_PATH/components/product/" 2>/dev/null || true
cp "$V0_PATH/components/product-tabs.tsx" "$WEB_PATH/components/product/" 2>/dev/null || true
cp "$V0_PATH/components/product-faq.tsx" "$WEB_PATH/components/product/" 2>/dev/null || true
cp "$V0_PATH/components/related-products.tsx" "$WEB_PATH/components/product/" 2>/dev/null || true
cp "$V0_PATH/components/featured-products.tsx" "$WEB_PATH/components/product/" 2>/dev/null || true

# Category components
cp "$V0_PATH/components/category-grid.tsx" "$WEB_PATH/components/category/" 2>/dev/null || true
cp "$V0_PATH/components/category-hero.tsx" "$WEB_PATH/components/category/" 2>/dev/null || true
cp "$V0_PATH/components/category-content.tsx" "$WEB_PATH/components/category/" 2>/dev/null || true
cp "$V0_PATH/components/filter-sidebar.tsx" "$WEB_PATH/components/category/" 2>/dev/null || true
cp "$V0_PATH/components/products-top-bar.tsx" "$WEB_PATH/components/category/" 2>/dev/null || true
cp "$V0_PATH/components/shop-by-purpose.tsx" "$WEB_PATH/components/category/" 2>/dev/null || true

# Blog components (if you want them)
cp "$V0_PATH/components/blog-"*.tsx "$WEB_PATH/components/blog/" 2>/dev/null || true

# Other components
cp "$V0_PATH/components/plant-finder-"*.tsx "$WEB_PATH/components/" 2>/dev/null || true
cp "$V0_PATH/components/core-care-guides.tsx" "$WEB_PATH/components/" 2>/dev/null || true
cp "$V0_PATH/components/guides-"*.tsx "$WEB_PATH/components/" 2>/dev/null || true
cp "$V0_PATH/components/cart-content.tsx" "$WEB_PATH/components/" 2>/dev/null || true
cp "$V0_PATH/components/checkout-form.tsx" "$WEB_PATH/components/" 2>/dev/null || true

echo "✅ Custom components copied"
echo ""

echo "📋 Step 3: Copying hooks..."
mkdir -p "$WEB_PATH/hooks"
cp "$V0_PATH/hooks/"*.ts "$WEB_PATH/hooks/" 2>/dev/null || true
echo "✅ Hooks copied"
echo ""

echo "📋 Step 4: Merging utilities..."
# Backup existing utils
if [ -f "$WEB_PATH/lib/utils.ts" ]; then
  cp "$WEB_PATH/lib/utils.ts" "$WEB_PATH/lib/utils.ts.backup"
fi
# Copy v0 utils (they should be compatible)
cp "$V0_PATH/lib/utils.ts" "$WEB_PATH/lib/utils.ts"
echo "✅ Utilities merged (backup created at lib/utils.ts.backup)"
echo ""

echo "📋 Step 5: Copying public assets..."
mkdir -p "$WEB_PATH/public"
cp -r "$V0_PATH/public/"* "$WEB_PATH/public/" 2>/dev/null || true
echo "✅ Public assets copied"
echo ""

echo "📋 Step 6: Creating page backups..."
# Backup existing pages before copying
if [ -f "$WEB_PATH/app/page.tsx" ]; then
  cp "$WEB_PATH/app/page.tsx" "$WEB_PATH/app/page.tsx.backup"
fi
echo "✅ Page backups created"
echo ""

echo "✅ Integration complete!"
echo ""
echo "📝 Next steps:"
echo "1. Review and adapt pages in apps/web/app/"
echo "2. Fix imports in copied components"
echo "3. Replace mock data with Prisma queries"
echo "4. Install missing dependencies (check package.json)"
echo "5. Test: cd apps/web && npm run dev"
echo ""
echo "📚 See docs/v0-full-codebase-integration.md for detailed instructions"

