# Number of Islands

## Problem Statement
Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

**LeetCode Problem Number: 200**

## Sample Input and Output
**Input:**
```
grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
```
**Output:** `1`
**Explanation:** There is 1 island.

**Input:**
```
grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
```
**Output:** `3`
**Explanation:** There are 3 separate islands.

## Algorithm Outline
The most efficient approach uses **Depth-First Search (DFS)**:

1. Iterate through each cell in the grid
2. When we find a '1' (land), increment the island count
3. Use DFS to mark all connected land cells as visited (change '1' to '0')
4. Continue until all cells are processed

Alternative approaches:
- **Breadth-First Search (BFS)** using a queue
- **Union-Find (Disjoint Set)** for more complex variations

## Step-by-Step Dry Run
Let's trace through the first example:
```
Initial grid:
[
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
```

1. **Position (0,0): '1' found**
   - Island count = 1
   - Start DFS from (0,0)
   - DFS visits: (0,0)→(0,1)→(0,2)→(0,3)→(1,0)→(1,1)→(2,0)→(2,1)→(1,3)
   - All connected '1's are marked as '0'

2. **Continue scanning remaining cells**
   - All remaining cells are either '0' or already visited
   - No more islands found

3. **Final result:** 1 island

Grid after DFS:
```
[
  ["0","0","0","0","0"],
  ["0","0","0","0","0"],
  ["0","0","0","0","0"],
  ["0","0","0","0","0"]
]
```

## JavaScript Implementation

```javascript
// Approach 1: DFS (Recursive)
function numIslands(grid) {
    if (!grid || grid.length === 0 || grid[0].length === 0) {
        return 0;
    }
    
    const rows = grid.length;
    const cols = grid[0].length;
    let islandCount = 0;
    
    function dfs(row, col) {
        // Check bounds and if current cell is water or already visited
        if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] === '0') {
            return;
        }
        
        // Mark current cell as visited by setting it to '0'
        grid[row][col] = '0';
        
        // Explore all 4 directions
        dfs(row - 1, col); // up
        dfs(row + 1, col); // down
        dfs(row, col - 1); // left
        dfs(row, col + 1); // right
    }
    
    // Iterate through each cell in the grid
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] === '1') {
                islandCount++;
                dfs(row, col); // Mark all connected land as visited
            }
        }
    }
    
    return islandCount;
}

// Approach 2: BFS (Iterative)
function numIslandsBFS(grid) {
    if (!grid || grid.length === 0 || grid[0].length === 0) {
        return 0;
    }
    
    const rows = grid.length;
    const cols = grid[0].length;
    let islandCount = 0;
    
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    function bfs(startRow, startCol) {
        const queue = [[startRow, startCol]];
        grid[startRow][startCol] = '0'; // Mark as visited
        
        while (queue.length > 0) {
            const [row, col] = queue.shift();
            
            // Explore all 4 directions
            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                if (newRow >= 0 && newRow < rows && 
                    newCol >= 0 && newCol < cols && 
                    grid[newRow][newCol] === '1') {
                    
                    grid[newRow][newCol] = '0'; // Mark as visited
                    queue.push([newRow, newCol]);
                }
            }
        }
    }
    
    // Iterate through each cell in the grid
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] === '1') {
                islandCount++;
                bfs(row, col); // Mark all connected land as visited
            }
        }
    }
    
    return islandCount;
}

// Approach 3: DFS without modifying original grid
function numIslandsPreserveGrid(grid) {
    if (!grid || grid.length === 0 || grid[0].length === 0) {
        return 0;
    }
    
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array(rows).fill().map(() => Array(cols).fill(false));
    let islandCount = 0;
    
    function dfs(row, col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols || 
            visited[row][col] || grid[row][col] === '0') {
            return;
        }
        
        visited[row][col] = true;
        
        // Explore all 4 directions
        dfs(row - 1, col);
        dfs(row + 1, col);
        dfs(row, col - 1);
        dfs(row, col + 1);
    }
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] === '1' && !visited[row][col]) {
                islandCount++;
                dfs(row, col);
            }
        }
    }
    
    return islandCount;
}

// Approach 4: Union-Find (for learning purposes)
function numIslandsUnionFind(grid) {
    if (!grid || grid.length === 0 || grid[0].length === 0) {
        return 0;
    }
    
    const rows = grid.length;
    const cols = grid[0].length;
    
    class UnionFind {
        constructor(n) {
            this.parent = Array(n).fill().map((_, i) => i);
            this.rank = Array(n).fill(0);
            this.count = 0;
        }
        
        find(x) {
            if (this.parent[x] !== x) {
                this.parent[x] = this.find(this.parent[x]);
            }
            return this.parent[x];
        }
        
        union(x, y) {
            const rootX = this.find(x);
            const rootY = this.find(y);
            
            if (rootX !== rootY) {
                if (this.rank[rootX] > this.rank[rootY]) {
                    this.parent[rootY] = rootX;
                } else if (this.rank[rootX] < this.rank[rootY]) {
                    this.parent[rootX] = rootY;
                } else {
                    this.parent[rootY] = rootX;
                    this.rank[rootX]++;
                }
                this.count--;
            }
        }
    }
    
    const uf = new UnionFind(rows * cols);
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    // Count initial land cells
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] === '1') {
                uf.count++;
            }
        }
    }
    
    // Connect adjacent land cells
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] === '1') {
                for (const [dr, dc] of directions) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    
                    if (newRow >= 0 && newRow < rows && 
                        newCol >= 0 && newCol < cols && 
                        grid[newRow][newCol] === '1') {
                        
                        uf.union(row * cols + col, newRow * cols + newCol);
                    }
                }
            }
        }
    }
    
    return uf.count;
}
```

## Time and Space Complexity Analysis

**DFS Approach:**
- **Time Complexity:** O(m × n)
  - We visit each cell at most once
  - DFS for each island visits all connected cells
- **Space Complexity:** O(m × n)
  - Worst case: recursion stack depth when all cells are land forming one big island
  - Grid modification approach: O(1) extra space (not counting recursion stack)

**BFS Approach:**
- **Time Complexity:** O(m × n)
  - Each cell is visited at most once
- **Space Complexity:** O(min(m, n))
  - Queue size is bounded by the perimeter of the island
  - In worst case, queue can hold O(min(m, n)) elements

**Union-Find Approach:**
- **Time Complexity:** O(m × n × α(m × n))
  - Where α is the inverse Ackermann function (practically constant)
- **Space Complexity:** O(m × n)
  - Union-Find data structure stores parent and rank arrays