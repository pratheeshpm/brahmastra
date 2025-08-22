# Lowest Common Ancestor of a Binary Tree - LeetCode #236

## Problem Explanation
Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree. The LCA is defined as the lowest node in the tree that has both p and q as descendants (where we allow a node to be a descendant of itself).

## Sample Input and Output

**Example 1:**
```
Input: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
Output: 3
Explanation: The LCA of nodes 5 and 1 is 3.

       3
      / \
     5   1
    / \ / \
   6  2 0  8
     / \
    7   4
```

**Example 2:**
```
Input: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4
Output: 5
Explanation: The LCA of nodes 5 and 4 is 5, since a node can be a descendant of itself.
```

**Example 3:**
```
Input: root = [1,2], p = 1, q = 2
Output: 1
```

## Algorithm Outline
**Approach 1 - Recursive DFS:**
1. **Base case**: If current node is null, p, or q, return current node
2. **Search subtrees**: Recursively search left and right subtrees
3. **Determine LCA**: 
   - If both subtrees return non-null, current node is LCA
   - If only one subtree returns non-null, propagate that result up
   - If neither returns non-null, return null

## Step-by-Step Dry Run
Using Example 1: root = [3,5,1,6,2,0,8], p = 5, q = 1

**DFS Traversal:**
1. **Node 3**: Search left (5) and right (1) subtrees
2. **Left subtree (5)**: Found p=5, return 5
3. **Right subtree (1)**: Search continues...
   - **Node 1**: Found q=1, return 1
4. **Back to Node 3**: Left returned 5, right returned 1
   - Both non-null, so Node 3 is LCA
5. **Return**: 3

## JavaScript Implementation

