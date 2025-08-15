# Binary Tree Zigzag Level Order Traversal ⭐

## Problem Statement

Given the root of a binary tree, return the zigzag level order traversal of its nodes' values. (i.e., from left to right, then right to left for the next level and alternate between).

**Example:**
```
Input: root = [3,9,20,null,null,15,7]
       3
      / \
     9  20
       /  \
      15   7
Output: [[3],[20,9],[15,7]]
```

**Example 2:**
```
Input: root = [1,2,3,4,null,null,5]
       1
      / \
     2   3
    /     \
   4       5
Output: [[1],[3,2],[4,5]]
```

## Solution Explanation

**Key Insight**: Use level order traversal but reverse every alternate level (even indices).  
**Optimal Approach**: BFS with level tracking and conditional reversal of level arrays.

## Brute Force Solution

```javascript
function zigzagLevelOrder(root) {
    if (!root) return [];
    
    // Get normal level order traversal first
    const levelOrder = [];
    const queue = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            currentLevel.push(node.val);
            
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        levelOrder.push(currentLevel);
    }
    
    // Reverse every alternate level
    const result = [];
    for (let i = 0; i < levelOrder.length; i++) {
        if (i % 2 === 0) {
            result.push(levelOrder[i]); // Left to right
        } else {
            result.push(levelOrder[i].reverse()); // Right to left
        }
    }
    
    return result;
}
```

**Time Complexity**: O(n) - traverse tree + O(n) to reverse alternate levels  
**Space Complexity**: O(n) - store complete level order + queue space

## Optimal Solution

```javascript
function zigzagLevelOrder(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root];
    let leftToRight = true; // Direction flag
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel = [];
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            
            // Add to front or back based on direction
            if (leftToRight) {
                currentLevel.push(node.val); // Normal order
            } else {
                currentLevel.unshift(node.val); // Reverse order
            }
            
            // Add children for next level
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        
        result.push(currentLevel);
        leftToRight = !leftToRight; // Toggle direction
    }
    
    return result;
}

// Alternative: Using deque (double-ended queue) simulation
function zigzagLevelOrderDeque(root) {
    if (!root) return [];
    
    const result = [];
    let currentLevel = [root];
    let leftToRight = true;
    
    while (currentLevel.length > 0) {
        const nextLevel = [];
        const levelValues = [];
        
        for (let node of currentLevel) {
            // Add value based on direction
            if (leftToRight) {
                levelValues.push(node.val);
            } else {
                levelValues.unshift(node.val);
            }
            
            // Collect children for next level
            if (node.left) nextLevel.push(node.left);
            if (node.right) nextLevel.push(node.right);
        }
        
        result.push(levelValues);
        currentLevel = nextLevel;
        leftToRight = !leftToRight;
    }
    
    return result;
}
```

**Time Complexity**: O(n) - visit each node once, no extra reversal needed  
**Space Complexity**: O(w) - queue stores maximum width of tree  
- Using `unshift()` is O(1) amortized for small arrays  
- Best case (balanced): O(log n) levels  
- Worst case: O(n) for skewed tree 