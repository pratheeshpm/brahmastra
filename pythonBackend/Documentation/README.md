# 🐍 Python Backend - LeetCode Problem Solver

A comprehensive Python backend system using PraisonAI with OpenAI GPT-4o to solve LeetCode problems from images or text, generate JavaScript solutions, and validate them with automated testing.

## 📁 Project Structure

```
pythonBackend/
├── 📂 APIServer/                       # FastAPI server implementation
├── 📂 LeetCodeSolver/                  # Core LeetCode solving functionality  
├── 📂 JSReactSolver/                   # React.js/JavaScript problem solver
├── 📂 WebResearchEngine/               # 🌐 Web research with custom prompts & Mermaid diagrams
├── 📂 Documentation/                   # 📚 All documentation files
├── 📂 TestSuites/                      # Comprehensive test suites
├── 📂 CommonUtils/                     # Shared utilities and helpers
├── 📂 examples/                        # Usage examples and demos
├── 📂 solutions/                       # 💾 Stored solutions (organized by date)
└── 📋 requirements.txt                 # Python dependencies
```

## 📚 Documentation Index

### **Core Documentation**
- **[📖 Main Documentation](README.md)** - This comprehensive guide
- **[🚀 Parallel Startup Guide](../../README_PARALLEL_STARTUP.md)** - How to start Node.js + Python together
- **[📋 API Usage Guide](API_USAGE_GUIDE.md)** - FastAPI endpoints and usage
- **[🔧 Usage Guide](USAGE_GUIDE.md)** - Detailed usage instructions

### **Solver Documentation**
- **[🧠 LeetCode Solver](../LeetCodeSolver/LEETCODE_SOLVER_README.md)** - Core LeetCode solving engine
- **[⚛️ React.js Solver](../JSReactSolver/REACT_JS_SOLVER_SUMMARY.md)** - React/JavaScript problem solver
- **[🌐 Web Research Engine](../WebResearchEngine/README.md)** - Web research with custom prompts & Mermaid diagrams
- **[🆕 2025 Model Upgrade](2025_MODEL_UPGRADE_SUMMARY.md)** - Latest OpenAI model optimizations

### **Project Documentation**
- **[🎬 YouTube Search](../../README_YOUTUBE_SEARCH.md)** - YouTube integration features
- **[📝 YouTube Transcript](../../README_YOUTUBE_TRANSCRIPT.md)** - Transcript processing

## 🎯 Quick Start

### 1. Setup Environment
```bash
# Navigate to the pythonBackend directory
cd pythonBackend

# Activate your conda environment
conda activate praisonchat  # or conda activate praison

# Install dependencies
pip install -r requirements.txt
```

### 2. Set API Key
```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your_openai_api_key_here"
```

### 3. Run the Solver
```bash
# Interactive mode (RECOMMENDED)
python simplified_leetcode_solver.py

# Quick test
python quick_test.py

# Full system test
python test_complete_setup.py
```

## 🚀 Main Files Overview

### **📍 simplified_leetcode_solver.py** - **USE THIS ONE**
- ✅ **Primary solver** - fully tested and working
- ✅ Compatible with latest PraisonAI version (2.2.82)
- ✅ Auto-detects OpenAI API key from environment
- ✅ Interactive menu system
- ✅ Image and text processing
- ✅ JavaScript solution generation and validation

### **⚡ improved_leetcode_solver.py** - Advanced Features
- ⚠️ Requires specific PraisonAI version with custom tools
- 🔧 Enhanced with MCP (Model Context Protocol) support
- 🧠 Advanced problem analysis and classification
- 📊 Detailed complexity analysis
- 🧪 Comprehensive test case generation

### **🧪 test_complete_setup.py** - System Verification
- 🔍 Tests all system requirements
- 📦 Verifies package installations
- 🟢 Node.js compatibility check
- 🔑 API key validation
- 📊 Comprehensive system report

### **⭐ quick_test.py** - Fast Verification
- ⚡ Quick functionality test
- 🎯 Tests core solver capabilities
- ✅ Minimal setup verification

## 🎮 Usage Examples

### Example 1: Interactive Mode
```bash
python simplified_leetcode_solver.py
```
Then select from menu:
1. 🖼️ Solve from image
2. 📝 Solve from text  
3. 🧪 Test with Two Sum
4. 📋 System info
5. 👋 Exit

