# Permutations

## Problem Statement
Given an array `nums` of distinct integers, return all the possible permutations. You can return the answer in any order.

**LeetCode Problem Number: 46**

## Sample Input and Output
**Input:** `nums = [1,2,3]`
**Output:** `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`

**Input:** `nums = [0,1]`
**Output:** `[[0,1],[1,0]]`

**Input:** `nums = [1]`
**Output:** `[[1]]`

## Algorithm Outline
The most intuitive approach uses **backtracking**:

1. Use recursive backtracking to build permutations
2. At each step, try placing each unused number in the current position
3. Mark numbers as used/unused using a visited array or by swapping
4. When current permutation length equals input length, add to result
5. Backtrack by unmarking the current choice

Alternative approaches:
- **Iterative with swapping**: Use Heap's algorithm
- **Next permutation**: Generate in lexicographical order

## Step-by-Step Dry Run
Let's trace through `nums = [1,2,3]`:

**Backtracking tree:**
```
                    []
            /       |       \
         [1]       [2]      [3]
        /   \     /   \    /   \
    [1,2] [1,3] [2,1] [2,3] [3,1] [3,2]
     |     |     |     |     |     |
  [1,2,3] [1,3,2] [2,1,3] [2,3,1] [3,1,2] [3,2,1]
```

**Detailed trace:**
1. Start with empty current = [], used = [false, false, false]
2. Try 1: current = [1], used = [true, false, false]
   - Try 2: current = [1,2], used = [true, true, false]
     - Try 3: current = [1,2,3], used = [true, true, true] → Add to result
     - Backtrack: current = [1,2], used = [true, true, false]
   - Backtrack: current = [1], used = [true, false, false]
   - Try 3: current = [1,3], used = [true, false, true]
     - Try 2: current = [1,3,2], used = [true, true, true] → Add to result
     - Backtrack: current = [1,3], used = [true, false, true]
   - Backtrack: current = [1], used = [true, false, false]
3. Backtrack: current = [], used = [false, false, false]
4. Continue with 2 and 3...

**Final result:** `[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]`

## JavaScript Implementation

