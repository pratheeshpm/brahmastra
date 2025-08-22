#!/usr/bin/env python3
"""
Debug script for enhanced LeetCode solver
"""

import sys
import os
sys.path.append('pythonBackend/LeetCodeSolver/latest')

from enhanced_leetcode_solver import EnhancedLeetCodeSolver

def test_enhanced_solver():
    print("🧪 Testing Enhanced LeetCode Solver...")
    
    try:
        solver = EnhancedLeetCodeSolver()
        print("✅ Solver initialized successfully")
        
        # Test with the Two Sum problem
        problem = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
        
        print(f"\n📝 Testing problem: {problem}")
        result = solver.solve_from_text(problem, max_corrections=1)
        
        print(f"\n📊 Result summary:")
        print(f"Success: {result.get('success', False)}")
        print(f"Solution length: {len(result.get('optimized_solution', ''))}")
        print(f"Solution: {result.get('optimized_solution', 'None')}")
        
        if result.get('error'):
            print(f"Error: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_enhanced_solver()