### Example 2: API Server Usage

#### 🚀 Start the API Server
```bash
# Method 1: Parallel startup with Node.js (RECOMMENDED)
npm run dev

# Method 2: Python only
cd pythonBackend
python APIServer/api_server.py

# Method 3: Using the startup script
./scripts/start-python-backend.sh
```

## 🌐 API Endpoints Documentation

The FastAPI server runs on `http://localhost:8000` and provides comprehensive REST APIs for all functionality.

### 📊 System Endpoints

#### Health Check
```bash
curl -X GET "http://localhost:8000/health"
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T12:34:56",
  "version": "1.0.0"
}
```

#### System Information
```bash
curl -X GET "http://localhost:8000/system-info"
```
**Response:**
```json
{
  "python_version": "3.11.x",
  "praisonai_version": "2.2.82",
  "openai_key_configured": true,
  "node_available": true,
  "system": "Darwin 24.4.0"
}
```

### 🧠 LeetCode Problem Solving

#### Basic Problem Solving
```bash
curl -X POST "http://localhost:8000/solve/text" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_text": "Two Sum: Given an array of integers nums and a target, return indices of the two numbers such that they add up to target. Example: Input: nums = [2,7,11,15], target = 9. Output: [0,1].",
    "max_corrections": 3,
    "store_solution": true,
    "timeout": 30
  }'
```

#### Enhanced Problem Solving (with Analysis)
```bash
curl -X POST "http://localhost:8000/solve/enhanced" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_text": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "max_corrections": 3,
    "store_solution": true
  }'
```

**Enhanced Response:**
```json
{
  "success": true,
  "solution": "function twoSum(nums, target) { /* optimized solution */ }",
  "optimized_solution": "// O(n) time, O(n) space solution...",
  "explanation": "## Algorithm Explanation\n1. Use hash map for O(n) lookup...",
  "complexity_analysis": "Time: O(n), Space: O(n)",
  "brute_force_approach": "Nested loops: O(n²) time complexity",
  "test_cases_covered": ["Basic case", "Edge cases", "Large inputs"],
  "processing_time": 12.5,
  "storage": {
    "stored": true,
    "solution_path": "solutions/leetcode/2025-01-08/...",
    "category": "leetcode"
  }
}
```

#### Image-Based Problem Solving
```bash
# Upload image file
curl -X POST "http://localhost:8000/solve/image" \
  -F "image=@leetcode_problem.png" \
  -F "max_corrections=3" \
  -F "store_solution=true"

# Or with base64 encoded image
curl -X POST "http://localhost:8000/solve/base64" \
  -H "Content-Type: application/json" \
  -d '{
    "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "max_corrections": 3,
    "store_solution": false
  }'
```

#### Example Endpoints
```bash
# Get Two Sum example
curl -X GET "http://localhost:8000/examples/two-sum"

# Get enhanced Two Sum example with full analysis
curl -X GET "http://localhost:8000/examples/enhanced-two-sum"
```

### 🌐 Web Research Engine

#### Get Available Research Categories
```bash
curl -X GET "http://localhost:8000/research/categories"
```
**Response:**
```json
{
  "categories": [
    "frontend_system_design",
    "backend_system_design", 
    "system_design_interview"
  ],
  "count": 3
}
```

#### Get Available Prompts
```bash
curl -X GET "http://localhost:8000/research/prompts"
```

#### Conduct Research (Auto-Prompt Selection)
```bash
curl -X POST "http://localhost:8000/research/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to design a scalable microservices architecture for e-commerce?",
    "depth": "comprehensive",
    "include_diagrams": true,
    "store_result": true,
    "max_timeout": 300
  }'
```

#### Research with Specific Prompt
```bash
curl -X POST "http://localhost:8000/research/prompt/microservices_architecture" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "E-commerce platform backend design",
    "depth": "deep",
    "include_diagrams": true,
    "store_result": true
  }'
```

#### Example Research Endpoint
```bash
curl -X GET "http://localhost:8000/examples/research-microservices"
```

### 📁 Response Format Details

All API responses include:
- **success**: Boolean indicating if operation succeeded
- **processing_time**: Time taken in seconds
- **timestamp**: ISO format timestamp
- **storage**: Information about file storage (if enabled)
- **error**: Error message (if operation failed)

### 🔒 Error Handling

