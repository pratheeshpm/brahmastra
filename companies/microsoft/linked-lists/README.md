# Linked Lists - Microsoft Frontend Staff Engineer Interview

This folder contains solutions to Linked Lists questions commonly asked in Microsoft Frontend Staff Engineer interviews.

## Question Categories

### Easy Level
- [Reverse a Linked List](./reverse-linked-list.md) ⭐
- [Detect Cycle in Linked List](./detect-cycle.md) ⭐
- [Merge Two Sorted Linked Lists](./merge-two-sorted.md)
- [Remove Duplicates from Sorted List](./remove-duplicates-sorted.md)
- [Find Middle of Linked List](./find-middle.md)
- [Delete Node in Linked List](./delete-node.md)

### Medium Level
- [Add Two Numbers (Linked Lists)](./add-two-numbers.md) ⭐
- [Remove Nth Node from End](./remove-nth-from-end.md)
- [Clone List with Random Pointer](./clone-random-pointer.md) ⭐
- [Find Intersection of Two Lists](./find-intersection.md)
- [Reorder Linked List](./reorder-list.md)
- [Rotate List](./rotate-list.md)
- [Partition List](./partition-list.md)
- [Sort List](./sort-list.md)

### Hard Level
- [Merge k Sorted Lists](./merge-k-sorted.md)
- [Reverse Nodes in k-Group](./reverse-k-group.md)
- [Copy List with Random Pointer Advanced](./copy-list-advanced.md)

## Key Patterns to Master

### 1. Two Pointers (Slow & Fast)
Used for cycle detection, finding middle, nth from end
```javascript
// Floyd's Cycle Detection
let slow = head, fast = head;
while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; // Cycle detected
}
```

### 2. Dummy Head
Simplifies edge cases when head might change
```javascript
const dummy = new ListNode(0);
dummy.next = head;
let current = dummy;
// Process list...
return dummy.next;
```

### 3. Reverse Pattern
Common in many linked list problems
```javascript
function reverseList(head) {
    let prev = null, current = head;
    while (current) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    return prev;
}
```

### 4. Merge Pattern
Combining sorted lists efficiently
```javascript
function mergeLists(l1, l2) {
    const dummy = new ListNode(0);
    let current = dummy;
    
    while (l1 && l2) {
        if (l1.val <= l2.val) {
            current.next = l1;
            l1 = l1.next;
        } else {
            current.next = l2;
            l2 = l2.next;
        }
        current = current.next;
    }
    
    current.next = l1 || l2;
    return dummy.next;
}
```

## Frontend Engineering Context

### Why Linked Lists Matter for Frontend Engineers

#### 1. DOM Manipulation
The DOM itself is essentially a linked structure
```javascript
// Similar patterns in DOM traversal
function traverseDOM(element) {
    let current = element.firstChild;
    while (current) {
        processElement(current);
        current = current.nextSibling;
    }
}
```

#### 2. Undo/Redo Systems
Linked lists are perfect for history management
```javascript
class UndoRedoManager {
    constructor() {
        this.current = null;
        this.head = null;
    }
    
    addAction(action) {
        const node = { action, prev: this.current, next: null };
        if (this.current) {
            this.current.next = node;
        } else {
            this.head = node;
        }
        this.current = node;
    }
    
    undo() {
        if (this.current && this.current.prev) {
            this.current = this.current.prev;
            return this.current.action;
        }
        return null;
    }
    
    redo() {
        if (this.current && this.current.next) {
            this.current = this.current.next;
            return this.current.action;
        }
        return null;
    }
}
```

#### 3. Component Lists & Dynamic Content
Managing dynamic component lists efficiently
```javascript
// React-like component list management
class ComponentList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
    
    addComponent(component, index = this.size) {
        const node = { component, next: null };
        
        if (index === 0) {
            node.next = this.head;
            this.head = node;
        } else {
            let current = this.head;
            for (let i = 0; i < index - 1; i++) {
                current = current.next;
            }
            node.next = current.next;
            current.next = node;
        }
        this.size++;
    }
    
    removeComponent(index) {
        if (index === 0) {
            this.head = this.head.next;
        } else {
            let current = this.head;
            for (let i = 0; i < index - 1; i++) {
                current = current.next;
            }
            current.next = current.next.next;
        }
        this.size--;
    }
}
```

#### 4. Browser History Implementation
Implementing navigation history
```javascript
class BrowserHistory {
    constructor(homepage) {
        this.current = { url: homepage, prev: null, next: null };
    }
    
    visit(url) {
        const newPage = { url, prev: this.current, next: null };
        this.current.next = newPage;
        this.current = newPage;
    }
    
    back(steps) {
        for (let i = 0; i < steps && this.current.prev; i++) {
            this.current = this.current.prev;
        }
        return this.current.url;
    }
    
    forward(steps) {
        for (let i = 0; i < steps && this.current.next; i++) {
            this.current = this.current.next;
        }
        return this.current.url;
    }
}
```

## Common Data Structures Used

### ListNode Definition
```javascript
class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

// Alternative functional approach
function createNode(val, next = null) {
    return { val, next };
}
```

### Doubly Linked List Node
```javascript
class DoublyListNode {
    constructor(val = 0, prev = null, next = null) {
        this.val = val;
        this.prev = prev;
        this.next = next;
    }
}
```

### Node with Random Pointer
```javascript
class RandomListNode {
    constructor(val = 0, next = null, random = null) {
        this.val = val;
        this.next = next;
        this.random = random;
    }
}
```

## Time & Space Complexity Patterns

