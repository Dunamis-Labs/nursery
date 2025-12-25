#!/bin/bash
# Download the CORRECT roses image (not coffee roaster!)

cd "$(dirname "$0")/../apps/web/public/categories"

echo "🌹 Downloading CORRECT roses image..."
echo ""

# Remove any existing (wrong) image
rm -f roses.jpg

# Try multiple known-good roses images
echo "📥 Attempting download..."

# Option 1: Beautiful pink roses
if curl -L --max-time 30 --retry 3 --fail --silent -o roses-temp.jpg "https://images.unsplash.com/photo-1462275646964-a0e85b5c8c0e?w=1920&q=80&auto=format&fit=crop" 2>/dev/null; then
    if [ -f roses-temp.jpg ] && [ -s roses-temp.jpg ]; then
        size=$(stat -f%z roses-temp.jpg 2>/dev/null || stat -c%s roses-temp.jpg 2>/dev/null || echo "0")
        if [ "$size" -gt 50000 ]; then
            mv roses-temp.jpg roses.jpg
            echo "✅ Success! Downloaded roses.jpg (${size} bytes)"
            file roses.jpg
            exit 0
        fi
    fi
    rm -f roses-temp.jpg
fi

# Option 2: Rose garden
if curl -L --max-time 30 --retry 3 --fail --silent -o roses-temp.jpg "https://images.unsplash.com/photo-1518621012420-9916c1c86a5a?w=1920&q=80&fit=crop&auto=format" 2>/dev/null; then
    if [ -f roses-temp.jpg ] && [ -s roses-temp.jpg ]; then
        size=$(stat -f%z roses-temp.jpg 2>/dev/null || stat -c%s roses-temp.jpg 2>/dev/null || echo "0")
        if [ "$size" -gt 50000 ]; then
            mv roses-temp.jpg roses.jpg
            echo "✅ Success! Downloaded roses.jpg (${size} bytes)"
            file roses.jpg
            exit 0
        fi
    fi
    rm -f roses-temp.jpg
fi

echo "❌ Failed to download. Please download manually from:"
echo "   https://unsplash.com/photos/pink-petaled-flower-cBe7BxnmmIw"
echo "   Save as: apps/web/public/categories/roses.jpg"
exit 1