Common HTTP status codes:
- **200**: Success
- **400**: Bad Request (invalid input)
- **422**: Validation Error (missing/invalid fields)
- **500**: Internal Server Error
- **503**: Service Unavailable (AI models not initialized)

### Example Error Response:
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "problem_text"],
      "msg": "Field required",
      "input": {...}
    }
  ]
}
```

## 🧪 Testing the APIs

### Quick API Health Test
```bash
# Test server is running
curl -X GET "http://localhost:8000/health"

# Test system info
curl -X GET "http://localhost:8000/system-info"
```

### Test LeetCode Solving
```bash
# Basic problem solving
curl -X POST "http://localhost:8000/solve/text" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_text": "Two Sum: Given an array nums and target, return indices that add up to target",
    "max_corrections": 2,
    "store_solution": false,
    "timeout": 30
  }'
```

### Test Research Engine
```bash
# Get available research categories
curl -X GET "http://localhost:8000/research/categories"

# Quick research test
curl -X POST "http://localhost:8000/research/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How to optimize React performance?",
    "depth": "basic",
    "include_diagrams": false,
    "store_result": false,
    "max_timeout": 120
  }'
```

# Check storage statistics
curl http://localhost:8001/storage/stats

# List today's solutions
curl http://localhost:8001/storage/solutions

# List solutions for a specific date
curl http://localhost:8001/storage/solutions/2025-01-01
```

### Example 3: Programmatic Usage
```python
from simplified_leetcode_solver import SimplifiedLeetCodeSolver

# Initialize solver
solver = SimplifiedLeetCodeSolver()

# Solve from text
problem = """
Given an array of integers nums and an integer target, 
return indices of the two numbers such that they add up to target.
"""

result = solver.solve_from_text(problem)

if result["success"]:
    print("Solution:", result["solution"])
    print("Execution:", result["execution_result"])
else:
    print("Error:", result["error"])
```

### Example 4: Image Processing
```python
# Process a LeetCode screenshot
result = solver.solve_from_image("sampleLCQ.png")

if result["success"]:
    print("Generated JavaScript solution:")
    print(result["solution"])
```

### Example 5: Enhanced Analysis with Storage
```python
from LeetCodeSolver.enhanced_leetcode_solver import EnhancedLeetCodeSolver
from LeetCodeSolver.solution_storage_manager import SolutionStorageManager

# Initialize enhanced solver and storage
solver = EnhancedLeetCodeSolver()
storage = SolutionStorageManager()

# Solve with comprehensive analysis
result = solver.solve_from_text(problem_text)

# Store the solution
if result['success']:
    storage_paths = storage.store_solution(problem_text, result, "text")
    print(f"Solution stored at: {storage_paths['absolute_folder']}")
    print(f"Files: {storage_paths['solution_file']}")
```

## 🔧 System Requirements

- **Python**: 3.8+
- **Node.js**: v14.0+ (for JavaScript execution)
- **OpenAI API Key**: Valid key with sufficient credits
- **Conda**: Recommended package manager

### Required Packages
```
praisonaiagents>=0.0.156
praisonai>=2.2.82  
openai>=1.98.0
```

## 🌟 Features

### Core Capabilities
- 📷 **Image OCR**: Extract problems from LeetCode screenshots
- 📝 **Text Analysis**: Process copy-pasted problem descriptions
- 🧠 **AI Code Generation**: GPT-4o powered solution generation
- 🧪 **Automated Testing**: Built-in JavaScript execution and validation
- 🔍 **Error Detection**: Comprehensive error handling and debugging

### Advanced Features
- 🎯 **Problem Classification**: Auto-categorize problem types
- ⚡ **Performance Analysis**: Time/space complexity estimation
- 🔄 **Multi-format Support**: PNG, JPG, JPEG, GIF, BMP, WebP
- 🛡️ **Robust Error Handling**: Graceful failure with detailed messages
- 📊 **Execution Metrics**: Detailed performance reporting

### 🆕 **NEW: Solution Storage System**
- 💾 **Automatic Storage**: All solutions saved by date (YYYY-MM-DD format)
- 📁 **Organized Structure**: Problem text, solution code, and metadata stored separately
- 🔗 **API Integration**: Returns file paths for easy access to stored solutions
- 📊 **Storage Statistics**: Track total solutions, daily counts, and available dates
- 🧹 **Cleanup Tools**: Built-in methods to manage old solutions
- 🎯 **Smart Naming**: Filenames include timestamps and problem titles for easy identification

