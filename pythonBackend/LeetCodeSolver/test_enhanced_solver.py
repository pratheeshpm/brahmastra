#!/usr/bin/env python3
"""
Test script for Enhanced LeetCode Solver
Tests comprehensive analysis features including optimized solutions, explanations, complexity analysis, and brute force comparisons
"""

import requests
import json
import time
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

# API Base URL
BASE_URL = "http://localhost:8001"

def test_enhanced_text_solver():
    """Test enhanced solver with text input"""
    print("🧪 Testing Enhanced LeetCode Solver - Text Input")
    print("=" * 70)
    
    test_problem = """
    Two Sum Problem:
    
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
    
    You may assume that each input would have exactly one solution, and you may not use the same element twice.
    
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
    
    payload = {
        "problem_text": test_problem,
        "max_corrections": 3
    }
    
    try:
        print("📤 Sending enhanced solve request...")
        start_time = time.time()
        
        response = requests.post(f"{BASE_URL}/solve/enhanced", json=payload)
        
        end_time = time.time()
        print(f"⏱️  Request completed in {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Enhanced solution SUCCESS!")
            print(f"🔧 Self-corrected: {result.get('self_corrected', False)}")
            print(f"🔄 Iterations: {result.get('iterations', 1)}")
            
            print("\n" + "="*50)
            print("📝 OPTIMIZED SOLUTION:")
            print("="*50)
            print(result.get('optimized_solution', 'No solution provided')[:500] + "...")
            
            print("\n" + "="*50)
            print("📖 EXPLANATION:")
            print("="*50)
            print(result.get('explanation', 'No explanation provided')[:800] + "...")
            
            print("\n" + "="*50)
            print("📊 COMPLEXITY ANALYSIS:")
            print("="*50)
            print(result.get('complexity_analysis', 'No complexity analysis provided'))
            
            print("\n" + "="*50)
            print("🔨 BRUTE FORCE APPROACH:")
            print("="*50)
            print(result.get('brute_force_approach', 'No brute force analysis provided'))
            
            print("\n" + "="*50)
            print("🧪 TEST CASES COVERED:")
            print("="*50)
            print(result.get('test_cases_covered', 'No test case information provided'))
            
            if result.get('execution_result'):
                print(f"\n🔧 Execution: {'✅ PASSED' if result['execution_result'].get('success') else '❌ FAILED'}")
                if result['execution_result'].get('output'):
                    print("📝 Output preview:")
                    print(result['execution_result']['output'][:300] + "...")
            
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"💥 Test failed with exception: {e}")
        return False

def test_enhanced_example_endpoint():
    """Test enhanced Two Sum example endpoint"""
    print("\n🧪 Testing Enhanced Two Sum Example Endpoint")
    print("=" * 70)
    
    try:
        print("📤 Requesting enhanced Two Sum example...")
        start_time = time.time()
        
        response = requests.get(f"{BASE_URL}/examples/enhanced-two-sum")
        
        end_time = time.time()
        print(f"⏱️  Request completed in {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Enhanced example SUCCESS!")
            
            print(f"\n📊 Analysis Summary:")
            print(f"- Success: {result.get('success', False)}")
            print(f"- Iterations: {result.get('iterations', 'N/A')}")
            print(f"- Self-corrected: {result.get('self_corrected', False)}")
            print(f"- Processing time: {result.get('processing_time', 'N/A')} seconds")
            
            # Show key sections
            sections = [
                ('optimized_solution', 'OPTIMIZED SOLUTION', 300),
                ('explanation', 'EXPLANATION', 400),
                ('complexity_analysis', 'COMPLEXITY ANALYSIS', 200),
                ('brute_force_approach', 'BRUTE FORCE APPROACH', 200),
                ('test_cases_covered', 'TEST CASES COVERED', 200)
            ]
            
            for key, title, preview_len in sections:
                content = result.get(key, 'Not provided')
                print(f"\n📋 {title}:")
                print("-" * (len(title) + 4))
                if len(content) > preview_len:
                    print(content[:preview_len] + "...")
                else:
                    print(content)
            
            return True
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"💥 Test failed with exception: {e}")
        return False

def test_enhanced_vs_basic_comparison():
    """Compare enhanced solver with basic solver"""
    print("\n🧪 Testing Enhanced vs Basic Solver Comparison")
    print("=" * 70)
    
    test_problem = """
    Valid Parentheses:
    
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
    """
    
    payload = {
        "problem_text": test_problem,
        "max_corrections": 2
    }
    
    try:
        print("📤 Testing basic solver...")
        start_time = time.time()
        basic_response = requests.post(f"{BASE_URL}/solve/text", json=payload)
        basic_time = time.time() - start_time
        
        print("📤 Testing enhanced solver...")
        start_time = time.time()
        enhanced_response = requests.post(f"{BASE_URL}/solve/enhanced", json=payload)
        enhanced_time = time.time() - start_time
        
        print(f"\n📊 COMPARISON RESULTS:")
        print("=" * 50)
        
        if basic_response.status_code == 200 and enhanced_response.status_code == 200:
            basic_result = basic_response.json()
            enhanced_result = enhanced_response.json()
            
            print(f"🔧 Basic Solver:")
            print(f"   - Success: {basic_result.get('success', False)}")
            print(f"   - Time: {basic_time:.2f}s")
            print(f"   - Iterations: {basic_result.get('iterations', 'N/A')}")
            print(f"   - Solution length: {len(basic_result.get('solution', '')) if basic_result.get('solution') else 0} chars")
            
            print(f"\n⚡ Enhanced Solver:")
            print(f"   - Success: {enhanced_result.get('success', False)}")
            print(f"   - Time: {enhanced_time:.2f}s")
            print(f"   - Iterations: {enhanced_result.get('iterations', 'N/A')}")
            print(f"   - Solution length: {len(enhanced_result.get('optimized_solution', '')) if enhanced_result.get('optimized_solution') else 0} chars")
            
            print(f"\n🎯 Enhanced Features Available:")
            enhanced_features = [
                ('explanation', 'Detailed Explanation'),
                ('complexity_analysis', 'Complexity Analysis'),
                ('brute_force_approach', 'Brute Force Comparison'),
                ('test_cases_covered', 'Test Case Coverage')
            ]
            
            for key, name in enhanced_features:
                available = "✅" if enhanced_result.get(key) else "❌"
                print(f"   {available} {name}")
            
            return True
        else:
            print("❌ One or both requests failed")
            if basic_response.status_code != 200:
                print(f"Basic solver error: {basic_response.text}")
            if enhanced_response.status_code != 200:
                print(f"Enhanced solver error: {enhanced_response.text}")
            return False
            
    except Exception as e:
        print(f"💥 Comparison test failed: {e}")
        return False

def test_enhanced_image_solver():
    """Test enhanced solver with image input"""
    print("\n🧪 Testing Enhanced LeetCode Solver - Image Input")
    print("=" * 70)
    
    # Use the small test image
    image_path = Path(__file__).parent / "small_leetcode_test.png"
    
    if not image_path.exists():
        print(f"⚠️  Test image not found: {image_path}")
        print("Skipping image test...")
        return False
    
    try:
        print(f"📤 Uploading image: {image_path.name}")
        start_time = time.time()
        
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/solve/enhanced-image", files=files)
        
        end_time = time.time()
        print(f"⏱️  Image processing completed in {end_time - start_time:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Enhanced image analysis SUCCESS!")
            
            print(f"\n📊 Image Analysis Summary:")
            print(f"- Success: {result.get('success', False)}")
            print(f"- Input type: {result.get('input_type', 'N/A')}")
            print(f"- Processing time: {result.get('processing_time', 'N/A')} seconds")
            print(f"- Iterations: {result.get('iterations', 'N/A')}")
            
            if result.get('success'):
                print(f"\n📝 Solution preview:")
                solution = result.get('optimized_solution', 'No solution')
                print(solution[:200] + "..." if len(solution) > 200 else solution)
                
                print(f"\n📖 Explanation preview:")
                explanation = result.get('explanation', 'No explanation')
                print(explanation[:300] + "..." if len(explanation) > 300 else explanation)
            
            return True
        else:
            print(f"❌ Image request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"💥 Image test failed: {e}")
        return False

def check_server_status():
    """Check if the API server is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API Server is running")
            return True
        else:
            print(f"⚠️  Server responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server not reachable: {e}")
        print("🔧 Please start the server with: cd APIServer && python start_server.py")
        return False

def main():
    """Main test function"""
    print("🚀 Enhanced LeetCode Solver Test Suite")
    print("=" * 70)
    
    # Check server status
    if not check_server_status():
        return False
    
    test_results = []
    
    # Run all tests
    tests = [
        ("Enhanced Text Solver", test_enhanced_text_solver),
        ("Enhanced Example Endpoint", test_enhanced_example_endpoint),
        ("Enhanced vs Basic Comparison", test_enhanced_vs_basic_comparison),
        ("Enhanced Image Solver", test_enhanced_image_solver)
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            test_results.append((test_name, result))
        except Exception as e:
            print(f"💥 {test_name} failed with exception: {e}")
            test_results.append((test_name, False))
    
    # Summary
    print("\n🎯 TEST SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} {test_name}")
    
    print(f"\n📊 Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 All enhanced features working perfectly!")
        return True
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)