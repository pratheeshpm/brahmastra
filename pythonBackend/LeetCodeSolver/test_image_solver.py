#!/usr/bin/env python3
"""
Comprehensive Image-based LeetCode Problem Solver Test
Tests the sampleLCQ.png image with cross-verification
"""

import requests
import json
import time
import base64
from pathlib import Path
import sys

# Server configuration
BASE_URL = "http://localhost:8001"
IMAGE_PATH = "small_leetcode_test.png"

def test_server_health():
    """Check if the API server is running and healthy"""
    print("🔍 Checking server health...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✅ Server status: {health_data['status']}")
            print(f"   🐍 Python: {health_data['system_info']['python_version']}")
            print(f"   🟢 Node.js: {health_data['system_info']['nodejs_version']}")
            print(f"   🔑 API Key: {'✅' if health_data['system_info']['openai_api_key_configured'] else '❌'}")
            return True
        else:
            print(f"   ❌ Server unhealthy: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Server not responding: {e}")
        return False

def test_image_upload_method():
    """Test solving the sample image using file upload"""
    print("\n📤 Testing Image Upload Method...")
    print("=" * 60)
    
    if not Path(IMAGE_PATH).exists():
        print(f"   ❌ Image file not found: {IMAGE_PATH}")
        return None
    
    try:
        with open(IMAGE_PATH, "rb") as f:
            files = {"file": ("sampleLCQ.png", f, "image/png")}
            
            print(f"   📁 Uploading: {IMAGE_PATH} ({Path(IMAGE_PATH).stat().st_size / 1024:.1f}KB)")
            start_time = time.time()
            
            response = requests.post(
                f"{BASE_URL}/solve/image", 
                files=files,
                timeout=60  # Longer timeout for image processing
            )
            
            end_time = time.time()
            print(f"   ⏱️  Request completed in: {end_time - start_time:.2f}s")
            print(f"   📊 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"   🎯 Success: {result['success']}")
                
                if result['success']:
                    print(f"   ⏱️  Processing Time: {result.get('processing_time', 'Unknown')}s")
                    print(f"   📝 Solution Length: {len(result['solution'])} characters")
                    
                    # Show solution preview
                    solution_preview = result['solution'][:200] + "..." if len(result['solution']) > 200 else result['solution']
                    print(f"   💻 Solution Preview:")
                    print("   " + "─" * 50)
                    for line in solution_preview.split('\n')[:10]:
                        print(f"   │ {line}")
                    if len(result['solution'].split('\n')) > 10:
                        print("   │ ...")
                    print("   " + "─" * 50)
                    
                    # Show execution results if available
                    if result.get('execution_result'):
                        exec_result = result['execution_result']
                        print(f"   🧪 Execution: {'✅ Success' if exec_result.get('success') else '❌ Failed'}")
                        if exec_result.get('output'):
                            print(f"   📤 Output: {exec_result['output'][:100]}...")
                    
                    return result
                else:
                    print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
                    return result
            else:
                print(f"   ❌ HTTP Error: {response.text[:200]}...")
                return None
                
    except Exception as e:
        print(f"   ❌ Upload failed: {e}")
        return None

def test_base64_method():
    """Test solving the sample image using base64 encoding"""
    print("\n🔢 Testing Base64 Method...")
    print("=" * 60)
    
    if not Path(IMAGE_PATH).exists():
        print(f"   ❌ Image file not found: {IMAGE_PATH}")
        return None
    
    try:
        # Read and encode image
        with open(IMAGE_PATH, "rb") as f:
            image_bytes = f.read()
            
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        print(f"   📁 Encoded image: {len(image_base64)} characters")
        
        # Send request
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/solve/base64",
            json={"image_data": image_base64},
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        end_time = time.time()
        print(f"   ⏱️  Request completed in: {end_time - start_time:.2f}s")
        print(f"   📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   🎯 Success: {result['success']}")
            
            if result['success']:
                print(f"   ⏱️  Processing Time: {result.get('processing_time', 'Unknown')}s")
                print(f"   📝 Solution Length: {len(result['solution'])} characters")
                return result
            else:
                print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
                return result
        else:
            print(f"   ❌ HTTP Error: {response.text[:200]}...")
            return None
            
    except Exception as e:
        print(f"   ❌ Base64 test failed: {e}")
        return None

def cross_verify_solutions(upload_result, base64_result):
    """Cross-verify solutions from both methods"""
    print("\n🔍 Cross-Verification Analysis...")
    print("=" * 60)
    
    if not upload_result or not base64_result:
        print("   ⚠️  Cannot cross-verify: One or both methods failed")
        return
    
    if not upload_result.get('success') or not base64_result.get('success'):
        print("   ⚠️  Cannot cross-verify: One or both solutions failed")
        
        # Show error details if available
        if not upload_result.get('success'):
            print(f"   📤 Upload Error: {upload_result.get('error', 'Unknown')}")
        if not base64_result.get('success'):
            print(f"   🔢 Base64 Error: {base64_result.get('error', 'Unknown')}")
        return
    
    # Compare solutions
    upload_solution = upload_result.get('solution', '')
    base64_solution = base64_result.get('solution', '')
    
    print(f"   📤 Upload Method Solution: {len(upload_solution)} characters")
    print(f"   🔢 Base64 Method Solution: {len(base64_solution)} characters")
    
    if upload_solution == base64_solution:
        print("   ✅ PERFECT MATCH: Both methods produced identical solutions!")
    else:
        print("   ⚠️  DIFFERENT SOLUTIONS: Methods produced different results")
        
        # Calculate similarity
        similarity = calculate_similarity(upload_solution, base64_solution)
        print(f"   📊 Similarity: {similarity:.1f}%")
        
        # Show first few lines of each solution for comparison
        print("\n   📤 Upload Solution (first 5 lines):")
        for i, line in enumerate(upload_solution.split('\n')[:5]):
            print(f"   │ {i+1:2d}: {line}")
        
        print("\n   🔢 Base64 Solution (first 5 lines):")
        for i, line in enumerate(base64_solution.split('\n')[:5]):
            print(f"   │ {i+1:2d}: {line}")
    
    # Compare processing times
    upload_time = upload_result.get('processing_time', 0)
    base64_time = base64_result.get('processing_time', 0)
    
    print(f"\n   ⏱️  Processing Time Comparison:")
    print(f"   📤 Upload Method: {upload_time:.2f}s")
    print(f"   🔢 Base64 Method: {base64_time:.2f}s")
    
    if upload_time > 0 and base64_time > 0:
        faster_method = "Upload" if upload_time < base64_time else "Base64"
        time_diff = abs(upload_time - base64_time)
        print(f"   🏆 {faster_method} method was {time_diff:.2f}s faster")

def calculate_similarity(text1, text2):
    """Calculate simple similarity percentage between two texts"""
    if not text1 and not text2:
        return 100.0
    if not text1 or not text2:
        return 0.0
    
    # Simple character-level similarity
    min_len = min(len(text1), len(text2))
    max_len = max(len(text1), len(text2))
    
    if max_len == 0:
        return 100.0
    
    matches = sum(1 for i in range(min_len) if text1[i] == text2[i])
    return (matches / max_len) * 100

def test_direct_solver():
    """Test the solver directly (without API) for comparison"""
    print("\n🔬 Testing Direct Solver (Non-API)...")
    print("=" * 60)
    
    try:
        from simplified_leetcode_solver import SimplifiedLeetCodeSolver
        
        print("   🤖 Initializing direct solver...")
        solver = SimplifiedLeetCodeSolver()
        
        print(f"   📁 Processing image: {IMAGE_PATH}")
        start_time = time.time()
        
        result = solver.solve_from_image(IMAGE_PATH)
        
        end_time = time.time()
        print(f"   ⏱️  Direct processing time: {end_time - start_time:.2f}s")
        print(f"   🎯 Success: {result['success']}")
        
        if result['success']:
            print(f"   📝 Solution Length: {len(result['solution'])} characters")
            return result
        else:
            print(f"   ❌ Failed: {result.get('error', 'Unknown error')}")
            return result
            
    except Exception as e:
        print(f"   ❌ Direct solver test failed: {e}")
        return None

def main():
    """Main test execution"""
    print("🧪 COMPREHENSIVE IMAGE SOLVER TEST")
    print("Using sampleLCQ.png for cross-verification")
    print("=" * 80)
    
    # Check server health
    if not test_server_health():
        print("\n❌ Server is not healthy. Please start the server first:")
        print("   /opt/miniconda3/envs/praisonchat/bin/python start_server.py")
        return 1
    
    # Test both API methods
    upload_result = test_image_upload_method()
    base64_result = test_base64_method()
    
    # Cross-verify results
    cross_verify_solutions(upload_result, base64_result)
    
    # Test direct solver for additional verification
    direct_result = test_direct_solver()
    
    # Final summary
    print("\n📋 FINAL SUMMARY")
    print("=" * 60)
    
    methods = [
        ("📤 Upload Method", upload_result),
        ("🔢 Base64 Method", base64_result),
        ("🔬 Direct Solver", direct_result)
    ]
    
    successful_methods = 0
    for name, result in methods:
        if result and result.get('success'):
            successful_methods += 1
            print(f"   ✅ {name}: SUCCESS")
        else:
            error = result.get('error', 'Failed') if result else 'Failed'
            print(f"   ❌ {name}: {error}")
    
    print(f"\n🎯 Success Rate: {successful_methods}/3 methods working")
    
    if successful_methods >= 2:
        print("🎉 IMAGE SOLVER IS WORKING CORRECTLY!")
        return 0
    else:
        print("⚠️  IMAGE SOLVER NEEDS ATTENTION")
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)