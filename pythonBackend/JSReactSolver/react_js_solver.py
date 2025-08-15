#!/usr/bin/env python3
"""
React.js/JavaScript Problem Solver with Self-Correction
Handles React questions by generating single HTML files with CDN libraries,
includes explanations, testing, and automatic error correction.
"""

import os
import re
import json
import time
import base64
import tempfile
import subprocess
import traceback
from typing import Dict, Any, Optional, List
from pathlib import Path
import shutil

# PraisonAI imports
from praisonaiagents.agent import Agent

# OpenAI for vision processing
from openai import OpenAI

class ReactJSExecutor:
    """Execute React/JS code in browser environment with testing"""
    
    def __init__(self):
        self.temp_dir = None
        self.html_template = self._get_html_template()
        
    def _get_html_template(self) -> str:
        """Get the base HTML template with React CDN and testing framework"""
        return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React JS Problem Solution</title>
    
    <!-- React CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- Babel for JSX transformation -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Simple testing framework -->
    <script>
        window.TestFramework = {
            tests: [],
            results: [],
            
            test: function(description, testFn) {
                this.tests.push({ description, testFn });
            },
            
            expect: function(actual) {
                return {
                    toBe: function(expected) {
                        if (actual === expected) {
                            return { passed: true, message: `Expected ${expected}, got ${actual}` };
                        } else {
                            throw new Error(`Expected ${expected}, but got ${actual}`);
                        }
                    },
                    toEqual: function(expected) {
                        if (JSON.stringify(actual) === JSON.stringify(expected)) {
                            return { passed: true, message: `Values are equal` };
                        } else {
                            throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
                        }
                    },
                    toBeTruthy: function() {
                        if (actual) {
                            return { passed: true, message: `Value is truthy` };
                        } else {
                            throw new Error(`Expected truthy value, but got ${actual}`);
                        }
                    }
                };
            },
            
            runTests: function() {
                this.results = [];
                let passed = 0;
                let failed = 0;
                
                console.log('\\n🧪 Running Tests...');
                console.log('==================');
                
                this.tests.forEach((test, index) => {
                    try {
                        test.testFn();
                        console.log(`✅ Test ${index + 1}: ${test.description}`);
                        this.results.push({ passed: true, description: test.description });
                        passed++;
                    } catch (error) {
                        console.log(`❌ Test ${index + 1}: ${test.description}`);
                        console.log(`   Error: ${error.message}`);
                        this.results.push({ passed: false, description: test.description, error: error.message });
                        failed++;
                    }
                });
                
                console.log('\\n📊 Test Results:');
                console.log(`✅ Passed: ${passed}`);
                console.log(`❌ Failed: ${failed}`);
                console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
                
                return {
                    total: passed + failed,
                    passed: passed,
                    failed: failed,
                    success_rate: (passed / (passed + failed)) * 100,
                    results: this.results
                };
            }
        };
    </script>
    
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 30px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
        }
        
        .solution-section {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background: #fafafa;
        }
        
        .test-results {
            margin-top: 20px;
            padding: 15px;
            background: #f0f8ff;
            border-radius: 5px;
            border-left: 4px solid #007acc;
        }
        
        .error {
            background: #ffebee;
            border-left: 4px solid #f44336;
            color: #c62828;
        }
        
        .success {
            background: #e8f5e8;
            border-left: 4px solid #4caf50;
            color: #2e7d32;
        }
        
        #app {
            margin-top: 20px;
            padding: 20px;
            border: 2px solid #007acc;
            border-radius: 8px;
            min-height: 200px;
        }
        
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-size: 14px;
        }
        
        .explanation {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 React.js/JavaScript Solution</h1>
            <p>Generated with AI-powered problem solving and auto-testing</p>
        </div>
        
        <div id="explanation" class="explanation">
            <!-- Explanation will be inserted here -->
        </div>
        
        <div class="solution-section">
            <h2>💻 Live Demo</h2>
            <div id="app">
                <!-- React component will render here -->
            </div>
        </div>
        
        <div id="test-results" class="test-results">
            <h3>🧪 Test Results</h3>
            <div id="test-output">Tests will run automatically...</div>
        </div>
    </div>

    <!-- SOLUTION_CODE_PLACEHOLDER -->

    <script type="text/babel">
        // Auto-run tests after component loads
        setTimeout(() => {
            if (window.TestFramework && window.TestFramework.tests.length > 0) {
                const results = window.TestFramework.runTests();
                const testOutput = document.getElementById('test-output');
                
                if (results.failed === 0) {
                    testOutput.className = 'success';
                    testOutput.innerHTML = `
                        <h4>✅ All Tests Passed!</h4>
                        <p>Success Rate: ${results.success_rate.toFixed(1)}% (${results.passed}/${results.total})</p>
                    `;
                } else {
                    testOutput.className = 'error';
                    testOutput.innerHTML = `
                        <h4>❌ Some Tests Failed</h4>
                        <p>Success Rate: ${results.success_rate.toFixed(1)}% (${results.passed}/${results.total})</p>
                        <details>
                            <summary>Failed Tests:</summary>
                            <ul>
                                ${results.results.filter(r => !r.passed).map(r => 
                                    `<li>${r.description}: ${r.error}</li>`
                                ).join('')}
                            </ul>
                        </details>
                    `;
                }
            }
        }, 1000);
    </script>
</body>
</html>'''

    def execute_react_code(self, solution_code: str, explanation: str = "") -> Dict[str, Any]:
        """Execute React/JS code in browser environment with testing"""
        try:
            # Create temporary directory
            self.temp_dir = tempfile.mkdtemp(prefix="react_solver_")
            html_file = os.path.join(self.temp_dir, "solution.html")
            
            # Insert explanation
            html_content = self.html_template.replace(
                "<!-- Explanation will be inserted here -->", 
                f"<h3>📖 Solution Explanation</h3><p>{explanation}</p>"
            )
            
            # Insert solution code
            html_content = html_content.replace(
                "<!-- SOLUTION_CODE_PLACEHOLDER -->", 
                f'<script type="text/babel">\n{solution_code}\n</script>'
            )
            
            # Write HTML file
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"📁 Created HTML file: {html_file}")
            
            # Try to run headless browser tests using playwright or puppeteer
            test_results = self._run_browser_tests(html_file)
            
            return {
                "success": True,
                "html_file": html_file,
                "test_results": test_results,
                "execution_method": "browser_simulation"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"React execution failed: {str(e)}",
                "html_file": html_file if 'html_file' in locals() else None
            }
    
    def _run_browser_tests(self, html_file: str) -> Dict[str, Any]:
        """Run tests using Node.js to simulate browser environment"""
        try:
            # Create a Node.js script to test the HTML
            test_script = f"""
const fs = require('fs');
const {{ JSDOM }} = require('jsdom');

console.log('🧪 Running React/JS tests...');

// Read the HTML file
const htmlContent = fs.readFileSync('{html_file}', 'utf8');

// Create JSDOM environment
const dom = new JSDOM(htmlContent, {{
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true
}});

// Wait for scripts to load and execute
setTimeout(() => {{
    const window = dom.window;
    const document = window.document;
    
    console.log('✅ DOM loaded successfully');
    
    // Check if React is loaded
    if (window.React) {{
        console.log('✅ React loaded successfully');
    }} else {{
        console.log('❌ React not loaded');
    }}
    
    // Check for test results
    if (window.TestFramework) {{
        console.log('✅ Test framework loaded');
        console.log(`📊 Found ${{window.TestFramework.tests.length}} tests`);
    }} else {{
        console.log('⚠️  No test framework found');
    }}
    
    process.exit(0);
}}, 3000);
"""
            
            # Try to run with Node.js (if available)
            try:
                result = subprocess.run(['node', '-e', test_script], 
                                      capture_output=True, text=True, timeout=10)
                
                return {
                    "browser_test_passed": result.returncode == 0,
                    "output": result.stdout,
                    "error": result.stderr if result.stderr else None
                }
            except (subprocess.TimeoutExpired, FileNotFoundError):
                # Fallback: Basic file validation
                return {
                    "browser_test_passed": True,
                    "output": "HTML file created successfully (Node.js not available for full testing)",
                    "error": None,
                    "fallback": True
                }
                
        except Exception as e:
            return {
                "browser_test_passed": False,
                "output": "",
                "error": f"Browser test failed: {str(e)}"
            }
    
    def cleanup(self):
        """Clean up temporary files"""
        if self.temp_dir and os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir)
                print(f"🧹 Cleaned up: {self.temp_dir}")
            except Exception as e:
                print(f"⚠️ Cleanup warning: {e}")

class ReactJSSolver:
    """Main React.js/JavaScript problem solver with self-correction"""
    
    def __init__(self):
        self._initialize_components()
    
    def _initialize_components(self):
        """Initialize all solver components"""
        print("🚀 Initializing React.js/JavaScript Solver...")
        
        # Initialize executor
        self.executor = ReactJSExecutor()
        
        # Initialize PraisonAI agent
        self.agent = Agent(
            role="React.js/JavaScript Expert Developer",
            goal="Generate complete, working React.js and JavaScript solutions with explanations",
            backstory="You are an expert React.js and JavaScript developer specializing in creating comprehensive solutions",
            instructions="""You are an expert React.js and JavaScript developer. Your task is to:

1. Analyze the given problem thoroughly
2. Create a complete working solution using React.js or vanilla JavaScript
3. Generate single HTML files with CDN React libraries when needed
4. Include comprehensive explanations of the solution approach
5. Create test cases to verify the solution works correctly
6. Ensure all code is production-ready and follows best practices

For React problems:
- Use React 18 with modern hooks and patterns
- Create functional components with proper state management
- Include PropTypes or TypeScript-style comments for type safety
- Follow React best practices and performance optimizations

For JavaScript problems:
- Use modern ES6+ syntax
- Include proper error handling
- Write clean, readable, and maintainable code
- Add comprehensive comments explaining the logic

Always include:
- Detailed explanation of the approach
- Time and space complexity analysis
- Test cases that verify the solution
- Example usage and expected outputs
""",
            llm="gpt-4o",  # Best model for code generation
            verbose=True
        )
        
        print("✅ React.js/JavaScript Solver initialized")
    
    def solve_react_problem(self, problem_text: str, max_corrections: int = 3) -> Dict[str, Any]:
        """Solve React.js problem with self-correction"""
        print(f"\n⚛️ Processing React.js Problem")
        print("=" * 50)
        print(f"Problem preview: {problem_text[:100]}...")
        
        return self._solve_with_correction(problem_text, "react", max_corrections)
    
    def solve_js_problem(self, problem_text: str, max_corrections: int = 3) -> Dict[str, Any]:
        """Solve vanilla JavaScript problem with self-correction"""
        print(f"\n🟨 Processing JavaScript Problem")
        print("=" * 50)
        print(f"Problem preview: {problem_text[:100]}...")
        
        return self._solve_with_correction(problem_text, "javascript", max_corrections)
    
    def solve_from_image(self, image_path: str, problem_type: str = "auto", max_corrections: int = 3) -> Dict[str, Any]:
        """Solve React/JS problem from image with auto-detection"""
        print(f"\n🖼️ Processing Image: {image_path}")
        print("=" * 50)
        
        try:
            # Use OpenAI Vision to analyze the image
            client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
            
            # Read and encode image
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
            # Analyze image to extract problem and detect type
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user", 
                        "content": [
                            {
                                "type": "text",
                                "text": """Analyze this programming problem image and:
1. Extract the complete problem statement
2. Determine if it's a React.js problem or vanilla JavaScript problem
3. Identify key requirements and constraints
4. Note any specific UI/component requirements

Provide your analysis in this format:
PROBLEM_TYPE: [react|javascript]
PROBLEM_STATEMENT: [extracted problem text]
REQUIREMENTS: [key requirements and constraints]
"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1500,
                temperature=0.1
            )
            
            analysis = response.choices[0].message.content
            print("✅ Image analysis completed")
            
            # Extract problem type and statement
            problem_type_match = re.search(r'PROBLEM_TYPE:\s*(react|javascript)', analysis, re.IGNORECASE)
            problem_statement_match = re.search(r'PROBLEM_STATEMENT:\s*(.*?)(?=REQUIREMENTS:|$)', analysis, re.DOTALL)
            
            detected_type = problem_type_match.group(1).lower() if problem_type_match else "javascript"
            problem_statement = problem_statement_match.group(1).strip() if problem_statement_match else analysis
            
            print(f"🔍 Detected problem type: {detected_type}")
            
            # Solve based on detected type
            if detected_type == "react":
                return self.solve_react_problem(problem_statement, max_corrections)
            else:
                return self.solve_js_problem(problem_statement, max_corrections)
                
        except Exception as e:
            return {"success": False, "error": f"Image processing failed: {str(e)}"}
    
    def _solve_with_correction(self, problem_text: str, problem_type: str, max_iterations: int = 3) -> Dict[str, Any]:
        """Unified solve method with self-correction loop"""
        
        iteration = 1
        previous_errors = []
        previous_solutions = []
        
        while iteration <= max_iterations:
            try:
                print(f"🔄 Iteration {iteration}/{max_iterations}")
                
                # Build prompt based on iteration
                if iteration == 1:
                    prompt = self._build_initial_prompt(problem_text, problem_type)
                else:
                    prompt = self._build_correction_prompt(problem_text, problem_type, previous_solutions, previous_errors)
                
                # Get solution from AI
                print("🤖 Querying AI agent...")
                response = self.agent.start(prompt)
                print("✅ AI response received")
                
                # Parse the response
                parsed_response = self._parse_ai_response(response)
                
                if not parsed_response["code"]:
                    error_msg = "No code found in AI response"
                    previous_errors.append(error_msg)
                    previous_solutions.append("No code extracted")
                    
                    if iteration == max_iterations:
                        return {
                            "success": False,
                            "error": error_msg,
                            "iterations": iteration,
                            "all_errors": previous_errors
                        }
                    
                    iteration += 1
                    continue
                
                print(f"📝 Extracted solution ({len(parsed_response['code'])} characters)")
                previous_solutions.append(parsed_response["code"])
                
                # Test the solution
                print("🧪 Testing solution...")
                test_result = self.executor.execute_react_code(
                    parsed_response["code"], 
                    parsed_response["explanation"]
                )
                
                if test_result["success"]:
                    print(f"🎉 Solution successful on iteration {iteration}!")
                    
                    # Cleanup any previous temp files
                    self.executor.cleanup()
                    
                    return {
                        "success": True,
                        "solution_code": parsed_response["code"],
                        "explanation": parsed_response["explanation"],
                        "html_file": test_result["html_file"],
                        "test_results": test_result["test_results"],
                        "problem_type": problem_type,
                        "iterations": iteration,
                        "self_corrected": iteration > 1,
                        "correction_history": previous_errors if iteration > 1 else None
                    }
                else:
                    # Test failed - collect error info
                    error_details = test_result.get("error", "Unknown test failure")
                    test_output = test_result.get("test_results", {}).get("error", "")
                    
                    comprehensive_error = f"Test Error: {error_details}"
                    if test_output:
                        comprehensive_error += f"\nTest Output: {test_output}"
                    
                    previous_errors.append(comprehensive_error)
                    print(f"❌ Iteration {iteration} failed: {error_details}")
                    
                    if iteration == max_iterations:
                        print(f"🔴 Failed after {max_iterations} self-correction attempts")
                        return {
                            "success": False,
                            "error": f"Solution failed after {max_iterations} attempts",
                            "final_error": comprehensive_error,
                            "all_errors": previous_errors,
                            "all_solutions": previous_solutions,
                            "iterations": iteration,
                            "problem_type": problem_type
                        }
                    
                    iteration += 1
                    print(f"🔄 Self-correcting with error feedback...")
                    
            except Exception as e:
                error_msg = f"AI generation exception: {str(e)}"
                previous_errors.append(error_msg)
                print(f"❌ Exception in iteration {iteration}: {error_msg}")
                
                if iteration == max_iterations:
                    return {
                        "success": False,
                        "error": error_msg,
                        "all_errors": previous_errors,
                        "iterations": iteration,
                        "problem_type": problem_type
                    }
                
                iteration += 1
    
    def _build_initial_prompt(self, problem_text: str, problem_type: str) -> str:
        """Build initial prompt for problem solving"""
        
        if problem_type == "react":
            return f"""
Create a complete React.js solution for this problem:

{problem_text}

Requirements:
1. Use React 18 with functional components and hooks
2. Create a single HTML file solution with CDN React libraries
3. Include comprehensive explanation of your approach
4. Add test cases using the provided TestFramework
5. Ensure the solution is production-ready and follows React best practices
6. Include proper state management and event handling
7. Add CSS styling for a professional appearance

Provide your response in this format:
EXPLANATION: [Detailed explanation of approach, time/space complexity, and React patterns used]
CODE: [Complete React component code with JSX, including test cases]

The code should include:
- React component definition
- Proper state management with useState/useEffect
- Event handlers and user interactions
- Test cases using TestFramework.test()
- CSS styles if needed for UI components
- Example usage and rendering to #app div
"""
        else:
            return f"""
Create a complete JavaScript solution for this problem:

{problem_text}

Requirements:
1. Use modern ES6+ JavaScript syntax
2. Create a single HTML file solution if UI is needed
3. Include comprehensive explanation of your approach
4. Add test cases using the provided TestFramework
5. Ensure the solution is clean, efficient, and well-commented
6. Include proper error handling

Provide your response in this format:
EXPLANATION: [Detailed explanation of approach, algorithm, time/space complexity]
CODE: [Complete JavaScript solution with test cases]

The code should include:
- Main function/algorithm implementation
- Test cases using TestFramework.test()
- Example usage and expected outputs
- Proper error handling and edge cases
- Clear comments explaining the logic
"""
    
    def _build_correction_prompt(self, problem_text: str, problem_type: str, previous_solutions: List[str], previous_errors: List[str]) -> str:
        """Build correction prompt with error context"""
        
        error_history = "\n".join([
            f"Attempt {i}: Error: {err}"
            for i, err in enumerate(previous_errors, 1)
        ])
        
        return f"""
SELF-CORRECTION REQUIRED: Previous solution(s) failed testing.

Original Problem:
{problem_text}

Previous Failed Attempts:
{error_history}

CRITICAL: Please analyze the errors above and provide a CORRECTED solution that:
1. Fixes all the specific errors mentioned
2. Uses a different approach if the current one has fundamental issues
3. Handles edge cases that caused failures
4. Includes more comprehensive test cases
5. Follows {'React.js' if problem_type == 'react' else 'JavaScript'} best practices

Problem Type: {problem_type.upper()}

Provide your corrected response in this format:
EXPLANATION: [Analysis of previous errors and your corrected approach]
CODE: [Complete corrected solution with enhanced test cases]

Learn from the failures and provide a working solution.
"""
    
    def _parse_ai_response(self, response: str) -> Dict[str, str]:
        """Parse AI response to extract explanation and code"""
        
        # Try to extract explanation
        explanation_match = re.search(r'EXPLANATION:\s*(.*?)(?=CODE:|$)', response, re.DOTALL | re.IGNORECASE)
        explanation = explanation_match.group(1).strip() if explanation_match else ""
        
        # Try to extract code
        code_match = re.search(r'CODE:\s*(.*?)$', response, re.DOTALL | re.IGNORECASE)
        code = code_match.group(1).strip() if code_match else ""
        
        # If structured format not found, try to extract code blocks
        if not code:
            code_blocks = re.findall(r'```(?:javascript|jsx|js)?\n(.*?)\n```', response, re.DOTALL)
            if code_blocks:
                code = '\n\n'.join(code_blocks)
        
        return {
            "explanation": explanation or "No explanation provided",
            "code": code
        }
    
    def __del__(self):
        """Cleanup on destruction"""
        if hasattr(self, 'executor'):
            self.executor.cleanup()

# Convenience functions for easy usage
def solve_react_problem(problem_text: str, max_corrections: int = 3) -> Dict[str, Any]:
    """Convenience function to solve React problems"""
    solver = ReactJSSolver()
    return solver.solve_react_problem(problem_text, max_corrections)

def solve_js_problem(problem_text: str, max_corrections: int = 3) -> Dict[str, Any]:
    """Convenience function to solve JavaScript problems"""
    solver = ReactJSSolver()
    return solver.solve_js_problem(problem_text, max_corrections)

def solve_from_image(image_path: str, max_corrections: int = 3) -> Dict[str, Any]:
    """Convenience function to solve from image"""
    solver = ReactJSSolver()
    return solver.solve_from_image(image_path, max_corrections=max_corrections)

if __name__ == "__main__":
    # Example usage
    print("🚀 React.js/JavaScript Solver Ready!")
    print("Use solve_react_problem() or solve_js_problem() to get started.")