#!/usr/bin/env python3
"""
Simple test to verify image processing with PraisonAI
"""

import base64
from praisonaiagents.agent import Agent

def test_simple_image_with_praison():
    """Test image processing with PraisonAI directly"""
    
    # Create the agent
    agent = Agent(
        role="Vision Analyzer",
        goal="Analyze images and extract text content",
        backstory="You are an AI assistant capable of analyzing images",
        instructions="Analyze the provided image and describe what you see. Extract any text content.",
        llm="gpt-4o",
        verbose=True
    )
    
    # Read the small test image
    with open("small_leetcode_test.png", "rb") as f:
        image_data = f.read()
    
    base64_image = base64.b64encode(image_data).decode('utf-8')
    print(f"Image encoded: {len(base64_image)} characters")
    
    # Test 1: Simple image analysis
    prompt1 = f"""
    Please analyze this image and tell me what you see:
    
    [Image: data:image/png;base64,{base64_image}]
    
    Describe the contents of the image.
    """
    
    print("Testing simple image analysis...")
    try:
        response1 = agent.start(prompt1)
        print("Response 1:", response1[:200], "...")
    except Exception as e:
        print("Error 1:", e)
    
    # Test 2: Direct base64 in content
    print("\nTesting with different format...")
    prompt2 = f"""
    I have an image that contains a LeetCode problem. Can you analyze it?
    
    Image data: {base64_image[:100]}...
    
    What do you see in this image?
    """
    
    try:
        response2 = agent.start(prompt2)
        print("Response 2:", response2[:200], "...")
    except Exception as e:
        print("Error 2:", e)

if __name__ == "__main__":
    test_simple_image_with_praison()