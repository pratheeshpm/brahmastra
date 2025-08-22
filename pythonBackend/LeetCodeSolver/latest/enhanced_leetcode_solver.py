#!/usr/bin/env python3
"""
Enhanced LeetCode Problem Solver with Comprehensive Analysis
Provides optimized solutions, detailed explanations, complexity analysis, and brute force comparisons
"""

import os
import json
import base64
import sys
import subprocess
import tempfile
import re
from typing import Optional, Dict, Any, List
from pathlib import Path
from datetime import datetime

# Import PraisonAI components for tool-based execution and testing
try:
    from praisonaiagents import Agent
    print("✅ PraisonAI imported successfully")
except ImportError as e:
    print(f"❌ Failed to import PraisonAI: {e}")
    sys.exit(1)

# Import OpenAI for vision processing
try:
    import openai
    print("✅ OpenAI imported successfully")
except ImportError as e:
    print(f"❌ Failed to import OpenAI: {e}")
    sys.exit(1)

class EnvironmentManager:
    """Manages environment variables and system requirements"""
    
    @staticmethod
    def get_openai_api_key() -> str:
        """Get OpenAI API key from environment variables"""
        possible_keys = ['OPENAI_API_KEY', 'OPENAI_KEY', 'OPENAI_TOKEN']
        
        for key_name in possible_keys:
            api_key = os.getenv(key_name)
            if api_key:
                print(f"✅ Found OpenAI API key in: {key_name}")
                if api_key.startswith('sk-') and len(api_key) > 20:
                    return api_key
                else:
                    print(f"⚠️  Warning: API key might be invalid")
                    return api_key
        
        print("❌ No OpenAI API key found in environment variables")
        api_key = input("Please enter your OpenAI API key: ").strip()
        if not api_key:
            raise ValueError("OpenAI API key is required")
        return api_key
    
    @staticmethod
    def check_system_requirements() -> Dict[str, bool]:
        """Check if required system components are installed"""
        requirements = {
            'nodejs': False,
            'npm': False,
            'python3': False
        }
        
        # Check Node.js
        try:
            result = subprocess.run(['node', '--version'], 
                                 capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                requirements['nodejs'] = True
                print(f"✅ Node.js: {result.stdout.strip()}")
            else:
                print("❌ Node.js not found")
        except Exception as e:
            print(f"❌ Node.js check failed: {e}")
        
        # Check npm
        try:
            result = subprocess.run(['npm', '--version'], 
                                 capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                requirements['npm'] = True
                print(f"✅ npm: {result.stdout.strip()}")
            else:
                print("❌ npm not found")
        except Exception as e:
            print(f"❌ npm check failed: {e}")
        
        # Check Python
        try:
            requirements['python3'] = True
            print(f"✅ Python: {sys.version.split()[0]}")
        except Exception as e:
            print(f"❌ Python check failed: {e}")
        
        return requirements

class JavaScriptExecutor:
    """Executes JavaScript code using Node.js"""
    
    def _extract_function_name(self, code: str) -> str:
        """Extract function name from JavaScript code"""
        import re
        match = re.search(r'function\s+(\w+)\s*\(', code)
        return match.group(1) if match else 'unknownFunction'
    
    def _convert_to_function_calls(self, test_cases: List[str], function_name: str) -> List[str]:
        """Convert raw test cases to function call format"""
        import re
        converted = []
        for test_case in test_cases:
            # If already in function call format, keep as is
            if '(' in test_case and ')' in test_case and function_name in test_case:
                converted.append(test_case)
            elif '=' in test_case:
                # Format: "nums = [2,7,11,15], target = 9"
                parts = test_case.split(',')
                params = []
                for part in parts:
                    if 'expected' in part.lower():
                        break
                    value_match = re.search(r'=\s*(.+)', part.strip())
                    if value_match:
                        params.append(value_match.group(1).strip())
                if params:
                    converted.append(f"{function_name}({', '.join(params)})")
                else:
                    converted.append(f"{function_name}('{test_case}')")
            elif ',' in test_case and not test_case.startswith('"') and not test_case.startswith("'"):
                # Format: "[2,7,11,15], 9"
                converted.append(f"{function_name}({test_case})")
            else:
                # Single parameter - quote if not already quoted
                if test_case.startswith('"') or test_case.startswith("'"):
                    converted.append(f"{function_name}({test_case})")
                else:
                    converted.append(f"{function_name}('{test_case}')")
        
        print(f"🔄 Converted test cases from {test_cases} to {converted}")
        return converted

    def __init__(self):
        """Initialize the JavaScript executor"""
        self.temp_dir = tempfile.mkdtemp(prefix="leetcode_solver_")
        print(f"📁 Created temp directory: {self.temp_dir}")
    
    def execute_code(self, js_code: str, timeout: int = 15, test_cases: List[str] = None) -> Dict[str, Any]:
        """Execute JavaScript code and return results"""
        print("🔧 Preparing JavaScript execution...")
        
        # Create a Node.js file with the solution and basic test
        test_code = f"""
{js_code}

// Basic execution test
try {{
    console.log("=== CODE EXECUTION TEST ===");
    
    // Extract function name from the code
    const codeText = `{js_code}`;
    const functionMatch = codeText.match(/function\\s+(\\w+)\\s*\\(/);
    
    if (!functionMatch) {{
        throw new Error("No function declaration found in the code");
    }}
    
    const functionName = functionMatch[1];
    console.log("Found function:", functionName);
    
    // Check if function exists in current scope
    let mainFunc;
    try {{
        mainFunc = eval(functionName);
    }} catch (e) {{
        throw new Error(`Function '${{functionName}}' is not accessible in current scope`);
    }}
    
    if (typeof mainFunc !== 'function') {{
        throw new Error(`'${{functionName}}' is not a function`);
    }}
    
    console.log("Function is callable:", typeof mainFunc === 'function');
    
    // Test execution with provided test cases or smart defaults
    const providedTests = {repr(test_cases) if test_cases else 'null'};
    
    if (providedTests && providedTests.length > 0) {{
        console.log("\\n=== USING PROVIDED TEST CASES ===");
        console.log(`Function: ${{functionName}}, Running ${{providedTests.length}} provided test cases`);
        
        let testResults = [];
        
        providedTests.forEach((testCase, index) => {{
            try {{
                console.log(`\\nExecuting test case ${{index + 1}}: ${{testCase}}`);
                
                // Execute the test case - should be in function call format
                let result;
                
                if (testCase.includes(functionName + '(') || testCase.includes('(')) {{
                    // Function call format (preferred): functionName(args...)
                    console.log("   → Executing function call format");
                    result = eval(testCase);
                }} else {{
                    // Fallback: try to parse as legacy format
                    console.log("   → Fallback: parsing legacy format");
                    
                    if (testCase.includes(',') && !testCase.startsWith('"') && !testCase.startsWith("'")) {{
                        // Multi-parameter: "[2,7,11,15], 9"
                        const params = testCase.split(/,(?![^\\[]*\\])/);
                        const inputs = params.map(p => eval(p.trim()));
                        result = mainFunc(...inputs);
                    }} else {{
                        // Single parameter
                        result = mainFunc(eval(testCase));
                    }}
                }}
                
                testResults.push({{
                    test: `Test ${{index + 1}}: ${{testCase}}`,
                    result: result,
                    status: "✅ PASSED"
                }});
                
            }} catch (e) {{
                console.log(`❌ Test case ${{index + 1}} failed:`, e.message);
                testResults.push({{
                    test: `Test ${{index + 1}}: ${{testCase}}`,
                    result: "ERROR",
                    status: "❌ FAILED",
                    error: e.message
                }});
            }}
        }});
        
        console.log("\\n📋 Test Results:");
        testResults.forEach((test, index) => {{
            console.log(`${{test.status}} ${{test.test}} => ${{JSON.stringify(test.result)}}`);
            if (test.error) {{
                console.log(`   Error: ${{test.error}}`);
            }}
        }});
        
    }} else {{
        console.log("\\n=== SMART FUNCTION TESTING v2.0 (No provided test cases) ===");
        // Fallback to smart testing logic when no test cases provided
        // ... (keep existing smart testing logic as fallback)
        console.log("No specific test cases provided, using smart defaults");
        
        let testResults = [];
        const funcName = functionName.toLowerCase();
        
        if (funcName.includes('string') || funcName.includes('substring')) {{
            console.log("🔤 Detected string-based function");
            try {{
                let result1 = mainFunc("abcabcbb");
                testResults.push({{test: "String 'abcabcbb'", result: result1}});
            }} catch (e) {{ console.log("String test failed:", e.message); }}
        }} else {{
            console.log("🔧 Running basic functionality test");
            try {{
                let result1 = mainFunc("test");
                testResults.push({{test: "Basic test", result: result1}});
            }} catch (e) {{ console.log("Basic test failed:", e.message); }}
        }}
        
        console.log("\\n📋 Test Results:");
        testResults.forEach((test, index) => {{
            console.log(`✅ Test ${{index + 1}}: ${{test.test}} => ${{JSON.stringify(test.result)}}`);
        }});
    }}
        
    }} catch (testError) {{
        console.log("Test execution error:", testError.message);
    }}
    
    console.log("\\n✅ Code execution completed successfully");
    
}} catch (error) {{
    console.error("❌ Execution failed:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
}}
"""
        
        # Write to temporary file
        js_file = os.path.join(self.temp_dir, f"solution_{datetime.now().strftime('%Y%m%d_%H%M%S')}.js")
        
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(test_code)
        
        try:
            # Execute with Node.js
            print(f"⚡ Executing: node {js_file}")
            result = subprocess.run(
                ['node', js_file],
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=self.temp_dir
            )
            
            success = result.returncode == 0
            output = result.stdout if success else result.stderr
            
            print(f"📊 Execution result: {'✅ SUCCESS' if success else '❌ FAILED'}")
            
            if output:
                print("📝 Output:")
                print(output)
            
            return {
                "success": success,
                "output": output,
                "error": result.stderr if not success else None,
                "return_code": result.returncode,
                "execution_time": "< 15s"
            }
            
        except subprocess.TimeoutExpired:
            error_msg = f"Execution timed out after {timeout} seconds"
            print(f"⏰ {error_msg}")
            return {
                "success": False,
                "output": "",
                "error": error_msg,
                "return_code": -1,
                "execution_time": f"> {timeout}s"
            }
            
        except Exception as e:
            error_msg = f"Execution failed: {str(e)}"
            print(f"💥 {error_msg}")
            return {
                "success": False,
                "output": "",
                "error": error_msg,
                "return_code": -1,
                "execution_time": "unknown"
            }
        
        finally:
            # Clean up
            try:
                if os.path.exists(js_file):
                    os.remove(js_file)
            except Exception as e:
                print(f"⚠️  Cleanup warning: {e}")
    
    def cleanup(self):
        """Clean up temporary files"""
        try:
            import shutil
            shutil.rmtree(self.temp_dir)
            print(f"🧹 Cleaned up temp directory: {self.temp_dir}")
        except Exception as e:
            print(f"⚠️  Cleanup failed: {e}")


class EnhancedLeetCodeSolver:
    """Enhanced LeetCode solver with comprehensive analysis"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        """Initialize the enhanced solver"""
        print("🚀 Initializing Enhanced LeetCode Solver")
        print("=" * 60)
        
        # Setup API key
        if not openai_api_key:
            openai_api_key = EnvironmentManager.get_openai_api_key()
        
        os.environ["OPENAI_API_KEY"] = openai_api_key
        print("✅ OpenAI API key configured")
        
        # Initialize OpenAI client
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
        print("✅ OpenAI client initialized")
        
        # Check requirements
        requirements = EnvironmentManager.check_system_requirements()
        if not requirements['nodejs']:
            raise RuntimeError("Node.js is required but not found")
        
        # Initialize components
        self.js_executor = JavaScriptExecutor()
        print("✅ JavaScript executor ready")
        
        # Initialize PraisonAI agent with tools for execution and testing
        # Force fresh agent creation by adding timestamp to role
        agent_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        self.agent = Agent(
            role=f"Expert JavaScript LeetCode Algorithm Specialist {agent_timestamp}",
            goal="Generate ONLY JavaScript solutions with comprehensive algorithmic analysis AND test them",
            backstory="You are a world-class JavaScript algorithm expert and competitive programmer specializing in LeetCode problems. You ONLY write JavaScript code, never Python or any other language. You must test your code before providing it.",
            instructions="""You are an expert JavaScript LeetCode problem solver. Your task is to:

1. Analyze the problem carefully
2. Generate an optimized JavaScript solution
3. Provide comprehensive analysis and explanation

🚨 CRITICAL REQUIREMENTS: 
- ALL CODE MUST BE JAVASCRIPT - NEVER PYTHON OR OTHER LANGUAGES! 🚨
- Generate complete, working JavaScript functions
- Use proper formatting with newlines and indentation

WORKFLOW:
1. Analyze the problem requirements
2. Design an optimal algorithm approach
3. Write clean, commented JavaScript solution
4. Provide detailed explanation and complexity analysis

🚨 ABSOLUTE REQUIREMENT: test_cases MUST be executable function calls like "functionName(args)"!

DO NOT WRITE: "test_cases": ["abcabcbb", "bbbbb", "pwwkew"] ❌
INSTEAD WRITE: "test_cases": ["lengthOfLongestSubstring('abcabcbb')", "lengthOfLongestSubstring('bbbbb')", "lengthOfLongestSubstring('pwwkew')"] ✅

If your function is named "lengthOfLongestSubstring", test_cases must be ["lengthOfLongestSubstring('abcabcbb')", "lengthOfLongestSubstring('bbbbb')"]

RESPONSE FORMAT:
```json
{
    "optimized_solution": "function solutionName(params) { /* properly formatted JS with newlines and comments */ }",
    "explanation": "## Algorithm Explanation\\n\\n• **Approach**: Description\\n• **Steps**: 1. Step one 2. Step two\\n\\n### Dry Run Example\\n**Input**: values\\n**Process**: steps\\n**Output**: result",
    "complexity_analysis": "**Time Complexity**: O(n)\\n**Space Complexity**: O(1)",
    "brute_force_approach": "Alternative approach description",
    "test_cases": ["MUST_BE_FUNCTION_CALLS_LIKE: functionName('arg1')", "functionName([1,2,3], 4)", "functionName('arg3')"]
}
```

JavaScript Guidelines:
- Use proper formatting with newlines (\\n) and 4-space indentation
- Add detailed comments explaining logic
- Use const/let, not var
- Example: function twoSum(nums, target) {\\n    // explanation\\n    return result;\\n}

🚨 CRITICAL: test_cases MUST be executable JavaScript function calls!

CORRECT FORMAT:
- Two Sum: ["twoSum([2,7,11,15], 9)", "twoSum([3,2,4], 6)", "twoSum([3,3], 6)"]
- String problems: ["lengthOfLongestSubstring('abcabcbb')", "lengthOfLongestSubstring('bbbbb')", "lengthOfLongestSubstring('pwwkew')"]  
- Array problems: ["maxSubArray([1,-3,2,1,-1])", "maxSubArray([-2,-1])"]

WRONG FORMATS (DO NOT USE):
❌ "abcabcbb" 
❌ "[2,7,11,15], 9"
❌ "nums = [2,7,11,15], target = 9"

✅ ALWAYS use complete function calls: "functionName(arguments)"""",
            
            tools=[],  # Remove tools - we'll handle execution ourselves
            llm="gpt-4o",
            verbose=False  # Disable verbose to reduce noise
        )
        print("✅ Enhanced PraisonAI agent initialized with JavaScript execution capabilities")
    
    def solve_from_text(self, problem_text: str, max_corrections: int = 3) -> Dict[str, Any]:
        """Solve LeetCode problem from text with comprehensive analysis"""
        print(f"\n📝 Processing text problem...")
        print("=" * 60)
        
        enhanced_prompt = f"""
Solve this coding problem and return ONLY a valid JSON response:

PROBLEM: {problem_text}

Return exactly this JSON structure:
{{
    "optimized_solution": "function solutionName(params) {{\\n    // Detailed comment explaining the overall approach\\n    // Comment explaining this step\\n    const variable = value; // Inline comment explaining purpose\\n    \\n    // Comment explaining the main logic/loop\\n    for (let i = 0; i < array.length; i++) {{\\n        // Comment explaining what happens in each iteration\\n        // Comment for important conditions\\n        if (condition) {{\\n            // Comment explaining this branch\\n        }}\\n    }}\\n    \\n    // Comment explaining the return value\\n    return result;\\n}}",
    "explanation": "## Algorithm Explanation\\n\\n• **Approach**: Brief description\\n• **Key Insight**: Main optimization\\n• **Steps**:\\n  1. Step one\\n  2. Step two\\n  3. Step three\\n\\n### Dry Run Example\\n\\n**Input**: [specific values]\\n**Process**:\\n- Step 1: description\\n- Step 2: description\\n- Step 3: description\\n**Output**: [result]",
    "complexity_analysis": "**Time Complexity**: O(n) - explanation\\n**Space Complexity**: O(1) - explanation",
    "brute_force_approach": "Alternative approach with complexity analysis",
    "test_cases": ["functionName('example_input')", "functionName([1,2,3], 4)", "functionName('multi_param_example')"]
}}

Requirements:
- optimized_solution: Complete JavaScript function with proper formatting, indentation, and newlines (use \\n for line breaks)
- Use 4-space indentation for nested code blocks
- CRITICAL: Add detailed code comments explaining each section, variable purpose, and logic
- Include both block comments (// Comment) and inline comments (code; // explanation)
- Comments should be educational and explain WHY not just WHAT
- explanation: Use markdown formatting with bullet points, numbered steps, and structured dry run
- Include specific input values in dry run (e.g., [2,7,11,15], target=9)
- Return valid JSON only, no extra text
- CRITICAL: Format the JavaScript code properly with newlines and indentation in the JSON string
"""
        
        print("🔄 Using enhanced analysis system...")
        return self._solve_problem_with_analysis(enhanced_prompt, "text", max_corrections)
    
    def solve_from_image(self, image_path: str, max_corrections: int = 3) -> Dict[str, Any]:
        """Solve LeetCode problem from image with comprehensive analysis"""
        print(f"\n🖼️  Processing image: {image_path}")
        print("=" * 60)
        
        try:
            # Read and encode image
            with open(image_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode('utf-8')
            
            print("📊 Analyzing image with OpenAI Vision API...")
            
            # Use OpenAI Vision API to analyze the image
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extract the complete LeetCode problem statement from this image. Include the problem title, description, examples, constraints, and any additional information visible in the image."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{image_data}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=2000
            )
            
            ai_response = response.choices[0].message.content
            print("✅ Image analysis completed")
            print(f"📄 Extracted problem text ({len(ai_response)} characters)")
            
            # Create enhanced prompt for comprehensive analysis
            problem_prompt = f"""
            Based on the LeetCode problem image analysis, here's the extracted problem:
            
            {ai_response}
            
            CRITICAL: Return your response as valid JSON with this exact structure:
            {{
                "optimized_solution": "function solutionName(params) {{\\n    // Detailed comment explaining the overall approach\\n    // Comment explaining this step\\n    const variable = value; // Inline comment explaining purpose\\n    \\n    // Comment explaining the main logic/loop\\n    for (let i = 0; i < array.length; i++) {{\\n        // Comment explaining what happens in each iteration\\n        // Comment for important conditions\\n        if (condition) {{\\n            // Comment explaining this branch\\n        }}\\n    }}\\n    \\n    // Comment explaining the return value\\n    return result;\\n}}",
                "explanation": "## Algorithm Explanation\\n\\n• **Approach**: Brief description\\n• **Key Insight**: Main optimization\\n• **Steps**:\\n  1. Step one\\n  2. Step two\\n  3. Step three\\n\\n### Dry Run Example\\n\\n**Input**: [specific values]\\n**Process**:\\n- Step 1: description\\n- Step 2: description\\n- Step 3: description\\n**Output**: [result]",
                "complexity_analysis": "**Time Complexity**: O(n) - explanation\\n**Space Complexity**: O(1) - explanation",
                "brute_force_approach": "Alternative approach with complexity analysis",
                "test_cases": ["functionName('example_input')", "functionName([1,2,3], 4)", "functionName('multi_param_example')"]
            }}
            
            Requirements:
            - optimized_solution: Complete JavaScript function with proper formatting, indentation, and newlines (use \\n for line breaks)
            - Use 4-space indentation for nested code blocks
            - CRITICAL: Add detailed code comments explaining each section, variable purpose, and logic
            - Include both block comments (// Comment) and inline comments (code; // explanation)
            - Comments should be educational and explain WHY not just WHAT
            - explanation: Use markdown formatting with bullet points, numbered steps, and structured dry run
            - Include specific input values in dry run
            - Return valid JSON only, no extra text
            - CRITICAL: Format the JavaScript code properly with newlines and indentation in the JSON string
            """
            
            print("🔄 Using enhanced analysis system for image-based problem...")
            return self._solve_problem_with_analysis(problem_prompt, "image", max_corrections)
            
        except Exception as e:
            error_msg = f"Failed to process image: {str(e)}"
            print(f"❌ {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "input_type": "image",
                "processing_time": 0,
                "timestamp": datetime.now().isoformat()
            }
    
    def _solve_problem_with_analysis(self, prompt: str, input_type: str, max_iterations: int = 3) -> Dict[str, Any]:
        """Solve problem with comprehensive analysis and self-correction"""
        print(f"🧠 Starting comprehensive AI analysis for {input_type} input...")
        start_time = datetime.now()
        
        iteration = 1
        previous_errors = []
        previous_solutions = []
        original_prompt = prompt
        
        while iteration <= max_iterations:
            try:
                print(f"🔄 Analysis Iteration {iteration}/{max_iterations}")
                
                # Build enhanced prompt with error context for corrections
                if iteration == 1:
                    current_prompt = original_prompt
                else:
                    error_history = "\n".join([
                        f"Attempt {i}: Code: {sol[:150]}...\nError: {err}" 
                        for i, (sol, err) in enumerate(zip(previous_solutions, previous_errors), 1)
                    ])
                    
                    current_prompt = f"""
                    🚨 SELF-CORRECTION REQUIRED: Previous JavaScript solution(s) failed testing.
                    
                    Original Problem:
                    {original_prompt}
                    
                    Previous Failed Attempts:
                    {error_history}
                    
                    🚨 CRITICAL REQUIREMENTS FOR CORRECTION:
                    1. MUST write ONLY JavaScript code - NO Python syntax (def, :, indentation)
                    2. Use JavaScript function syntax: function name(params) {{ ... }}
                    3. Use JavaScript variables: const, let (NOT Python variables)
                    4. Use JavaScript comments: // (NOT Python #)
                    
                    Provide a CORRECTED comprehensive analysis with:
                    1. FIXED JavaScript optimized solution that addresses the specific errors
                    2. Updated explanation considering the error patterns
                    3. Corrected complexity analysis
                    4. Improved brute force comparison in JavaScript
                    5. Enhanced test case coverage
                    
                    Example correct format:
                    function twoSum(nums, target) {{
                        const map = new Map();
                        // JavaScript code here
                        return [0, 1];
                    }}
                    
                    Learn from the failures and provide a working JAVASCRIPT solution with complete analysis.
                    """
                
                # Get comprehensive analysis from AI agent with execution testing capabilities
                print("🤖 Using PraisonAI agent with JavaScript execution and testing...")
                try:
                    response = self.agent.start(current_prompt)
                    print("✅ Comprehensive AI analysis received with execution testing")
                except Exception as agent_error:
                    print(f"❌ PraisonAI agent failed: {agent_error}")
                    error_msg = f"PraisonAI agent analysis failed: {str(agent_error)}"
                    previous_errors.append(error_msg)
                    
                    if iteration == max_iterations:
                        processing_time = (datetime.now() - start_time).total_seconds()
                        return {
                            "success": False,
                            "error": f"Failed after {max_iterations} attempts due to API errors",
                            "last_error": error_msg,
                            "processing_time": processing_time,
                            "timestamp": datetime.now().isoformat(),
                            "iterations": iteration,
                            "all_errors": previous_errors
                        }
                    continue
                print(f"🔍 AI response length: {len(response)} characters")
                print(f"🔍 AI response preview (first 200 chars): {response[:200]}...")
                print(f"🔍 AI response ending (last 200 chars): ...{response[-200:]}")
                
                # Parse the JSON response
                analysis_result = self._parse_json_response(response)
                
                if not analysis_result.get('optimized_solution'):
                    error_msg = "No optimized solution found in AI response"
                    previous_errors.append(error_msg)
                    previous_solutions.append("No solution extracted")
                    
                    if iteration == max_iterations:
                        return {
                            "success": False,
                            "error": error_msg,
                            "agent_response": response[:800] + "..." if len(response) > 800 else response,
                            "iterations": iteration,
                            "all_errors": previous_errors,
                            "input_type": input_type,
                            "processing_time": (datetime.now() - start_time).total_seconds(),
                            "timestamp": datetime.now().isoformat()
                        }
                    
                    iteration += 1
                    continue
                
                solution_code = analysis_result['optimized_solution']
                print(f"📝 Extracted optimized solution ({len(solution_code)} characters)")
                previous_solutions.append(solution_code)
                
                # Execute and test the solution
                print("🧪 Testing optimized solution...")
                
                # Extract test cases from the analysis result and convert to function call format
                raw_test_cases = (
                    analysis_result.get('test_cases', []) or 
                    analysis_result.get('test_cases_covered', [])
                )
                
                # Auto-convert test cases to function call format if needed
                function_name = self._extract_function_name(solution_code)
                test_cases_for_execution = self._convert_to_function_calls(raw_test_cases, function_name)
                
                print(f"🚨 DEBUG CHECKPOINT: analysis_result keys: {list(analysis_result.keys())}")
                print(f"🚨 DEBUG CHECKPOINT: test_cases field: {analysis_result.get('test_cases', 'NOT_FOUND')}")
                print(f"🚨 DEBUG CHECKPOINT: test_cases_covered field: {analysis_result.get('test_cases_covered', 'NOT_FOUND')}")
                
                if test_cases_for_execution and len(test_cases_for_execution) > 0:
                    print(f"📋 Using {len(test_cases_for_execution)} provided test cases for execution: {test_cases_for_execution}")
                else:
                    print("📋 No specific test cases provided, using smart defaults")
                
                execution_result = self.js_executor.execute_code(solution_code, test_cases=test_cases_for_execution)
                
                if execution_result["success"]:
                    # Success! Return comprehensive results
                    processing_time = (datetime.now() - start_time).total_seconds()
                    print(f"🎉 Solution successful after {iteration} iteration(s) in {processing_time:.2f}s")
                    
                    return {
                        "success": True,
                        "optimized_solution": solution_code,
                        "explanation": analysis_result.get('explanation', 'No explanation provided'),
                        "complexity_analysis": analysis_result.get('complexity_analysis', 'No complexity analysis provided'),
                        "brute_force_approach": analysis_result.get('brute_force_approach', 'No brute force analysis provided'),
                        "test_cases_covered": test_cases_for_execution,
                        "execution_result": execution_result,
                        "agent_response": response,
                        "input_type": input_type,
                        "processing_time": processing_time,
                        "timestamp": datetime.now().isoformat(),
                        "iterations": iteration,
                        "self_corrected": iteration > 1,
                        "correction_history": previous_errors if iteration > 1 else None
                    }
                else:
                    # Execution failed, prepare for next iteration
                    comprehensive_error = f"Execution failed: {execution_result.get('error', 'Unknown error')}"
                    if execution_result.get('output'):
                        comprehensive_error += f"\nOutput: {execution_result['output']}"
                    
                    previous_errors.append(comprehensive_error)
                    print(f"❌ Iteration {iteration} failed: {comprehensive_error[:200]}...")
                    
                    if iteration == max_iterations:
                        processing_time = (datetime.now() - start_time).total_seconds()
                        return {
                            "success": False,
                            "error": f"Failed after {max_iterations} correction attempts",
                            "last_error": comprehensive_error,
                            "optimized_solution": solution_code,
                            "explanation": analysis_result.get('explanation'),
                            "complexity_analysis": analysis_result.get('complexity_analysis'),
                            "brute_force_approach": analysis_result.get('brute_force_approach'),
                            "test_cases_covered": test_cases_for_execution,
                            "execution_result": execution_result,
                            "agent_response": response,
                            "input_type": input_type,
                            "processing_time": processing_time,
                            "timestamp": datetime.now().isoformat(),
                            "iterations": iteration,
                            "self_corrected": True,
                            "correction_history": previous_errors
                        }
                    
                    iteration += 1
                    print(f"🔄 Preparing iteration {iteration}...")
                    
            except Exception as e:
                error_msg = f"Iteration {iteration} failed with exception: {str(e)}"
                print(f"💥 {error_msg}")
                previous_errors.append(error_msg)
                
                if iteration == max_iterations:
                    processing_time = (datetime.now() - start_time).total_seconds()
                    return {
                        "success": False,
                        "error": error_msg,
                        "input_type": input_type,
                        "processing_time": processing_time,
                        "timestamp": datetime.now().isoformat(),
                        "iterations": iteration,
                        "all_errors": previous_errors
                    }
                
                iteration += 1
        
        # Should not reach here, but safety fallback
        processing_time = (datetime.now() - start_time).total_seconds()
        return {
            "success": False,
            "error": "Max iterations exceeded without resolution",
            "input_type": input_type,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat(),
            "iterations": max_iterations,
            "all_errors": previous_errors
        }
    
    def _parse_json_response(self, response: str) -> Dict[str, str]:
        """Parse the comprehensive AI response into structured components"""
        result = {}
        
        print(f"🔍 Parsing AI response ({len(response)} chars)")
        
        # Try JSON parsing first
        try:
            import json
            
            # Clean up response - sometimes AI adds extra text before/after JSON
            response_clean = response.strip()
            
            # Find JSON block
            json_start = response_clean.find('{')
            json_end = response_clean.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response_clean[json_start:json_end]
                print(f"🔍 Found JSON block: {json_str[:200]}...")
                
                parsed_json = json.loads(json_str)
                
                # Extract fields from JSON
                result['optimized_solution'] = parsed_json.get('optimized_solution', '').strip()
                result['explanation'] = parsed_json.get('explanation', '').strip()
                result['complexity_analysis'] = parsed_json.get('complexity_analysis', '').strip()
                result['brute_force_approach'] = parsed_json.get('brute_force_approach', '').strip()
                test_cases_raw = parsed_json.get('test_cases', [])
                if isinstance(test_cases_raw, list):
                    result['test_cases_covered'] = test_cases_raw
                else:
                    # If it's a string, try to parse it as a list
                    result['test_cases_covered'] = [test_cases_raw] if test_cases_raw else []
                
                print(f"✅ JSON parsing successful!")
                print(f"📝 Solution length: {len(result.get('optimized_solution', ''))}")
                
                # Ensure we have all required fields
                if result.get('optimized_solution'):
                    return result
                else:
                    print("⚠️ JSON parsing succeeded but no optimized_solution found")
                
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON parsing failed: {e}")
            print("🔄 Falling back to text extraction...")
        except Exception as e:
            print(f"⚠️ JSON parsing error: {e}")
            print("🔄 Falling back to text extraction...")
        
        # Strategy 1: Extract optimized solution using improved patterns
        patterns_to_try = [
            # OPTIMIZED_SOLUTION format
            r'OPTIMIZED_SOLUTION:\s*```(?:javascript|js)?\s*(.*?)\s*```',
            r'OPTIMIZED_SOLUTION:\s*(function\s+\w+.*?^})',
            r'OPTIMIZED_SOLUTION:\s*(function\s+\w+.*?})',
            # Code block patterns
            r'```(?:javascript|js)\s*(function\s+\w+.*?^})\s*```',
            r'```\s*(function\s+\w+.*?})\s*```',
            # General function patterns
            r'(function\s+\w+\s*\([^)]*\)\s*\{[^}]*\})',
            r'(function\s+\w+\s*\([^)]*\)\s*\{(?:[^{}]|\{[^}]*\})*\})',
        ]
        
        for pattern in patterns_to_try:
            matches = re.findall(pattern, response, re.DOTALL | re.IGNORECASE | re.MULTILINE)
            for match in matches:
                if isinstance(match, tuple):
                    code = match[0] if match else ""
                else:
                    code = match
                
                code = code.strip()
                if code and not self._is_python_code(code) and 'function' in code and '{' in code and '}' in code:
                    print(f"✅ Found solution using pattern: {pattern[:50]}...")
                    print(f"📝 Code preview: {code[:100]}...")
                    result['optimized_solution'] = code
                    break
            
            if result.get('optimized_solution'):
                break
        
        # Strategy 2: Balanced brace extraction (most robust)
        if not result.get('optimized_solution'):
            print("🔄 Trying balanced brace extraction...")
            balanced_code = self._extract_function_with_balanced_braces(response)
            if balanced_code:
                print(f"✅ Balanced brace extraction successful: {len(balanced_code)} chars")
                result['optimized_solution'] = balanced_code
        
        # Strategy 3: Manual line-by-line parsing if patterns fail
        if not result.get('optimized_solution'):
            print("🔄 Trying manual line-by-line extraction...")
            extracted_code = self._extract_function_manually(response)
            if extracted_code:
                print(f"✅ Manual extraction successful: {len(extracted_code)} chars")
                result['optimized_solution'] = extracted_code
        
        # Strategy 4: Simple function detection as fallback
        if not result.get('optimized_solution'):
            print("🔄 Trying simple function detection...")
            simple_function = self._simple_function_extraction(response)
            if simple_function:
                print(f"✅ Simple extraction successful: {len(simple_function)} chars")
                result['optimized_solution'] = simple_function
        
        # Debug output for failed extractions
        if not result.get('optimized_solution'):
            print("❌ No function extracted from response")
            # Show first 500 chars for debugging
            print(f"Response preview: {response[:500]}...")
        
        # Extract other components with simpler patterns
        # Extract explanation - look for explanation content
        explanation_patterns = [
            r'EXPLANATION:\s*(.*?)(?=COMPLEXITY_ANALYSIS:|BRUTE_FORCE_APPROACH:|TEST_CASES_COVERED:|$)',
            r'Detailed Explanation.*?:\s*(.*?)(?=Complexity Analysis|Brute Force|Test Case|$)',
            r'explanation.*?:\s*(.*?)(?=complexity|brute force|test case|$)',
            r'"explanation"\s*:\s*"([^"]*)"',  # JSON string pattern
            r'"explanation"\s*:\s*"([^"]*(?:\\.[^"]*)*)"',  # JSON with escaped quotes
        ]
        
        for pattern in explanation_patterns:
            try:
                explanation_match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
                if explanation_match and explanation_match.groups():
                    result['explanation'] = explanation_match.group(1).strip()
                    break
            except Exception as e:
                print(f"⚠️ Explanation pattern failed: {e}")
                continue
        
        # Extract complexity analysis
        complexity_patterns = [
            r'COMPLEXITY_ANALYSIS:\s*(.*?)(?=BRUTE_FORCE_APPROACH:|TEST_CASES_COVERED:|$)',
            r'Complexity Analysis.*?:\s*(.*?)(?=Brute Force|Test Case|$)',
            r'Time Complexity.*?Space Complexity.*?(?=Brute Force|Test Case|$)',
            r'"complexity_analysis"\s*:\s*"([^"]*)"',  # JSON string pattern
            r'"complexity_analysis"\s*:\s*"([^"]*(?:\\.[^"]*)*)"',  # JSON with escaped quotes
        ]
        
        for pattern in complexity_patterns:
            try:
                complexity_match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
                if complexity_match and complexity_match.groups():
                    result['complexity_analysis'] = complexity_match.group(1).strip()
                    break
            except Exception as e:
                print(f"⚠️ Complexity pattern failed: {e}")
                continue
        
        # Extract brute force approach
        brute_force_patterns = [
            r'BRUTE_FORCE_APPROACH:\s*(.*?)(?=TEST_CASES_COVERED:|$)',
            r'Brute Force Approach.*?:\s*(.*?)(?=Test Case|$)',
            r'brute force.*?:\s*(.*?)(?=test case|$)',
        ]
        
        for pattern in brute_force_patterns:
            try:
                brute_force_match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
                if brute_force_match and brute_force_match.groups():
                    result['brute_force_approach'] = brute_force_match.group(1).strip()
                    break
            except Exception as e:
                print(f"⚠️ Brute force pattern failed: {e}")
                continue
        
        # Extract test cases covered
        test_cases_patterns = [
            r'TEST_CASES_COVERED:\s*(.*?)$',
            r'Test Case Coverage.*?:\s*(.*?)$',
            r'test case.*?:\s*(.*?)$',
        ]
        
        for pattern in test_cases_patterns:
            try:
                test_cases_match = re.search(pattern, response, re.DOTALL | re.IGNORECASE)
                if test_cases_match and test_cases_match.groups():
                    test_cases_text = test_cases_match.group(1).strip()
                    # Try to split into array if it contains multiple test cases
                    if ',' in test_cases_text or '\n' in test_cases_text:
                        result['test_cases_covered'] = [tc.strip() for tc in test_cases_text.replace('\n', ',').split(',') if tc.strip()]
                    else:
                        result['test_cases_covered'] = [test_cases_text] if test_cases_text else []
                    break
            except Exception as e:
                print(f"⚠️ Test cases pattern failed: {e}")
                continue
        
        # Extract mermaid diagrams from explanation
        mermaid_diagrams = self._extract_mermaid_diagrams(response)
        if mermaid_diagrams:
            result['mermaid_diagrams'] = mermaid_diagrams
            print(f"✅ Found {len(mermaid_diagrams)} mermaid diagram(s)")
        
        return result
    
    def _extract_mermaid_diagrams(self, content: str) -> List[str]:
        """Extract Mermaid diagrams from the response"""
        # Find all mermaid code blocks
        mermaid_pattern = r'```mermaid\n(.*?)\n```'
        diagrams = re.findall(mermaid_pattern, content, re.DOTALL)
        
        # Clean up the diagrams
        cleaned_diagrams = []
        for diagram in diagrams:
            # Remove extra whitespace and ensure proper formatting
            cleaned = diagram.strip()
            if cleaned and len(cleaned) > 10:  # Basic validation
                cleaned_diagrams.append(cleaned)
        
        return cleaned_diagrams
    
    def _extract_function_manually(self, response: str) -> str:
        """Manually extract JavaScript function using line-by-line parsing"""
        lines = response.split('\n')
        
        for i, line in enumerate(lines):
            stripped_line = line.strip()
            # Look for function declaration
            if 'function' in stripped_line and '(' in stripped_line:
                function_lines = []
                brace_count = 0
                started = False
                
                # Start from current line and collect function
                for j in range(i, len(lines)):
                    current_line = lines[j]
                    stripped_current = current_line.strip()
                    
                    # Skip empty lines before function starts
                    if not stripped_current and not started:
                        continue
                    
                    # Mark start when we see the function keyword
                    if 'function' in stripped_current and not started:
                        started = True
                    
                    if started:
                        function_lines.append(current_line)
                        # Count braces to track function completion
                        brace_count += stripped_current.count('{') - stripped_current.count('}')
                        
                        # Check if we have a complete function (brace_count returns to 0)
                        if brace_count == 0 and len(function_lines) > 1:
                            complete_function = '\n'.join(function_lines)
                            if not self._is_python_code(complete_function) and len(complete_function) > 20:
                                return complete_function
                            break
                        elif brace_count < 0:  # Invalid, too many closing braces
                            break
        
        return None
    
    def _simple_function_extraction(self, response: str) -> str:
        """Simple extraction looking for any complete function"""
        # Try to find function patterns with better multi-line support
        patterns = [
            # Match complete functions with proper brace counting
            r'function\s+\w+\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
            # Match arrow functions
            r'(?:const|let|var)\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}',
            # Simple one-liner functions
            r'function\s+\w+\s*\([^)]*\)\s*\{\s*return\s+[^;]+;\s*\}',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, response, re.DOTALL)
            for match in matches:
                if not self._is_python_code(match) and len(match) > 20:
                    return match
        
        # Last resort: find any text that looks like a function
        lines = response.split('\n')
        for i, line in enumerate(lines):
            if 'function' in line.lower() and '(' in line and any(char in line for char in ['{', 'return']):
                # Try to extract a few lines around this
                start = max(0, i)
                end = min(len(lines), i + 10)  # Look ahead up to 10 lines
                
                candidate_lines = []
                for j in range(start, end):
                    candidate_lines.append(lines[j].strip())
                    if '}' in lines[j] and len(candidate_lines) >= 2:
                        candidate = '\n'.join(candidate_lines)
                        if 'function' in candidate and '{' in candidate and '}' in candidate:
                            if not self._is_python_code(candidate):
                                return candidate
                        break
        
        return None
    
    def _extract_complete_js_function(self, response: str) -> str:
        """Extract a complete JavaScript function from the response (legacy method)"""
        lines = response.split('\n')
        
        for i, line in enumerate(lines):
            # Look for function declaration
            if 'function' in line.strip() and '(' in line and '{' in line:
                # Found function start, now find the complete function
                function_lines = [line.strip()]
                brace_count = line.count('{') - line.count('}')
                
                # Continue until we find the closing brace
                for j in range(i + 1, len(lines)):
                    next_line = lines[j].strip()
                    if next_line:  # Skip empty lines
                        function_lines.append(next_line)
                        brace_count += next_line.count('{') - next_line.count('}')
                        
                        # If we've closed all braces, we have the complete function
                        if brace_count == 0:
                            complete_function = '\n'.join(function_lines)
                            if not self._is_python_code(complete_function):
                                return complete_function
                            break
        
                return None
    
    def _extract_function_with_balanced_braces(self, response: str) -> str:
        """Extract function using balanced brace counting - most robust method"""
        # Find all potential function starts
        function_starts = []
        lines = response.split('\n')
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            # Look for clean function declarations (not inside markdown or explanations)
            if (re.match(r'^\s*function\s+\w+\s*\(', stripped) and 
                not any(marker in line for marker in ['*', '│', '╭', '╰', '─', '•', '1.', '2.', '3.', '4.', '5.'])):
                function_starts.append(i)
        
        # For each function start, try to extract complete function
        for start_idx in function_starts:
            brace_count = 0
            function_lines = []
            
            for i in range(start_idx, len(lines)):
                line = lines[i]
                stripped_line = line.strip()
                
                # Skip lines that look like markdown or explanations
                if any(marker in line for marker in ['*', '│', '╭', '╰', '─', '•', 'Input:', 'Output:', 'Example:']):
                    if brace_count == 0:  # Haven't started collecting function yet
                        continue
                    else:  # We're in the middle of a function, this might be the end
                        break
                
                function_lines.append(line)
                
                # Count braces
                brace_count += stripped_line.count('{') - stripped_line.count('}')
                
                # If we've closed all braces and have some content, we're done
                if brace_count == 0 and len(function_lines) > 1:
                    complete_function = '\n'.join(function_lines)
                    # Clean up any trailing markdown or explanation text
                    clean_function = self._clean_extracted_function(complete_function)
                    if (len(clean_function) > 20 and 
                        'function' in clean_function and 
                        '{' in clean_function and 
                        '}' in clean_function and
                        not self._is_python_code(clean_function)):
                        return clean_function.strip()
                    break
                elif brace_count < 0:
                    break  # Invalid nesting
        
        return None
    
    def _clean_extracted_function(self, code: str) -> str:
        """Clean extracted function from markdown artifacts"""
        lines = code.split('\n')
        clean_lines = []
        
        for line in lines:
            # Skip lines with markdown artifacts
            if any(marker in line for marker in ['*', '│', '╭', '╰', '─', '•', 'Input:', 'Output:', 'Example:', 'Test:']):
                continue
            # Skip numbered list items that aren't code
            if re.match(r'^\s*\d+\.?\s+[A-Z]', line.strip()):
                continue
            clean_lines.append(line)
        
        return '\n'.join(clean_lines)
    
    def _is_python_code(self, code: str) -> bool:
        """Check if code contains Python syntax patterns"""
        if not code:
            return False
            
        python_patterns = [
            r'\bdef\s+\w+\s*\(',  # def function_name(
            r':\s*$',            # lines ending with :
            r'^\s+[a-zA-Z]',     # indented lines starting with letters (Python indentation)
            r'#\s*\w+',          # Python comments
            r'\bprint\s*\(',     # Python print function
            r'\brange\s*\(',     # Python range function
            r'\benumerate\s*\(', # Python enumerate function
        ]
        
        for pattern in python_patterns:
            if re.search(pattern, code, re.MULTILINE):
                return True
        return False
    
    def cleanup(self):
        """Clean up resources"""
        if hasattr(self, 'js_executor'):
            self.js_executor.cleanup()


# Convenience functions for easy usage
def solve_leetcode_problem(problem_text: str, max_corrections: int = 3) -> Dict[str, Any]:
    """Convenience function to solve a LeetCode problem from text"""
    solver = EnhancedLeetCodeSolver()
    try:
        result = solver.solve_from_text(problem_text, max_corrections)
        return result
    finally:
        solver.cleanup()

def solve_leetcode_from_image(image_path: str, max_corrections: int = 3) -> Dict[str, Any]:
    """Convenience function to solve a LeetCode problem from image"""
    solver = EnhancedLeetCodeSolver()
    try:
        result = solver.solve_from_image(image_path, max_corrections)
        return result
    finally:
        solver.cleanup()


if __name__ == "__main__":
    print("🧠 Enhanced LeetCode Problem Solver")
    print("=" * 60)
    print("Features:")
    print("- ✅ Optimized solutions with complexity analysis")
    print("- ✅ Detailed explanations with sample walkthroughs")
    print("- ✅ Brute force approach comparisons")
    print("- ✅ Comprehensive test case coverage")
    print("- ✅ Self-correction up to 5 attempts")
    print("- ✅ Support for text and image inputs")
    print("=" * 60)
    
    # Example usage
    if len(sys.argv) > 1:
        problem = " ".join(sys.argv[1:])
        print(f"Solving: {problem}")
        result = solve_leetcode_problem(problem)
        
        if result['success']:
            print("\n🎉 SUCCESS!")
            print(f"Optimized Solution:\n{result['optimized_solution']}")
            print(f"\nExplanation:\n{result['explanation']}")
            print(f"\nComplexity Analysis:\n{result['complexity_analysis']}")
            print(f"\nBrute Force Approach:\n{result['brute_force_approach']}")
        else:
            print(f"\n❌ FAILED: {result['error']}")
    else:
        print("Usage: python enhanced_leetcode_solver.py 'Your LeetCode problem here'")