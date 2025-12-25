#!/bin/bash
# Fix category images with verification

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CATEGORIES_DIR="$SCRIPT_DIR/../apps/web/public/categories"

cd "$CATEGORIES_DIR"

echo "🔧 Fixing category images with verification..."
echo ""

# Function to download and verify
download_image() {
    local filename=$1
    local url=$2
    local description=$3
    
    echo "📥 Downloading $filename ($description)..."
    
    # Download with curl
    if curl -L --max-time 30 --retry 3 --fail -o "$filename" "$url" 2>/dev/null; then
        # Verify file exists and has content
        if [ -f "$filename" ] && [ -s "$filename" ]; then
            local size=$(stat -f%z "$filename" 2>/dev/null || stat -c%s "$filename" 2>/dev/null || echo "unknown")
            echo "  ✅ Downloaded: $filename (size: $size bytes)"
            
            # Verify it's a valid image (check for JPEG header)
            if head -c 3 "$filename" | grep -q "^\xFF\xD8\xFF" 2>/dev/null || file "$filename" | grep -q "JPEG\|image" 2>/dev/null; then
                echo "  ✅ Verified: Valid JPEG image"
                return 0
            else
                echo "  ⚠️  Warning: File may not be a valid JPEG"
                return 1
            fi
        else
            echo "  ❌ Error: File is empty or doesn't exist"
            return 1
        fi
    else
        echo "  ❌ Error: Failed to download"
        return 1
    fi
}

# Download the three problematic images
download_image "roses.jpg" "https://images.unsplash.com/photo-1518621012420-9916c1c86a5a?w=1920&q=80" "Rose garden"
echo ""

download_image "water-plants.jpg" "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80" "Water lilies"
echo ""

download_image "climbers.jpg" "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1920&q=80" "Climbing vines"
echo ""

echo "✅ Complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Clear Next.js cache: rm -rf apps/web/.next"
echo "  2. Restart your dev server"
echo "  3. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)"
echo ""

