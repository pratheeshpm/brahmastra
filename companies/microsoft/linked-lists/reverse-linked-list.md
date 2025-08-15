# Reverse a Linked List ⭐

## Problem Statement

Given the head of a singly linked list, reverse the list, and return the reversed list.

**Example 1:**
```
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
```

**Example 2:**
```
Input: head = [1,2]
Output: [2,1]
```

**Example 3:**
```
Input: head = []
Output: []
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. Undo/Redo System Implementation
```javascript
// Reverse-based undo system for text editors
class UndoRedoManager {
    constructor() {
        this.undoStack = null; // Linked list of actions
        this.redoStack = null;
    }
    
    addAction(action) {
        // Add to undo stack
        const newNode = {
            action: action,
            next: this.undoStack
        };
        this.undoStack = newNode;
        
        // Clear redo stack when new action is performed
        this.redoStack = null;
    }
    
    undo() {
        if (!this.undoStack) return null;
        
        const action = this.undoStack.action;
        
        // Move from undo to redo stack (reverse operation)
        const nodeToMove = this.undoStack;
        this.undoStack = this.undoStack.next;
        
        nodeToMove.next = this.redoStack;
        this.redoStack = nodeToMove;
        
        return action;
    }
    
    redo() {
        if (!this.redoStack) return null;
        
        const action = this.redoStack.action;
        
        // Move from redo to undo stack (reverse operation)
        const nodeToMove = this.redoStack;
        this.redoStack = this.redoStack.next;
        
        nodeToMove.next = this.undoStack;
        this.undoStack = nodeToMove;
        
        return action;
    }
    
    // Get undo history in reverse order (most recent first)
    getUndoHistory() {
        const history = [];
        let current = this.undoStack;
        
        while (current) {
            history.push(current.action);
            current = current.next;
        }
        
        return history; // Already in reverse chronological order
    }
    
    // Get redo history in forward order (next to execute first)
    getRedoHistory() {
        const history = [];
        let current = this.redoStack;
        
        // Need to reverse to show proper execution order
        while (current) {
            history.unshift(current.action);
            current = current.next;
        }
        
        return history;
    }
}
```

#### 2. Navigation History (Browser-like)
```javascript
// Browser history implementation using reverse operations
class BrowserHistory {
    constructor(homepage) {
        this.history = { url: homepage, next: null };
        this.current = this.history;
        this.forward = null;
    }
    
    visit(url) {
        // Create new page node
        const newPage = { url: url, next: null };
        
        // Clear forward history when visiting new page
        this.forward = null;
        
        // Add to history chain
        this.current.next = newPage;
        this.current = newPage;
    }
    
    back(steps) {
        // Find the node 'steps' positions back
        let targetNode = null;
        let forwardChain = null;
        
        // Build forward chain by reversing path from current
        let temp = this.history;
        let prev = null;
        
        // Find position to go back to
        let count = 0;
        while (temp && temp !== this.current) {
            const next = temp.next;
            temp.next = prev;
            prev = temp;
            temp = next;
            count++;
        }
        
        // Add current to reversed chain
        if (temp) {
            temp.next = prev;
            prev = temp;
        }
        
        // Now prev points to current in reversed order
        // Move back 'steps' positions
        let node = prev;
        for (let i = 0; i < steps && node && node.next; i++) {
            node = node.next;
        }
        
        if (node) {
            this.current = node;
            this.updateForwardHistory();
        }
        
        // Restore original order (this is where reverse operation is crucial)
        this.restoreHistoryOrder();
        
        return this.current.url;
    }
    
    forward(steps) {
        if (!this.forward) return this.current.url;
        
        let node = this.forward;
        for (let i = 0; i < steps - 1 && node && node.next; i++) {
            node = node.next;
        }
        
        if (node) {
            this.current = node;
            this.updateForwardHistory();
        }
        
        return this.current.url;
    }
    
