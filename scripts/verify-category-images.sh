#!/bin/bash
# Verify category images exist and are valid

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CATEGORIES_DIR="$SCRIPT_DIR/../apps/web/public/categories"

echo "🔍 Verifying category images..."
echo ""

cd "$CATEGORIES_DIR"

for img in roses.jpg water-plants.jpg climbers.jpg; do
    if [ -f "$img" ]; then
        size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null || echo "unknown")
        if [ "$size" != "unknown" ] && [ "$size" -gt 1000 ]; then
            echo "✅ $img exists (${size} bytes)"
        else
            echo "⚠️  $img exists but is very small (${size} bytes) - may be corrupted"
        fi
    else
        echo "❌ $img NOT FOUND"
    fi
done

echo ""
echo "📁 Images should be in: $CATEGORIES_DIR"
echo ""

