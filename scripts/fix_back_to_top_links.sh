#!/bin/bash

# Fix Back to Top Links Script
# This script fixes broken back to top links across all README.md files

echo "🔧 Fixing back to top links in system design README files..."

# Counter for files processed
files_processed=0
links_fixed=0

# Function to fix back to top links in a file
fix_file() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    echo "Processing: $file"
    
    # Check if the file has the emoji table of contents header
    if grep -q "## 📋 Table of Contents" "$file"; then
        # For files with emoji header, fix the link to point to the correct anchor
        # GitHub converts "📋 Table of Contents" to anchor "#--table-of-contents"
        sed 's|\[⬆️ Back to Top\](#-table-of-contents)|\[⬆️ Back to Top\](#-table-of-contents)|g' "$file" > "$temp_file"
        
        # Count how many replacements were made
        local count=$(grep -c "\[⬆️ Back to Top\](#-table-of-contents)" "$file")
        if [ "$count" -gt 0 ]; then
            links_fixed=$((links_fixed + count))
            mv "$temp_file" "$file"
            echo "  ✅ Fixed $count back to top links"
        else
            rm "$temp_file"
            echo "  ℹ️  No back to top links to fix"
        fi
    elif grep -q "## Table of Contents" "$file"; then
        # For files with regular header, fix the link to point to #table-of-contents
        sed 's|\[⬆️ Back to Top\](#-table-of-contents)|\[⬆️ Back to Top\](#table-of-contents)|g' "$file" > "$temp_file"
        
        local count=$(grep -c "\[⬆️ Back to Top\](#-table-of-contents)" "$file")
        if [ "$count" -gt 0 ]; then
            links_fixed=$((links_fixed + count))
            mv "$temp_file" "$file"
            echo "  ✅ Fixed $count back to top links"
        else
            rm "$temp_file"
            echo "  ℹ️  No back to top links to fix"
        fi
    else
        echo "  ⚠️  No Table of Contents header found"
    fi
    
    files_processed=$((files_processed + 1))
}

# Process all README.md files in backend-system-design
echo ""
echo "📁 Processing backend-system-design directory..."
find backend-system-design -name "README.md" -type f | while read -r file; do
    fix_file "$file"
done

# Process all README.md files in frontend-system-design
echo ""
echo "📁 Processing frontend-system-design directory..."
find frontend-system-design -name "README.md" -type f | while read -r file; do
    fix_file "$file"
done

echo ""
echo "🎉 Back to top link fixing completed!"
echo "📊 Summary:"
echo "   - Files processed: $files_processed"
echo "   - Links fixed: $links_fixed" 