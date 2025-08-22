# Subarray Sum Equals K

## Problem Statement
Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.

A subarray is a contiguous non-empty sequence of elements within an array.

**LeetCode Problem Number: 560**

## Sample Input and Output
**Input:** `nums = [1,1,1]`, `k = 2`
**Output:** `2`
**Explanation:** Subarrays are [1,1] and [1,1]

**Input:** `nums = [1,2,3]`, `k = 3`
**Output:** `2`
**Explanation:** Subarrays are [3] and [1,2]

**Input:** `nums = [1,-1,0]`, `k = 0`
**Output:** `3`
**Explanation:** Subarrays are [-1,1], [0], and [-1,1,0]

## Algorithm Outline
The most efficient approach uses **prefix sum with hash map**:

1. Use a hash map to store frequency of prefix sums seen so far
2. For each element, calculate the running prefix sum
3. Check if (prefix_sum - k) exists in the hash map
4. If it exists, add its frequency to the result (those many subarrays ending at current index)
5. Update the frequency of current prefix sum in hash map

The key insight: if prefix_sum[j] - prefix_sum[i-1] = k, then subarray from i to j has sum k.

## Detailed Algorithm Explanation

### Core Concept: Prefix Sum with Hash Map

The most efficient solution leverages the **prefix sum** concept combined with a **hash map** to track frequency of prefix sums. Here's why this works:

**Mathematical Foundation:**
- A **prefix sum** at index `i` is the sum of all elements from index 0 to i
- For any subarray from index `i` to `j`: `sum(i to j) = prefix_sum[j] - prefix_sum[i-1]`
- If we want `sum(i to j) = k`, then: `prefix_sum[j] - prefix_sum[i-1] = k`
- Rearranging: `prefix_sum[i-1] = prefix_sum[j] - k`

**Key Insight:** 
While processing element at index `j`, if we've seen a prefix sum equal to `(current_prefix_sum - k)` before, then there exists a subarray ending at `j` with sum `k`.

**Why use frequency count?**
Multiple prefix sums can have the same value, and each occurrence represents a potential starting point for a valid subarray.

**Why initialize with `{0: 1}`?**
- This handles subarrays that start from index 0
- It represents the "empty prefix" with sum 0
- When `current_prefix_sum = k`, we look for `(k - k) = 0` in the map

### Algorithm Steps:
1. Initialize hash map with `{0: 1}` and variables for prefix sum and result count
2. For each element:
   - Add element to running prefix sum
   - Calculate target: `target = current_prefix_sum - k`
   - If target exists in map, add its frequency to result (found that many valid subarrays)
   - Update frequency of current prefix sum in the map

## Step-by-Step Dry Run Examples

### Example 1: `nums = [1,2,3]`, `k = 3`

**Visual representation of prefix sums:**
```
Index:      0   1   2
Element:    1   2   3
Prefix:     1   3   6
```

1. **Initialize:**
   - `prefixSumCount = {0: 1}` (empty subarray has sum 0)
   - `prefixSum = 0`, `result = 0`

2. **Index 0, nums[0] = 1:**
   - prefixSum = 0 + 1 = 1
   - target = 1 - 3 = -2
   - Look for -2 in map: **not found**
   - result = 0
   - prefixSumCount = {0: 1, 1: 1}

3. **Index 1, nums[1] = 2:**
   - prefixSum = 1 + 2 = 3
   - target = 3 - 3 = 0
   - Look for 0 in map: **found with count 1**
   - result = 0 + 1 = 1 (subarray [1,2] from index 0-1)
   - prefixSumCount = {0: 1, 1: 1, 3: 1}

4. **Index 2, nums[2] = 3:**
   - prefixSum = 3 + 3 = 6
   - target = 6 - 3 = 3
   - Look for 3 in map: **found with count 1**
   - result = 1 + 1 = 2 (subarray [3] from index 2-2)
   - prefixSumCount = {0: 1, 1: 1, 3: 1, 6: 1}

**Final result:** 2 (subarrays [1,2] and [3])

### Example 2: `nums = [1, -1, 1, 1, -1, 1]`, `k = 1`

This example demonstrates duplicate prefix sums and negative numbers:

**Visual representation:**
```
Index:      0   1   2   3   4   5
Element:    1  -1   1   1  -1   1
Prefix:     1   0   1   2   1   2
Target:     0  -1   0   1   0   1
```

1. **Initialize:**
   - `prefixSumCount = {0: 1}`, `prefixSum = 0`, `result = 0`

2. **Index 0, nums[0] = 1:**
   - prefixSum = 0 + 1 = 1
   - target = 1 - 1 = 0
   - Look for 0 in map: **found with count 1**
   - result = 0 + 1 = 1 (subarray [1] from index 0-0)
   - prefixSumCount = {0: 1, 1: 1}

