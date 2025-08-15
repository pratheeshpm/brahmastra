# Two Sum ⭐

## Problem Statement

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

**Example 2:**
```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

**Example 3:**
```
Input: nums = [3,3], target = 6
Output: [0,1]
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. Shopping Cart & Price Calculations
```javascript
// Find two items that sum to a budget
function findItemsInBudget(items, budget) {
    const priceMap = new Map();
    
    for (let i = 0; i < items.length; i++) {
        const price = items[i].price;
        const needed = budget - price;
        
        if (priceMap.has(needed)) {
            return [items[priceMap.get(needed)], items[i]];
        }
        
        priceMap.set(price, i);
    }
    
    return null;
}

// Usage in e-commerce
const products = [
    { id: 1, name: "Laptop", price: 800 },
    { id: 2, name: "Phone", price: 200 },
    { id: 3, name: "Tablet", price: 300 },
    { id: 4, name: "Watch", price: 100 }
];

const combo = findItemsInBudget(products, 500);
console.log(combo); // [Phone, Tablet]
```

#### 2. Form Validation & Input Pairing
```javascript
// Find two form fields that sum to a specific value
function validateFieldSum(formData, expectedSum) {
    const fields = Object.entries(formData)
        .filter(([key, value]) => typeof value === 'number')
        .map(([key, value], index) => ({ field: key, value, index }));
    
    const valueMap = new Map();
    
    for (let i = 0; i < fields.length; i++) {
        const current = fields[i];
        const needed = expectedSum - current.value;
        
        if (valueMap.has(needed)) {
            const partner = valueMap.get(needed);
            return {
                valid: true,
                fields: [partner.field, current.field],
                values: [partner.value, current.value]
            };
        }
        
        valueMap.set(current.value, current);
    }
    
    return { valid: false };
}

// Usage in financial forms
const formData = {
    income: 5000,
    expenses: 3000,
    savings: 2000,
    investments: 1000
};

const result = validateFieldSum(formData, 8000);
console.log(result); // { valid: true, fields: ['income', 'savings'], values: [5000, 2000] }
```

#### 3. Data Visualization & Chart Pairing
```javascript
// Find two data points that sum to a target for chart annotations
function findDataPointPair(dataset, targetSum) {
    const indexMap = new Map();
    
    for (let i = 0; i < dataset.length; i++) {
        const value = dataset[i].value;
        const complement = targetSum - value;
        
        if (indexMap.has(complement)) {
            return {
                point1: dataset[indexMap.get(complement)],
                point2: dataset[i],
                indices: [indexMap.get(complement), i]
            };
        }
        
        indexMap.set(value, i);
    }
    
    return null;
}

// Usage in analytics dashboard
const salesData = [
    { month: 'Jan', value: 100 },
    { month: 'Feb', value: 150 },
    { month: 'Mar', value: 200 },
    { month: 'Apr', value: 250 }
];

const pair = findDataPointPair(salesData, 350);
console.log(pair); // Jan + Mar = 350
```

## Approach 1: Brute Force - Nested Loops

### Algorithm
Check every pair of numbers to see if they sum to the target.

### Implementation
```javascript
function twoSumBruteForce(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return []; // No solution found
}
```

### Complexity Analysis
- **Time Complexity**: O(n²) - Nested loops checking all pairs
- **Space Complexity**: O(1) - No extra space except variables
- **Pros**: Simple to understand, no extra space needed
- **Cons**: Inefficient for large arrays

### Example Trace
```
Input: nums = [2,7,11,15], target = 9

i=0, nums[i]=2:
  j=1, nums[j]=7: 2+7=9 ✓ Found! Return [0,1]

i=0, nums[i]=2:
  j=2, nums[j]=11: 2+11=13 ≠ 9
  j=3, nums[j]=15: 2+15=17 ≠ 9

Result: [0,1]
```

## Approach 2: Hash Map (Optimal Solution)

### Algorithm
Use a hash map to store numbers we've seen and their indices. For each number, check if its complement exists in the map.

### Implementation
```javascript
function twoSum(nums, target) {
    const numMap = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        
        numMap.set(nums[i], i);
    }
    
    return []; // No solution found
}
```

