# Flatten Binary Tree to Linked List - LeetCode #114

## Problem Explanation
Given the root of a binary tree, flatten it to a linked list in-place. The "linked list" should use the same TreeNode class where the right child pointer points to the next node and the left child pointer is always null. The linked list should be in the same order as a pre-order traversal of the binary tree.

## Sample Input and Output

**Example 1:**
```
Input: root = [1,2,5,3,4,null,6]
       1
      / \
     2   5
    / \   \
   3   4   6

Output: [1,null,2,null,3,null,4,null,5,null,6]
       1
        \
         2
          \
           3
            \
             4
              \
               5
                \
                 6
```

**Example 2:**
```
Input: root = []
Output: []
```

**Example 3:**
```
Input: root = [0]
Output: [0]
```

## Algorithm Outline
**Approach 1 - Recursive (Post-order):**
1. **Base case**: If node is null, return
2. **Flatten subtrees**: Recursively flatten left and right subtrees
3. **Rearrange**: Move left subtree to right, append original right to end
4. **Clean up**: Set left pointer to null

**Approach 2 - Iterative (Stack-based):**
1. **Use stack**: Push nodes in reverse pre-order (right first, then left)
2. **Connect**: Pop nodes and connect via right pointers
3. **Clean left**: Set all left pointers to null

## Step-by-Step Dry Run
Using recursive approach with input tree `[1,2,5,3,4,null,6]`:

**Post-order traversal:**
1. **Process node 3**: Leaf node, no changes needed
2. **Process node 4**: Leaf node, no changes needed  
3. **Process node 2**: 
   - Left: 3, Right: 4
   - Move left (3) to right position
   - Append original right (4) to end of 3
   - Result: 2 → 3 → 4
4. **Process node 6**: Leaf node, no changes needed
5. **Process node 5**: Right child is 6, no left child
6. **Process node 1**:
   - Left: flattened subtree starting with 2
   - Right: flattened subtree starting with 5
   - Move left subtree to right
   - Append original right to end
   - Final: 1 → 2 → 3 → 4 → 5 → 6

## JavaScript Implementation

