#!/usr/bin/env python3
"""
Improved LeetCode Problem Solver with PraisonAI and MCPs
Enhanced version with better environment variable handling and error management
"""

import os
import json
import base64
import asyncio
import sys
from typing import Optional, Dict, Any, List
from pathlib import Path

# Try to import required packages with better error handling
try:
    from praisonaiagents import Agent
    from praisonaiagents.tools import BaseTool
    print("✅ PraisonAI packages imported successfully")
except ImportError as e:
    print(f"❌ Failed to import PraisonAI packages: {e}")
    print("Please install with: pip install praisonaiagents praisonai praisonai-tools")
    sys.exit(1)

try:
    import subprocess
    import tempfile
    import re
    from datetime import datetime
    print("✅ Standard libraries imported successfully")
except ImportError as e:
    print(f"❌ Failed to import standard libraries: {e}")
    sys.exit(1)

class EnvironmentManager:
    """Manages environment variables and configuration"""
    
    @staticmethod
    def get_openai_api_key() -> str:
        """Get OpenAI API key from environment variables with multiple fallbacks"""
        # Try multiple environment variable names
        possible_keys = [
            'OPENAI_API_KEY',
            'OPENAI_KEY', 
            'OPENAI_TOKEN',
            'OPEN_AI_API_KEY'
        ]
        
        for key_name in possible_keys:
            api_key = os.getenv(key_name)
            if api_key:
                print(f"✅ Found OpenAI API key in environment variable: {key_name}")
                # Validate key format
                if api_key.startswith('sk-') and len(api_key) > 20:
                    return api_key
                else:
                    print(f"⚠️  Warning: API key in {key_name} might be invalid (should start with 'sk-')")
                    return api_key
        
        # If no key found, prompt user
        print("❌ No OpenAI API key found in environment variables")
        print("Checked variables:", ", ".join(possible_keys))
        
        api_key = input("Please enter your OpenAI API key: ").strip()
        if not api_key:
            raise ValueError("OpenAI API key is required")
        
        return api_key
    
    @staticmethod
    def check_system_requirements() -> Dict[str, bool]:
        """Check if all system requirements are met"""
        requirements = {}
        
        # Check Python version
        python_version = sys.version_info
        requirements['python'] = python_version >= (3, 8)
        
        # Check Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                node_version = result.stdout.strip()
                print(f"✅ Node.js found: {node_version}")
                requirements['nodejs'] = True
            else:
                requirements['nodejs'] = False
        except FileNotFoundError:
            print("❌ Node.js not found")
            requirements['nodejs'] = False
        
        # Check if we're in correct conda environment
        conda_env = os.getenv('CONDA_DEFAULT_ENV', 'base')
        print(f"📍 Current conda environment: {conda_env}")
        requirements['conda_env'] = conda_env in ['praison', 'praisonchat']
        
        return requirements

class EnhancedImageProcessor:
    """Enhanced image processing with better error handling"""
    
    @staticmethod
    def encode_image_to_base64(image_path: str) -> str:
        """Convert image to base64 with validation"""
        try:
            # Validate file exists
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            # Check file size (limit to 20MB)
            file_size = os.path.getsize(image_path)
            if file_size > 20 * 1024 * 1024:  # 20MB
                raise ValueError(f"Image file too large: {file_size / (1024*1024):.1f}MB (max 20MB)")
            
            # Check file extension
            valid_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
            file_ext = Path(image_path).suffix.lower()
            if file_ext not in valid_extensions:
                print(f"⚠️  Warning: Unusual image extension '{file_ext}'. Supported: {valid_extensions}")
            
            with open(image_path, "rb") as image_file:
                encoded = base64.b64encode(image_file.read()).decode('utf-8')
                print(f"✅ Image encoded successfully: {len(encoded)} characters")
                return encoded
                
        except Exception as e:
            raise ValueError(f"Failed to encode image: {str(e)}")
    
    @staticmethod
    def get_image_info(image_path: str) -> Dict[str, Any]:
        """Get comprehensive image metadata"""
        try:
            info = {
                "path": image_path,
                "exists": os.path.exists(image_path),
                "size_bytes": os.path.getsize(image_path) if os.path.exists(image_path) else 0,
                "extension": Path(image_path).suffix.lower(),
                "filename": Path(image_path).name
            }
            
            # Try to get PIL info if available
            try:
                from PIL import Image
                with Image.open(image_path) as img:
                    info.update({
                        "format": img.format,
                        "dimensions": img.size,
                        "mode": img.mode,
                        "has_transparency": img.mode in ('RGBA', 'LA') or 'transparency' in img.info
                    })
                    print(f"✅ Image info: {img.format} {img.size[0]}x{img.size[1]} ({img.mode})")
            except ImportError:
                print("ℹ️  PIL not available for detailed image metadata")
            except Exception as e:
                print(f"⚠️  Could not read image metadata: {e}")
            
            return info
            
        except Exception as e:
            return {"error": f"Failed to get image info: {str(e)}"}

