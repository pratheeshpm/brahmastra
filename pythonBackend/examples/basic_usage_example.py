#!/usr/bin/env python3
"""
Basic Usage Example for LeetCode Solver
Demonstrates how to use the solver programmatically
"""

import sys
import os

# Add parent directory to path to import the solver
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from simplified_leetcode_solver import SimplifiedLeetCodeSolver

def example_text_solving():
    """Example of solving a problem from text"""
    print("🎯 Example 1: Solving Two Sum from Text")
    print("=" * 50)
    
    # Initialize solver
    solver = SimplifiedLeetCodeSolver()
    
    # Define the problem
    two_sum_problem = """
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
    
    Constraints:
    - 2 <= nums.length <= 10^4
    - -10^9 <= nums[i] <= 10^9
    - -10^9 <= target <= 10^9
    - Only one valid answer exists.
    """
    
    # Solve the problem
    result = solver.solve_from_text(two_sum_problem)
    
    # Display results
    if result["success"]:
        print("✅ Problem solved successfully!")
        print("\n📝 Generated Solution:")
        print(result["solution"])
        
        if result["execution_result"]["success"]:
            print("\n🧪 Execution Results:")
            print(f"⏱️  Time: {result['execution_result']['execution_time']:.2f}s")
            print("📋 Output:")
            print(result["execution_result"]["stdout"])
        else:
            print("\n❌ Execution failed:")
            print(result["execution_result"]["stderr"])
    else:
        print("❌ Problem solving failed:")
        print(result["error"])

def example_image_solving():
    """Example of solving a problem from image"""
    print("\n🎯 Example 2: Solving from Image")
    print("=" * 50)
    
    # Check if sample image exists
    image_path = "../sampleLCQ.png"
    if not os.path.exists(image_path):
        print("⚠️  Sample image not found. Skipping image example.")
        return
    
    # Initialize solver
    solver = SimplifiedLeetCodeSolver()
    
    # Solve from image
    result = solver.solve_from_image(image_path)
    
    # Display results
    if result["success"]:
        print("✅ Image processed and problem solved!")
        print("\n📝 Generated Solution:")
        print(result["solution"])
    else:
        print("❌ Image processing failed:")
        print(result["error"])

def example_batch_processing():
    """Example of processing multiple problems"""
    print("\n🎯 Example 3: Batch Processing")
    print("=" * 50)
    
    problems = [
        "Write a function to reverse a string",
        "Find the maximum element in an array",
        "Check if a string is a palindrome"
    ]
    
    solver = SimplifiedLeetCodeSolver()
    results = []
    
    for i, problem in enumerate(problems, 1):
        print(f"\n🔄 Processing problem {i}: {problem}")
        result = solver.solve_from_text(problem)
        
        if result["success"]:
            print(f"✅ Problem {i} solved!")
            results.append({
                "problem": problem,
                "solution": result["solution"],
                "success": True
            })
        else:
            print(f"❌ Problem {i} failed: {result['error']}")
            results.append({
                "problem": problem,
                "error": result["error"],
                "success": False
            })
    
    # Summary
    print(f"\n📊 Batch Processing Summary:")
    successful = sum(1 for r in results if r["success"])
    print(f"✅ Successful: {successful}/{len(results)}")
    print(f"❌ Failed: {len(results) - successful}/{len(results)}")

def main():
    """Main example function"""
    print("🚀 LeetCode Solver - Usage Examples")
    print("=" * 60)
    
    try:
        # Run examples
        example_text_solving()
        example_image_solving()
        example_batch_processing()
        
        print("\n🎉 All examples completed!")
        print("\n💡 Tips:")
        print("- Use simplified_leetcode_solver.py for interactive mode")
        print("- Ensure your OpenAI API key is set")
        print("- Test with simple problems first")
        print("- Check the README.md for detailed documentation")
        
    except Exception as e:
        print(f"\n❌ Example failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Ensure you're in the pythonBackend directory")
        print("2. Check that OpenAI API key is set")
        print("3. Verify all dependencies are installed")
        print("4. Run quick_test.py first to verify setup")

if __name__ == "__main__":
    main()