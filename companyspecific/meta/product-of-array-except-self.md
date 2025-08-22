# Product of Array Except Self

## Problem Statement
Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.

The product of any prefix or suffix of `nums` is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.

**LeetCode Problem Number: 238**

## Sample Input and Output
**Input:** `nums = [1,2,3,4]`
**Output:** `[24,12,8,6]`
**Explanation:** 
- answer[0] = 2*3*4 = 24
- answer[1] = 1*3*4 = 12  
- answer[2] = 1*2*4 = 8
- answer[3] = 1*2*3 = 6

**Input:** `nums = [-1,1,0,-3,3]`
**Output:** `[0,0,9,0,0]`
**Explanation:**
- answer[0] = 1*0*(-3)*3 = 0
- answer[1] = (-1)*0*(-3)*3 = 0
- answer[2] = (-1)*1*(-3)*3 = 9
- answer[3] = (-1)*1*0*3 = 0
- answer[4] = (-1)*1*0*(-3) = 0

## Algorithm Outline
The optimal approach uses **left and right products in two passes**:

1. **First pass (left to right):** Calculate product of all elements to the left of each index
2. **Second pass (right to left):** Calculate product of all elements to the right, multiply with left products
3. Use the result array to store left products, then update in-place with final results

Key insight: For index i, result[i] = (product of elements left of i) × (product of elements right of i)

## Step-by-Step Dry Run
Let's trace through `nums = [1,2,3,4]`:

**Pass 1 - Left products:**
- result[0] = 1 (no elements to the left)
- result[1] = 1 (product of elements left of index 1)
- result[2] = 1*2 = 2 (product of elements left of index 2)
- result[3] = 1*2*3 = 6 (product of elements left of index 3)
- result = [1, 1, 2, 6]

**Pass 2 - Right products (multiply with left):**
- rightProduct = 1 (initialize)
- Index 3: result[3] = 6 * 1 = 6, rightProduct = 1 * 4 = 4
- Index 2: result[2] = 2 * 4 = 8, rightProduct = 4 * 3 = 12
- Index 1: result[1] = 1 * 12 = 12, rightProduct = 12 * 2 = 24
- Index 0: result[0] = 1 * 24 = 24, rightProduct = 24 * 1 = 24

**Final result:** [24, 12, 8, 6]

## JavaScript Implementation

