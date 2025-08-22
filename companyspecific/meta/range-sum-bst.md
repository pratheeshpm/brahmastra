# Range Sum of BST

## Problem Statement
Given the root node of a binary search tree and two integers low and high, return the sum of values of all nodes with a value in the inclusive range [low, high].

**LeetCode Problem Number: 938**

## Sample Input and Output
**Input:** `root = [10,5,15,3,7,null,18]`, `low = 7`, `high = 15`
**Output:** `32`
**Explanation:** Nodes 7, 10, and 15 are in the range [7, 15]. 7 + 10 + 15 = 32.

**Input:** `root = [10,5,15,3,7,13,18,1,null,6]`, `low = 6`, `high = 10`
**Output:** `23`
**Explanation:** Nodes 6, 7, and 10 are in the range [6, 10]. 6 + 7 + 10 = 23.

## Algorithm Outline
The most efficient approach leverages **BST properties with DFS**:

1. Use the BST property to prune search space:
   - If current node value < low, only explore right subtree
   - If current node value > high, only explore left subtree
   - If current node is in range [low, high], explore both subtrees and include node value
2. Use recursive DFS to traverse and sum values
3. Base case: null node returns 0

Alternative approaches:
- **In-order traversal**: Traverse all nodes and filter (less efficient)
- **Iterative DFS**: Use stack instead of recursion

## Step-by-Step Dry Run
Let's trace through `root = [10,5,15,3,7,null,18]`, `low = 7`, `high = 15`:

```
       10
     /    \
    5      15
   / \       \
  3   7      18
```

**DFS Traversal:**

1. **Node 10:** value = 10, in range [7,15]
   - Add 10 to sum, explore both subtrees
   - sum = 10

2. **Node 5:** value = 5, less than low (7)
   - Don't add to sum, only explore right subtree
   - sum = 10

3. **Node 7:** value = 7, in range [7,15]
   - Add 7 to sum, explore both subtrees (both null)
   - sum = 10 + 7 = 17

4. **Back to Node 10, explore right subtree**

5. **Node 15:** value = 15, in range [7,15]
   - Add 15 to sum, explore both subtrees
   - sum = 17 + 15 = 32

6. **Node 18:** value = 18, greater than high (15)
   - Don't add to sum, only explore left subtree (null)
   - sum = 32

**Final result:** 32

## JavaScript Implementation

