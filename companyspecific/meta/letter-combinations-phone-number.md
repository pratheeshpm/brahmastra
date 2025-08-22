# Letter Combinations of a Phone Number - LeetCode #17

## Problem Explanation
Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order. The mapping of digits to letters is the same as on telephone buttons (like old mobile phones).

**Digit Mappings:**
- 2: ABC, 3: DEF, 4: GHI, 5: JKL
- 6: MNO, 7: PQRS, 8: TUV, 9: WXYZ

## Sample Input and Output

**Example 1:**
```
Input: digits = "23"
Output: ["ad","ae","af","bd","be","bf","cd","ce","cf"]
Explanation: 
- 2 → ABC, 3 → DEF
- All combinations: A×D, A×E, A×F, B×D, B×E, B×F, C×D, C×E, C×F
```

**Example 2:**
```
Input: digits = ""
Output: []
```

**Example 3:**
```
Input: digits = "2"
Output: ["a","b","c"]
```

## Algorithm Outline
**Approach 1 - Backtracking:**
1. **Setup mapping**: Create digit to letters mapping
2. **Base case**: If no more digits, add current combination to result
3. **Choose**: For each letter of current digit, add to combination
4. **Recurse**: Continue with next digit
5. **Backtrack**: Remove last letter and try next option

## Step-by-Step Dry Run
Using input `digits = "23"`:

**Recursion Tree:**
1. **Start**: combination = "", index = 0, digit = '2'
2. **Try 'a'**: combination = "a", index = 1, digit = '3'
   - **Try 'd'**: combination = "ad", index = 2 → add "ad" to result
   - **Try 'e'**: combination = "ae", index = 2 → add "ae" to result  
   - **Try 'f'**: combination = "af", index = 2 → add "af" to result
3. **Backtrack to 'b'**: combination = "b", index = 1, digit = '3'
   - **Try 'd'**: combination = "bd", index = 2 → add "bd" to result
   - **Try 'e'**: combination = "be", index = 2 → add "be" to result
   - **Try 'f'**: combination = "bf", index = 2 → add "bf" to result
4. **Continue pattern for 'c'**: Get "cd", "ce", "cf"
5. **Final result**: ["ad","ae","af","bd","be","bf","cd","ce","cf"]

## JavaScript Implementation

