#!/usr/bin/env python3
"""
Test the fixed enhanced solver to verify it works correctly
"""

import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from LeetCodeSolver.enhanced_leetcode_solver import EnhancedLeetCodeSolver

def test_enhanced_solver():
    """Test the enhanced solver with a simple problem"""
    print("🧪 Testing Enhanced LeetCode Solver")
    print("=" * 50)
    
    try:
        # Initialize solver
        solver = EnhancedLeetCodeSolver()
        
        # Simple Two Sum problem
        problem = """
        Two Sum Problem:
        Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
        Example: Input: nums = [2,7,11,15], target = 9, Output: [0,1]
        """
        
        print("📝 Testing with Two Sum problem...")
        result = solver.solve_from_text(problem, max_corrections=1)
        
        print(f"\n📊 Results:")
        print(f"Success: {result.get('success', False)}")
        print(f"Processing time: {result.get('processing_time', 0):.2f}s")
        print(f"Iterations: {result.get('iterations', 0)}")
        print(f"Self-corrected: {result.get('self_corrected', False)}")
        
        if result.get('success'):
            print(f"\n✅ Optimized solution found!")
            print(f"Solution length: {len(result.get('optimized_solution', ''))}")
            print(f"Solution preview: {result.get('optimized_solution', '')[:200]}...")
        else:
            print(f"\n❌ Failed: {result.get('error', 'Unknown error')}")
            # Debug: show what was extracted
            if result.get('optimized_solution'):
                print(f"Extracted solution ({len(result['optimized_solution'])} chars):")
                print(f"'{result['optimized_solution']}'")
            else:
                print("No solution was extracted.")
            
            print(f"\n📋 Has explanation: {'Yes' if result.get('explanation') else 'No'}")
            print(f"📊 Has complexity analysis: {'Yes' if result.get('complexity_analysis') else 'No'}")
            print(f"🔍 Has brute force approach: {'Yes' if result.get('brute_force_approach') else 'No'}")
            print(f"🧪 Has test cases covered: {'Yes' if result.get('test_cases_covered') else 'No'}")
            
            if result.get('execution_result'):
                exec_result = result['execution_result']
                print(f"\n⚡ Execution successful: {exec_result.get('success', False)}")
                if exec_result.get('output'):
                    print(f"Output preview: {exec_result['output'][:200]}...")
        else:
            print(f"\n❌ Failed: {result.get('error', 'Unknown error')}")
            if result.get('correction_history'):
                print(f"Correction attempts: {len(result['correction_history'])}")
                print("Last error:", result['correction_history'][-1][:200] if result['correction_history'] else 'None')
        
        # Cleanup
        solver.cleanup()
        
        return result.get('success', False)
        
    except Exception as e:
        print(f"💥 Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_enhanced_solver()
    exit(0 if success else 1)