# Detect Cycle in Linked List ⭐

## Problem Statement

Given `head`, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the `next` pointer. Return `true` if there is a cycle in the linked list. Otherwise, return `false`.

**Example 1:**
```
Input: head = [3,2,0,-4], pos = 1
Output: true
Explanation: There is a cycle where the tail connects to the 1st node (0-indexed).
```

**Example 2:**
```
Input: head = [1,2], pos = 0
Output: true
Explanation: There is a cycle where the tail connects to the 0th node.
```

**Example 3:**
```
Input: head = [1], pos = -1
Output: false
Explanation: There is no cycle in the linked list.
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. Memory Leak Detection in Component References
```javascript
// Detect circular references in React component trees
class ComponentCycleDetector {
    constructor() {
        this.visited = new WeakSet();
        this.visiting = new WeakSet();
    }
    
    detectCyclicDependency(component) {
        if (!component) return false;
        
        if (this.visiting.has(component)) {
            return true; // Cycle detected
        }
        
        if (this.visited.has(component)) {
            return false; // Already processed
        }
        
        this.visiting.add(component);
        
        // Check parent references
        if (component.parent) {
            if (this.detectCyclicDependency(component.parent)) {
                return true;
            }
        }
        
        // Check child references
        if (component.children) {
            for (const child of component.children) {
                if (this.detectCyclicDependency(child)) {
                    return true;
                }
            }
        }
        
        // Check context references
        if (component.context && component.context.provider) {
            if (this.detectCyclicDependency(component.context.provider)) {
                return true;
            }
        }
        
        this.visiting.delete(component);
        this.visited.add(component);
        
        return false;
    }
    
    // Detect cycles in hook dependencies
    detectHookCycle(hookDependencies) {
        const graph = new Map();
        
        // Build dependency graph
        hookDependencies.forEach(({ hook, dependencies }) => {
            graph.set(hook, dependencies || []);
        });
        
        const visiting = new Set();
        const visited = new Set();
        
        const hasCycle = (node) => {
            if (visiting.has(node)) return true;
            if (visited.has(node)) return false;
            
            visiting.add(node);
            
            const deps = graph.get(node) || [];
            for (const dep of deps) {
                if (hasCycle(dep)) return true;
            }
            
            visiting.delete(node);
            visited.add(node);
            return false;
        };
        
        for (const hook of graph.keys()) {
            if (hasCycle(hook)) {
                return { hasCycle: true, problematicHook: hook };
            }
        }
        
        return { hasCycle: false };
    }
}

// Usage in development tools
const detector = new ComponentCycleDetector();

function validateComponentTree(rootComponent) {
    const hasCycle = detector.detectCyclicDependency(rootComponent);
    
    if (hasCycle) {
        console.error('Circular reference detected in component tree!');
        console.error('This can cause memory leaks and infinite render loops');
        return false;
    }
    
    return true;
}
```

#### 2. Event Loop Cycle Detection
```javascript
// Detect infinite event loops in custom event systems
class EventLoopCycleDetector {
    constructor() {
        this.eventChains = new Map();
        this.activeChains = new Set();
    }
    
    trackEvent(eventName, triggeredBy = null) {
        const eventNode = {
            name: eventName,
            triggeredBy: triggeredBy,
            timestamp: Date.now(),
            next: null
        };
        
        if (triggeredBy) {
            // Link events to form a chain
            const parentChain = this.eventChains.get(triggeredBy);
            if (parentChain) {
                let current = parentChain;
                while (current.next) {
                    current = current.next;
                }
                current.next = eventNode;
                
                // Check for cycle using Floyd's algorithm
                if (this.detectCycleInEventChain(parentChain)) {
                    this.handleEventCycle(parentChain);
                    return false;
                }
            }
        }
        
        this.eventChains.set(eventName, eventNode);
        return true;
    }
    
    detectCycleInEventChain(head) {
        if (!head || !head.next) return false;
        
        let slow = head;
        let fast = head;
        
        // Floyd's Cycle Detection
        while (fast && fast.next) {
            slow = slow.next;
            fast = fast.next.next;
            
            if (slow === fast) {
                return true;
            }
            
            // Additional check for event name cycles
            if (slow.name === fast.name) {
                return true;
            }
        }
        
        return false;
    }
    
