#!/usr/bin/env python3
"""
Direct Test for Enhanced LeetCode Solver
Tests the enhanced_leetcode_solver.py directly without API layer
"""

import os
import sys
import json
import time
import signal
from datetime import datetime
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

def test_enhanced_solver_direct():
    """Test the EnhancedLeetCodeSolver directly"""
    print("🧪 Testing Enhanced LeetCode Solver Directly")
    print("=" * 60)
    
    try:
        # Import the solver
        from enhanced_leetcode_solver import EnhancedLeetCodeSolver
        
        print("✅ Successfully imported EnhancedLeetCodeSolver")
        
        # Initialize the solver
        print("\n🚀 Initializing solver...")
        solver = EnhancedLeetCodeSolver()
        print("✅ Solver initialized successfully")
        
        # Test 1: Text-based Two Sum problem
        print("\n" + "="*50)
        print("🧪 TEST 1: Two Sum Problem (Text Input)")
        print("="*50)
        
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
        2 <= nums.length <= 10^4
        -10^9 <= nums[i] <= 10^9
        -10^9 <= target <= 10^9
        Only one valid answer exists.
        """
        
        try:
            with timeout(90):  # 90 seconds timeout for complex problems
                start_time = time.time()
                result = solver.solve_from_text(two_sum_problem, max_corrections=3)
                end_time = time.time()
                
                print(f"\n⏱️  Processing time: {end_time - start_time:.2f} seconds")
                print_test_result("Two Sum (Text)", result)
        except TimeoutError:
            print(f"\n⏰ Test 1 timed out after 90 seconds")
            result = {"success": False, "error": "Timeout after 90 seconds"}
        
        # Test 2: Valid Parentheses problem (more complex)
        print("\n" + "="*50)
        print("🧪 TEST 2: Valid Parentheses Problem (Text Input)")
        print("="*50)
        
        parentheses_problem = """
        Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', 
        determine if the input string is valid.

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
        result2 = solver.solve_from_text(parentheses_problem, max_corrections=3)
        end_time = time.time()
        
        print(f"\n⏱️  Processing time: {end_time - start_time:.2f} seconds")
        print_test_result("Valid Parentheses (Text)", result2)
        
        # Test 3: Image-based problem (if small test image exists)
        image_path = "small_leetcode_test.png"
        if os.path.exists(image_path):
            print("\n" + "="*50)
            print("🧪 TEST 3: Image-based Problem")
            print("="*50)
            
            start_time = time.time()
            result3 = solver.solve_from_image(image_path, max_corrections=2)
            end_time = time.time()
            
            print(f"\n⏱️  Processing time: {end_time - start_time:.2f} seconds")
            print_test_result("Two Sum (Image)", result3)
        else:
            print("\n⚠️  Skipping image test - small_leetcode_test.png not found")
        
        # Test 4: Edge case - Very simple problem
        print("\n" + "="*50)
        print("🧪 TEST 4: Simple Addition Problem")
        print("="*50)
        
        simple_problem = """
        Write a function that takes two integers a and b and returns their sum.
        
        Example:
        Input: a = 3, b = 5
        Output: 8
        
        Constraints:
        -1000 <= a, b <= 1000
        """
        
        start_time = time.time()
        result4 = solver.solve_from_text(simple_problem, max_corrections=2)
        end_time = time.time()
        
        print(f"\n⏱️  Processing time: {end_time - start_time:.2f} seconds")
        print_test_result("Simple Addition", result4)
        
        # Cleanup
        solver.cleanup()
        
        # Summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        tests = [
            ("Two Sum (Text)", result),
            ("Valid Parentheses (Text)", result2),
            ("Simple Addition", result4)
        ]
        
        if os.path.exists(image_path):
            tests.append(("Two Sum (Image)", result3))
        
        passed = 0
        total = len(tests)
        
        for test_name, test_result in tests:
            status = "✅ PASSED" if test_result.get('success') else "❌ FAILED"
            print(f"{status} - {test_name}")
            if test_result.get('success'):
                passed += 1
                if test_result.get('self_corrected'):
                    print(f"   🔄 Self-corrected after {test_result.get('iterations', 1)} iterations")
        
        print(f"\n📈 Overall Results: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
        
        if passed == total:
            print("🎉 All tests passed! Enhanced solver is working correctly.")
        else:
            print("⚠️  Some tests failed. Review the error details above.")
        
        return passed == total
        
    except Exception as e:
        print(f"❌ Test setup failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def print_test_result(test_name: str, result: dict):
    """Print detailed test result"""
    print(f"\n📋 {test_name} Results:")
    print("-" * 40)
    
    if result.get('success'):
        print("✅ SUCCESS")
        print(f"📝 Iterations: {result.get('iterations', 1)}")
        print(f"🔄 Self-corrected: {'Yes' if result.get('self_corrected') else 'No'}")
        print(f"⏱️  Processing time: {result.get('processing_time', 0):.2f}s")
        
        # Show solution preview
        solution = result.get('optimized_solution', '')
        if solution:
            print(f"💻 Solution length: {len(solution)} characters")
            preview = solution[:200] + "..." if len(solution) > 200 else solution
            print(f"👀 Solution preview:\n{preview}")
        
        # Show comprehensive analysis
        if result.get('explanation'):
            explanation = result['explanation'][:300] + "..." if len(result['explanation']) > 300 else result['explanation']
            print(f"📚 Explanation preview: {explanation}")
        
        if result.get('complexity_analysis'):
            print(f"⚡ Complexity: {result['complexity_analysis'][:100]}...")
        
        # Show execution result
        exec_result = result.get('execution_result', {})
        if exec_result.get('success'):
            print("🧪 JavaScript execution: ✅ PASSED")
        else:
            print("🧪 JavaScript execution: ❌ FAILED")
            if exec_result.get('error'):
                print(f"   Error: {exec_result['error'][:100]}...")
    else:
        print("❌ FAILED")
        print(f"💥 Error: {result.get('error', 'Unknown error')}")
        
        # Show partial results if any
        if result.get('optimized_solution'):
            print(f"📝 Partial solution extracted ({len(result['optimized_solution'])} chars)")
        
        if result.get('iterations'):
            print(f"🔄 Failed after {result['iterations']} iterations")
        
        if result.get('correction_history'):
            print(f"📜 Correction attempts: {len(result['correction_history'])}")

def test_solver_components():
    """Test individual components of the solver"""
    print("\n🔧 Testing Solver Components")
    print("=" * 50)
    
    try:
        from enhanced_leetcode_solver import EnvironmentManager, JavaScriptExecutor
        
        # Test environment manager
        print("🌍 Testing EnvironmentManager...")
        requirements = EnvironmentManager.check_system_requirements()
        print(f"   ✅ System requirements check completed")
        print(f"   - Node.js: {'✅' if requirements.get('nodejs') else '❌'}")
        print(f"   - Python: {'✅' if requirements.get('python') else '❌'}")
        
        # Test JavaScript executor
        print("\n🚀 Testing JavaScriptExecutor...")
        executor = JavaScriptExecutor()
        
        # Simple JavaScript test
        test_js = """
        function testFunction(x, y) {
            return x + y;
        }
        
        console.log("Test result:", testFunction(2, 3));
        """
        
        exec_result = executor.execute_code(test_js)
        print(f"   JavaScript execution: {'✅ PASSED' if exec_result['success'] else '❌ FAILED'}")
        
        if exec_result['success']:
            print(f"   Output: {exec_result['output'][:100]}...")
        else:
            print(f"   Error: {exec_result['error'][:100]}...")
        
        executor.cleanup()
        
        return True
        
    except Exception as e:
        print(f"❌ Component test failed: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 ENHANCED LEETCODE SOLVER - COMPREHENSIVE DIRECT TEST")
    print("=" * 70)
    print(f"📅 Test started at: {datetime.now().isoformat()}")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🐍 Python version: {sys.version.split()[0]}")
    
    # Check if we're in the right directory
    if not os.path.exists('enhanced_leetcode_solver.py'):
        print("❌ enhanced_leetcode_solver.py not found in current directory")
        print("💡 Please run this test from the directory containing enhanced_leetcode_solver.py")
        return False
    
    # Test components first
    components_ok = test_solver_components()
    
    if not components_ok:
        print("❌ Component tests failed. Cannot proceed with full tests.")
        return False
    
    # Run main tests
    main_tests_ok = test_enhanced_solver_direct()
    
    print(f"\n📅 Test completed at: {datetime.now().isoformat()}")
    
    if components_ok and main_tests_ok:
        print("🎉 ALL TESTS PASSED! Enhanced solver is ready for production.")
        return True
    else:
        print("⚠️  Some tests failed. Review the output above for details.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)