# Minimum Depth of Binary Tree ⭐

## Problem Statement

Given a binary tree, find its minimum depth.

The minimum depth is the number of nodes along the shortest path from the root node down to the nearest leaf node.

**Note:** A leaf is a node with no children.

**Example 1:**
```
Input: root = [3,9,20,null,null,15,7]
       3
      / \
     9  20
       /  \
      15   7
Output: 2 (path: 3->9)
```

**Example 2:**
```
Input: root = [2,null,3,null,4,null,5,null,6]
       2
        \
         3
          \
           4
            \
             5
              \
               6
Output: 5 (all nodes form single path)
```

## Solution Explanation

**Key Insight**: Use BFS to find first leaf node, or DFS with careful handling of null children.  
**Optimal Approach**: BFS gives shortest path immediately when first leaf is found.

## Brute Force Solution

```javascript
function minDepth(root) {
    if (!root) return 0;
    
    // Find all root-to-leaf paths and their lengths
    const allPaths = [];
    
    function findAllPaths(node, depth) {
        if (!node) return;
        
        // If leaf node, record path length
        if (!node.left && !node.right) {
            allPaths.push(depth);
            return;
        }
        
        // Explore all possible paths
        findAllPaths(node.left, depth + 1);
        findAllPaths(node.right, depth + 1);
    }
    
    findAllPaths(root, 1);
    
    // Return minimum path length
    return Math.min(...allPaths);
}
```

**Time Complexity**: O(n) - must visit all nodes to find all paths  
**Space Complexity**: O(h + l) - recursion stack + store leaf depths (l = leaf count)

## Optimal Solution

```javascript
// BFS Approach - Most efficient for minimum depth
function minDepth(root) {
    if (!root) return 0;
    
    const queue = [{node: root, depth: 1}];
    
    while (queue.length > 0) {
        const {node, depth} = queue.shift();
        
        // First leaf found = minimum depth (BFS guarantees shortest path)
        if (!node.left && !node.right) {
            return depth;
        }
        
        // Add children to queue with incremented depth
        if (node.left) queue.push({node: node.left, depth: depth + 1});
        if (node.right) queue.push({node: node.right, depth: depth + 1});
    }
}

// DFS Approach - Alternative recursive solution
function minDepthDFS(root) {
    if (!root) return 0;
    
    // If one child is null, continue with the other
    if (!root.left) return minDepthDFS(root.right) + 1;
    if (!root.right) return minDepthDFS(root.left) + 1;
    
    // Both children exist, take minimum
    return Math.min(minDepthDFS(root.left), minDepthDFS(root.right)) + 1;
}
```

**Time Complexity**: O(n) in worst case, but BFS can terminate early  
**Space Complexity**: 
- BFS: O(w) where w is maximum width of tree
- DFS: O(h) where h is height of tree  
- Best case (BFS finds leaf quickly): O(1) to O(log n)  
- Worst case: O(n) 