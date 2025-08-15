#!/usr/bin/env python3
"""
Test client for the LeetCode Solver API
Tests all API endpoints to verify functionality
"""

import requests
import json
import time
import base64
from pathlib import Path

BASE_URL = "http://localhost:8001"

def test_api_endpoints():
    """Test all API endpoints"""
    print("🧪 Testing LeetCode Solver API")
    print("=" * 50)
    
    # Test 1: Root endpoint
    try:
        print("1️⃣ Testing root endpoint...")
        response = requests.get(f"{BASE_URL}/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
            print("   ✅ Root endpoint working")
        else:
            print("   ❌ Root endpoint failed")
    except Exception as e:
        print(f"   ❌ Root endpoint error: {e}")
    
    # Test 2: Health check
    try:
        print("\n2️⃣ Testing health endpoint...")
        response = requests.get(f"{BASE_URL}/health")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            health_data = response.json()
            print(f"   Status: {health_data['status']}")
            print("   ✅ Health endpoint working")
        else:
            print("   ❌ Health endpoint failed")
    except Exception as e:
        print(f"   ❌ Health endpoint error: {e}")
    
    # Test 3: System info
    try:
        print("\n3️⃣ Testing system info endpoint...")
        response = requests.get(f"{BASE_URL}/system-info")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            sys_info = response.json()
            print(f"   Python: {sys_info['python_version']}")
            print(f"   Node.js: {sys_info['nodejs_version']}")
            print(f"   API Key: {'✅' if sys_info['openai_api_key_configured'] else '❌'}")
            print("   ✅ System info endpoint working")
        else:
            print("   ❌ System info endpoint failed")
    except Exception as e:
        print(f"   ❌ System info endpoint error: {e}")
    
    # Test 4: Two Sum example
    try:
        print("\n4️⃣ Testing Two Sum example...")
        response = requests.get(f"{BASE_URL}/examples/two-sum")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print("   ✅ Two Sum solved successfully!")
                print(f"   Processing time: {result.get('processing_time', 'Unknown')}s")
                solution_preview = result['solution'][:100] + "..." if len(result['solution']) > 100 else result['solution']
                print(f"   Solution preview: {solution_preview}")
            else:
                print(f"   ❌ Two Sum failed: {result['error']}")
        else:
            print("   ❌ Two Sum endpoint failed")
    except Exception as e:
        print(f"   ❌ Two Sum endpoint error: {e}")
    
    # Test 5: Text problem solving
    try:
        print("\n5️⃣ Testing text problem solving...")
        test_problem = {
            "problem_text": "Write a function that returns the sum of two numbers. Input: add(2, 3) should return 5"
        }
        
        response = requests.post(
            f"{BASE_URL}/solve/text",
            json=test_problem,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                print("   ✅ Text problem solved successfully!")
                print(f"   Processing time: {result.get('processing_time', 'Unknown')}s")
                solution_preview = result['solution'][:100] + "..." if len(result['solution']) > 100 else result['solution']
                print(f"   Solution preview: {solution_preview}")
            else:
                print(f"   ❌ Text problem failed: {result['error']}")
        else:
            print(f"   ❌ Text problem endpoint failed: {response.text}")
    except Exception as e:
        print(f"   ❌ Text problem endpoint error: {e}")
    
    # Test 6: Image upload (if sample image exists)
    try:
        print("\n6️⃣ Testing image upload...")
        image_path = Path("sampleLCQ.png")
        
        if image_path.exists():
            with open(image_path, "rb") as f:
                files = {"file": ("sampleLCQ.png", f, "image/png")}
                response = requests.post(f"{BASE_URL}/solve/image", files=files)
            
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                if result['success']:
                    print("   ✅ Image problem solved successfully!")
                    print(f"   Processing time: {result.get('processing_time', 'Unknown')}s")
                else:
                    print(f"   ❌ Image problem failed: {result['error']}")
            else:
                print(f"   ❌ Image upload failed: {response.text}")
        else:
            print("   ⚠️  Sample image not found, skipping image test")
    except Exception as e:
        print(f"   ❌ Image upload error: {e}")
    
    print("\n🎉 API testing completed!")

def wait_for_server(max_attempts=10):
    """Wait for the server to be ready"""
    print("⏳ Waiting for API server to start...")
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=2)
            if response.status_code == 200:
                print("✅ Server is ready!")
                return True
        except:
            pass
        
        print(f"   Attempt {attempt + 1}/{max_attempts}...")
        time.sleep(2)
    
    print("❌ Server did not start within expected time")
    return False

if __name__ == "__main__":
    if wait_for_server():
        test_api_endpoints()
    else:
        print("❌ Cannot test API - server not responding")
        print("\n💡 To start the server manually:")
        print("   cd pythonBackend")
        print("   conda activate praisonchat")
        print("   python api_server.py")