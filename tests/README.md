# Tests Directory

This directory contains all testing, debugging, and example files used for development and quality assurance.

## 📋 Test Files Overview

### WebSocket Testing
- **`test-websocket-keepalive.js`** - Tests WebSocket connection keepalive functionality
- **`debug-websocket-events.js`** - Debug tool for WebSocket event monitoring
- **`diagnose-websocket.js`** - Diagnostic tool for WebSocket connection issues
- **`WEBSOCKET_KEEPALIVE.md`** - Documentation for WebSocket keepalive implementation

### Screenshot Testing
- **`test-screenshot-debug.js`** - Debug screenshot functionality
- **`test-screenshot-frontend.js`** - Frontend screenshot testing
- **`test-screenshot-multiple.js`** - Multiple screenshot testing scenarios

### API & Search Testing
- **`test-perplexity-search.js`** - Tests Perplexity search API integration
- **`test-perplexity-nonstreaming.js`** - Tests non-streaming Perplexity API calls

### Component & Functionality Testing
- **`test_global_keys.js`** - Tests global keyboard shortcuts functionality
- **`TEST_MERMAID_FUNCTIONALITY.md`** - Mermaid diagram functionality testing documentation

### Development Examples
- **`csp_example.js`** - Content Security Policy example implementation

### Testing Utilities
- **`test_anchor.md`** - Test file for markdown anchor functionality
- **`test.py`** - Python test utilities
- **`mermaid-filter.err`** - Mermaid filter error logs

## 🧪 Testing Categories

### Unit Tests
- Individual component testing
- API endpoint testing
- Utility function testing

### Integration Tests
- WebSocket connection testing
- Search functionality testing
- Screenshot service testing

### Debug Tools
- Connection diagnostics
- Event monitoring
- Error logging

## 🚀 Running Tests

### JavaScript Tests
```bash
node tests/test-filename.js
```

### Python Tests
```bash
python tests/test.py
```

## 📝 Test Development Guidelines

1. **Naming Convention**: Use descriptive names with `test-` prefix
2. **Documentation**: Include inline comments explaining test scenarios
3. **Error Handling**: Implement proper error handling and logging
4. **Cleanup**: Ensure tests clean up after themselves
5. **Independence**: Tests should be independent and not rely on each other

## 🔧 Maintenance

- Regularly update tests when features change
- Remove obsolete test files
- Keep debug tools updated with latest APIs
- Document new test files in this README 