    // Helper methods using reverse logic
    restoreHistoryOrder() {
        // Implement using reverse linked list logic
        let prev = null;
        let current = this.history;
        
        while (current) {
            const next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        
        // Find actual end and reverse back
        let tail = prev;
        prev = null;
        current = tail;
        
        while (current) {
            const next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        
        this.history = prev;
    }
    
    updateForwardHistory() {
        // Build forward history from current position
        this.forward = this.current.next;
    }
}
```

#### 3. Component Rendering Order
```javascript
// Reverse component tree for bottom-up rendering
class ComponentRenderer {
    constructor() {
        this.renderQueue = null;
    }
    
    addComponent(component) {
        const newNode = {
            component: component,
            next: this.renderQueue
        };
        this.renderQueue = newNode;
    }
    
    // Render components in reverse order (LIFO)
    renderAll() {
        const renderOrder = [];
        let current = this.renderQueue;
        
        while (current) {
            renderOrder.push(current.component);
            current = current.next;
        }
        
        // renderOrder is already in reverse order due to LIFO structure
        return renderOrder;
    }
    
    // Render in original order (need to reverse)
    renderInOrder() {
        const reversed = this.reverseRenderQueue();
        const renderOrder = [];
        
        let current = reversed;
        while (current) {
            renderOrder.push(current.component);
            current = current.next;
        }
        
        return renderOrder;
    }
    
    reverseRenderQueue() {
        let prev = null;
        let current = this.renderQueue;
        
        while (current) {
            const next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        
        return prev;
    }
}
```

## Approach 1: Iterative Three-Pointer (Optimal)

### Algorithm
Use three pointers to reverse the links while traversing the list once.

### Implementation
```javascript
// Definition for singly-linked list
class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

function reverseListIterative(head) {
    let prev = null;
    let current = head;
    
    while (current !== null) {
        const next = current.next; // Store next node
        current.next = prev;       // Reverse the link
        prev = current;            // Move prev forward
        current = next;            // Move current forward
    }
    
    return prev; // prev is now the new head
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Single pass through the list
- **Space Complexity**: O(1) - Only using three pointers
- **Pros**: Optimal space usage, simple logic, no risk of stack overflow
- **Cons**: Modifies original list structure

### Example Trace
```
Input: 1 -> 2 -> 3 -> null

Initial: prev=null, current=1->2->3->null

Step 1:
  next = 2->3->null
  current.next = null    // 1->null
  prev = 1->null
  current = 2->3->null
  Result: prev=1->null, current=2->3->null

Step 2:
  next = 3->null
  current.next = 1->null // 2->1->null
  prev = 2->1->null
  current = 3->null
  Result: prev=2->1->null, current=3->null

Step 3:
  next = null
  current.next = 2->1->null // 3->2->1->null
  prev = 3->2->1->null
  current = null
  Result: prev=3->2->1->null, current=null

Final: return prev = 3->2->1->null
```

## Approach 2: Recursive (Elegant)

### Algorithm
Recursively reverse the rest of the list, then fix the current node's links.

### Implementation
```javascript
function reverseListRecursive(head) {
    // Base case: empty list or single node
    if (!head || !head.next) {
        return head;
    }
    
    // Recursively reverse the rest of the list
    const newHead = reverseListRecursive(head.next);
    
    // Reverse the current connection
    head.next.next = head;
    head.next = null;
    
    return newHead;
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Visit each node once
- **Space Complexity**: O(n) - Recursion stack
- **Pros**: Elegant, concise code
- **Cons**: Stack overflow risk for large lists, higher space usage

### Example Trace
```
Input: 1 -> 2 -> 3 -> null

reverseListRecursive(1):
  reverseListRecursive(2):
    reverseListRecursive(3):
      return 3  // Base case
    
    // Now at node 2, newHead = 3
    // head.next.next = head  →  3.next = 2  →  3->2
    // head.next = null       →  2.next = null  →  2->null
    // Return 3->2->null
  
  // Now at node 1, newHead = 3->2->null
  // head.next.next = head  →  2.next = 1  →  3->2->1
  // head.next = null       →  1.next = null  →  1->null
  // Return 3->2->1->null

Final result: 3->2->1->null
```

## Approach 3: Stack-Based

### Algorithm
Push all nodes onto a stack, then pop and rebuild the list in reverse order.

### Implementation
```javascript
function reverseListStack(head) {
    if (!head) return null;
    
    const stack = [];
    let current = head;
    
    // Push all nodes onto stack
    while (current) {
        stack.push(current);
        current = current.next;
    }
    
    // Pop nodes and rebuild list
    const newHead = stack.pop();
    current = newHead;
    
    while (stack.length > 0) {
        const node = stack.pop();
        current.next = node;
        current = node;
    }
    
    current.next = null; // Set last node's next to null
    return newHead;
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Two passes through the list
- **Space Complexity**: O(n) - Stack to store all nodes
- **Pros**: Easy to understand, preserves original node objects
- **Cons**: Higher space usage, not optimal

## Advanced Variations & Optimizations

### 1. Reverse in Groups
```javascript
function reverseInGroups(head, k) {
    // Check if we have at least k nodes
    let current = head;
    let count = 0;
    
    while (current && count < k) {
        current = current.next;
        count++;
    }
    
    if (count === k) {
        // Reverse first k nodes
        current = reverseInGroups(current, k);
        
        // Reverse current group
        while (count > 0) {
            const next = head.next;
            head.next = current;
            current = head;
            head = next;
            count--;
        }
        
        head = current;
    }
    
    return head;
}
```

### 2. Reverse Between Positions
```javascript
function reverseBetween(head, left, right) {
    if (!head || left === right) return head;
    
    const dummy = new ListNode(0);
    dummy.next = head;
    let prev = dummy;
    
    // Move to position before 'left'
    for (let i = 1; i < left; i++) {
        prev = prev.next;
    }
    
    // Start reversing from 'left' to 'right'
    let current = prev.next;
    
    for (let i = 0; i < right - left; i++) {
        const next = current.next;
        current.next = next.next;
        next.next = prev.next;
        prev.next = next;
    }
    
    return dummy.next;
}
```

### 3. Reverse with Condition
```javascript
function reverseIf(head, condition) {
    const dummy = new ListNode(0);
    dummy.next = head;
    let prev = dummy;
    let start = head;
    
    while (start) {
        // Find the end of sequence that meets condition
        let end = start;
        while (end && condition(end.val)) {
            end = end.next;
        }
        
        // If we found a sequence to reverse
        if (end !== start) {
            // Reverse the sequence from start to end-1
            prev.next = reverseSegment(start, end);
            
            // Update pointers
            while (prev.next !== end) {
                prev = prev.next;
            }
            start = end;
        } else {
            prev = start;
            start = start.next;
        }
    }
    
    return dummy.next;
}

function reverseSegment(start, end) {
    let prev = end;
    let current = start;
    
    while (current !== end) {
        const next = current.next;
        current.next = prev;
        prev = current;
        current = next;
    }
    
    return prev;
}
```

## Frontend-Specific Optimizations

### 1. Immutable Reverse (for React/Redux)
```javascript
function reverseListImmutable(head) {
    if (!head) return null;
    
    const nodes = [];
    let current = head;
    
    // Collect all values
    while (current) {
        nodes.push(current.val);
        current = current.next;
    }
    
    // Create new reversed list
    nodes.reverse();
    const newHead = new ListNode(nodes[0]);
    current = newHead;
    
    for (let i = 1; i < nodes.length; i++) {
        current.next = new ListNode(nodes[i]);
        current = current.next;
    }
    
    return newHead;
}
```

### 2. Reverse with Animation Support
```javascript
class AnimatedReverseList {
    constructor(head) {
        this.head = head;
        this.steps = [];
    }
    
    reverseWithSteps() {
        let prev = null;
        let current = this.head;
        let step = 0;
        
        while (current) {
            // Record state before change
            this.recordStep(step++, 'before', prev, current, current.next);
            
            const next = current.next;
            current.next = prev;
            prev = current;
            current = next;
            
            // Record state after change
            this.recordStep(step++, 'after', prev, current, next);
        }
        
        this.head = prev;
        return this.steps;
    }
    
    recordStep(stepNum, phase, prev, current, next) {
        this.steps.push({
            step: stepNum,
            phase: phase,
            prev: prev ? prev.val : null,
            current: current ? current.val : null,
            next: next ? next.val : null,
            listState: this.getListState()
        });
    }
    
    getListState() {
        const state = [];
        let current = this.head;
        
        while (current) {
            state.push(current.val);
            current = current.next;
        }
        
        return state;
    }
}
```

### 3. Memory Pool for Performance
```javascript
class ListNodePool {
    constructor(initialSize = 100) {
        this.pool = [];
        this.index = 0;
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new ListNode());
        }
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
            node.val = 0;
            node.next = null;
            this.pool[--this.index] = node;
        }
    }
    
    reverseListOptimized(head) {
        const values = [];
        let current = head;
        
        // Extract values and release nodes
        while (current) {
            values.push(current.val);
            const next = current.next;
            this.releaseNode(current);
            current = next;
        }
        
        // Create reversed list using pool
        if (values.length === 0) return null;
        
        const newHead = this.getNode(values[values.length - 1]);
        current = newHead;
        
        for (let i = values.length - 2; i >= 0; i--) {
            current.next = this.getNode(values[i]);
            current = current.next;
        }
        
        return newHead;
    }
}
```

## Testing & Edge Cases

### Comprehensive Test Suite
```javascript
function testReverseList() {
    // Helper function to create list from array
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
    
    // Helper function to convert list to array
    function listToArray(head) {
        const result = [];
        let current = head;
        
        while (current) {
            result.push(current.val);
            current = current.next;
        }
        
        return result;
    }
    
    const testCases = [
        { input: [], expected: [], description: "Empty list" },
        { input: [1], expected: [1], description: "Single element" },
        { input: [1, 2], expected: [2, 1], description: "Two elements" },
        { input: [1, 2, 3], expected: [3, 2, 1], description: "Three elements" },
        { input: [1, 2, 3, 4, 5], expected: [5, 4, 3, 2, 1], description: "Five elements" },
        { input: [1, 1, 2, 1], expected: [1, 2, 1, 1], description: "Duplicate values" }
    ];
    
    const implementations = [
        { name: "Iterative", func: reverseListIterative },
        { name: "Recursive", func: reverseListRecursive },
        { name: "Stack-based", func: reverseListStack }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name} implementation:`);
        let passed = 0;
        
        testCases.forEach(test => {
            try {
                const list = createList(test.input);
                const result = impl.func(list);
                const actual = listToArray(result);
                const success = JSON.stringify(actual) === JSON.stringify(test.expected);
                
                console.log(`  ${success ? '✓' : '✗'} ${test.description}`);
                if (!success) {
                    console.log(`    Expected: [${test.expected.join(',')}]`);
                    console.log(`    Actual: [${actual.join(',')}]`);
                }
                
                if (success) passed++;
            } catch (error) {
                console.log(`  ✗ ${test.description}: ERROR - ${error.message}`);
            }
        });
        
        console.log(`  Summary: ${passed}/${testCases.length} tests passed`);
    });
}

testReverseList();
```

### Edge Case Analysis
```javascript
function testEdgeCases() {
    console.log("Testing edge cases...\n");
    
    // Test 1: Null input
    try {
        const result = reverseListIterative(null);
        console.log(`✓ Null input: ${result === null ? 'Passed' : 'Failed'}`);
    } catch (e) {
        console.log(`✗ Null input: Error - ${e.message}`);
    }
    
    // Test 2: Circular list detection (should not hang)
    try {
        const node1 = new ListNode(1);
        const node2 = new ListNode(2);
        const node3 = new ListNode(3);
        
        node1.next = node2;
        node2.next = node3;
        node3.next = node1; // Creates cycle
        
        // This would hang with normal reverse - need cycle detection
        console.log("⚠ Circular list test skipped (would hang)");
    } catch (e) {
        console.log(`✗ Circular list: Error - ${e.message}`);
    }
    
    // Test 3: Very long list (stress test)
    try {
        const longList = createList(Array.from({ length: 10000 }, (_, i) => i));
        const start = performance.now();
        const reversed = reverseListIterative(longList);
        const end = performance.now();
        
        console.log(`✓ Long list (10k nodes): ${end - start}ms`);
    } catch (e) {
        console.log(`✗ Long list: Error - ${e.message}`);
    }
}
```

## Interview Tips

### Discussion Points
1. **Pointer Manipulation**: Demonstrate clear understanding of next pointer changes
2. **Space vs Time Trade-offs**: Compare iterative vs recursive approaches
3. **Edge Cases**: Always handle null inputs and single nodes
4. **In-place vs Copy**: Discuss when to modify original vs create new list

### Common Follow-ups
1. **"Reverse in groups of k"** → More complex pointer manipulation
2. **"Reverse only even-positioned nodes"** → Conditional reversal
3. **"Detect if list is already reversed"** → Optimization opportunity
4. **"Reverse and check for palindrome"** → Combine with other algorithms

### Microsoft-Specific Context
1. **Undo/Redo Systems**: Essential for Office applications
2. **Navigation History**: Browser-like functionality
3. **Data Structures**: Understanding fundamental operations
4. **Memory Management**: Efficient pointer manipulation

## Key Takeaways

1. **Master Pointer Manipulation**: Three-pointer technique is fundamental
2. **Space Efficiency**: Iterative approach is optimal for production code
3. **Frontend Applications**: Critical for undo systems and navigation
4. **Edge Case Handling**: Always consider null, single node, and empty cases
5. **Code Clarity**: Clean, readable implementation is as important as correctness 