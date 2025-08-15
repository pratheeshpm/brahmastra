# Maximum Subarray Sum (Kadane's Algorithm) ⭐

## Problem Statement

Given an integer array `nums`, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.

**Example 1:**
```
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.
```

**Example 2:**
```
Input: nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum 1.
```

**Example 3:**
```
Input: nums = [5,4,-1,7,8]
Output: 23
Explanation: The subarray [5,4,-1,7,8] has the largest sum 23.
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. Performance Analytics & Monitoring
```javascript
// Analyze performance metrics over time windows
class PerformanceAnalyzer {
    constructor() {
        this.metrics = [];
        this.timeWindows = new Map();
    }
    
    addMetric(timestamp, value) {
        this.metrics.push({ timestamp, value });
    }
    
    // Find the time window with maximum average performance
    findBestPerformanceWindow(windowSize) {
        if (this.metrics.length < windowSize) return null;
        
        let maxSum = -Infinity;
        let maxStartIndex = 0;
        let currentSum = 0;
        
        // Calculate sum of first window
        for (let i = 0; i < windowSize; i++) {
            currentSum += this.metrics[i].value;
        }
        maxSum = currentSum;
        
        // Sliding window to find maximum sum
        for (let i = windowSize; i < this.metrics.length; i++) {
            currentSum = currentSum - this.metrics[i - windowSize].value + this.metrics[i].value;
            if (currentSum > maxSum) {
                maxSum = currentSum;
                maxStartIndex = i - windowSize + 1;
            }
        }
        
        return {
            maxAverage: maxSum / windowSize,
            startTime: this.metrics[maxStartIndex].timestamp,
            endTime: this.metrics[maxStartIndex + windowSize - 1].timestamp,
            window: this.metrics.slice(maxStartIndex, maxStartIndex + windowSize)
        };
    }
    
    // Find the continuous period with best performance gain
    findMaxPerformanceGain() {
        if (this.metrics.length === 0) return 0;
        
        const gains = [];
        for (let i = 1; i < this.metrics.length; i++) {
            gains.push(this.metrics[i].value - this.metrics[i-1].value);
        }
        
        return this.kadaneAlgorithm(gains);
    }
    
    kadaneAlgorithm(arr) {
        let maxSoFar = arr[0];
        let maxEndingHere = arr[0];
        
        for (let i = 1; i < arr.length; i++) {
            maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
            maxSoFar = Math.max(maxSoFar, maxEndingHere);
        }
        
        return maxSoFar;
    }
}

// Usage in performance monitoring
const analyzer = new PerformanceAnalyzer();

// Track page load times
window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    analyzer.addMetric(Date.now(), loadTime);
});

// Find best performance period
const bestWindow = analyzer.findBestPerformanceWindow(10);
console.log('Best 10-metric average:', bestWindow?.maxAverage);
```

#### 2. Data Visualization & Chart Analytics
```javascript
// Analyze data trends for interactive charts
class ChartAnalyzer {
    constructor(data) {
        this.data = data;
    }
    
    // Find the data segment with maximum value increase
    findMaxTrendSegment() {
        const changes = [];
        for (let i = 1; i < this.data.length; i++) {
            changes.push(this.data[i] - this.data[i-1]);
        }
        
        return this.kadaneWithIndices(changes);
    }
    
    // Kadane's algorithm that also returns indices
    kadaneWithIndices(arr) {
        if (arr.length === 0) return { maxSum: 0, start: 0, end: 0 };
        
        let maxSoFar = arr[0];
        let maxEndingHere = arr[0];
        let start = 0, end = 0, tempStart = 0;
        
        for (let i = 1; i < arr.length; i++) {
            if (maxEndingHere < 0) {
                maxEndingHere = arr[i];
                tempStart = i;
            } else {
                maxEndingHere += arr[i];
            }
            
            if (maxSoFar < maxEndingHere) {
                maxSoFar = maxEndingHere;
                start = tempStart;
                end = i;
            }
        }
        
        return { 
            maxSum: maxSoFar, 
            start: start + 1, // Convert to original array indices
            end: end + 1,
            segment: this.data.slice(start + 1, end + 2)
        };
    }
    
