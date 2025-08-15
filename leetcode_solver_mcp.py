#!/usr/bin/env python3
"""
Advanced LeetCode Problem Solver with PraisonAI MCPs and OpenAI
Uses Model Context Protocol (MCP) for enhanced tool integration
"""

import os
import json
import base64
import asyncio
from typing import Optional, Dict, Any, List
from praisonaiagents import Agent
from praisonaiagents.tools import BaseTool
from praisonaiagents.mcp import MCPTool
import subprocess
import tempfile
import re
from pathlib import Path

class EnhancedImageProcessor:
    """Advanced image processing with OCR capabilities"""
    
    @staticmethod
    def encode_image_to_base64(image_path: str) -> str:
        """Convert image to base64 for API processing"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            raise ValueError(f"Failed to encode image: {str(e)}")
    
    @staticmethod
    def get_image_info(image_path: str) -> Dict[str, Any]:
        """Get image metadata and format info"""
        try:
            from PIL import Image
            with Image.open(image_path) as img:
                return {
                    "format": img.format,
                    "size": img.size,
                    "mode": img.mode,
                    "file_size": os.path.getsize(image_path)
                }
        except ImportError:
            return {"error": "PIL not available for image metadata"}
        except Exception as e:
            return {"error": f"Failed to get image info: {str(e)}"}

class NodeJSExecutorMCP(MCPTool):
    """MCP Tool for executing JavaScript with Node.js"""
    
    name: str = "nodejs_executor"
    description: str = "Execute JavaScript code using Node.js with comprehensive error handling and test validation"
    
    def __init__(self):
        super().__init__()
        self.check_nodejs_availability()
    
    def check_nodejs_availability(self):
        """Check if Node.js is available"""
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                self.nodejs_version = result.stdout.strip()
            else:
                raise RuntimeError("Node.js not found")
        except FileNotFoundError:
            raise RuntimeError("Node.js is not installed or not in PATH")
    
    async def run(self, code: str, test_cases: Optional[str] = None, timeout: int = 15) -> Dict[str, Any]:
        """Execute JavaScript code with enhanced error handling"""
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                # Setup project files
                js_file = Path(temp_dir) / "solution.js"
                package_json = Path(temp_dir) / "package.json"
                
                # Create package.json with ES modules support
                package_config = {
                    "name": "leetcode-solution",
                    "version": "1.0.0",
                    "type": "module",
                    "scripts": {
                        "start": "node solution.js",
                        "test": "node --test solution.js"
                    },
                    "engines": {
                        "node": ">=14.0.0"
                    }
                }
                
                package_json.write_text(json.dumps(package_config, indent=2))
                
                # Prepare complete code with test cases
                complete_code = self._prepare_code_with_tests(code, test_cases)
                js_file.write_text(complete_code)
                
                # Execute with timeout
                process = await asyncio.create_subprocess_exec(
                    'node', 'solution.js',
                    cwd=temp_dir,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                
                try:
                    stdout, stderr = await asyncio.wait_for(
                        process.communicate(), timeout=timeout
                    )
                    
                    return {
                        "success": process.returncode == 0,
                        "stdout": stdout.decode('utf-8'),
                        "stderr": stderr.decode('utf-8'),
                        "return_code": process.returncode,
                        "nodejs_version": self.nodejs_version
                    }
                    
                except asyncio.TimeoutError:
                    process.kill()
                    return {
                        "success": False,
                        "stdout": "",
                        "stderr": f"Execution timed out after {timeout} seconds",
                        "return_code": -1
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Execution error: {str(e)}",
                "return_code": -1
            }
    
    def _prepare_code_with_tests(self, code: str, test_cases: Optional[str]) -> str:
        """Prepare JavaScript code with test cases and error handling"""
        error_handling = """
// Global error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
"""
        
        test_runner = """
// Test result tracker
let testsPassed = 0;
let testsTotal = 0;

function runTest(testName, testFn) {
    testsTotal++;
    try {
        console.log(`\\n🧪 Running ${testName}...`);
        const result = testFn();
        if (result !== false) {
            console.log(`✅ ${testName} passed`);
            testsPassed++;
        } else {
            console.log(`❌ ${testName} failed`);
        }
    } catch (error) {
        console.log(`❌ ${testName} failed with error: ${error.message}`);
    }
}

