# Shortest Path in Binary Matrix

## Problem Statement
Given an `n x n` binary matrix `grid`, return the length of the shortest clear path from top-left to bottom-right. If there is no clear path, return -1.

A clear path is a path from top-left to bottom-right such that:
- All the visited cells of the path are 0.
- All the adjacent cells of the path are 8-directionally connected (i.e., they are different and they share an edge or a corner).

The length of a clear path is the number of visited cells of this path.

**LeetCode Problem Number: 1091**

## Sample Input and Output
**Input:** `grid = [[0,0,0],[1,1,0],[1,1,0]]`
**Output:** `4`
**Explanation:** 
```
[0,0,0]
[1,1,0]  → Path: (0,0) → (0,1) → (0,2) → (1,2) → (2,2)
[1,1,0]
```

**Input:** `grid = [[0,1],[1,0]]`
**Output:** `-1`
**Explanation:** There is no clear path.

**Input:** `grid = [[1,0,0],[1,1,0],[1,1,0]]`
**Output:** `-1`
**Explanation:** Starting cell is blocked.

## Algorithm Outline
The most efficient approach uses **BFS (Breadth-First Search)**:

1. Check if start (0,0) or end (n-1,n-1) is blocked, return -1 if so
2. Use BFS with a queue to explore all possible paths level by level
3. For each cell, explore all 8 adjacent directions
4. Mark visited cells to avoid cycles
5. Return path length when destination is reached, or -1 if unreachable

8-directional movement: up, down, left, right, and 4 diagonals

## Step-by-Step Dry Run
Let's trace through `grid = [[0,0,0],[1,1,0],[1,1,0]]`:

```
Initial grid:
[0,0,0]
[1,1,0]
[1,1,0]
```

**BFS Traversal:**

1. **Start:** queue = [(0,0,1)] (row, col, path_length)
   - Mark (0,0) as visited

2. **Level 1:** Process (0,0,1)
   - Check 8 directions from (0,0)
   - Valid moves: (0,1), (1,1) blocked, (1,0) blocked
   - Add (0,1) to queue: queue = [(0,1,2)]

3. **Level 2:** Process (0,1,2)
   - Check 8 directions from (0,1)
   - Valid moves: (0,0) visited, (0,2), (1,0) blocked, (1,1) blocked, (1,2) blocked
   - Add (0,2) to queue: queue = [(0,2,3)]

4. **Level 3:** Process (0,2,3)
   - Check 8 directions from (0,2)
   - Valid moves: (0,1) visited, (1,1) blocked, (1,2)
   - Add (1,2) to queue: queue = [(1,2,4)]

5. **Level 4:** Process (1,2,4)
   - Check 8 directions from (1,2)
   - Valid moves: (0,1) visited, (0,2) visited, (1,1) blocked, (2,1) blocked, (2,2)
   - Add (2,2) to queue: queue = [(2,2,5)]

6. **Level 5:** Process (2,2,5)
   - This is the destination (n-1, n-1)!
   - Return path length: 4

**Final result:** 4

## JavaScript Implementation

