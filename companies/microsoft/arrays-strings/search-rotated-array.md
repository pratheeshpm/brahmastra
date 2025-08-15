# Search in Rotated Sorted Array ⭐

## Problem Statement

Given a rotated sorted array and a target value, return the index of the target if found, otherwise return -1. The array was originally sorted in ascending order, then rotated at some pivot point.

You may assume no duplicate values exist in the array.

**Example 1:**
```
Input: nums = [4,5,6,7,0,1,2], target = 0
Output: 4
```

**Example 2:**
```
Input: nums = [4,5,6,7,0,1,2], target = 3
Output: -1
```

**Example 3:**
```
Input: nums = [1], target = 0
Output: -1
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. Search in Circular Data Structures
```javascript
// Search in circular carousel/slider items
function findCarouselItem(items, targetId, currentIndex = 0) {
    // Create a "rotated" view starting from currentIndex
    const rotatedItems = [
        ...items.slice(currentIndex),
        ...items.slice(0, currentIndex)
    ];
    
    // Use binary search on rotated array
    const index = searchRotatedArray(
        rotatedItems.map(item => item.id), 
        targetId
    );
    
    if (index === -1) return -1;
    
    // Convert back to original array index
    return (currentIndex + index) % items.length;
}

// Practical example for image carousel
class ImageCarousel {
    constructor(images) {
        this.images = images;
        this.currentIndex = 0;
    }
    
    findImage(imageId) {
        // Create rotated view for efficient search
        const ids = this.images.map(img => img.id);
        const rotatedIds = [
            ...ids.slice(this.currentIndex),
            ...ids.slice(0, this.currentIndex)
        ];
        
        const rotatedIndex = searchRotatedArray(rotatedIds, imageId);
        if (rotatedIndex === -1) return null;
        
        const actualIndex = (this.currentIndex + rotatedIndex) % ids.length;
        return {
            image: this.images[actualIndex],
            index: actualIndex,
            stepsToReach: rotatedIndex
        };
    }
}
```

#### 2. Time-based Data Search
```javascript
// Search in time-series data that wraps around (e.g., 24-hour data)
function findTimeSlot(timeSlots, targetHour, currentHour = 0) {
    // timeSlots = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7]
    // If current time is 14 (2 PM), we want to search from current time forward
    
    const currentIndex = timeSlots.indexOf(currentHour);
    if (currentIndex === -1) return -1;
    
    // Create rotated array starting from current time
    const rotatedSlots = [
        ...timeSlots.slice(currentIndex),
        ...timeSlots.slice(0, currentIndex)
    ];
    
    const index = searchRotatedArray(rotatedSlots, targetHour);
    if (index === -1) return -1;
    
    return {
        originalIndex: (currentIndex + index) % timeSlots.length,
        hoursFromNow: index
    };
}

// Schedule management with wraparound
class ScheduleManager {
    constructor(slots) {
        this.slots = slots.sort((a, b) => a.hour - b.hour);
        this.currentHour = new Date().getHours();
    }
    
    findNextAvailableSlot(afterHour) {
        const hours = this.slots.map(slot => slot.hour);
        const currentIndex = hours.findIndex(h => h >= this.currentHour);
        
        if (currentIndex === -1) {
            // All slots are before current time, wrap to next day
            return this.slots[0];
        }
        
        // Create rotated view and search
        const rotatedHours = [
            ...hours.slice(currentIndex),
            ...hours.slice(0, currentIndex)
        ];
        
        const targetIndex = rotatedHours.findIndex(h => h > afterHour);
        if (targetIndex === -1) return null;
        
        const actualIndex = (currentIndex + targetIndex) % hours.length;
        return this.slots[actualIndex];
    }
}
```

#### 3. Pagination with Wraparound
```javascript
// Search in paginated data with circular navigation
class PaginatedSearch {
    constructor(pages, currentPage = 0) {
        this.pages = pages;
        this.currentPage = currentPage;
    }
    
