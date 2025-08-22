# Remove Invalid Parentheses

## Problem Statement
Given a string `s` that contains parentheses and letters, remove the minimum number of invalid parentheses to make the input string valid.

Return a list of unique strings that are valid with the minimum removals. You may return the answer in any order.

**LeetCode Problem Number: 301**

## Sample Input and Output
**Input:** `s = "()())()"`
**Output:** `["()()()", "(())()"]`
**Explanation:** Both strings have 1 removal and are valid.

**Input:** `s = "(v)())()"`
**Output:** `["(v)()()", "(v())()"]`

**Input:** `s = ")("`
**Output:** `[""]`
**Explanation:** We need to remove both parentheses.

## Algorithm Outline
The most effective approach uses **BFS (Breadth-First Search)**:

1. First, count the minimum number of left and right parentheses to remove
2. Use BFS to explore all possible removal combinations
3. For each string, try removing each parenthesis one by one
4. Check if the resulting string is valid
5. Use a set to avoid duplicate results
6. Return the first level where valid strings are found (minimum removals)

Alternative approach: **DFS with backtracking** to enumerate all possibilities.

## Step-by-Step Dry Run
Let's trace through `s = "()())"`:

1. **Count invalid parentheses:**
   - Scan left to right: balance = 0
   - '(' → balance = 1, '(' → balance = 2, ')' → balance = 1, ')' → balance = 0, ')' → balance = -1
   - rightToRemove = 1 (one extra ')')
   - leftToRemove = 0

2. **BFS Level 0:** Queue = ["()())"]

3. **BFS Level 1:** Remove 1 character
   - Remove '(' at index 0: ")())" → Invalid (starts with ')')
   - Remove '(' at index 1: "())" → Invalid (extra ')')
   - Remove ')' at index 2: "()()" → Valid! ✓
   - Remove ')' at index 3: "(())" → Valid! ✓  
   - Remove ')' at index 4: "(())" → Duplicate, skip

4. **Found valid strings at level 1:** ["()()", "(())"]

**Result:** `["()()", "(())"]` (minimum 1 removal)

## JavaScript Implementation

