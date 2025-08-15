# Trees & Graphs - Microsoft Frontend Staff Engineer Interview

This folder contains solutions to Trees & Graphs questions commonly asked in Microsoft Frontend Staff Engineer interviews.

## Question Categories

### Binary Trees - Easy
- [Maximum Depth of Binary Tree](./maximum-depth.md) ⭐
- [Check if Binary Tree is Balanced](./is-balanced.md) ⭐
- [Invert/Flip Binary Tree](./invert-tree.md)
- [Same Tree Comparison](./same-tree.md)
- [Symmetric Tree](./symmetric-tree.md)
- [Binary Tree Paths](./binary-tree-paths.md)
- [Minimum Depth of Binary Tree](./minimum-depth.md)

### Binary Trees - Medium
- [Binary Tree Level Order Traversal](./level-order-traversal.md) ⭐
- [Binary Tree Zigzag Level Order](./zigzag-traversal.md)
- [Binary Tree Right Side View](./right-side-view.md)
- [Flatten Binary Tree to Linked List](./flatten-tree.md)
- [Construct Tree from Preorder/Inorder](./construct-tree.md)
- [Path Sum Problems](./path-sum.md)
- [Lowest Common Ancestor](./lowest-common-ancestor.md)
- [Diameter of Binary Tree](./diameter-tree.md)

### Binary Search Trees
- [Validate Binary Search Tree](./validate-bst.md) ⭐
- [Inorder Successor in BST](./inorder-successor.md)
- [Convert Sorted Array to BST](./sorted-array-to-bst.md)
- [Kth Smallest Element in BST](./kth-smallest-bst.md)
- [Delete Node in BST](./delete-node-bst.md)
- [Trim BST](./trim-bst.md)

### Advanced Trees
- [Serialize and Deserialize Binary Tree](./serialize-deserialize.md) ⭐
- [Binary Tree Maximum Path Sum](./max-path-sum.md)
- [Recover Binary Search Tree](./recover-bst.md)
- [Vertical Order Traversal](./vertical-order.md)

### Graphs - Fundamentals
- [Number of Islands](./number-of-islands.md) ⭐
- [Clone Graph](./clone-graph.md)
- [Course Schedule (Topological Sort)](./course-schedule.md)
- [Pacific Atlantic Water Flow](./pacific-atlantic.md)
- [Graph Valid Tree](./graph-valid-tree.md)