    findItem(itemId) {
        // Create array of all items with page information
        const allItems = [];
        this.pages.forEach((page, pageIndex) => {
            page.items.forEach((item, itemIndex) => {
                allItems.push({
                    ...item,
                    pageIndex,
                    itemIndex,
                    globalIndex: pageIndex * page.items.length + itemIndex
                });
            });
        });
        
        // Create rotated view starting from current page
        const itemsFromCurrentPage = [];
        for (let i = 0; i < allItems.length; i++) {
            const adjustedIndex = (this.currentPage * this.pages[0].items.length + i) % allItems.length;
            itemsFromCurrentPage.push(allItems[adjustedIndex]);
        }
        
        // Search for item
        const index = itemsFromCurrentPage.findIndex(item => item.id === itemId);
        if (index === -1) return null;
        
        return {
            item: itemsFromCurrentPage[index],
            stepsFromCurrent: index,
            pageDistance: Math.abs(itemsFromCurrentPage[index].pageIndex - this.currentPage)
        };
    }
}
```

## Approach 1: Linear Search (Brute Force)

### Algorithm
1. Iterate through entire array
2. Compare each element with target
3. Return index if found, -1 otherwise

### Implementation
```javascript
function searchRotatedArray(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] === target) {
            return i;
        }
    }
    return -1;
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Visit every element
- **Space Complexity**: O(1) - No extra space
- **Pros**: Simple, works for any array
- **Cons**: Doesn't leverage sorted property

## Approach 2: Find Pivot + Binary Search

### Algorithm
1. Find the pivot point (where rotation occurred)
2. Determine which half contains the target
3. Apply binary search on the appropriate half

### Implementation
```javascript
function searchRotatedArray(nums, target) {
    if (!nums || nums.length === 0) return -1;
    
    // Find pivot point
    function findPivot() {
        let left = 0;
        let right = nums.length - 1;
        
        // If array is not rotated
        if (nums[left] <= nums[right]) return 0;
        
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        return left; // Pivot index
    }
    
    // Binary search in range
    function binarySearch(start, end) {
        let left = start;
        let right = end;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            if (nums[mid] === target) {
                return mid;
            } else if (nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1;
    }
    
    const pivot = findPivot();
    
    // Search in first half
    let result = binarySearch(0, pivot - 1);
    if (result !== -1) return result;
    
    // Search in second half
    return binarySearch(pivot, nums.length - 1);
}
```

### Complexity Analysis
- **Time Complexity**: O(log n) - Two binary searches
- **Space Complexity**: O(1) - Constant space
- **Pros**: Efficient, clear logic
- **Cons**: Multiple passes, more complex

## Approach 3: Single Pass Binary Search (Optimal)

### Algorithm
1. Use modified binary search in single pass
2. At each step, determine which half is sorted
3. Check if target is in the sorted half
4. Adjust search bounds accordingly

### Implementation
```javascript
function searchRotatedArray(nums, target) {
    if (!nums || nums.length === 0) return -1;
    
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        // Found target
        if (nums[mid] === target) {
            return mid;
        }
        
        // Determine which half is sorted
        if (nums[left] <= nums[mid]) {
            // Left half is sorted
            if (target >= nums[left] && target < nums[mid]) {
                // Target is in left half
                right = mid - 1;
            } else {
                // Target is in right half
                left = mid + 1;
            }
        } else {
            // Right half is sorted
            if (target > nums[mid] && target <= nums[right]) {
                // Target is in right half
                left = mid + 1;
            } else {
                // Target is in left half
                right = mid - 1;
            }
        }
    }
    
    return -1;
}
```

### Detailed Example Trace
```
Array: [4,5,6,7,0,1,2], Target: 0

Step 1: left=0, right=6, mid=3
  nums[mid] = 7, target = 0
  nums[left]=4 <= nums[mid]=7, so left half [4,5,6,7] is sorted
  target=0 < nums[left]=4, so target NOT in left half
  Search right half: left = mid + 1 = 4

Step 2: left=4, right=6, mid=5  
  nums[mid] = 1, target = 0
  nums[left]=0 <= nums[mid]=1, so left half [0,1] is sorted
  target=0 >= nums[left]=0 AND target=0 < nums[mid]=1, so target IS in left half
  Search left half: right = mid - 1 = 4

Step 3: left=4, right=4, mid=4
  nums[mid] = 0, target = 0
  Found! Return 4
```

### Complexity Analysis
- **Time Complexity**: O(log n) - Single binary search
- **Space Complexity**: O(1) - Constant space
- **Pros**: Most efficient, single pass
- **Cons**: Logic can be tricky to get right

## Edge Cases & Variations

