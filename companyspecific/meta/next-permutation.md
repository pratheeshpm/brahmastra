# Next Permutation - LeetCode #31

## Problem Explanation
Find the next lexicographically greater permutation of numbers. If such an arrangement is not possible, it must rearrange as the lowest possible order (i.e., sorted in ascending order). The replacement must be in place and use only constant extra memory.

## Sample Input and Output

**Example 1:**
```
Input: nums = [1,2,3]
Output: [1,3,2]
Explanation: The next permutation of [1,2,3] is [1,3,2]
```

**Example 2:**
```
Input: nums = [3,2,1]
Output: [1,2,3]
Explanation: [3,2,1] is the largest permutation, so wrap around to smallest
```

**Example 3:**
```
Input: nums = [1,1,5]
Output: [1,5,1]
Explanation: The next permutation after [1,1,5] is [1,5,1]
```

## Algorithm Outline
1. **Find pivot**: From right, find first decreasing element (nums[i] < nums[i+1])
2. **If no pivot**: Array is in descending order, reverse entire array
3. **Find successor**: From right, find first element greater than pivot
4. **Swap**: Swap pivot with its successor
5. **Reverse suffix**: Reverse elements after original pivot position

## Step-by-Step Dry Run
Using input `nums = [1,2,3]`:

1. **Find pivot**: Scan from right to left
   - i = 1: nums[1] = 2, nums[2] = 3, 2 < 3 ✓ (found pivot at index 1)
   
2. **Find successor**: Scan from right to find element > nums[1] = 2
   - j = 2: nums[2] = 3, 3 > 2 ✓ (found successor at index 2)
   
3. **Swap**: Swap nums[1] and nums[2]
   - Array becomes: [1,3,2]
   
4. **Reverse suffix**: Reverse elements after index 1
   - Only nums[2] = 2 remains, no reversal needed
   
5. **Final result**: [1,3,2]

## JavaScript Implementation

```javascript
function nextPermutation(nums) {
    let i = nums.length - 2;
    
    // Step 1: Find the first decreasing element from right
    while (i >= 0 && nums[i] >= nums[i + 1]) {
        i--;
    }
    
    // Step 2: If no such element found, reverse entire array
    if (i === -1) {
        reverse(nums, 0, nums.length - 1);
        return;
    }
    
    // Step 3: Find the first element greater than nums[i] from right
    let j = nums.length - 1;
    while (nums[j] <= nums[i]) {
        j--;
    }
    
    // Step 4: Swap nums[i] and nums[j]
    swap(nums, i, j);
    
    // Step 5: Reverse the suffix starting at i + 1
    reverse(nums, i + 1, nums.length - 1);
}

function swap(nums, i, j) {
    [nums[i], nums[j]] = [nums[j], nums[i]];
}

function reverse(nums, start, end) {
    while (start < end) {
        swap(nums, start, end);
        start++;
        end--;
    }
}

// Alternative implementation with detailed comments
function nextPermutationVerbose(nums) {
    const n = nums.length;
    
    // Find the largest index i such that nums[i] < nums[i + 1]
    let pivotIndex = -1;
    for (let i = n - 2; i >= 0; i--) {
        if (nums[i] < nums[i + 1]) {
            pivotIndex = i;
            break;
        }
    }
    
    // If no such index exists, the permutation is the last permutation
    if (pivotIndex === -1) {
        nums.reverse();
        return;
    }
    
    // Find the largest index j greater than i such that nums[i] < nums[j]
    let successorIndex = -1;
    for (let j = n - 1; j > pivotIndex; j--) {
        if (nums[j] > nums[pivotIndex]) {
            successorIndex = j;
            break;
        }
    }
    
    // Swap the value of nums[i] with that of nums[j]
    [nums[pivotIndex], nums[successorIndex]] = [nums[successorIndex], nums[pivotIndex]];
    
    // Reverse the suffix starting at nums[i + 1]
    let left = pivotIndex + 1;
    let right = n - 1;
    while (left < right) {
        [nums[left], nums[right]] = [nums[right], nums[left]];
        left++;
        right--;
    }
}

// Helper function to generate all permutations for verification
function getAllPermutations(nums) {
    const result = [];
    const current = [...nums];
    
    function backtrack() {
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }
        
        for (let i = 0; i < nums.length; i++) {
            if (current.includes(nums[i])) continue;
            current.push(nums[i]);
            backtrack();
            current.pop();
        }
    }
    
    backtrack();
    return result.sort();
}

// Test cases
function testNextPermutation() {
    const testCases = [
        [1, 2, 3],
        [3, 2, 1],
        [1, 1, 5],
        [1, 3, 2],
        [2, 3, 1],
        [1, 2, 3, 4],
        [4, 3, 2, 1],
        [1, 5, 1],
        [5, 4, 7, 5, 3, 2]
    ];
    
    testCases.forEach(nums => {
        const original = [...nums];
        nextPermutation(nums);
        console.log(`Input: [${original.join(',')}] | Next: [${nums.join(',')}]`);
    });
}

// Verify algorithm correctness
function verifyNextPermutation(nums) {
    const allPerms = getAllPermutations([...new Set(nums.sort())]);
    const original = [...nums];
    nextPermutation(nums);
    
    console.log(`Original: [${original.join(',')}]`);
    console.log(`Next: [${nums.join(',')}]`);
    console.log(`All permutations: ${allPerms.map(p => `[${p.join(',')}]`).join(', ')}`);
}

// testNextPermutation();
```

## Time and Space Complexity

**Time Complexity:** O(n) where n is the length of the array
- Finding the pivot: O(n) in worst case
- Finding the successor: O(n) in worst case  
- Swapping: O(1)
- Reversing suffix: O(n) in worst case
- Total: O(n) since each step is linear

**Space Complexity:** O(1)
- We only use a constant amount of extra space for variables
- All operations are performed in-place on the input array
- No additional data structures are created

**Key Insights:**
1. **Lexicographic order**: The algorithm finds the smallest possible increment
2. **Suffix property**: After finding pivot, the suffix is in descending order
3. **Minimal change**: We make the smallest possible change to get next permutation
4. **Wraparound**: When no next permutation exists, return to first permutation

**Edge Cases Handled:**
- Array in descending order (largest permutation)
- Arrays with duplicate elements
- Single element arrays
- Arrays where next permutation requires minimal change