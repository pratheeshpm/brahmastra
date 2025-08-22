# 3Sum

## Problem Statement
Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Notice that the solution set must not contain duplicate triplets.

**LeetCode Problem Number: 15**

## Sample Input and Output
**Input:** `nums = [-1,0,1,2,-1,-4]`
**Output:** `[[-1,-1,2],[-1,0,1]]`
**Explanation:** 
- nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
- nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
- nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.
- The distinct triplets are [-1,0,1] and [-1,-1,2].

**Input:** `nums = [0,1,1]`
**Output:** `[]`
**Explanation:** The only possible triplet does not sum up to 0.

**Input:** `nums = [0,0,0]`
**Output:** `[[0,0,0]]`
**Explanation:** The only possible triplet sums up to 0.

## Algorithm Outline
The most efficient approach uses **sorting + two pointers**:

1. Sort the array to enable two-pointer technique and handle duplicates
2. Iterate through the array with the first pointer (i)
3. For each i, use two pointers (left and right) to find pairs that sum to -nums[i]
4. Skip duplicates to avoid duplicate triplets
5. Adjust pointers based on the current sum

## Step-by-Step Dry Run
Let's trace through `nums = [-1,0,1,2,-1,-4]`:

1. **Sort:** `nums = [-4,-1,-1,0,1,2]`

2. **i=0, nums[i]=-4:**
   - Target: -(-4) = 4
   - left=1(-1), right=5(2), sum=-1+2=1 < 4, move left
   - left=2(-1), right=5(2), sum=-1+2=1 < 4, move left
   - left=3(0), right=5(2), sum=0+2=2 < 4, move left
   - left=4(1), right=5(2), sum=1+2=3 < 4, move left
   - left >= right, no triplet found

3. **i=1, nums[i]=-1:**
   - Target: -(-1) = 1
   - left=2(-1), right=5(2), sum=-1+2=1 = 1 ✓
   - Found triplet: [-1,-1,2]
   - Skip duplicates, move both pointers

4. **i=2, nums[i]=-1:** Skip duplicate

5. **i=3, nums[i]=0:**
   - Target: -(0) = 0
   - left=4(1), right=5(2), sum=1+2=3 > 0, move right
   - left >= right, continue to next iteration

6. **Continue...** Final result: [[-1,-1,2],[-1,0,1]]

## JavaScript Implementation

```javascript
function threeSum(nums) {
    const result = [];
    const n = nums.length;
    
    // Sort the array
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < n - 2; i++) {
        // Skip duplicates for the first element
        if (i > 0 && nums[i] === nums[i - 1]) {
            continue;
        }
        
        let left = i + 1;
        let right = n - 1;
        
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                
                // Skip duplicates for left pointer
                while (left < right && nums[left] === nums[left + 1]) {
                    left++;
                }
                // Skip duplicates for right pointer
                while (left < right && nums[right] === nums[right - 1]) {
                    right--;
                }
                
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}

// Alternative approach using hash map (less efficient)
function threeSumHashMap(nums) {
    const result = [];
    const n = nums.length;
    
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        const seen = new Set();
        const target = -nums[i];
        
        for (let j = i + 1; j < n; j++) {
            const complement = target - nums[j];
            
            if (seen.has(complement)) {
                result.push([nums[i], complement, nums[j]]);
                
                // Skip duplicates
                while (j + 1 < n && nums[j] === nums[j + 1]) j++;
            }
            seen.add(nums[j]);
        }
    }
    
    return result;
}
```

## Time and Space Complexity Analysis

**Time Complexity:** O(n²)
- Sorting takes O(n log n)
- The outer loop runs n times
- The inner two-pointer search takes O(n) time
- Overall: O(n log n) + O(n²) = O(n²)

**Space Complexity:** O(1) or O(log n)
- O(1) extra space if we don't count the output array
- O(log n) space for sorting (depending on the sorting algorithm)
- The result array space is not counted towards space complexity as it's part of the output