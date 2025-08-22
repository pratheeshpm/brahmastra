# Binary Tree Right Side View

## Problem Statement
Given the root of a binary tree, imagine yourself standing on the right side of it, return the values of the nodes you can see ordered from top to bottom.

**LeetCode Problem Number: 199**

## Sample Input and Output
**Input:** `root = [1,2,3,null,5,null,4]`
**Output:** `[1,3,4]`
**Explanation:** 
```
    1
   / \
  2   3
   \   \
    5   4
```
From the right side, you can see nodes 1, 3, and 4.

**Input:** `root = [1,null,3]`
**Output:** `[1,3]`

**Input:** `root = []`
**Output:** `[]`

## Algorithm Outline
The most efficient approach uses **level-order traversal (BFS)**:

1. Use a queue to perform level-order traversal
2. For each level, process all nodes from left to right
3. Keep track of the rightmost node in each level
4. Add the rightmost node's value to the result

Alternative approach using **DFS with level tracking**:
1. Use recursive DFS traversal
2. Always visit right subtree before left subtree
3. Keep track of the current level
4. Add the first node encountered at each level to result

## Step-by-Step Dry Run
Let's trace through `root = [1,2,3,null,5,null,4]` using BFS:

```
    1
   / \
  2   3
   \   \
    5   4
```

1. **Level 0:** Queue = [1]
   - Process node 1, add children 2,3 to queue
   - Rightmost at level 0: 1
   - Result: [1]

2. **Level 1:** Queue = [2,3]
   - Process node 2, add child 5 to queue
   - Process node 3, add child 4 to queue
   - Rightmost at level 1: 3
   - Result: [1,3]

3. **Level 2:** Queue = [5,4]
   - Process node 5, no children
   - Process node 4, no children
   - Rightmost at level 2: 4
   - Result: [1,3,4]

4. **Queue empty, traversal complete**

## JavaScript Implementation

```javascript
// Definition for a binary tree node
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}

// Approach 1: BFS (Level-order traversal)
function rightSideView(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        let rightmostValue;
        
        // Process all nodes at current level
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            rightmostValue = node.val; // Update with each node (last one will be rightmost)
            
            // Add children for next level
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        // Add the rightmost value of current level
        result.push(rightmostValue);
    }
    
    return result;
}

// Approach 2: DFS (Recursive with level tracking)
function rightSideViewDFS(root) {
    const result = [];
    
    function dfs(node, level) {
        if (!node) return;
        
        // If this is the first node we're visiting at this level
        if (level === result.length) {
            result.push(node.val);
        }
        
        // Visit right subtree first, then left
        dfs(node.right, level + 1);
        dfs(node.left, level + 1);
    }
    
    dfs(root, 0);
    return result;
}

// Approach 3: BFS with level separation using null marker
function rightSideViewAlternative(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root, null]; // null marks end of level
    let levelNodes = [];
    
    while (queue.length > 1) { // Continue while more than just null
        const node = queue.shift();
        
        if (node === null) {
            // End of current level
            result.push(levelNodes[levelNodes.length - 1]); // Add rightmost
            levelNodes = [];
            queue.push(null); // Mark end of next level
        } else {
            levelNodes.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
    
    // Add the last level
    if (levelNodes.length > 0) {
        result.push(levelNodes[levelNodes.length - 1]);
    }
    
    return result;
}
```

## Time and Space Complexity Analysis

**BFS Approach:**
- **Time Complexity:** O(n)
  - We visit each node exactly once
  - Each node is added to and removed from the queue once

- **Space Complexity:** O(w)
  - Where w is the maximum width of the tree
  - In the worst case (complete binary tree), w = n/2, so O(n)

**DFS Approach:**
- **Time Complexity:** O(n)
  - We visit each node exactly once

- **Space Complexity:** O(h)
  - Where h is the height of the tree (recursion stack)
  - In the worst case (skewed tree), h = n, so O(n)
  - In the best case (balanced tree), h = log n, so O(log n)