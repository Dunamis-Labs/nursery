#!/bin/bash

# Install v0 dependencies directly from apps/web directory
# This avoids path issues

set -e

echo "📦 Installing v0 codebase dependencies..."
echo ""

# Install in smaller batches to avoid timeouts
echo "Installing Radix UI components (batch 1/3)..."
npm install \
  @radix-ui/react-accordion@1.2.2 \
  @radix-ui/react-alert-dialog@1.1.4 \
  @radix-ui/react-aspect-ratio@1.1.1 \
  @radix-ui/react-avatar@1.1.2 \
  @radix-ui/react-checkbox@1.1.3 \
  @radix-ui/react-collapsible@1.1.2 \
  @radix-ui/react-context-menu@2.2.4 \
  @radix-ui/react-dialog@1.1.4 \
  @radix-ui/react-dropdown-menu@2.1.4 || echo "⚠️  Some packages failed, continuing..."

echo ""
echo "Installing Radix UI components (batch 2/3)..."
npm install \
  @radix-ui/react-hover-card@1.1.4 \
  @radix-ui/react-label@2.1.1 \
  @radix-ui/react-menubar@1.1.4 \
  @radix-ui/react-navigation-menu@1.2.3 \
  @radix-ui/react-popover@1.1.4 \
  @radix-ui/react-progress@1.1.1 \
  @radix-ui/react-radio-group@1.2.2 \
  @radix-ui/react-scroll-area@1.2.2 \
  @radix-ui/react-select@2.1.4 || echo "⚠️  Some packages failed, continuing..."

echo ""
echo "Installing Radix UI components (batch 3/3)..."
npm install \
  @radix-ui/react-separator@1.1.1 \
  @radix-ui/react-slider@1.2.2 \
  @radix-ui/react-slot@1.1.1 \
  @radix-ui/react-switch@1.1.2 \
  @radix-ui/react-tabs@1.1.2 \
  @radix-ui/react-toast@1.2.4 \
  @radix-ui/react-toggle@1.1.1 \
  @radix-ui/react-toggle-group@1.1.1 \
  @radix-ui/react-tooltip@1.1.6 || echo "⚠️  Some packages failed, continuing..."

# Install other required dependencies
echo ""
echo "Installing other dependencies (batch 1/2)..."
npm install \
  @hookform/resolvers@^3.10.0 \
  class-variance-authority@^0.7.1 \
  cmdk@1.0.4 \
  date-fns@4.1.0 \
  embla-carousel-react@8.5.1 \
  input-otp@1.4.1 || echo "⚠️  Some packages failed, continuing..."

echo ""
echo "Installing other dependencies (batch 2/2)..."
npm install \
  next-themes@^0.4.6 \
  react-day-picker@9.8.0 \
  react-hook-form@^7.60.0 \
  react-resizable-panels@^2.1.7 \
  recharts@2.15.4 \
  sonner@^1.7.4 \
  vaul@^1.1.2 || echo "⚠️  Some packages failed, continuing..."

# Update tailwind-merge to v3
echo ""
echo "Updating tailwind-merge to v3..."
npm install tailwind-merge@^3.3.1 || echo "⚠️  Failed to update tailwind-merge"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Note: If you saw timeout errors, you can run this script again."
echo "npm will skip already-installed packages."

