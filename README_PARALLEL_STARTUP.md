# 🚀 Parallel Startup Guide for Node.js + Python Backend

This guide shows you how to start both the Node.js frontend and Python LeetCode solver backend simultaneously.

## 🎯 **Quick Start**

```bash
# Set your OpenAI API key (required for Python backend)
export OPENAI_API_KEY="your_openai_api_key_here"

# Start both servers in parallel
npm run dev
```

That's it! The command will start:
- **Node.js server** on `http://localhost:3000` (your main application)
- **Python API server** on `http://localhost:8001` (LeetCode solver backend)

## 📋 **Available npm Scripts**

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both Node.js and Python servers in parallel |
| `npm run dev:node` | Start only the Node.js server |
| `npm run dev:python` | Start only the Python backend |
| `npm run python-backend` | Direct script to start Python backend |

## 🔧 **Prerequisites**

### 1. **Conda Environment**
The Python backend requires the `praisonchat` conda environment:

```bash
# Create the environment (if not exists)
conda create -n praisonchat python=3.11

# Activate and install dependencies
conda activate praisonchat
cd pythonBackend
pip install -r requirements.txt
```

### 2. **Environment Variables**
```bash
# Required for Python backend
export OPENAI_API_KEY="your_openai_api_key_here"

# Optional: Verify it's set
echo $OPENAI_API_KEY
```

### 3. **Node.js Dependencies**
```bash
# Install concurrently for parallel execution
npm install
```

## 🌐 **Server Information**

### **Node.js Frontend Server**
- **URL**: `http://localhost:3000`
- **Purpose**: Main chatbot UI and frontend
- **Technology**: Next.js, React

### **Python Backend API Server**
- **URL**: `http://localhost:8001`
- **Purpose**: AI-powered LeetCode problem solver
- **Documentation**: `http://localhost:8001/docs`
- **Health Check**: `http://localhost:8001/health`

## 🧪 **Enhanced LeetCode Solver Features**

The Python backend provides comprehensive LeetCode analysis:

### **Basic Solver Endpoints**
- `POST /solve/text` - Basic LeetCode solver
- `POST /solve/image` - Solve from uploaded images
- `GET /examples/two-sum` - Basic Two Sum example

### **Enhanced Solver Endpoints** 
- `POST /solve/enhanced` - **Comprehensive analysis with:**
  - ✅ Optimized solution code
  - ✅ Detailed explanation with sample walkthrough
  - ✅ Time & space complexity analysis
  - ✅ Brute force approach comparison
  - ✅ Test case coverage details
- `POST /solve/enhanced-image` - Enhanced analysis from images
- `GET /examples/enhanced-two-sum` - Enhanced Two Sum example

### **Example Enhanced Request**
```bash
curl -X POST http://localhost:8001/solve/enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "problem_text": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    "max_corrections": 3
  }'
```

### **Enhanced Response Format**
```json
{
  "success": true,
  "optimized_solution": "function twoSum(nums, target) { ... }",
  "explanation": "Step-by-step walkthrough with examples...",
  "complexity_analysis": "Time: O(n), Space: O(n)...",
  "brute_force_approach": "Nested loops approach: O(n²)...",
  "test_cases_covered": "Edge cases: empty array, no solution...",
  "execution_result": { "success": true, "output": "..." },
  "iterations": 1,
  "self_corrected": false,
  "processing_time": 15.3
}
```

## 🔧 **Troubleshooting**

### **Problem: Python backend fails to start**
```bash
# Check conda environment
conda info --envs

# Verify praisonchat environment exists
conda activate praisonchat
python --version

# Check dependencies
pip list | grep -E "(praisonaiagents|openai|fastapi)"
```

### **Problem: OpenAI API key issues**
```bash
# Set the key
export OPENAI_API_KEY="sk-your-key-here"

# Verify it's set
curl -s http://localhost:8001/health | jq '.system_info.openai_api_key_configured'
```

### **Problem: Port conflicts**
```bash
# Check what's using the ports
lsof -i :3000  # Node.js
lsof -i :8001  # Python API

# Kill processes if needed
pkill -f "node server.js"
pkill -f "python.*start_server.py"
```

### **Problem: Enhanced endpoints not available**
The enhanced endpoints require the latest API server code. If you see 404 errors:

```bash
# Kill existing servers
npm run dev  # Ctrl+C to stop
pkill -f "python.*start_server.py"

# Restart with latest code
npm run dev
```

## 🎯 **Development Workflow**

### **Normal Development**
```bash
# Start everything
export OPENAI_API_KEY="your_key"
npm run dev

# Both servers will restart automatically on code changes
# Node.js: Hot reload enabled
# Python: Manual restart needed for backend changes
```

### **Backend-Only Development**
```bash
# Work on Python backend only
npm run dev:python

# Test endpoints
curl http://localhost:8001/health
```

### **Frontend-Only Development**
```bash
# Work on Node.js frontend only
npm run dev:node
```

## 📊 **Performance & Features**

### **Startup Time**
- **Node.js**: ~3-5 seconds
- **Python Backend**: ~5-8 seconds
- **Total**: Both ready in ~10 seconds

### **Capabilities**
- **🔄 Self-Correction**: AI automatically fixes failing solutions (up to 5 attempts)
- **📷 Image Processing**: Upload screenshots of LeetCode problems
- **🧠 Comprehensive Analysis**: Detailed explanations, complexity analysis, brute force comparisons
- **⚡ Real-time Processing**: Live progress updates and error recovery
- **🌐 CORS Support**: Ready for frontend integration

## 🚀 **Integration Examples**

### **From your Node.js frontend**
```javascript
// Call Python backend from your React components
const solveProblem = async (problemText) => {
  const response = await fetch('http://localhost:8001/solve/enhanced', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problem_text: problemText,
      max_corrections: 3
    })
  });
  
  const result = await response.json();
  return result;
};
```

### **WebSocket Integration** (Future)
```javascript
// Real-time progress updates
const ws = new WebSocket('ws://localhost:8001/ws');
ws.on('message', (data) => {
  const progress = JSON.parse(data);
  console.log(`Progress: ${progress.step} - ${progress.message}`);
});
```

## 🎉 **Success Indicators**

When everything is working correctly, you should see:

1. **✅ Both servers start successfully**
2. **✅ Node.js UI loads at localhost:3000**
3. **✅ Python API health check passes: `curl http://localhost:8001/health`**
4. **✅ Enhanced endpoints return comprehensive analysis**
5. **✅ No port conflicts or dependency errors**

---

**🎯 You're now ready to use the full-stack AI-powered LeetCode solving system!**