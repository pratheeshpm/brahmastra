# Clone Graph

## Problem Statement
Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.

Each node in the graph contains a value (int) and a list (List[Node]) of its neighbors.

**LeetCode Problem Number: 133**

## Sample Input and Output
**Input:** `adjList = [[2,4],[1,3],[2,4],[1,3]]`
**Output:** `[[2,4],[1,3],[2,4],[1,3]]`
**Explanation:** There are 4 nodes in the graph.
- 1st node (val = 1)'s neighbors are 2nd node (val = 2) and 4th node (val = 4).
- 2nd node (val = 2)'s neighbors are 1st node (val = 1) and 3rd node (val = 3).
- 3rd node (val = 3)'s neighbors are 2nd node (val = 2) and 4th node (val = 4).
- 4th node (val = 4)'s neighbors are 1st node (val = 1) and 3rd node (val = 3).

**Input:** `adjList = [[]]`
**Output:** `[[]]`
**Explanation:** Note that the input contains one empty list. The graph consists of only one node with val = 1 and it does not have any neighbors.

**Input:** `adjList = []`
**Output:** `[]`
**Explanation:** This is an empty graph, it does not have any nodes.

## Algorithm Outline
The most efficient approach uses **DFS with HashMap**:

1. Use a hash map to store mapping from original nodes to cloned nodes
2. For each node, check if it's already cloned (in hash map)
3. If not cloned, create a new node with the same value
4. Recursively clone all neighbors
5. Add cloned neighbors to the cloned node's neighbor list

Alternative approaches:
- **BFS with HashMap**: Use queue instead of recursion
- **DFS with visited set**: Track visited nodes separately

## Step-by-Step Dry Run
Let's trace through a simple graph with nodes [1] -> [2] -> [1]:

```
1 ---- 2
```

**Using DFS approach:**

1. **Start with node 1:**
   - map = {}, node 1 not in map
   - Create clone1 with val = 1
   - map = {1: clone1}
   - Process neighbors: [node 2]

2. **Process neighbor node 2:**
   - map = {1: clone1}, node 2 not in map
   - Create clone2 with val = 2
   - map = {1: clone1, 2: clone2}
   - Process neighbors: [node 1]

3. **Process neighbor node 1 (again):**
   - map = {1: clone1, 2: clone2}, node 1 already in map
   - Return existing clone1
   - Add clone1 to clone2's neighbors

4. **Back to node 2:**
   - clone2.neighbors = [clone1]
   - Return clone2
   - Add clone2 to clone1's neighbors

5. **Back to node 1:**
   - clone1.neighbors = [clone2]
   - Return clone1

**Final result:** Cloned graph with same structure

## JavaScript Implementation

