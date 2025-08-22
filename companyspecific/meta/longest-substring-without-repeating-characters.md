# Longest Substring Without Repeating Characters

## Problem Statement
Given a string `s`, find the length of the longest substring without repeating characters.

**LeetCode Problem Number: 3**

## Sample Input and Output
**Input:** `s = "abcabcbb"`
**Output:** `3`
**Explanation:** The answer is "abc", with the length of 3.

**Input:** `s = "bbbbb"`
**Output:** `1`
**Explanation:** The answer is "b", with the length of 1.

**Input:** `s = "pwwkew"`
**Output:** `3`
**Explanation:** The answer is "wke", with the length of 3.

## Algorithm Outline
The most efficient approach uses the **sliding window technique** with a hash map:

1. Use two pointers (left and right) to maintain a sliding window
2. Use a hash map to store characters and their most recent indices
3. Expand the window by moving the right pointer
4. If a repeating character is found, shrink the window from the left
5. Keep track of the maximum window size encountered

## Step-by-Step Dry Run
Let's trace through `s = "abcabcbb"`:

1. **Step 1:** `left=0, right=0, char='a'`
   - Map: `{a: 0}`, window: "a", maxLen: 1

2. **Step 2:** `left=0, right=1, char='b'`
   - Map: `{a: 0, b: 1}`, window: "ab", maxLen: 2

3. **Step 3:** `left=0, right=2, char='c'`
   - Map: `{a: 0, b: 1, c: 2}`, window: "abc", maxLen: 3

4. **Step 4:** `left=0, right=3, char='a'`
   - 'a' found at index 0, move left to 1
   - Map: `{a: 3, b: 1, c: 2}`, window: "bca", maxLen: 3

5. **Step 5:** `left=1, right=4, char='b'`
   - 'b' found at index 1, move left to 2
   - Map: `{a: 3, b: 4, c: 2}`, window: "cab", maxLen: 3

6. **Continue until end...** Final result: 3

## JavaScript Implementation

```javascript
function lengthOfLongestSubstring(s) {
    const charMap = new Map();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        const char = s[right];
        
        // If character is already in window, move left pointer
        if (charMap.has(char) && charMap.get(char) >= left) {
            left = charMap.get(char) + 1;
        }
        
        // Update character's latest index
        charMap.set(char, right);
        
        // Update maximum length
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Alternative approach using Set
function lengthOfLongestSubstringSet(s) {
    const charSet = new Set();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        // Shrink window while duplicate exists
        while (charSet.has(s[right])) {
            charSet.delete(s[left]);
            left++;
        }
        
        charSet.add(s[right]);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}
```

## Time and Space Complexity Analysis

**Time Complexity:** O(n)
- We traverse the string once with the right pointer
- In the worst case, the left pointer also traverses the string once
- Each character is visited at most twice (once by right, once by left)

**Space Complexity:** O(min(m, n))
- Where m is the size of the character set and n is the length of the string
- The hash map stores at most min(m, n) characters
- For ASCII characters, m = 128; for Unicode, m could be larger