    // Find multiple peak segments for highlighting
    findTopSegments(k = 3) {
        const segments = [];
        let data = [...this.data];
        
        for (let i = 0; i < k; i++) {
            const segment = this.findMaxTrendSegment.call({ data });
            if (segment.maxSum <= 0) break;
            
            segments.push({
                ...segment,
                rank: i + 1
            });
            
            // Remove this segment and find next best
            for (let j = segment.start; j <= segment.end; j++) {
                if (j < data.length - 1) {
                    data[j] = Math.min(data[j], data[j-1] || data[j]);
                }
            }
        }
        
        return segments;
    }
}

// Usage in chart components
function ChartWithTrendHighlight({ data }) {
    const analyzer = new ChartAnalyzer(data);
    const topSegments = analyzer.findTopSegments(3);
    
    const renderChart = () => {
        // Highlight top performing segments
        topSegments.forEach((segment, index) => {
            const color = ['green', 'orange', 'blue'][index];
            highlightSegment(segment.start, segment.end, color);
        });
    };
    
    return (
        <div>
            <canvas ref={chartRef} />
            <div className="legend">
                {topSegments.map((segment, i) => (
                    <div key={i}>
                        Trend #{segment.rank}: +{segment.maxSum.toFixed(2)} 
                        (indices {segment.start}-{segment.end})
                    </div>
                ))}
            </div>
        </div>
    );
}
```

#### 3. Financial/Trading Dashboard Analytics
```javascript
// Stock price analysis for trading dashboards
class TradingAnalyzer {
    constructor() {
        this.priceHistory = [];
        this.volumeHistory = [];
    }
    
    addPricePoint(price, volume, timestamp) {
        this.priceHistory.push({ price, timestamp });
        this.volumeHistory.push({ volume, timestamp });
    }
    
    // Find the best consecutive trading period
    findBestTradingPeriod() {
        const returns = [];
        
        for (let i = 1; i < this.priceHistory.length; i++) {
            const currentPrice = this.priceHistory[i].price;
            const previousPrice = this.priceHistory[i-1].price;
            const returnRate = (currentPrice - previousPrice) / previousPrice;
            returns.push(returnRate);
        }
        
        const result = this.kadaneWithDetails(returns);
        
        return {
            totalReturn: result.maxSum,
            period: {
                start: this.priceHistory[result.start].timestamp,
                end: this.priceHistory[result.end + 1].timestamp
            },
            startPrice: this.priceHistory[result.start].price,
            endPrice: this.priceHistory[result.end + 1].price,
            duration: result.end - result.start + 1
        };
    }
    
    kadaneWithDetails(arr) {
        if (arr.length === 0) return { maxSum: 0, start: 0, end: 0 };
        
        let maxSoFar = arr[0];
        let maxEndingHere = arr[0];
        let start = 0, end = 0, tempStart = 0;
        
        for (let i = 1; i < arr.length; i++) {
            if (maxEndingHere < 0) {
                maxEndingHere = arr[i];
                tempStart = i;
            } else {
                maxEndingHere += arr[i];
            }
            
            if (maxSoFar < maxEndingHere) {
                maxSoFar = maxEndingHere;
                start = tempStart;
                end = i;
            }
        }
        
        return { maxSum: maxSoFar, start, end };
    }
    
    // Risk-adjusted maximum return (Sharpe ratio optimization)
    findBestRiskAdjustedPeriod() {
        const returns = this.calculateReturns();
        const volatilities = this.calculateVolatilities();
        
        // Risk-adjusted returns (simplified Sharpe ratio)
        const riskAdjustedReturns = returns.map((ret, i) => {
            const volatility = volatilities[i] || 1;
            return ret / Math.max(volatility, 0.01); // Avoid division by zero
        });
        
        return this.kadaneWithDetails(riskAdjustedReturns);
    }
    
    calculateReturns() {
        const returns = [];
        for (let i = 1; i < this.priceHistory.length; i++) {
            const ret = (this.priceHistory[i].price - this.priceHistory[i-1].price) / this.priceHistory[i-1].price;
            returns.push(ret);
        }
        return returns;
    }
    
