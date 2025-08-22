# 🧠 LeetCode Solver Integration

## Overview

A new `/leetcode` page has been added to the application that integrates with the Python backend to solve LeetCode problems using AI. The system supports both text input and image upload, with comprehensive analysis and markdown rendering.

## Features

### Frontend Features
- **Text Input**: Multi-line text area for pasting LeetCode problems
- **Image Upload**: Support for problem screenshots (PNG, JPEG, JPG, GIF, BMP, WebP)
- **Enhanced Analysis**: Toggle between basic and enhanced problem solving
- **Self-Correction**: Configurable number of correction attempts (1-5)
- **Solution Storage**: Option to store solutions for future reference
- **Markdown Rendering**: Full markdown support with syntax highlighting
- **Mermaid Diagrams**: Automatic rendering of Mermaid diagrams in solutions
- **Tabbed Interface**: Organized display of solution, explanation, analysis, and execution results

### Backend Integration
- **Multiple Endpoints**: Support for basic and enhanced solving
- **Image Processing**: OCR and vision-based problem extraction
- **Self-Correction**: AI automatically fixes failed solutions
- **Storage System**: Organized solution storage by date and category
- **CORS Support**: Proper cross-origin resource sharing configuration

## API Endpoints

### Text Problem Solving
```bash
POST http://localhost:8000/solve/text
POST http://localhost:8000/solve/enhanced
```

### Image Problem Solving
```bash
POST http://localhost:8000/solve/image
POST http://localhost:8000/solve/enhanced-image
```

### Example Endpoints
```bash
GET http://localhost:8000/examples/two-sum
GET http://localhost:8000/examples/enhanced-two-sum
```

### Health Check
```bash
GET http://localhost:8000/health
GET http://localhost:8000/system-info
```

## Navigation

The LeetCode Solver can be accessed through:
1. **Sidebar Navigation**: Click "LeetCode Solver" in the left sidebar
2. **Direct URL**: Navigate to `/leetcode` in your browser
3. **Back Button**: Return to home from the LeetCode page

## Request/Response Format

### Text Request
```json
{
  "problem_text": "Your LeetCode problem description",
  "max_corrections": 3,
  "store_solution": true,
  "timeout": 30
}
```

### Enhanced Response
```json
{
  "success": true,
  "solution": "function twoSum(nums, target) { ... }",
  "optimized_solution": "// Optimized version",
  "explanation": "## Algorithm Explanation...",
  "complexity_analysis": "Time: O(n), Space: O(n)",
  "brute_force_approach": "Nested loops approach...",
  "test_cases_covered": ["Basic case", "Edge cases"],
  "execution_result": {
    "success": true,
    "exit_code": 0,
    "execution_time": 0.05,
    "output": "Test results..."
  },
  "processing_time": 12.5,
  "iterations": 1,
  "self_corrected": false,
  "storage": {
    "stored": true,
    "solution_file": "path/to/solution.js"
  }
}
```

## Testing

### Manual Testing
1. Start the Python backend:
   ```bash
   cd pythonBackend
   python APIServer/api_server.py
   ```

2. Start the Next.js frontend:
   ```bash
   npm run dev
   ```

3. Navigate to `http://localhost:3000/leetcode`

### Automated Testing
Run the test script to verify backend functionality:
```bash
node test-leetcode-api.js
```

## File Structure

```
pages/
├── leetcode.tsx                 # Main LeetCode page component

components/LeetCode/
├── index.ts                     # Component exports
├── LeetCodeSolver.tsx          # Main solver component with tabs
└── LeetCodeSolutionRenderer.tsx # Markdown renderer with syntax highlighting

pythonBackend/APIServer/
├── api_server.py               # FastAPI server with endpoints
└── start_server.py             # Alternative server startup script
```

## Configuration

### Backend Configuration
- **Port**: Server runs on `localhost:8000` by default
- **CORS**: Configured to allow all origins (configure for production)
- **File Upload**: 20MB limit for images
- **Timeout**: Configurable execution timeout (5-60 seconds)

### Frontend Configuration
- **API Base URL**: `http://localhost:8000` (hardcoded, consider making configurable)
- **File Types**: Supports common image formats
- **Max Corrections**: User-configurable (1-5 attempts)

## Troubleshooting

### Common Issues

1. **Backend Not Running**
   - Error: "Failed to fetch" or connection refused
   - Solution: Start the Python backend server

2. **Port Conflicts**
   - The documentation mentions port 8001, but the main server uses 8000
   - Use port 8000 for the main API server

3. **Missing Dependencies**
   - Ensure all Python packages are installed: `pip install -r requirements.txt`
   - Ensure Node.js dependencies are installed: `npm install`

4. **CORS Issues**
   - Backend is configured to allow all origins
   - If issues persist, check browser console for specific CORS errors

5. **Image Upload Failures**
   - Check file size (max 20MB)
   - Verify file format is supported
   - Check backend logs for processing errors

### Backend Logs
Monitor the Python backend console for detailed error messages and processing status.

### Frontend Debugging
Use browser developer tools to inspect network requests and console errors.

## Future Enhancements

- [ ] Make API base URL configurable
- [ ] Add retry logic for failed requests
- [ ] Implement request caching
- [ ] Add solution comparison features
- [ ] Support for multiple programming languages
- [ ] Integration with LeetCode's official API
- [ ] Solution sharing and collaboration features
- [ ] Performance analytics and tracking

## Dependencies

### Frontend
- React 18+
- Next.js
- TypeScript
- Tailwind CSS
- react-markdown
- react-syntax-highlighter
- rehype-mathjax
- remark-gfm

### Backend
- FastAPI
- Python 3.8+
- OpenAI API
- PraisonAI
- Uvicorn

## Contributing

When making changes to the LeetCode integration:

1. Update both frontend and backend components
2. Test with the provided test script
3. Update this documentation
4. Verify CORS and security configurations
5. Test with various problem types and image formats
