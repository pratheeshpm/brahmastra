# Minimum Window Substring

## Problem Statement
Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such window, return the empty string `""`.

**LeetCode Problem Number: 76**

## Sample Input and Output
**Input:** `s = "ADOBECODEBANC"`, `t = "ABC"`
**Output:** `"BANC"`
**Explanation:** The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.

**Input:** `s = "a"`, `t = "a"`
**Output:** `"a"`
**Explanation:** The entire string s is the minimum window.

**Input:** `s = "a"`, `t = "aa"`
**Output:** `""`
**Explanation:** Both 'a's from t must be included in the window. Since the largest window of s only has one 'a', return empty string.

## Algorithm Outline
The most efficient approach uses the **sliding window technique**:

1. Create a frequency map of characters in string `t`
2. Use two pointers (left and right) to maintain a sliding window
3. Expand the window by moving right pointer until all characters of `t` are included
4. Once a valid window is found, try to contract from left to find the minimum window
5. Keep track of the minimum window found so far

## Step-by-Step Dry Run
Let's trace through `s = "ADOBECODEBANC"`, `t = "ABC"`:

1. **Initialize:**
   - `tMap = {A: 1, B: 1, C: 1}`
   - `required = 3` (unique chars in t)
   - `left = 0, right = 0`
   - `windowCounts = {}`

2. **Expand window:**
   - `right = 0, char = 'A'`: windowCounts = {A: 1}, formed = 1
   - `right = 1, char = 'D'`: windowCounts = {A: 1, D: 1}, formed = 1
   - `right = 2, char = 'O'`: windowCounts = {A: 1, D: 1, O: 1}, formed = 1
   - `right = 3, char = 'B'`: windowCounts = {A: 1, D: 1, O: 1, B: 1}, formed = 2
   - `right = 4, char = 'E'`: windowCounts = {A: 1, D: 1, O: 1, B: 1, E: 1}, formed = 2
   - `right = 5, char = 'C'`: windowCounts = {A: 1, D: 1, O: 1, B: 1, E: 1, C: 1}, formed = 3

3. **Contract window (formed = required):**
   - Current window: "ADOBEC" (length 6)
   - Try to contract from left:
   - `left = 0, char = 'A'`: Remove A, formed = 2, stop contracting
   - Update minimum window: "ADOBEC"

4. **Continue expanding and contracting:**
   - Eventually find "BANC" with length 4
   - This becomes the minimum window

## JavaScript Implementation

```javascript
function minWindow(s, t) {
    if (s.length === 0 || t.length === 0) return "";
    
    // Create frequency map for characters in t
    const tMap = {};
    for (const char of t) {
        tMap[char] = (tMap[char] || 0) + 1;
    }
    
    const required = Object.keys(tMap).length;
    let formed = 0;
    const windowCounts = {};
    
    // Left and right pointers
    let left = 0, right = 0;
    
    // Result: [window length, left, right]
    let result = [Infinity, 0, 0];
    
    while (right < s.length) {
        // Add character to the window
        const char = s[right];
        windowCounts[char] = (windowCounts[char] || 0) + 1;
        
        // Check if current character's frequency matches requirement
        if (tMap[char] && windowCounts[char] === tMap[char]) {
            formed++;
        }
        
        // Try to contract the window
        while (left <= right && formed === required) {
            // Update result if current window is smaller
            if (right - left + 1 < result[0]) {
                result = [right - left + 1, left, right];
            }
            
            // Remove character from left
            const leftChar = s[left];
            windowCounts[leftChar]--;
            
            if (tMap[leftChar] && windowCounts[leftChar] < tMap[leftChar]) {
                formed--;
            }
            
            left++;
        }
        
        right++;
    }
    
    // Return empty string if no valid window found
    return result[0] === Infinity ? "" : s.substring(result[1], result[2] + 1);
}

// Alternative implementation with cleaner logic
function minWindowAlternative(s, t) {
    const tFreq = {};
    for (const char of t) {
        tFreq[char] = (tFreq[char] || 0) + 1;
    }
    
    let left = 0;
    let minLen = Infinity;
    let minStart = 0;
    let count = Object.keys(tFreq).length;
    
    for (let right = 0; right < s.length; right++) {
        const rightChar = s[right];
        
        if (tFreq[rightChar] !== undefined) {
            tFreq[rightChar]--;
            if (tFreq[rightChar] === 0) count--;
        }
        
        while (count === 0) {
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                minStart = left;
            }
            
            const leftChar = s[left];
            if (tFreq[leftChar] !== undefined) {
                tFreq[leftChar]++;
                if (tFreq[leftChar] > 0) count++;
            }
            left++;
        }
    }
    
    return minLen === Infinity ? "" : s.substring(minStart, minStart + minLen);
}
```

## Time and Space Complexity Analysis

**Time Complexity:** O(|s| + |t|)
- We traverse string `s` at most twice (once with right pointer, once with left pointer)
- Creating the frequency map for `t` takes O(|t|) time
- Each character in `s` is visited at most twice

**Space Complexity:** O(|s| + |t|)
- The frequency map for `t` takes O(|t|) space
- The window frequency map takes O(|s|) space in the worst case
- Overall space complexity is O(|s| + |t|)