```javascript
// Approach 1: Backtracking with used array
function permute(nums) {
    const result = [];
    const current = [];
    const used = new Array(nums.length).fill(false);
    
    function backtrack() {
        // Base case: permutation is complete
        if (current.length === nums.length) {
            result.push([...current]); // Make a copy
            return;
        }
        
        // Try each unused number
        for (let i = 0; i < nums.length; i++) {
            if (!used[i]) {
                // Choose
                current.push(nums[i]);
                used[i] = true;
                
                // Explore
                backtrack();
                
                // Unchoose (backtrack)
                current.pop();
                used[i] = false;
            }
        }
    }
    
    backtrack();
    return result;
}

// Approach 2: Backtracking with swapping (no extra space for used array)
function permuteSwap(nums) {
    const result = [];
    
    function backtrack(start) {
        // Base case: permutation is complete
        if (start === nums.length) {
            result.push([...nums]); // Make a copy
            return;
        }
        
        // Try each position from start to end
        for (let i = start; i < nums.length; i++) {
            // Swap current element to start position
            [nums[start], nums[i]] = [nums[i], nums[start]];
            
            // Recurse with next position
            backtrack(start + 1);
            
            // Backtrack: restore original order
            [nums[start], nums[i]] = [nums[i], nums[start]];
        }
    }
    
    backtrack(0);
    return result;
}

// Approach 3: Iterative approach
function permuteIterative(nums) {
    let result = [[]];
    
    for (const num of nums) {
        const newResult = [];
        
        for (const permutation of result) {
            // Insert num at each possible position
            for (let i = 0; i <= permutation.length; i++) {
                const newPermutation = [
                    ...permutation.slice(0, i),
                    num,
                    ...permutation.slice(i)
                ];
                newResult.push(newPermutation);
            }
        }
        
        result = newResult;
    }
    
    return result;
}

// Approach 4: Using built-in array methods (functional style)
function permuteFunctional(nums) {
    if (nums.length <= 1) return [nums];
    
    const result = [];
    
    for (let i = 0; i < nums.length; i++) {
        const current = nums[i];
        const remaining = nums.slice(0, i).concat(nums.slice(i + 1));
        const permsOfRemaining = permuteFunctional(remaining);
        
        for (const perm of permsOfRemaining) {
            result.push([current, ...perm]);
        }
    }
    
    return result;
}

// Approach 5: Heap's Algorithm (efficient for generating all permutations)
function permuteHeaps(nums) {
    const result = [];
    const arr = [...nums]; // Work with a copy
    
    function generate(k) {
        if (k === 1) {
            result.push([...arr]);
            return;
        }
        
        generate(k - 1);
        
        for (let i = 0; i < k - 1; i++) {
            if (k % 2 === 0) {
                // k is even: swap i with k-1
                [arr[i], arr[k - 1]] = [arr[k - 1], arr[i]];
            } else {
                // k is odd: swap 0 with k-1
                [arr[0], arr[k - 1]] = [arr[k - 1], arr[0]];
            }
            generate(k - 1);
        }
    }
    
    generate(nums.length);
    return result;
}

// Approach 6: Lexicographic order (using next permutation)
function permuteLexicographic(nums) {
    const result = [];
    const arr = [...nums].sort((a, b) => a - b); // Start with sorted array
    
    function nextPermutation() {
        // Find the largest index k such that arr[k] < arr[k + 1]
        let k = -1;
        for (let i = arr.length - 2; i >= 0; i--) {
            if (arr[i] < arr[i + 1]) {
                k = i;
                break;
            }
        }
        
        if (k === -1) return false; // No more permutations
        
        // Find the largest index l such that arr[k] < arr[l]
        let l = -1;
        for (let i = arr.length - 1; i > k; i--) {
            if (arr[k] < arr[i]) {
                l = i;
                break;
            }
        }
        
        // Swap arr[k] and arr[l]
        [arr[k], arr[l]] = [arr[l], arr[k]];
        
        // Reverse the suffix starting at arr[k + 1]
        let left = k + 1;
        let right = arr.length - 1;
        while (left < right) {
            [arr[left], arr[right]] = [arr[right], arr[left]];
            left++;
            right--;
        }
        
        return true;
    }
    
    // Add first permutation
    result.push([...arr]);
    
    // Generate all other permutations
    while (nextPermutation()) {
        result.push([...arr]);
    }
    
    return result;
}

// Helper function to verify all permutations are unique and correct
function verifyPermutations(nums, permutations) {
    const expected = factorial(nums.length);
    if (permutations.length !== expected) {
        console.log(`Expected ${expected} permutations, got ${permutations.length}`);
        return false;
    }
    
    // Check for duplicates
    const uniquePerms = new Set(permutations.map(p => JSON.stringify(p)));
    if (uniquePerms.size !== permutations.length) {
        console.log("Found duplicate permutations");
        return false;
    }
    
    // Check each permutation has all original elements
    for (const perm of permutations) {
        if (perm.length !== nums.length) return false;
        
        const sortedPerm = [...perm].sort();
        const sortedNums = [...nums].sort();
        
        if (JSON.stringify(sortedPerm) !== JSON.stringify(sortedNums)) {
            return false;
        }
    }
    
    return true;
}

function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// Test the solution
function testPermute() {
    const testCases = [
        [1, 2, 3],
        [0, 1],
        [1],
        [1, 2, 3, 4], // Test with 4 elements
        [-1, 0, 1]    // Test with negative numbers
    ];
    
    console.log("Testing permute functions:");
    testCases.forEach((test, index) => {
        console.log(`\nTest ${index + 1}: [${test.join(',')}]`);
        
        const result1 = permute([...test]);
        const result2 = permuteSwap([...test]);
        const result3 = permuteIterative([...test]);
        
        console.log(`Backtracking: ${result1.length} permutations`);
        console.log(`Swapping: ${result2.length} permutations`);
        console.log(`Iterative: ${result3.length} permutations`);
        
        const isValid1 = verifyPermutations(test, result1);
        const isValid2 = verifyPermutations(test, result2);
        const isValid3 = verifyPermutations(test, result3);
        
        console.log(`Verification: ${isValid1 && isValid2 && isValid3 ? 'PASS' : 'FAIL'}`);
        
        if (test.length <= 3) {
            console.log(`Result: ${JSON.stringify(result1)}`);
        }
    });
    
    // Performance comparison
    const perfTest = [1, 2, 3, 4, 5, 6, 7];
    
    console.log("\nPerformance comparison (7 elements):");
    
    console.time("Backtracking");
    permute([...perfTest]);
    console.timeEnd("Backtracking");
    
    console.time("Swapping");
    permuteSwap([...perfTest]);
    console.timeEnd("Swapping");
    
    console.time("Iterative");
    permuteIterative([...perfTest]);
    console.timeEnd("Iterative");
    
    console.time("Heap's Algorithm");
    permuteHeaps([...perfTest]);
    console.timeEnd("Heap's Algorithm");
}
```

## Time and Space Complexity Analysis

**Backtracking Approach:**
- **Time Complexity:** O(n! × n)
  - There are n! permutations to generate
  - Each permutation takes O(n) time to construct and copy
  - Total: O(n! × n)

- **Space Complexity:** O(n)
  - Recursion depth is O(n)
  - Used array takes O(n) space
  - Current array takes O(n) space
  - Not counting output space: O(n)

**Swapping Approach:**
- **Time Complexity:** O(n! × n)
  - Same as backtracking: n! permutations, O(n) to copy each

- **Space Complexity:** O(n)
  - Only recursion stack space: O(n)
  - No additional arrays needed (in-place swapping)

**Iterative Approach:**
- **Time Complexity:** O(n! × n²)
  - For each of n elements, we iterate through all existing permutations
  - At step k, we have (k-1)! permutations, each taking O(k) time to process
  - Overall complexity is higher due to array slicing operations

- **Space Complexity:** O(n! × n)
  - Storing all intermediate results
  - Each permutation takes O(n) space

**Heap's Algorithm:**
- **Time Complexity:** O(n!)
  - Most efficient for generating all permutations
  - Minimal number of swaps between consecutive permutations

- **Space Complexity:** O(n)
  - Only recursion stack and working array

**Key Insights:**
1. **Factorial growth:** Number of permutations grows as n!
2. **Backtracking pattern:** Choose, explore, unchoose
3. **Space optimization:** Swapping approach saves space over used array
4. **Copy necessity:** Must copy arrays when adding to result (avoid reference issues)
5. **Lexicographic ordering:** Can generate permutations in sorted order using next permutation algorithm