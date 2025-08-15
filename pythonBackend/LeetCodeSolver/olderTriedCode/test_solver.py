#!/usr/bin/env python3
"""
Test script for the LeetCode Problem Solver
Demonstrates how to use both versions of the solver
"""

import os
import asyncio
from leetcode_solver import LeetCodeSolver
from leetcode_solver_mcp import AdvancedLeetCodeSolver

def test_basic_solver():
    """Test the basic LeetCode solver"""
    print("🔬 Testing Basic LeetCode Solver")
    print("=" * 40)
    
    # Get API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Please set OPENAI_API_KEY environment variable")
        return
    
    # Test problem
    problem = """
    Given an array of integers nums and an integer target, return indices of the 
    two numbers such that they add up to target. You may assume that each input 
    would have exactly one solution, and you may not use the same element twice.
    
    Example:
    Input: nums = [2,7,11,15], target = 9
    Output: [0,1]
    Because nums[0] + nums[1] == 9, we return [0, 1].
    """
    
    try:
        solver = LeetCodeSolver(api_key)
        result = solver.solve_from_text(problem)
        
        print("\n📊 Basic Solver Result:")
        if result["success"]:
            print("✅ Success!")
            print("Solution:", result["solution"][:100] + "..." if len(result["solution"]) > 100 else result["solution"])
        else:
            print("❌ Failed:", result["error"])
            
    except Exception as e:
        print(f"❌ Error testing basic solver: {e}")

async def test_advanced_solver():
    """Test the advanced MCP-based solver"""
    print("\n🔬 Testing Advanced MCP LeetCode Solver")
    print("=" * 40)
    
    # Get API key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ Please set OPENAI_API_KEY environment variable")
        return
    
    # Test problem
    problem = """
    Write a function to find the longest common prefix string amongst an array of strings.
    If there is no common prefix, return an empty string "".
    
    Example 1:
    Input: strs = ["flower","flow","flight"]
    Output: "fl"
    
    Example 2:
    Input: strs = ["dog","racecar","car"]
    Output: ""
    """
    
    try:
        solver = AdvancedLeetCodeSolver(api_key)
        result = await solver.solve_from_text(problem)
        
        print("\n📊 Advanced Solver Result:")
        if result["success"]:
            print("✅ Success!")
            print("Solution:", result["solution"][:200] + "..." if len(result["solution"]) > 200 else result["solution"])
            
            if "analysis" in result:
                analysis = result["analysis"]
                print(f"Problem Type: {analysis.get('problem_type', 'Unknown')}")
                if "complexity" in analysis:
                    print(f"Time Complexity: {analysis['complexity']['time']}")
                    print(f"Space Complexity: {analysis['complexity']['space']}")
        else:
            print("❌ Failed:", result["error"])
            
    except Exception as e:
        print(f"❌ Error testing advanced solver: {e}")

def test_image_processing():
    """Test image processing capabilities"""
    print("\n🔬 Testing Image Processing")
    print("=" * 40)
    
    # This would test with an actual image file
    # For demo purposes, we'll just show the structure
    
    sample_image_path = "sample_leetcode_problem.png"
    
    if os.path.exists(sample_image_path):
        print(f"✅ Found test image: {sample_image_path}")
        print("You can test image processing by running:")
        print("python leetcode_solver_mcp.py")
        print("And selecting option 1 (Solve from image)")
    else:
        print("ℹ️  No test image found.")
        print("To test image processing:")
        print("1. Save a screenshot of a LeetCode problem")
        print("2. Run: python leetcode_solver_mcp.py")
        print("3. Select option 1 and provide the image path")

async def main():
    """Run all tests"""
    print("🚀 LeetCode Solver Test Suite")
    print("=" * 50)
    
    # Test basic solver
    test_basic_solver()
    
    # Test advanced solver
    await test_advanced_solver()
    
    # Test image processing info
    test_image_processing()
    
    print("\n" + "=" * 50)
    print("✅ Test suite completed!")
    print("\nTo run the interactive solvers:")
    print("• Basic version: python leetcode_solver.py")
    print("• Advanced version: python leetcode_solver_mcp.py")

if __name__ == "__main__":
    asyncio.run(main())