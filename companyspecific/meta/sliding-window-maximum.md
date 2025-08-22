# Sliding Window Maximum

## Problem Statement
You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left of the array to the very right. You can only see the `k` numbers in the window. Each time the sliding window moves right by one position.

Return the max sliding window.

**LeetCode Problem Number: 239**

## Sample Input and Output
**Input:** `nums = [1,3,-1,-3,5,3,6,7]`, `k = 3`
**Output:** `[3,3,5,5,6,7]`
**Explanation:**
```
Window position                Max
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7
```

**Input:** `nums = [1]`, `k = 1`
**Output:** `[1]`

## Algorithm Outline
The most efficient approach uses a **deque (double-ended queue)**:

1. Use a deque to store indices of array elements
2. Maintain deque in decreasing order of values (front has the maximum)
3. For each window:
   - Remove indices that are out of current window from front
   - Remove indices from back while current element is larger (they'll never be maximum)
   - Add current index to back
   - The front of deque gives the maximum for current window

Alternative approaches:
- **Brute Force**: For each window, find maximum (O(nk))
- **Heap**: Use max heap but need to track positions (O(n log k))

## Step-by-Step Dry Run
Let's trace through `nums = [1,3,-1,-3,5,3,6,7]`, `k = 3`:

**Initial:** deque = [], result = []

1. **i=0, nums[0]=1:**
   - deque = [0] (store index)
   - Window not complete yet

2. **i=1, nums[1]=3:**
   - 3 > 1, remove index 0 from back
   - deque = [1]
   - Window not complete yet

3. **i=2, nums[2]=-1:**
   - -1 < 3, just add index 2
   - deque = [1, 2]
   - Window [1,3,-1] complete, max = nums[1] = 3
   - result = [3]

4. **i=3, nums[3]=-3:**
   - Check front: index 1 still in window [1,2,3] ✓
   - -3 < -1, just add index 3
   - deque = [1, 2, 3]
   - Window [3,-1,-3] complete, max = nums[1] = 3
   - result = [3, 3]

5. **i=4, nums[4]=5:**
   - Check front: index 1 out of window [2,3,4] ✗
   - Remove index 1 from front: deque = [2, 3]
   - 5 > -1 and 5 > -3, remove indices 2,3 from back
   - deque = [4]
   - Window [-1,-3,5] complete, max = nums[4] = 5
   - result = [3, 3, 5]

6. **Continue this process...**
   - Final result: [3, 3, 5, 5, 6, 7]

## JavaScript Implementation

```javascript
// Approach 1: Deque (Optimal)
function maxSlidingWindow(nums, k) {
    if (!nums || nums.length === 0 || k <= 0) return [];
    if (k === 1) return nums;
    
    const deque = []; // Store indices
    const result = [];
    
    for (let i = 0; i < nums.length; i++) {
        // Remove indices that are out of current window
        while (deque.length > 0 && deque[0] <= i - k) {
            deque.shift();
        }
        
        // Remove indices from back while current element is larger
        // (they will never be maximum in any future window)
        while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
            deque.pop();
        }
        
        // Add current index
        deque.push(i);
        
        // Add to result when window is complete
        if (i >= k - 1) {
            result.push(nums[deque[0]]);
        }
    }
    
    return result;
}

// Approach 2: Deque with more explicit logic
function maxSlidingWindowVerbose(nums, k) {
    const result = [];
    const deque = []; // indices in decreasing order of values
    
    for (let i = 0; i < nums.length; i++) {
        // Remove elements outside current window
        while (deque.length > 0 && deque[0] < i - k + 1) {
            deque.shift();
        }
        
        // Maintain decreasing order in deque
        while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
            deque.pop();
        }
        
        deque.push(i);
        
        // Window is ready when we have processed k elements
        if (i >= k - 1) {
            result.push(nums[deque[0]]);
        }
    }
    
    return result;
}

// Approach 3: Brute Force (for comparison)
function maxSlidingWindowBruteForce(nums, k) {
    if (!nums || nums.length === 0 || k <= 0) return [];
    
    const result = [];
    
    for (let i = 0; i <= nums.length - k; i++) {
        let max = nums[i];
        for (let j = i + 1; j < i + k; j++) {
            max = Math.max(max, nums[j]);
        }
        result.push(max);
    }
    
    return result;
}

// Approach 4: Using Max Heap (less efficient due to heap operations)
class MaxHeap {
    constructor() {
        this.heap = [];
    }
    
    push(val, index) {
        this.heap.push([val, index]);
        this.heapifyUp(this.heap.length - 1);
    }
    
    pop() {
        if (this.heap.length === 0) return null;
        
        const max = this.heap[0];
        const last = this.heap.pop();
        
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.heapifyDown(0);
        }
        
        return max;
    }
    
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }
    
    heapifyUp(index) {
        const parentIndex = Math.floor((index - 1) / 2);
        if (parentIndex >= 0 && this.heap[parentIndex][0] < this.heap[index][0]) {
            [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
            this.heapifyUp(parentIndex);
        }
    }
    
    heapifyDown(index) {
        const leftChild = 2 * index + 1;
        const rightChild = 2 * index + 2;
        let largest = index;
        
        if (leftChild < this.heap.length && this.heap[leftChild][0] > this.heap[largest][0]) {
            largest = leftChild;
        }
        
        if (rightChild < this.heap.length && this.heap[rightChild][0] > this.heap[largest][0]) {
            largest = rightChild;
        }
        
        if (largest !== index) {
            [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
            this.heapifyDown(largest);
        }
    }
}

function maxSlidingWindowHeap(nums, k) {
    if (!nums || nums.length === 0 || k <= 0) return [];
    
    const result = [];
    const heap = new MaxHeap();
    
    // Initialize first window
    for (let i = 0; i < k; i++) {
        heap.push(nums[i], i);
    }
    
    result.push(heap.peek()[0]);
    
    // Slide the window
    for (let i = k; i < nums.length; i++) {
        heap.push(nums[i], i);
        
        // Remove elements outside current window
        while (heap.peek() && heap.peek()[1] <= i - k) {
            heap.pop();
        }
        
        result.push(heap.peek()[0]);
    }
    
    return result;
}

// Approach 5: Optimized with left and right max arrays
function maxSlidingWindowOptimized(nums, k) {
    const n = nums.length;
    if (n === 0 || k === 0) return [];
    if (k === 1) return nums;
    
    const left = new Array(n);
    const right = new Array(n);
    
    // Fill left array
    left[0] = nums[0];
    for (let i = 1; i < n; i++) {
        left[i] = (i % k === 0) ? nums[i] : Math.max(left[i - 1], nums[i]);
    }
    
    // Fill right array
    right[n - 1] = nums[n - 1];
    for (let i = n - 2; i >= 0; i--) {
        right[i] = ((i + 1) % k === 0) ? nums[i] : Math.max(right[i + 1], nums[i]);
    }
    
    const result = [];
    for (let i = 0; i <= n - k; i++) {
        result.push(Math.max(right[i], left[i + k - 1]));
    }
    
    return result;
}

// Test the solution
function testMaxSlidingWindow() {
    // Test case 1
    console.log(maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3)); // [3,3,5,5,6,7]
    
    // Test case 2
    console.log(maxSlidingWindow([1], 1)); // [1]
    
    // Test case 3
    console.log(maxSlidingWindow([1, -1], 1)); // [1, -1]
    
    // Test case 4
    console.log(maxSlidingWindow([9, 11], 2)); // [11]
    
    // Test case 5
    console.log(maxSlidingWindow([4, -2], 2)); // [4]
}
```

## Time and Space Complexity Analysis

**Deque Approach (Optimal):**
- **Time Complexity:** O(n)
  - Each element is added to deque exactly once and removed at most once
  - Amortized O(1) per element
- **Space Complexity:** O(k)
  - Deque stores at most k elements
  - Result array stores n-k+1 elements (not counted as extra space)

**Brute Force Approach:**
- **Time Complexity:** O(n × k)
  - For each of n-k+1 windows, we find maximum in O(k) time
- **Space Complexity:** O(1)
  - Only using constant extra space

**Heap Approach:**
- **Time Complexity:** O(n log k)
  - n insertions and deletions, each taking O(log k) time
- **Space Complexity:** O(k)
  - Heap stores at most k elements

**Optimized Array Approach:**
- **Time Complexity:** O(n)
  - Two passes through the array
- **Space Complexity:** O(n)
  - Two additional arrays of size n

**Key Insights:**
1. **Deque maintains potential candidates:** Only store indices that could potentially be maximum
2. **Monotonic decreasing order:** Elements in deque are in decreasing order of values
3. **Sliding window optimization:** Remove outdated elements and maintain only relevant candidates