### Alternative Implementation with Object
```javascript
function twoSumObject(nums, target) {
    const numObj = {};
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (complement in numObj) {
            return [numObj[complement], i];
        }
        
        numObj[nums[i]] = i;
    }
    
    return [];
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Single pass through the array
- **Space Complexity**: O(n) - Hash map to store numbers and indices
- **Pros**: Optimal time complexity, easy to understand
- **Cons**: Uses extra space

### Example Trace
```
Input: nums = [2,7,11,15], target = 9

i=0, nums[i]=2:
  complement = 9-2 = 7
  numMap.has(7)? No
  numMap.set(2, 0) → numMap = {2: 0}

i=1, nums[i]=7:
  complement = 9-7 = 2
  numMap.has(2)? Yes! → numMap.get(2) = 0
  Return [0, 1]
```

## Variations & Follow-ups

### 1. Return All Pairs (Not Just Indices)
```javascript
function twoSumAllPairs(nums, target) {
    const pairs = [];
    const seen = new Set();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (seen.has(complement)) {
            pairs.push([complement, nums[i]]);
        }
        
        seen.add(nums[i]);
    }
    
    return pairs;
}
```

### 2. Two Sum with Sorted Array (Two Pointers)
```javascript
function twoSumSorted(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const sum = nums[left] + nums[right];
        
        if (sum === target) {
            return [left, right];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return [];
}
```

### 3. Two Sum with Count of Solutions
```javascript
function twoSumCount(nums, target) {
    const numCount = new Map();
    let count = 0;
    
    // Count occurrences
    for (const num of nums) {
        numCount.set(num, (numCount.get(num) || 0) + 1);
    }
    
    for (const [num, freq] of numCount) {
        const complement = target - num;
        
        if (complement === num) {
            // Same number used twice
            count += freq * (freq - 1) / 2;
        } else if (numCount.has(complement) && complement > num) {
            // Different numbers (avoid double counting)
            count += freq * numCount.get(complement);
        }
    }
    
    return count;
}
```

## Frontend-Specific Optimizations

### 1. Debounced Two Sum for Real-time Search
```javascript
class TwoSumSearcher {
    constructor(nums, debounceMs = 300) {
        this.nums = nums;
        this.cache = new Map();
        this.debounceTimer = null;
        this.debounceMs = debounceMs;
    }
    
    search(target, callback) {
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(() => {
            if (this.cache.has(target)) {
                callback(this.cache.get(target));
                return;
            }
            
            const result = this.twoSum(target);
            this.cache.set(target, result);
            callback(result);
        }, this.debounceMs);
    }
    
    twoSum(target) {
        const numMap = new Map();
        
        for (let i = 0; i < this.nums.length; i++) {
            const complement = target - this.nums[i];
            
            if (numMap.has(complement)) {
                return [numMap.get(complement), i];
            }
            
            numMap.set(this.nums[i], i);
        }
        
        return [];
    }
    
    clearCache() {
        this.cache.clear();
    }
}

// Usage in search component
const searcher = new TwoSumSearcher([2, 7, 11, 15]);
searcher.search(9, (result) => {
    console.log('Found pair at indices:', result);
});
```

### 2. Two Sum for Form Field Validation
```javascript
function createTwoSumValidator(expectedSum) {
    return function validateTwoFields(formData) {
        const numericFields = Object.entries(formData)
            .filter(([key, value]) => typeof value === 'number' && !isNaN(value))
            .map(([key, value]) => ({ name: key, value }));
        
        const valueMap = new Map();
        
        for (let i = 0; i < numericFields.length; i++) {
            const field = numericFields[i];
            const complement = expectedSum - field.value;
            
            if (valueMap.has(complement)) {
                const partner = valueMap.get(complement);
                return {
                    valid: true,
                    fields: [partner.name, field.name],
                    values: [partner.value, field.value],
                    sum: expectedSum
                };
            }
            
            valueMap.set(field.value, field);
        }
        
        return {
            valid: false,
            error: `No two fields sum to ${expectedSum}`,
            availableFields: numericFields.map(f => f.name)
        };
    };
}

// Usage
const validateBudget = createTwoSumValidator(1000);
const result = validateBudget({
    rent: 600,
    food: 400,
    utilities: 200,
    entertainment: 100
});
console.log(result); // { valid: true, fields: ['rent', 'food'], values: [600, 400] }
```

## Testing & Edge Cases

### Comprehensive Test Suite
```javascript
function testTwoSum() {
    const testCases = [
        // Basic cases
        { nums: [2,7,11,15], target: 9, expected: [0,1], description: "Basic case" },
        { nums: [3,2,4], target: 6, expected: [1,2], description: "Different order" },
        { nums: [3,3], target: 6, expected: [0,1], description: "Duplicate numbers" },
        
        // Edge cases
        { nums: [1,2], target: 3, expected: [0,1], description: "Minimum size" },
        { nums: [0,4,3,0], target: 0, expected: [0,3], description: "Zero values" },
        { nums: [-1,-2,-3,-4,-5], target: -8, expected: [2,4], description: "Negative numbers" },
        
        // No solution cases (if we modify to handle them)
        { nums: [1,2,3], target: 10, expected: [], description: "No solution" },
        
        // Large numbers
        { nums: [1000000, 999999, 1], target: 1000001, expected: [0,2], description: "Large numbers" },
        
        // Zero target
        { nums: [0,0], target: 0, expected: [0,1], description: "Zero target" },
        { nums: [5,-5,3], target: 0, expected: [0,1], description: "Sum to zero" }
    ];
    
    const implementations = [
        { name: "Brute Force", func: twoSumBruteForce },
        { name: "Hash Map", func: twoSum },
        { name: "Object Map", func: twoSumObject }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name}:`);
        let passed = 0;
        
        testCases.forEach(test => {
            try {
                const result = impl.func([...test.nums], test.target);
                const success = JSON.stringify(result.sort()) === JSON.stringify(test.expected.sort());
                
                console.log(`  ${success ? '✓' : '✗'} ${test.description}`);
                if (!success) {
                    console.log(`    Expected: ${JSON.stringify(test.expected)}, Got: ${JSON.stringify(result)}`);
                }
                
                if (success) passed++;
            } catch (error) {
                console.log(`  ✗ ${test.description}: ERROR - ${error.message}`);
            }
        });
        
        console.log(`  Summary: ${passed}/${testCases.length} tests passed`);
    });
}

testTwoSum();
```

### Performance Benchmark
```javascript
function benchmarkTwoSum() {
    const sizes = [100, 1000, 10000, 100000];
    
    sizes.forEach(size => {
        console.log(`\nArray size: ${size}`);
        
        // Generate test data
        const nums = Array.from({ length: size }, (_, i) => i);
        const target = size - 1; // Last two elements sum
        
        const implementations = [
            { name: "Brute Force", func: twoSumBruteForce },
            { name: "Hash Map", func: twoSum }
        ];
        
        implementations.forEach(impl => {
            const start = performance.now();
            const iterations = size > 10000 ? 10 : 100;
            
            for (let i = 0; i < iterations; i++) {
                impl.func([...nums], target);
            }
            
            const end = performance.now();
            const avgTime = (end - start) / iterations;
            console.log(`  ${impl.name}: ${avgTime.toFixed(4)}ms avg`);
        });
    });
}
```

## Interview Tips

### Discussion Points
1. **Hash Map Choice**: Explain why Map vs Object for this problem
2. **Time-Space Tradeoff**: O(n²) time vs O(n) space consideration
3. **Edge Cases**: Duplicates, negative numbers, no solution
4. **Real-world Applications**: E-commerce, form validation, data analysis

### Common Follow-ups
1. **"What if the array is sorted?"** → Two pointers approach
2. **"Find all pairs that sum to target?"** → Modify to collect all pairs
3. **"What about three sum?"** → Extend the concept
4. **"How to handle no solution?"** → Return null or throw exception

### Microsoft-Specific Context
1. **Shopping Features**: Finding product combinations within budget
2. **Data Processing**: Pairing related data points in analytics
3. **Form Validation**: Ensuring related fields meet constraints
4. **Performance**: Optimizing for real-time user interactions

## Key Takeaways

1. **Hash Map Pattern**: Perfect for complement-based problems
2. **Single Pass**: Often better than nested loops for searching
3. **Space-Time Tradeoff**: O(n) space for O(n) time is usually worth it
4. **Frontend Applications**: Common in e-commerce, forms, data visualization
5. **Edge Cases**: Always consider duplicates, negatives, and empty inputs 