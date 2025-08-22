# Move Zeroes - LeetCode #283

## Problem Explanation
Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements. Note that you must do this in-place without making a copy of the array.

## Sample Input and Output

**Example 1:**
```
Input: nums = [0,1,0,3,12]
Output: [1,3,12,0,0]
```

**Example 2:**
```
Input: nums = [0]
Output: [0]
```

## Algorithm Outline
**Two Pointer Approach:**
1. **Initialize pointer**: `writeIndex` starts at 0
2. **Scan array**: For each non-zero element, write it at `writeIndex`
3. **Increment writeIndex**: After writing each non-zero element
4. **Fill remaining**: Fill remaining positions with zeros

## Step-by-Step Dry Run
Using input `nums = [0,1,0,3,12]`:

1. **i=0**: nums[0]=0 (zero), skip, writeIndex=0
2. **i=1**: nums[1]=1 (non-zero), nums[writeIndex=0]=1, writeIndex=1
   - Array: [1,1,0,3,12]
3. **i=2**: nums[2]=0 (zero), skip, writeIndex=1  
4. **i=3**: nums[3]=3 (non-zero), nums[writeIndex=1]=3, writeIndex=2
   - Array: [1,3,0,3,12]
5. **i=4**: nums[4]=12 (non-zero), nums[writeIndex=2]=12, writeIndex=3
   - Array: [1,3,12,3,12]
6. **Fill zeros**: Set nums[3]=0, nums[4]=0
   - Final: [1,3,12,0,0]

## JavaScript Implementation

```javascript
function moveZeroes(nums) {
    let writeIndex = 0;
    
    // Move all non-zero elements to the front
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== 0) {
            nums[writeIndex] = nums[i];
            writeIndex++;
        }
    }
    
    // Fill remaining positions with zeros
    while (writeIndex < nums.length) {
        nums[writeIndex] = 0;
        writeIndex++;
    }
}

// Alternative: Swap approach (preserves order, minimal writes)
function moveZeroesSwap(nums) {
    let left = 0;
    
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] !== 0) {
            if (left !== right) {
                [nums[left], nums[right]] = [nums[right], nums[left]];
            }
            left++;
        }
    }
}
```

## Time and Space Complexity

**Time Complexity:** O(n) - single pass through array
**Space Complexity:** O(1) - in-place modification