```javascript
// Definition for a binary tree node
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}

// Approach 1: Recursive DFS (Most Elegant)
function lowestCommonAncestor(root, p, q) {
    // Base case: if root is null or we found one of the target nodes
    if (!root || root === p || root === q) {
        return root;
    }
    
    // Search in left and right subtrees
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    
    // If both left and right are non-null, current node is LCA
    if (left && right) {
        return root;
    }
    
    // Otherwise, return the non-null result (propagate up)
    return left || right;
}

// Approach 2: Iterative with Parent Pointers
function lowestCommonAncestorIterative(root, p, q) {
    // Build parent mapping using BFS
    const parentMap = new Map();
    const queue = [root];
    parentMap.set(root, null);
    
    // Continue until we find both p and q
    while (!parentMap.has(p) || !parentMap.has(q)) {
        const node = queue.shift();
        
        if (node.left) {
            parentMap.set(node.left, node);
            queue.push(node.left);
        }
        
        if (node.right) {
            parentMap.set(node.right, node);
            queue.push(node.right);
        }
    }
    
    // Collect all ancestors of p
    const ancestors = new Set();
    let current = p;
    while (current) {
        ancestors.add(current);
        current = parentMap.get(current);
    }
    
    // Find first common ancestor starting from q
    current = q;
    while (current) {
        if (ancestors.has(current)) {
            return current;
        }
        current = parentMap.get(current);
    }
    
    return null;
}

// Approach 3: Path-based Solution
function lowestCommonAncestorPath(root, p, q) {
    function findPath(node, target, path) {
        if (!node) return false;
        
        path.push(node);
        
        // If current node is target
        if (node === target) return true;
        
        // Search in left or right subtree
        if (findPath(node.left, target, path) || findPath(node.right, target, path)) {
            return true;
        }
        
        // Backtrack
        path.pop();
        return false;
    }
    
    const pathP = [];
    const pathQ = [];
    
    findPath(root, p, pathP);
    findPath(root, q, pathQ);
    
    // Find last common node in both paths
    let lca = null;
    const minLength = Math.min(pathP.length, pathQ.length);
    
    for (let i = 0; i < minLength; i++) {
        if (pathP[i] === pathQ[i]) {
            lca = pathP[i];
        } else {
            break;
        }
    }
    
    return lca;
}

// Approach 4: DFS with Return Values
function lowestCommonAncestorDetailed(root, p, q) {
    let result = null;
    
    function dfs(node) {
        if (!node) return false;
        
        // Check if current node is one of the targets
        const current = (node === p || node === q) ? 1 : 0;
        
        // Check left subtree
        const left = dfs(node.left) ? 1 : 0;
        
        // Check right subtree  
        const right = dfs(node.right) ? 1 : 0;
        
        // If any two of the flags are set, we found the LCA
        if (current + left + right >= 2) {
            result = node;
        }
        
        // Return true if any of the flags is set
        return (current + left + right) > 0;
    }
    
    dfs(root);
    return result;
}

// Helper function to create tree from array
function createTree(arr, index = 0) {
    if (index >= arr.length || arr[index] === null) {
        return null;
    }
    
    const root = new TreeNode(arr[index]);
    root.left = createTree(arr, 2 * index + 1);
    root.right = createTree(arr, 2 * index + 2);
    
    return root;
}

// Helper function to find node by value
function findNode(root, val) {
    if (!root) return null;
    if (root.val === val) return root;
    
    return findNode(root.left, val) || findNode(root.right, val);
}

// Test cases
function testLowestCommonAncestor() {
    console.log("Testing Lowest Common Ancestor:");
    
    // Test case 1: [3,5,1,6,2,0,8,null,null,7,4]
    const tree1 = createTree([3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
    const p1 = findNode(tree1, 5);
    const q1 = findNode(tree1, 1);
    const lca1 = lowestCommonAncestor(tree1, p1, q1);
    console.log(`Test 1: LCA(5, 1) = ${lca1.val} (expected: 3)`);
    
    // Test case 2: Same tree, p = 5, q = 4
    const q2 = findNode(tree1, 4);
    const lca2 = lowestCommonAncestor(tree1, p1, q2);
    console.log(`Test 2: LCA(5, 4) = ${lca2.val} (expected: 5)`);
    
    // Test case 3: [1,2] 
    const tree3 = createTree([1, 2]);
    const p3 = findNode(tree3, 1);
    const q3 = findNode(tree3, 2);
    const lca3 = lowestCommonAncestor(tree3, p3, q3);
    console.log(`Test 3: LCA(1, 2) = ${lca3.val} (expected: 1)`);
    
    // Test with different approaches
    console.log("\nComparing different approaches:");
    const lca1_iter = lowestCommonAncestorIterative(tree1, p1, q1);
    const lca1_path = lowestCommonAncestorPath(tree1, p1, q1);
    const lca1_detailed = lowestCommonAncestorDetailed(tree1, p1, q1);
    
    console.log(`Recursive: ${lca1.val}`);
    console.log(`Iterative: ${lca1_iter.val}`);
    console.log(`Path-based: ${lca1_path.val}`);
    console.log(`Detailed: ${lca1_detailed.val}`);
    console.log(`All match: ${lca1.val === lca1_iter.val && lca1.val === lca1_path.val && lca1.val === lca1_detailed.val}`);
}

// Edge case testing
function testEdgeCases() {
    console.log("\nTesting edge cases:");
    
    // Single node tree
    const singleNode = new TreeNode(1);
    const lcaSingle = lowestCommonAncestor(singleNode, singleNode, singleNode);
    console.log(`Single node LCA: ${lcaSingle.val} (expected: 1)`);
    
    // Linear tree
    const linear = new TreeNode(1);
    linear.left = new TreeNode(2);
    linear.left.left = new TreeNode(3);
    
    const lca_linear = lowestCommonAncestor(linear, linear.left, linear.left.left);
    console.log(`Linear tree LCA(2, 3): ${lca_linear.val} (expected: 1)`);
    
    // One node is ancestor of another
    const tree = createTree([1, 2, 3, 4, 5]);
    const p = findNode(tree, 2);
    const q = findNode(tree, 4);
    const lca_ancestor = lowestCommonAncestor(tree, p, q);
    console.log(`Ancestor case LCA(2, 4): ${lca_ancestor.val} (expected: 2)`);
}

// testLowestCommonAncestor();
// testEdgeCases();
```

## Time and Space Complexity

**Approach 1 - Recursive DFS:**
- **Time Complexity:** O(n) where n = number of nodes
  - In worst case, we visit all nodes once
- **Space Complexity:** O(h) where h = height of tree
  - Recursion stack depth equals tree height
  - O(log n) for balanced tree, O(n) for skewed tree

**Approach 2 - Iterative with Parent Pointers:**
- **Time Complexity:** O(n)
  - BFS to build parent map: O(n)
  - Traverse ancestors: O(h)
- **Space Complexity:** O(n)
  - Parent map stores all nodes
  - Queue for BFS: O(w) where w is max width

**Approach 3 - Path-based:**
- **Time Complexity:** O(n)
  - Finding each path: O(n) in worst case
- **Space Complexity:** O(h)
  - Path arrays store at most h nodes each
  - Recursion stack: O(h)

**Approach 4 - DFS with Return Values:**
- **Time Complexity:** O(n)
  - Single DFS traversal
- **Space Complexity:** O(h)
  - Recursion stack depth

**Best Approach:** Recursive DFS (Approach 1) - most elegant and efficient

**Key Insights:**
1. **Early termination**: Return immediately when finding target nodes
2. **Bottom-up propagation**: Information flows from leaves to root
3. **Decision point**: LCA is where paths to both nodes diverge
4. **Self-ancestor**: A node can be LCA if one target is in its subtree

**Edge Cases Handled:**
- One node is ancestor of another (return the ancestor)
- Both nodes are the same (return that node)
- Single node tree
- Linear tree structure
- Nodes don't exist in tree (would need additional validation)