```javascript
// Approach 1: Two-pass with O(1) extra space (Optimal)
function productExceptSelf(nums) {
    const n = nums.length;
    const result = new Array(n);
    
    // First pass: calculate left products
    result[0] = 1;
    for (let i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    
    // Second pass: calculate right products and multiply with left
    let rightProduct = 1;
    for (let i = n - 1; i >= 0; i--) {
        result[i] *= rightProduct;
        rightProduct *= nums[i];
    }
    
    return result;
}

// Approach 2: Using separate left and right arrays (for clarity)
function productExceptSelfTwoArrays(nums) {
    const n = nums.length;
    const left = new Array(n);
    const right = new Array(n);
    const result = new Array(n);
    
    // Calculate left products
    left[0] = 1;
    for (let i = 1; i < n; i++) {
        left[i] = left[i - 1] * nums[i - 1];
    }
    
    // Calculate right products
    right[n - 1] = 1;
    for (let i = n - 2; i >= 0; i--) {
        right[i] = right[i + 1] * nums[i + 1];
    }
    
    // Multiply left and right products
    for (let i = 0; i < n; i++) {
        result[i] = left[i] * right[i];
    }
    
    return result;
}

// Approach 3: Division approach (if division was allowed)
function productExceptSelfDivision(nums) {
    const n = nums.length;
    const result = new Array(n);
    
    // Calculate total product and count zeros
    let totalProduct = 1;
    let zeroCount = 0;
    let zeroIndex = -1;
    
    for (let i = 0; i < n; i++) {
        if (nums[i] === 0) {
            zeroCount++;
            zeroIndex = i;
        } else {
            totalProduct *= nums[i];
        }
    }
    
    // Handle different cases based on zero count
    for (let i = 0; i < n; i++) {
        if (zeroCount > 1) {
            result[i] = 0;
        } else if (zeroCount === 1) {
            result[i] = (i === zeroIndex) ? totalProduct : 0;
        } else {
            result[i] = totalProduct / nums[i];
        }
    }
    
    return result;
}

// Approach 4: Functional programming style
function productExceptSelfFunctional(nums) {
    const n = nums.length;
    
    // Create left products array
    const leftProducts = nums.reduce((acc, num, i) => {
        acc.push(i === 0 ? 1 : acc[i - 1] * nums[i - 1]);
        return acc;
    }, []);
    
    // Create result with right products
    let rightProduct = 1;
    return leftProducts.map((leftProd, i) => {
        const result = leftProd * rightProduct;
        rightProduct *= nums[n - 1 - i];
        return result;
    }).reverse();
}

// Approach 5: With detailed comments for interview
function productExceptSelfDetailed(nums) {
    const n = nums.length;
    const answer = new Array(n);
    
    // Step 1: Fill answer array with left products
    // answer[i] contains the product of all elements to the left of i
    answer[0] = 1; // No elements to the left of first element
    
    for (let i = 1; i < n; i++) {
        // Product of all elements to the left of i
        answer[i] = answer[i - 1] * nums[i - 1];
    }
    
    // At this point: answer = [1, nums[0], nums[0]*nums[1], nums[0]*nums[1]*nums[2], ...]
    
    // Step 2: Multiply with right products
    // We'll traverse from right to left and multiply answer[i] with product of all elements to the right
    let rightProduct = 1; // Product of elements to the right of current position
    
    for (let i = n - 1; i >= 0; i--) {
        // Multiply left product (already in answer[i]) with right product
        answer[i] = answer[i] * rightProduct;
        
        // Update right product for next iteration
        rightProduct = rightProduct * nums[i];
    }
    
    return answer;
}

// Approach 6: Handle edge cases explicitly
function productExceptSelfRobust(nums) {
    if (!nums || nums.length === 0) return [];
    if (nums.length === 1) return [1];
    
    const n = nums.length;
    const result = new Array(n);
    
    // Calculate left products
    result[0] = 1;
    for (let i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    
    // Calculate right products and combine
    let rightProduct = 1;
    for (let i = n - 1; i >= 0; i--) {
        result[i] *= rightProduct;
        rightProduct *= nums[i];
    }
    
    return result;
}

// Test the solution
function testProductExceptSelf() {
    const testCases = [
        [1, 2, 3, 4],
        [-1, 1, 0, -3, 3],
        [2, 3, 4, 5],
        [1, 0],
        [0, 0],
        [5],
        [1, 2],
        [-1, -2, -3, -4]
    ];
    
    console.log("Testing productExceptSelf function:");
    testCases.forEach((test, index) => {
        const result = productExceptSelf([...test]); // Clone to avoid mutation
        console.log(`Test ${index + 1}: [${test.join(',')}] -> [${result.join(',')}]`);
        
        // Verify result
        const isValid = verifyResult(test, result);
        console.log(`Verification: ${isValid ? 'PASS' : 'FAIL'}`);
        console.log();
    });
    
    // Performance comparison
    const largeArray = Array(10000).fill().map((_, i) => i + 1);
    
    console.time("Optimal Approach");
    productExceptSelf([...largeArray]);
    console.timeEnd("Optimal Approach");
    
    console.time("Two Arrays Approach");
    productExceptSelfTwoArrays([...largeArray]);
    console.timeEnd("Two Arrays Approach");
}

// Helper function to verify the result
function verifyResult(nums, result) {
    if (nums.length !== result.length) return false;
    
    for (let i = 0; i < nums.length; i++) {
        let expectedProduct = 1;
        for (let j = 0; j < nums.length; j++) {
            if (i !== j) {
                expectedProduct *= nums[j];
            }
        }
        if (Math.abs(result[i] - expectedProduct) > 1e-10) {
            return false;
        }
    }
    return true;
}

// Advanced: Handle very large numbers with BigInt
function productExceptSelfBigInt(nums) {
    const n = nums.length;
    const result = new Array(n);
    
    // Convert to BigInt for large number handling
    const bigNums = nums.map(num => BigInt(num));
    
    // Calculate left products
    result[0] = 1n;
    for (let i = 1; i < n; i++) {
        result[i] = result[i - 1] * bigNums[i - 1];
    }
    
    // Calculate right products and combine
    let rightProduct = 1n;
    for (let i = n - 1; i >= 0; i--) {
        result[i] *= rightProduct;
        rightProduct *= bigNums[i];
    }
    
    // Convert back to regular numbers
    return result.map(num => Number(num));
}
```

## Time and Space Complexity Analysis

**Optimal Approach (Two-pass):**
- **Time Complexity:** O(n)
  - First pass through array: O(n)
  - Second pass through array: O(n)
  - Total: O(n) + O(n) = O(n)

- **Space Complexity:** O(1)
  - Only using constant extra space (rightProduct variable)
  - Output array doesn't count as extra space
  - No additional arrays needed

**Two Arrays Approach:**
- **Time Complexity:** O(n)
  - Three separate O(n) passes
  - Total: 3 × O(n) = O(n)

- **Space Complexity:** O(n)
  - Two additional arrays (left and right) each of size n
  - Total extra space: 2n = O(n)

**Division Approach (if allowed):**
- **Time Complexity:** O(n)
  - One pass to calculate total product
  - One pass to fill result array

- **Space Complexity:** O(1)
  - Only constant extra variables

**Key Insights:**
1. **No division constraint:** Forces us to think about prefix/suffix products
2. **Two-pass optimization:** Use result array to store intermediate values
3. **Left-to-right then right-to-left:** Builds complete solution efficiently
4. **Handles zeros naturally:** Algorithm works correctly with zero values
5. **In-place computation:** Minimize space usage by reusing result array