```javascript
// Approach 1: BFS (Level-order exploration)
function removeInvalidParentheses(s) {
    const result = [];
    const visited = new Set();
    const queue = [s];
    visited.add(s);
    
    let found = false;
    
    while (queue.length > 0 && !found) {
        const levelSize = queue.length;
        
        // Process all strings at current level
        for (let i = 0; i < levelSize; i++) {
            const current = queue.shift();
            
            if (isValid(current)) {
                result.push(current);
                found = true;
            }
            
            // Only generate next level if no valid strings found yet
            if (!found) {
                // Try removing each character
                for (let j = 0; j < current.length; j++) {
                    const char = current[j];
                    
                    // Only remove parentheses
                    if (char === '(' || char === ')') {
                        const next = current.slice(0, j) + current.slice(j + 1);
                        
                        if (!visited.has(next)) {
                            visited.add(next);
                            queue.push(next);
                        }
                    }
                }
            }
        }
    }
    
    return result.length > 0 ? result : [""];
}

// Helper function to check if parentheses are valid
function isValid(s) {
    let count = 0;
    
    for (const char of s) {
        if (char === '(') {
            count++;
        } else if (char === ')') {
            count--;
            if (count < 0) return false;
        }
    }
    
    return count === 0;
}

// Approach 2: DFS with pruning (more efficient)
function removeInvalidParenthesesDFS(s) {
    const result = [];
    
    // Count minimum removals needed
    const [leftRemove, rightRemove] = countInvalidParentheses(s);
    
    function dfs(index, leftCount, rightCount, leftRem, rightRem, current) {
        // Base case: processed all characters
        if (index === s.length) {
            if (leftRem === 0 && rightRem === 0) {
                result.push(current);
            }
            return;
        }
        
        const char = s[index];
        
        // Option 1: Remove current character (if it's a parenthesis to be removed)
        if ((char === '(' && leftRem > 0) || (char === ')' && rightRem > 0)) {
            const newLeftRem = char === '(' ? leftRem - 1 : leftRem;
            const newRightRem = char === ')' ? rightRem - 1 : rightRem;
            dfs(index + 1, leftCount, rightCount, newLeftRem, newRightRem, current);
        }
        
        // Option 2: Keep current character
        if (char !== '(' && char !== ')') {
            // Non-parenthesis character: always keep
            dfs(index + 1, leftCount, rightCount, leftRem, rightRem, current + char);
        } else if (char === '(') {
            // Left parenthesis: always safe to keep
            dfs(index + 1, leftCount + 1, rightCount, leftRem, rightRem, current + char);
        } else if (char === ')' && leftCount > rightCount) {
            // Right parenthesis: only keep if we have unmatched left parentheses
            dfs(index + 1, leftCount, rightCount + 1, leftRem, rightRem, current + char);
        }
    }
    
    dfs(0, 0, 0, leftRemove, rightRemove, "");
    return result.length > 0 ? [...new Set(result)] : [""];
}

function countInvalidParentheses(s) {
    let leftRemove = 0;
    let rightRemove = 0;
    
    // Count extra left parentheses
    for (const char of s) {
        if (char === '(') {
            leftRemove++;
        } else if (char === ')') {
            if (leftRemove > 0) {
                leftRemove--; // Match with previous '('
            } else {
                rightRemove++; // Extra ')' that needs to be removed
            }
        }
    }
    
    return [leftRemove, rightRemove];
}

// Approach 3: Optimized BFS with early termination
function removeInvalidParenthesesOptimized(s) {
    if (isValid(s)) return [s];
    
    const result = [];
    const queue = [s];
    const visited = new Set([s]);
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevelResults = [];
        
        // Process current level
        for (let i = 0; i < levelSize; i++) {
            const current = queue.shift();
            
            // Try removing each parenthesis
            for (let j = 0; j < current.length; j++) {
                if (current[j] === '(' || current[j] === ')') {
                    const next = current.substring(0, j) + current.substring(j + 1);
                    
                    if (isValid(next)) {
                        currentLevelResults.push(next);
                    } else if (!visited.has(next)) {
                        visited.add(next);
                        queue.push(next);
                    }
                }
            }
        }
        
        // If we found valid results at this level, return them
        if (currentLevelResults.length > 0) {
            return [...new Set(currentLevelResults)];
        }
    }
    
    return [""];
}

// Approach 4: Two-pass approach (left-to-right, then right-to-left)
function removeInvalidParenthesesTwoPass(s) {
    function removeInvalidParenthesesOneDirection(s, open, close) {
        const result = [];
        
        function dfs(str, index, openCount, closeCount, openRem, closeRem, current) {
            if (index === str.length) {
                if (openRem === 0 && closeRem === 0) {
                    // Reverse the string if we processed right-to-left
                    const finalStr = open === '(' ? current : current.split('').reverse().join('');
                    result.push(finalStr);
                }
                return;
            }
            
            const char = str[index];
            
            // Option 1: Remove current character
            if ((char === open && openRem > 0) || (char === close && closeRem > 0)) {
                const newOpenRem = char === open ? openRem - 1 : openRem;
                const newCloseRem = char === close ? closeRem - 1 : closeRem;
                dfs(str, index + 1, openCount, closeCount, newOpenRem, newCloseRem, current);
            }
            
            // Option 2: Keep current character
            if (char !== open && char !== close) {
                dfs(str, index + 1, openCount, closeCount, openRem, closeRem, current + char);
            } else if (char === open) {
                dfs(str, index + 1, openCount + 1, closeCount, openRem, closeRem, current + char);
            } else if (char === close && openCount > closeCount) {
                dfs(str, index + 1, openCount, closeCount + 1, openRem, closeRem, current + char);
            }
        }
        
        const [openRem, closeRem] = countInvalid(s, open, close);
        dfs(s, 0, 0, 0, openRem, closeRem, "");
        return result;
    }
    
    function countInvalid(s, open, close) {
        let openRem = 0, closeRem = 0;
        for (const char of s) {
            if (char === open) {
                openRem++;
            } else if (char === close) {
                if (openRem > 0) openRem--;
                else closeRem++;
            }
        }
        return [openRem, closeRem];
    }
    
    const result = removeInvalidParenthesesOneDirection(s, '(', ')');
    return [...new Set(result)];
}

// Test the solution
function testRemoveInvalidParentheses() {
    const testCases = [
        "()())",
        "(v)())",
        ")(",
        "(((",
        ")))",
        "()",
        "",
        "a",
        "()()())",
        "(()",
        "())"
    ];
    
    console.log("Testing removeInvalidParentheses:");
    testCases.forEach((test, index) => {
        console.log(`\nTest ${index + 1}: "${test}"`);
        
        const result1 = removeInvalidParentheses(test);
        const result2 = removeInvalidParenthesesDFS(test);
        
        console.log(`BFS Result: [${result1.map(s => `"${s}"`).join(', ')}]`);
        console.log(`DFS Result: [${result2.map(s => `"${s}"`).join(', ')}]`);
        
        // Verify all results are valid
        const allValid1 = result1.every(s => isValid(s));
        const allValid2 = result2.every(s => isValid(s));
        
        console.log(`Validation: BFS=${allValid1}, DFS=${allValid2}`);
    });
    
    // Performance comparison
    const complexString = "((((((((";
    
    console.log("\nPerformance comparison:");
    console.time("BFS Approach");
    removeInvalidParentheses(complexString);
    console.timeEnd("BFS Approach");
    
    console.time("DFS Approach");
    removeInvalidParenthesesDFS(complexString);
    console.timeEnd("DFS Approach");
}

// Advanced: Handle multiple types of brackets
function removeInvalidBrackets(s, brackets = ['()', '[]', '{}']) {
    // This would be a more complex version handling multiple bracket types
    // Implementation would involve tracking multiple bracket types simultaneously
    // Left as an exercise for advanced scenarios
}
```

## Time and Space Complexity Analysis

**BFS Approach:**
- **Time Complexity:** O(2^n)
  - In worst case, we might need to try removing every parenthesis
  - Each level can have up to C(n,k) strings where k is removal count
  - Total across all levels can be exponential

- **Space Complexity:** O(2^n)
  - Queue and visited set can store exponential number of strings
  - Each string takes O(n) space

**DFS with Pruning:**
- **Time Complexity:** O(2^n)
  - Same worst-case as BFS, but pruning reduces practical runtime
  - Early termination when invalid parentheses counts are exceeded

- **Space Complexity:** O(n)
  - Recursion depth is at most O(n)
  - No additional storage for intermediate results during search

**Optimized BFS:**
- **Time Complexity:** O(2^n)
  - Same asymptotic complexity but with early termination
  - Processes level by level and stops at first valid level

- **Space Complexity:** O(2^n)
  - Similar to basic BFS but with level-wise processing

**Key Insights:**
1. **Minimum removals:** BFS naturally finds minimum by exploring level by level
2. **Pruning is crucial:** Count invalid parentheses first to avoid unnecessary exploration
3. **Deduplication needed:** Multiple removal sequences can lead to same result
4. **Validation function:** Simple O(n) check for balanced parentheses
5. **Level-wise exploration:** BFS ensures we find solutions with minimum removals first