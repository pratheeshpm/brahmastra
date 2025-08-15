#!/usr/bin/env python3
"""
Test script for 2025 OpenAI models with the LeetCode solver
Tests vision capabilities with latest model optimizations
"""

import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.append(str(Path(__file__).parent))

from simplified_leetcode_solver import SimplifiedLeetCodeSolver
from model_config_2025 import get_best_model_for_task, OPENAI_MODELS_2025

def test_2025_models():
    """Test the LeetCode solver with 2025 model optimizations"""
    print("🚀 TESTING 2025 OPENAI MODELS")
    print("=" * 60)
    
    # Display available models
    print("\n📋 Available 2025 Models:")
    print("-" * 30)
    for category, models in OPENAI_MODELS_2025.items():
        print(f"\n{category.upper()}:")
        for model_name, info in models.items():
            print(f"  • {model_name}: {info['description']}")
    
    # Get model recommendations
    print("\n🎯 Model Recommendations for LeetCode:")
    print("-" * 40)
    
    vision_rec = get_best_model_for_task("vision", "medium", "medium")
    print(f"Vision Tasks: {vision_rec['model']} - {vision_rec['reason']}")
    
    coding_rec = get_best_model_for_task("coding", budget="medium")
    print(f"Coding Tasks: {coding_rec['model']} - {coding_rec['reason']}")
    
    reasoning_rec = get_best_model_for_task("reasoning", budget="medium")
    print(f"Reasoning Tasks: {reasoning_rec['model']} - {reasoning_rec['reason']}")
    
    # Initialize solver
    print("\n🔧 Initializing LeetCode Solver...")
    try:
        solver = SimplifiedLeetCodeSolver()
        print("✅ Solver initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize solver: {e}")
        return
    
    # Test with small image (should work with gpt-4o)
    print(f"\n🖼️  Testing with small test image...")
    print("=" * 50)
    
    small_image = "small_leetcode_test.png"
    if os.path.exists(small_image):
        try:
            result = solver.solve_from_image(small_image)
            
            if result.get("success"):
                print("✅ VISION TEST PASSED!")
                print(f"📝 Solution generated: {len(result.get('solution', ''))} characters")
                print(f"🔧 Model used: {result.get('model_used', 'gpt-4o')}")
                print(f"⏱️  Execution: {result.get('execution_result', {}).get('success', 'Unknown')}")
                
                # Show first few lines of solution
                solution = result.get('solution', '')
                if solution:
                    lines = solution.split('\n')[:3]
                    print("📋 Solution preview:")
                    for line in lines:
                        print(f"    {line}")
                    if len(solution.split('\n')) > 3:
                        print("    ...")
            else:
                print("❌ VISION TEST FAILED")
                print(f"Error: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Vision test error: {e}")
    else:
        print(f"⚠️  Small test image not found: {small_image}")
    
    # Test with text (should work efficiently)
    print(f"\n📝 Testing with text input...")
    print("=" * 50)
    
    test_problem = """
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
    
    Example:
    Input: nums = [2,7,11,15], target = 9
    Output: [0,1]
    """
    
    try:
        text_result = solver.solve_from_text(test_problem)
        
        if text_result.get("success"):
            print("✅ TEXT TEST PASSED!")
            print(f"📝 Solution: {len(text_result.get('solution', ''))} characters")
            print(f"⏱️  Execution: {text_result.get('execution_result', {}).get('success', 'Unknown')}")
        else:
            print("❌ TEXT TEST FAILED")
            print(f"Error: {text_result.get('error', 'Unknown error')}")
            
    except Exception as e:
        print(f"❌ Text test error: {e}")
    
    # Test context window efficiency
    print(f"\n📊 Context Window Analysis:")
    print("-" * 30)
    
    if os.path.exists(small_image):
        import base64
        with open(small_image, "rb") as f:
            img_data = f.read()
        base64_size = len(base64.b64encode(img_data).decode())
        tokens_estimate = base64_size * 0.75  # Rough estimate
        
        print(f"Image size: {len(img_data)} bytes")
        print(f"Base64 size: {base64_size} characters")
        print(f"Estimated tokens: ~{int(tokens_estimate)}")
        
        for model in ["gpt-4o", "gpt-4o-mini"]:
            context_limit = 128000  # Both have 128K context
            if tokens_estimate < context_limit * 0.7:  # Use 70% as safe limit
                print(f"✅ {model}: Should work (plenty of context)")
            elif tokens_estimate < context_limit * 0.9:
                print(f"⚠️  {model}: Might work (tight context)")
            else:
                print(f"❌ {model}: Likely to fail (exceeds context)")
    
    print(f"\n🎉 2025 Models Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_2025_models()