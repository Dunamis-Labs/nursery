#!/bin/bash
# Quick script to fix Roses, Water Plants, and Climbers category images

cd "$(dirname "$0")/../apps/web/public/categories"

echo "🔧 Fixing category images..."
echo ""

# Roses - Rose garden
echo "📥 Downloading roses.jpg..."
curl -L --max-time 30 --retry 3 -o roses.jpg "https://images.unsplash.com/photo-1518621012420-9916c1c86a5a?w=1920&q=80" && echo "✅ Roses downloaded" || echo "❌ Failed to download roses"

# Water Plants - Water lilies
echo "📥 Downloading water-plants.jpg..."
curl -L --max-time 30 --retry 3 -o water-plants.jpg "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80" && echo "✅ Water plants downloaded" || echo "❌ Failed to download water plants"

# Climbers - Climbing vines
echo "📥 Downloading climbers.jpg..."
curl -L --max-time 30 --retry 3 -o climbers.jpg "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1920&q=80" && echo "✅ Climbers downloaded" || echo "❌ Failed to download climbers"

echo ""
echo "✅ Complete! Refresh your browser to see the updated images."

