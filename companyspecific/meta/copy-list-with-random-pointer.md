# Copy List with Random Pointer - LeetCode #138

## Problem Explanation
Deep copy a linked list where each node contains an additional random pointer which could point to any node in the list or null. Return the head of the copied linked list. The original list should not be modified.

## Sample Input and Output

**Example 1:**
```
Input: head = [[7,null],[13,0],[11,4],[10,2],[1,0]]
Output: [[7,null],[13,0],[11,4],[10,2],[1,0]]
Explanation: 
- Node 0: value=7, next=Node 1, random=null
- Node 1: value=13, next=Node 2, random=Node 0
- Node 2: value=11, next=Node 3, random=Node 4
- Node 3: value=10, next=Node 4, random=Node 2
- Node 4: value=1, next=null, random=Node 0
```

**Example 2:**
```
Input: head = [[1,1],[2,1]]
Output: [[1,1],[2,1]]
Explanation:
- Node 0: value=1, next=Node 1, random=Node 1
- Node 1: value=2, next=null, random=Node 1
```

## Algorithm Outline
**Approach 1 - HashMap (Two Pass):**
1. **First pass**: Create all new nodes, map original → copy
2. **Second pass**: Set next and random pointers using map
3. **Return**: Head of copied list

**Approach 2 - Interweaving (Constant Space):**
1. **Interweave**: Insert copy after each original node
2. **Set random**: Copy random pointers using interweaved structure
3. **Separate**: Extract copy list and restore original

## Step-by-Step Dry Run
Using Approach 1 with input `[[7,null],[13,0],[11,4]]`:

**First Pass - Create nodes:**
1. Node 7: Create copy, map[original_7] = copy_7
2. Node 13: Create copy, map[original_13] = copy_13  
3. Node 11: Create copy, map[original_11] = copy_11

**Second Pass - Set pointers:**
1. Node 7: copy_7.next = map[original_7.next] = copy_13, copy_7.random = null
2. Node 13: copy_13.next = map[original_13.next] = copy_11, copy_13.random = map[original_7] = copy_7
3. Node 11: copy_11.next = null, copy_11.random = map[original_11.random] = copy_11

## JavaScript Implementation

