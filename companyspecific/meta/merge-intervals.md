# Merge Intervals

## Problem Statement
Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

**LeetCode Problem Number: 56**

## Sample Input and Output
**Input:** `intervals = [[1,3],[2,6],[8,10],[15,18]]`
**Output:** `[[1,6],[8,10],[15,18]]`
**Explanation:** Since intervals [1,3] and [2,6] overlap, merge them into [1,6].

**Input:** `intervals = [[1,4],[4,5]]`
**Output:** `[[1,5]]`
**Explanation:** Intervals [1,4] and [4,5] are considered overlapping.

**Input:** `intervals = [[1,4],[0,4]]`
**Output:** `[[0,4]]`

## Algorithm Outline
The most efficient approach uses **sorting + linear merge**:

1. Sort intervals by their start times
2. Initialize result with the first interval
3. For each subsequent interval:
   - If it overlaps with the last interval in result, merge them
   - Otherwise, add it as a new interval to result
4. Two intervals [a,b] and [c,d] overlap if b >= c (assuming a <= c)

## Step-by-Step Dry Run
Let's trace through `intervals = [[1,3],[2,6],[8,10],[15,18]]`:

1. **Sort by start time:** `[[1,3],[2,6],[8,10],[15,18]]` (already sorted)

2. **Initialize result:** `result = [[1,3]]`

3. **Process [2,6]:**
   - Last interval in result: [1,3]
   - Check overlap: 3 >= 2? Yes, they overlap
   - Merge: [1, max(3,6)] = [1,6]
   - result = [[1,6]]

4. **Process [8,10]:**
   - Last interval in result: [1,6]
   - Check overlap: 6 >= 8? No, no overlap
   - Add new interval: result = [[1,6],[8,10]]

5. **Process [15,18]:**
   - Last interval in result: [8,10]
   - Check overlap: 10 >= 15? No, no overlap
   - Add new interval: result = [[1,6],[8,10],[15,18]]

**Final result:** `[[1,6],[8,10],[15,18]]`

## JavaScript Implementation

```javascript
// Main solution
function merge(intervals) {
    if (!intervals || intervals.length <= 1) {
        return intervals;
    }
    
    // Sort intervals by start time
    intervals.sort((a, b) => a[0] - b[0]);
    
    const result = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
        const currentInterval = intervals[i];
        const lastMerged = result[result.length - 1];
        
        // Check if current interval overlaps with the last merged interval
        if (currentInterval[0] <= lastMerged[1]) {
            // Merge intervals by extending the end time
            lastMerged[1] = Math.max(lastMerged[1], currentInterval[1]);
        } else {
            // No overlap, add current interval to result
            result.push(currentInterval);
        }
    }
    
    return result;
}

// Alternative implementation with more explicit logic
function mergeVerbose(intervals) {
    if (!intervals || intervals.length === 0) return [];
    if (intervals.length === 1) return intervals;
    
    // Sort by start time
    intervals.sort((a, b) => a[0] - b[0]);
    
    const merged = [];
    let currentStart = intervals[0][0];
    let currentEnd = intervals[0][1];
    
    for (let i = 1; i < intervals.length; i++) {
        const [start, end] = intervals[i];
        
        if (start <= currentEnd) {
            // Overlapping intervals, merge them
            currentEnd = Math.max(currentEnd, end);
        } else {
            // Non-overlapping, add the previous interval to result
            merged.push([currentStart, currentEnd]);
            currentStart = start;
            currentEnd = end;
        }
    }
    
    // Add the last interval
    merged.push([currentStart, currentEnd]);
    
    return merged;
}

// Functional programming approach
function mergeFunctional(intervals) {
    if (!intervals || intervals.length <= 1) return intervals;
    
    return intervals
        .sort((a, b) => a[0] - b[0])
        .reduce((merged, current) => {
            const last = merged[merged.length - 1];
            
            if (merged.length === 0 || current[0] > last[1]) {
                // No overlap or first interval
                merged.push(current);
            } else {
                // Overlap, merge with last interval
                last[1] = Math.max(last[1], current[1]);
            }
            
            return merged;
        }, []);
}

// In-place merge (modifies original array)
function mergeInPlace(intervals) {
    if (!intervals || intervals.length <= 1) return intervals;
    
    intervals.sort((a, b) => a[0] - b[0]);
    
    let writeIndex = 0;
    
    for (let readIndex = 1; readIndex < intervals.length; readIndex++) {
        const current = intervals[readIndex];
        const last = intervals[writeIndex];
        
        if (current[0] <= last[1]) {
            // Merge intervals
            last[1] = Math.max(last[1], current[1]);
        } else {
            // Move to next position and copy current interval
            writeIndex++;
            intervals[writeIndex] = current;
        }
    }
    
    // Truncate array to remove unused elements
    intervals.length = writeIndex + 1;
    return intervals;
}

// Handle edge cases more explicitly
function mergeRobust(intervals) {
    // Handle edge cases
    if (!intervals) return [];
    if (intervals.length === 0) return [];
    if (intervals.length === 1) return intervals;
    
    // Validate input
    for (const interval of intervals) {
        if (!Array.isArray(interval) || interval.length !== 2) {
            throw new Error('Invalid interval format');
        }
        if (interval[0] > interval[1]) {
            throw new Error('Invalid interval: start > end');
        }
    }
    
    // Sort by start time, then by end time for stability
    intervals.sort((a, b) => {
        if (a[0] !== b[0]) {
            return a[0] - b[0];
        }
        return a[1] - b[1];
    });
    
    const result = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
        const [currentStart, currentEnd] = intervals[i];
        const lastInterval = result[result.length - 1];
        
        if (currentStart <= lastInterval[1]) {
            // Merge overlapping intervals
            lastInterval[1] = Math.max(lastInterval[1], currentEnd);
        } else {
            // Add non-overlapping interval
            result.push([currentStart, currentEnd]);
        }
    }
    
    return result;
}

// Test the solution
function testMerge() {
    // Test case 1: [[1,3],[2,6],[8,10],[15,18]] -> [[1,6],[8,10],[15,18]]
    console.log(merge([[1,3],[2,6],[8,10],[15,18]]));
    
    // Test case 2: [[1,4],[4,5]] -> [[1,5]]
    console.log(merge([[1,4],[4,5]]));
    
    // Test case 3: [[1,4],[0,4]] -> [[0,4]]
    console.log(merge([[1,4],[0,4]]));
    
    // Test case 4: Single interval
    console.log(merge([[1,4]])); // [[1,4]]
    
    // Test case 5: No intervals
    console.log(merge([])); // []
    
    // Test case 6: All overlapping
    console.log(merge([[1,4],[2,5],[3,6]])); // [[1,6]]
}
```

## Time and Space Complexity Analysis

**Time Complexity:** O(n log n)
- Sorting the intervals takes O(n log n) time
- The merging process takes O(n) time
- Overall complexity is dominated by sorting: O(n log n)

**Space Complexity:** O(1) to O(n)
- **Best case (in-place merge):** O(1) extra space if we modify the input array
- **Typical case:** O(n) space for the result array
- **Sorting space:** O(log n) for most sorting algorithms
- Note: The result array space is often not counted as "extra" since it's the required output

**Key Insights:**
1. **Sorting is crucial:** Without sorting, we'd need to check every pair of intervals (O(n²))
2. **Overlap condition:** Two intervals [a,b] and [c,d] overlap if max(a,c) <= min(b,d), or simply b >= c when a <= c
3. **Greedy approach works:** Once sorted, we can process intervals left to right and make optimal local decisions