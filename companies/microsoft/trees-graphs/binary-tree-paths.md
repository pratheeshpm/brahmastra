# Binary Tree Paths ⭐

## Problem Statement

Given the root of a binary tree, return all root-to-leaf paths in any order.

A leaf is a node with no children.

**Example:**
```
Input: root = [1,2,3,null,5]
       1
      / \
     2   3
      \
       5

Output: ["1->2->5", "1->3"]
```

**Example 2:**
```
Input: root = [1]
Output: ["1"]
```

## Solution Explanation

**Key Insight**: Use DFS to traverse from root to each leaf, building path string incrementally.  
**Optimal Approach**: Recursive DFS with backtracking to collect all root-to-leaf paths.

## Brute Force Solution

```javascript
function binaryTreePaths(root) {
    if (!root) return [];
    
    const allPaths = [];
    
    // Get all nodes with their levels using BFS
    function getAllNodes(node) {
        const nodes = [];
        const queue = [{node, path: []}];
        
        while (queue.length > 0) {
            const {node: current, path} = queue.shift();
            const newPath = [...path, current.val];
            
            // If leaf node, save complete path
            if (!current.left && !current.right) {
                nodes.push(newPath);
            }
            
            // Add children with extended paths
            if (current.left) {
                queue.push({node: current.left, path: newPath});
            }
            if (current.right) {
                queue.push({node: current.right, path: newPath});
            }
        }
        return nodes;
    }
    
    const pathArrays = getAllNodes(root);
    
    // Convert path arrays to strings
    return pathArrays.map(path => path.join('->'));
}
```

**Time Complexity**: O(n) - visit each node once  
**Space Complexity**: O(n * h) - store all paths, each path has h nodes

## Optimal Solution

```javascript
function binaryTreePaths(root) {
    if (!root) return [];
    
    const result = [];
    
    // DFS helper function with current path
    function dfs(node, currentPath) {
        if (!node) return;
        
        // Add current node to path
        currentPath.push(node.val);
        
        // If leaf node, save the complete path
        if (!node.left && !node.right) {
            result.push(currentPath.join('->'));
        } else {
            // Continue DFS for children
            dfs(node.left, currentPath);   // Explore left
            dfs(node.right, currentPath);  // Explore right
        }
        
        // Backtrack: remove current node from path
        currentPath.pop();
    }
    
    dfs(root, []);
    return result;
}

// Alternative: String concatenation approach
function binaryTreePathsString(root) {
    if (!root) return [];
    
    const result = [];
    
    function dfs(node, path) {
        if (!node) return;
        
        // Build path string
        const currentPath = path ? `${path}->${node.val}` : `${node.val}`;
        
        // If leaf, add to result
        if (!node.left && !node.right) {
            result.push(currentPath);
            return;
        }
        
        // Recursively explore children
        dfs(node.left, currentPath);
        dfs(node.right, currentPath);
    }
    
    dfs(root, '');
    return result;
}
```

**Time Complexity**: O(n) - visit each node once  
**Space Complexity**: O(h) for recursion + O(n * h) for storing paths  
- Best case (balanced): O(log n) + O(n * log n)  
- Worst case (skewed): O(n) + O(n²) 