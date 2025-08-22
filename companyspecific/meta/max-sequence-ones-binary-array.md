# Max Sequence of 1s in Binary Array with K Flips

## Problem Statement
Given a binary array `nums` and an integer `k`, return the maximum number of consecutive 1's in the array if you can flip at most `k` 0's.

**LeetCode Problem Number: 1004 (Max Consecutive Ones III)**

## Sample Input and Output
**Input:** `nums = [1,1,1,0,0,0,1,1,1,1,0]`, `k = 2`
**Output:** `6`
**Explanation:** `[1,1,1,0,0,1,1,1,1,1,1]`
Bold numbers were flipped from 0 to 1. The longest subarray is underlined.

**Input:** `nums = [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1]`, `k = 3`
**Output:** `10`
**Explanation:** `[0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1]`
Bold numbers were flipped from 0 to 1. The longest subarray is underlined.

## Algorithm Outline
The most efficient approach uses **sliding window technique**:

1. Use two pointers (left and right) to maintain a sliding window
2. Expand the window by moving right pointer
3. Count zeros in the current window
4. If zeros count exceeds k, shrink window from left until zeros ≤ k
5. Track the maximum window size encountered

The key insight: Find the longest subarray with at most k zeros.

## Step-by-Step Dry Run
Let's trace through `nums = [1,1,1,0,0,0,1,1,1,1,0]`, `k = 2`:

1. **Initialize:** left = 0, right = 0, zeros = 0, maxLen = 0

2. **right = 0, nums[0] = 1:**
   - zeros = 0 ≤ k, window: [1], length = 1
   - maxLen = 1

3. **right = 1, nums[1] = 1:**
   - zeros = 0 ≤ k, window: [1,1], length = 2
   - maxLen = 2

4. **right = 2, nums[2] = 1:**
   - zeros = 0 ≤ k, window: [1,1,1], length = 3
   - maxLen = 3

5. **right = 3, nums[3] = 0:**
   - zeros = 1 ≤ k, window: [1,1,1,0], length = 4
   - maxLen = 4

6. **right = 4, nums[4] = 0:**
   - zeros = 2 ≤ k, window: [1,1,1,0,0], length = 5
   - maxLen = 5

7. **right = 5, nums[5] = 0:**
   - zeros = 3 > k, need to shrink window
   - Move left pointer: left = 0→1→2→3→4
   - When left = 4, window: [0,0], zeros = 2 ≤ k
   - Window: [0,0,0], length = 2, maxLen = 5

8. **Continue expanding...**
   - Eventually find window [0,0,1,1,1,1] with length 6
   - maxLen = 6

**Final result:** 6

## JavaScript Implementation

