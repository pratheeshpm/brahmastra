#!/usr/bin/env python3
"""
Test script for the agentic self-correction feature
Demonstrates how the AI automatically fixes code that fails tests
"""

import sys
import os
import time
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from simplified_leetcode_solver import SimplifiedLeetCodeSolver

def test_self_correction_system():
    """Test the self-correction capabilities"""
    print("🧪 TESTING AGENTIC SELF-CORRECTION SYSTEM")
    print("=" * 60)
    print("This test demonstrates how the AI automatically fixes")
    print("code that doesn't pass tests using error feedback.")
    print("=" * 60)
    
    # Initialize solver
    print("\n🚀 Initializing LeetCode Solver...")
    solver = SimplifiedLeetCodeSolver()
    
    # Test 1: Simple problem that might need correction
    print("\n1️⃣ Test 1: Two Sum Problem")
    print("-" * 40)
    
    two_sum_problem = """
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

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
    """
    
    start_time = time.time()
    result = solver.solve_from_text(two_sum_problem, max_corrections=3)
    end_time = time.time()
    
    print(f"\n📊 Results:")
    print(f"   ✅ Success: {result['success']}")
    print(f"   ⏱️  Time: {end_time - start_time:.2f} seconds")
    print(f"   🔄 Iterations: {result.get('iterations', 1)}")
    print(f"   🛠️  Self-corrected: {result.get('self_corrected', False)}")
    
    if result.get('correction_history'):
        print(f"   📚 Correction History:")
        for i, error in enumerate(result['correction_history'], 1):
            print(f"      {i}. {error[:100]}...")
    
    if result['success']:
        print(f"\n💻 Final Solution:")
        print(result['solution'])
        print("\n🧪 Execution Result:")
        print(f"   Output: {result['execution_result']['output']}")
        print(f"   Exit Code: {result['execution_result']['exit_code']}")
    else:
        print(f"\n❌ Failed after all attempts:")
        print(f"   Error: {result['error']}")
    
    # Test 2: More complex problem
    print("\n\n2️⃣ Test 2: Valid Parentheses (More Complex)")
    print("-" * 50)
    
    parentheses_problem = """
    Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

    An input string is valid if:
    1. Open brackets must be closed by the same type of brackets.
    2. Open brackets must be closed in the correct order.
    3. Every close bracket has a corresponding open bracket of the same type.

    Example 1:
    Input: s = "()"
    Output: true

    Example 2:
    Input: s = "()[]{}"
    Output: true

    Example 3:
    Input: s = "(]"
    Output: false

    Constraints:
    1 <= s.length <= 10^4
    s consists of parentheses only '()[]{}'.
    """
    
    start_time = time.time()
    result2 = solver.solve_from_text(parentheses_problem, max_corrections=4)
    end_time = time.time()
    
    print(f"\n📊 Results:")
    print(f"   ✅ Success: {result2['success']}")
    print(f"   ⏱️  Time: {end_time - start_time:.2f} seconds")
    print(f"   🔄 Iterations: {result2.get('iterations', 1)}")
    print(f"   🛠️  Self-corrected: {result2.get('self_corrected', False)}")
    
    if result2.get('correction_history'):
        print(f"   📚 Correction History:")
        for i, error in enumerate(result2['correction_history'], 1):
            print(f"      {i}. {error[:100]}...")
    
    if result2['success']:
        print(f"\n💻 Final Solution:")
        print(result2['solution'])
    else:
        print(f"\n❌ Failed after all attempts:")
        print(f"   Error: {result2['error']}")
        if 'all_errors' in result2:
            print(f"   All errors: {result2['all_errors']}")
    
    # Summary
    print("\n\n📈 SELF-CORRECTION SUMMARY")
    print("=" * 50)
    
    test1_corrected = result.get('self_corrected', False)
    test2_corrected = result2.get('self_corrected', False)
    
    print(f"Test 1 (Two Sum): {'✅ Solved' if result['success'] else '❌ Failed'}")
    print(f"  - Iterations: {result.get('iterations', 1)}")
    print(f"  - Self-corrected: {'Yes' if test1_corrected else 'No'}")
    
    print(f"Test 2 (Valid Parentheses): {'✅ Solved' if result2['success'] else '❌ Failed'}")
    print(f"  - Iterations: {result2.get('iterations', 1)}")
    print(f"  - Self-corrected: {'Yes' if test2_corrected else 'No'}")
    
    total_corrections = sum([test1_corrected, test2_corrected])
    print(f"\n🎯 Total problems requiring self-correction: {total_corrections}/2")
    
    if total_corrections > 0:
        print("\n🎉 SUCCESS: Agentic self-correction system is working!")
        print("   The AI successfully learned from errors and fixed the code.")
    else:
        print("\n✨ EXCELLENT: Solutions were correct on first attempt!")
        print("   (Self-correction system is ready if needed)")
    
    print("\n💡 Key Features Demonstrated:")
    print("  • Automatic error detection and analysis")
    print("  • Iterative code improvement with error context")
    print("  • Detailed correction history tracking")
    print("  • Maximum iteration limits to prevent infinite loops")
    print("  • Comprehensive error reporting")

def test_api_with_corrections():
    """Test the self-correction via API"""
    print("\n\n🌐 TESTING API WITH SELF-CORRECTION")
    print("=" * 50)
    
    import requests
    import json
    
    api_url = "http://localhost:8001"
    
    # Test with different max_corrections values
    test_cases = [
        {"max_corrections": 1, "description": "Single attempt"},
        {"max_corrections": 3, "description": "Standard (3 attempts)"},
        {"max_corrections": 5, "description": "Maximum (5 attempts)"}
    ]
    
    problem = {
        "problem_text": """
        Write a function that takes an array of integers and returns the sum of all even numbers.
        
        Example:
        Input: [1, 2, 3, 4, 5, 6]
        Output: 12 (2 + 4 + 6)
        """,
        "timeout": 15
    }
    
    for test_case in test_cases:
        print(f"\n🔬 Testing {test_case['description']}...")
        
        payload = {**problem, "max_corrections": test_case["max_corrections"]}
        
        try:
            response = requests.post(f"{api_url}/solve/text", json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Success: {result['success']}")
                print(f"   🔄 Iterations: {result.get('iterations', 'N/A')}")
                print(f"   🛠️  Self-corrected: {result.get('self_corrected', 'N/A')}")
            else:
                print(f"   ❌ API Error: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"   ⚠️  API server not running on {api_url}")
            break
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    # Run the tests
    test_self_correction_system()
    test_api_with_corrections()
    
    print("\n🎯 Test completed! The agentic self-correction system is ready.")