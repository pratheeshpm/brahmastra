#!/bin/bash

# Backend System Design PDF Converter
# This script converts README.md files from backend-system-design folders to PDFs
# It checks for existing PDFs and only recreates missing ones
# Includes automatic mermaid diagram error detection and fixing

set -e  # Exit on any error

# Configuration
SOURCE_DIR="backend-system-design"
OUTPUT_DIR="backend-system-design-pdfs"
PANDOC_OPTIONS="--pdf-engine=xelatex -V geometry:margin=1in -V mainfont=\"Helvetica\" -V fontsize=12pt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to fix common mermaid syntax issues specific to backend docs
fix_mermaid_syntax() {
    local file="$1"
    local temp_file="${file}.tmp"
    
    print_status $YELLOW "🔧 Checking for mermaid syntax issues in $file..."
    
    # Create a backup
    cp "$file" "${file}.backup"
    
    # Fix common mermaid issues found in backend documentation:
    # 1. Replace special arrow characters → with regular text
    # 2. Fix problematic edge labels with special characters
    # 3. Fix node names that start with numbers or contain special chars
    # 4. Fix subgraph syntax issues
    # 5. Remove problematic Unicode characters in mermaid blocks
    sed -e 's/→/ to /g' \
        -e 's/-->|[^|]*Hash([^)]*)[^|]*|/ --> /g' \
        -e 's/-->|[^|]*→[^|]*|/ --> /g' \
        -e 's/-->|[^|]*Hash\([^)]*\)[^|]*|/ --> /g' \
        -e 's/-->|[^|]*SHA[^|]*|/ --> /g' \
        -e 's/-->|[^|]*MD5[^|]*|/ --> /g' \
        -e 's/graph TB/graph TD/g' \
        -e 's/flowchart TB/flowchart TD/g' \
        -e 's/stateDiagram-v2/stateDiagram/g' \
        "$file" > "$temp_file"
    
    # Additional fixes for specific backend patterns
    # Fix database connection arrows with special characters
    sed -i '' -e 's/Database[(]/Database_DB[(/g' \
              -e 's/Cache[(]/Cache_CACHE[(/g' \
              -e 's/Queue[(]/Queue_Q[(/g' \
              "$temp_file" 2>/dev/null || sed -i -e 's/Database[(]/Database_DB[(/g' \
                                                   -e 's/Cache[(]/Cache_CACHE[(/g' \
                                                   -e 's/Queue[(]/Queue_Q[(/g' \
                                                   "$temp_file"
    
    # Check if any changes were made
    if ! cmp -s "$file" "$temp_file"; then
        mv "$temp_file" "$file"
        print_status $YELLOW "   ✏️  Fixed mermaid syntax issues"
        return 0
    else
        rm "$temp_file"
        return 1
    fi
}

# Function to restore file from backup
restore_from_backup() {
    local file="$1"
    if [ -f "${file}.backup" ]; then
        mv "${file}.backup" "$file"
        print_status $YELLOW "   🔄 Restored original file"
    fi
}

# Function to clean up backup files
cleanup_backups() {
    find "$SOURCE_DIR" -name "*.backup" -delete 2>/dev/null || true
}