### Handle Duplicates (Follow-up)
```javascript
function searchRotatedArrayWithDuplicates(nums, target) {
    if (!nums || nums.length === 0) return -1;
    
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] === target) {
            return mid;
        }
        
        // Handle duplicates: nums[left] === nums[mid] === nums[right]
        if (nums[left] === nums[mid] && nums[mid] === nums[right]) {
            left++;
            right--;
            continue;
        }
        
        if (nums[left] <= nums[mid]) {
            if (target >= nums[left] && target < nums[mid]) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        } else {
            if (target > nums[mid] && target <= nums[right]) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
    
    return -1;
}
```

### Find Minimum in Rotated Array
```javascript
function findMin(nums) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] > nums[right]) {
            // Minimum is in right half
            left = mid + 1;
        } else {
            // Minimum is in left half (including mid)
            right = mid;
        }
    }
    
    return nums[left];
}
```

### Find Rotation Count
```javascript
function findRotationCount(nums) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        // If array is already sorted
        if (nums[left] <= nums[right]) {
            return left;
        }
        
        const mid = Math.floor((left + right) / 2);
        
        if (nums[mid] > nums[right]) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    
    return left;
}
```

## Frontend-Specific Optimizations

### 1. Memoized Search for Repeated Queries
```javascript
class RotatedArraySearcher {
    constructor(nums) {
        this.nums = nums;
        this.pivot = this.findPivot();
        this.searchCache = new Map();
    }
    
    findPivot() {
        let left = 0;
        let right = this.nums.length - 1;
        
        if (this.nums[left] <= this.nums[right]) return 0;
        
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (this.nums[mid] > this.nums[right]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        return left;
    }
    
    search(target) {
        if (this.searchCache.has(target)) {
            return this.searchCache.get(target);
        }
        
        const result = this.binarySearchInRange(target);
        this.searchCache.set(target, result);
        return result;
    }
    
    binarySearchInRange(target) {
        // Search in both halves using pivot
        let result = this.binarySearch(0, this.pivot - 1, target);
        if (result !== -1) return result;
        
        return this.binarySearch(this.pivot, this.nums.length - 1, target);
    }
    
    binarySearch(start, end, target) {
        let left = start;
        let right = end;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            if (this.nums[mid] === target) {
                return mid;
            } else if (this.nums[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1;
    }
    
    clearCache() {
        this.searchCache.clear();
    }
}

// Usage
const searcher = new RotatedArraySearcher([4,5,6,7,0,1,2]);
console.log(searcher.search(0)); // 4 (computed)
console.log(searcher.search(0)); // 4 (cached)
```

### 2. Search with Range Results
```javascript
function searchRotatedArrayRange(nums, target) {
    function findFirst(nums, target) {
        let left = 0;
        let right = nums.length - 1;
        let result = -1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            if (nums[mid] === target) {
                result = mid;
                right = mid - 1; // Continue searching left
            } else if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (target > nums[mid] && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        
        return result;
    }
    
    function findLast(nums, target) {
        let left = 0;
        let right = nums.length - 1;
        let result = -1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            
            if (nums[mid] === target) {
                result = mid;
                left = mid + 1; // Continue searching right
            } else if (nums[left] <= nums[mid]) {
                if (target >= nums[left] && target < nums[mid]) {
                    right = mid - 1;
                } else {
                    left = mid + 1;
                }
            } else {
                if (target > nums[mid] && target <= nums[right]) {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
        }
        
        return result;
    }
    
    const first = findFirst(nums, target);
    if (first === -1) return [-1, -1];
    
    const last = findLast(nums, target);
    return [first, last];
}
```

## Testing & Debugging