### Storage Features Details
Each solved problem generates three files:
- **Solution File** (`_solution.js`): JavaScript code with header comments
- **Problem File** (`_problem.txt`): Original problem description
- **Metadata File** (`_metadata.json`): Complete analysis, complexity info, and execution results

## 🐛 Troubleshooting

### Common Issues

**1. Import Errors**
```bash
# Solution: Use simplified_leetcode_solver.py
python simplified_leetcode_solver.py
```

**2. API Key Not Found**
```bash
# Solution: Set environment variable
export OPENAI_API_KEY="your_key_here"
```

**3. Node.js Missing**
```bash
# Solution: Install Node.js
brew install node  # macOS
# Or visit: https://nodejs.org/
```

**4. Package Conflicts**
```bash
# Solution: Fresh environment
conda create -n leetcode-solver python=3.11
conda activate leetcode-solver
pip install -r requirements.txt
```

## 🔌 API Endpoints

### **Solving Endpoints**
- `POST /solve/enhanced` - Comprehensive LeetCode analysis with storage
- `POST /solve/enhanced-image` - Image-based problem solving with storage
- `GET /examples/enhanced-two-sum` - Demo endpoint with detailed analysis

### **Storage Management Endpoints**
- `GET /storage/stats` - Storage system statistics and health
- `GET /storage/solutions` - List today's stored solutions  
- `GET /storage/solutions/{date}` - List solutions for specific date (YYYY-MM-DD)
- `GET /storage/dates` - List all available dates with solutions

### **System Endpoints**
- `GET /health` - API health check
- `GET /system-info` - System requirements and versions

### **Request/Response Examples**

**Enhanced Solve Request:**
```json
{
  "problem_text": "Two Sum problem description...",
  "max_corrections": 3,
  "store_solution": true
}
```

**Enhanced Response with Storage:**
```json
{
  "success": true,
  "optimized_solution": "function twoSum(nums, target) {...}",
  "explanation": "Step-by-step walkthrough...",
  "complexity_analysis": "Time: O(n), Space: O(n)",
  "storage": {
    "stored": true,
    "solution_file": "2025-01-01/143022_Two_Sum_Problem_abc12345_solution.js",
    "absolute_folder": "/path/to/pythonBackend/solutions/2025-01-01"
  }
}
```

## 📊 Test Results

The system has been thoroughly tested and verified:
- ✅ Environment detection working
- ✅ API key auto-detection functional
- ✅ PraisonAI integration successful
- ✅ JavaScript execution validated
- ✅ Image processing operational
- ✅ Solution generation confirmed
- ✅ **NEW**: Solution storage system operational
- ✅ **NEW**: API endpoints with file path responses working

## 🎯 Next Steps

### **Quick Start Options**
1. **📱 Parallel Mode (RECOMMENDED)**: `npm run dev` - Starts both Node.js and Python servers
2. **🐍 Python Only**: `bash scripts/start-python-backend.sh` - API server only
3. **🧪 Quick Test**: `python quick_test.py` - Basic functionality test
4. **🔍 Full Verification**: `python test_complete_setup.py` - Complete system check

### **Storage System Setup**
- Solutions are automatically stored in `pythonBackend/solutions/YYYY-MM-DD/` folders
- Each solution includes: `.js` code, `.txt` problem, `.json` metadata
- Access via API endpoints or directly from filesystem
- Use `store_solution: false` in API requests to disable storage

### **Learning Path**
1. **Start with API**: Try `curl http://localhost:8001/examples/enhanced-two-sum`
2. **Test storage**: Check `curl http://localhost:8001/storage/stats`
3. **Solve problems**: Use `/solve/enhanced` endpoint
4. **Explore files**: Browse stored solutions in `pythonBackend/solutions/`
5. **Read detailed docs**: Check linked documentation files above

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `USAGE_GUIDE.md` for detailed documentation
3. Run system tests to verify setup
4. Test with simple problems first

---

## 🎉 Happy Coding!

This backend system is ready to help you solve LeetCode problems efficiently. Use it as a learning tool to understand different algorithmic approaches and improve your problem-solving skills.

**Remember**: The goal is to learn and grow as a developer! 🚀