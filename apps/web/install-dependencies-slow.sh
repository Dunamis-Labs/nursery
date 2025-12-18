#!/bin/bash

# Install dependencies one at a time to avoid timeouts
# This is slower but more reliable with poor network connections

set -e

echo "📦 Installing v0 dependencies (one at a time)..."
echo "This will take a while but should avoid timeouts."
echo ""

# Radix UI components
PACKAGES=(
  "@radix-ui/react-accordion@1.2.2"
  "@radix-ui/react-alert-dialog@1.1.4"
  "@radix-ui/react-aspect-ratio@1.1.1"
  "@radix-ui/react-avatar@1.1.2"
  "@radix-ui/react-checkbox@1.1.3"
  "@radix-ui/react-collapsible@1.1.2"
  "@radix-ui/react-context-menu@2.2.4"
  "@radix-ui/react-dialog@1.1.4"
  "@radix-ui/react-dropdown-menu@2.1.4"
  "@radix-ui/react-hover-card@1.1.4"
  "@radix-ui/react-label@2.1.1"
  "@radix-ui/react-menubar@1.1.4"
  "@radix-ui/react-navigation-menu@1.2.3"
  "@radix-ui/react-popover@1.1.4"
  "@radix-ui/react-progress@1.1.1"
  "@radix-ui/react-radio-group@1.2.2"
  "@radix-ui/react-scroll-area@1.2.2"
  "@radix-ui/react-select@2.1.4"
  "@radix-ui/react-separator@1.1.1"
  "@radix-ui/react-slider@1.2.2"
  "@radix-ui/react-slot@1.1.1"
  "@radix-ui/react-switch@1.1.2"
  "@radix-ui/react-tabs@1.1.2"
  "@radix-ui/react-toast@1.2.4"
  "@radix-ui/react-toggle@1.1.1"
  "@radix-ui/react-toggle-group@1.1.1"
  "@radix-ui/react-tooltip@1.1.6"
  "@hookform/resolvers@^3.10.0"
  "class-variance-authority@^0.7.1"
  "cmdk@1.0.4"
  "date-fns@4.1.0"
  "embla-carousel-react@8.5.1"
  "input-otp@1.4.1"
  "next-themes@^0.4.6"
  "react-day-picker@9.8.0"
  "react-hook-form@^7.60.0"
  "react-resizable-panels@^2.1.7"
  "recharts@2.15.4"
  "sonner@^1.7.4"
  "vaul@^1.1.2"
  "tailwind-merge@^3.3.1"
)

TOTAL=${#PACKAGES[@]}
SUCCESS=0
FAILED=0

for i in "${!PACKAGES[@]}"; do
  PACKAGE="${PACKAGES[$i]}"
  NUM=$((i + 1))
  
  echo "[$NUM/$TOTAL] Installing $PACKAGE..."
  
  if npm install "$PACKAGE" --no-save 2>&1 | grep -q "ETIMEDOUT\|network"; then
    echo "  ⚠️  Timeout - will retry later"
    FAILED=$((FAILED + 1))
    sleep 5
  else
    echo "  ✅ Installed"
    SUCCESS=$((SUCCESS + 1))
    sleep 2
  fi
done

echo ""
echo "📊 Summary:"
echo "  ✅ Successfully installed: $SUCCESS"
echo "  ❌ Failed: $FAILED"
echo ""
if [ $FAILED -gt 0 ]; then
  echo "💡 Tip: Run this script again to retry failed packages."
  echo "   npm will skip already-installed packages."
fi

