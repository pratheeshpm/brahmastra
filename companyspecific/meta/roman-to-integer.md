# Roman to Integer - LeetCode #13

## Problem Explanation
Convert a Roman numeral string to an integer. Roman numerals are represented by seven symbols:
- I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000

Special subtraction cases:
- I before V (5) or X (10) makes 4 or 9
- X before L (50) or C (100) makes 40 or 90  
- C before D (500) or M (1000) makes 400 or 900

## Sample Input and Output

**Example 1:**
```
Input: s = "III"
Output: 3
Explanation: III = 3
```

**Example 2:**
```
Input: s = "LVIII"
Output: 58
Explanation: L = 50, V = 5, III = 3. Total = 58
```

**Example 3:**
```
Input: s = "MCMXC"
Output: 1990
Explanation: M = 1000, CM = 900, XC = 90. Total = 1990
```

## Algorithm Outline
1. **Create mapping**: Map Roman symbols to integer values
2. **Traverse right to left**: Process string from end to beginning
3. **Compare values**: If current value < previous value, subtract; otherwise add
4. **Handle subtraction cases**: Automatically handles IV, IX, XL, XC, CD, CM
5. **Return total**: Sum all processed values

## Step-by-Step Dry Run
Using input `s = "MCMXC"`:

1. **i = 4**: 'C' = 100, prev = 0, result = 0 + 100 = 100, prev = 100
2. **i = 3**: 'X' = 10, prev = 100, 10 < 100, result = 100 - 10 = 90, prev = 10
3. **i = 2**: 'M' = 1000, prev = 10, 1000 > 10, result = 90 + 1000 = 1090, prev = 1000
4. **i = 1**: 'C' = 100, prev = 1000, 100 < 1000, result = 1090 - 100 = 990, prev = 100
5. **i = 0**: 'M' = 1000, prev = 100, 1000 > 100, result = 990 + 1000 = 1990, prev = 1000
6. **Final result**: 1990

## JavaScript Implementation

```javascript
function romanToInt(s) {
    // Roman numeral mapping
    const romanMap = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    };
    
    let result = 0;
    let prevValue = 0;
    
    // Traverse from right to left
    for (let i = s.length - 1; i >= 0; i--) {
        const currentValue = romanMap[s[i]];
        
        // If current value is less than previous, subtract it
        if (currentValue < prevValue) {
            result -= currentValue;
        } else {
            result += currentValue;
        }
        
        prevValue = currentValue;
    }
    
    return result;
}

// Alternative approach - left to right with lookahead
function romanToIntLeftToRight(s) {
    const romanMap = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50,
        'C': 100, 'D': 500, 'M': 1000
    };
    
    let result = 0;
    
    for (let i = 0; i < s.length; i++) {
        const current = romanMap[s[i]];
        const next = romanMap[s[i + 1]];
        
        // If current < next, subtract current (subtraction case)
        if (current < next) {
            result -= current;
        } else {
            result += current;
        }
    }
    
    return result;
}

// Optimized approach with two-character mapping
function romanToIntOptimized(s) {
    const romanMap = {
        'I': 1, 'V': 5, 'X': 10, 'L': 50,
        'C': 100, 'D': 500, 'M': 1000,
        'IV': 4, 'IX': 9, 'XL': 40, 'XC': 90,
        'CD': 400, 'CM': 900
    };
    
    let result = 0;
    let i = 0;
    
    while (i < s.length) {
        // Check for two-character combinations first
        if (i + 1 < s.length && romanMap[s.substring(i, i + 2)]) {
            result += romanMap[s.substring(i, i + 2)];
            i += 2;
        } else {
            result += romanMap[s[i]];
            i++;
        }
    }
    
    return result;
}

// Test cases
function testRomanToInt() {
    const testCases = [
        ["III", 3],
        ["LVIII", 58],
        ["MCMXC", 1990],
        ["IV", 4],
        ["IX", 9],
        ["XL", 40],
        ["XC", 90],
        ["CD", 400],
        ["CM", 900],
        ["MCDLXXVI", 1476],
        ["MMCDXLIV", 2444]
    ];
    
    console.log("Testing romanToInt:");
    testCases.forEach(([input, expected]) => {
        const result = romanToInt(input);
        console.log(`Input: "${input}" | Expected: ${expected} | Got: ${result} | ${result === expected ? 'PASS' : 'FAIL'}`);
    });
    
    console.log("\nTesting romanToIntOptimized:");
    testCases.forEach(([input, expected]) => {
        const result = romanToIntOptimized(input);
        console.log(`Input: "${input}" | Expected: ${expected} | Got: ${result} | ${result === expected ? 'PASS' : 'FAIL'}`);
    });
}

// testRomanToInt();
```

## Time and Space Complexity

**Time Complexity:** O(n) where n is the length of the string
- We traverse the string once, processing each character exactly once
- HashMap lookups are O(1) operations

**Space Complexity:** O(1)
- The Roman numeral mapping has a fixed size (at most 13 entries)
- We use only a constant amount of extra variables
- Space doesn't grow with input size

**Key Insights:**
1. **Right-to-left traversal**: Simplifies subtraction case handling
2. **Previous value comparison**: Elegantly handles all subtraction rules
3. **Single pass**: No need for multiple iterations or preprocessing
4. **Memory efficient**: Constant space regardless of input size

**Pattern Recognition:**
- This problem teaches the "process in reverse" technique
- Similar pattern appears in other string processing problems
- The key insight is that subtraction cases can be detected by value comparison