# 🚀 LeetCode Problem Solver with PraisonAI

A comprehensive tool that uses PraisonAI with OpenAI GPT-4o to solve LeetCode problems from images or text, generate JavaScript solutions, and validate them with automated testing.

## 📋 Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Usage Guide](#usage-guide)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [File Structure](#file-structure)

## 🌟 Features

### Core Capabilities
- **📷 Image Processing**: Extract LeetCode problems from screenshots using OCR
- **📝 Text Analysis**: Process problem descriptions from copy-paste text
- **🧠 Smart Code Generation**: Generate optimized JavaScript solutions using GPT-4o
- **🧪 Automated Testing**: Comprehensive test case generation and validation
- **⚡ Performance Analysis**: Time and space complexity analysis
- **🔍 Error Detection**: Advanced error handling and debugging

### Advanced Features
- **🎯 Problem Classification**: Automatically categorize problems (Array, String, Tree, etc.)
- **🔄 Multiple Test Cases**: Edge cases, boundary conditions, and performance tests
- **📊 Detailed Reporting**: Comprehensive execution results and analysis
- **🛡️ Robust Error Handling**: Graceful failure handling with detailed error messages
- **🌐 Multi-Format Support**: PNG, JPG, JPEG, GIF, BMP, WebP images

## 🔧 System Requirements

### Required Software
- **Python**: 3.8 or higher
- **Node.js**: v14.0 or higher (for JavaScript execution)
- **Conda**: For package management (recommended)

### Required Packages
- `praisonaiagents >= 0.0.156`
- `praisonai >= 2.2.82`
- `openai >= 1.98.0`
- Standard Python libraries (included): `os`, `json`, `base64`, `subprocess`, `tempfile`, `re`

### Optional Packages
- `PIL/Pillow`: For enhanced image metadata (recommended)

## 📦 Installation

### Step 1: Environment Setup
```bash
# Activate your conda environment
conda activate praisonchat  # or conda activate praison

# Install required packages
pip install praisonaiagents praisonai praisonai-tools openai
```

### Step 2: API Key Configuration
```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your_openai_api_key_here"

# Verify it's set
echo $OPENAI_API_KEY
```

### Step 3: Verify Node.js
```bash
# Check Node.js installation
node --version

# If not installed, visit: https://nodejs.org/
```

## 🌍 Environment Setup

### Option 1: Environment Variables (Recommended)
```bash
# Add to your ~/.bash_profile or ~/.zshrc
export OPENAI_API_KEY="sk-proj-your-key-here"

# Reload your shell
source ~/.bash_profile  # or source ~/.zshrc
```

### Option 2: Manual Entry
The script will prompt for your API key if not found in environment variables.

### Supported Environment Variable Names
- `OPENAI_API_KEY` (primary)
- `OPENAI_KEY`
- `OPENAI_TOKEN`
- `OPEN_AI_API_KEY`

## 📖 Usage Guide

### 🚀 Quick Start

#### Interactive Mode
```bash
python simplified_leetcode_solver.py
```

#### Programmatic Usage
```python
from simplified_leetcode_solver import SimplifiedLeetCodeSolver

# Initialize solver
solver = SimplifiedLeetCodeSolver()

# Solve from text
result = solver.solve_from_text("""
Given an array of integers nums and an integer target, 
return indices of the two numbers such that they add up to target.
""")

# Solve from image
result = solver.solve_from_image("path/to/leetcode_screenshot.png")

# Check results
if result["success"]:
    print("Solution:", result["solution"])
    print("Execution Result:", result["execution_result"])
else:
    print("Error:", result["error"])
```

### 🎮 Interactive Menu Options

1. **🖼️ Solve from image**: Upload a screenshot of a LeetCode problem
2. **📝 Solve from text**: Copy-paste the problem description
3. **🧪 Test with Two Sum**: Run a predefined test with the classic Two Sum problem
4. **📋 System info**: Check your system requirements and configuration
5. **👋 Exit**: Quit the application

### 📁 Image Requirements

- **Formats**: PNG, JPG, JPEG, GIF, BMP, WebP
- **Size**: Maximum 20MB
- **Quality**: Clear, readable text
- **Content**: Should contain the complete LeetCode problem statement

## 🎯 Examples

### Example 1: Two Sum Problem
```python
problem = """
Given an array of integers nums and an integer target, return indices of the 
two numbers such that they add up to target.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Constraints:
- 2 <= nums.length <= 10^4
- Only one valid answer exists
"""

solver = SimplifiedLeetCodeSolver()
result = solver.solve_from_text(problem)
```

**Expected Output:**
```javascript
function twoSum(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
}
```

### Example 2: Image Processing
```python
# Process a screenshot of a LeetCode problem
result = solver.solve_from_image("screenshots/valid_parentheses.png")

if result["success"]:
    print("Generated Solution:")
    print(result["solution"])
    
    # Check execution results
    if result["execution_result"]["success"]:
        print("✅ Solution validated successfully!")
    else:
        print("❌ Solution needs review")
```