    handleEventCycle(chainHead) {
        console.error('Event loop cycle detected!');
        
        // Find the cycle start
        const cycleStart = this.findCycleStart(chainHead);
        
        console.error('Cycle starts at event:', cycleStart?.name);
        console.error('Consider adding event guards or breaking the cycle');
        
        // Break the cycle by setting a limit
        this.breakEventCycle(chainHead);
    }
    
    findCycleStart(head) {
        let slow = head;
        let fast = head;
        
        // First, detect if cycle exists
        while (fast && fast.next) {
            slow = slow.next;
            fast = fast.next.next;
            
            if (slow === fast) break;
        }
        
        if (!fast || !fast.next) return null;
        
        // Find the start of the cycle
        slow = head;
        while (slow !== fast) {
            slow = slow.next;
            fast = fast.next;
        }
        
        return slow;
    }
    
    breakEventCycle(head) {
        const cycleStart = this.findCycleStart(head);
        if (!cycleStart) return;
        
        let current = cycleStart;
        while (current.next && current.next !== cycleStart) {
            current = current.next;
        }
        
        // Break the cycle
        if (current.next === cycleStart) {
            current.next = null;
        }
    }
}

// Usage in event management
const eventDetector = new EventLoopCycleDetector();

class SafeEventEmitter extends EventEmitter {
    emit(eventName, ...args) {
        const currentEvent = this.getCurrentEvent();
        
        if (!eventDetector.trackEvent(eventName, currentEvent)) {
            console.warn(`Prevented infinite event loop for: ${eventName}`);
            return false;
        }
        
        return super.emit(eventName, ...args);
    }
    
    getCurrentEvent() {
        // Get the current event from call stack
        const stack = new Error().stack;
        const eventMatch = stack.match(/emit.*?(\w+Event)/);
        return eventMatch ? eventMatch[1] : null;
    }
}
```

#### 3. State Management Cycle Detection
```javascript
// Detect cycles in state dependencies for Redux/MobX-like systems
class StateCycleDetector {
    constructor() {
        this.dependencyGraph = new Map();
        this.computationStack = [];
    }
    
    addDependency(dependent, dependency) {
        if (!this.dependencyGraph.has(dependent)) {
            this.dependencyGraph.set(dependent, new Set());
        }
        
        this.dependencyGraph.get(dependent).add(dependency);
        
        // Check for immediate cycle
        if (this.detectCycleFromNode(dependent)) {
            throw new Error(`Circular dependency detected: ${dependent} -> ${dependency}`);
        }
    }
    
    detectCycleFromNode(startNode) {
        const visited = new Set();
        const stack = new Set();
        
        const dfs = (node) => {
            if (stack.has(node)) return true; // Back edge found
            if (visited.has(node)) return false;
            
            visited.add(node);
            stack.add(node);
            
            const dependencies = this.dependencyGraph.get(node) || new Set();
            for (const dep of dependencies) {
                if (dfs(dep)) return true;
            }
            
            stack.delete(node);
            return false;
        };
        
        return dfs(startNode);
    }
    
    // Detect all cycles in the dependency graph
    findAllCycles() {
        const cycles = [];
        const visited = new Set();
        const stack = new Set();
        const currentPath = [];
        
        const dfs = (node) => {
            if (stack.has(node)) {
                // Found a cycle, extract it
                const cycleStart = currentPath.indexOf(node);
                const cycle = currentPath.slice(cycleStart);
                cycle.push(node); // Complete the cycle
                cycles.push(cycle);
                return;
            }
            
            if (visited.has(node)) return;
            
            visited.add(node);
            stack.add(node);
            currentPath.push(node);
            
            const dependencies = this.dependencyGraph.get(node) || new Set();
            for (const dep of dependencies) {
                dfs(dep);
            }
            
            stack.delete(node);
            currentPath.pop();
        };
        
        for (const node of this.dependencyGraph.keys()) {
            if (!visited.has(node)) {
                dfs(node);
            }
        }
        
        return cycles;
    }
    
    // Suggest fixes for detected cycles
    suggestCycleFixes(cycles) {
        return cycles.map(cycle => ({
            cycle: cycle,
            suggestions: [
                `Consider making ${cycle[0]} independent of ${cycle[cycle.length - 2]}`,
                `Add a mediator state between ${cycle[0]} and ${cycle[1]}`,
                `Use async updates to break the synchronous cycle`,
                `Refactor to use one-way data flow`
            ]
        }));
    }
}

// Usage in state management
const stateDetector = new StateCycleDetector();

class SafeStateManager {
    constructor() {
        this.state = {};
        this.computedState = {};
        this.dependencies = new Map();
    }
    