    calculateVolatilities(windowSize = 5) {
        const returns = this.calculateReturns();
        const volatilities = [];
        
        for (let i = windowSize; i < returns.length; i++) {
            const window = returns.slice(i - windowSize, i);
            const mean = window.reduce((sum, ret) => sum + ret, 0) / windowSize;
            const variance = window.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / windowSize;
            volatilities.push(Math.sqrt(variance));
        }
        
        return volatilities;
    }
}
```

## Approach 1: Brute Force (All Subarrays)

### Algorithm
Check all possible subarrays and find the one with maximum sum.

### Implementation
```javascript
function maxSubarrayBruteForce(nums) {
    if (nums.length === 0) return 0;
    
    let maxSum = -Infinity;
    
    for (let i = 0; i < nums.length; i++) {
        for (let j = i; j < nums.length; j++) {
            let currentSum = 0;
            
            // Calculate sum of subarray from i to j
            for (let k = i; k <= j; k++) {
                currentSum += nums[k];
            }
            
            maxSum = Math.max(maxSum, currentSum);
        }
    }
    
    return maxSum;
}
```

### Complexity Analysis
- **Time Complexity**: O(n³) - Three nested loops
- **Space Complexity**: O(1) - Only using variables
- **Pros**: Simple to understand, finds exact subarray
- **Cons**: Extremely inefficient for large arrays

### Example Trace
```
Input: [-2, 1, -3, 4]

i=0: Check subarrays starting at index 0
  j=0: subarray [-2], sum = -2
  j=1: subarray [-2, 1], sum = -1
  j=2: subarray [-2, 1, -3], sum = -4
  j=3: subarray [-2, 1, -3, 4], sum = 0

i=1: Check subarrays starting at index 1
  j=1: subarray [1], sum = 1
  j=2: subarray [1, -3], sum = -2
  j=3: subarray [1, -3, 4], sum = 2

i=2: Check subarrays starting at index 2
  j=2: subarray [-3], sum = -3
  j=3: subarray [-3, 4], sum = 1

i=3: Check subarrays starting at index 3
  j=3: subarray [4], sum = 4