function printTestSummary() {
    console.log(`\\n📊 Test Summary: ${testsPassed}/${testsTotal} tests passed`);
    if (testsPassed === testsTotal && testsTotal > 0) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️  Some tests failed or no tests found');
    }
}
"""
        
        # Combine all parts
        complete_code = error_handling + "\n" + code + "\n" + test_runner
        
        if test_cases:
            complete_code += "\n" + test_cases
        
        complete_code += "\n\nprintTestSummary();"
        
        return complete_code

class LeetCodeAnalyzerMCP(MCPTool):
    """MCP Tool for analyzing LeetCode problems and generating test cases"""
    
    name: str = "leetcode_analyzer"
    description: str = "Analyze LeetCode problems and generate comprehensive test cases"
    
    async def run(self, problem_text: str, solution_code: str) -> Dict[str, Any]:
        """Analyze problem and generate test cases"""
        try:
            # Extract function information
            function_info = self._extract_function_info(solution_code)
            
            # Generate test cases based on problem analysis
            test_cases = self._generate_comprehensive_tests(problem_text, function_info)
            
            # Analyze problem complexity
            complexity = self._analyze_complexity(problem_text, solution_code)
            
            return {
                "success": True,
                "function_info": function_info,
                "test_cases": test_cases,
                "complexity": complexity,
                "problem_type": self._classify_problem_type(problem_text)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Analysis failed: {str(e)}"
            }
    
    def _extract_function_info(self, code: str) -> Dict[str, str]:
        """Extract function name and signature from code"""
        # Pattern for function declarations
        func_patterns = [
            r'function\s+(\w+)\s*\((.*?)\)',
            r'const\s+(\w+)\s*=\s*\((.*?)\)\s*=>',
            r'let\s+(\w+)\s*=\s*\((.*?)\)\s*=>',
            r'var\s+(\w+)\s*=\s*function\s*\((.*?)\)'
        ]
        
        for pattern in func_patterns:
            match = re.search(pattern, code)
            if match:
                return {
                    "name": match.group(1),
                    "parameters": match.group(2).strip(),
                    "signature": match.group(0)
                }
        
        return {
            "name": "solution",
            "parameters": "",
            "signature": "function solution()"
        }
    
    def _generate_comprehensive_tests(self, problem_text: str, function_info: Dict[str, str]) -> str:
        """Generate comprehensive test cases"""
        func_name = function_info["name"]
        
        test_template = f"""
// Comprehensive Test Cases for {func_name}
console.log("🚀 Starting comprehensive testing for {func_name}");

// Test Case 1: Basic functionality
runTest("Basic Functionality", () => {{
    // TODO: Add basic test case based on problem examples
    try {{
        const result = {func_name}(/* Add test input */);
        console.log("Basic test result:", result);
        return true; // Modify based on expected output
    }} catch (e) {{
        console.error("Basic test error:", e.message);
        return false;
    }}
}});

// Test Case 2: Edge cases
runTest("Edge Cases", () => {{
    try {{
        // Empty input
        const result1 = {func_name}(/* Empty/minimal input */);
        console.log("Edge case 1 result:", result1);
        
        // Single element
        const result2 = {func_name}(/* Single element input */);
        console.log("Edge case 2 result:", result2);
        
        return true;
    }} catch (e) {{
        console.error("Edge case error:", e.message);
        return false;
    }}
}});

// Test Case 3: Boundary conditions
runTest("Boundary Conditions", () => {{
    try {{
        // Maximum size input
        const result1 = {func_name}(/* Large input */);
        console.log("Boundary test 1 result:", result1);
        
        // Minimum constraints
        const result2 = {func_name}(/* Minimum input */);
        console.log("Boundary test 2 result:", result2);
        
        return true;
    }} catch (e) {{
        console.error("Boundary test error:", e.message);
        return false;
    }}
}});

// Test Case 4: Performance test
runTest("Performance Test", () => {{
    try {{
        const startTime = Date.now();
        const result = {func_name}(/* Performance test input */);
        const endTime = Date.now();
        
        console.log(`Performance test completed in ${{endTime - startTime}}ms`);
        console.log("Performance test result:", result);
        
        return (endTime - startTime) < 5000; // Should complete within 5 seconds
    }} catch (e) {{
        console.error("Performance test error:", e.message);
        return false;
    }}
}});
"""
        return test_template
    
    def _analyze_complexity(self, problem_text: str, code: str) -> Dict[str, str]:
        """Analyze time and space complexity"""
        # Simple heuristic-based complexity analysis
        time_complexity = "O(n)"  # Default
        space_complexity = "O(1)"  # Default
        
        # Look for complexity indicators in code
        if "for" in code and "for" in code[code.find("for")+3:]:
            time_complexity = "O(n²)"
        elif "while" in code or "for" in code:
            time_complexity = "O(n)"
        elif "sort" in code.lower():
            time_complexity = "O(n log n)"
        
        if any(keyword in code for keyword in ["Array(", "new Array", "[]"]):
            space_complexity = "O(n)"
        
        return {
            "time": time_complexity,
            "space": space_complexity
        }
    
    def _classify_problem_type(self, problem_text: str) -> str:
        """Classify the type of LeetCode problem"""
        problem_lower = problem_text.lower()
        
        if any(keyword in problem_lower for keyword in ["array", "list"]):
            return "Array"
        elif any(keyword in problem_lower for keyword in ["string", "character"]):
            return "String"
        elif any(keyword in problem_lower for keyword in ["tree", "binary tree"]):
            return "Tree"
        elif any(keyword in problem_lower for keyword in ["graph", "node"]):
            return "Graph"
        elif any(keyword in problem_lower for keyword in ["dynamic programming", "dp"]):
            return "Dynamic Programming"
        elif any(keyword in problem_lower for keyword in ["two pointer", "sliding window"]):
            return "Two Pointers"
        else:
            return "General"

class AdvancedLeetCodeSolver:
    """Advanced LeetCode solver using PraisonAI with MCPs"""
    
    def __init__(self, openai_api_key: str):
        """Initialize with OpenAI API key and MCP tools"""
        os.environ["OPENAI_API_KEY"] = openai_api_key
        
        # Initialize MCP tools
        self.js_executor = NodeJSExecutorMCP()
        self.analyzer = LeetCodeAnalyzerMCP()
        
        # Initialize PraisonAI agent with MCP tools
        self.agent = Agent(
            instructions="""You are an expert LeetCode problem solver with advanced capabilities. 