3. **Index 1, nums[1] = -1:**
   - prefixSum = 1 + (-1) = 0
   - target = 0 - 1 = -1
   - Look for -1 in map: **not found**
   - result = 1
   - prefixSumCount = {0: 2, 1: 1} ← **Note: 0 appears twice now**

4. **Index 2, nums[2] = 1:**
   - prefixSum = 0 + 1 = 1
   - target = 1 - 1 = 0
   - Look for 0 in map: **found with count 2**
   - result = 1 + 2 = 3 (subarrays [-1,1] and [1] ending at index 2)
   - prefixSumCount = {0: 2, 1: 2} ← **Note: 1 appears twice now**

5. **Index 3, nums[3] = 1:**
   - prefixSum = 1 + 1 = 2
   - target = 2 - 1 = 1
   - Look for 1 in map: **found with count 2**
   - result = 3 + 2 = 5 (subarrays [1] and [1,1] ending at index 3)
   - prefixSumCount = {0: 2, 1: 2, 2: 1}

6. **Index 4, nums[4] = -1:**
   - prefixSum = 2 + (-1) = 1
   - target = 1 - 1 = 0
   - Look for 0 in map: **found with count 2**
   - result = 5 + 2 = 7 (subarrays [1,-1] and [1,1,-1] ending at index 4)
   - prefixSumCount = {0: 2, 1: 3, 2: 1}

7. **Index 5, nums[5] = 1:**
   - prefixSum = 1 + 1 = 2
   - target = 2 - 1 = 1
   - Look for 1 in map: **found with count 3**
   - result = 7 + 3 = 10 (subarrays [1], [-1,1], and [1,1,-1,1] ending at index 5)
   - prefixSumCount = {0: 2, 1: 3, 2: 2}

**Final result:** 10

**Valid subarrays with sum = 1:**
1. [1] (index 0)
2. [-1,1] (indices 1-2)  
3. [1] (index 2)
4. [1] (index 3)
5. [1,1] (indices 2-3)
6. [1,-1] (indices 3-4)
7. [1,1,-1] (indices 2-4)
8. [1] (index 5)
9. [-1,1] (indices 4-5)
10. [1,1,-1,1] (indices 2-5)

## JavaScript Implementation

