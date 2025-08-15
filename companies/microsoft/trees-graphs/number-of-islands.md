# Number of Islands ⭐

## Problem Statement

Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

**Example 1:**
```
Input: grid = [
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
]
Output: 2
```

**Example 2:**
```
Input: grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
Output: 3
```

## Solution Explanation

**Key Insight**: Use DFS/BFS to mark connected land cells as visited, count number of components.  
**Optimal Approach**: DFS from each unvisited '1' cell, marking entire island as visited.

## Brute Force Solution

```javascript
function numIslands(grid) {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    let islands = 0;
    
    // Create visited matrix
    const visited = Array(rows).fill().map(() => Array(cols).fill(false));
    
    // BFS to explore all connected land cells
    function bfs(startRow, startCol) {
        const queue = [[startRow, startCol]];
        visited[startRow][startCol] = true;
        
        const directions = [[0,1], [1,0], [0,-1], [-1,0]]; // right, down, left, up
        
        while (queue.length > 0) {
            const [row, col] = queue.shift();
            
            // Explore all 4 directions
            for (let [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                
                // Check bounds and conditions
                if (newRow >= 0 && newRow < rows && 
                    newCol >= 0 && newCol < cols &&
                    grid[newRow][newCol] === '1' && 
                    !visited[newRow][newCol]) {
                    
                    visited[newRow][newCol] = true;
                    queue.push([newRow, newCol]);
                }
            }
        }
    }
    
    // Find all islands
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1' && !visited[r][c]) {
                islands++;
                bfs(r, c); // Mark entire island as visited
            }
        }
    }
    
    return islands;
}
```

**Time Complexity**: O(m × n) - visit each cell once  
**Space Complexity**: O(m × n) - visited matrix + O(min(m,n)) queue space

## Optimal Solution

```javascript
function numIslands(grid) {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    let islands = 0;
    
    // DFS to mark connected land as visited
    function dfs(row, col) {
        // Check bounds and if cell is water or already visited
        if (row < 0 || row >= rows || col < 0 || col >= cols || grid[row][col] === '0') {
            return;
        }
        
        // Mark current cell as visited (convert to water)
        grid[row][col] = '0';
        
        // Explore all 4 directions
        dfs(row + 1, col); // down
        dfs(row - 1, col); // up  
        dfs(row, col + 1); // right
        dfs(row, col - 1); // left
    }
    
    // Scan grid for islands
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1') {
                islands++;
                dfs(r, c); // Mark entire island as visited
            }
        }
    }
    
    return islands;
}

// Alternative: Without modifying input grid
function numIslandsPreserveGrid(grid) {
    if (!grid || grid.length === 0) return 0;
    
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = new Set(); // Use set for visited cells
    let islands = 0;
    
    function dfs(row, col) {
        const key = `${row},${col}`;
        
        if (row < 0 || row >= rows || col < 0 || col >= cols || 
            grid[row][col] === '0' || visited.has(key)) {
            return;
        }
        
        visited.add(key);
        
        // Explore neighbors
        dfs(row + 1, col);
        dfs(row - 1, col);
        dfs(row, col + 1);
        dfs(row, col - 1);
    }
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1' && !visited.has(`${r},${c}`)) {
                islands++;
                dfs(r, c);
            }
        }
    }
    
    return islands;
}
```

**Time Complexity**: O(m × n) - visit each cell at most once  
**Space Complexity**: O(min(m,n)) - maximum recursion depth in worst case  
- Best case: O(1) - no islands  
- Worst case: O(m × n) - single island covering entire grid 