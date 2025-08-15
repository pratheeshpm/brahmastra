#!/usr/bin/env python3
"""
Quick test of the simplified LeetCode solver
"""

import os
from simplified_leetcode_solver import SimplifiedLeetCodeSolver

def test_solver():
    """Test the solver with a simple problem"""
    print("🚀 Quick Test of LeetCode Solver")
    print("=" * 40)
    
    try:
        # Initialize solver
        solver = SimplifiedLeetCodeSolver()
        
        # Simple test problem
        test_problem = """
        Write a function that adds two numbers.
        
        Example:
        add(2, 3) should return 5
        add(10, 15) should return 25
        """
        
        print("🧪 Testing with simple addition problem...")
        result = solver.solve_from_text(test_problem)
        
        if result["success"]:
            print("✅ Test completed successfully!")
            print("\n📝 Generated solution:")
            print(result["solution"])
            
            if result["execution_result"]["success"]:
                print("\n🎉 Solution executed and validated!")
                print("Test output:")
                print(result["execution_result"]["stdout"])
            else:
                print("\n⚠️ Solution generated but execution had issues:")
                print(result["execution_result"]["stderr"])
        else:
            print("❌ Test failed:")
            print(result["error"])
            
    except Exception as e:
        print(f"❌ Test crashed: {e}")

if __name__ == "__main__":
    test_solver()