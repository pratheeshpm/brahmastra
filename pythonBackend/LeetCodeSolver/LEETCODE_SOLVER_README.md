# LeetCode Problem Solver with PraisonAI MCPs

An advanced LeetCode problem solver that uses PraisonAI with Model Context Protocol (MCP) tools to analyze problems from images or text, generate JavaScript solutions, and validate them with comprehensive testing.

## Features

🚀 **Advanced Problem Analysis**
- Extract LeetCode problems from images using OCR
- Analyze text-based problem descriptions
- Intelligent problem classification and complexity analysis

🧠 **Smart Code Generation**
- Generate optimized JavaScript solutions using GPT-4o
- Follow modern ES6+ best practices
- Include proper error handling and documentation

🧪 **Comprehensive Testing**
- Automatic test case generation for edge cases and boundary conditions
- Real-time JavaScript execution with Node.js
- Performance testing and validation
- Only returns solutions that pass all tests

🔍 **Detailed Analysis**
- Time and space complexity analysis
- Problem type classification
- Code quality assessment
- Optimization suggestions

## Requirements

### System Dependencies
- Python 3.8+
- Node.js 14+ (for JavaScript execution)
- OpenAI API key

### Python Dependencies
See `requirements.txt` for the complete list. Key packages include:
- `praisonaiagents>=0.0.156`
- `praisonai>=2.2.82`
- `openai>=1.98.0`

## Installation

1. **Clone or download the scripts to your project directory**

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Ensure Node.js is installed:**
   ```bash
   node --version  # Should show v14+ 
   ```

4. **Set up your OpenAI API key:**
   ```bash
   export OPENAI_API_KEY="your_openai_api_key_here"
   ```
   Or set it when prompted by the script.

## Usage

### Basic Version
Run the basic LeetCode solver:
```bash
python leetcode_solver.py
```

### Advanced MCP Version
Run the advanced version with MCP tools:
```bash
python leetcode_solver_mcp.py
```

### Interactive Menu
Both scripts provide an interactive menu with options:

1. **🖼️ Solve from image** - Upload an image containing a LeetCode problem
2. **📝 Solve from text** - Enter a LeetCode problem description
3. **👋 Exit** - Close the application

## Example Usage

### Solving from Text
```
Problem: Given an array of integers nums and an integer target, 
return indices of the two numbers such that they add up to target.
```

The solver will:
1. Analyze the problem (Two Sum)
2. Generate an optimal JavaScript solution
3. Create comprehensive test cases
4. Execute and validate the solution
5. Provide complexity analysis

### Expected Output
```
🎉 Solution Generated and Validated Successfully!

📝 JavaScript Solution:
----------------------------------------
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

🔍 Problem Analysis:
----------------------------------------
Problem Type: Array
Time Complexity: O(n)
Space Complexity: O(n)

🧪 Test Execution Results:
----------------------------------------
✅ All tests passed!
Test Output:
🚀 Starting comprehensive testing for twoSum
🧪 Running Basic Functionality...
✅ Basic Functionality passed
🧪 Running Edge Cases...
✅ Edge Cases passed
📊 Test Summary: 4/4 tests passed
🎉 All tests passed!
```

## Architecture

### Core Components

1. **ImageProcessor/EnhancedImageProcessor**
   - Handles image encoding and metadata extraction
   - Supports multiple image formats

2. **JavaScriptExecutor/NodeJSExecutorMCP**
   - Executes JavaScript code using Node.js
   - Provides comprehensive error handling and timeout management

3. **TestCaseValidator/LeetCodeAnalyzerMCP**
   - Generates intelligent test cases
   - Analyzes problem complexity and type

4. **LeetCodeSolver/AdvancedLeetCodeSolver**
   - Main orchestrator using PraisonAI Agent
   - Integrates all tools for complete problem solving

### MCP Tools Integration

The advanced version uses Model Context Protocol (MCP) tools for enhanced capabilities:

- **NodeJSExecutorMCP**: Advanced JavaScript execution with async support
- **LeetCodeAnalyzerMCP**: Intelligent problem analysis and test generation
- Enhanced error handling and performance optimization

## Configuration

### OpenAI Model Configuration
Based on the [PraisonAI OpenAI documentation](https://docs.praison.ai/models/openai/), you can configure the model:

```python
# Environment variables
export OPENAI_API_KEY=xxxxxxxxxx
export OPENAI_MODEL_NAME=gpt-4o
```

### Agent Configuration
The solver uses GPT-4o by default for optimal performance. You can modify the model in the agent initialization:

```python
self.agent = Agent(
    instructions="...",
    tools=[...],
    model="gpt-4o",  # or "gpt-3.5-turbo" for faster responses
    max_tokens=4000
)
```

## Troubleshooting

### Common Issues

1. **"Node.js not found"**
   - Install Node.js from [nodejs.org](https://nodejs.org/)
   - Ensure `node` is in your PATH

2. **"OpenAI API key not set"**
   - Set the environment variable: `export OPENAI_API_KEY="your_key"`
   - Or enter it when prompted by the script

3. **"Image file not found"**
   - Verify the image path is correct
   - Ensure the file exists and is readable

4. **"Execution timed out"**
   - The solution may be inefficient or infinite loop
   - Check the generated code manually
   - Try with a simpler problem first

### Performance Tips

1. **For faster responses**: Use `gpt-3.5-turbo` instead of `gpt-4o`
2. **For complex problems**: Increase the timeout in NodeJSExecutorMCP
3. **For large images**: Compress images before processing

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.

## References

- [PraisonAI Documentation](https://docs.praison.ai/)
- [PraisonAI OpenAI Integration](https://docs.praison.ai/models/openai/)
- [Model Context Protocol (MCP)](https://docs.praison.ai/mcp/)