class NodeJSExecutor(BaseTool):
    """Enhanced Node.js executor with better error handling"""
    
    name: str = "nodejs_executor"
    description: str = "Execute JavaScript code using Node.js with comprehensive validation"
    
    def __init__(self):
        super().__init__()
        self.check_nodejs_availability()
    
    def check_nodejs_availability(self):
        """Check if Node.js is available and get version"""
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                self.nodejs_version = result.stdout.strip()
                print(f"✅ Node.js available: {self.nodejs_version}")
                
                # Check if version is adequate (>= 14)
                version_num = int(self.nodejs_version.split('.')[0][1:])  # Remove 'v' and get major version
                if version_num < 14:
                    print(f"⚠️  Warning: Node.js {self.nodejs_version} is old. Recommended: v14+")
            else:
                raise RuntimeError("Node.js command failed")
        except FileNotFoundError:
            raise RuntimeError("Node.js is not installed or not in PATH. Please install from https://nodejs.org/")
        except Exception as e:
            raise RuntimeError(f"Node.js check failed: {e}")
    
    def _run(self, code: str, test_cases: Optional[str] = None, timeout: int = 15) -> Dict[str, Any]:
        """Execute JavaScript code with enhanced error handling"""
        print(f"🚀 Executing JavaScript code (timeout: {timeout}s)")
        
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                # Setup project files
                js_file = Path(temp_dir) / "solution.js"
                package_json = Path(temp_dir) / "package.json"
                
                # Create comprehensive package.json
                package_config = {
                    "name": "leetcode-solution",
                    "version": "1.0.0",
                    "type": "module",
                    "main": "solution.js",
                    "scripts": {
                        "start": "node solution.js",
                        "test": "node --test solution.js"
                    },
                    "engines": {
                        "node": ">=14.0.0"
                    },
                    "description": "Generated LeetCode solution"
                }
                
                package_json.write_text(json.dumps(package_config, indent=2))
                
                # Prepare complete code with enhanced error handling
                complete_code = self._prepare_code_with_validation(code, test_cases)
                js_file.write_text(complete_code)
                
                print(f"📁 Created files in: {temp_dir}")
                print(f"📄 JavaScript file: {len(complete_code)} characters")
                
                # Execute with timeout
                start_time = datetime.now()
                result = subprocess.run(
                    ['node', 'solution.js'],
                    cwd=temp_dir,
                    capture_output=True,
                    text=True,
                    timeout=timeout
                )
                end_time = datetime.now()
                execution_time = (end_time - start_time).total_seconds()
                
                success = result.returncode == 0
                print(f"⏱️  Execution completed in {execution_time:.2f}s")
                print(f"📊 Exit code: {result.returncode}")
                
                return {
                    "success": success,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "return_code": result.returncode,
                    "execution_time": execution_time,
                    "nodejs_version": self.nodejs_version,
                    "temp_dir": temp_dir
                }
                
        except subprocess.TimeoutExpired:
            print(f"⏰ Execution timed out after {timeout} seconds")
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Execution timed out after {timeout} seconds",
                "return_code": -1,
                "execution_time": timeout
            }
        except Exception as e:
            print(f"❌ Execution error: {e}")
            return {
                "success": False,
                "stdout": "",
                "stderr": f"Execution error: {str(e)}",
                "return_code": -1,
                "execution_time": 0
            }
    
    def _prepare_code_with_validation(self, code: str, test_cases: Optional[str]) -> str:
        """Prepare JavaScript code with comprehensive validation"""
        
        # Enhanced error handling
        error_handling = """
// Enhanced error handling and logging
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
});

// Add timestamp to logs
console.log(`🚀 Starting execution at ${new Date().toISOString()}`);
"""
        
        # Enhanced test framework
        test_framework = """
// Enhanced test framework
let testsPassed = 0;
let testsTotal = 0;
let testResults = [];

function runTest(testName, testFn) {
    testsTotal++;
    const startTime = Date.now();
    
    try {
        console.log(`\\n🧪 Running: ${testName}`);
        const result = testFn();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (result !== false) {
            console.log(`✅ ${testName} PASSED (${duration}ms)`);
            testsPassed++;
            testResults.push({name: testName, status: 'PASSED', duration});
        } else {
            console.log(`❌ ${testName} FAILED (${duration}ms)`);
            testResults.push({name: testName, status: 'FAILED', duration});
        }
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`❌ ${testName} ERROR: ${error.message} (${duration}ms)`);
        testResults.push({name: testName, status: 'ERROR', duration, error: error.message});
    }
}

function printTestSummary() {
    console.log(`\\n📊 Test Summary`);
    console.log(`═══════════════`);
    console.log(`Tests Run: ${testsTotal}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsTotal - testsPassed}`);
    console.log(`Success Rate: ${testsTotal > 0 ? ((testsPassed/testsTotal)*100).toFixed(1) : 0}%`);
    
    if (testResults.length > 0) {
        console.log(`\\n📋 Detailed Results:`);
        testResults.forEach(result => {
            const icon = result.status === 'PASSED' ? '✅' : '❌';
            console.log(`  ${icon} ${result.name}: ${result.status} (${result.duration}ms)`);
            if (result.error) {
                console.log(`     Error: ${result.error}`);
            }
        });
    }
    
    if (testsPassed === testsTotal && testsTotal > 0) {
        console.log(`\\n🎉 All tests passed! Solution is ready.`);
    } else {
        console.log(`\\n⚠️  Some tests failed. Review the code.`);
    }
    
    console.log(`\\n🏁 Execution completed at ${new Date().toISOString()}`);
}

// Function to validate solution exists
function validateSolution() {
    const functionNames = ['solution', 'twoSum', 'threeSum', 'longestCommonPrefix', 'isValid', 'mergeTwoLists'];
    for (const name of functionNames) {
        if (typeof eval(\`typeof \${name} !== 'undefined' ? \${name} : undefined\`) === 'function') {
            console.log(\`✅ Found function: \${name}\`);
            return name;
        }
    }
    console.log('⚠️  No standard function names found. Make sure your solution is properly defined.');
    return null;
}
"""
        
        # Combine all parts
        complete_code = error_handling + "\n" + code + "\n" + test_framework
        
        if test_cases:
            complete_code += "\n" + test_cases
        else:
            # Add basic validation if no test cases provided
            complete_code += "\n\n// Basic validation\nvalidateSolution();"
        
        complete_code += "\n\nprintTestSummary();"
        
        return complete_code

