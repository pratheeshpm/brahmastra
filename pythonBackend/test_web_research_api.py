#!/usr/bin/env python3
"""
Test script for Web Research API endpoints with proper timeout handling
"""
import os
import sys
import time
import signal
import subprocess
import requests
import json
from contextlib import contextmanager

@contextmanager
def timeout(duration):
    """Context manager for timeout handling"""
    def timeout_handler(signum, frame):
        raise TimeoutError(f"Operation timed out after {duration} seconds")
    
    # Set the signal handler
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(duration)
    try:
        yield
    finally:
        signal.alarm(0)

def kill_existing_servers():
    """Kill any existing API server processes"""
    try:
        subprocess.run(["pkill", "-f", "api_server"], check=False, capture_output=True)
        subprocess.run(["pkill", "-f", "uvicorn"], check=False, capture_output=True)
        time.sleep(2)
        print("✅ Existing processes killed")
    except Exception as e:
        print(f"⚠️ Error killing processes: {e}")

def start_api_server():
    """Start the API server with timeout"""
    try:
        with timeout(30):
            print("🚀 Starting API server...")
            
            # Change to APIServer directory and start server
            env = os.environ.copy()
            
            # Start the server in background
            process = subprocess.Popen([
                "/opt/miniconda3/envs/praisonchat/bin/python", 
                "APIServer/api_server.py"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
            
            # Wait for server to start
            for i in range(20):  # Wait up to 20 seconds
                try:
                    response = requests.get("http://localhost:8000/health", timeout=2)
                    if response.status_code == 200:
                        print("✅ API server started successfully")
                        return process
                except requests.exceptions.RequestException:
                    pass
                time.sleep(1)
            
            # If we get here, server didn't start
            process.kill()
            raise TimeoutError("Server failed to start within 20 seconds")
            
    except TimeoutError as e:
        print(f"❌ Server startup timeout: {e}")
        return None
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return None

def test_web_research_endpoints():
    """Test all web research endpoints"""
    base_url = "http://localhost:8000"
    
    tests = [
        ("GET", "/health", None, "Health check"),
        ("GET", "/research/prompts", None, "Get available prompts"),
        ("GET", "/research/categories", None, "Get prompt categories"),
        ("GET", "/examples/research-microservices", None, "Example research endpoint"),
    ]
    
    results = {}
    
    for method, endpoint, data, description in tests:
        try:
            with timeout(15):
                print(f"🧪 Testing {description}: {method} {endpoint}")
                
                if method == "GET":
                    response = requests.get(f"{base_url}{endpoint}", timeout=10)
                else:
                    response = requests.post(f"{base_url}{endpoint}", json=data, timeout=10)
                
                results[endpoint] = {
                    "status_code": response.status_code,
                    "success": response.status_code < 400,
                    "response_size": len(response.text),
                    "description": description
                }
                
                if response.status_code == 200:
                    print(f"✅ {description}: SUCCESS")
                    # Try to parse JSON if possible
                    try:
                        json_data = response.json()
                        if endpoint == "/research/prompts" and "prompts" in json_data:
                            print(f"   Found {len(json_data['prompts'])} prompts")
                        elif endpoint == "/research/categories" and "categories" in json_data:
                            print(f"   Found {len(json_data['categories'])} categories")
                    except:
                        pass
                else:
                    print(f"❌ {description}: FAILED (Status: {response.status_code})")
                    print(f"   Response: {response.text[:200]}...")
                    
        except TimeoutError:
            print(f"⏰ {description}: TIMEOUT")
            results[endpoint] = {"status_code": None, "success": False, "error": "timeout"}
        except Exception as e:
            print(f"❌ {description}: ERROR - {e}")
            results[endpoint] = {"status_code": None, "success": False, "error": str(e)}
    
    return results

def test_prompts_functionality():
    """Test the prompts library functionality directly"""
    try:
        with timeout(10):
            print("\\n🧪 Testing prompts library directly...")
            sys.path.append('.')
            
            from WebResearchEngine.research_prompts import ResearchPromptsLibrary
            
            library = ResearchPromptsLibrary()
            prompts = library.list_all_prompts()
            categories = library.get_categories()
            
            print(f"✅ Direct prompts test: {len(prompts)} prompts, {len(categories)} categories")
            
            # Test auto-selection
            test_query = "How to design a React component library?"
            selected = library.auto_select_prompt(test_query)
            print(f"✅ Auto-selection test: '{test_query}' -> {selected.name}")
            
            return True
            
    except TimeoutError:
        print("⏰ Prompts library test: TIMEOUT")
        return False
    except Exception as e:
        print(f"❌ Prompts library test: ERROR - {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Web Research API Test Suite")
    print("=" * 60)
    
    # Kill existing servers
    kill_existing_servers()
    
    # Test prompts library directly first
    prompts_working = test_prompts_functionality()
    
    if not prompts_working:
        print("❌ Prompts library not working, skipping API tests")
        return False
    
    # Start API server
    server_process = start_api_server()
    
    if not server_process:
        print("❌ Failed to start API server")
        return False
    
    try:
        # Test endpoints
        print("\\n🧪 Testing Web Research API Endpoints...")
        results = test_web_research_endpoints()
        
        # Summary
        print("\\n📊 Test Summary:")
        print("-" * 40)
        
        working_endpoints = [ep for ep, result in results.items() if result.get("success", False)]
        failed_endpoints = [ep for ep, result in results.items() if not result.get("success", False)]
        
        print(f"✅ Working endpoints: {len(working_endpoints)}")
        for ep in working_endpoints:
            print(f"   {ep}")
            
        print(f"❌ Failed endpoints: {len(failed_endpoints)}")
        for ep in failed_endpoints:
            error = results[ep].get("error", f"Status {results[ep].get('status_code', 'Unknown')}")
            print(f"   {ep} - {error}")
        
        success = len(working_endpoints) >= 2  # At least health + one research endpoint
        
        if success:
            print("\\n🎉 Web Research API is working!")
        else:
            print("\\n❌ Web Research API has issues")
            
        return success
        
    finally:
        # Clean up
        try:
            server_process.kill()
            print("\\n🧹 Server process killed")
        except:
            pass

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\\n⏹️ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\\n💥 Unexpected error: {e}")
        sys.exit(1)