Maximum sum found: 4
```

## Approach 2: Kadane's Algorithm (Optimal)

### Algorithm
Use dynamic programming to track the maximum sum ending at each position.

### Implementation
```javascript
function maxSubarrayKadane(nums) {
    if (nums.length === 0) return 0;
    
    let maxSoFar = nums[0];      // Global maximum
    let maxEndingHere = nums[0]; // Maximum ending at current position
    
    for (let i = 1; i < nums.length; i++) {
        // Either extend existing subarray or start new one
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        
        // Update global maximum
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}
```

### Kadane's with Subarray Indices
```javascript
function maxSubarrayWithIndices(nums) {
    if (nums.length === 0) return { maxSum: 0, start: 0, end: 0 };
    
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    let start = 0, end = 0, tempStart = 0;
    
    for (let i = 1; i < nums.length; i++) {
        if (maxEndingHere < 0) {
            maxEndingHere = nums[i];
            tempStart = i;
        } else {
            maxEndingHere += nums[i];
        }
        
        if (maxSoFar < maxEndingHere) {
            maxSoFar = maxEndingHere;
            start = tempStart;
            end = i;
        }
    }
    
    return {
        maxSum: maxSoFar,
        start: start,
        end: end,
        subarray: nums.slice(start, end + 1)
    };
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Single pass through array
- **Space Complexity**: O(1) - Only using variables
- **Pros**: Optimal time complexity, elegant solution
- **Cons**: Requires understanding of DP concept

### Example Trace
```
Input: [-2, 1, -3, 4, -1, 2, 1, -5, 4]

i=0: nums[0] = -2
  maxEndingHere = -2
  maxSoFar = -2

i=1: nums[1] = 1
  maxEndingHere = max(1, -2 + 1) = max(1, -1) = 1
  maxSoFar = max(-2, 1) = 1

i=2: nums[2] = -3
  maxEndingHere = max(-3, 1 + (-3)) = max(-3, -2) = -2
  maxSoFar = max(1, -2) = 1

i=3: nums[3] = 4
  maxEndingHere = max(4, -2 + 4) = max(4, 2) = 4
  maxSoFar = max(1, 4) = 4

i=4: nums[4] = -1
  maxEndingHere = max(-1, 4 + (-1)) = max(-1, 3) = 3
  maxSoFar = max(4, 3) = 4

i=5: nums[5] = 2
  maxEndingHere = max(2, 3 + 2) = max(2, 5) = 5
  maxSoFar = max(4, 5) = 5

i=6: nums[6] = 1
  maxEndingHere = max(1, 5 + 1) = max(1, 6) = 6
  maxSoFar = max(5, 6) = 6

i=7: nums[7] = -5
  maxEndingHere = max(-5, 6 + (-5)) = max(-5, 1) = 1
  maxSoFar = max(6, 1) = 6

i=8: nums[8] = 4
  maxEndingHere = max(4, 1 + 4) = max(4, 5) = 5
  maxSoFar = max(6, 5) = 6

Result: 6 (subarray [4, -1, 2, 1])
```

## Advanced Variations

### 1. Circular Array Maximum Subarray
```javascript
function maxSubarrayCircular(nums) {
    // Case 1: Maximum subarray is non-circular (standard Kadane's)
    const maxKadane = kadaneMax(nums);
    
    // Case 2: Maximum subarray is circular
    // This equals: total sum - minimum subarray sum
    const totalSum = nums.reduce((sum, num) => sum + num, 0);
    const maxCircular = totalSum - kadaneMin(nums);
    
    // Handle edge case: all numbers are negative
    if (maxCircular === 0) return maxKadane;
    
    return Math.max(maxKadane, maxCircular);
}

function kadaneMax(nums) {
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}

function kadaneMin(nums) {
    let minSoFar = nums[0];
    let minEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        minEndingHere = Math.min(nums[i], minEndingHere + nums[i]);
        minSoFar = Math.min(minSoFar, minEndingHere);
    }
    
    return minSoFar;
}
```

### 2. Maximum Product Subarray
```javascript
function maxProductSubarray(nums) {
    if (nums.length === 0) return 0;
    
    let maxSoFar = nums[0];
    let maxEndingHere = nums[0];
    let minEndingHere = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        const num = nums[i];
        
        // Store current max before updating
        const tempMax = maxEndingHere;
        
        // Update max and min ending here
        maxEndingHere = Math.max(num, Math.max(maxEndingHere * num, minEndingHere * num));
        minEndingHere = Math.min(num, Math.min(tempMax * num, minEndingHere * num));
        
        // Update global maximum
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}
```

### 3. K-Concatenation Maximum Sum
```javascript
function kConcatenationMaxSum(arr, k) {
    const MOD = 1e9 + 7;
    
    if (k === 1) {
        return kadaneMax(arr) % MOD;
    }
    
    // Calculate sum of one array
    const arraySum = arr.reduce((sum, num) => sum + num, 0);
    
    // Create array with 2 concatenations for pattern analysis
    const doubleArray = [...arr, ...arr];
    const maxDouble = kadaneMax(doubleArray);
    
    if (arraySum <= 0) {
        return maxDouble % MOD;
    }
    
    // If array sum is positive, we can benefit from more concatenations
    const maxResult = maxDouble + (k - 2) * arraySum;
    return maxResult % MOD;
}
```

## Frontend-Specific Optimizations

### 1. Real-time Data Stream Processing
```javascript
class StreamingMaxSubarray {
    constructor(maxSize = 1000) {
        this.data = [];
        this.maxSize = maxSize;
        this.currentMax = -Infinity;
        this.currentEndingHere = 0;
        this.needsRecalculation = false;
    }
    
    addValue(value) {
        this.data.push(value);
        
        // Maintain sliding window
        if (this.data.length > this.maxSize) {
            this.data.shift();
            this.needsRecalculation = true;
        }
        
        // Update running maximum using Kadane's logic
        if (!this.needsRecalculation) {
            this.currentEndingHere = Math.max(value, this.currentEndingHere + value);
            this.currentMax = Math.max(this.currentMax, this.currentEndingHere);
        } else {
            this.recalculateMax();
            this.needsRecalculation = false;
        }
        
        return this.currentMax;
    }
    
    recalculateMax() {
        if (this.data.length === 0) {
            this.currentMax = -Infinity;
            this.currentEndingHere = 0;
            return;
        }
        
        this.currentMax = this.data[0];
        this.currentEndingHere = this.data[0];
        
        for (let i = 1; i < this.data.length; i++) {
            this.currentEndingHere = Math.max(this.data[i], this.currentEndingHere + this.data[i]);
            this.currentMax = Math.max(this.currentMax, this.currentEndingHere);
        }
    }
    
    getCurrentMax() {
        return this.currentMax;
    }
    
    getOptimalSegment() {
        const result = maxSubarrayWithIndices(this.data);
        return result;
    }
}

// Usage in real-time monitoring
const streamProcessor = new StreamingMaxSubarray(100);

// Process incoming metrics
setInterval(() => {
    const newMetric = getLatestPerformanceMetric();
    const currentBest = streamProcessor.addValue(newMetric);
    
    updateDashboard({
        currentMax: currentBest,
        optimalSegment: streamProcessor.getOptimalSegment()
    });
}, 1000);
```

### 2. Lazy Evaluation for Large Datasets
```javascript
class LazyMaxSubarray {
    constructor(dataGenerator) {
        this.dataGenerator = dataGenerator;
        this.cache = new Map();
        this.computedRanges = [];
    }
    
    getMaxSubarray(start, end) {
        const cacheKey = `${start}-${end}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Generate only needed data
        const data = [];
        for (let i = start; i <= end; i++) {
            data.push(this.dataGenerator(i));
        }
        
        const result = maxSubarrayWithIndices(data);
        
        // Adjust indices to global coordinates
        result.start += start;
        result.end += start;
        
        this.cache.set(cacheKey, result);
        return result;
    }
    
    // Progressive computation for very large ranges
    getMaxSubarrayProgressive(start, end, chunkSize = 1000) {
        let globalMax = -Infinity;
        let globalResult = null;
        
        for (let i = start; i <= end; i += chunkSize) {
            const chunkEnd = Math.min(i + chunkSize - 1, end);
            const chunkResult = this.getMaxSubarray(i, chunkEnd);
            
            if (chunkResult.maxSum > globalMax) {
                globalMax = chunkResult.maxSum;
                globalResult = chunkResult;
            }
        }
        
        return globalResult;
    }
}
```

## Testing & Edge Cases

### Comprehensive Test Suite
```javascript
function testMaxSubarray() {
    const testCases = [
        { input: [-2,1,-3,4,-1,2,1,-5,4], expected: 6, description: "Standard case" },
        { input: [1], expected: 1, description: "Single element positive" },
        { input: [-1], expected: -1, description: "Single element negative" },
        { input: [5,4,-1,7,8], expected: 23, description: "All positive with negative" },
        { input: [-5,-4,-1,-7,-8], expected: -1, description: "All negative" },
        { input: [0], expected: 0, description: "Single zero" },
        { input: [0,0,0], expected: 0, description: "All zeros" },
        { input: [1,-1,1,-1,1], expected: 1, description: "Alternating" },
        { input: [-2,-1], expected: -1, description: "Two negative" },
        { input: [2,1], expected: 3, description: "Two positive" }
    ];
    
    const implementations = [
        { name: "Kadane's Algorithm", func: maxSubarrayKadane },
        { name: "Brute Force", func: maxSubarrayBruteForce }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name}:`);
        let passed = 0;
        
        testCases.forEach(test => {
            try {
                const result = impl.func(test.input);
                const success = result === test.expected;
                
                console.log(`  ${success ? '✓' : '✗'} ${test.description}`);
                if (!success) {
                    console.log(`    Expected: ${test.expected}, Got: ${result}`);
                }
                
                if (success) passed++;
            } catch (error) {
                console.log(`  ✗ ${test.description}: ERROR - ${error.message}`);
            }
        });
        
        console.log(`  Summary: ${passed}/${testCases.length} tests passed`);
    });
}

testMaxSubarray();
```

## Interview Tips

### Discussion Points
1. **Dynamic Programming**: Explain how Kadane's uses optimal substructure
2. **Trade-offs**: Compare brute force vs optimal solutions
3. **Edge Cases**: Handle all negative numbers, empty arrays
4. **Variations**: Discuss circular arrays, product instead of sum

### Common Follow-ups
1. **"Return the actual subarray"** → Track indices during computation
2. **"Find k largest subarrays"** → Modify to find top k results
3. **"2D version"** → Maximum rectangle in binary matrix
4. **"Divide and conquer approach"** → Alternative O(n log n) solution

### Microsoft-Specific Context
1. **Excel/Spreadsheets**: Analyzing data ranges and trends
2. **Performance Analytics**: Finding optimal time windows
3. **Financial Applications**: Portfolio optimization, trading analysis
4. **Gaming**: Score tracking, performance periods

## Key Takeaways

1. **Kadane's Algorithm**: Master this classic DP technique
2. **Pattern Recognition**: Identify when maximum subarray applies
3. **Edge Cases**: Always consider all negative numbers
4. **Frontend Applications**: Useful for data analysis and visualization
5. **Optimization**: O(n) solution is optimal for this problem 