    defineComputed(name, computeFn, dependencies = []) {
        // Register dependencies
        dependencies.forEach(dep => {
            stateDetector.addDependency(name, dep);
        });
        
        this.computedState[name] = {
            compute: computeFn,
            dependencies: dependencies,
            cached: null,
            dirty: true
        };
    }
    
    get(stateName) {
        if (stateName in this.state) {
            return this.state[stateName];
        }
        
        if (stateName in this.computedState) {
            const computed = this.computedState[stateName];
            
            if (computed.dirty) {
                // Check for cycles during computation
                if (this.computationStack.includes(stateName)) {
                    throw new Error(`Circular computation detected: ${this.computationStack.join(' -> ')} -> ${stateName}`);
                }
                
                this.computationStack.push(stateName);
                
                try {
                    computed.cached = computed.compute();
                    computed.dirty = false;
                } finally {
                    this.computationStack.pop();
                }
            }
            
            return computed.cached;
        }
        
        return undefined;
    }
}
```

## Approach 1: Hash Set (Space-Heavy)

### Algorithm
Keep track of visited nodes using a set and check if we encounter a node we've seen before.

### Implementation
```javascript
function hasCycleHashSet(head) {
    if (!head) return false;
    
    const visited = new Set();
    let current = head;
    
    while (current) {
        if (visited.has(current)) {
            return true; // Cycle detected
        }
        
        visited.add(current);
        current = current.next;
    }
    
    return false; // No cycle found
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Visit each node at most once
- **Space Complexity**: O(n) - Store all nodes in set
- **Pros**: Easy to understand, works for any cycle structure
- **Cons**: Uses extra space proportional to list length

### Example Trace
```
Input: 1 -> 2 -> 3 -> 2 (cycle back to node 2)

Step 1: current = 1, visited = {}
  Add 1 to visited: visited = {1}
  Move to next: current = 2

Step 2: current = 2, visited = {1}
  Add 2 to visited: visited = {1, 2}
  Move to next: current = 3

Step 3: current = 3, visited = {1, 2}
  Add 3 to visited: visited = {1, 2, 3}
  Move to next: current = 2

Step 4: current = 2, visited = {1, 2, 3}
  2 is already in visited set!
  Return true (cycle detected)
```

## Approach 2: Floyd's Cycle Detection (Optimal)

### Algorithm
Use two pointers moving at different speeds. If there's a cycle, the fast pointer will eventually meet the slow pointer.

### Implementation
```javascript
function hasCycleFloyd(head) {
    if (!head || !head.next) return false;
    
    let slow = head;
    let fast = head;
    
    // Move slow one step and fast two steps
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        // If they meet, there's a cycle
        if (slow === fast) {
            return true;
        }
    }
    
    return false; // Fast reached end, no cycle
}
```

### Floyd's with Cycle Start Detection
```javascript
function detectCycleStart(head) {
    if (!head || !head.next) return null;
    
    let slow = head;
    let fast = head;
    
    // Phase 1: Detect if cycle exists
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            break; // Cycle detected
        }
    }
    
    // No cycle found
    if (!fast || !fast.next) {
        return null;
    }
    
    // Phase 2: Find the start of the cycle
    slow = head;
    while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;
    }
    
    return slow; // This is the start of the cycle
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - In worst case, pointers travel at most 2n steps
- **Space Complexity**: O(1) - Only using two pointers
- **Pros**: Optimal space usage, elegant mathematical proof
- **Cons**: Slightly more complex to understand initially

### Example Trace
```
Input: 1 -> 2 -> 3 -> 4 -> 2 (cycle back to node 2)

Initial: slow = 1, fast = 1

Step 1:
  slow = slow.next = 2
  fast = fast.next.next = 3
  slow ≠ fast, continue

Step 2:
  slow = slow.next = 3
  fast = fast.next.next = 2 (through cycle)
  slow ≠ fast, continue

Step 3:
  slow = slow.next = 4
  fast = fast.next.next = 4 (2 -> 3 -> 4)
  slow = fast! Cycle detected, return true
```

## Advanced Variations & Optimizations

### 1. Find Cycle Length
```javascript
function findCycleLength(head) {
    if (!head || !head.next) return 0;
    
    let slow = head;
    let fast = head;
    
    // First, detect cycle
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            break;
        }
    }
    
    if (!fast || !fast.next) return 0;
    
    // Count nodes in cycle
    let count = 1;
    let current = slow.next;
    
    while (current !== slow) {
        count++;
        current = current.next;
    }
    
    return count;
}
```

### 2. Remove Cycle from Linked List
```javascript
function removeCycle(head) {
    if (!head || !head.next) return head;
    
    let slow = head;
    let fast = head;
    
    // Detect cycle
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        
        if (slow === fast) {
            break;
        }
    }
    
    if (!fast || !fast.next) return head; // No cycle
    
    // Find cycle start
    slow = head;
    let prev = null;
    
    while (slow !== fast) {
        prev = fast;
        slow = slow.next;
        fast = fast.next;
    }
    
    // Find the node just before cycle start
    while (fast.next !== slow) {
        fast = fast.next;
    }
    
    // Break the cycle
    fast.next = null;
    
    return head;
}
```

### 3. Detect Cycle in Any Data Structure
```javascript
class GeneralCycleDetector {
    static detectCycle(startNode, getNextNodes) {
        const visited = new WeakSet();
        const stack = [];
        
        const dfs = (node) => {
            if (visited.has(node)) {
                return true; // Cycle detected
            }
            
            visited.add(node);
            stack.push(node);
            
            const nextNodes = getNextNodes(node);
            
            for (const nextNode of nextNodes) {
                if (nextNode && dfs(nextNode)) {
                    return true;
                }
            }
            
            stack.pop();
            return false;
        };
        
        return dfs(startNode);
    }
    
