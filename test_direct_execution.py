#!/usr/bin/env python3
"""
Direct test of the JavaScript execution to debug the issue
"""
import sys
sys.path.insert(0, '../LeetCodeSolver/latest')

from enhanced_leetcode_solver import JavaScriptExecutor

def test_string_function():
    print("Testing string function directly...")
    executor = JavaScriptExecutor()
    
    test_code = '''
function lengthOfLongestSubstring(s) {
    // Use a sliding window approach
    let maxLength = 0;
    let start = 0;
    let charMap = new Map();
    
    for (let end = 0; end < s.length; end++) {
        if (charMap.has(s[end])) {
            start = Math.max(start, charMap.get(s[end]) + 1);
        }
        charMap.set(s[end], end);
        maxLength = Math.max(maxLength, end - start + 1);
    }
    
    return maxLength;
}
'''
    
    result = executor.execute_code(test_code)
    print("=== DIRECT TEST OUTPUT ===")
    print(result['output'])
    print("=== END DIRECT TEST ===")

if __name__ == "__main__":
    test_string_function()
