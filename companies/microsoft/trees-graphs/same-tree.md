# Same Tree Comparison ⭐

## Problem Statement

Given the roots of two binary trees `p` and `q`, write a function to check if they are the same or not.

Two binary trees are considered the same if they are structurally identical and the nodes have the same value.

**Example 1:**
```
Input: p = [1,2,3], q = [1,2,3]
Tree p:     1         Tree q:     1
           / \                   / \
          2   3                 2   3
Output: true
```

**Example 2:**
```
Input: p = [1,2], q = [1,null,2]
Tree p:     1         Tree q:     1
           /                       \
          2                         2
Output: false
```

## Solution Explanation

**Key Insight**: Compare values and recursively check left and right subtrees are identical.  
**Optimal Approach**: Use DFS recursion with early termination on mismatch.

## Brute Force Solution

```javascript
function isSameTree(p, q) {
    // Convert trees to arrays and compare
    function treeToArray(root) {
        if (!root) return [null];
        const result = [];
        const queue = [root];
        
        while (queue.length > 0) {
            const node = queue.shift();
            if (node) {
                result.push(node.val);
                queue.push(node.left);   // Add left child (or null)
                queue.push(node.right);  // Add right child (or null)
            } else {
                result.push(null);
            }
        }
        return result;
    }
    
    const arrayP = treeToArray(p);
    const arrayQ = treeToArray(q);
    
    // Compare arrays element by element
    if (arrayP.length !== arrayQ.length) return false;
    
    for (let i = 0; i < arrayP.length; i++) {
        if (arrayP[i] !== arrayQ[i]) return false;
    }
    
    return true;
}
```

**Time Complexity**: O(n + m) - convert both trees to arrays  
**Space Complexity**: O(n + m) - store both trees as arrays

## Optimal Solution

```javascript
function isSameTree(p, q) {
    // Base cases: both null or one null
    if (!p && !q) return true;  // Both trees empty
    if (!p || !q) return false; // One tree empty, other not
    
    // Check current nodes match
    if (p.val !== q.val) return false;
    
    // Recursively check subtrees
    return isSameTree(p.left, q.left) &&    // Left subtrees match
           isSameTree(p.right, q.right);     // Right subtrees match
}

// Alternative: Iterative solution using stack
function isSameTreeIterative(p, q) {
    const stack = [[p, q]]; // Stack of node pairs to compare
    
    while (stack.length > 0) {
        const [node1, node2] = stack.pop();
        
        // Both null - continue
        if (!node1 && !node2) continue;
        
        // One null, other not - trees different
        if (!node1 || !node2) return false;
        
        // Values different - trees different
        if (node1.val !== node2.val) return false;
        
        // Add children pairs to stack
        stack.push([node1.left, node2.left]);
        stack.push([node1.right, node2.right]);
    }
    
    return true;
}
```

**Time Complexity**: O(min(n, m)) - visit nodes until mismatch found  
**Space Complexity**: O(min(h₁, h₂)) - recursion stack depth  
- Best case: O(1) - immediate mismatch  
- Worst case: O(n) - completely traverse identical trees 