# Three Sum ⭐

## Problem Statement

Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

The solution set must not contain duplicate triplets.

**Example 1:**
```
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
Explanation: 
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
The distinct triplets are [-1,0,1] and [-1,-1,2].
```

**Example 2:**
```
Input: nums = [0,1,1]
Output: []
Explanation: The only possible triplet does not sum up to 0.
```

**Example 3:**
```
Input: nums = [0,0,0]
Output: [[0,0,0]]
Explanation: The only possible triplet sums up to 0.
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. Budget Allocation & Resource Management
```javascript
// Find three budget categories that sum to total budget
function findBudgetAllocation(categories, totalBudget) {
    const result = [];
    categories.sort((a, b) => a.amount - b.amount);
    
    for (let i = 0; i < categories.length - 2; i++) {
        if (i > 0 && categories[i].amount === categories[i-1].amount) continue;
        
        let left = i + 1;
        let right = categories.length - 1;
        
        while (left < right) {
            const sum = categories[i].amount + categories[left].amount + categories[right].amount;
            
            if (sum === totalBudget) {
                result.push([categories[i], categories[left], categories[right]]);
                
                while (left < right && categories[left].amount === categories[left+1].amount) left++;
                while (left < right && categories[right].amount === categories[right-1].amount) right--;
                
                left++;
                right--;
            } else if (sum < totalBudget) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}

// Usage in financial planning app
const budgetCategories = [
    { name: 'Rent', amount: 1000 },
    { name: 'Food', amount: 500 },
    { name: 'Transport', amount: 300 },
    { name: 'Entertainment', amount: 200 },
    { name: 'Utilities', amount: 300 },
    { name: 'Savings', amount: 1000 }
];

const allocations = findBudgetAllocation(budgetCategories, 1800);
console.log(allocations); // Find three categories that sum to $1800
```

#### 2. Color Palette Generation
```javascript
// Find three RGB values that create a neutral color (sum to specific value)
function findColorTriplets(rgbValues, targetSum = 381) { // 127 * 3 for middle gray
    const result = [];
    rgbValues.sort((a, b) => a - b);
    
    for (let i = 0; i < rgbValues.length - 2; i++) {
        if (i > 0 && rgbValues[i] === rgbValues[i-1]) continue;
        
        let left = i + 1;
        let right = rgbValues.length - 1;
        
        while (left < right) {
            const sum = rgbValues[i] + rgbValues[left] + rgbValues[right];
            
            if (sum === targetSum) {
                result.push([rgbValues[i], rgbValues[left], rgbValues[right]]);
                
                while (left < right && rgbValues[left] === rgbValues[left+1]) left++;
                while (left < right && rgbValues[right] === rgbValues[right-1]) right--;
                
                left++;
                right--;
            } else if (sum < targetSum) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}

// Color palette generator
class ColorPaletteGenerator {
    constructor() {
        this.rgbRange = Array.from({length: 256}, (_, i) => i);
    }
    
    generateNeutralTriplets(count = 5) {
        const triplets = findColorTriplets(this.rgbRange, 381);
        return triplets.slice(0, count).map(([r, g, b]) => ({
            rgb: `rgb(${r}, ${g}, ${b})`,
            hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
            values: [r, g, b]
        }));
    }
}
```

#### 3. Performance Metrics Analysis
```javascript
// Find three performance metrics that balance to zero deviation
function findBalancedMetrics(metrics, targetDeviation = 0) {
    // Convert metrics to deviation values
    const deviations = metrics.map(m => m.value - m.baseline);
    const result = [];
    
    // Use three sum to find balanced combinations
    deviations.sort((a, b) => a - b);
    
    for (let i = 0; i < deviations.length - 2; i++) {
        if (i > 0 && deviations[i] === deviations[i-1]) continue;
        
        let left = i + 1;
        let right = deviations.length - 1;
        
        while (left < right) {
            const sum = deviations[i] + deviations[left] + deviations[right];
            
            if (Math.abs(sum - targetDeviation) < 0.01) { // Allow small tolerance
                result.push({
                    metrics: [
                        metrics[deviations.indexOf(deviations[i])],
                        metrics[deviations.indexOf(deviations[left])],
                        metrics[deviations.indexOf(deviations[right])]
                    ],
                    totalDeviation: sum
                });
                
                while (left < right && deviations[left] === deviations[left+1]) left++;
                while (left < right && deviations[right] === deviations[right-1]) right--;
                
                left++;
                right--;
            } else if (sum < targetDeviation) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}
```

## Approach 1: Brute Force

### Algorithm
Check all possible triplets using three nested loops.

### Implementation
```javascript
function threeSumBruteForce(nums) {
    const result = [];
    const n = nums.length;
    
    // Sort to handle duplicates easier
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < n - 2; i++) {
        // Skip duplicates for first element
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        for (let j = i + 1; j < n - 1; j++) {
            // Skip duplicates for second element
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            
            for (let k = j + 1; k < n; k++) {
                // Skip duplicates for third element
                if (k > j + 1 && nums[k] === nums[k - 1]) continue;
                
                if (nums[i] + nums[j] + nums[k] === 0) {
                    result.push([nums[i], nums[j], nums[k]]);
                }
            }
        }
    }
    
    return result;
}
```

### Complexity Analysis
- **Time Complexity**: O(n³) - Three nested loops
- **Space Complexity**: O(1) - Not counting output array
- **Pros**: Simple to understand and implement
- **Cons**: Very slow for large inputs

## Approach 2: Two Pointers (Optimal)

### Algorithm
1. Sort the array
2. For each element, use two pointers to find pairs that sum to the negative of current element
3. Skip duplicates to avoid duplicate triplets

### Implementation
```javascript
function threeSum(nums) {
    const result = [];
    const n = nums.length;
    
    // Early termination
    if (n < 3) return result;
    
    // Sort the array
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < n - 2; i++) {
        // Skip duplicate values for first element
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        // Early termination: if current number is positive, 
        // no way to get sum = 0 with remaining positive numbers
        if (nums[i] > 0) break;
        
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
                left++; // Need larger sum
            } else {
                right--; // Need smaller sum
            }
        }
    }
    
    return result;
}
```

### Complexity Analysis
- **Time Complexity**: O(n²) - Sorting O(n log n) + Two pointers O(n²)
- **Space Complexity**: O(1) - Not counting output array
- **Pros**: Optimal time complexity, handles duplicates naturally
- **Cons**: Requires sorting, slightly more complex

### Example Trace
```
Input: nums = [-1,0,1,2,-1,-4]
After sorting: [-4,-1,-1,0,1,2]

i=0, nums[i]=-4:
  left=1(-1), right=5(2): sum = -4+(-1)+2 = -3 < 0 → left++
  left=2(-1), right=5(2): sum = -4+(-1)+2 = -3 < 0 → left++  
  left=3(0), right=5(2): sum = -4+0+2 = -2 < 0 → left++
  left=4(1), right=5(2): sum = -4+1+2 = -1 < 0 → left++
  left=5, right=5: left >= right, exit

i=1, nums[i]=-1:
  left=2(-1), right=5(2): sum = -1+(-1)+2 = 0 ✓ → result = [[-1,-1,2]]
  Skip duplicates: left=3, right=4
  left=3(0), right=4(1): sum = -1+0+1 = 0 ✓ → result = [[-1,-1,2], [-1,0,1]]
  left=4, right=3: left >= right, exit

i=2, nums[i]=-1: Skip duplicate (same as previous)

i=3, nums[i]=0:
  left=4(1), right=5(2): sum = 0+1+2 = 3 > 0 → right--
  left=4, right=4: left >= right, exit

Result: [[-1,-1,2], [-1,0,1]]
```

## Alternative Approach: Hash Set

### Implementation
```javascript
function threeSumHashSet(nums) {
    const result = [];
    const n = nums.length;
    
    // Sort for duplicate handling
    nums.sort((a, b) => a - b);
    
    for (let i = 0; i < n - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        
        const target = -nums[i];
        const seen = new Set();
        
        for (let j = i + 1; j < n; j++) {
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            
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

## Variations & Follow-ups

### 1. Three Sum Closest
```javascript
function threeSumClosest(nums, target) {
    nums.sort((a, b) => a - b);
    let closestSum = nums[0] + nums[1] + nums[2];
    
    for (let i = 0; i < nums.length - 2; i++) {
        let left = i + 1;
        let right = nums.length - 1;
        
        while (left < right) {
            const currentSum = nums[i] + nums[left] + nums[right];
            
            if (Math.abs(currentSum - target) < Math.abs(closestSum - target)) {
                closestSum = currentSum;
            }
            
            if (currentSum < target) {
                left++;
            } else if (currentSum > target) {
                right--;
            } else {
                return currentSum; // Exact match
            }
        }
    }
    
    return closestSum;
}
```

### 2. Three Sum Smaller
```javascript
function threeSumSmaller(nums, target) {
    nums.sort((a, b) => a - b);
    let count = 0;
    
    for (let i = 0; i < nums.length - 2; i++) {
        let left = i + 1;
        let right = nums.length - 1;
        
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            
            if (sum < target) {
                // All triplets with right pointer from left+1 to current right
                // will have sum < target
                count += right - left;
                left++;
            } else {
                right--;
            }
        }
    }
    
    return count;
}
```

### 3. K Sum Generalization
```javascript
function kSum(nums, target, k) {
    nums.sort((a, b) => a - b);
    
    function kSumHelper(start, k, target) {
        if (k === 2) {
            return twoSum(start, target);
        }
        
        const result = [];
        
        for (let i = start; i < nums.length - k + 1; i++) {
            if (i > start && nums[i] === nums[i - 1]) continue;
            
            const subResults = kSumHelper(i + 1, k - 1, target - nums[i]);
            
            for (const subResult of subResults) {
                result.push([nums[i], ...subResult]);
            }
        }
        
        return result;
    }
    
    function twoSum(start, target) {
        const result = [];
        let left = start;
        let right = nums.length - 1;
        
        while (left < right) {
            const sum = nums[left] + nums[right];
            
            if (sum === target) {
                result.push([nums[left], nums[right]]);
                
                while (left < right && nums[left] === nums[left + 1]) left++;
                while (left < right && nums[right] === nums[right - 1]) right--;
                
                left++;
                right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        
        return result;
    }
    
    return kSumHelper(0, k, target);
}
```

## Frontend-Specific Optimizations

### 1. Debounced Three Sum for Real-time Analysis
```javascript
class ThreeSumAnalyzer {
    constructor(debounceMs = 500) {
        this.cache = new Map();
        this.debounceTimer = null;
        this.debounceMs = debounceMs;
    }
    
    analyze(data, target = 0, callback) {
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(() => {
            const key = JSON.stringify([data, target]);
            
            if (this.cache.has(key)) {
                callback(this.cache.get(key));
                return;
            }
            
            const result = threeSum(data.map(item => item.value - target));
            this.cache.set(key, result);
            callback(result);
        }, this.debounceMs);
    }
    
    clearCache() {
        this.cache.clear();
    }
}
```

### 2. Three Sum with Custom Comparator
```javascript
function threeSumCustom(items, targetSum, getValue = item => item) {
    const sorted = [...items].sort((a, b) => getValue(a) - getValue(b));
    const result = [];
    
    for (let i = 0; i < sorted.length - 2; i++) {
        if (i > 0 && getValue(sorted[i]) === getValue(sorted[i - 1])) continue;
        
        let left = i + 1;
        let right = sorted.length - 1;
        
        while (left < right) {
            const sum = getValue(sorted[i]) + getValue(sorted[left]) + getValue(sorted[right]);
            
            if (sum === targetSum) {
                result.push([sorted[i], sorted[left], sorted[right]]);
                
                while (left < right && getValue(sorted[left]) === getValue(sorted[left + 1])) left++;
                while (left < right && getValue(sorted[right]) === getValue(sorted[right - 1])) right--;
                
                left++;
                right--;
            } else if (sum < targetSum) {
                left++;
            } else {
                right--;
            }
        }
    }
    
    return result;
}
```

## Testing & Edge Cases

### Comprehensive Test Suite
```javascript
function testThreeSum() {
    const testCases = [
        // Basic cases
        { nums: [-1,0,1,2,-1,-4], expected: [[-1,-1,2],[-1,0,1]], description: "Standard case" },
        { nums: [0,1,1], expected: [], description: "No solution" },
        { nums: [0,0,0], expected: [[0,0,0]], description: "All zeros" },
        
        // Edge cases
        { nums: [], expected: [], description: "Empty array" },
        { nums: [1,2], expected: [], description: "Less than 3 elements" },
        { nums: [0,0,0,0], expected: [[0,0,0]], description: "Multiple zeros" },
        
        // Duplicate handling
        { nums: [-2,0,1,1,2], expected: [[-2,0,2],[-2,1,1]], description: "Duplicates" },
        { nums: [-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6], expected: [[-4,-2,6],[-4,0,4],[-4,1,3],[-4,2,2],[-2,-2,4],[-2,0,2]], description: "Many duplicates" },
        
        // All negative/positive
        { nums: [-1,-2,-3], expected: [], description: "All negative" },
        { nums: [1,2,3], expected: [], description: "All positive" },
        
        // Large numbers
        { nums: [-100000,-1,2,99999], expected: [], description: "Large numbers" }
    ];
    
    const implementations = [
        { name: "Brute Force", func: threeSumBruteForce },
        { name: "Two Pointers", func: threeSum },
        { name: "Hash Set", func: threeSumHashSet }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name}:`);
        let passed = 0;
        
        testCases.forEach(test => {
            try {
                const result = impl.func([...test.nums]);
                // Sort both arrays for comparison
                const sortedResult = result.map(triplet => [...triplet].sort()).sort();
                const sortedExpected = test.expected.map(triplet => [...triplet].sort()).sort();
                
                const success = JSON.stringify(sortedResult) === JSON.stringify(sortedExpected);
                
                console.log(`  ${success ? '✓' : '✗'} ${test.description}`);
                if (!success) {
                    console.log(`    Input: [${test.nums.join(',')}]`);
                    console.log(`    Expected: ${JSON.stringify(test.expected)}`);
                    console.log(`    Got: ${JSON.stringify(result)}`);
                }
                
                if (success) passed++;
            } catch (error) {
                console.log(`  ✗ ${test.description}: ERROR - ${error.message}`);
            }
        });
        
        console.log(`  Summary: ${passed}/${testCases.length} tests passed`);
    });
}

testThreeSum();
```

## Interview Tips

### Discussion Points
1. **Sorting Importance**: Why sorting makes duplicate handling easier
2. **Two Pointers**: How it reduces time complexity from O(n³) to O(n²)
3. **Duplicate Handling**: Techniques to avoid duplicate triplets
4. **Early Termination**: Optimizations for better average case performance

### Common Follow-ups
1. **"Three Sum Closest"** → Find triplet closest to target
2. **"K Sum"** → Generalize to k numbers
3. **"Three Sum Smaller"** → Count triplets less than target
4. **"What if we can't modify input?"** → Use indices instead of sorting

### Microsoft-Specific Context
1. **Data Analysis**: Finding balanced metric combinations
2. **Resource Allocation**: Budget/resource distribution problems
3. **UI Components**: Color palette generation, layout balancing
4. **Performance**: Optimizing for real-time data processing

## Key Takeaways

1. **Two Pointers Pattern**: Essential for multi-sum problems
2. **Sorting Strategy**: Enables duplicate handling and two pointers
3. **Duplicate Management**: Critical for correct results
4. **Time Complexity**: O(n²) is optimal for this problem
5. **Frontend Applications**: Budget allocation, color theory, performance metrics 