### Common Complexities
- **Traversal**: O(n) time, O(1) space
- **Search**: O(n) time, O(1) space
- **Insertion**: O(1) time if position known, O(n) if searching
- **Deletion**: O(1) time if node reference known, O(n) if searching
- **Reverse**: O(n) time, O(1) space
- **Merge**: O(n + m) time, O(1) space

### Space Optimization Techniques
```javascript
// Instead of creating new nodes, reuse existing ones
function rearrangeInPlace(head) {
    // Modify pointers instead of creating new list
    // Space: O(1) instead of O(n)
}
```

## Common Edge Cases

### 1. Empty List
```javascript
if (!head) return null; // or appropriate default
```

### 2. Single Node
```javascript
if (!head.next) {
    // Handle single node case
    return head; // or process single node
}
```

### 3. Two Nodes
```javascript
if (!head || !head.next) return head;
// Handle case where list has 0-2 nodes
```

### 4. Circular References
```javascript
// Be careful with cycles to avoid infinite loops
const visited = new Set();
while (current && !visited.has(current)) {
    visited.add(current);
    current = current.next;
}
```

## Testing Strategies

### Helper Functions
```javascript
// Create list from array
function createList(arr) {
    if (!arr.length) return null;
    const head = new ListNode(arr[0]);
    let current = head;
    for (let i = 1; i < arr.length; i++) {
        current.next = new ListNode(arr[i]);
        current = current.next;
    }
    return head;
}

// Convert list to array for testing
function listToArray(head) {
    const result = [];
    let current = head;
    while (current) {
        result.push(current.val);
        current = current.next;
    }
    return result;
}

// Test helper
function testLinkedListFunction(fn, input, expected) {
    const list = createList(input);
    const result = fn(list);
    const actual = listToArray(result);
    console.log(`Input: [${input.join(',')}]`);
    console.log(`Expected: [${expected.join(',')}]`);
    console.log(`Actual: [${actual.join(',')}]`);
    console.log(`Pass: ${JSON.stringify(actual) === JSON.stringify(expected)}`);
}
```

### Test Cases Template
```javascript
function testLinkedListProblem() {
    const testCases = [
        { input: [], expected: [] },
        { input: [1], expected: [1] },
        { input: [1, 2], expected: [2, 1] },
        { input: [1, 2, 3, 4, 5], expected: [5, 4, 3, 2, 1] }
    ];
    
    testCases.forEach(({ input, expected }, index) => {
        console.log(`Test Case ${index + 1}:`);
        testLinkedListFunction(solutionFunction, input, expected);
        console.log('---');
    });
}
```

## Interview Tips

### Problem-Solving Approach
1. **Clarify Requirements**
   - Is it singly or doubly linked?
   - Can we modify the original list?
   - What should we return for edge cases?

2. **Draw It Out**
   - Visualize the list transformations
   - Track pointer movements step by step

3. **Handle Edge Cases First**
   - Empty list
   - Single node
   - Two nodes

4. **Choose the Right Pattern**
   - Two pointers for cycle/middle/nth from end
   - Dummy head for head modifications
   - Recursion for elegant solutions (watch stack space)

### Common Mistakes to Avoid
1. **Losing References**: Always store next before modifying pointers
2. **Infinite Loops**: Check for cycles in input
3. **Memory Leaks**: Be careful with references in languages with manual memory management
4. **Off-by-One Errors**: Carefully handle list boundaries

### Microsoft-Specific Focus
1. **Performance**: Discuss time/space trade-offs
2. **Real-world Applications**: Relate to browser history, undo/redo, DOM manipulation
3. **Scalability**: How would solution work with millions of nodes?
4. **Error Handling**: Handle malformed input gracefully
5. **Code Quality**: Clean, readable, maintainable code

## Advanced Topics

### 1. Lock-Free Linked Lists
For concurrent programming scenarios
```javascript
// Atomic operations for thread-safe linked list operations
class LockFreeList {
    constructor() {
        this.head = { val: -Infinity, next: { val: Infinity, next: null } };
    }
    
    // Implementation would use compare-and-swap operations
    // in a real concurrent environment
}
```

### 2. Memory Pools
Optimizing allocation for high-performance scenarios
```javascript
class NodePool {
    constructor(size = 1000) {
        this.pool = [];
        for (let i = 0; i < size; i++) {
            this.pool.push(new ListNode());
        }
        this.index = 0;
    }
    
    getNode(val) {
        if (this.index < this.pool.length) {
            const node = this.pool[this.index++];
            node.val = val;
            node.next = null;
            return node;
        }
        return new ListNode(val);
    }
    
    releaseNode(node) {
        if (this.index > 0) {
            this.pool[--this.index] = node;
        }
    }
}
```

### 3. Persistent Data Structures
Creating immutable linked lists for functional programming
```javascript
class PersistentList {
    constructor(head = null) {
        this.head = head;
    }
    
    prepend(val) {
        const newNode = new ListNode(val, this.head);
        return new PersistentList(newNode);
    }
    
    tail() {
        return this.head ? new PersistentList(this.head.next) : this;
    }
}
```

## Key Takeaways

- **Pattern Recognition**: Identify when to use two pointers, dummy head, or recursion
- **Pointer Management**: Master the art of manipulating next pointers
- **Edge Case Handling**: Always consider empty, single, and two-node lists
- **Frontend Relevance**: Understand applications in DOM manipulation, history management, and component lifecycle
- **Performance Awareness**: Know when to optimize for time vs space
- **Clean Code**: Write readable, maintainable solutions that handle errors gracefully 