```javascript
function letterCombinations(digits) {
    if (!digits || digits.length === 0) {
        return [];
    }
    
    // Mapping of digits to letters
    const digitMap = {
        '2': 'abc',
        '3': 'def', 
        '4': 'ghi',
        '5': 'jkl',
        '6': 'mno',
        '7': 'pqrs',
        '8': 'tuv',
        '9': 'wxyz'
    };
    
    const result = [];
    
    function backtrack(index, currentCombination) {
        // Base case: if we've processed all digits
        if (index === digits.length) {
            result.push(currentCombination);
            return;
        }
        
        // Get letters for current digit
        const letters = digitMap[digits[index]];
        
        // Try each letter
        for (const letter of letters) {
            // Choose: add letter to combination
            // Recurse: continue with next digit
            backtrack(index + 1, currentCombination + letter);
            // Backtrack: automatic when function returns
        }
    }
    
    backtrack(0, "");
    return result;
}

// Alternative approach using array for combination (explicit backtracking)
function letterCombinationsExplicitBacktrack(digits) {
    if (!digits || digits.length === 0) return [];
    
    const digitMap = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    };
    
    const result = [];
    const combination = [];
    
    function backtrack(index) {
        if (index === digits.length) {
            result.push(combination.join(''));
            return;
        }
        
        const letters = digitMap[digits[index]];
        for (const letter of letters) {
            combination.push(letter);           // Choose
            backtrack(index + 1);              // Recurse
            combination.pop();                 // Backtrack
        }
    }
    
    backtrack(0);
    return result;
}

// Iterative approach using BFS
function letterCombinationsIterative(digits) {
    if (!digits || digits.length === 0) return [];
    
    const digitMap = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    };
    
    let result = [''];
    
    for (const digit of digits) {
        const letters = digitMap[digit];
        const newResult = [];
        
        for (const combination of result) {
            for (const letter of letters) {
                newResult.push(combination + letter);
            }
        }
        
        result = newResult;
    }
    
    return result;
}

// Approach using nested loops (for fixed length inputs)
function letterCombinationsNestedLoops(digits) {
    if (!digits || digits.length === 0) return [];
    
    const digitMap = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    };
    
    // This approach works well for small, known input sizes
    if (digits.length === 1) {
        return digitMap[digits[0]].split('');
    }
    
    if (digits.length === 2) {
        const result = [];
        const letters1 = digitMap[digits[0]];
        const letters2 = digitMap[digits[1]];
        
        for (const l1 of letters1) {
            for (const l2 of letters2) {
                result.push(l1 + l2);
            }
        }
        return result;
    }
    
    // For longer inputs, fall back to recursive approach
    return letterCombinations(digits);
}

// Generator approach for memory efficiency
function* letterCombinationsGenerator(digits) {
    if (!digits || digits.length === 0) return;
    
    const digitMap = {
        '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
        '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'
    };
    
    function* generate(index, currentCombination) {
        if (index === digits.length) {
            yield currentCombination;
            return;
        }
        
        const letters = digitMap[digits[index]];
        for (const letter of letters) {
            yield* generate(index + 1, currentCombination + letter);
        }
    }
    
    yield* generate(0, "");
}

// Test cases
function testLetterCombinations() {
    const testCases = [
        "23",
        "",
        "2",
        "234",
        "7",
        "79",
        "999"
    ];
    
    console.log("Testing Letter Combinations:");
    
    testCases.forEach((digits, index) => {
        const result = letterCombinations(digits);
        console.log(`Test ${index + 1}: "${digits}"`);
        console.log(`Output: [${result.map(s => `"${s}"`).join(', ')}]`);
        console.log(`Count: ${result.length}`);
        console.log();
    });
}

// Compare different approaches
function compareApproaches() {
    const testInput = "234";
    
    console.log("Comparing approaches for input '234':");
    
    console.time("Recursive");
    const result1 = letterCombinations(testInput);
    console.timeEnd("Recursive");
    
    console.time("Iterative");
    const result2 = letterCombinationsIterative(testInput);
    console.timeEnd("Iterative");
    
    console.time("Explicit Backtrack");
    const result3 = letterCombinationsExplicitBacktrack(testInput);
    console.timeEnd("Explicit Backtrack");
    
    console.log(`All approaches give same result: ${
        JSON.stringify(result1) === JSON.stringify(result2) && 
        JSON.stringify(result2) === JSON.stringify(result3)
    }`);
    
    console.log(`Result count: ${result1.length}`);
}

// Calculate expected number of combinations
function calculateExpectedCombinations(digits) {
    const digitMap = {
        '2': 3, '3': 3, '4': 3, '5': 3,
        '6': 3, '7': 4, '8': 3, '9': 4
    };
    
    return digits.split('').reduce((total, digit) => {
        return total * (digitMap[digit] || 1);
    }, 1);
}

// Test generator approach
function testGenerator() {
    console.log("Testing generator approach:");
    const gen = letterCombinationsGenerator("23");
    
    let count = 0;
    for (const combination of gen) {
        if (count < 5) { // Show first 5 only
            console.log(combination);
        }
        count++;
    }
    console.log(`Total generated: ${count}`);
}

// testLetterCombinations();
// compareApproaches();
// testGenerator();
```

## Time and Space Complexity

**Time Complexity:** O(3^n × 4^m) where:
- n = number of digits that map to 3 letters (2,3,4,5,6,8)
- m = number of digits that map to 4 letters (7,9)
- We generate all possible combinations

**Space Complexity:** 
- **Recursive approach:** O(3^n × 4^m) for storing all combinations + O(n) for recursion stack
- **Iterative approach:** O(3^n × 4^m) for storing combinations
- **Generator approach:** O(n) space at any time (memory efficient)

**Detailed Analysis:**
- Each digit adds a multiplicative factor to total combinations
- Worst case: all digits are 7 or 9 → O(4^n)
- Best case: all digits are 2,3,4,5,6,8 → O(3^n)
- Average case: mixture → O(3.5^n approximately)

**Approach Comparison:**
1. **Recursive backtracking**: Most intuitive, clean code
2. **Iterative BFS**: Good for understanding the building process
3. **Generator**: Memory efficient for large inputs
4. **Nested loops**: Fastest for small, fixed inputs

**Key Insights:**
1. **Exponential growth**: Combinations grow exponentially with input length
2. **Backtracking pattern**: Classic template for generating combinations
3. **String vs Array**: String concatenation vs array manipulation trade-offs
4. **Memory optimization**: Generator pattern useful for large result sets

**Common Interview Follow-ups:**
- "What if digits could map to any number of letters?"
- "How would you handle invalid digits?"
- "Can you generate combinations in lexicographical order?"
- "What's the memory-optimal solution for very long inputs?"