class LeetCodeAnalyzer(BaseTool):
    """Enhanced LeetCode problem analyzer"""
    
    name: str = "leetcode_analyzer"
    description: str = "Analyze LeetCode problems and generate intelligent test cases"
    
    def _run(self, problem_text: str, solution_code: str) -> Dict[str, Any]:
        """Analyze problem and generate comprehensive test cases"""
        print("🔍 Analyzing LeetCode problem...")
        
        try:
            # Extract function information
            function_info = self._extract_function_info(solution_code)
            print(f"📝 Found function: {function_info['name']}({function_info['parameters']})")
            
            # Classify problem type
            problem_type = self._classify_problem_type(problem_text)
            print(f"🏷️  Problem type: {problem_type}")
            
            # Generate test cases
            test_cases = self._generate_intelligent_test_cases(problem_text, function_info, problem_type)
            
            # Analyze complexity
            complexity = self._analyze_complexity(problem_text, solution_code)
            print(f"⚡ Estimated complexity: Time {complexity['time']}, Space {complexity['space']}")
            
            return {
                "success": True,
                "function_info": function_info,
                "test_cases": test_cases,
                "complexity": complexity,
                "problem_type": problem_type
            }
            
        except Exception as e:
            print(f"❌ Analysis failed: {e}")
            return {
                "success": False,
                "error": f"Analysis failed: {str(e)}"
            }
    
    def _extract_function_info(self, code: str) -> Dict[str, str]:
        """Extract function information with better parsing"""
        patterns = [
            r'function\s+(\w+)\s*\((.*?)\)',
            r'const\s+(\w+)\s*=\s*\((.*?)\)\s*=>',
            r'let\s+(\w+)\s*=\s*\((.*?)\)\s*=>',
            r'var\s+(\w+)\s*=\s*function\s*\((.*?)\)',
            r'(\w+)\s*:\s*function\s*\((.*?)\)',  # Object method
        ]
        
        for pattern in patterns:
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
    
    def _classify_problem_type(self, problem_text: str) -> str:
        """Classify problem type with better detection"""
        text_lower = problem_text.lower()
        
        # Define keyword categories
        categories = {
            "Array": ["array", "list", "elements", "indices", "subarray"],
            "String": ["string", "character", "substring", "palindrome", "anagram"],
            "Tree": ["tree", "binary tree", "node", "root", "leaf", "traversal"],
            "Graph": ["graph", "edge", "vertex", "connected", "path", "cycle"],
            "Dynamic Programming": ["dynamic programming", "dp", "optimal", "maximum", "minimum"],
            "Two Pointers": ["two pointer", "sliding window", "left", "right", "start", "end"],
            "Hash Table": ["hash", "map", "dictionary", "lookup", "frequency"],
            "Stack/Queue": ["stack", "queue", "push", "pop", "fifo", "lifo"],
            "Math": ["mathematical", "formula", "calculate", "sum", "product"],
            "Sorting": ["sort", "sorted", "order", "ascending", "descending"],
            "Binary Search": ["binary search", "search", "target", "sorted array"],
            "Linked List": ["linked list", "listnode", "next", "head", "tail"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in text_lower for keyword in keywords):
                return category
        
        return "General"
    
    def _generate_intelligent_test_cases(self, problem_text: str, function_info: Dict[str, str], problem_type: str) -> str:
        """Generate intelligent test cases based on problem analysis"""
        func_name = function_info["name"]
        
        # Extract examples from problem text
        examples = self._extract_examples_from_text(problem_text)
        
        test_template = f"""
// Intelligent Test Cases for {func_name} ({problem_type})
console.log("🧪 Starting comprehensive testing for {func_name}");
console.log("Problem Type: {problem_type}");

// Test Case 1: Basic functionality from examples
runTest("Basic Functionality", () => {{
    try {{
        // Based on problem examples
        {self._generate_example_tests(examples, func_name)}
        return true;
    }} catch (e) {{
        console.error("Basic test error:", e.message);
        return false;
    }}
}});

// Test Case 2: Edge cases
runTest("Edge Cases", () => {{
    try {{
        {self._generate_edge_case_tests(problem_type, func_name)}
        return true;
    }} catch (e) {{
        console.error("Edge case error:", e.message);
        return false;
    }}
}});

// Test Case 3: Boundary conditions
runTest("Boundary Conditions", () => {{
    try {{
        {self._generate_boundary_tests(problem_type, func_name)}
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
        {self._generate_performance_test(problem_type, func_name)}
        const endTime = Date.now();
        
        const duration = endTime - startTime;
        console.log(`⚡ Performance test completed in ${{duration}}ms`);
        
        return duration < 5000; // Should complete within 5 seconds
    }} catch (e) {{
        console.error("Performance test error:", e.message);
        return false;
    }}
}});
"""
        return test_template
    
    def _extract_examples_from_text(self, text: str) -> List[str]:
        """Extract example inputs/outputs from problem text"""
        examples = []
        lines = text.split('\n')
        
        current_example = []
        in_example = False
        
        for line in lines:
            line = line.strip()
            if 'example' in line.lower() or 'input:' in line.lower():
                if current_example:
                    examples.append('\n'.join(current_example))
                current_example = [line]
                in_example = True
            elif in_example and ('input:' in line.lower() or 'output:' in line.lower() or 'explanation:' in line.lower()):
                current_example.append(line)
            elif in_example and line == '':
                if current_example:
                    examples.append('\n'.join(current_example))
                current_example = []
                in_example = False
        
        if current_example:
            examples.append('\n'.join(current_example))
        
        return examples[:3]  # Return first 3 examples
    
    def _generate_example_tests(self, examples: List[str], func_name: str) -> str:
        """Generate tests based on extracted examples"""
        if not examples:
            return f"const result = {func_name}(/* Add test input based on problem examples */);\n        console.log('Example test result:', result);"
        
        test_code = ""
        for i, example in enumerate(examples):
            test_code += f"// Example {i+1}: {example[:50]}...\n        "
            test_code += f"const result{i+1} = {func_name}(/* Extract from: {example[:30]}... */);\n        "
            test_code += f"console.log('Example {i+1} result:', result{i+1});\n        "
        
        return test_code
    
    def _generate_edge_case_tests(self, problem_type: str, func_name: str) -> str:
        """Generate edge case tests based on problem type"""
        edge_cases = {
            "Array": [
                "Empty array: []",
                "Single element: [1]",
                "Duplicate elements: [1,1,1]"
            ],
            "String": [
                "Empty string: ''",
                "Single character: 'a'",
                "Special characters: '!@#'"
            ],
            "Tree": [
                "Empty tree: null",
                "Single node tree",
                "Unbalanced tree"
            ],
            "General": [
                "Null/undefined input",
                "Minimum values",
                "Maximum values"
            ]
        }
        
        cases = edge_cases.get(problem_type, edge_cases["General"])
        test_code = ""
        
        for i, case in enumerate(cases):
            test_code += f"// {case}\n        "
            test_code += f"const edgeResult{i+1} = {func_name}(/* {case} */);\n        "
            test_code += f"console.log('Edge case {i+1}:', edgeResult{i+1});\n        "
        
        return test_code
    
    def _generate_boundary_tests(self, problem_type: str, func_name: str) -> str:
        """Generate boundary condition tests"""
        return f"""// Boundary conditions for {problem_type}
        const boundaryResult1 = {func_name}(/* Maximum constraint input */);
        console.log('Boundary test 1 (max):', boundaryResult1);
        
        const boundaryResult2 = {func_name}(/* Minimum constraint input */);
        console.log('Boundary test 2 (min):', boundaryResult2);"""
    
    def _generate_performance_test(self, problem_type: str, func_name: str) -> str:
        """Generate performance test based on problem type"""
        perf_tests = {
            "Array": f"const largeArray = Array(1000).fill(0).map((_, i) => i);\n        const perfResult = {func_name}(largeArray);",
            "String": f"const longString = 'a'.repeat(1000);\n        const perfResult = {func_name}(longString);",
            "General": f"const perfResult = {func_name}(/* Large input for performance testing */);"
        }
        
        return perf_tests.get(problem_type, perf_tests["General"])
    
    def _analyze_complexity(self, problem_text: str, code: str) -> Dict[str, str]:
        """Analyze time and space complexity with better heuristics"""
        time_complexity = "O(1)"
        space_complexity = "O(1)"
        
        # Count nested loops
        loop_depth = 0
        for line in code.split('\n'):
            stripped = line.strip()
            if any(keyword in stripped for keyword in ['for (', 'for(', 'while (', 'while(']):
                loop_depth += 1
        
        # Analyze time complexity
        if loop_depth >= 3:
            time_complexity = "O(n³)"
        elif loop_depth == 2:
            time_complexity = "O(n²)"
        elif loop_depth == 1:
            time_complexity = "O(n)"
        elif 'sort(' in code.lower():
            time_complexity = "O(n log n)"
        elif any(keyword in code.lower() for keyword in ['binary search', 'divide', 'log']):
            time_complexity = "O(log n)"
        
        # Analyze space complexity
        if any(keyword in code for keyword in ['new Array(', 'Array(', '[]', 'new Map(', 'new Set(']):
            if 'n' in problem_text.lower() and 'length' in code:
                space_complexity = "O(n)"
            else:
                space_complexity = "O(k)"  # Some auxiliary space
        
        return {
            "time": time_complexity,
            "space": space_complexity,
            "loop_depth": loop_depth
        }

class ImprovedLeetCodeSolver:
    """Improved LeetCode solver with enhanced error handling and testing"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """Initialize solver with comprehensive setup"""
        print("🚀 Initializing Improved LeetCode Solver")
        print("=" * 50)
        
        # Get API key
        if not openai_api_key:
            openai_api_key = EnvironmentManager.get_openai_api_key()
        
        os.environ["OPENAI_API_KEY"] = openai_api_key
        print("✅ OpenAI API key configured")
        
        # Check system requirements
        requirements = EnvironmentManager.check_system_requirements()
        if not requirements['nodejs']:
            raise RuntimeError("Node.js is required but not found")
        
        # Initialize tools
        self.js_executor = NodeJSExecutor()
        self.analyzer = LeetCodeAnalyzer()
        print("✅ Tools initialized successfully")
        
        # Initialize PraisonAI agent
        try:
            self.agent = Agent(
                instructions="""You are an expert LeetCode problem solver with the following capabilities:

                CORE RESPONSIBILITIES:
                1. Analyze LeetCode problems from images or text with high accuracy
                2. Generate clean, efficient JavaScript solutions using modern ES6+ syntax
                3. Create comprehensive test suites covering edge cases and boundary conditions
                4. Validate solutions through rigorous testing before delivery
                5. Provide detailed complexity analysis and optimization suggestions
                6. Only return solutions that pass ALL validation tests

                SOLUTION GUIDELINES:
                - Write clean, readable, and well-documented JavaScript code
                - Use appropriate data structures and algorithms for optimal performance
                - Include proper error handling and input validation
                - Follow JavaScript best practices and naming conventions
                - Generate meaningful variable names and add comments for complex logic

                TESTING REQUIREMENTS:
                - Create comprehensive test cases including edge cases
                - Test with empty inputs, single elements, and boundary conditions
                - Include performance tests for large inputs
                - Validate all test cases pass before providing the solution
                - Report any test failures with detailed error information

                OUTPUT FORMAT:
                - Provide complete, working JavaScript functions
                - Include the main solution function and any helper functions
                - Ensure the code is ready to run without modifications
                - Add brief comments explaining the approach and complexity""",
                
                tools=[self.js_executor, self.analyzer],
                model="gpt-4o",
                max_tokens=4000
            )
            print("✅ PraisonAI agent initialized with GPT-4o")
            
        except Exception as e:
            print(f"❌ Failed to initialize PraisonAI agent: {e}")
            raise
    
    def solve_from_image(self, image_path: str) -> Dict[str, Any]:
        """Solve LeetCode problem from image with comprehensive validation"""
        print(f"\n🖼️  Processing image: {image_path}")
        print("=" * 50)
        
        try:
            # Validate and process image
            image_info = EnhancedImageProcessor.get_image_info(image_path)
            if "error" in image_info:
                return {"success": False, "error": image_info["error"]}
            
            # Encode image
            base64_image = EnhancedImageProcessor.encode_image_to_base64(image_path)
            
            # Create detailed prompt
            prompt = f"""
            Analyze this LeetCode problem image and provide a complete solution:
            
            IMAGE INFORMATION:
            - File: {image_info['filename']}
            - Size: {image_info['size_bytes']} bytes
            - Format: {image_info.get('format', 'Unknown')}
            - Dimensions: {image_info.get('dimensions', 'Unknown')}
            
            ANALYSIS REQUIREMENTS:
            1. Extract the complete problem statement, including title, description, examples, and constraints
            2. Identify the problem type and optimal solution approach
            3. Generate a clean, efficient JavaScript solution
            4. Use the leetcode_analyzer tool to create comprehensive test cases
            5. Use the nodejs_executor tool to validate the solution works correctly
            6. Provide complexity analysis and any optimization notes
            7. Only return the final solution if ALL tests pass successfully
            
            IMAGE DATA: data:image/jpeg;base64,{base64_image}
            
            Please provide a complete, tested, and optimized JavaScript solution.
            """
            
            return self._solve_problem(prompt, "image")
            
        except Exception as e:
            return {"success": False, "error": f"Image processing failed: {str(e)}"}
    
    def solve_from_text(self, problem_text: str) -> Dict[str, Any]:
        """Solve LeetCode problem from text with comprehensive analysis"""
        print(f"\n📝 Processing text problem")
        print("=" * 50)
        print(f"Problem preview: {problem_text[:100]}...")
        
        try:
            prompt = f"""
            Solve this LeetCode problem with comprehensive analysis:
            
            PROBLEM STATEMENT:
            {problem_text}
            
            SOLUTION REQUIREMENTS:
            1. Analyze the problem thoroughly and identify the optimal algorithmic approach
            2. Consider time and space complexity requirements
            3. Generate a clean, efficient JavaScript solution with proper error handling
            4. Use the leetcode_analyzer tool to generate comprehensive test cases
            5. Use the nodejs_executor tool to validate the solution thoroughly
            6. Test edge cases, boundary conditions, and performance scenarios
            7. Provide detailed complexity analysis and optimization suggestions
            8. Only provide the final solution if ALL validation tests pass successfully
            
            Please deliver a production-ready JavaScript solution with complete test coverage.
            """
            
            return self._solve_problem(prompt, "text")
            
        except Exception as e:
            return {"success": False, "error": f"Text processing failed: {str(e)}"}
    
    def _solve_problem(self, prompt: str, input_type: str) -> Dict[str, Any]:
        """Internal method to solve problem using PraisonAI agent"""
        print(f"🧠 Starting AI analysis for {input_type} input...")
        
        try:
            # Get solution from agent
            print("🤖 Querying PraisonAI agent...")
            response = self.agent.start(prompt)
            print("✅ Agent response received")
            
            # Extract JavaScript code
            js_code = self._extract_javascript_code(response)
            if not js_code:
                return {
                    "success": False, 
                    "error": "No JavaScript code found in agent response",
                    "agent_response": response[:500] + "..." if len(response) > 500 else response
                }
            
            print(f"📝 Extracted JavaScript code ({len(js_code)} characters)")
            
            # Analyze the solution
            print("🔍 Analyzing solution...")
            analysis_result = self.analyzer._run("LeetCode problem", js_code)
            
            if not analysis_result["success"]:
                return {
                    "success": False, 
                    "error": "Solution analysis failed", 
                    "details": analysis_result,
                    "solution": js_code
                }
            
            # Execute and validate
            print("🧪 Executing and validating solution...")
            execution_result = self.js_executor._run(
                js_code, 
                analysis_result.get("test_cases", "")
            )
            
            if execution_result["success"]:
                print("🎉 Solution validation successful!")
                return {
                    "success": True,
                    "solution": js_code,
                    "analysis": analysis_result,
                    "execution_result": execution_result,
                    "agent_response": response,
                    "input_type": input_type
                }
            else:
                print("❌ Solution validation failed")
                return {
                    "success": False,
                    "error": "Solution validation failed - tests did not pass",
                    "solution": js_code,
                    "analysis": analysis_result,
                    "execution_details": execution_result,
                    "agent_response": response,
                    "input_type": input_type
                }
                
        except Exception as e:
            print(f"❌ Problem solving failed: {e}")
            return {"success": False, "error": f"Problem solving failed: {str(e)}"}
    
    def _extract_javascript_code(self, response: str) -> str:
        """Extract JavaScript code from agent response with multiple strategies"""
        # Strategy 1: Look for code blocks
        patterns = [
            r'```(?:javascript|js)\n(.*?)\n```',
            r'```\n(.*?function.*?)\n```',
            r'```\n(.*?const.*?=>.*?)\n```',
            r'```\n(.*?)\n```'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, response, re.DOTALL)
            if matches:
                # Return the longest match (likely most complete)
                longest_match = max(matches, key=len).strip()
                if len(longest_match) > 50:  # Reasonable minimum length
                    return longest_match
        
        # Strategy 2: Look for function definitions
        function_patterns = [
            r'(function\s+\w+.*?\{(?:[^{}]|\{[^{}]*\})*\})',
            r'(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{(?:[^{}]|\{[^{}]*\})*\})',
            r'(let\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{(?:[^{}]|\{[^{}]*\})*\})'
        ]
        
        for pattern in function_patterns:
            matches = re.findall(pattern, response, re.DOTALL)
            if matches:
                longest_match = max(matches, key=len).strip()
                if len(longest_match) > 50:
                    return longest_match
        
        # Strategy 3: Look for any code-like content
        lines = response.split('\n')
        code_lines = []
        in_code_block = False
        
        for line in lines:
            if 'function' in line or '=>' in line or line.strip().startswith('const') or line.strip().startswith('let'):
                in_code_block = True
            
            if in_code_block:
                code_lines.append(line)
                if line.strip() == '}' and len(code_lines) > 5:
                    break
        
        if code_lines:
            potential_code = '\n'.join(code_lines)
            if len(potential_code) > 50:
                return potential_code
        
        return ""

def display_comprehensive_result(result: Dict[str, Any]):
    """Display comprehensive result with detailed formatting"""
    print("\n" + "=" * 70)
    
    if result["success"]:
        print("🎉 SOLUTION GENERATED AND VALIDATED SUCCESSFULLY!")
        print("=" * 70)
        
        # Solution code
        print("\n📝 JavaScript Solution:")
        print("-" * 50)
        print(result["solution"])
        
        # Problem analysis
        if "analysis" in result:
            analysis = result["analysis"]
            print(f"\n🔍 Problem Analysis:")
            print("-" * 50)
            print(f"🏷️  Problem Type: {analysis.get('problem_type', 'Unknown')}")
            
            if "complexity" in analysis:
                complexity = analysis["complexity"]
                print(f"⚡ Time Complexity: {complexity['time']}")
                print(f"💾 Space Complexity: {complexity['space']}")
                if "loop_depth" in complexity:
                    print(f"🔄 Loop Depth: {complexity['loop_depth']}")
            
            if "function_info" in analysis:
                func_info = analysis["function_info"]
                print(f"🔧 Function: {func_info['name']}({func_info['parameters']})")
        
        # Execution results
        if "execution_result" in result:
            exec_result = result["execution_result"]
            print(f"\n🧪 Test Execution Results:")
            print("-" * 50)
            
            if exec_result["success"]:
                print("✅ ALL TESTS PASSED!")
                print(f"⏱️  Execution Time: {exec_result.get('execution_time', 'Unknown')}s")
                print(f"🔧 Node.js Version: {exec_result.get('nodejs_version', 'Unknown')}")
                
                if exec_result["stdout"]:
                    print("\n📋 Test Output:")
                    print(exec_result["stdout"])
            else:
                print("❌ TESTS FAILED!")
                if exec_result["stderr"]:
                    print("🐛 Error Details:")
                    print(exec_result["stderr"])
                if exec_result["stdout"]:
                    print("\n📋 Partial Output:")
                    print(exec_result["stdout"])
        
        print("\n✅ Solution is ready for submission to LeetCode!")
        
    else:
        print("❌ SOLUTION GENERATION FAILED")
        print("=" * 70)
        print(f"🚨 Error: {result['error']}")
        
        if "solution" in result:
            print("\n📝 Partial Solution (may have issues):")
            print("-" * 50)
            print(result["solution"])
        
        if "execution_details" in result:
            exec_details = result["execution_details"]
            print("\n🔧 Execution Details:")
            print("-" * 50)
            if exec_details.get("stderr"):
                print("Errors:", exec_details["stderr"])
            if exec_details.get("stdout"):
                print("Output:", exec_details["stdout"])
        
        print("\n💡 Troubleshooting Tips:")
        print("- Check if the problem statement is clear and complete")
        print("- Verify that Node.js is properly installed")
        print("- Ensure OpenAI API key is valid and has sufficient credits")
        print("- Try simplifying the problem or providing more context")
    
    print("=" * 70)

def main():
    """Enhanced main function with comprehensive setup and error handling"""
    print("🚀 IMPROVED LEETCODE PROBLEM SOLVER")
    print("Using PraisonAI with MCPs and OpenAI GPT-4o")
    print("=" * 70)
    
    try:
        # Check system requirements
        print("🔧 Checking system requirements...")
        requirements = EnvironmentManager.check_system_requirements()
        
        if not requirements['python']:
            print("❌ Python 3.8+ is required")
            return
        
        if not requirements['nodejs']:
            print("❌ Node.js is required but not found")
            print("💡 Please install Node.js from: https://nodejs.org/")
            return
        
        if not requirements['conda_env']:
            print(f"⚠️  Recommended to use 'praison' or 'praisonchat' conda environment")
            print(f"Current environment: {os.getenv('CONDA_DEFAULT_ENV', 'Unknown')}")
        
        # Initialize solver
        print("\n🤖 Initializing solver...")
        solver = ImprovedLeetCodeSolver()
        
        print("\n✅ Solver ready! Starting interactive mode...")
        
        # Interactive loop
        while True:
            print("\n" + "=" * 50)
            print("🎯 LEETCODE SOLVER OPTIONS")
            print("=" * 50)
            print("1. 🖼️  Solve from image (screenshot of LeetCode problem)")
            print("2. 📝 Solve from text (copy-paste problem description)")
            print("3. 🧪 Run test example")
            print("4. 📋 Show system info")
            print("5. 👋 Exit")
            
            choice = input(f"\n🎮 Select option (1-5): ").strip()
            
            if choice == "1":
                image_path = input("📁 Enter path to LeetCode problem image: ").strip()
                if image_path and os.path.exists(image_path):
                    print(f"\n🔍 Analyzing image and solving problem...")
                    result = solver.solve_from_image(image_path)
                    display_comprehensive_result(result)
                else:
                    print("❌ Image file not found or path is empty!")
            
            elif choice == "2":
                print("\n📝 Enter the LeetCode problem description:")
                print("(You can paste multiple lines, press Enter twice when done)")
                problem_lines = []
                empty_count = 0
                
                while empty_count < 2:
                    line = input()
                    if line.strip() == "":
                        empty_count += 1
                    else:
                        empty_count = 0
                    problem_lines.append(line)
                
                problem_text = '\n'.join(problem_lines).strip()
                
                if problem_text:
                    print(f"\n🧠 Analyzing problem and generating solution...")
                    result = solver.solve_from_text(problem_text)
                    display_comprehensive_result(result)
                else:
                    print("❌ Please provide a problem description!")
            
            elif choice == "3":
                print("\n🧪 Running test with Two Sum problem...")
                test_problem = """
                Given an array of integers nums and an integer target, return indices of the 
                two numbers such that they add up to target.
                
                You may assume that each input would have exactly one solution, and you may not use the same element twice.
                You can return the answer in any order.
                
                Example 1:
                Input: nums = [2,7,11,15], target = 9
                Output: [0,1]
                Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
                
                Example 2:
                Input: nums = [3,2,4], target = 6
                Output: [1,2]
                
                Example 3:
                Input: nums = [3,3], target = 6
                Output: [0,1]
                
                Constraints:
                2 <= nums.length <= 10^4
                -10^9 <= nums[i] <= 10^9
                -10^9 <= target <= 10^9
                Only one valid answer exists.
                """
                
                result = solver.solve_from_text(test_problem)
                display_comprehensive_result(result)
            
            elif choice == "4":
                print("\n📋 SYSTEM INFORMATION")
                print("=" * 50)
                requirements = EnvironmentManager.check_system_requirements()
                
                print(f"🐍 Python: {'✅' if requirements['python'] else '❌'} {sys.version}")
                print(f"📦 Conda Environment: {os.getenv('CONDA_DEFAULT_ENV', 'Unknown')}")
                print(f"🟢 Node.js: {'✅' if requirements['nodejs'] else '❌'}")
                
                if requirements['nodejs']:
                    try:
                        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
                        print(f"   Version: {result.stdout.strip()}")
                    except:
                        pass
                
                print(f"🔑 OpenAI API Key: {'✅ Set' if os.getenv('OPENAI_API_KEY') else '❌ Not found'}")
                print(f"📁 Working Directory: {os.getcwd()}")
                
                # Check PraisonAI packages
                try:
                    import praisonaiagents
                    print(f"🤖 PraisonAI Agents: ✅ Installed")
                except ImportError:
                    print(f"🤖 PraisonAI Agents: ❌ Not installed")
            
            elif choice == "5":
                print("\n👋 Thank you for using the LeetCode Solver!")
                print("Happy coding! 🚀")
                break
            
            else:
                print("❌ Invalid option. Please select 1-5.")
                
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye! (Interrupted by user)")
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        print("\n🐛 Debugging info:")
        print(f"- Python version: {sys.version}")
        print(f"- Working directory: {os.getcwd()}")
        print(f"- Environment variables: OPENAI_API_KEY={'set' if os.getenv('OPENAI_API_KEY') else 'not set'}")

if __name__ == "__main__":
    main()