```javascript
// Definition for a Node
function Node(val, neighbors) {
    this.val = val === undefined ? 0 : val;
    this.neighbors = neighbors === undefined ? [] : neighbors;
}

// Approach 1: DFS with HashMap (Recursive)
function cloneGraph(node) {
    if (!node) return null;
    
    const cloneMap = new Map();
    
    function dfs(originalNode) {
        // If node is already cloned, return the clone
        if (cloneMap.has(originalNode)) {
            return cloneMap.get(originalNode);
        }
        
        // Create a new clone node
        const cloneNode = new Node(originalNode.val);
        cloneMap.set(originalNode, cloneNode);
        
        // Clone all neighbors recursively
        for (const neighbor of originalNode.neighbors) {
            cloneNode.neighbors.push(dfs(neighbor));
        }
        
        return cloneNode;
    }
    
    return dfs(node);
}

// Approach 2: BFS with HashMap (Iterative)
function cloneGraphBFS(node) {
    if (!node) return null;
    
    const cloneMap = new Map();
    const queue = [node];
    
    // Create the clone of the starting node
    cloneMap.set(node, new Node(node.val));
    
    while (queue.length > 0) {
        const currentNode = queue.shift();
        
        // Process all neighbors
        for (const neighbor of currentNode.neighbors) {
            if (!cloneMap.has(neighbor)) {
                // Clone the neighbor if not already cloned
                cloneMap.set(neighbor, new Node(neighbor.val));
                queue.push(neighbor);
            }
            
            // Add the cloned neighbor to current cloned node's neighbors
            cloneMap.get(currentNode).neighbors.push(cloneMap.get(neighbor));
        }
    }
    
    return cloneMap.get(node);
}

// Approach 3: DFS with cleaner HashMap usage
function cloneGraphClean(node) {
    if (!node) return null;
    
    const visited = new Map();
    
    function clone(node) {
        if (visited.has(node)) {
            return visited.get(node);
        }
        
        const newNode = new Node(node.val);
        visited.set(node, newNode);
        
        newNode.neighbors = node.neighbors.map(neighbor => clone(neighbor));
        
        return newNode;
    }
    
    return clone(node);
}

// Approach 4: Two-pass approach (create nodes first, then connect)
function cloneGraphTwoPass(node) {
    if (!node) return null;
    
    const cloneMap = new Map();
    const visited = new Set();
    
    // First pass: Create all nodes
    function createNodes(node) {
        if (visited.has(node)) return;
        
        visited.add(node);
        cloneMap.set(node, new Node(node.val));
        
        for (const neighbor of node.neighbors) {
            createNodes(neighbor);
        }
    }
    
    // Second pass: Connect the neighbors
    function connectNeighbors(node) {
        const clonedNode = cloneMap.get(node);
        
        for (const neighbor of node.neighbors) {
            clonedNode.neighbors.push(cloneMap.get(neighbor));
        }
        
        for (const neighbor of node.neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                connectNeighbors(neighbor);
            }
        }
    }
    
    createNodes(node);
    visited.clear(); // Reset for second pass
    visited.add(node);
    connectNeighbors(node);
    
    return cloneMap.get(node);
}

// Helper function to create graph from adjacency list (for testing)
function createGraphFromAdjList(adjList) {
    if (!adjList || adjList.length === 0) return null;
    
    const nodes = [];
    
    // Create all nodes
    for (let i = 0; i < adjList.length; i++) {
        nodes.push(new Node(i + 1));
    }
    
    // Connect neighbors
    for (let i = 0; i < adjList.length; i++) {
        for (const neighborVal of adjList[i]) {
            nodes[i].neighbors.push(nodes[neighborVal - 1]);
        }
    }
    
    return nodes[0];
}

// Helper function to convert graph to adjacency list (for testing)
function graphToAdjList(node) {
    if (!node) return [];
    
    const visited = new Set();
    const adjList = [];
    const nodeMap = new Map();
    let nodeCount = 0;
    
    // First pass: assign indices to nodes
    function assignIndices(node) {
        if (visited.has(node)) return;
        
        visited.add(node);
        nodeMap.set(node, nodeCount++);
        
        for (const neighbor of node.neighbors) {
            assignIndices(neighbor);
        }
    }
    
    // Second pass: build adjacency list
    function buildAdjList(node) {
        const nodeIndex = nodeMap.get(node);
        
        if (adjList[nodeIndex]) return; // Already processed
        
        adjList[nodeIndex] = [];
        for (const neighbor of node.neighbors) {
            adjList[nodeIndex].push(nodeMap.get(neighbor) + 1);
        }
        
        for (const neighbor of node.neighbors) {
            buildAdjList(neighbor);
        }
    }
    
    assignIndices(node);
    buildAdjList(node);
    
    return adjList;
}

// Test the solution
function testCloneGraph() {
    // Test case 1: [[2,4],[1,3],[2,4],[1,3]]
    const adjList1 = [[2, 4], [1, 3], [2, 4], [1, 3]];
    const graph1 = createGraphFromAdjList(adjList1);
    const cloned1 = cloneGraph(graph1);
    console.log(graphToAdjList(cloned1)); // Should match input
    
    // Test case 2: [[]]
    const adjList2 = [[]];
    const graph2 = createGraphFromAdjList(adjList2);
    const cloned2 = cloneGraph(graph2);
    console.log(graphToAdjList(cloned2)); // [[]]
    
    // Test case 3: []
    const cloned3 = cloneGraph(null);
    console.log(cloned3); // null
}
```

## Time and Space Complexity Analysis

**DFS Approach:**
- **Time Complexity:** O(V + E)
  - Where V is the number of vertices (nodes) and E is the number of edges
  - We visit each node exactly once and traverse each edge exactly once
- **Space Complexity:** O(V)
  - HashMap stores V entries (one for each node)
  - Recursion stack can go up to V deep in worst case
  - Total space: O(V) + O(V) = O(V)

**BFS Approach:**
- **Time Complexity:** O(V + E)
  - Same as DFS - visit each node once, traverse each edge once
- **Space Complexity:** O(V)
  - HashMap stores V entries
  - Queue can contain up to V nodes in worst case
  - Total space: O(V) + O(V) = O(V)

**Key Points:**
1. **HashMap is essential:** Prevents infinite loops and ensures each node is cloned exactly once
2. **Deep copy required:** We must create entirely new nodes, not just copy references
3. **Preserve relationships:** The cloned graph must have the same connectivity as original