# Scripts Directory

This directory contains all shell scripts used for various automation tasks in the project.

## 📋 Scripts Overview

### PDF Generation Scripts
- **`convert_backend_pdfs.sh`** - Converts backend system design markdown files to PDF format
- **`convert_frontend_pdfs.sh`** - Converts frontend system design markdown files to PDF format  
- **`convert_to_pdfs.sh`** - General PDF conversion script
- **`convert-all-summaries.sh`** - Converts summary files to PDF format (large file, 837KB)

### Maintenance & Fix Scripts
- **`fix_back_to_top_links.sh`** - Fixes broken "Back to Top" navigation links across all README files
- **`scripts.sh`** - General utility script (78B)

### Development & Testing Scripts
- **`trigger_screenshot.sh`** - Triggers screenshot functionality for testing purposes

## 🚀 Usage

Make sure scripts are executable before running:
```bash
chmod +x scripts/*.sh
```

Run any script from the project root:
```bash
./scripts/script_name.sh
```

## 📝 Notes

- All scripts are designed to be run from the project root directory
- PDF conversion scripts require appropriate markdown-to-PDF tools
- Some scripts may require specific environment variables or dependencies

## 🔧 Maintenance

- Keep scripts organized by functionality
- Add new scripts with descriptive names
- Update this README when adding new scripts
- Test scripts thoroughly before committing 