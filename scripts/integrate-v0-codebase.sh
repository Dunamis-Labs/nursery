#!/bin/bash

# Script to help integrate a full v0.dev codebase
# Usage: ./scripts/integrate-v0-codebase.sh /path/to/v0-temp

set -e

V0_PATH="${1:-}"
NURSERY_WEB_PATH="apps/web"

if [ -z "$V0_PATH" ]; then
  echo "❌ Error: Please provide the path to your v0 codebase"
  echo "Usage: ./scripts/integrate-v0-codebase.sh /path/to/v0-temp"
  exit 1
fi

if [ ! -d "$V0_PATH" ]; then
  echo "❌ Error: Directory not found: $V0_PATH"
  exit 1
fi

echo "🚀 Integrating v0 codebase from: $V0_PATH"
echo ""

# Check what exists in v0 codebase
echo "📋 Analyzing v0 codebase structure..."
echo ""

if [ -d "$V0_PATH/components" ]; then
  echo "✅ Found components directory"
  ls -la "$V0_PATH/components" | head -10
  echo ""
fi

if [ -d "$V0_PATH/app" ]; then
  echo "✅ Found app directory"
  ls -la "$V0_PATH/app" | head -10
  echo ""
fi

if [ -f "$V0_PATH/package.json" ]; then
  echo "✅ Found package.json"
  echo "Dependencies in v0 codebase:"
  grep -A 20 '"dependencies"' "$V0_PATH/package.json" | head -15
  echo ""
fi

echo "📝 Integration steps:"
echo ""
echo "1. Copy components:"
echo "   cp -r $V0_PATH/components/ui/* $NURSERY_WEB_PATH/components/ui/"
echo "   cp -r $V0_PATH/components/layout/* $NURSERY_WEB_PATH/components/layout/"
echo "   cp -r $V0_PATH/components/product/* $NURSERY_WEB_PATH/components/product/"
echo ""
echo "2. Install dependencies (check package.json above)"
echo "   cd $NURSERY_WEB_PATH"
echo "   npm install [missing-packages]"
echo ""
echo "3. Fix imports in copied files"
echo "   # Update relative imports to use @/ aliases"
echo ""
echo "4. Replace mock data with Prisma queries"
echo ""
echo "5. Test:"
echo "   cd $NURSERY_WEB_PATH"
echo "   npm run dev"
echo ""
echo "📚 See docs/v0-full-codebase-integration.md for detailed instructions"