# Function to detect specific mermaid errors
detect_mermaid_errors() {
    local file="$1"
    local errors=()
    
    # Check for common problematic patterns
    if grep -q "Hash(" "$file"; then
        errors+=("Hash function syntax in mermaid")
    fi
    
    if grep -q "→" "$file"; then
        errors+=("Unicode arrow characters")
    fi
    
    if grep -q "SHA" "$file" && grep -q "\`\`\`mermaid" "$file"; then
        errors+=("SHA text in mermaid diagrams")
    fi
    
    if grep -q "Database\[(" "$file"; then
        errors+=("Database node syntax issues")
    fi
    
    if [ ${#errors[@]} -gt 0 ]; then
        print_status $YELLOW "   ⚠️  Detected potential mermaid issues:"
        for error in "${errors[@]}"; do
            echo "      - $error"
        done
        return 0
    fi
    
    return 1
}

# Function to convert a single markdown file to PDF
convert_to_pdf() {
    local input_file="$1"
    local output_file="$2"
    local folder_name="$3"
    local attempt_count=0
    local max_attempts=3
    
    while [ $attempt_count -lt $max_attempts ]; do
        attempt_count=$((attempt_count + 1))
        
        # Try with mermaid filter first
        if [ $attempt_count -eq 1 ]; then
            print_status $BLUE "   📄 Converting with mermaid diagrams..."
            if pandoc "$input_file" -o "$output_file" $PANDOC_OPTIONS --filter mermaid-filter 2>/dev/null; then
                print_status $GREEN "   ✅ Success with mermaid diagrams"
                return 0
            else
                print_status $YELLOW "   ⚠️  Mermaid conversion failed, analyzing errors..."
                detect_mermaid_errors "$input_file"
            fi
        fi
        
        # Try to fix mermaid syntax and retry
        if [ $attempt_count -eq 2 ]; then
            if fix_mermaid_syntax "$input_file"; then
                print_status $BLUE "   📄 Retrying with fixed mermaid syntax..."
                if pandoc "$input_file" -o "$output_file" $PANDOC_OPTIONS --filter mermaid-filter 2>/dev/null; then
                    print_status $GREEN "   ✅ Success after fixing mermaid syntax"
                    return 0
                fi
            fi
            restore_from_backup "$input_file"
        fi
        
        # Final attempt without mermaid filter
        if [ $attempt_count -eq 3 ]; then
            print_status $BLUE "   📄 Converting without mermaid diagrams..."
            if pandoc "$input_file" -o "$output_file" $PANDOC_OPTIONS 2>/dev/null; then
                print_status $YELLOW "   ✅ Success without mermaid diagrams"
                return 0
            else
                print_status $RED "   ❌ All conversion attempts failed"
                return 1
            fi
        fi
    done
    
    return 1
}

# Function to check if PDF needs to be created/updated
needs_update() {
    local input_file="$1"
    local output_file="$2"
    
    # If PDF doesn't exist, it needs to be created
    if [ ! -f "$output_file" ]; then
        return 0
    fi
    
    # If markdown file is newer than PDF, it needs to be updated
    if [ "$input_file" -nt "$output_file" ]; then
        return 0
    fi
    
    # If PDF is empty or corrupted (less than 1KB), recreate it
    if [ $(stat -f%z "$output_file" 2>/dev/null || echo 0) -lt 1024 ]; then
        return 0
    fi
    
    return 1
}

# Main execution
main() {
    print_status $BLUE "🚀 Backend System Design PDF Converter Starting..."
    print_status $BLUE "=================================================="
    
    # Create output directory if it doesn't exist
    mkdir -p "$OUTPUT_DIR"
    
    # Initialize counters
    local total=0
    local processed=0
    local skipped=0
    local failed=0
    local updated=0
    local created=0
    
    # Count total folders
    total=$(find "$SOURCE_DIR" -maxdepth 1 -type d -name "*-*" | grep -v "^$SOURCE_DIR$" | wc -l)
    
    print_status $BLUE "\n📊 Found $total backend system design folders to process"
    print_status $BLUE "📁 Output directory: $OUTPUT_DIR"
    echo ""
    
    # Process each folder
    for dir in $SOURCE_DIR/*/; do
        if [ ! -d "$dir" ]; then
            continue
        fi
        
        folder_name=$(basename "$dir")
        input_file="$dir/README.md"
        output_file="$OUTPUT_DIR/${folder_name}.pdf"
        
        # Skip if README.md doesn't exist
        if [ ! -f "$input_file" ]; then
            print_status $YELLOW "⚠️  [$folder_name] No README.md found, skipping..."
            continue
        fi
        
        # Check if PDF needs to be created/updated
        if needs_update "$input_file" "$output_file"; then
            if [ -f "$output_file" ]; then
                print_status $YELLOW "🔄 [$folder_name] PDF exists but needs update..."
                updated=$((updated + 1))
            else
                print_status $BLUE "📝 [$folder_name] Creating new PDF..."
                created=$((created + 1))
            fi
            
            # Convert to PDF
            if convert_to_pdf "$input_file" "$output_file" "$folder_name"; then
                processed=$((processed + 1))
                # Show file size
                size=$(ls -lh "$output_file" | awk '{print $5}')
                print_status $GREEN "   📄 Created: ${folder_name}.pdf ($size)"
            else
                failed=$((failed + 1))
                print_status $RED "   ❌ Failed: ${folder_name}"
            fi
        else
            print_status $GREEN "✅ [$folder_name] PDF up to date, skipping..."
            skipped=$((skipped + 1))
        fi
        
        echo ""
    done
    
    # Clean up any backup files
    cleanup_backups
    
    # Print summary
    print_status $BLUE "\n🏁 Conversion Complete!"
    print_status $BLUE "======================="
    echo ""
    print_status $GREEN "📊 Summary:"
    echo "   Total folders processed: $((processed + skipped))"
    echo "   New PDFs created: $created"
    echo "   PDFs updated: $updated"
    echo "   PDFs skipped (up to date): $skipped"
    echo "   Failed conversions: $failed"
    
    if [ $failed -gt 0 ]; then
        print_status $RED "   ⚠️  Some conversions failed. Check output above for details."
    fi
    
    echo ""
    print_status $BLUE "💾 Total PDFs in output directory:"
    pdf_count=$(ls -1 "$OUTPUT_DIR"/*.pdf 2>/dev/null | wc -l)
    total_size=$(du -sh "$OUTPUT_DIR" 2>/dev/null | awk '{print $1}')
    echo "   Count: $pdf_count PDFs"
    echo "   Total size: $total_size"
    
    echo ""
    print_status $GREEN "✨ All done! PDFs are in: $OUTPUT_DIR/"
    
    # Exit with error code if any conversions failed
    if [ $failed -gt 0 ]; then
        exit 1
    fi
}

# Help function
show_help() {
    echo "Backend System Design PDF Converter"
    echo "====================================="
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -f, --force    Force recreate all PDFs (ignore existing ones)"
    echo "  --clean        Remove all existing PDFs before converting"
    echo "  --list         List all potential README.md files and their PDF status"
    echo "  --check        Check for mermaid syntax issues without converting"
    echo ""
    echo "This script:"
    echo "  • Converts README.md files from backend-system-design/* folders to PDFs"
    echo "  • Only processes files that don't exist or are newer than existing PDFs"
    echo "  • Automatically detects and fixes common mermaid diagram syntax issues"
    echo "  • Falls back to text-only conversion if mermaid fails"
    echo "  • Provides detailed progress and error reporting"
    echo ""
}

# Parse command line arguments
FORCE_RECREATE=false
CLEAN_FIRST=false
LIST_ONLY=false
CHECK_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--force)
            FORCE_RECREATE=true
            shift
            ;;
        --clean)
            CLEAN_FIRST=true
            shift
            ;;
        --list)
            LIST_ONLY=true
            shift
            ;;
        --check)
            CHECK_ONLY=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Handle special modes
if [ "$CHECK_ONLY" = true ]; then
    echo "Backend System Design Mermaid Syntax Check:"
    echo "==========================================="
    for dir in $SOURCE_DIR/*/; do
        if [ ! -d "$dir" ]; then continue; fi
        folder_name=$(basename "$dir")
        input_file="$dir/README.md"
        
        if [ -f "$input_file" ]; then
            if detect_mermaid_errors "$input_file"; then
                echo "⚠️  $folder_name → Has potential mermaid issues"
            else
                echo "✅ $folder_name → No obvious mermaid issues"
            fi
        else
            echo "❌ $folder_name → No README.md"
        fi
    done
    exit 0
fi

if [ "$LIST_ONLY" = true ]; then
    echo "Backend System Design README.md files and PDF status:"
    echo "====================================================="
    for dir in $SOURCE_DIR/*/; do
        if [ ! -d "$dir" ]; then continue; fi
        folder_name=$(basename "$dir")
        input_file="$dir/README.md"
        output_file="$OUTPUT_DIR/${folder_name}.pdf"
        
        if [ -f "$input_file" ]; then
            if [ -f "$output_file" ]; then
                size=$(ls -lh "$output_file" | awk '{print $5}')
                echo "✅ $folder_name → PDF exists ($size)"
            else
                echo "❌ $folder_name → PDF missing"
            fi
        else
            echo "⚠️  $folder_name → No README.md"
        fi
    done
    exit 0
fi

if [ "$CLEAN_FIRST" = true ]; then
    print_status $YELLOW "🧹 Cleaning existing PDFs..."
    rm -rf "$OUTPUT_DIR"/*.pdf 2>/dev/null || true
fi

if [ "$FORCE_RECREATE" = true ]; then
    print_status $YELLOW "🔄 Force recreate mode: all PDFs will be regenerated"
    # Override the needs_update function to always return true
    needs_update() { return 0; }
fi

# Run main function
main 