    // For objects with multiple references
    static detectObjectCycle(obj, visited = new WeakSet()) {
        if (visited.has(obj)) return true;
        if (typeof obj !== 'object' || obj === null) return false;
        
        visited.add(obj);
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (this.detectObjectCycle(obj[key], visited)) {
                    return true;
                }
            }
        }
        
        visited.delete(obj);
        return false;
    }
}

// Usage examples
const objWithCycle = { a: 1 };
objWithCycle.self = objWithCycle;

console.log(GeneralCycleDetector.detectObjectCycle(objWithCycle)); // true

// For tree structures
const treeNode = { value: 1, children: [] };
const childNode = { value: 2, children: [treeNode] }; // Creates cycle
treeNode.children.push(childNode);

const hasCycle = GeneralCycleDetector.detectCycle(
    treeNode,
    (node) => node.children || []
);
console.log(hasCycle); // true
```

## Frontend-Specific Applications

### 1. DOM Cycle Detection for SSR
```javascript
class DOMCycleDetector {
    static checkForCircularReferences(element) {
        const visited = new WeakSet();
        
        const traverse = (node) => {
            if (visited.has(node)) return true;
            if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
            
            visited.add(node);
            
            // Check parent references
            if (node.parentNode && traverse(node.parentNode)) return true;
            
            // Check children
            for (const child of node.children) {
                if (traverse(child)) return true;
            }
            
            visited.delete(node);
            return false;
        };
        
        return traverse(element);
    }
    
