# Binary Tree Maximum Path Sum

## Problem Statement
A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.

The path sum of a path is the sum of the node's values in the path.

Given the root of a binary tree, return the maximum path sum of any non-empty path.

**LeetCode Problem Number: 124**

## Sample Input and Output
**Input:** `root = [1,2,3]`
**Output:** `6`
**Explanation:** The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.

**Input:** `root = [-10,9,20,null,null,15,7]`
**Output:** `42`
**Explanation:** The optimal path is 15 -> 20 -> 7 with a path sum of 15 + 20 + 7 = 42.

**Input:** `root = [-3]`
**Output:** `-3`

## Algorithm Outline
The approach uses **recursive post-order traversal**:

1. For each node, calculate the maximum path sum that can be obtained by going through that node
2. At each node, we have 4 possible paths:
   - Node only
   - Node + left subtree
   - Node + right subtree  
   - Node + left subtree + right subtree (path through node)
3. The maximum path through a node = node.val + max(left_path, 0) + max(right_path, 0)
4. Return the maximum contribution from this node to its parent = node.val + max(max(left_path, right_path), 0)
5. Keep track of the global maximum throughout the traversal

## Step-by-Step Dry Run
Let's trace through `root = [-10,9,20,null,null,15,7]`:

```
      -10
     /   \
    9     20
         /  \
        15   7
```

**Post-order traversal:**

1. **Node 15 (leaf):**
   - left_path = 0, right_path = 0
   - max_through_node = 15 + 0 + 0 = 15
   - global_max = 15
   - return to parent: 15

2. **Node 7 (leaf):**
   - left_path = 0, right_path = 0
   - max_through_node = 7 + 0 + 0 = 7
   - global_max = max(15, 7) = 15
   - return to parent: 7

3. **Node 20:**
   - left_path = 15, right_path = 7
   - max_through_node = 20 + 15 + 7 = 42
   - global_max = max(15, 42) = 42
   - return to parent: 20 + max(15, 7) = 35

4. **Node 9 (leaf):**
   - left_path = 0, right_path = 0
   - max_through_node = 9 + 0 + 0 = 9
   - global_max = max(42, 9) = 42
   - return to parent: 9

5. **Node -10 (root):**
   - left_path = 9, right_path = 35
   - max_through_node = -10 + 9 + 35 = 34
   - global_max = max(42, 34) = 42
   - return: -10 + max(9, 35) = 25

**Final result:** 42 (path: 15 -> 20 -> 7)

## JavaScript Implementation

```javascript
// Definition for a binary tree node
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}

// Main solution
function maxPathSum(root) {
    let globalMax = -Infinity;
    
    function maxPathSumHelper(node) {
        // Base case: null node contributes 0
        if (!node) return 0;
        
        // Get maximum path sums from left and right subtrees
        // Use Math.max with 0 to ignore negative paths
        const leftMax = Math.max(maxPathSumHelper(node.left), 0);
        const rightMax = Math.max(maxPathSumHelper(node.right), 0);
        
        // Maximum path sum through current node (considering it as a "bridge")
        const currentMax = node.val + leftMax + rightMax;
        
        // Update global maximum
        globalMax = Math.max(globalMax, currentMax);
        
        // Return maximum path sum starting from current node
        // (can only choose one direction when returning to parent)
        return node.val + Math.max(leftMax, rightMax);
    }
    
    maxPathSumHelper(root);
    return globalMax;
}

// Alternative implementation with clearer variable names
function maxPathSumVerbose(root) {
    let maxSum = -Infinity;
    
    function dfs(node) {
        if (!node) return 0;
        
        // Calculate max contribution from left and right children
        const leftContribution = Math.max(dfs(node.left), 0);
        const rightContribution = Math.max(dfs(node.right), 0);
        
        // Max path sum if current node is the highest point in the path
        const pathThroughNode = node.val + leftContribution + rightContribution;
        
        // Update global maximum
        maxSum = Math.max(maxSum, pathThroughNode);
        
        // Return max path sum that can be extended to parent
        const maxContributionToParent = node.val + Math.max(leftContribution, rightContribution);
        return maxContributionToParent;
    }
    
    dfs(root);
    return maxSum;
}

// Solution with detailed comments for interview explanation
function maxPathSumDetailed(root) {
    let result = -Infinity;
    
    function calculateMaxPath(node) {
        // Base case: null node doesn't contribute to path
        if (node === null) {
            return 0;
        }
        
        // Recursively get the maximum path sums from left and right subtrees
        // If a subtree path sum is negative, we ignore it (take 0 instead)
        const leftPathSum = Math.max(calculateMaxPath(node.left), 0);
        const rightPathSum = Math.max(calculateMaxPath(node.right), 0);
        
        // Calculate the maximum path sum that passes through the current node
        // This path connects the left subtree, current node, and right subtree
        const pathSumThroughCurrentNode = node.val + leftPathSum + rightPathSum;
        
        // Update the global maximum if we found a better path
        result = Math.max(result, pathSumThroughCurrentNode);
        
        // Return the maximum path sum that starts from the current node
        // and extends towards the parent (can only go in one direction)
        // This will be used by the parent node in its calculations
        return node.val + Math.max(leftPathSum, rightPathSum);
    }
    
    calculateMaxPath(root);
    return result;
}

// Helper function to create binary tree from array representation
function createBinaryTree(arr) {
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

// Test the solution
function testMaxPathSum() {
    // Test case 1: [1,2,3] -> 6
    const tree1 = createBinaryTree([1, 2, 3]);
    console.log(maxPathSum(tree1)); // 6
    
    // Test case 2: [-10,9,20,null,null,15,7] -> 42
    const tree2 = createBinaryTree([-10, 9, 20, null, null, 15, 7]);
    console.log(maxPathSum(tree2)); // 42
    
    // Test case 3: [-3] -> -3
    const tree3 = createBinaryTree([-3]);
    console.log(maxPathSum(tree3)); // -3
}
```

## Time and Space Complexity Analysis

**Time Complexity:** O(n)
- We visit each node in the binary tree exactly once
- At each node, we perform constant time operations
- n is the total number of nodes in the tree

**Space Complexity:** O(h)
- Where h is the height of the binary tree
- Space is used for the recursion call stack
- In the worst case (skewed tree): O(n)
- In the best case (balanced tree): O(log n)
- Additional space for variables is O(1)

**Key Insights:**
1. **Two different maximums:** We track two different values at each node:
   - Maximum path sum through the node (used for global maximum)
   - Maximum path sum starting from the node (returned to parent)

2. **Negative path handling:** We use `Math.max(pathSum, 0)` to ignore negative contributions from subtrees

3. **Path definition:** A path can start and end at any nodes, doesn't need to go through root