```javascript
// Definition for a binary tree node
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val);
    this.left = (left === undefined ? null : left);
    this.right = (right === undefined ? null : right);
}

// Approach 1: Recursive DFS with BST optimization
function rangeSumBST(root, low, high) {
    if (!root) return 0;
    
    // If current node is less than low, only explore right subtree
    if (root.val < low) {
        return rangeSumBST(root.right, low, high);
    }
    
    // If current node is greater than high, only explore left subtree
    if (root.val > high) {
        return rangeSumBST(root.left, low, high);
    }
    
    // Current node is in range, include it and explore both subtrees
    return root.val + 
           rangeSumBST(root.left, low, high) + 
           rangeSumBST(root.right, low, high);
}

// Approach 2: Cleaner recursive implementation
function rangeSumBSTClean(root, low, high) {
    if (!root) return 0;
    
    let sum = 0;
    
    // Include current node if it's in range
    if (root.val >= low && root.val <= high) {
        sum += root.val;
    }
    
    // Recursively explore subtrees based on BST properties
    if (root.val > low) {
        sum += rangeSumBSTClean(root.left, low, high);
    }
    
    if (root.val < high) {
        sum += rangeSumBSTClean(root.right, low, high);
    }
    
    return sum;
}

// Approach 3: Iterative DFS using stack
function rangeSumBSTIterative(root, low, high) {
    if (!root) return 0;
    
    const stack = [root];
    let sum = 0;
    
    while (stack.length > 0) {
        const node = stack.pop();
        
        if (node.val >= low && node.val <= high) {
            sum += node.val;
        }
        
        // Add children to stack based on BST properties
        if (node.left && node.val > low) {
            stack.push(node.left);
        }
        
        if (node.right && node.val < high) {
            stack.push(node.right);
        }
    }
    
    return sum;
}

// Approach 4: In-order traversal (less efficient but works for all binary trees)
function rangeSumBSTInorder(root, low, high) {
    if (!root) return 0;
    
    let sum = 0;
    
    function inorder(node) {
        if (!node) return;
        
        inorder(node.left);
        
        if (node.val >= low && node.val <= high) {
            sum += node.val;
        }
        
        inorder(node.right);
    }
    
    inorder(root);
    return sum;
}

// Approach 5: BFS using queue
function rangeSumBSTBFS(root, low, high) {
    if (!root) return 0;
    
    const queue = [root];
    let sum = 0;
    
    while (queue.length > 0) {
        const node = queue.shift();
        
        if (node.val >= low && node.val <= high) {
            sum += node.val;
        }
        
        // Add children to queue based on BST properties
        if (node.left && node.val > low) {
            queue.push(node.left);
        }
        
        if (node.right && node.val < high) {
            queue.push(node.right);
        }
    }
    
    return sum;
}

// Helper function to create BST from array
function createBST(arr) {
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
function testRangeSumBST() {
    // Test case 1: [10,5,15,3,7,null,18], low=7, high=15 -> 32
    const tree1 = createBST([10, 5, 15, 3, 7, null, 18]);
    console.log(rangeSumBST(tree1, 7, 15)); // 32
    
    // Test case 2: [10,5,15,3,7,13,18,1,null,6], low=6, high=10 -> 23
    const tree2 = createBST([10, 5, 15, 3, 7, 13, 18, 1, null, 6]);
    console.log(rangeSumBST(tree2, 6, 10)); // 23
    
    // Test case 3: Single node in range
    const tree3 = createBST([10]);
    console.log(rangeSumBST(tree3, 5, 15)); // 10
    
    // Test case 4: Single node out of range
    console.log(rangeSumBST(tree3, 1, 5)); // 0
    
    // Test case 5: Empty tree
    console.log(rangeSumBST(null, 1, 10)); // 0
}

// Advanced: Range sum with frequency count
function rangeSumBSTWithCount(root, low, high) {
    let sum = 0;
    let count = 0;
    
    function dfs(node) {
        if (!node) return;
        
        if (node.val < low) {
            dfs(node.right);
        } else if (node.val > high) {
            dfs(node.left);
        } else {
            // Node is in range
            sum += node.val;
            count++;
            dfs(node.left);
            dfs(node.right);
        }
    }
    
    dfs(root);
    return { sum, count, average: count > 0 ? sum / count : 0 };
}
```

## Time and Space Complexity Analysis

**Optimized BST Approach (Approach 1 & 2):**
- **Time Complexity:** O(n) in worst case, O(log n + k) in average case
  - Where n is total nodes, k is nodes in range
  - Best case (balanced BST): We only visit nodes that could be in range
  - Worst case (skewed BST): We might visit all nodes
- **Space Complexity:** O(h)
  - Where h is the height of the tree (recursion stack)
  - Best case (balanced): O(log n)
  - Worst case (skewed): O(n)

**Iterative Approach:**
- **Time Complexity:** Same as recursive - O(log n + k) average, O(n) worst
- **Space Complexity:** O(h) for the stack

**In-order Traversal Approach:**
- **Time Complexity:** O(n) - visits all nodes regardless of range
- **Space Complexity:** O(h) for recursion stack

**Key Optimizations:**
1. **BST property exploitation:** Skip entire subtrees that can't contain valid nodes
2. **Early pruning:** Don't explore left when node.val <= low, don't explore right when node.val >= high
3. **Logarithmic performance:** In balanced BST, we achieve O(log n + k) time complexity