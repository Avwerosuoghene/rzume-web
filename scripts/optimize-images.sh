#!/bin/bash

# Image Optimization Script for rzume_web
# This script optimizes images in the assets folder

set -e

echo "🖼️  Starting image optimization..."

# Check if sharp-cli is installed
if ! command -v sharp &> /dev/null; then
    echo "⚠️  sharp-cli not found. Installing..."
    npm install -g sharp-cli
fi

# Define directories
PUBLIC_ASSETS="public/assets/images"
SRC_ASSETS="src/assets/images"

# Function to optimize images in a directory
optimize_directory() {
    local dir=$1
    
    if [ ! -d "$dir" ]; then
        echo "⚠️  Directory $dir does not exist, skipping..."
        return
    fi
    
    echo "📁 Processing directory: $dir"
    
    # Find and optimize PNG files
    find "$dir" -type f -name "*.png" | while read file; do
        echo "  Optimizing: $file"
        sharp -i "$file" -o "${file%.png}-optimized.png" -f png -q 80 --progressive
        mv "${file%.png}-optimized.png" "$file"
    done
    
    # Find and optimize JPG/JPEG files
    find "$dir" -type f \( -name "*.jpg" -o -name "*.jpeg" \) | while read file; do
        echo "  Optimizing: $file"
        sharp -i "$file" -o "${file%.*}-optimized.jpg" -f jpeg -q 85 --progressive
        mv "${file%.*}-optimized.jpg" "$file"
    done
    
    # Convert large images to WebP format
    find "$dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read file; do
        # Check if file is larger than 50KB
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ "$size" -gt 51200 ]; then
            echo "  Creating WebP version: $file"
            sharp -i "$file" -o "${file%.*}.webp" -f webp -q 80
        fi
    done
}

# Optimize both directories
optimize_directory "$PUBLIC_ASSETS"
optimize_directory "$SRC_ASSETS"

echo "✅ Image optimization complete!"
echo ""
echo "📊 Summary:"
echo "  - PNG files optimized with quality 80"
echo "  - JPG files optimized with quality 85"
echo "  - WebP versions created for files > 50KB"
echo ""
echo "💡 Tip: Use <picture> elements with WebP sources for best performance"
