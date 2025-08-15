# Maximum Depth of Binary Tree ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Implementation](#core-implementation)
  - [Recursive DFS (Recommended)](#recursive-dfs-recommended)
  - [Iterative BFS](#iterative-bfs)
  - [Iterative DFS](#iterative-dfs)
- [Usage Examples](#usage-examples)
- [Frontend Applications](#frontend-applications)
- [Complexity Analysis](#complexity-analysis)
- [Testing](#testing)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

**Example 1:**
```
    3
   / \
  9  20
    /  \
   15   7
```
Input: root = [3,9,20,null,null,15,7]
Output: 3

**Example 2:**
```
Input: root = [1,null,2]
Output: 2
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Implementation

### Recursive DFS (Recommended)

```javascript
// Definition for binary tree node
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function maxDepth(root) {
    if (!root) return 0; // Base case: null node
    
    const leftDepth = maxDepth(root.left); // Get left subtree depth
    const rightDepth = maxDepth(root.right); // Get right subtree depth
    
    return 1 + Math.max(leftDepth, rightDepth); // Current node + max child depth
}
```

### Iterative BFS

```javascript
function maxDepthBFS(root) {
    if (!root) return 0;
    
    const queue = [root];
    let depth = 0;
    
    while (queue.length > 0) {
        const levelSize = queue.length; // Process entire level
        depth++;
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            
            if (node.left) queue.push(node.left); // Add children
            if (node.right) queue.push(node.right);
        }
    }
    
    return depth;
}
```

### Iterative DFS

```javascript
function maxDepthDFS(root) {
    if (!root) return 0;
    
    const stack = [[root, 1]]; // [node, depth] pairs
    let maxDepth = 0;
    
    while (stack.length > 0) {
        const [node, currentDepth] = stack.pop();
        maxDepth = Math.max(maxDepth, currentDepth); // Track max
        
        if (node.right) stack.push([node.right, currentDepth + 1]);
        if (node.left) stack.push([node.left, currentDepth + 1]);
    }
    
    return maxDepth;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage Examples

```javascript
// Create test tree:     3
//                     / \
//                    9  20
//                      /  \
//                     15   7

const root = new TreeNode(3);
root.left = new TreeNode(9);
root.right = new TreeNode(20);
root.right.left = new TreeNode(15);
root.right.right = new TreeNode(7);

console.log(maxDepth(root)); // Output: 3
console.log(maxDepthBFS(root)); // Output: 3
console.log(maxDepthDFS(root)); // Output: 3

// Edge cases
console.log(maxDepth(null)); // Output: 0
console.log(maxDepth(new TreeNode(1))); // Output: 1
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Frontend Applications

### Why This Matters for Frontend Engineers

#### 1. DOM Tree Depth Analysis
```javascript
// Calculate maximum nesting depth of DOM elements
function getMaxDOMDepth(element) {
    if (!element || !element.children || element.children.length === 0) {
        return 1;
    }
    
    let maxChildDepth = 0;
    for (let child of element.children) {
        const childDepth = getMaxDOMDepth(child);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
    }
    
    return maxChildDepth + 1;
}

// Usage for performance analysis
function analyzeDOMComplexity() {
    const body = document.body;
    const maxDepth = getMaxDOMDepth(body);
    
    if (maxDepth > 15) {
        console.warn(`DOM tree is deeply nested (${maxDepth} levels). Consider flattening for better performance.`);
    }
    
    return {
        maxDepth,
        warning: maxDepth > 15 ? 'Consider DOM optimization' : 'DOM depth is acceptable'
    };
}
```

#### 2. Component Tree Analysis in React
```javascript
// Analyze React component tree depth for performance optimization
function analyzeComponentDepth(fiberNode) {
    if (!fiberNode) return 0;
    
    let maxDepth = 0;
    
    // Traverse React Fiber tree
    let child = fiberNode.child;
    while (child) {
        const childDepth = analyzeComponentDepth(child);
        maxDepth = Math.max(maxDepth, childDepth);
        child = child.sibling;
    }
    
    return maxDepth + 1;
}

// React DevTools-like analysis
class ComponentDepthAnalyzer {
    constructor() {
        this.warnings = [];
        this.recommendations = [];
    }
    
    analyze(rootFiber) {
        const maxDepth = analyzeComponentDepth(rootFiber);
        
        if (maxDepth > 20) {
            this.warnings.push(`Component tree is ${maxDepth} levels deep`);
            this.recommendations.push('Consider component composition to reduce nesting');
        }
        
        if (maxDepth > 30) {
            this.warnings.push('Extremely deep component nesting detected');
            this.recommendations.push('Potential performance impact - consider refactoring');
        }
        
        return {
            maxDepth,
            warnings: this.warnings,
            recommendations: this.recommendations
        };
    }
}
```

#### 3. File System Tree Depth
```javascript
// File system navigation with depth limits
class FileExplorer {
    constructor(maxDisplayDepth = 10) {
        this.maxDisplayDepth = maxDisplayDepth;
    }
    
    calculateDirectoryDepth(directory) {
        if (!directory.children || directory.children.length === 0) {
            return 1;
        }
        
        let maxChildDepth = 0;
        for (let child of directory.children) {
            if (child.type === 'directory') {
                const childDepth = this.calculateDirectoryDepth(child);
                maxChildDepth = Math.max(maxChildDepth, childDepth);
            }
        }
        
        return maxChildDepth + 1;
    }
    
    shouldShowExpandButton(directory, currentDepth = 0) {
        if (!directory.children) return false;
        
        const totalDepth = this.calculateDirectoryDepth(directory);
        const remainingDepth = totalDepth - currentDepth;
        
        return remainingDepth <= this.maxDisplayDepth;
    }
    
    renderTreeWithDepthLimit(directory, currentDepth = 0) {
        const depth = currentDepth + 1;
        const shouldExpand = depth <= this.maxDisplayDepth;
        
        return {
            name: directory.name,
            depth: depth,
            expanded: shouldExpand,
            children: shouldExpand && directory.children 
                ? directory.children.map(child => 
                    child.type === 'directory' 
                        ? this.renderTreeWithDepthLimit(child, depth)
                        : { name: child.name, depth: depth + 1, type: 'file' }
                  )
                : [],
            hasMoreLevels: !shouldExpand && directory.children && directory.children.length > 0
        };
    }
}
```

## Complexity Analysis

| Approach | Time | Space | Pros | Cons |
|----------|------|--------|------|------|
| **Recursive DFS** | O(n) | O(h) | Simple, intuitive | Stack overflow risk |
| **Iterative BFS** | O(n) | O(w) | No stack overflow | Higher space for balanced trees |
| **Iterative DFS** | O(n) | O(h) | No recursion, similar space | More complex |

- **n** = number of nodes
- **h** = tree height (log n for balanced, n for skewed)
- **w** = maximum width (n/2 for complete binary tree)

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
function testMaxDepth() {
    // Test cases
    const tests = [
        { input: null, expected: 0 },
        { input: [1], expected: 1 },
        { input: [3, 9, 20, null, null, 15, 7], expected: 3 },
        { input: [1, null, 2], expected: 2 }
    ];
    
    tests.forEach((test, i) => {
        const tree = createTreeFromArray(test.input);
        const result = maxDepth(tree);
        console.log(`Test ${i + 1}: ${result === test.expected ? '✓' : '✗'}`);
    });
}

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
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Key Discussion Points
1. **Approach Choice**: When to use recursive vs iterative
2. **Space Complexity**: Stack overflow considerations
3. **Tree Properties**: How balance affects performance
4. **Edge Cases**: Null trees, single nodes, skewed trees

### Common Follow-ups
- **Minimum Depth**: Find shortest path to leaf
- **Balanced Tree Check**: Use depth in validation
- **Tree Diameter**: Maximum path between any nodes
- **Level Order Traversal**: Related BFS application

### Microsoft Context
- **DOM Analysis**: Component tree optimization
- **Office Apps**: Document structure analysis
- **Performance**: Understanding deep nesting impact

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

1. **Algorithm Choice**: Recursive is simplest, iterative avoids stack overflow
2. **Space Complexity**: Consider tree shape when choosing approach  
3. **Frontend Relevance**: Critical for DOM/component optimization
4. **Performance**: Deep structures impact rendering and memory
5. **Edge Cases**: Always handle null/empty inputs gracefully

[⬆️ Back to Table of Contents](#table-of-contents) 