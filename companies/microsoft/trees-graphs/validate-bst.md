# Validate Binary Search Tree ⭐

## Problem Statement

Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node's key.
- The right subtree of a node contains only nodes with keys greater than the node's key.
- Both the left and right subtrees must also be binary search trees.

**Example 1:**
```
Input: root = [2,1,3]
       2
      / \
     1   3
Output: true
```

**Example 2:**
```
Input: root = [5,1,4,null,null,3,6]
       5
      / \
     1   4
        / \
       3   6
Output: false (3 < 5 but is in right subtree)
```

## Solution Explanation

**Key Insight**: Each node must satisfy range constraints from all ancestor nodes, not just parent.  
**Optimal Approach**: Pass min/max bounds down the recursion to validate each node's range.

## Brute Force Solution

```javascript
function isValidBST(root) {
    if (!root) return true;
    
    // Get inorder traversal (should be sorted for valid BST)
    function inorderTraversal(node) {
        if (!node) return [];
        
        return [
            ...inorderTraversal(node.left),
            node.val,
            ...inorderTraversal(node.right)
        ];
    }
    
    const inorder = inorderTraversal(root);
    
    // Check if inorder traversal is strictly increasing
    for (let i = 1; i < inorder.length; i++) {
        if (inorder[i] <= inorder[i - 1]) {
            return false; // Not strictly increasing
        }
    }
    
    return true;
}
```

**Time Complexity**: O(n) - traverse tree + O(n) to check sorted array  
**Space Complexity**: O(n) - store inorder traversal + O(h) recursion stack

## Optimal Solution

```javascript
function isValidBST(root) {
    // Validate with range constraints
    function validate(node, min, max) {
        if (!node) return true; // Empty tree is valid BST
        
        // Check if current node violates BST property
        if (node.val <= min || node.val >= max) {
            return false;
        }
        
        // Recursively validate left and right subtrees with updated bounds
        return validate(node.left, min, node.val) &&      // Left: max becomes node.val
               validate(node.right, node.val, max);        // Right: min becomes node.val
    }
    
    return validate(root, -Infinity, Infinity);
}

// Alternative: Iterative solution using stack
function isValidBSTIterative(root) {
    if (!root) return true;
    
    const stack = [{node: root, min: -Infinity, max: Infinity}];
    
    while (stack.length > 0) {
        const {node, min, max} = stack.pop();
        
        // Check current node bounds
        if (node.val <= min || node.val >= max) {
            return false;
        }
        
        // Add children with updated bounds
        if (node.right) {
            stack.push({node: node.right, min: node.val, max});
        }
        if (node.left) {
            stack.push({node: node.left, min, max: node.val});
        }
    }
    
    return true;
}

// Inorder approach without extra space
function isValidBSTInorder(root) {
    let prev = -Infinity; // Track previous node in inorder
    
    function inorder(node) {
        if (!node) return true;
        
        // Traverse left subtree
        if (!inorder(node.left)) return false;
        
        // Check current node
        if (node.val <= prev) return false;
        prev = node.val;
        
        // Traverse right subtree
        return inorder(node.right);
    }
    
    return inorder(root);
}
```

**Time Complexity**: O(n) - visit each node once  
**Space Complexity**: O(h) - recursion stack depth  
- Best case (balanced): O(log n)  
- Worst case (skewed): O(n) 