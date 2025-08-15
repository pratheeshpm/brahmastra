# Remove Duplicates from Array - In Place

## Problem Statement

Given a sorted array `nums`, remove the duplicates in-place such that each element appears only once and returns the new length. Do not allocate extra space for another array; you must do this by modifying the input array in-place with O(1) extra memory.

**Example 1:**
```
Input: nums = [1,1,2]
Output: 2, nums = [1,2,_]
Explanation: Your function should return length = 2, with the first two elements of nums being 1 and 2 respectively.
```

**Example 2:**
```
Input: nums = [0,0,1,1,1,2,2,3,3,4]
Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]
```

## Brute Force Approach

### Algorithm
1. Use a Set to track unique elements
2. Create a new array with unique elements
3. Copy back to original array

### Implementation
```javascript
function removeDuplicatesBruteForce(nums) {
    if (nums.length <= 1) return nums.length;
    
    // Use Set to get unique elements
    const uniqueSet = new Set();
    for (let i = 0; i < nums.length; i++) {
        uniqueSet.add(nums[i]);
    }
    
    // Convert Set back to array
    const uniqueArray = Array.from(uniqueSet);
    
    // Copy unique elements back to original array
    for (let i = 0; i < uniqueArray.length; i++) {
        nums[i] = uniqueArray[i];
    }
    
    return uniqueArray.length;
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Single pass through array
- **Space Complexity**: O(n) - Set and temporary array storage
- **Issues**: Uses extra space, doesn't meet O(1) space requirement

## Optimal Approach (Two Pointers)

### Algorithm
Since the array is sorted, we can use two pointers:
1. `i` - slow pointer, tracks position for next unique element
2. `j` - fast pointer, scans through array
3. When `nums[j] != nums[i]`, we found a new unique element

### Implementation
```javascript
function removeDuplicatesOptimal(nums) {
    if (nums.length <= 1) return nums.length;
    
    let i = 0; // Slow pointer for unique elements
    
    for (let j = 1; j < nums.length; j++) {
        // If current element is different from previous unique element
        if (nums[j] !== nums[i]) {
            i++; // Move to next position for unique element
            nums[i] = nums[j]; // Place the unique element
        }
    }
    
    return i + 1; // Length of array with unique elements
}
```

### Step-by-Step Walkthrough
```
Input: [0,0,1,1,1,2,2,3,3,4]

Initial: i=0, j=1
nums: [0,0,1,1,1,2,2,3,3,4]
       ↑ ↑
       i j

Step 1: nums[j=1]=0, nums[i=0]=0 → same, j++
Step 2: nums[j=2]=1, nums[i=0]=0 → different
        i++, nums[i=1]=nums[j=2]=1
        nums: [0,1,1,1,1,2,2,3,3,4]
               ↑   ↑
               i   j

Step 3: nums[j=3]=1, nums[i=1]=1 → same, j++
Step 4: nums[j=4]=1, nums[i=1]=1 → same, j++
Step 5: nums[j=5]=2, nums[i=1]=1 → different
        i++, nums[i=2]=nums[j=5]=2
        nums: [0,1,2,1,1,2,2,3,3,4]
               ↑     ↑
               i     j

Continue this process...
Final: nums: [0,1,2,3,4,_,_,_,_,_]
       Return: i+1 = 5
```

### Complexity Analysis
- **Time Complexity**: O(n) - Single pass through array
- **Space Complexity**: O(1) - Only using two pointers
- **Advantages**: Meets space requirement, simple and efficient

## Alternative Optimal Approach (Filter In-Place)

### Implementation
```javascript
function removeDuplicatesAlternative(nums) {
    if (nums.length <= 1) return nums.length;
    
    let writeIndex = 1; // Position to write next unique element
    
    for (let readIndex = 1; readIndex < nums.length; readIndex++) {
        // If current element is different from previous
        if (nums[readIndex] !== nums[readIndex - 1]) {
            nums[writeIndex] = nums[readIndex];
            writeIndex++;
        }
    }
    
    return writeIndex;
}
```

### Complexity Analysis
- **Time Complexity**: O(n)
- **Space Complexity**: O(1)

## Frontend Engineering Context

### Real-World Applications
1. **Data Filtering**: Removing duplicate items in search results
2. **User Input Validation**: Ensuring unique values in forms
3. **Performance Optimization**: Reducing redundant API calls
4. **Component State**: Managing unique items in React state

### Example Usage in React
```javascript
function UniqueItemsList({ items }) {
    const [uniqueItems, setUniqueItems] = useState([]);
    
    useEffect(() => {
        // Remove duplicates from props
        const sorted = [...items].sort();
        const length = removeDuplicatesOptimal(sorted);
        setUniqueItems(sorted.slice(0, length));
    }, [items]);
    
    return (
        <ul>
            {uniqueItems.map(item => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}
```

## Edge Cases to Consider

1. **Empty Array**: `[]` → return 0
2. **Single Element**: `[1]` → return 1
3. **All Same Elements**: `[1,1,1,1]` → return 1
4. **Already Unique**: `[1,2,3,4]` → return 4
5. **Two Elements Same**: `[1,1]` → return 1
6. **Two Elements Different**: `[1,2]` → return 2

## Test Cases
```javascript
function testRemoveDuplicates() {
    const testCases = [
        { input: [1,1,2], expected: 2 },
        { input: [0,0,1,1,1,2,2,3,3,4], expected: 5 },
        { input: [], expected: 0 },
        { input: [1], expected: 1 },
        { input: [1,1,1], expected: 1 },
        { input: [1,2,3], expected: 3 }
    ];
    
    testCases.forEach(({ input, expected }, index) => {
        const result = removeDuplicatesOptimal([...input]);
        console.log(`Test ${index + 1}: ${result === expected ? 'PASS' : 'FAIL'}`);
    });
}
```

## Interview Tips

1. **Clarify Input**: Confirm array is sorted (crucial for optimal solution)
2. **Start Simple**: Explain brute force first, then optimize
3. **Draw It Out**: Visualize pointer movement
4. **Explain Trade-offs**: Discuss why two-pointer approach is better
5. **Handle Edge Cases**: Mention and code for empty/single element arrays
6. **Frontend Context**: Relate to real-world frontend scenarios

## Key Takeaways

- **Pattern Recognition**: Two pointers for in-place array modification
- **Space Optimization**: O(n) to O(1) space improvement
- **Algorithm Choice**: Leverage sorted array property for efficiency
- **Frontend Application**: Common pattern in data processing and state management 