```javascript
// Approach 1: Prefix Sum with Hash Map (Optimal)
function subarraySum(nums, k) {
    const prefixSumCount = new Map();
    prefixSumCount.set(0, 1); // Empty subarray has sum 0
    
    let prefixSum = 0;
    let count = 0;
    
    for (const num of nums) {
        prefixSum += num;
        
        // Check if there exists a prefix sum such that
        // current_prefix_sum - previous_prefix_sum = k
        const targetSum = prefixSum - k;
        if (prefixSumCount.has(targetSum)) {
            count += prefixSumCount.get(targetSum);
        }
        
        // Update the count of current prefix sum
        prefixSumCount.set(prefixSum, (prefixSumCount.get(prefixSum) || 0) + 1);
    }
    
    return count;
}

// Approach 2: Brute Force (for understanding)
function subarraySumBruteForce(nums, k) {
    let count = 0;
    
    for (let i = 0; i < nums.length; i++) {
        let sum = 0;
        for (let j = i; j < nums.length; j++) {
            sum += nums[j];
            if (sum === k) {
                count++;
            }
        }
    }
    
    return count;
}

// Approach 3: Using array instead of Map (slightly different implementation)
function subarraySumArray(nums, k) {
    const sumFreq = {};
    sumFreq[0] = 1; // Initialize with sum 0 having frequency 1
    
    let runningSum = 0;
    let result = 0;
    
    for (let i = 0; i < nums.length; i++) {
        runningSum += nums[i];
        
        // If (runningSum - k) exists, it means we found subarrays with sum k
        if (sumFreq[runningSum - k]) {
            result += sumFreq[runningSum - k];
        }
        
        // Update frequency of current running sum
        sumFreq[runningSum] = (sumFreq[runningSum] || 0) + 1;
    }
    
    return result;
}

// Approach 4: Detailed version with explanation
function subarraySumDetailed(nums, k) {
    // Map to store prefix sum and their frequencies
    const prefixSumMap = new Map();
    prefixSumMap.set(0, 1); // Important: sum 0 appears once (empty prefix)
    
    let currentSum = 0;
    let totalCount = 0;
    
    for (let i = 0; i < nums.length; i++) {
        currentSum += nums[i];
        
        // We want to find if there's a prefix sum such that:
        // currentSum - prefixSum = k
        // Which means: prefixSum = currentSum - k
        const neededPrefixSum = currentSum - k;
        
        if (prefixSumMap.has(neededPrefixSum)) {
            // Found prefix sums that when removed from current sum give us k
            totalCount += prefixSumMap.get(neededPrefixSum);
        }
        
        // Add current sum to the map (or increment its frequency)
        const currentFreq = prefixSumMap.get(currentSum) || 0;
        prefixSumMap.set(currentSum, currentFreq + 1);
    }
    
    return totalCount;
}

// Approach 5: With path tracking (for debugging)
function subarraySumWithPaths(nums, k) {
    const prefixSumMap = new Map();
    prefixSumMap.set(0, [[-1]]); // Store indices where sum occurred
    
    let currentSum = 0;
    let totalCount = 0;
    const validSubarrays = [];
    
    for (let i = 0; i < nums.length; i++) {
        currentSum += nums[i];
        const neededPrefixSum = currentSum - k;
        
        if (prefixSumMap.has(neededPrefixSum)) {
            const indices = prefixSumMap.get(neededPrefixSum);
            for (const startIdx of indices) {
                totalCount++;
                validSubarrays.push([startIdx[0] + 1, i]); // [start, end] indices
            }
        }
        
        if (!prefixSumMap.has(currentSum)) {
            prefixSumMap.set(currentSum, []);
        }
        prefixSumMap.get(currentSum).push([i]);
    }
    
    return {
        count: totalCount,
        subarrays: validSubarrays
    };
}

// Helper function to verify subarrays
function verifySubarrays(nums, k, subarrays) {
    for (const [start, end] of subarrays) {
        const sum = nums.slice(start, end + 1).reduce((a, b) => a + b, 0);
        if (sum !== k) {
            console.log(`Invalid subarray [${start}, ${end}]: sum = ${sum}, expected = ${k}`);
            return false;
        }
    }
    return true;
}

// Test the solution
function testSubarraySum() {
    // Test case 1: [1,1,1], k=2 -> 2
    console.log("Test 1:", subarraySum([1,1,1], 2)); // 2
    
    // Test case 2: [1,2,3], k=3 -> 2
    console.log("Test 2:", subarraySum([1,2,3], 3)); // 2
    
    // Test case 3: [1,-1,0], k=0 -> 3
    console.log("Test 3:", subarraySum([1,-1,0], 0)); // 3
    
    // Test case 4: Edge case with single element
    console.log("Test 4:", subarraySum([1], 1)); // 1
    
    // Test case 5: No valid subarrays
    console.log("Test 5:", subarraySum([1,2,3], 7)); // 0
    
    // Test case 6: With path tracking
    const result6 = subarraySumWithPaths([1,2,3], 3);
    console.log("Test 6 - Count:", result6.count);
    console.log("Test 6 - Subarrays:", result6.subarrays);
    console.log("Test 6 - Verification:", verifySubarrays([1,2,3], 3, result6.subarrays));
    
    // Performance comparison
    const largeArray = Array(1000).fill().map(() => Math.floor(Math.random() * 10) - 5);
    
    console.time("Hash Map Approach");
    const result1 = subarraySum(largeArray, 5);
    console.timeEnd("Hash Map Approach");
    
    console.time("Brute Force Approach");
    const result2 = subarraySumBruteForce(largeArray, 5);
    console.timeEnd("Brute Force Approach");
    
    console.log("Results match:", result1 === result2);
}
```

## Time and Space Complexity Analysis

**Hash Map Approach (Optimal):**
- **Time Complexity:** O(n)
  - Single pass through the array
  - HashMap operations (get/set) are O(1) on average
  - Each element is processed exactly once

- **Space Complexity:** O(n)
  - In worst case, all prefix sums are unique
  - HashMap can store up to n+1 entries

**Brute Force Approach:**
- **Time Complexity:** O(n²)
  - Nested loops: outer loop runs n times, inner loop runs up to n times
  - For each starting position, we check all possible ending positions

- **Space Complexity:** O(1)
  - Only using constant extra space for variables

**Key Insights:**

1. **Prefix Sum Concept:** 
   - prefix_sum[i] = sum of elements from index 0 to i
   - Sum of subarray from i to j = prefix_sum[j] - prefix_sum[i-1]

2. **Mathematical Relationship:**
   - If prefix_sum[j] - prefix_sum[i-1] = k
   - Then prefix_sum[i-1] = prefix_sum[j] - k
   - We look for this target sum in our hash map

3. **Why initialize with {0: 1}:**
   - Handles subarrays starting from index 0
   - Represents the empty prefix with sum 0

4. **Hash Map stores frequencies:**
   - Multiple prefix sums can have the same value
   - Each occurrence represents a potential starting point for a valid subarray