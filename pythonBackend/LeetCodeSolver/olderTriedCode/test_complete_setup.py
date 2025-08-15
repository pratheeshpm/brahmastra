#!/usr/bin/env python3
"""
Complete test script for the LeetCode Problem Solver
Tests all functionality without requiring user interaction
"""

import os
import sys
import asyncio
from typing import Dict, Any
import time

def test_environment_setup():
    """Test environment variables and system setup"""
    print("🔧 TESTING ENVIRONMENT SETUP")
    print("=" * 50)
    
    # Test API key retrieval
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key:
        print(f"✅ OpenAI API Key found: {api_key[:15]}...")
        if api_key.startswith('sk-') and len(api_key) > 20:
            print("✅ API key format looks valid")
        else:
            print("⚠️  API key format might be invalid")
    else:
        print("❌ No OpenAI API key found")
        return False
    
    # Test Python version
    python_version = sys.version_info
    if python_version >= (3, 8):
        print(f"✅ Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    else:
        print(f"❌ Python version too old: {python_version}")
        return False
    
    # Test conda environment
    conda_env = os.getenv('CONDA_DEFAULT_ENV', 'Unknown')
    print(f"📦 Conda environment: {conda_env}")
    
    # Test Node.js
    try:
        import subprocess
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js version: {result.stdout.strip()}")
        else:
            print("❌ Node.js not working properly")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False
    
    return True

def test_package_imports():
    """Test if all required packages can be imported"""
    print("\n📦 TESTING PACKAGE IMPORTS")
    print("=" * 50)
    
    required_packages = [
        'praisonaiagents',
        'praisonai',
        'openai',
        'subprocess',
        'tempfile',
        'base64',
        'json',
        're'
    ]
    
    all_imported = True
    
    for package in required_packages:
        try:
            if package == 'praisonaiagents':
                from praisonaiagents import Agent
                from praisonaiagents.tools import BaseTool
                print(f"✅ {package} imported successfully")
            elif package == 'praisonai':
                import praisonai
                print(f"✅ {package} imported successfully")
            elif package == 'openai':
                import openai
                print(f"✅ {package} imported successfully")
            else:
                exec(f"import {package}")
                print(f"✅ {package} imported successfully")
        except ImportError as e:
            print(f"❌ Failed to import {package}: {e}")
            all_imported = False
    
    return all_imported

def test_nodejs_execution():
    """Test Node.js execution capabilities"""
    print("\n🟢 TESTING NODE.JS EXECUTION")
    print("=" * 50)
    
    try:
        import subprocess
        import tempfile
        import json
        from pathlib import Path
        
        # Create a simple test
        test_js_code = """
console.log("🚀 Node.js test started");

function testFunction(a, b) {
    return a + b;
}

const result = testFunction(5, 3);
console.log("✅ Test function result:", result);

if (result === 8) {
    console.log("🎉 Test passed!");
} else {
    console.log("❌ Test failed!");
    process.exit(1);
}

console.log("🏁 Node.js test completed");
"""
        
        with tempfile.TemporaryDirectory() as temp_dir:
            js_file = Path(temp_dir) / "test.js"
            js_file.write_text(test_js_code)
            
            result = subprocess.run(
                ['node', 'test.js'],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                print("✅ Node.js execution successful")
                print("📋 Output:")
                print(result.stdout)
                return True
            else:
                print("❌ Node.js execution failed")
                print("🐛 Error:")
                print(result.stderr)
                return False
                
    except Exception as e:
        print(f"❌ Node.js test failed: {e}")
        return False

def test_improved_solver():
    """Test the improved LeetCode solver with a simple problem"""
    print("\n🧠 TESTING IMPROVED LEETCODE SOLVER")
    print("=" * 50)
    
    try:
        # Import the improved solver
        from improved_leetcode_solver import ImprovedLeetCodeSolver, EnvironmentManager
        
        print("✅ Successfully imported ImprovedLeetCodeSolver")
        
        # Test environment manager
        try:
            api_key = EnvironmentManager.get_openai_api_key()
            print("✅ API key retrieved successfully")
        except Exception as e:
            print(f"❌ Failed to get API key: {e}")
            return False
        
        # Test system requirements check
        requirements = EnvironmentManager.check_system_requirements()
        print(f"📊 System requirements: {requirements}")
        
        if not all(requirements.values()):
            print("⚠️  Some requirements not met, but continuing test...")
        
        # Initialize solver
        print("🚀 Initializing solver...")
        solver = ImprovedLeetCodeSolver()
        print("✅ Solver initialized successfully")
        
        # Test with a simple problem
        test_problem = """
        Write a function that returns the sum of two numbers.
        
        Example:
        Input: a = 5, b = 3
        Output: 8
        """
        
        print("🧪 Testing with simple problem...")
        result = solver.solve_from_text(test_problem)
        
        if result["success"]:
            print("🎉 Test problem solved successfully!")
            print(f"📝 Solution preview: {result['solution'][:100]}...")
            return True
        else:
            print(f"❌ Test problem failed: {result['error']}")
            if "solution" in result:
                print(f"📝 Partial solution: {result['solution'][:100]}...")
            return False
            
    except Exception as e:
        print(f"❌ Solver test failed: {e}")
        import traceback
        print("🐛 Full error:")
        traceback.print_exc()
        return False

def run_comprehensive_test():
    """Run all tests and provide summary"""
    print("🚀 COMPREHENSIVE LEETCODE SOLVER TEST")
    print("=" * 70)
    print(f"🕐 Started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    tests = [
        ("Environment Setup", test_environment_setup),
        ("Package Imports", test_package_imports),
        ("Node.js Execution", test_nodejs_execution),
        ("Improved Solver", test_improved_solver)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            print(f"\n🎯 Running: {test_name}")
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results[test_name] = False
    
    # Print summary
    print("\n" + "=" * 70)
    print("📊 TEST SUMMARY")
    print("=" * 70)
    
    passed = 0
    total = len(results)
    
    for test_name, passed_test in results.items():
        icon = "✅" if passed_test else "❌"
        print(f"{icon} {test_name}: {'PASSED' if passed_test else 'FAILED'}")
        if passed_test:
            passed += 1
    
    print(f"\n📈 Overall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Your setup is ready!")
        print("\n📋 USAGE INSTRUCTIONS:")
        print("=" * 40)
        print("1. Run the improved solver:")
        print("   python improved_leetcode_solver.py")
        print("\n2. Or use in your own code:")
        print("   from improved_leetcode_solver import ImprovedLeetCodeSolver")
        print("   solver = ImprovedLeetCodeSolver()")
        print("   result = solver.solve_from_text('your problem here')")
        print("\n3. For image processing:")
        print("   result = solver.solve_from_image('path/to/image.png')")
        
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        print("\n💡 TROUBLESHOOTING:")
        print("=" * 40)
        
        if not results.get("Environment Setup", False):
            print("- Set OpenAI API key: export OPENAI_API_KEY='your_key'")
            print("- Use recommended conda environment: conda activate praisonchat")
        
        if not results.get("Package Imports", False):
            print("- Install packages: pip install praisonaiagents praisonai openai")
        
        if not results.get("Node.js Execution", False):
            print("- Install Node.js from: https://nodejs.org/")
            print("- Ensure Node.js is in your PATH")
        
        if not results.get("Improved Solver", False):
            print("- Check internet connection for OpenAI API")
            print("- Verify API key has sufficient credits")
    
    print("\n" + "=" * 70)
    print(f"🕐 Completed at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    return passed == total

if __name__ == "__main__":
    success = run_comprehensive_test()
    sys.exit(0 if success else 1)