```javascript
// Definition for a Node
function Node(val, next, random) {
    this.val = val;
    this.next = next;
    this.random = random;
}

// Approach 1: HashMap (Two Pass)
function copyRandomList(head) {
    if (!head) return null;
    
    const nodeMap = new Map();
    
    // First pass: create all nodes and store in map
    let current = head;
    while (current) {
        nodeMap.set(current, new Node(current.val));
        current = current.next;
    }
    
    // Second pass: set next and random pointers
    current = head;
    while (current) {
        const copyNode = nodeMap.get(current);
        copyNode.next = current.next ? nodeMap.get(current.next) : null;
        copyNode.random = current.random ? nodeMap.get(current.random) : null;
        current = current.next;
    }
    
    return nodeMap.get(head);
}

// Approach 2: Interweaving (Constant Space)
function copyRandomListConstantSpace(head) {
    if (!head) return null;
    
    // Step 1: Create interweaved list
    // Original: A -> B -> C
    // Result:   A -> A' -> B -> B' -> C -> C'
    let current = head;
    while (current) {
        const copyNode = new Node(current.val);
        copyNode.next = current.next;
        current.next = copyNode;
        current = copyNode.next;
    }
    
    // Step 2: Set random pointers for copied nodes
    current = head;
    while (current) {
        if (current.random) {
            current.next.random = current.random.next;
        }
        current = current.next.next;
    }
    
    // Step 3: Separate the two lists
    const copyHead = head.next;
    let original = head;
    let copy = copyHead;
    
    while (original) {
        original.next = original.next.next;
        copy.next = copy.next ? copy.next.next : null;
        original = original.next;
        copy = copy.next;
    }
    
    return copyHead;
}

// Approach 3: Recursive with Memoization
function copyRandomListRecursive(head) {
    const memo = new Map();
    
    function copyNode(node) {
        if (!node) return null;
        
        // Return cached copy if already created
        if (memo.has(node)) {
            return memo.get(node);
        }
        
        // Create new node
        const copyNode = new Node(node.val);
        memo.set(node, copyNode);
        
        // Recursively copy next and random
        copyNode.next = copyNode(node.next);
        copyNode.random = copyNode(node.random);
        
        return copyNode;
    }
    
    return copyNode(head);
}

// Helper function to create test list
function createTestList(values, randoms) {
    if (!values.length) return null;
    
    const nodes = values.map(val => new Node(val));
    
    // Set next pointers
    for (let i = 0; i < nodes.length - 1; i++) {
        nodes[i].next = nodes[i + 1];
    }
    
    // Set random pointers
    for (let i = 0; i < randoms.length; i++) {
        if (randoms[i] !== null) {
            nodes[i].random = nodes[randoms[i]];
        }
    }
    
    return nodes[0];
}

// Helper function to convert list to array for testing
function listToArray(head) {
    const result = [];
    const nodeMap = new Map();
    let index = 0;
    
    // First pass: assign indices
    let current = head;
    while (current) {
        nodeMap.set(current, index++);
        current = current.next;
    }
    
    // Second pass: build result
    current = head;
    while (current) {
        const randomIndex = current.random ? nodeMap.get(current.random) : null;
        result.push([current.val, randomIndex]);
        current = current.next;
    }
    
    return result;
}

// Verify deep copy (no shared references)
function verifyDeepCopy(original, copy) {
    const originalNodes = new Set();
    const copyNodes = new Set();
    
    let current = original;
    while (current) {
        originalNodes.add(current);
        current = current.next;
    }
    
    current = copy;
    while (current) {
        copyNodes.add(current);
        if (originalNodes.has(current)) {
            return false; // Found shared reference
        }
        current = current.next;
    }
    
    return true;
}

// Test cases
function testCopyRandomList() {
    console.log("Testing Copy List with Random Pointer:");
    
    // Test case 1: [[7,null],[13,0],[11,4],[10,2],[1,0]]
    const test1 = createTestList([7, 13, 11, 10, 1], [null, 0, 4, 2, 0]);
    console.log("Original:", listToArray(test1));
    
    const copy1 = copyRandomList(test1);
    console.log("Copied (HashMap):", listToArray(copy1));
    console.log("Deep copy verified:", verifyDeepCopy(test1, copy1));
    
    const copy2 = copyRandomListConstantSpace(test1);
    console.log("Copied (Constant Space):", listToArray(copy2));
    console.log("Deep copy verified:", verifyDeepCopy(test1, copy2));
    
    // Test case 2: [[1,1],[2,1]]
    const test2 = createTestList([1, 2], [1, 1]);
    console.log("\nOriginal:", listToArray(test2));
    
    const copy3 = copyRandomListRecursive(test2);
    console.log("Copied (Recursive):", listToArray(copy3));
    console.log("Deep copy verified:", verifyDeepCopy(test2, copy3));
    
    // Test case 3: Empty list
    const copy4 = copyRandomList(null);
    console.log("\nEmpty list copy:", copy4 === null ? "null" : "not null");
}

// testCopyRandomList();
```

## Time and Space Complexity

**Approach 1 - HashMap:**
- **Time Complexity:** O(n) where n = number of nodes
  - Two passes through the list, each taking O(n)
- **Space Complexity:** O(n)
  - HashMap stores n key-value pairs
  - New list also takes O(n) space

**Approach 2 - Interweaving:**
- **Time Complexity:** O(n)
  - Three passes through the list, each taking O(n)
- **Space Complexity:** O(1) extra space
  - Only creates the new list nodes (which is required output)
  - No additional data structures used

**Approach 3 - Recursive:**
- **Time Complexity:** O(n)
  - Each node visited once due to memoization
- **Space Complexity:** O(n)
  - Recursion stack depth + memoization map

**Key Insights:**
1. **Random pointer challenge**: Cannot copy in single pass without additional space
2. **Interweaving technique**: Clever way to maintain relationships without extra space
3. **Deep copy requirement**: Must create entirely new nodes, no shared references
4. **Memoization importance**: Prevents infinite recursion in cycles

**Best Approach:** Interweaving (Approach 2) if space is critical, HashMap (Approach 1) for simplicity and readability.