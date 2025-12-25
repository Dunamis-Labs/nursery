#!/bin/bash
# Fix roses image with multiple fallback options

cd "$(dirname "$0")/../apps/web/public/categories"

echo "🌹 Fixing roses image..."
echo ""

# Try multiple Unsplash URLs
URLS=(
  "https://images.unsplash.com/photo-1518621012420-9916c1c86a5a?w=1920&q=80&fit=crop&auto=format"
  "https://images.unsplash.com/photo-1597848212624-e593faa5e35e?w=1920&q=80&auto=format"
  "https://images.unsplash.com/photo-1462275646964-a0e85b5c8c0e?w=1920&q=80&auto=format"
  "https://source.unsplash.com/1920x1080/?rose,garden"
)

for url in "${URLS[@]}"; do
  echo "📥 Trying: ${url:0:60}..."
  if curl -L --max-time 30 --fail --silent --show-error -o roses.jpg "$url" 2>&1; then
    if [ -f roses.jpg ] && [ -s roses.jpg ]; then
      size=$(stat -f%z roses.jpg 2>/dev/null || stat -c%s roses.jpg 2>/dev/null || echo "0")
      if [ "$size" -gt 10000 ]; then
        echo "✅ Success! Downloaded roses.jpg (${size} bytes)"
        file roses.jpg
        exit 0
      else
        echo "⚠️  File too small (${size} bytes), trying next..."
        rm -f roses.jpg
      fi
    fi
  fi
done

echo "❌ All attempts failed. Please download manually."
exit 1

