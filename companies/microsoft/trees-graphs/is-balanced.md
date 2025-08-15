# Check if Binary Tree is Balanced ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Implementation](#core-implementation)
  - [Optimized Single Pass (Recommended)](#optimized-single-pass-recommended)
  - [Brute Force Approach](#brute-force-approach)
  - [Iterative Solution](#iterative-solution)
- [Usage Examples](#usage-examples)
- [Frontend Applications](#frontend-applications)
- [Complexity Analysis](#complexity-analysis)
- [Testing](#testing)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Given a binary tree, determine if it is height-balanced.

A height-balanced binary tree is one in which the left and right subtrees of every node differ in height by no more than 1.

**Example 1:**
```
    3
   / \
  9  20
    /  \
   15   7
```
Output: `true`

**Example 2:**
```
       1
      / \
     2   2
    / \
   3   3
  / \
 4   4
```
Output: `false`

**Example 3:**
```
Empty tree
```
Output: `true`

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Implementation


## Complexity Analysis

### Detailed Analysis by Approach

| Approach | Time Complexity | Space Complexity | Best Case | Worst Case |
|----------|----------------|------------------|-----------|------------|
| **Optimized Single Pass** | O(n) | O(h) | O(n), O(log n) | O(n), O(n) |
| **Brute Force** | O(n²) | O(h) | O(n²), O(log n) | O(n²), O(n) |
| **Iterative** | O(n) | O(n) | O(n), O(n) | O(n), O(n) |



### Optimized Single Pass (Recommended)

```javascript
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function isBalanced(root) {
    function checkBalance(node) {
        if (!node) return 0; // Base case: empty node has height 0
        
        const leftHeight = checkBalance(node.left); // Check left subtree
        if (leftHeight === -1) return -1; // Left subtree unbalanced
        
        const rightHeight = checkBalance(node.right); // Check right subtree
        if (rightHeight === -1) return -1; // Right subtree unbalanced
        
        if (Math.abs(leftHeight - rightHeight) > 1) {
            return -1; // Current node unbalanced
        }
        
        return Math.max(leftHeight, rightHeight) + 1; // Return height
    }
    
    return checkBalance(root) !== -1;
}
```

### Brute Force Approach

```javascript
function isBalancedBruteForce(root) {
    if (!root) return true;
    
    function height(node) {
        if (!node) return 0; // Calculate height recursively
        return Math.max(height(node.left), height(node.right)) + 1;
    }
    
    const leftHeight = height(root.left); // Get left height
    const rightHeight = height(root.right); // Get right height
    
    if (Math.abs(leftHeight - rightHeight) > 1) {
        return false; // Current node unbalanced
    }
    
    return isBalancedBruteForce(root.left) && isBalancedBruteForce(root.right);
}
```

### Iterative Solution

```javascript
function isBalancedIterative(root) {
    if (!root) return true;
    
    const stack = [root];
    const heights = new Map(); // Store calculated heights
    
    while (stack.length > 0) {
        const node = stack[stack.length - 1]; // Peek at top
        
        if (!heights.has(node)) {
            if (node.right) stack.push(node.right); // Add children
            if (node.left) stack.push(node.left);
            heights.set(node, null); // Mark as seen
        } else {
            stack.pop(); // Process node
            
            const leftHeight = node.left ? heights.get(node.left) : 0;
            const rightHeight = node.right ? heights.get(node.right) : 0;
            
            if (leftHeight === -1 || rightHeight === -1 || 
                Math.abs(leftHeight - rightHeight) > 1) {
                return false; // Unbalanced found
            }
            
            heights.set(node, Math.max(leftHeight, rightHeight) + 1);
        }
    }
    
    return true;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage Examples

```javascript
// Create test trees
const balancedTree = new TreeNode(3);
balancedTree.left = new TreeNode(9);
balancedTree.right = new TreeNode(20);
balancedTree.right.left = new TreeNode(15);
balancedTree.right.right = new TreeNode(7);

const unbalancedTree = new TreeNode(1);
unbalancedTree.left = new TreeNode(2);
unbalancedTree.left.left = new TreeNode(3);
unbalancedTree.left.left.left = new TreeNode(4);

// Test all implementations
console.log(isBalanced(balancedTree)); // true
console.log(isBalanced(unbalancedTree)); // false
console.log(isBalancedBruteForce(balancedTree)); // true
console.log(isBalancedIterative(unbalancedTree)); // false

// Edge cases
console.log(isBalanced(null)); // true (empty tree)
console.log(isBalanced(new TreeNode(1))); // true (single node)
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Frontend Applications

### Why This Matters for Frontend Engineers

#### 1. DOM Tree Balance
Understanding balanced trees helps with DOM optimization:
```javascript
// Check if DOM tree is reasonably balanced for performance
function isDOMTreeBalanced(element, maxDepthDiff = 3) {
    function getDepth(node) {
        if (!node || !node.children || node.children.length === 0) {
            return 0;
        }
        
        let maxChildDepth = 0;
        for (let child of node.children) {
            maxChildDepth = Math.max(maxChildDepth, getDepth(child));
        }
        
        return maxChildDepth + 1;
    }
    
    function checkBalance(node) {
        if (!node || !node.children || node.children.length === 0) {
            return true;
        }
        
        const depths = [];
        for (let child of node.children) {
            depths.push(getDepth(child));
            if (!checkBalance(child)) return false;
        }
        
        const minDepth = Math.min(...depths);
        const maxDepth = Math.max(...depths);
        
        return (maxDepth - minDepth) <= maxDepthDiff;
    }
    
    return checkBalance(element);
}
```

#### 2. Component Tree Analysis
Analyze React component tree balance:
```javascript
// Analyze component tree balance for performance insights
function analyzeComponentBalance(fiberNode) {
    function getComponentHeight(node) {
        if (!node) return 0;
        
        let maxHeight = 0;
        let child = node.child;
        
        while (child) {
            maxHeight = Math.max(maxHeight, getComponentHeight(child));
            child = child.sibling;
        }
        
        return maxHeight + 1;
    }
    
    function isBalanced(node) {
        if (!node) return { balanced: true, height: 0 };
        
        let leftHeight = 0;
        let rightHeight = 0;
        let child = node.child;
        
        if (child) {
            const leftResult = isBalanced(child);
            if (!leftResult.balanced) return { balanced: false, height: -1 };
            leftHeight = leftResult.height;
            
            if (child.sibling) {
                const rightResult = isBalanced(child.sibling);
                if (!rightResult.balanced) return { balanced: false, height: -1 };
                rightHeight = rightResult.height;
            }
        }
        
        const heightDiff = Math.abs(leftHeight - rightHeight);
        const balanced = heightDiff <= 1;
        const height = Math.max(leftHeight, rightHeight) + 1;
        
        return { balanced, height };
    }
    
    return isBalanced(fiberNode);
}
```
### Time Complexity Breakdown

#### 1. Optimized Single Pass: **O(n)**
```javascript
// Each node visited exactly once
function checkBalance(node) {
    if (!node) return 0;                    // O(1)
    
    const leftHeight = checkBalance(left);  // T(left subtree)
    const rightHeight = checkBalance(right); // T(right subtree)
    
    return Math.max(leftHeight, rightHeight) + 1; // O(1)
}
// Total: T(n) = T(left) + T(right) + O(1) = O(n)
```

#### 2. Brute Force: **O(n²)**
```javascript
// For each node, calculate height (which visits all descendants)
function isBalanced(root) {
    // height() visits O(n) nodes in worst case
    const leftHeight = height(root.left);   // O(n)
    const rightHeight = height(root.right); // O(n)
    
    // Recursive calls for each node
    return isBalanced(root.left) && isBalanced(root.right); // T(n-1)
}
// Total: T(n) = O(n) + T(n-1) = O(n²)
```

#### 3. Iterative: **O(n)**
```javascript
// Each node processed exactly once with map operations
while (stack.length > 0) {      // Loop runs n times
    // Map get/set operations: O(1)
    // Stack operations: O(1)
}
// Total: O(n)
```

### Space Complexity Breakdown

#### 1. Recursion Stack: **O(h)**
- **Balanced Tree**: h = log₂(n) → **O(log n)**
- **Skewed Tree**: h = n → **O(n)**
- **Average Case**: **O(log n)**

#### 2. Additional Memory: **O(1) to O(n)**
- **Optimized**: No extra data structures → **O(1)**
- **Iterative**: HashMap + Stack → **O(n)**

### Real-World Performance

#### Input Size Impact
```javascript
// Performance comparison for different tree sizes
const performanceTest = {
    small: "n=100 → All approaches fast (<1ms)",
    medium: "n=10,000 → Brute force slow (100ms vs 1ms)",
    large: "n=100,000 → Brute force unusable (10s vs 10ms)",
    huge: "n=1,000,000 → Only optimized/iterative viable"
};
```

#### Memory Usage
```javascript
const memoryUsage = {
    optimized: "Call stack only: ~8 bytes × height",
    iterative: "HashMap + Stack: ~32 bytes × nodes", 
    bruteForce: "Call stack only but deep recursion"
};
```

### When to Use Each Approach

| Scenario | Recommended Approach | Reason |
|----------|---------------------|--------|
| **Interview** | Optimized Single Pass | Best time complexity, clean code |
| **Large Trees** | Iterative | Avoids stack overflow |
| **Learning** | Brute Force | Easier to understand |
| **Memory Constrained** | Optimized Single Pass | Minimal memory overhead |
| **Repeated Queries** | Optimized + Memoization | Cache results |

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
function testIsBalanced() {
    // Test cases
    const tests = [
        { input: null, expected: true, desc: "Empty tree" },
        { input: [1], expected: true, desc: "Single node" },
        { input: [3, 9, 20, null, null, 15, 7], expected: true, desc: "Balanced tree" },
        { input: [1, 2, 2, 3, 3, null, null, 4, 4], expected: false, desc: "Unbalanced tree" }
    ];
    
    tests.forEach((test, i) => {
        const tree = createTreeFromArray(test.input);
        const result = isBalanced(tree);
        console.log(`Test ${i + 1}: ${result === test.expected ? '✓' : '✗'} ${test.desc}`);
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

testIsBalanced();
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Key Discussion Points
1. **Approach Choice**: When to use recursive vs iterative
2. **Early Termination**: Using -1 to short-circuit on imbalance
3. **Edge Cases**: Empty trees, single nodes, skewed trees
4. **Tree Properties**: How balance affects performance

### Common Follow-ups
- **Height Calculation**: Implement tree height function
- **Balanced Tree Construction**: Create balanced BST from sorted array
- **N-ary Trees**: Extend balance check to multiple children
- **AVL Trees**: Discuss self-balancing tree rotations

### Microsoft Context
- **DOM Optimization**: Detecting deeply nested elements
- **Component Trees**: Analyzing React component hierarchy
- **Performance**: Understanding impact on rendering

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

1. **Single Pass**: Optimized solution visits each node once with O(n) time
2. **Early Termination**: Return -1 on imbalance to avoid unnecessary work
3. **Frontend Relevance**: Balance checking helps optimize DOM and component trees
4. **Space Efficiency**: Recursive approach uses O(h) space vs O(n) for iterative
5. **Edge Cases**: Always handle null trees and single nodes correctly

[⬆️ Back to Table of Contents](#table-of-contents) 