# First Bad Version - LeetCode #278

## Problem Explanation
You are a product manager and currently leading a team to develop a new product. Since each version is developed based on the previous version, all the versions after a bad version are also bad. Given n versions [1, 2, ..., n], find the first bad version. You are given an API `bool isBadVersion(version)` which returns whether version is bad.

## Sample Input and Output

**Example 1:**
```
Input: n = 5, bad = 4
Output: 4
Explanation: 
isBadVersion(3) -> false
isBadVersion(5) -> true
isBadVersion(4) -> true
So the first bad version is 4.
```

**Example 2:**
```
Input: n = 1, bad = 1
Output: 1
```

## Algorithm Outline
**Binary Search Approach:**
1. **Initialize bounds**: left = 1, right = n
2. **Binary search**: While left < right
3. **Check middle**: Calculate mid, test isBadVersion(mid)
4. **Narrow search**: If bad, search left half; if good, search right half
5. **Return result**: When left == right, that's the first bad version

## Step-by-Step Dry Run
Using input `n = 5, bad = 4`:

1. **Initial**: left = 1, right = 5
2. **Iteration 1**: mid = 3, isBadVersion(3) = false → left = 4, right = 5
3. **Iteration 2**: mid = 4, isBadVersion(4) = true → left = 4, right = 4
4. **Exit**: left == right = 4, return 4

## JavaScript Implementation

```javascript
function solution(isBadVersion) {
    return function(n) {
        let left = 1;
        let right = n;
        
        while (left < right) {
            const mid = Math.floor(left + (right - left) / 2);
            
            if (isBadVersion(mid)) {
                right = mid;  // First bad could be mid or earlier
            } else {
                left = mid + 1;  // First bad is after mid
            }
        }
        
        return left;
    };
}
```

## Time and Space Complexity

**Time Complexity:** O(log n) - binary search
**Space Complexity:** O(1) - constant space