### Graph Algorithms
- [Breadth-First Search (BFS)](./bfs-implementation.md) ⭐
- [Depth-First Search (DFS)](./dfs-implementation.md) ⭐
- [Dijkstra's Shortest Path](./dijkstra-algorithm.md)
- [Union Find/Disjoint Set](./union-find.md)
- [Minimum Spanning Tree](./mst-algorithms.md)

## Frontend Engineering Context

### Why Trees & Graphs Matter for Frontend Engineers

#### 1. DOM Manipulation & Virtual DOM
The DOM is a tree structure, making tree algorithms essential
```javascript
// DOM traversal using tree algorithms
function traverseDOM(element, callback) {
    // DFS traversal of DOM tree
    callback(element);
    
    for (let child of element.children) {
        traverseDOM(child, callback);
    }
}

// Find elements by class (similar to tree search)
function findElementsByClass(root, className) {
    const result = [];
    
    function dfs(node) {
        if (node.classList && node.classList.contains(className)) {
            result.push(node);
        }
        
        for (let child of node.children) {
            dfs(child);
        }
    }
    
    dfs(root);
    return result;
}
```

#### 2. Component Tree & React Fiber
React's component hierarchy is a tree structure
```javascript
// Component tree traversal for debugging
function findComponentsByType(fiberNode, componentType) {
    const components = [];
    
    function traverse(node) {
        if (!node) return;
        
        if (node.type === componentType) {
            components.push(node);
        }
        
        // Traverse children
        let child = node.child;
        while (child) {
            traverse(child);
            child = child.sibling;
        }
    }
    
    traverse(fiberNode);
    return components;
}

// Component state propagation (tree-like pattern)
class StateProvider {
    constructor() {
        this.subscribers = new Map(); // adjacency list
        this.state = {};
    }
    
    subscribe(component, dependencies) {
        if (!this.subscribers.has(component)) {
            this.subscribers.set(component, new Set());
        }
        dependencies.forEach(dep => {
            this.subscribers.get(component).add(dep);
        });
    }
    
    updateState(key, value) {
        this.state[key] = value;
        
        // Notify all components that depend on this key (graph traversal)
        for (let [component, deps] of this.subscribers) {
            if (deps.has(key)) {
                component.forceUpdate();
            }
        }
    }
}
```

#### 3. File System Navigation
File explorers and directory structures
```javascript
// File system tree representation
class FileSystemNode {
    constructor(name, isDirectory = false) {
        this.name = name;
        this.isDirectory = isDirectory;
        this.children = isDirectory ? [] : null;
        this.parent = null;
        this.size = 0;
    }
    
    addChild(child) {
        if (!this.isDirectory) return false;
        
        child.parent = this;
        this.children.push(child);
        return true;
    }
    
    // Find file/folder (DFS)
    find(name) {
        if (this.name === name) return this;
        
        if (this.isDirectory) {
            for (let child of this.children) {
                const result = child.find(name);
                if (result) return result;
            }
        }
        
        return null;
    }
    
    // Get full path (traverse up the tree)
    getPath() {
        const path = [];
        let current = this;
        
        while (current) {
            path.unshift(current.name);
            current = current.parent;
        }
        
        return path.join('/');
    }
    
    // Calculate total size (post-order traversal)
    calculateSize() {
        if (!this.isDirectory) {
            return this.size;
        }
        
        let totalSize = 0;
        for (let child of this.children) {
            totalSize += child.calculateSize();
        }
        
        this.size = totalSize;
        return totalSize;
    }
}
```

#### 4. Dependency Graphs & Build Systems
Module dependencies form directed graphs
```javascript
// Module dependency resolver
class DependencyResolver {
    constructor() {
        this.graph = new Map(); // adjacency list
        this.resolved = new Set();
        this.resolving = new Set();
    }
    
    addDependency(module, dependency) {
        if (!this.graph.has(module)) {
            this.graph.set(module, []);
        }
        this.graph.get(module).push(dependency);
    }
    
    // Topological sort for build order
    resolveDependencies(module) {
        if (this.resolved.has(module)) {
            return [];
        }
        
        if (this.resolving.has(module)) {
            throw new Error(`Circular dependency detected: ${module}`);
        }
        
        this.resolving.add(module);
        
        const result = [];
        const dependencies = this.graph.get(module) || [];
        
        for (let dep of dependencies) {
            result.push(...this.resolveDependencies(dep));
        }
        
        result.push(module);
        this.resolving.delete(module);
        this.resolved.add(module);
        
        return result;
    }
    
    // Detect circular dependencies
    hasCycle() {
        const visiting = new Set();
        const visited = new Set();
        
        const dfs = (node) => {
            if (visiting.has(node)) return true;
            if (visited.has(node)) return false;
            
            visiting.add(node);
            
            const neighbors = this.graph.get(node) || [];
            for (let neighbor of neighbors) {
                if (dfs(neighbor)) return true;
            }
            
            visiting.delete(node);
            visited.add(node);
            return false;
        };
        
        for (let node of this.graph.keys()) {
            if (dfs(node)) return true;
        }
        
        return false;
    }
}
```

#### 5. UI State Management with Graphs
Managing complex UI state relationships
```javascript
// State dependency graph for complex forms
class FormStateManager {
    constructor() {
        this.fields = new Map();
        this.dependencies = new Map(); // field -> [dependent fields]
        this.validators = new Map();
    }
    
    addField(name, initialValue, validator = null) {
        this.fields.set(name, {
            value: initialValue,
            isValid: true,
            errors: []
        });
        
        if (validator) {
            this.validators.set(name, validator);
        }
        
        this.dependencies.set(name, []);
    }
    
    addDependency(field, dependentField) {
        if (!this.dependencies.has(field)) {
            this.dependencies.set(field, []);
        }
        this.dependencies.get(field).push(dependentField);
    }
    
    updateField(name, value) {
        // Update field value
        const field = this.fields.get(name);
        field.value = value;
        
        // Validate current field
        this.validateField(name);
        
        // Propagate changes to dependent fields (BFS)
        const queue = [name];
        const visited = new Set();
        
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current)) continue;
            
            visited.add(current);
            const dependents = this.dependencies.get(current) || [];
            
            for (let dependent of dependents) {
                this.validateField(dependent);
                queue.push(dependent);
            }
        }
    }
    
    validateField(name) {
        const validator = this.validators.get(name);
        if (!validator) return;
        
        const field = this.fields.get(name);
        const validation = validator(field.value, this.getAllValues());
        
        field.isValid = validation.isValid;
        field.errors = validation.errors || [];
    }
    
    getAllValues() {
        const values = {};
        for (let [name, field] of this.fields) {
            values[name] = field.value;
        }
        return values;
    }
}
```

## Core Patterns & Algorithms

### 1. Tree Traversal Patterns
```javascript
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

// Recursive traversals
function inorderTraversal(root) {
    if (!root) return [];
    
    return [
        ...inorderTraversal(root.left),
        root.val,
        ...inorderTraversal(root.right)
    ];
}

function preorderTraversal(root) {
    if (!root) return [];
    
    return [
        root.val,
        ...preorderTraversal(root.left),
        ...preorderTraversal(root.right)
    ];
}

function postorderTraversal(root) {
    if (!root) return [];
    
    return [
        ...postorderTraversal(root.left),
        ...postorderTraversal(root.right),
        root.val
    ];
}

// Iterative traversals (better for large trees)
function inorderIterative(root) {
    const result = [];
    const stack = [];
    let current = root;
    
    while (current || stack.length > 0) {
        // Go to leftmost node
        while (current) {
            stack.push(current);
            current = current.left;
        }
        
        // Process node
        current = stack.pop();
        result.push(current.val);
        
        // Move to right subtree
        current = current.right;
    }
    
    return result;
}

// Level order traversal (BFS)
function levelOrder(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            currentLevel.push(node.val);
            
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        result.push(currentLevel);
    }
    
    return result;
}
```

### 2. Graph Traversal Patterns
```javascript
// Graph representation
class Graph {
    constructor() {
        this.adjacencyList = new Map();
    }
    
    addVertex(vertex) {
        if (!this.adjacencyList.has(vertex)) {
            this.adjacencyList.set(vertex, []);
        }
    }
    
    addEdge(v1, v2, directed = false) {
        this.addVertex(v1);
        this.addVertex(v2);
        
        this.adjacencyList.get(v1).push(v2);
        if (!directed) {
            this.adjacencyList.get(v2).push(v1);
        }
    }
    
    // DFS traversal
    dfs(start, callback) {
        const visited = new Set();
        
        const dfsHelper = (vertex) => {
            visited.add(vertex);
            callback(vertex);
            
            const neighbors = this.adjacencyList.get(vertex) || [];
            for (let neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    dfsHelper(neighbor);
                }
            }
        };
        
        dfsHelper(start);
    }
    
    // BFS traversal
    bfs(start, callback) {
        const visited = new Set();
        const queue = [start];
        visited.add(start);
        
        while (queue.length > 0) {
            const vertex = queue.shift();
            callback(vertex);
            
            const neighbors = this.adjacencyList.get(vertex) || [];
            for (let neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
    }
    
    // Find path between two vertices
    findPath(start, end) {
        const visited = new Set();
        const parent = new Map();
        const queue = [start];
        visited.add(start);
        
        while (queue.length > 0) {
            const vertex = queue.shift();
            
            if (vertex === end) {
                // Reconstruct path
                const path = [];
                let current = end;
                
                while (current !== undefined) {
                    path.unshift(current);
                    current = parent.get(current);
                }
                
                return path;
            }
            
            const neighbors = this.adjacencyList.get(vertex) || [];
            for (let neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent.set(neighbor, vertex);
                    queue.push(neighbor);
                }
            }
        }
        
        return null; // No path found
    }
    
    // Detect cycle in directed graph
    hasCycle() {
        const visiting = new Set();
        const visited = new Set();
        
        const dfs = (vertex) => {
            if (visiting.has(vertex)) return true;
            if (visited.has(vertex)) return false;
            
            visiting.add(vertex);
            
            const neighbors = this.adjacencyList.get(vertex) || [];
            for (let neighbor of neighbors) {
                if (dfs(neighbor)) return true;
            }
            
            visiting.delete(vertex);
            visited.add(vertex);
            return false;
        };
        
        for (let vertex of this.adjacencyList.keys()) {
            if (dfs(vertex)) return true;
        }
        
        return false;
    }
}
```

### 3. Union-Find (Disjoint Set)
```javascript
class UnionFind {
    constructor(size) {
        this.parent = Array.from({ length: size }, (_, i) => i);
        this.rank = new Array(size).fill(0);
        this.components = size;
    }
    
    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // Path compression
        }
        return this.parent[x];
    }
    
    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);
        
        if (rootX === rootY) return false;
        
        // Union by rank
        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
        
        this.components--;
        return true;
    }
    
    connected(x, y) {
        return this.find(x) === this.find(y);
    }
    
    getComponents() {
        return this.components;
    }
}
```

## Common Interview Problem Patterns

### 1. Tree Properties & Validation
```javascript
// Check if binary tree is balanced
function isBalanced(root) {
    function height(node) {
        if (!node) return 0;
        
        const leftHeight = height(node.left);
        if (leftHeight === -1) return -1;
        
        const rightHeight = height(node.right);
        if (rightHeight === -1) return -1;
        
        if (Math.abs(leftHeight - rightHeight) > 1) return -1;
        
        return Math.max(leftHeight, rightHeight) + 1;
    }
    
    return height(root) !== -1;
}

// Validate BST
function isValidBST(root) {
    function validate(node, min, max) {
        if (!node) return true;
        
        if (node.val <= min || node.val >= max) return false;
        
        return validate(node.left, min, node.val) && 
               validate(node.right, node.val, max);
    }
    
    return validate(root, -Infinity, Infinity);
}
```

### 2. Path & Distance Problems
```javascript
// Binary tree maximum path sum
function maxPathSum(root) {
    let maxSum = -Infinity;
    
    function maxGain(node) {
        if (!node) return 0;
        
        const leftGain = Math.max(maxGain(node.left), 0);
        const rightGain = Math.max(maxGain(node.right), 0);
        
        // Current path sum including this node
        const currentSum = node.val + leftGain + rightGain;
        maxSum = Math.max(maxSum, currentSum);
        
        // Return max gain if we include this node in parent's path
        return node.val + Math.max(leftGain, rightGain);
    }
    
    maxGain(root);
    return maxSum;
}

// Lowest common ancestor
function lowestCommonAncestor(root, p, q) {
    if (!root || root === p || root === q) return root;
    
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    
    if (left && right) return root;
    return left || right;
}
```

### 3. Grid-based Graph Problems
```javascript
// Number of islands (DFS approach)
function numIslands(grid) {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    let islands = 0;
    
    function dfs(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] === '0') {
            return;
        }
        
        grid[r][c] = '0'; // Mark as visited
        
        // Explore all 4 directions
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                islands++;
                dfs(r, c);
            }
        }
    }
    
    return islands;
}
```

## Time & Space Complexity Patterns

### Tree Operations
- **Traversal**: O(n) time, O(h) space (h = height)
- **Search in BST**: O(log n) average, O(n) worst case
- **Insert/Delete in BST**: O(log n) average, O(n) worst case
- **Level order traversal**: O(n) time, O(w) space (w = max width)

### Graph Operations
- **DFS/BFS**: O(V + E) time, O(V) space
- **Shortest path (Dijkstra)**: O((V + E) log V) with priority queue
- **Union-Find**: O(α(n)) per operation (α = inverse Ackermann)
- **Topological sort**: O(V + E) time

## Testing Strategies

### Tree Testing Utilities
```javascript
// Create tree from array (level order)
function createTreeFromArray(arr) {
    if (!arr || arr.length === 0) return null;
    
    const root = new TreeNode(arr[0]);
    const queue = [root];
    let i = 1;
    
    while (queue.length > 0 && i < arr.length) {
        const node = queue.shift();
        
        if (i < arr.length && arr[i] !== null) {
            node.left = new TreeNode(arr[i]);
            queue.push(node.left);
        }
        i++;
        
        if (i < arr.length && arr[i] !== null) {
            node.right = new TreeNode(arr[i]);
            queue.push(node.right);
        }
        i++;
    }
    
    return root;
}

// Convert tree to array for testing
function treeToArray(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const node = queue.shift();
        
        if (node) {
            result.push(node.val);
            queue.push(node.left);
            queue.push(node.right);
        } else {
            result.push(null);
        }
    }
    
    // Remove trailing nulls
    while (result.length > 0 && result[result.length - 1] === null) {
        result.pop();
    }
    
    return result;
}
```

### Graph Testing Utilities
```javascript
// Create graph from edge list
function createGraphFromEdges(edges, directed = false) {
    const graph = new Graph();
    
    for (let [u, v] of edges) {
        graph.addEdge(u, v, directed);
    }
    
    return graph;
}

// Test connectivity
function testGraphConnectivity(graph, expectedComponents) {
    const visited = new Set();
    let components = 0;
    
    for (let vertex of graph.adjacencyList.keys()) {
        if (!visited.has(vertex)) {
            components++;
            graph.dfs(vertex, (v) => visited.add(v));
        }
    }
    
    return components === expectedComponents;
}
```

## Interview Tips

### Problem-Solving Approach
1. **Identify the Structure**: Is it a tree or graph? Directed or undirected?
2. **Choose Traversal Method**: DFS for path problems, BFS for shortest path
3. **Consider Edge Cases**: Empty tree/graph, single node, disconnected components
4. **Optimize Space**: Use iterative instead of recursive for large inputs

### Common Mistakes to Avoid
1. **Stack Overflow**: Use iterative approaches for deep trees
2. **Modifying Input**: Be careful about marking visited nodes
3. **Infinite Loops**: Check for cycles in graphs
4. **Memory Leaks**: Clean up references in JavaScript

### Microsoft-Specific Focus
1. **DOM Applications**: Relate tree problems to DOM manipulation
2. **Component Architecture**: Connect to React component trees
3. **Performance**: Discuss time/space trade-offs for large datasets
4. **Real-world Context**: File systems, dependency graphs, UI state management

## Key Takeaways

- **Pattern Recognition**: Identify when to use DFS vs BFS
- **Tree Properties**: Understand BST properties and validation
- **Graph Algorithms**: Master fundamental algorithms like Union-Find
- **Frontend Applications**: Connect algorithms to real frontend problems
- **Performance Awareness**: Choose appropriate data structures and algorithms
- **Clean Implementation**: Write readable, bug-free code with proper edge case handling 