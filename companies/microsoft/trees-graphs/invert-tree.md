# Invert Binary Tree ⭐

## Problem Statement

Given the root of a binary tree, invert the tree and return its root.

**Example:**
```
Input:      4
           / \
          2   7
         / \ / \
        1  3 6  9

Output:     4
           / \
          7   2
         / \ / \
        9  6 3  1
```

## Solution Explanation

**Key Insight**: Swap left and right children of every node recursively or iteratively.  
**Optimal Approach**: Use DFS (recursive) to traverse and swap children at each node.

## Brute Force Solution

```javascript
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

function invertTree(root) {
    if (!root) return null; // Base case: empty tree
    
    // Create new inverted tree (copying nodes)
    const newRoot = new TreeNode(root.val);
    newRoot.left = invertTree(root.right);  // Left becomes inverted right
    newRoot.right = invertTree(root.left);  // Right becomes inverted left
    
    return newRoot;
}
```

**Time Complexity**: O(n) - visit each node once  
**Space Complexity**: O(n) - create new tree + O(h) recursion stack

## Optimal Solution

```javascript
function invertTree(root) {
    if (!root) return null; // Base case: empty tree
    
    // Swap left and right children
    const temp = root.left;
    root.left = root.right;
    root.right = temp;
    
    // Recursively invert subtrees
    invertTree(root.left);   // Invert left subtree
    invertTree(root.right);  // Invert right subtree
    
    return root;
}

// Alternative: Iterative solution using queue (BFS)
function invertTreeIterative(root) {
    if (!root) return null;
    
    const queue = [root];
    
    while (queue.length > 0) {
        const node = queue.shift();
        
        // Swap children
        const temp = node.left;
        node.left = node.right;
        node.right = temp;
        
        // Add children to queue for processing
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    
    return root;
}
```

**Time Complexity**: O(n) - visit each node once  
**Space Complexity**: O(h) - recursion stack (h = tree height)  
- Best case (balanced): O(log n)  
- Worst case (skewed): O(n) 