### Comprehensive Test Suite
```javascript
function testSearchRotatedArray() {
    const testCases = [
        // Basic cases
        { nums: [4,5,6,7,0,1,2], target: 0, expected: 4, description: "Target in rotated part" },
        { nums: [4,5,6,7,0,1,2], target: 3, expected: -1, description: "Target not found" },
        { nums: [1], target: 0, expected: -1, description: "Single element, not found" },
        { nums: [1], target: 1, expected: 0, description: "Single element, found" },
        
        // Edge cases
        { nums: [], target: 5, expected: -1, description: "Empty array" },
        { nums: [1,2,3,4,5], target: 3, expected: 2, description: "No rotation" },
        { nums: [2,1], target: 1, expected: 1, description: "Two elements" },
        { nums: [2,1], target: 2, expected: 0, description: "Two elements, first" },
        
        // Different rotation points
        { nums: [3,4,5,1,2], target: 1, expected: 3, description: "Rotation in middle" },
        { nums: [2,3,4,5,1], target: 1, expected: 4, description: "Rotation near end" },
        { nums: [5,1,2,3,4], target: 5, expected: 0, description: "Rotation near start" },
        
        // All positions
        { nums: [4,5,6,7,0,1,2], target: 4, expected: 0, description: "First element" },
        { nums: [4,5,6,7,0,1,2], target: 7, expected: 3, description: "Before rotation" },
        { nums: [4,5,6,7,0,1,2], target: 2, expected: 6, description: "Last element" }
    ];
    
    const implementations = [
        { name: "Linear Search", func: searchRotatedArrayLinear },
        { name: "Find Pivot + Binary Search", func: searchRotatedArrayPivot },
        { name: "Single Pass Binary Search", func: searchRotatedArray }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name}:`);
        let passed = 0;
        
        testCases.forEach(test => {
            try {
                const result = impl.func([...test.nums], test.target);
                const success = result === test.expected;
                
                console.log(`  ${success ? '✓' : '✗'} ${test.description}`);
                console.log(`    Input: [${test.nums.join(',')}], target: ${test.target}`);
                console.log(`    Expected: ${test.expected}, Got: ${result}`);
                
                if (success) passed++;
            } catch (error) {
                console.log(`  ✗ ${test.description}: ERROR - ${error.message}`);
            }
        });
        
        console.log(`  Summary: ${passed}/${testCases.length} tests passed`);
    });
}

testSearchRotatedArray();
```

### Visual Debug Helper
```javascript
function visualizeRotatedSearch(nums, target) {
    console.log(`Searching for ${target} in [${nums.join(',')}]`);
    
    let left = 0;
    let right = nums.length - 1;
    let step = 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        console.log(`\nStep ${step}:`);
        console.log(`  Range: [${left}, ${right}], Mid: ${mid}`);
        console.log(`  Values: left=${nums[left]}, mid=${nums[mid]}, right=${nums[right]}`);
        
        if (nums[mid] === target) {
            console.log(`  ✓ Found target at index ${mid}!`);
            return mid;
        }
        
        if (nums[left] <= nums[mid]) {
            console.log(`  Left half [${left}, ${mid}] is sorted`);
            if (target >= nums[left] && target < nums[mid]) {
                console.log(`  Target ${target} is in sorted left half`);
                right = mid - 1;
            } else {
                console.log(`  Target ${target} is in right half`);
                left = mid + 1;
            }
        } else {
            console.log(`  Right half [${mid}, ${right}] is sorted`);
            if (target > nums[mid] && target <= nums[right]) {
                console.log(`  Target ${target} is in sorted right half`);
                left = mid + 1;
            } else {
                console.log(`  Target ${target} is in left half`);
                right = mid - 1;
            }
        }
        
        step++;
    }
    
    console.log(`\n✗ Target ${target} not found`);
    return -1;
}

// Usage
visualizeRotatedSearch([4,5,6,7,0,1,2], 0);
```

## Interview Tips

### Discussion Points
1. **Clarify Constraints**: Ask about duplicates, array size, target range
2. **Multiple Approaches**: Start with brute force, then optimize
3. **Edge Cases**: Empty array, single element, no rotation
4. **Real-world Applications**: Mention circular data structures, time-based searches

### Common Follow-ups
1. **"What if there are duplicates?"** → Show handling of equal elements
2. **"Find the minimum element"** → Modify algorithm to find pivot
3. **"How many times was the array rotated?"** → Find rotation count
4. **"Find all occurrences"** → Extend to find first and last positions

### Microsoft-Specific Context
1. **Performance**: Discuss O(log n) vs O(n) trade-offs
2. **User Experience**: Relate to search functionality in web applications
3. **Data Structures**: Connect to circular buffers, carousel components
4. **Scalability**: Consider large datasets and optimization strategies

## Key Takeaways

1. **Binary Search Mastery**: Understanding how to modify binary search for different conditions
2. **Pattern Recognition**: Identifying which half of rotated array is sorted
3. **Edge Case Handling**: Empty arrays, no rotation, duplicates
4. **Frontend Applications**: Carousel navigation, time-based data, pagination
5. **Optimization**: Single-pass vs multi-pass approaches, caching for repeated queries 