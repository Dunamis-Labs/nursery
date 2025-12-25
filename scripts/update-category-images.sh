#!/bin/bash
# Update specific category images

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CATEGORIES_DIR="$SCRIPT_DIR/../apps/web/public/categories"

cd "$CATEGORIES_DIR"

echo "🖼️  Updating category images..."
echo ""

# Water Plants - Category Tile
echo "📥 Downloading water-plants.jpg (category tile)..."
curl -L --max-time 30 --retry 3 --fail -o water-plants.jpg "https://images.unsplash.com/photo-1658434640456-ff9284d9ad0c?q=80&w=1920&auto=format&fit=crop" && echo "  ✅ Downloaded" || echo "  ❌ Failed"

# Water Plants - Category Header (separate file)
echo "📥 Downloading water-plants-header.jpg (category header)..."
curl -L --max-time 30 --retry 3 --fail -o water-plants-header.jpg "https://images.unsplash.com/photo-1663330890930-ae485543e4af?q=80&w=1920&auto=format&fit=crop" && echo "  ✅ Downloaded" || echo "  ❌ Failed"

# Roses - Try multiple URLs to find one that works
echo "📥 Downloading roses.jpg..."
if curl -L --max-time 30 --retry 3 --fail -o roses.jpg "https://images.unsplash.com/photo-1518621012420-9916c1c86a5a?w=1920&q=80&fit=crop" 2>/dev/null; then
    echo "  ✅ Downloaded (first URL)"
elif curl -L --max-time 30 --retry 3 --fail -o roses.jpg "https://images.unsplash.com/photo-1597848212624-e593faa5e35e?w=1920&q=80" 2>/dev/null; then
    echo "  ✅ Downloaded (fallback URL)"
else
    echo "  ❌ Failed - trying alternative..."
    curl -L --max-time 30 --retry 3 --fail -o roses.jpg "https://source.unsplash.com/1920x1080/?rose,garden" && echo "  ✅ Downloaded (source API)" || echo "  ❌ All attempts failed"
fi

echo ""
echo "✅ Complete!"
echo ""
echo "📁 Files in: $CATEGORIES_DIR"
ls -lh {roses,water-plants,water-plants-header}.jpg 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

