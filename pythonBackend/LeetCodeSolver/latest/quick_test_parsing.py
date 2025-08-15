#!/usr/bin/env python3
"""
Quick test to verify the parsing logic in enhanced solver with timeout protection
"""

import os
import sys
import signal
import time
from contextlib import contextmanager

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

class TimeoutError(Exception):
    """Custom timeout exception"""
    pass

@contextmanager
def timeout(seconds):
    """Context manager for timeout protection"""
    def signal_handler(signum, frame):
        raise TimeoutError(f"Operation timed out after {seconds} seconds")
    
    # Set the signal handler and a alarm
    old_handler = signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    
    try:
        yield
    finally:
        # Restore the old signal handler and cancel the alarm
        signal.signal(signal.SIGALRM, old_handler)
        signal.alarm(0)

def test_parsing_logic():
    """Test just the parsing logic with timeout protection"""
    MAX_TEST_TIME = 60  # 60 seconds maximum
    
    try:
        print("🧪 Testing Enhanced Solver Parsing Logic")
        print("=" * 50)
        print(f"⏰ Max test time: {MAX_TEST_TIME} seconds")
        
        with timeout(MAX_TEST_TIME):
            from enhanced_leetcode_solver import EnhancedLeetCodeSolver
            
            # Initialize solver
            print("\n🚀 Initializing solver...")
            start_init = time.time()
            solver = EnhancedLeetCodeSolver()
            init_time = time.time() - start_init
            print(f"✅ Solver initialized in {init_time:.2f}s")
            
            # Test simple problem
            simple_problem = "Write a function that takes two integers a and b and returns their sum."
            
            print(f"\n🔄 Testing with simple problem...")
            print(f"📝 Problem: {simple_problem[:50]}...")
            
            start_solve = time.time()
            result = solver.solve_from_text(simple_problem, max_corrections=1)
            solve_time = time.time() - start_solve
            
            print(f"\n📊 Result (completed in {solve_time:.2f}s):")
            print(f"Success: {result.get('success')}")
            print(f"Processing time: {result.get('processing_time', 0):.2f}s")
            
            if result.get('success'):
                print(f"✅ SUCCESS!")
                solution = result.get('optimized_solution', 'No solution')
                print(f"Solution ({len(solution)} chars): {solution}")
                explanation = result.get('explanation', 'No explanation')
                print(f"Explanation: {explanation[:100]}...")
                
                # Test execution result
                exec_result = result.get('execution_result', {})
                if exec_result.get('success'):
                    print("🧪 JavaScript execution: ✅ PASSED")
                else:
                    print("🧪 JavaScript execution: ❌ FAILED")
                    print(f"   Error: {exec_result.get('error', 'Unknown')[:100]}...")
                    
            else:
                print(f"❌ FAILED: {result.get('error', 'Unknown error')}")
                if result.get('optimized_solution'):
                    print(f"Extracted code: {result.get('optimized_solution')}")
            
            # Cleanup
            print("\n🧹 Cleaning up...")
            solver.cleanup()
            
            return result.get('success', False)
        
    except TimeoutError as e:
        print(f"\n⏰ {e}")
        print("🛑 Test was terminated due to timeout")
        return False
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_with_multiple_timeouts():
    """Test different scenarios with various timeout settings"""
    print("\n🔬 Testing Multiple Timeout Scenarios")
    print("=" * 50)
    
    test_cases = [
        {
            "name": "Quick Addition Test",
            "problem": "Write a function that adds two numbers.",
            "timeout": 30,
            "max_corrections": 1
        },
        {
            "name": "Two Sum Problem", 
            "problem": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "timeout": 45,
            "max_corrections": 2
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test Case {i}: {test_case['name']}")
        print(f"⏰ Timeout: {test_case['timeout']}s")
        print("-" * 40)
        
        try:
            with timeout(test_case['timeout']):
                from enhanced_leetcode_solver import EnhancedLeetCodeSolver
                
                solver = EnhancedLeetCodeSolver()
                start_time = time.time()
                
                result = solver.solve_from_text(
                    test_case['problem'], 
                    max_corrections=test_case['max_corrections']
                )
                
                elapsed = time.time() - start_time
                success = result.get('success', False)
                
                print(f"✅ Completed in {elapsed:.2f}s - {'SUCCESS' if success else 'FAILED'}")
                results.append({"name": test_case['name'], "success": success, "time": elapsed})
                
                solver.cleanup()
                
        except TimeoutError:
            print(f"⏰ Test timed out after {test_case['timeout']}s")
            results.append({"name": test_case['name'], "success": False, "time": test_case['timeout']})
        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
            results.append({"name": test_case['name'], "success": False, "time": -1})
    
    # Summary
    print(f"\n📊 SUMMARY")
    print("=" * 40)
    passed = sum(1 for r in results if r['success'])
    total = len(results)
    
    for result in results:
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        time_str = f"{result['time']:.2f}s" if result['time'] >= 0 else "ERROR"
        print(f"{status} {result['name']} ({time_str})")
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    return passed == total

if __name__ == "__main__":
    success = test_parsing_logic()
    print(f"\n🏁 Test {'PASSED' if success else 'FAILED'}")