```javascript
// Definition for a binary tree node
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}

// Approach 1: Recursive (Post-order)
function flatten(root) {
    if (!root) return;
    
    // Flatten left and right subtrees
    flatten(root.left);
    flatten(root.right);
    
    // Store the right subtree
    const rightSubtree = root.right;
    
    // Move left subtree to right
    root.right = root.left;
    root.left = null;
    
    // Find the end of current right subtree and append original right
    let current = root;
    while (current.right) {
        current = current.right;
    }
    current.right = rightSubtree;
}

// Approach 2: Iterative with Stack
function flattenIterative(root) {
    if (!root) return;
    
    const stack = [root];
    
    while (stack.length > 0) {
        const node = stack.pop();
        
        // Push right first, then left (reverse order for stack)
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
        
        // Connect to next node if stack is not empty
        if (stack.length > 0) {
            node.right = stack[stack.length - 1];
        }
        
        // Clear left pointer
        node.left = null;
    }
}

// Approach 3: Morris-like Traversal (O(1) space)
function flattenMorris(root) {
    let current = root;
    
    while (current) {
        if (current.left) {
            // Find the rightmost node in left subtree
            let predecessor = current.left;
            while (predecessor.right) {
                predecessor = predecessor.right;
            }
            
            // Connect the rightmost node to current's right subtree
            predecessor.right = current.right;
            
            // Move left subtree to right
            current.right = current.left;
            current.left = null;
        }
        
        // Move to next node
        current = current.right;
    }
}

// Approach 4: Using Pre-order Traversal List
function flattenWithPreorder(root) {
    if (!root) return;
    
    const preorderList = [];
    
    function preorderTraversal(node) {
        if (!node) return;
        preorderList.push(node);
        preorderTraversal(node.left);
        preorderTraversal(node.right);
    }
    
    preorderTraversal(root);
    
    // Connect nodes in pre-order sequence
    for (let i = 0; i < preorderList.length - 1; i++) {
        preorderList[i].left = null;
        preorderList[i].right = preorderList[i + 1];
    }
    
    // Last node
    if (preorderList.length > 0) {
        preorderList[preorderList.length - 1].left = null;
        preorderList[preorderList.length - 1].right = null;
    }
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

// Helper function to convert flattened tree to array
function flattenedTreeToArray(root) {
    const result = [];
    let current = root;
    
    while (current) {
        result.push(current.val);
        if (current.left !== null) {
            throw new Error("Left pointer should be null in flattened tree");
        }
        current = current.right;
    }
    
    return result;
}

// Helper function for pre-order traversal verification
function preorderTraversal(root) {
    if (!root) return [];
    
    const result = [];
    const stack = [root];
    
    while (stack.length > 0) {
        const node = stack.pop();
        result.push(node.val);
        
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    
    return result;
}

// Test cases
function testFlatten() {
    console.log("Testing Binary Tree Flattening:");
    
    // Test case 1: [1,2,5,3,4,null,6]
    const tree1 = createTree([1, 2, 5, 3, 4, null, 6]);
    const originalPreorder1 = preorderTraversal(tree1);
    console.log("Original pre-order:", originalPreorder1);
    
    flatten(tree1);
    const flattened1 = flattenedTreeToArray(tree1);
    console.log("Flattened result:", flattened1);
    console.log("Matches pre-order:", JSON.stringify(originalPreorder1) === JSON.stringify(flattened1));
    console.log();
    
    // Test case 2: [1,2,3]
    const tree2 = createTree([1, 2, 3]);
    const originalPreorder2 = preorderTraversal(tree2);
    console.log("Original pre-order:", originalPreorder2);
    
    flattenIterative(tree2);
    const flattened2 = flattenedTreeToArray(tree2);
    console.log("Flattened result (iterative):", flattened2);
    console.log("Matches pre-order:", JSON.stringify(originalPreorder2) === JSON.stringify(flattened2));
    console.log();
    
    // Test case 3: Single node
    const tree3 = createTree([1]);
    const originalPreorder3 = preorderTraversal(tree3);
    console.log("Single node - Original:", originalPreorder3);
    
    flattenMorris(tree3);
    const flattened3 = flattenedTreeToArray(tree3);
    console.log("Single node - Flattened (Morris):", flattened3);
    console.log();
    
    // Test case 4: Empty tree
    console.log("Empty tree test:");
    flatten(null);
    console.log("No crash - passed");
}

// Verify all approaches produce same result
function compareApproaches() {
    const testTree = [1, 2, 5, 3, 4, null, 6];
    
    const tree1 = createTree([...testTree]);
    const tree2 = createTree([...testTree]);
    const tree3 = createTree([...testTree]);
    const tree4 = createTree([...testTree]);
    
    flatten(tree1);
    flattenIterative(tree2);
    flattenMorris(tree3);
    flattenWithPreorder(tree4);
    
    const result1 = flattenedTreeToArray(tree1);
    const result2 = flattenedTreeToArray(tree2);
    const result3 = flattenedTreeToArray(tree3);
    const result4 = flattenedTreeToArray(tree4);
    
    console.log("Recursive result:", result1);
    console.log("Iterative result:", result2);
    console.log("Morris result:", result3);
    console.log("Pre-order result:", result4);
    
    const allSame = JSON.stringify(result1) === JSON.stringify(result2) &&
                    JSON.stringify(result2) === JSON.stringify(result3) &&
                    JSON.stringify(result3) === JSON.stringify(result4);
    
    console.log("All approaches produce same result:", allSame);
}

// testFlatten();
// compareApproaches();
```

## Time and Space Complexity

**Approach 1 - Recursive:**
- **Time Complexity:** O(n) where n = number of nodes
  - Each node is visited once during recursion
  - Finding end of subtree takes O(height) per node, worst case O(n²)
- **Space Complexity:** O(h) where h = height of tree
  - Recursion stack space

**Approach 2 - Iterative with Stack:**
- **Time Complexity:** O(n)
  - Each node is pushed and popped once
- **Space Complexity:** O(h)
  - Stack size bounded by tree height

**Approach 3 - Morris-like (Optimal):**
- **Time Complexity:** O(n)
  - Each node visited at most twice
- **Space Complexity:** O(1)
  - No additional data structures

**Approach 4 - Pre-order List:**
- **Time Complexity:** O(n)
  - One pass for traversal, one pass for connection
- **Space Complexity:** O(n)
  - Stores all nodes in list

**Best Approach:** Morris-like (Approach 3) for optimal O(1) space complexity, or Iterative (Approach 2) for better readability.

**Key Insights:**
1. **Pre-order preservation**: Flattened list maintains pre-order traversal sequence
2. **In-place requirement**: Must modify existing pointers, not create new nodes
3. **Right subtree handling**: Critical to preserve and append correctly
4. **Pointer cleanup**: All left pointers must be set to null

**Common Pitfalls:**
- Forgetting to save right subtree before modification
- Not setting left pointers to null
- Incorrect order when using stack (push right first, then left)