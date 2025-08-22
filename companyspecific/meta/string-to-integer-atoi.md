# String to Integer (atoi) - LeetCode #8

## Problem Explanation
Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer (similar to C/C++'s atoi function). The algorithm for atoi is:
1. Read and ignore any leading whitespace
2. Check if the next character is '-' or '+' determining sign
3. Read the next characters until the next non-digit character or end of input
4. Convert these digits to an integer
5. If integer is out of 32-bit signed integer range [-2³¹, 2³¹ - 1], clamp it

## Sample Input and Output

**Example 1:**
```
Input: s = "42"
Output: 42
Explanation: The underlined characters are what is read and converted to integer.
```

**Example 2:**
```
Input: s = "   -42"
Output: -42
Explanation: Leading whitespace is ignored, then '-' indicates negative number.
```

**Example 3:**
```
Input: s = "4193 with words"
Output: 4193
Explanation: Conversion stops at ' ' as it's not a digit.
```

## Algorithm Outline
1. **Skip whitespace**: Remove leading spaces
2. **Handle sign**: Check for '+' or '-' and store sign
3. **Extract digits**: Iterate through string, converting valid digits
4. **Overflow check**: Check bounds before adding each digit
5. **Return result**: Apply sign and return clamped result

## Step-by-Step Dry Run
Using input `s = "   -42"`:

1. **i = 0, 1, 2**: Skip whitespace (' ', ' ', ' ')
2. **i = 3**: Found '-', set `sign = -1`, `i = 4`
3. **i = 4**: Found '4', `result = 0 * 10 + 4 = 4`
4. **i = 5**: Found '2', `result = 4 * 10 + 2 = 42`
5. **i = 6**: End of string
6. **Final result**: `42 * (-1) = -42`

## JavaScript Implementation

```javascript
function myAtoi(s) {
    let i = 0;
    let sign = 1;
    let result = 0;
    const INT_MAX = 2147483647; // 2^31 - 1
    const INT_MIN = -2147483648; // -2^31
    
    // Skip leading whitespace
    while (i < s.length && s[i] === ' ') {
        i++;
    }
    
    // Handle sign
    if (i < s.length && (s[i] === '+' || s[i] === '-')) {
        sign = s[i] === '-' ? -1 : 1;
        i++;
    }
    
    // Convert digits
    while (i < s.length && s[i] >= '0' && s[i] <= '9') {
        const digit = s[i] - '0';
        
        // Check for overflow before updating result
        if (result > Math.floor(INT_MAX / 10) || 
            (result === Math.floor(INT_MAX / 10) && digit > INT_MAX % 10)) {
            return sign === 1 ? INT_MAX : INT_MIN;
        }
        
        result = result * 10 + digit;
        i++;
    }
    
    return result * sign;
}

// Alternative approach with try-catch
function myAtoiAlternative(s) {
    const trimmed = s.trim();
    const parsed = parseInt(trimmed);
    
    if (isNaN(parsed)) return 0;
    
    const INT_MAX = 2147483647;
    const INT_MIN = -2147483648;
    
    if (parsed > INT_MAX) return INT_MAX;
    if (parsed < INT_MIN) return INT_MIN;
    
    return parsed;
}

// Test cases
function testMyAtoi() {
    const testCases = [
        ["42", 42],
        ["   -42", -42],
        ["4193 with words", 4193],
        ["words and 987", 0],
        ["-91283472332", -2147483648],
        ["91283472332", 2147483647],
        ["+1", 1],
        ["", 0],
        ["   ", 0]
    ];
    
    testCases.forEach(([input, expected]) => {
        const result = myAtoi(input);
        console.log(`Input: "${input}" | Expected: ${expected} | Got: ${result} | ${result === expected ? 'PASS' : 'FAIL'}`);
    });
}

// testMyAtoi();
```

## Time and Space Complexity

**Time Complexity:** O(n) where n is the length of the string
- We iterate through the string once, processing each character at most once

**Space Complexity:** O(1)
- We only use a constant amount of extra space for variables (i, sign, result, constants)
- No additional data structures are used

**Key Optimizations:**
1. **Early overflow detection**: Check for overflow before multiplication to prevent integer overflow
2. **Single pass**: Process the string in one iteration
3. **Constant space**: No additional data structures needed
4. **Efficient bounds checking**: Use mathematical comparison instead of string conversion