    // Check for cycles in event listener references
    static checkEventListenerCycles(element) {
        const eventMap = new WeakMap();
        
        const checkListeners = (el) => {
            if (eventMap.has(el)) return true;
            
            eventMap.set(el, true);
            
            // Check if event listeners reference parent elements
            const listeners = getEventListeners(el); // Chrome DevTools function
            
            for (const eventType in listeners) {
                for (const listener of listeners[eventType]) {
                    if (listener.handler && listener.handler.element) {
                        if (checkListeners(listener.handler.element)) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
        };
        
        return checkListeners(element);
    }
}
```

### 2. Promise Chain Cycle Detection
```javascript
class PromiseCycleDetector {
    constructor() {
        this.promiseChain = new WeakMap();
        this.resolving = new WeakSet();
    }
    
    wrapPromise(promise, identifier) {
        if (this.resolving.has(promise)) {
            throw new Error(`Promise cycle detected: ${identifier} is already resolving`);
        }
        
        this.resolving.add(promise);
        
        return promise.finally(() => {
            this.resolving.delete(promise);
        });
    }
    
    createSafePromise(executor, dependencies = []) {
        return new Promise((resolve, reject) => {
            // Check if any dependencies are currently resolving this promise
            for (const dep of dependencies) {
                if (this.resolving.has(dep)) {
                    reject(new Error('Circular promise dependency detected'));
                    return;
                }
            }
            
            executor(resolve, reject);
        });
    }
}

// Usage
const detector = new PromiseCycleDetector();

const promiseA = detector.createSafePromise((resolve, reject) => {
    // This would cause a cycle
    // promiseB.then(resolve);
    setTimeout(resolve, 100);
});

const promiseB = detector.createSafePromise((resolve, reject) => {
    promiseA.then(resolve);
}, [promiseA]);
```

## Testing & Edge Cases

### Comprehensive Test Suite
```javascript
function testCycleDetection() {
    // Helper to create linked list
    function createLinkedList(values, cyclePos = -1) {
        if (values.length === 0) return null;
        
        const nodes = values.map(val => ({ val, next: null }));
        
        // Link nodes
        for (let i = 0; i < nodes.length - 1; i++) {
            nodes[i].next = nodes[i + 1];
        }
        
        // Create cycle if specified
        if (cyclePos >= 0 && cyclePos < nodes.length) {
            nodes[nodes.length - 1].next = nodes[cyclePos];
        }
        
        return nodes[0];
    }
    
    const testCases = [
        { values: [3,2,0,-4], cyclePos: 1, expected: true, description: "Cycle at position 1" },
        { values: [1,2], cyclePos: 0, expected: true, description: "Cycle at position 0" },
        { values: [1], cyclePos: -1, expected: false, description: "Single node, no cycle" },
        { values: [], cyclePos: -1, expected: false, description: "Empty list" },
        { values: [1,2,3,4,5], cyclePos: -1, expected: false, description: "No cycle" },
        { values: [1,2,3,4,5], cyclePos: 2, expected: true, description: "Cycle in middle" },
        { values: [1], cyclePos: 0, expected: true, description: "Self-referencing single node" }
    ];
    
    const implementations = [
        { name: "Floyd's Algorithm", func: hasCycleFloyd },
        { name: "Hash Set", func: hasCycleHashSet }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name}:`);
        let passed = 0;
        
        testCases.forEach(test => {
            try {
                const list = createLinkedList(test.values, test.cyclePos);
                const result = impl.func(list);
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

testCycleDetection();
```

### Performance Comparison
```javascript
function benchmarkCycleDetection() {
    // Create large list with cycle
    function createLargeListWithCycle(size, cyclePos) {
        const head = { val: 0, next: null };
        let current = head;
        const nodes = [head];
        
        for (let i = 1; i < size; i++) {
            current.next = { val: i, next: null };
            current = current.next;
            nodes.push(current);
        }
        
        // Create cycle
        current.next = nodes[cyclePos];
        return head;
    }
    
    const sizes = [1000, 10000, 100000];
    const implementations = [
        { name: "Floyd's", func: hasCycleFloyd },
        { name: "Hash Set", func: hasCycleHashSet }
    ];
    
    console.log('Performance Benchmark:\n');
    
    sizes.forEach(size => {
        console.log(`List size: ${size}`);
        const list = createLargeListWithCycle(size, Math.floor(size / 2));
        
        implementations.forEach(impl => {
            const start = performance.now();
            const result = impl.func(list);
            const end = performance.now();
            
            console.log(`  ${impl.name}: ${(end - start).toFixed(2)}ms (result: ${result})`);
        });
        
        console.log();
    });
}

benchmarkCycleDetection();
```

## Interview Tips

### Discussion Points
1. **Algorithm Choice**: Why Floyd's is preferred over hash set approach
2. **Mathematical Proof**: Understanding why Floyd's algorithm works
3. **Space Complexity**: Trade-offs between different approaches
4. **Real-world Applications**: Where cycle detection is useful

### Common Follow-ups
1. **"Find the start of the cycle"** → Extend Floyd's algorithm
2. **"Find the length of the cycle"** → Count nodes in cycle
3. **"Remove the cycle"** → Modify list to break cycle
4. **"Detect cycle in undirected graph"** → DFS with parent tracking

### Microsoft-Specific Context
1. **Memory Management**: Detecting reference cycles in applications
2. **Dependency Resolution**: Avoiding circular dependencies in modules
3. **Event Systems**: Preventing infinite event loops
4. **Data Structures**: Validating tree/graph structures

## Key Takeaways

1. **Floyd's Algorithm**: Master the two-pointer technique for O(1) space
2. **Pattern Recognition**: Identify when cycle detection applies
3. **Trade-offs**: Understand space vs time complexity considerations
4. **Frontend Applications**: Critical for preventing memory leaks and infinite loops
5. **Edge Cases**: Handle empty lists, single nodes, and self-references properly 