# Validate Binary Search Tree

## Problem Statement
Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node's key.
- The right subtree of a node contains only nodes with keys greater than the node's key.
- Both the left and right subtrees must also be binary search trees.

**LeetCode Problem Number: 98**

## Sample Input and Output
**Input:** `root = [2,1,3]`
**Output:** `true`
**Explanation:**
```
    2
   / \
  1   3
```
This is a valid BST.

**Input:** `root = [5,1,4,null,null,3,6]`
**Output:** `false`
**Explanation:**
```
    5
   / \
  1   4
     / \
    3   6
```
The root node's value is 5 but its right child's value is 4, which violates the BST property.

**Input:** `root = [2,2,2]`
**Output:** `false`
**Explanation:** BST cannot have duplicate values.

## Algorithm Outline
The most efficient approach uses **recursive traversal with bounds**:

1. For each node, maintain the valid range [min, max] of values
2. Root node can have any value, so initial range is [-∞, +∞]
3. For left child: range becomes [min, node.val)
4. For right child: range becomes (node.val, max]
5. If any node violates its range, return false

Alternative approaches:
- **In-order traversal**: Should produce sorted sequence
- **Recursive with previous value tracking**

## Step-by-Step Dry Run
Let's trace through `root = [5,1,4,null,null,3,6]`:

```
    5
   / \
  1   4
     / \
    3   6
```

**Using bounds approach:**

1. **Node 5:** Range [-∞, +∞] → Valid
   - Left child range: [-∞, 5)
   - Right child range: (5, +∞]

2. **Node 1:** Range [-∞, 5) → Valid (1 < 5)
   - No children to check

3. **Node 4:** Range (5, +∞] → Invalid! (4 ≤ 5)
   - Return false

**Result:** false (Node 4 violates BST property)

Let's also trace a valid BST `root = [2,1,3]`:

1. **Node 2:** Range [-∞, +∞] → Valid
2. **Node 1:** Range [-∞, 2) → Valid (1 < 2)
3. **Node 3:** Range (2, +∞] → Valid (3 > 2)

**Result:** true

## JavaScript Implementation

```javascript
// Definition for a binary tree node
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}

// Approach 1: Recursive with bounds (Most Efficient)
function isValidBST(root) {
    function validate(node, min, max) {
        // Empty tree is valid BST
        if (!node) return true;
        
        // Check if current node violates BST property
        if (node.val <= min || node.val >= max) {
            return false;
        }
        
        // Recursively validate left and right subtrees with updated bounds
        return validate(node.left, min, node.val) && 
               validate(node.right, node.val, max);
    }
    
    return validate(root, -Infinity, Infinity);
}

// Approach 2: In-order traversal (should produce sorted sequence)
function isValidBSTInorder(root) {
    const values = [];
    
    function inorder(node) {
        if (!node) return;
        
        inorder(node.left);
        values.push(node.val);
        inorder(node.right);
    }
    
    inorder(root);
    
    // Check if the sequence is strictly increasing
    for (let i = 1; i < values.length; i++) {
        if (values[i] <= values[i - 1]) {
            return false;
        }
    }
    
    return true;
}

// Approach 3: In-order with previous value tracking (Space Optimized)
function isValidBSTOptimized(root) {
    let prev = -Infinity;
    
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

// Approach 4: Iterative in-order traversal
function isValidBSTIterative(root) {
    const stack = [];
    let current = root;
    let prev = -Infinity;
    
    while (current || stack.length > 0) {
        // Go to leftmost node
        while (current) {
            stack.push(current);
            current = current.left;
        }
        
        // Process current node
        current = stack.pop();
        
        // Check BST property
        if (current.val <= prev) {
            return false;
        }
        prev = current.val;
        
        // Move to right subtree
        current = current.right;
    }
    
    return true;
}
```

## Time and Space Complexity Analysis

**Approach 1 (Recursive with bounds):**
- **Time Complexity:** O(n)
  - We visit each node exactly once
- **Space Complexity:** O(h)
  - Where h is the height of the tree (recursion stack)
  - Best case (balanced): O(log n)
  - Worst case (skewed): O(n)

**Approach 2 (In-order traversal with array):**
- **Time Complexity:** O(n)
  - Visit each node once + scan array once
- **Space Complexity:** O(n)
  - Store all node values + recursion stack

**Approach 3 (In-order with previous tracking):**
- **Time Complexity:** O(n)
  - Visit each node exactly once
- **Space Complexity:** O(h)
  - Only recursion stack space needed
  - Best case: O(log n), Worst case: O(n)

**Approach 4 (Iterative in-order):**
- **Time Complexity:** O(n)
  - Visit each node exactly once
- **Space Complexity:** O(h)
  - Stack space for iterative traversal
  - Best case: O(log n), Worst case: O(n)