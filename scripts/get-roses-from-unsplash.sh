#!/bin/bash
# Download roses image from the specific Unsplash photo

cd "$(dirname "$0")/../apps/web/public/categories"

echo "🌹 Downloading roses image from Unsplash photo cBe7BxnmmIw..."
echo ""

# Remove any existing file
rm -f roses.jpg

# Method 1: Try Unsplash Source API with photo ID
echo "📥 Method 1: Using Unsplash Source API..."
curl -L --max-time 30 --retry 3 --fail --silent -o roses-temp.jpg "https://source.unsplash.com/cBe7BxnmmIw/1920x1080" 2>/dev/null

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

# Method 2: Try direct Unsplash download (you may need to get the actual photo timestamp)
# The photo ID is cBe7BxnmmIw, but we need the timestamp
# Common format: https://images.unsplash.com/photo-{timestamp}-{id}?w=1920

echo ""
echo "❌ Automatic download failed."
echo ""
echo "Please download manually:"
echo "1. Go to: https://unsplash.com/photos/pink-petaled-flower-cBe7BxnmmIw"
echo "2. Click 'Download free' button"
echo "3. Save the image as: apps/web/public/categories/roses.jpg"
echo ""
echo "Or if you have the direct image URL, run:"
echo "  curl -L -o roses.jpg \"YOUR_DIRECT_URL_HERE\""

exit 1