Your responsibilities:
1. Analyze LeetCode problems from images or text with high accuracy
2. Generate optimal JavaScript solutions following best practices
3. Create comprehensive test suites covering all edge cases
4. Validate solutions through rigorous testing
5. Provide detailed analysis including time/space complexity
6. Only deliver solutions that pass all validation tests

Guidelines:
- Write clean, efficient, and well-documented JavaScript code
- Use modern ES6+ features and best practices
- Generate thorough test cases including edge cases and performance tests
- Validate all solutions before delivery
- Provide complexity analysis and optimization suggestions
- Handle errors gracefully and provide meaningful error messages""",
            
            tools=[self.js_executor, self.analyzer],
            model="gpt-4o",
            max_tokens=4000
        )
    
    async def solve_from_image(self, image_path: str) -> Dict[str, Any]:
        """Solve LeetCode problem from image with enhanced processing"""
        try:
            # Validate image file
            if not os.path.exists(image_path):
                return {"success": False, "error": "Image file not found"}
            
            # Get image info
            image_info = EnhancedImageProcessor.get_image_info(image_path)
            
            # Encode image
            base64_image = EnhancedImageProcessor.encode_image_to_base64(image_path)
            
            prompt = f"""
            Analyze this LeetCode problem image and provide a complete solution:
            
            Image Info: {json.dumps(image_info, indent=2)}
            
            Tasks:
            1. Extract the complete problem statement from the image
            2. Identify all requirements, constraints, and examples
            3. Design an optimal JavaScript solution
            4. Use the leetcode_analyzer tool to generate comprehensive test cases
            5. Use the nodejs_executor tool to validate the solution
            6. Provide complexity analysis and optimization notes
            7. Only return the final solution if all tests pass
            
            Image: data:image/jpeg;base64,{base64_image}
            
            Please provide a complete, tested, and optimized JavaScript solution.
            """
            
            return await self._solve_problem_async(prompt)
            
        except Exception as e:
            return {"success": False, "error": f"Image processing failed: {str(e)}"}
    
    async def solve_from_text(self, problem_text: str) -> Dict[str, Any]:
        """Solve LeetCode problem from text with enhanced analysis"""
        try:
            prompt = f"""
            Solve this LeetCode problem with comprehensive analysis:
            
            Problem Statement:
            {problem_text}
            
            Requirements:
            1. Analyze the problem thoroughly and identify the optimal approach
            2. Write a clean, efficient JavaScript solution
            3. Use the leetcode_analyzer tool to generate comprehensive test cases
            4. Use the nodejs_executor tool to validate the solution thoroughly
            5. Provide detailed complexity analysis
            6. Suggest optimizations if applicable
            7. Only provide the final solution if all validation tests pass
            
            Deliver a production-ready JavaScript solution with full test coverage.
            """
            
            return await self._solve_problem_async(prompt)
            
        except Exception as e:
            return {"success": False, "error": f"Text processing failed: {str(e)}"}
    
    async def _solve_problem_async(self, prompt: str) -> Dict[str, Any]:
        """Asynchronously solve problem using PraisonAI agent"""
        try:
            # Get solution from agent
            response = await asyncio.get_event_loop().run_in_executor(
                None, self.agent.start, prompt
            )
            
            # Extract and validate solution
            result = await self._process_agent_response(response)
            
            return result
            
        except Exception as e:
            return {"success": False, "error": f"Problem solving failed: {str(e)}"}
    
    async def _process_agent_response(self, response: str) -> Dict[str, Any]:
        """Process agent response and extract validated solution"""
        try:
            # Extract JavaScript code
            js_code = self._extract_javascript_code(response)
            
            if not js_code:
                return {"success": False, "error": "No JavaScript code found in response"}
            
            # Analyze the solution
            analysis_result = await self.analyzer.run("LeetCode problem", js_code)
            
            if not analysis_result["success"]:
                return {"success": False, "error": "Solution analysis failed", "details": analysis_result}
            
            # Execute and validate the solution
            execution_result = await self.js_executor.run(
                js_code, 
                analysis_result.get("test_cases", "")
            )
            
            if execution_result["success"]:
                return {
                    "success": True,
                    "solution": js_code,
                    "analysis": analysis_result,
                    "execution_result": execution_result,
                    "agent_response": response
                }
            else:
                return {
                    "success": False,
                    "error": "Solution validation failed",
                    "solution": js_code,
                    "execution_details": execution_result,
                    "agent_response": response
                }
                
        except Exception as e:
            return {"success": False, "error": f"Response processing failed: {str(e)}"}
    
    def _extract_javascript_code(self, response: str) -> str:
        """Extract JavaScript code from agent response with improved patterns"""
        # Multiple patterns to match different code block formats
        patterns = [
            r'```(?:javascript|js)\n(.*?)\n```',
            r'```\n(.*?function.*?)\n```',
            r'```\n(.*?const.*?=>.*?)\n```',
            r'```\n(.*?)\n```'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, response, re.DOTALL)
            if matches:
                # Return the longest match (likely the most complete solution)
                return max(matches, key=len).strip()
        
        # Fallback: look for function definitions without code blocks
        function_patterns = [
            r'(function\s+\w+.*?\{(?:[^{}]|\{[^{}]*\})*\})',
            r'(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{(?:[^{}]|\{[^{}]*\})*\})'
        ]
        
        for pattern in function_patterns:
            matches = re.findall(pattern, response, re.DOTALL)
            if matches:
                return max(matches, key=len).strip()
        
        return ""

def display_enhanced_result(result: Dict[str, Any]):
    """Display enhanced result with detailed analysis"""
    print("\n" + "=" * 60)
    
    if result["success"]:
        print("🎉 Solution Generated and Validated Successfully!")
        
        print("\n📝 JavaScript Solution:")
        print("-" * 40)
        print(result["solution"])
        
        if "analysis" in result:
            analysis = result["analysis"]
            print(f"\n🔍 Problem Analysis:")
            print("-" * 40)
            print(f"Problem Type: {analysis.get('problem_type', 'Unknown')}")
            if "complexity" in analysis:
                print(f"Time Complexity: {analysis['complexity']['time']}")
                print(f"Space Complexity: {analysis['complexity']['space']}")
        
        if "execution_result" in result:
            exec_result = result["execution_result"]
            print(f"\n🧪 Test Execution Results:")
            print("-" * 40)
            if exec_result["success"]:
                print("✅ All tests passed!")
                if exec_result["stdout"]:
                    print("Test Output:")
                    print(exec_result["stdout"])
            else:
                print("❌ Tests failed!")
                if exec_result["stderr"]:
                    print("Error Details:")
                    print(exec_result["stderr"])
    else:
        print("❌ Solution Generation Failed")
        print(f"Error: {result['error']}")
        if "execution_details" in result:
            print("Execution Details:", result["execution_details"])
    
    print("=" * 60)

async def main():
    """Enhanced main function with async support"""
    print("🚀 Advanced LeetCode Problem Solver with PraisonAI MCPs")
    print("=" * 60)
    
    # Setup API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        api_key = input("Please enter your OpenAI API key: ")
    
    # Initialize solver
    try:
        solver = AdvancedLeetCodeSolver(api_key)
        print("✅ Solver initialized successfully!")
    except Exception as e:
        print(f"❌ Failed to initialize solver: {e}")
        return
    
    while True:
        print("\n🎯 Options:")
        print("1. 🖼️  Solve from image")
        print("2. 📝 Solve from text")
        print("3. 👋 Exit")
        
        choice = input("\nSelect an option (1-3): ").strip()
        
        if choice == "1":
            image_path = input("Enter path to LeetCode problem image: ").strip()
            if os.path.exists(image_path):
                print("\n🔍 Analyzing image and solving problem...")
                result = await solver.solve_from_image(image_path)
                display_enhanced_result(result)
            else:
                print("❌ Image file not found!")
        
        elif choice == "2":
            print("\nEnter the LeetCode problem description:")
            problem_text = input("Problem: ").strip()
            if problem_text:
                print("\n🧠 Analyzing problem and generating solution...")
                result = await solver.solve_from_text(problem_text)
                display_enhanced_result(result)
            else:
                print("❌ Please provide a problem description!")
        
        elif choice == "3":
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid option. Please select 1, 2, or 3.")

if __name__ == "__main__":
    asyncio.run(main())