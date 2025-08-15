#!/usr/bin/env python3
"""
Test OpenAI Vision API directly to process LeetCode images
"""

import base64
import os
from openai import OpenAI

def test_openai_vision_direct():
    """Test OpenAI Vision API directly"""
    
    # Initialize OpenAI client
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    # Read the small test image
    with open("small_leetcode_test.png", "rb") as f:
        image_data = f.read()
    
    base64_image = base64.b64encode(image_data).decode('utf-8')
    print(f"Image encoded: {len(base64_image)} characters")
    
    # Test with OpenAI Vision API
    try:
        print("Testing OpenAI Vision API directly...")
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this LeetCode problem image. Extract the complete problem statement and provide a JavaScript solution. First describe what you see, then extract the problem text, then provide the solution."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2000
        )
        
        result = response.choices[0].message.content
        print("OpenAI Vision Response:")
        print("=" * 60)
        print(result)
        print("=" * 60)
        
        # Check if we got JavaScript code
        if "function" in result.lower() or "const" in result.lower() or "=>" in result:
            print("✅ JavaScript code detected in response!")
        else:
            print("⚠️  No obvious JavaScript code detected")
            
        return result
        
    except Exception as e:
        print(f"❌ OpenAI Vision API error: {e}")
        return None

def test_text_extraction():
    """Test pure text extraction from image"""
    
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    with open("small_leetcode_test.png", "rb") as f:
        image_data = f.read()
    
    base64_image = base64.b64encode(image_data).decode('utf-8')
    
    try:
        print("\nTesting text extraction only...")
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract ALL text content from this image. Read every word and number carefully. Provide the complete text exactly as it appears."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        text_result = response.choices[0].message.content
        print("Extracted Text:")
        print("=" * 40)
        print(text_result)
        print("=" * 40)
        
        return text_result
        
    except Exception as e:
        print(f"❌ Text extraction error: {e}")
        return None

if __name__ == "__main__":
    print("🧪 Testing OpenAI Vision API with LeetCode Image")
    print("=" * 60)
    
    # Test 1: Full problem solving
    vision_result = test_openai_vision_direct()
    
    # Test 2: Text extraction only
    text_result = test_text_extraction()
    
    print("\n📋 SUMMARY")
    print("=" * 30)
    if vision_result:
        print("✅ Vision API working")
    else:
        print("❌ Vision API failed")
        
    if text_result:
        print("✅ Text extraction working")
    else:
        print("❌ Text extraction failed")