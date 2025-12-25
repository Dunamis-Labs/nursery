#!/bin/bash
# Download roses category tile image - multiple methods

cd "$(dirname "$0")/../apps/web/public/categories"

echo "🌹 Downloading roses.jpg for category tile..."
echo ""

# Method 1: Try using the photo ID directly with Unsplash Source API
echo "📥 Attempt 1: Using Unsplash Source API..."
if curl -L --max-time 30 --retry 3 --fail --silent -o roses-temp.jpg "https://source.unsplash.com/cBe7BxnmmIw/1920x1080" 2>/dev/null; then
    if [ -f roses-temp.jpg ] && [ -s roses-temp.jpg ]; then
        size=$(stat -f%z roses-temp.jpg 2>/dev/null || stat -c%s roses-temp.jpg 2>/dev/null || echo "0")
        if [ "$size" -gt 10000 ]; then
            mv roses-temp.jpg roses.jpg
            echo "  ✅ Success! Downloaded roses.jpg (${size} bytes)"
            file roses.jpg
            exit 0
        fi
    fi
    rm -f roses-temp.jpg
fi

# Method 2: Try direct Unsplash image URL (using a known working roses photo)
echo "📥 Attempt 2: Using direct Unsplash URL..."
if curl -L --max-time 30 --retry 3 --fail --silent -o roses-temp.jpg "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80&auto=format&fit=crop" 2>/dev/null; then
    if [ -f roses-temp.jpg ] && [ -s roses-temp.jpg ]; then
        size=$(stat -f%z roses-temp.jpg 2>/dev/null || stat -c%s roses-temp.jpg 2>/dev/null || echo "0")
        if [ "$size" -gt 10000 ]; then
            mv roses-temp.jpg roses.jpg
            echo "  ✅ Success! Downloaded roses.jpg (${size} bytes)"
            file roses.jpg
            exit 0
        fi
    fi
    rm -f roses-temp.jpg
fi

# Method 3: Try another roses photo
echo "📥 Attempt 3: Using alternative roses photo..."
if curl -L --max-time 30 --retry 3 --fail --silent -o roses-temp.jpg "https://images.unsplash.com/photo-1518621012420-9916c1c86a5a?w=1920&q=80&fit=crop&auto=format" 2>/dev/null; then
    if [ -f roses-temp.jpg ] && [ -s roses-temp.jpg ]; then
        size=$(stat -f%z roses-temp.jpg 2>/dev/null || stat -c%s roses-temp.jpg 2>/dev/null || echo "0")
        if [ "$size" -gt 10000 ]; then
            mv roses-temp.jpg roses.jpg
            echo "  ✅ Success! Downloaded roses.jpg (${size} bytes)"
            file roses.jpg
            exit 0
        fi
    fi
    rm -f roses-temp.jpg
fi

echo "❌ All download methods failed"
echo ""
echo "Please manually download from:"
echo "  https://unsplash.com/photos/pink-petaled-flower-cBe7BxnmmIw"
echo "  Save as: apps/web/public/categories/roses.jpg"
exit 1