### Example 3: Batch Processing
```python
problems = [
    "Write a function to reverse a string",
    "Find the maximum element in an array", 
    "Check if a string is a palindrome"
]

solver = SimplifiedLeetCodeSolver()
results = []

for problem in problems:
    result = solver.solve_from_text(problem)
    results.append(result)
    print(f"Problem: {problem[:30]}... - {'✅' if result['success'] else '❌'}")
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Import Error: Cannot import BaseTool
**Error**: `cannot import name 'BaseTool' from 'praisonaiagents.tools'`

**Solution**: Use the simplified version (`simplified_leetcode_solver.py`) which doesn't use custom tools.

#### 2. OpenAI API Key Not Found
**Error**: `No OpenAI API key found in environment variables`

**Solutions**:
```bash
# Option 1: Set environment variable
export OPENAI_API_KEY="your_key_here"

# Option 2: Add to shell profile
echo 'export OPENAI_API_KEY="your_key_here"' >> ~/.bash_profile
source ~/.bash_profile

# Option 3: Enter manually when prompted
```

#### 3. Node.js Not Found
**Error**: `Node.js is required but not found`

**Solution**:
```bash
# Install Node.js from https://nodejs.org/
# Or using package managers:

# macOS with Homebrew
brew install node

# Ubuntu/Debian
sudo apt-get install nodejs npm

# Verify installation
node --version
```

#### 4. Package Version Conflicts
**Error**: Various dependency conflicts

**Solution**:
```bash
# Create a clean environment
conda create -n leetcode-solver python=3.11
conda activate leetcode-solver

# Install packages fresh
pip install praisonaiagents praisonai openai
```

#### 5. Image Processing Fails
**Error**: `Image processing failed`

**Solutions**:
- Check file path is correct
- Verify image format is supported
- Ensure image size is under 20MB
- Try different image formats (PNG recommended)

#### 6. Solution Execution Fails
**Error**: `Solution execution failed`

**Possible Causes**:
- Generated JavaScript has syntax errors
- Function name doesn't match expected patterns
- Logic errors in the generated solution

**Solutions**:
- Try regenerating the solution
- Manually review the generated code
- Check the problem description clarity

### Performance Tips

1. **API Usage**: Each solve operation uses OpenAI API credits
2. **Image Size**: Smaller images process faster
3. **Problem Clarity**: Clear, complete problem descriptions yield better results
4. **Network**: Stable internet connection improves reliability

## 📂 File Structure

```
├── simplified_leetcode_solver.py    # Main simplified solver (recommended)
├── improved_leetcode_solver.py      # Advanced solver with custom tools
├── test_complete_setup.py          # Comprehensive test suite
├── quick_test.py                   # Quick functionality test
├── requirements.txt                # Package dependencies
├── USAGE_GUIDE.md                 # This documentation
└── examples/                      # Example screenshots and problems
    ├── two_sum.png
    ├── valid_parentheses.png
    └── reverse_string.png
```

### Which File to Use?

- **`simplified_leetcode_solver.py`**: ✅ **RECOMMENDED** - Works with current PraisonAI version
- **`improved_leetcode_solver.py`**: ⚠️ Requires older PraisonAI version with custom tools
- **`test_complete_setup.py`**: For testing your environment setup
- **`quick_test.py`**: For quick functionality verification

## 🚀 Advanced Usage

### Custom Configuration
```python
# Initialize with custom settings
solver = SimplifiedLeetCodeSolver(openai_api_key="custom_key")

# Custom timeout for JavaScript execution
result = solver.js_executor.execute_code(js_code, timeout=30)
```

### Error Handling
```python
try:
    result = solver.solve_from_text(problem)
    
    if result["success"]:
        # Process successful result
        solution = result["solution"]
        execution_info = result["execution_result"]
    else:
        # Handle failure
        error = result["error"]
        if "solution" in result:
            partial_solution = result["solution"]
            
except Exception as e:
    print(f"Unexpected error: {e}")
```

### Integration with Other Tools
```python
# Use with your existing workflow
def solve_leetcode_problems(problems_list):
    solver = SimplifiedLeetCodeSolver()
    solutions = []
    
    for problem in problems_list:
        result = solver.solve_from_text(problem)
        solutions.append({
            "problem": problem,
            "solution": result.get("solution", ""),
            "success": result["success"]
        })
    
    return solutions
```

## 📞 Support

### Getting Help

1. **Check this documentation** for common issues
2. **Run the test suite**: `python test_complete_setup.py`
3. **Verify system requirements**: Check Python, Node.js, and package versions
4. **Test with simple problems** first before complex ones

### Reporting Issues

When reporting issues, please include:
- Python version (`python --version`)
- Node.js version (`node --version`)
- Package versions (`pip list | grep -E "(praisonai|openai)"`)
- Error messages (full traceback)
- Problem description that failed

---

## 🎉 Happy Coding!

This tool is designed to help you learn from AI-generated solutions and understand different algorithmic approaches. Use it as a learning aid and always understand the solutions before submitting to LeetCode.

**Remember**: The goal is to learn and improve your problem-solving skills! 🚀