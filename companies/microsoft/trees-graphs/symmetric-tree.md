# Symmetric Tree ⭐

## Problem Statement

Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).

**Example 1:**
```
Input: root = [1,2,2,3,4,4,3]
         1
        / \
       2   2
      / \ / \
     3  4 4  3
Output: true
```

**Example 2:**
```
Input: root = [1,2,2,null,3,null,3]
         1
        / \
       2   2
        \   \
         3   3
Output: false
```

## Solution Explanation

**Key Insight**: A tree is symmetric if left subtree is mirror reflection of right subtree.  
**Optimal Approach**: Compare left subtree with right subtree using helper function.

## Brute Force Solution

```javascript
function isSymmetric(root) {
    if (!root) return true;
    
    // Convert tree to level-order array
    function treeToLevelArray(node) {
        if (!node) return [];
        
        const result = [];
        const queue = [node];
        
        while (queue.length > 0) {
            const levelSize = queue.length;
            const level = [];
            
            for (let i = 0; i < levelSize; i++) {
                const current = queue.shift();
                if (current) {
                    level.push(current.val);
                    queue.push(current.left);   // Add children (null if none)
                    queue.push(current.right);
                } else {
                    level.push(null);
                }
            }
            result.push(level);
        }
        return result;
    }
    
    const levels = treeToLevelArray(root);
    
    // Check if each level is palindromic
    for (let level of levels) {
        let left = 0, right = level.length - 1;
        while (left < right) {
            if (level[left] !== level[right]) return false;
            left++;
            right--;
        }
    }
    
    return true;
}
```

**Time Complexity**: O(n) - visit all nodes to create levels  
**Space Complexity**: O(n) - store all levels in arrays

## Optimal Solution

```javascript
function isSymmetric(root) {
    if (!root) return true; // Empty tree is symmetric
    
    // Helper function to check if two subtrees are mirrors
    function isMirror(left, right) {
        // Both null - mirrors
        if (!left && !right) return true;
        
        // One null, other not - not mirrors
        if (!left || !right) return false;
        
        // Values must match and subtrees must be mirrors
        return left.val === right.val &&
               isMirror(left.left, right.right) &&   // Outer edges
               isMirror(left.right, right.left);     // Inner edges
    }
    
    return isMirror(root.left, root.right);
}

// Alternative: Iterative solution using queue
function isSymmetricIterative(root) {
    if (!root) return true;
    
    const queue = [root.left, root.right]; // Pairs to compare
    
    while (queue.length > 0) {
        const left = queue.shift();
        const right = queue.shift();
        
        // Both null - continue
        if (!left && !right) continue;
        
        // One null or values different - not symmetric
        if (!left || !right || left.val !== right.val) {
            return false;
        }
        
        // Add mirror pairs to queue
        queue.push(left.left, right.right);   // Outer edges
        queue.push(left.right, right.left);   // Inner edges
    }
    
    return true;
}
```

**Time Complexity**: O(n) - visit each node once  
**Space Complexity**: O(h) - recursion stack depth  
- Best case (balanced): O(log n)  
- Worst case (skewed): O(n) 