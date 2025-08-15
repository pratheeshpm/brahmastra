#!/usr/bin/env python3
"""
Create a small test image with a simple LeetCode problem
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_test_leetcode_image():
    """Create a small image with a simple LeetCode problem"""
    
    # Create a white background
    width, height = 800, 600
    image = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(image)
    
    # Try to use a better font, fall back to default if not available
    try:
        # Try to find a system font
        font_large = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        font_medium = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
        font_small = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 14)
    except:
        try:
            font_large = ImageFont.truetype("arial.ttf", 24)
            font_medium = ImageFont.truetype("arial.ttf", 18)
            font_small = ImageFont.truetype("arial.ttf", 14)
        except:
            # Use default font
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
    
    # Draw the problem
    y_pos = 50
    
    # Title
    draw.text((50, y_pos), "LeetCode Problem: Two Sum", fill='black', font=font_large)
    y_pos += 60
    
    # Problem description
    problem_text = [
        "Given an array of integers nums and an integer target, return",
        "indices of the two numbers such that they add up to target.",
        "",
        "You may assume that each input would have exactly one solution,",
        "and you may not use the same element twice.",
        "",
        "Example 1:",
        "Input: nums = [2,7,11,15], target = 9",
        "Output: [0,1]",
        "Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
        "",
        "Example 2:",
        "Input: nums = [3,2,4], target = 6",
        "Output: [1,2]",
        "",
        "Constraints:",
        "• 2 <= nums.length <= 10^4",
        "• -10^9 <= nums[i] <= 10^9",
        "• -10^9 <= target <= 10^9",
        "• Only one valid answer exists."
    ]
    
    for line in problem_text:
        if line.startswith("Example") or line.startswith("Constraints"):
            draw.text((50, y_pos), line, fill='black', font=font_medium)
        elif line.startswith("Input:") or line.startswith("Output:") or line.startswith("Explanation:"):
            draw.text((70, y_pos), line, fill='blue', font=font_small)
        elif line.startswith("•"):
            draw.text((70, y_pos), line, fill='gray', font=font_small)
        else:
            draw.text((50, y_pos), line, fill='black', font=font_small)
        y_pos += 25
    
    # Save the image
    output_path = "small_leetcode_test.png"
    image.save(output_path, "PNG", optimize=True)
    
    file_size = os.path.getsize(output_path)
    print(f"✅ Created test image: {output_path}")
    print(f"📏 Size: {file_size / 1024:.1f}KB")
    print(f"📐 Dimensions: {width}x{height}")
    
    return output_path

if __name__ == "__main__":
    create_test_leetcode_image()