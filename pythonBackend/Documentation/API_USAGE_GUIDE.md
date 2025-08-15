# 🚀 LeetCode Solver API Usage Guide

## Overview
The LeetCode Solver API provides AI-powered solutions for coding problems using PraisonAI and OpenAI GPT-4o. It accepts problems in text or image format, generates JavaScript solutions, validates them with Node.js, and returns verified code.

## 🌐 Server Information
- **Base URL**: `http://localhost:8001`
- **Interactive Documentation**: `http://localhost:8001/docs`
- **Alternative Documentation**: `http://localhost:8001/redoc`
- **Health Check**: `http://localhost:8001/health`

## 🎯 Available Endpoints

### 1. Root Endpoint
```bash
GET /
```
Returns basic API information and navigation links.

**Example Response:**
```json
{
  "message": "LeetCode Problem Solver API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health",
  "system_info": "/system-info"
}
```

### 2. Health Check
```bash
GET /health
```
Returns server health status and system information.

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-01T04:55:02.142636",
  "version": "1.0.0",
  "system_info": {
    "python_version": "3.11.9",
    "nodejs_version": "v20.13.1",
    "conda_environment": "praisonchat",
    "openai_api_key_configured": true,
    "praisonai_available": true,
    "system_requirements_met": true
  }
}
```

### 3. System Information
```bash
GET /system-info
```
Returns detailed system configuration.

### 4. Solve Text Problem
```bash
POST /solve/text
Content-Type: application/json

{
  "problem_text": "Your LeetCode problem description here",
  "timeout": 15  // Optional, defaults to 15 seconds
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8001/solve/text" \
  -H "Content-Type: application/json" \
  -d '{
    "problem_text": "Write a function that returns the sum of two numbers. Input: add(2, 3) should return 5"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "solution": "function add(a, b) {\n    return a + b;\n}\n\nconsole.log(add(2, 3)); // Output: 5",
  "execution_result": {
    "success": true,
    "exit_code": 0,
    "execution_time": 0.05,
    "output": "5\n"
  },
  "input_type": "text",
  "processing_time": 6.510546,
  "timestamp": "2025-08-01T04:55:02.142636"
}
```

### 5. Solve Image Problem
```bash
POST /solve/image
Content-Type: multipart/form-data

file: <image file>
```

**Supported formats**: PNG, JPEG, JPG, GIF, BMP, WEBP  
**Size limit**: 20MB

**Example using curl:**
```bash
curl -X POST "http://localhost:8001/solve/image" \
  -F "file=@leetcode_problem.png"
```

### 6. Solve Base64 Image
```bash
POST /solve/base64
Content-Type: application/json

{
  "image_data": "base64_encoded_image_data_here"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:8001/solve/base64" \
  -H "Content-Type: application/json" \
  -d '{
    "image_data": "iVBORw0KGgoAAAANSUhEUgAA..."
  }'
```

### 7. Two Sum Example
```bash
GET /examples/two-sum
```
Demonstrates the API by solving the classic Two Sum LeetCode problem.

## 🐍 Python Client Examples

### Basic Usage
```python
import requests

BASE_URL = "http://localhost:8001"

# Solve a text problem
response = requests.post(f"{BASE_URL}/solve/text", json={
    "problem_text": "Given an array of integers, return the sum of all elements."
})

if response.status_code == 200:
    result = response.json()
    if result['success']:
        print("Solution:")
        print(result['solution'])
    else:
        print("Error:", result['error'])
```

### Image Upload
```python
import requests

# Upload an image file
with open('leetcode_problem.png', 'rb') as f:
    files = {'file': ('problem.png', f, 'image/png')}
    response = requests.post(f"{BASE_URL}/solve/image", files=files)

if response.status_code == 200:
    result = response.json()
    print("Success:", result['success'])
    if result['success']:
        print("Solution:", result['solution'])
```

### Health Check
```python
import requests

response = requests.get(f"{BASE_URL}/health")
health = response.json()

print(f"Status: {health['status']}")
print(f"OpenAI API Key: {'✅' if health['system_info']['openai_api_key_configured'] else '❌'}")
```

## 🌐 JavaScript/Node.js Client Examples

### Using fetch API
```javascript
// Solve a text problem
async function solveProblem(problemText) {
    const response = await fetch('http://localhost:8001/solve/text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            problem_text: problemText
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        console.log('Solution:', result.solution);
        console.log('Processing time:', result.processing_time + 's');
    } else {
        console.error('Error:', result.error);
    }
}

// Example usage
solveProblem("Write a function to reverse a string");
```

### Image Upload with FormData
```javascript
async function solveImageProblem(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await fetch('http://localhost:8001/solve/image', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    return result;
}
```

## 🔧 Starting the Server

### Method 1: Using the Startup Script
```bash
cd pythonBackend
/opt/miniconda3/envs/praisonchat/bin/python start_server.py
```

### Method 2: Direct Command
```bash
cd pythonBackend
/opt/miniconda3/envs/praisonchat/bin/python api_server.py
```

### Method 3: Using Uvicorn Directly
```bash
cd pythonBackend
/opt/miniconda3/envs/praisonchat/bin/uvicorn api_server:app --host 0.0.0.0 --port 8001
```

## 📊 Response Format

All endpoints return JSON responses with the following structure:

### Success Response
```json
{
  "success": true,
  "solution": "Generated JavaScript code",
  "execution_result": {
    "success": true,
    "exit_code": 0,
    "execution_time": 0.05,
    "output": "Program output"
  },
  "agent_response": "Full AI agent response",
  "input_type": "text|image",
  "processing_time": 6.51,
  "timestamp": "2025-08-01T04:55:02.142636"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "input_type": "text|image",
  "processing_time": 1.23,
  "timestamp": "2025-08-01T04:55:02.142636"
}
```

## ⚠️ Important Limitations

1. **Image Size**: Large images may exceed GPT-4o's context window (128k tokens)
2. **Processing Time**: Complex problems may take 10-30 seconds to solve
3. **Rate Limits**: Subject to OpenAI API rate limits
4. **JavaScript Only**: Currently generates JavaScript solutions only

## 🔍 Troubleshooting

### Server Won't Start
```bash
# Check if port is in use
lsof -i :8001

# Kill conflicting process
kill <PID>

# Try different port
# Edit api_server.py to use port 8002
```

### API Not Responding
```bash
# Check server status
curl http://localhost:8001/health

# Restart server
# Stop with Ctrl+C and restart
```

### OpenAI API Errors
- Ensure `OPENAI_API_KEY` environment variable is set
- Check API key has sufficient quota
- Verify internet connection

## 📱 Testing the API

Use the included test client:
```bash
cd pythonBackend
/opt/miniconda3/envs/praisonchat/bin/python test_api_client.py
```

This will test all endpoints and provide a comprehensive report.

## 🎉 Success!

Your LeetCode Solver API is now running and ready to solve coding problems! Visit `http://localhost:8001/docs` for the interactive API documentation.