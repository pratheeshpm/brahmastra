# Binary Tree Level Order Traversal ⭐

## Problem Statement

Given the root of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).

**Example 1:**
```
Input: root = [3,9,20,null,null,15,7]
       3
      / \
     9  20
       /  \
      15   7
Output: [[3],[9,20],[15,7]]
```

**Example 2:**
```
Input: root = [1]
Output: [[1]]
```

## Solution Explanation

**Key Insight**: Use BFS with queue to process nodes level by level, tracking level boundaries.  
**Optimal Approach**: Single queue with level size tracking to group nodes by level.

## Brute Force Solution

```javascript
function levelOrder(root) {
    if (!root) return [];
    
    // Use DFS to collect nodes with their levels
    const nodesByLevel = new Map();
    
    function dfs(node, level) {
        if (!node) return;
        
        // Store node value at its level
        if (!nodesByLevel.has(level)) {
            nodesByLevel.set(level, []);
        }
        nodesByLevel.get(level).push(node.val);
        
        // Visit children at next level
        dfs(node.left, level + 1);
        dfs(node.right, level + 1);
    }
    
    dfs(root, 0);
    
    // Convert map to array of arrays
    const result = [];
    let level = 0;
    while (nodesByLevel.has(level)) {
        result.push(nodesByLevel.get(level));
        level++;
    }
    
    return result;
}
```

**Time Complexity**: O(n) - visit each node once  
**Space Complexity**: O(n) - store all nodes in map + O(h) recursion stack

## Optimal Solution

```javascript
function levelOrder(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length; // Number of nodes at current level
        const currentLevel = [];
        
        // Process all nodes at current level
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            currentLevel.push(node.val);
            
            // Add children for next level
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        result.push(currentLevel);
    }
    
    return result;
}

// Alternative: Using null sentinel to mark level boundaries
function levelOrderSentinel(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root, null]; // null marks end of level
    let currentLevel = [];
    
    while (queue.length > 0) {
        const node = queue.shift();
        
        if (node === null) {
            // End of current level
            result.push(currentLevel);
            currentLevel = [];
            
            // Add sentinel for next level if more nodes exist
            if (queue.length > 0) {
                queue.push(null);
            }
        } else {
            currentLevel.push(node.val);
            
            // Add children
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
    
    return result;
}
```

**Time Complexity**: O(n) - visit each node exactly once  
**Space Complexity**: O(w) - queue stores at most w nodes (w = max width of tree)  
- Best case (balanced): O(n/2) ≈ O(n)  
- Worst case (complete tree): O(2^h) where h = height 