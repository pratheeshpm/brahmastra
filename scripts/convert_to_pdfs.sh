#!/bin/bash

# Function to convert markdown to PDF using the user's alias
convert_md_to_pdf() {
    local input_file="$1"
    local output_file="$2"
    
    echo "Converting $input_file to $output_file..."
    pandoc "$input_file" -o "$output_file" --pdf-engine=xelatex -V geometry:margin=1in -V mainfont="Helvetica" -V fontsize=12pt --filter mermaid-filter
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully converted $input_file"
    else
        echo "❌ Failed to convert $input_file"
        return 1
    fi
}

# Create output directory if it doesn't exist
mkdir -p frontend-system-design-pdfs

# Counter for tracking progress
count=0
total=0

# First count total files
for dir in frontend-system-design/*/; do
    if [ -f "$dir/README.md" ]; then
        total=$((total + 1))
    fi
done

echo "Found $total README.md files to convert..."
echo "================================================"

# Convert each README.md to PDF
for dir in frontend-system-design/*/; do
    if [ -d "$dir" ]; then
        folder_name=$(basename "$dir")
        readme_file="$dir/README.md"
        
        if [ -f "$readme_file" ]; then
            count=$((count + 1))
            
            # Create PDF filename (e.g., "01-collaborative-text-editor.pdf")
            pdf_name="${folder_name}.pdf"
            output_path="frontend-system-design-pdfs/$pdf_name"
            
            echo "[$count/$total] Processing: $folder_name"
            
            # Convert to PDF
            if convert_md_to_pdf "$readme_file" "$output_path"; then
                # Get file size for confirmation
                if [ -f "$output_path" ]; then
                    file_size=$(ls -lh "$output_path" | awk '{print $5}')
                    echo "   📄 Created: $pdf_name ($file_size)"
                fi
            fi
            echo ""
        else
            echo "⚠️  No README.md found in $folder_name"
        fi
    fi
done

echo "================================================"
echo "✅ Conversion complete!"
echo "📁 PDFs saved to: frontend-system-design-pdfs/"
echo ""

# List all created PDFs with sizes
echo "Generated PDFs:"
ls -lh frontend-system-design-pdfs/ | grep -v "^total" | awk '{print "   " $9 " (" $5 ")"}' 