```javascript
// Approach 1: Sliding Window (Optimal)
function longestOnes(nums, k) {
    let left = 0;
    let maxLength = 0;
    let zerosCount = 0;
    
    for (let right = 0; right < nums.length; right++) {
        // Expand window: if we encounter a 0, increment zero count
        if (nums[right] === 0) {
            zerosCount++;
        }
        
        // Shrink window if we have more than k zeros
        while (zerosCount > k) {
            if (nums[left] === 0) {
                zerosCount--;
            }
            left++;
        }
        
        // Update maximum length
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Approach 2: Sliding Window with explicit window tracking
function longestOnesDetailed(nums, k) {
    let left = 0;
    let right = 0;
    let maxLength = 0;
    let zerosInWindow = 0;
    
    while (right < nums.length) {
        // Expand window by including nums[right]
        if (nums[right] === 0) {
            zerosInWindow++;
        }
        
        // If window is invalid (too many zeros), shrink from left
        while (zerosInWindow > k) {
            if (nums[left] === 0) {
                zerosInWindow--;
            }
            left++;
        }
        
        // Update maximum length of valid window
        maxLength = Math.max(maxLength, right - left + 1);
        right++;
    }
    
    return maxLength;
}

// Approach 3: Sliding Window with deque to track zero positions
function longestOnesDeque(nums, k) {
    const zeroIndices = []; // Store indices of zeros in current window
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < nums.length; right++) {
        // If current element is 0, add its index
        if (nums[right] === 0) {
            zeroIndices.push(right);
        }
        
        // If we have more than k zeros, shrink window
        if (zeroIndices.length > k) {
            left = zeroIndices.shift() + 1;
        }
        
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Approach 4: Alternative sliding window (never shrink, only expand)
function longestOnesNeverShrink(nums, k) {
    let left = 0;
    let zerosCount = 0;
    
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === 0) {
            zerosCount++;
        }
        
        // Only move left pointer when we exceed k zeros
        if (zerosCount > k) {
            if (nums[left] === 0) {
                zerosCount--;
            }
            left++;
        }
    }
    
    // Window size at the end is the maximum valid window found
    return nums.length - left;
}

// Approach 5: Brute Force (for comparison)
function longestOnesBruteForce(nums, k) {
    let maxLength = 0;
    
    for (let i = 0; i < nums.length; i++) {
        let zerosCount = 0;
        
        for (let j = i; j < nums.length; j++) {
            if (nums[j] === 0) {
                zerosCount++;
            }
            
            if (zerosCount <= k) {
                maxLength = Math.max(maxLength, j - i + 1);
            } else {
                break; // Too many zeros, no point continuing
            }
        }
    }
    
    return maxLength;
}

// Approach 6: With visualization for debugging
function longestOnesWithVisualization(nums, k) {
    let left = 0;
    let maxLength = 0;
    let zerosCount = 0;
    let bestWindow = [0, 0];
    
    console.log(`Input: [${nums.join(',')}], k = ${k}`);
    
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === 0) {
            zerosCount++;
        }
        
        while (zerosCount > k) {
            if (nums[left] === 0) {
                zerosCount--;
            }
            left++;
        }
        
        const currentLength = right - left + 1;
        if (currentLength > maxLength) {
            maxLength = currentLength;
            bestWindow = [left, right];
        }
        
        console.log(`Window [${left}, ${right}]: [${nums.slice(left, right + 1).join(',')}], length=${currentLength}, zeros=${zerosCount}`);
    }
    
    console.log(`Best window: [${bestWindow[0]}, ${bestWindow[1]}], length=${maxLength}`);
    console.log(`Best subarray: [${nums.slice(bestWindow[0], bestWindow[1] + 1).join(',')}]`);
    
    return maxLength;
}

// Advanced: Handle edge cases
function longestOnesRobust(nums, k) {
    // Edge cases
    if (!nums || nums.length === 0) return 0;
    if (k >= nums.length) return nums.length;
    
    // Count total zeros
    const totalZeros = nums.filter(num => num === 0).length;
    if (totalZeros <= k) return nums.length;
    
    let left = 0;
    let maxLength = 0;
    let zerosCount = 0;
    
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === 0) {
            zerosCount++;
        }
        
        while (zerosCount > k) {
            if (nums[left] === 0) {
                zerosCount--;
            }
            left++;
        }
        
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

// Test the solution
function testLongestOnes() {
    const testCases = [
        { nums: [1,1,1,0,0,0,1,1,1,1,0], k: 2, expected: 6 },
        { nums: [0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1], k: 3, expected: 10 },
        { nums: [1,1,1,1], k: 0, expected: 4 },
        { nums: [0,0,0,0], k: 2, expected: 2 },
        { nums: [1,0,1,0,1], k: 1, expected: 3 },
        { nums: [0,1,1,0,0,1,1,0,1], k: 2, expected: 6 },
        { nums: [1], k: 1, expected: 1 },
        { nums: [0], k: 1, expected: 1 },
        { nums: [0], k: 0, expected: 0 }
    ];
    
    console.log("Testing longestOnes function:");
    testCases.forEach((test, index) => {
        const result = longestOnes(test.nums, test.k);
        const passed = result === test.expected;
        console.log(`Test ${index + 1}: [${test.nums.join(',')}], k=${test.k} -> ${result} (expected: ${test.expected}) ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    // Performance comparison
    const largeArray = Array(100000).fill().map(() => Math.random() > 0.3 ? 1 : 0);
    
    console.time("Sliding Window");
    longestOnes(largeArray, 1000);
    console.timeEnd("Sliding Window");
    
    console.time("Brute Force");
    longestOnesBruteForce(largeArray.slice(0, 1000), 10); // Smaller array for brute force
    console.timeEnd("Brute Force");
}

// Extension: Return the actual longest subarray
function longestOnesSubarray(nums, k) {
    let left = 0;
    let maxLength = 0;
    let zerosCount = 0;
    let bestStart = 0;
    let bestEnd = 0;
    
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === 0) {
            zerosCount++;
        }
        
        while (zerosCount > k) {
            if (nums[left] === 0) {
                zerosCount--;
            }
            left++;
        }
        
        if (right - left + 1 > maxLength) {
            maxLength = right - left + 1;
            bestStart = left;
            bestEnd = right;
        }
    }
    
    return {
        length: maxLength,
        subarray: nums.slice(bestStart, bestEnd + 1),
        indices: [bestStart, bestEnd]
    };
}
```

## Time and Space Complexity Analysis

**Sliding Window Approach (Optimal):**
- **Time Complexity:** O(n)
  - Each element is visited at most twice (once by right pointer, once by left pointer)
  - Both pointers move only forward, never backward
  - Amortized O(1) per element

- **Space Complexity:** O(1)
  - Only using constant extra space for variables (left, right, zerosCount, maxLength)
  - No additional data structures needed

**Deque Approach:**
- **Time Complexity:** O(n)
  - Each element is added and removed from deque at most once
  - Deque operations are O(1)

- **Space Complexity:** O(k)
  - Deque stores at most k zero indices
  - Space usage scales with k, not n

**Brute Force Approach:**
- **Time Complexity:** O(n²)
  - Nested loops: outer loop runs n times, inner loop runs up to n times
  - For each starting position, check all possible ending positions

- **Space Complexity:** O(1)
  - Only using constant space for variables

**Key Insights:**
1. **Transform the problem:** Find longest subarray with at most k zeros
2. **Sliding window pattern:** Expand right, shrink left when constraint violated
3. **Amortized analysis:** Each element processed at most twice
4. **Window validity:** Maintain zerosCount ≤ k invariant
5. **No need to reset:** Window can slide continuously without resetting