```javascript
// Approach 1: BFS with 8-directional movement
function shortestPathBinaryMatrix(grid) {
    const n = grid.length;
    
    // Check if start or end is blocked
    if (grid[0][0] === 1 || grid[n-1][n-1] === 1) {
        return -1;
    }
    
    // Special case: single cell
    if (n === 1) {
        return grid[0][0] === 0 ? 1 : -1;
    }
    
    // 8 directions: up, down, left, right, and 4 diagonals
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    const queue = [[0, 0, 1]]; // [row, col, path_length]
    const visited = Array(n).fill().map(() => Array(n).fill(false));
    visited[0][0] = true;
    
    while (queue.length > 0) {
        const [row, col, pathLength] = queue.shift();
        
        // Check if we reached the destination
        if (row === n - 1 && col === n - 1) {
            return pathLength;
        }
        
        // Explore all 8 directions
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            // Check bounds and validity
            if (newRow >= 0 && newRow < n && 
                newCol >= 0 && newCol < n && 
                grid[newRow][newCol] === 0 && 
                !visited[newRow][newCol]) {
                
                visited[newRow][newCol] = true;
                queue.push([newRow, newCol, pathLength + 1]);
            }
        }
    }
    
    return -1; // No path found
}

// Approach 2: BFS with grid modification (avoids visited array)
function shortestPathBinaryMatrixInPlace(grid) {
    const n = grid.length;
    
    if (grid[0][0] === 1 || grid[n-1][n-1] === 1) {
        return -1;
    }
    
    if (n === 1) return 1;
    
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    const queue = [[0, 0, 1]];
    grid[0][0] = 1; // Mark as visited
    
    while (queue.length > 0) {
        const [row, col, pathLength] = queue.shift();
        
        if (row === n - 1 && col === n - 1) {
            return pathLength;
        }
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < n && 
                newCol >= 0 && newCol < n && 
                grid[newRow][newCol] === 0) {
                
                grid[newRow][newCol] = 1; // Mark as visited
                queue.push([newRow, newCol, pathLength + 1]);
            }
        }
    }
    
    return -1;
}

// Approach 3: A* Search (more efficient for large grids)
function shortestPathBinaryMatrixAStar(grid) {
    const n = grid.length;
    
    if (grid[0][0] === 1 || grid[n-1][n-1] === 1) {
        return -1;
    }
    
    if (n === 1) return 1;
    
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    // Heuristic function: Chebyshev distance (max of row and col differences)
    const heuristic = (row, col) => Math.max(Math.abs(row - (n-1)), Math.abs(col - (n-1)));
    
    // Priority queue implementation with binary heap
    class PriorityQueue {
        constructor() {
            this.heap = [];
        }
        
        push(item) {
            this.heap.push(item);
            this.heapifyUp(this.heap.length - 1);
        }
        
        pop() {
            if (this.heap.length === 0) return null;
            
            const min = this.heap[0];
            const last = this.heap.pop();
            
            if (this.heap.length > 0) {
                this.heap[0] = last;
                this.heapifyDown(0);
            }
            
            return min;
        }
        
        heapifyUp(index) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (parentIndex >= 0 && this.heap[parentIndex][0] > this.heap[index][0]) {
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                this.heapifyUp(parentIndex);
            }
        }
        
        heapifyDown(index) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;
            
            if (leftChild < this.heap.length && this.heap[leftChild][0] < this.heap[smallest][0]) {
                smallest = leftChild;
            }
            
            if (rightChild < this.heap.length && this.heap[rightChild][0] < this.heap[smallest][0]) {
                smallest = rightChild;
            }
            
            if (smallest !== index) {
                [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
                this.heapifyDown(smallest);
            }
        }
        
        isEmpty() {
            return this.heap.length === 0;
        }
    }
    
    const pq = new PriorityQueue();
    const visited = Array(n).fill().map(() => Array(n).fill(false));
    
    // [f_score, g_score, row, col]
    pq.push([1 + heuristic(0, 0), 1, 0, 0]);
    visited[0][0] = true;
    
    while (!pq.isEmpty()) {
        const [f_score, g_score, row, col] = pq.pop();
        
        if (row === n - 1 && col === n - 1) {
            return g_score;
        }
        
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < n && 
                newCol >= 0 && newCol < n && 
                grid[newRow][newCol] === 0 && 
                !visited[newRow][newCol]) {
                
                visited[newRow][newCol] = true;
                const newG = g_score + 1;
                const newF = newG + heuristic(newRow, newCol);
                pq.push([newF, newG, newRow, newCol]);
            }
        }
    }
    
    return -1;
}

// Test the solution
function testShortestPath() {
    // Test case 1: [[0,0,0],[1,1,0],[1,1,0]] -> 4
    console.log(shortestPathBinaryMatrix([[0,0,0],[1,1,0],[1,1,0]])); // 4
    
    // Test case 2: [[0,1],[1,0]] -> -1
    console.log(shortestPathBinaryMatrix([[0,1],[1,0]])); // -1
    
    // Test case 3: [[1,0,0],[1,1,0],[1,1,0]] -> -1
    console.log(shortestPathBinaryMatrix([[1,0,0],[1,1,0],[1,1,0]])); // -1
    
    // Test case 4: [[0]] -> 1
    console.log(shortestPathBinaryMatrix([[0]])); // 1
    
    // Test case 5: [[0,0],[0,0]] -> 3
    console.log(shortestPathBinaryMatrix([[0,0],[0,0]])); // 3
}
```

## Time and Space Complexity Analysis

**BFS Approach:**
- **Time Complexity:** O(n²)
  - In worst case, we visit all cells in the n×n grid
  - Each cell is processed once
  - For each cell, we check 8 directions in constant time

- **Space Complexity:** O(n²)
  - Queue can contain at most O(n²) cells in worst case
  - Visited array takes O(n²) space
  - Grid modification approach reduces space to O(n²) for queue only

**A* Search Approach:**
- **Time Complexity:** O(n² log n²) = O(n² log n)
  - Priority queue operations take O(log n²) time
  - In worst case, we still visit all cells
  - Better average case performance due to heuristic guidance

- **Space Complexity:** O(n²)
  - Priority queue and visited array both take O(n²) space

**Key Insights:**
1. **8-directional movement:** Unlike typical grid problems, we can move diagonally
2. **BFS guarantees shortest path:** First time we reach destination gives minimum steps
3. **Early termination:** Check if start/end is blocked before beginning search
4. **Heuristic optimization:** A* can be faster in practice but has higher constant factors