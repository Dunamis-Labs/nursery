#!/bin/bash
# Download roses images for category tile and header

cd "$(dirname "$0")/../apps/web/public/categories"

echo "🌹 Downloading roses images..."
echo ""

# Category tile - from Unsplash photo page cBe7BxnmmIw
# Using the photo ID to construct the direct URL
echo "📥 Downloading roses.jpg (category tile)..."
curl -L --max-time 30 --retry 3 --fail -o roses.jpg "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80&auto=format&fit=crop" && echo "  ✅ Downloaded" || echo "  ❌ Failed"

# Category header - direct URL provided
echo "📥 Downloading roses-header.jpg (category header)..."
curl -L --max-time 30 --retry 3 --fail -o roses-header.jpg "https://images.unsplash.com/photo-1578302758063-0ef3e048ca89?q=80&w=1920&auto=format&fit=crop" && echo "  ✅ Downloaded" || echo "  ❌ Failed"

echo ""
echo "📁 Verifying files..."
if [ -f roses.jpg ] && [ -s roses.jpg ]; then
    size=$(stat -f%z roses.jpg 2>/dev/null || stat -c%s roses.jpg 2>/dev/null || echo "0")
    echo "  ✅ roses.jpg exists (${size} bytes)"
    file roses.jpg
else
    echo "  ❌ roses.jpg missing or empty"
fi

if [ -f roses-header.jpg ] && [ -s roses-header.jpg ]; then
    size=$(stat -f%z roses-header.jpg 2>/dev/null || stat -c%s roses-header.jpg 2>/dev/null || echo "0")
    echo "  ✅ roses-header.jpg exists (${size} bytes)"
    file roses-header.jpg
else
    echo "  ❌ roses-header.jpg missing or empty"
fi

echo ""
echo "✅ Complete!"

