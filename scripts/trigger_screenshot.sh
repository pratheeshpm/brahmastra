#!/bin/bash

# Brahmastra Screenshot Trigger Script
# This script can be bound to Ctrl+S in macOS System Preferences > Keyboard > Shortcuts

# Method 1: Call the API endpoint
curl -X POST http://localhost:3000/api/shortcut/ctrl-s \
  -H "Content-Type: application/json" \
  -s > /dev/null 2>&1

# Method 2: Alternative - write to trigger file (if server is monitoring)
echo "$(date)" > /tmp/brahmastra_shortcut_trigger.txt

# Optional: Show notification (requires terminal-notifier: brew install terminal-notifier)
# terminal-notifier -message "Screenshot triggered!" -title "Brahmastra" > /dev/null 2>&1

exit 0 