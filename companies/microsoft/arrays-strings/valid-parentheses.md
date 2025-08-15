# Valid Parentheses ⭐

## Problem Statement

Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets
2. Open brackets must be closed in the correct order
3. Every close bracket has a corresponding open bracket of the same type

**Example 1:**
```
Input: s = "()"
Output: true
```

**Example 2:**
```
Input: s = "()[]{}"
Output: true
```

**Example 3:**
```
Input: s = "(]"
Output: false
```

**Example 4:**
```
Input: s = "([)]"
Output: false
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. HTML/XML Tag Validation
```javascript
// Validate HTML tag nesting
function validateHTMLTags(html) {
    const stack = [];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\s*\/?>/g;
    let match;
    
    while ((match = tagRegex.exec(html)) !== null) {
        const fullTag = match[0];
        const tagName = match[1];
        
        if (fullTag.includes('</')) {
            // Closing tag
            if (stack.length === 0 || stack.pop() !== tagName) {
                return false;
            }
        } else if (!fullTag.includes('/>')) {
            // Opening tag (not self-closing)
            stack.push(tagName);
        }
    }
    
    return stack.length === 0;
}

// Usage
console.log(validateHTMLTags('<div><p>Hello</p></div>')); // true
console.log(validateHTMLTags('<div><p>Hello</div></p>')); // false
```

#### 2. JSON Validation
```javascript
// Basic JSON bracket validation before parsing
function isValidJSONStructure(jsonStr) {
    const brackets = [];
    const bracketPairs = { '}': '{', ']': '[' };
    
    for (let char of jsonStr) {
        if (char === '{' || char === '[') {
            brackets.push(char);
        } else if (char === '}' || char === ']') {
            if (brackets.length === 0 || brackets.pop() !== bracketPairs[char]) {
                return false;
            }
        }
    }
    
    return brackets.length === 0;
}
```

#### 3. Expression Parser for Calculators
```javascript
// Validate mathematical expressions
function validateMathExpression(expr) {
    const stack = [];
    const pairs = { ')': '(', ']': '[', '}': '{' };
    
    for (let char of expr) {
        if ('({['.includes(char)) {
            stack.push(char);
        } else if (')}]'.includes(char)) {
            if (stack.length === 0 || stack.pop() !== pairs[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
}

// Usage in a calculator component
class Calculator {
    evaluateExpression(expression) {
        if (!validateMathExpression(expression)) {
            throw new Error('Invalid parentheses in expression');
        }
        // Proceed with evaluation
        return eval(expression); // In real apps, use a proper parser
    }
}
```

## Approach 1: Brute Force - String Replacement

### Algorithm
Based on the [blog post](https://blog.unwiredlearning.com/valid-parentheses), one naive approach is to repeatedly replace matched pairs with empty strings until no more pairs exist.

### Implementation
```javascript
function isValidBruteForce(s) {
    // Keep replacing matched pairs until no more changes
    let prev = '';
    let current = s;
    
    while (prev !== current) {
        prev = current;
        current = current
            .replace(/\(\)/g, '')
            .replace(/\[\]/g, '')
            .replace(/\{\}/g, '');
    }
    
    return current.length === 0;
}
```

### Complexity Analysis
- **Time Complexity**: O(n²) - In worst case, we might need n/2 iterations, each taking O(n) time
- **Space Complexity**: O(n) - Creating new strings in each iteration
- **Pros**: Simple to understand and implement
- **Cons**: Very inefficient for large inputs, multiple string allocations

### Example Trace
```
Input: "([)]"

Iteration 1: "([)]" → no matches found
Result: false (string not empty)

Input: "(())"

Iteration 1: "(())" → "()" 
Iteration 2: "()" → ""
Result: true (empty string)
```

## Approach 2: Stack (Optimal Solution)

### Algorithm
Use a stack to track opening brackets and match them with closing brackets in LIFO order.

### Implementation
```javascript
function isValid(s) {
    // Early termination: odd length strings cannot be valid
    if (s.length % 2 !== 0) return false;
    
    const stack = [];
    const bracketMap = {
        ')': '(',
        ']': '[', 
        '}': '{'
    };
    
    for (let char of s) {
        if (char in bracketMap) {
            // Closing bracket
            if (stack.length === 0 || stack.pop() !== bracketMap[char]) {
                return false;
            }
        } else {
            // Opening bracket
            stack.push(char);
        }
    }
    
    return stack.length === 0;
}
```

### Optimized Version with Early Termination
```javascript
function isValidOptimized(s) {
    if (s.length % 2 !== 0) return false;
    
    const stack = [];
    const maxLength = s.length / 2; // Max possible stack size
    
    for (let char of s) {
        switch (char) {
            case '(':
            case '[':
            case '{':
                // Early termination if stack gets too large
                if (stack.length >= maxLength) return false;
                stack.push(char);
                break;
            case ')':
                if (stack.length === 0 || stack.pop() !== '(') return false;
                break;
            case ']':
                if (stack.length === 0 || stack.pop() !== '[') return false;
                break;
            case '}':
                if (stack.length === 0 || stack.pop() !== '{') return false;
                break;
            default:
                // Invalid character
                return false;
        }
    }
    
    return stack.length === 0;
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Single pass through the string
- **Space Complexity**: O(n) - Stack can hold at most n/2 opening brackets
- **Pros**: Optimal time complexity, efficient memory usage
- **Cons**: None for this problem size

### Example Trace
```
Input: "([)]"

char = '(': stack = ['(']
char = '[': stack = ['(', '[']  
char = ')': stack.pop() = '[', but need '(' → return false

Input: "([{}])"

char = '(': stack = ['(']
char = '[': stack = ['(', '[']
char = '{': stack = ['(', '[', '{']
char = '}': stack.pop() = '{' ✓, stack = ['(', '[']
char = ']': stack.pop() = '[' ✓, stack = ['(']
char = ')': stack.pop() = '(' ✓, stack = []
Result: true (empty stack)
```

## Frontend-Specific Optimizations

### 1. Real-time Validation for Code Editors
```javascript
class CodeEditor {
    constructor() {
        this.brackets = [];
        this.isValid = true;
    }
    
    addCharacter(char) {
        if ('({['.includes(char)) {
            this.brackets.push(char);
        } else if (')}]'.includes(char)) {
            const pairs = { ')': '(', ']': '[', '}': '{' };
            if (this.brackets.length === 0 || this.brackets.pop() !== pairs[char]) {
                this.isValid = false;
                return false;
            }
        }
        
        this.isValid = this.brackets.length === 0;
        return true;
    }
    
    removeCharacter(char) {
        // Handle backspace/delete operations
        if (')}]'.includes(char)) {
            const pairs = { ')': '(', ']': '[', '}': '{' };
            this.brackets.push(pairs[char]);
        } else if ('({['.includes(char)) {
            if (this.brackets.length > 0) {
                this.brackets.pop();
            }
        }
        
        this.isValid = this.brackets.length === 0;
    }
    
    getCurrentStatus() {
        return {
            isValid: this.isValid,
            openBrackets: this.brackets.length,
            nextExpected: this.brackets.length > 0 ? 
                this.getClosingBracket(this.brackets[this.brackets.length - 1]) : null
        };
    }
    
    getClosingBracket(opening) {
        const pairs = { '(': ')', '[': ']', '{': '}' };
        return pairs[opening];
    }
}
```

### 2. Template Validation
```javascript
// Validate template literals and JSX
function validateTemplate(template) {
    const stack = [];
    let i = 0;
    
    while (i < template.length) {
        const char = template[i];
        
        if (char === '{') {
            // Check for template literal ${}
            if (i > 0 && template[i-1] === '$') {
                stack.push('template');
            } else {
                stack.push('{');
            }
        } else if (char === '}') {
            if (stack.length === 0) return false;
            
            const last = stack.pop();
            if (last !== '{' && last !== 'template') return false;
        } else if (char === '(') {
            stack.push('(');
        } else if (char === ')') {
            if (stack.length === 0 || stack.pop() !== '(') return false;
        }
        
        i++;
    }
    
    return stack.length === 0;
}
```

## Testing & Edge Cases

### Comprehensive Test Suite
```javascript
function testValidParentheses() {
    const testCases = [
        // Basic cases
        { input: "", expected: true, description: "Empty string" },
        { input: "()", expected: true, description: "Simple pair" },
        { input: "()[]{}", expected: true, description: "Multiple types" },
        { input: "(]", expected: false, description: "Mismatched" },
        { input: "([)]", expected: false, description: "Wrong order" },
        
        // Edge cases
        { input: "((", expected: false, description: "Only opening" },
        { input: "))", expected: false, description: "Only closing" },
        { input: "())", expected: false, description: "Extra closing" },
        { input: "(()", expected: false, description: "Extra opening" },
        
        // Complex nested
        { input: "((()))", expected: true, description: "Nested same type" },
        { input: "([{}])", expected: true, description: "Nested different types" },
        { input: "([{()}])", expected: true, description: "Deep nesting" },
        { input: "([{()})]", expected: false, description: "Deep nesting invalid" },
        
        // Single character
        { input: "(", expected: false, description: "Single opening" },
        { input: ")", expected: false, description: "Single closing" },
        
        // Long strings
        { input: "()".repeat(1000), expected: true, description: "Long valid" },
        { input: "(".repeat(1000) + ")".repeat(1000), expected: true, description: "Long nested" }
    ];
    
    const implementations = [
        { name: "Brute Force", func: isValidBruteForce },
        { name: "Stack Approach", func: isValid },
        { name: "Optimized Stack", func: isValidOptimized }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name}:`);
        let passed = 0;
        
        testCases.forEach(test => {
            try {
                const result = impl.func(test.input);
                const success = result === test.expected;
                
                console.log(`  ${success ? '✓' : '✗'} ${test.description}`);
                if (!success) {
                    console.log(`    Expected: ${test.expected}, Got: ${result}`);
                }
                
                if (success) passed++;
            } catch (error) {
                console.log(`  ✗ ${test.description}: ERROR - ${error.message}`);
            }
        });
        
        console.log(`  Summary: ${passed}/${testCases.length} tests passed`);
    });
}

testValidParentheses();
```

### Performance Benchmark
```javascript
function benchmarkValidParentheses() {
    const testStrings = [
        "()".repeat(100),
        "([{}])".repeat(100),
        "(".repeat(500) + ")".repeat(500),
        "([{".repeat(100) + "}])".repeat(100)
    ];
    
    const implementations = [
        { name: "Brute Force", func: isValidBruteForce },
        { name: "Stack Approach", func: isValid }
    ];
    
    testStrings.forEach((testStr, index) => {
        console.log(`\nTest ${index + 1} - Length: ${testStr.length}`);
        
        implementations.forEach(impl => {
            const start = performance.now();
            const iterations = 1000;
            
            for (let i = 0; i < iterations; i++) {
                impl.func(testStr);
            }
            
            const end = performance.now();
            const avgTime = (end - start) / iterations;
            console.log(`  ${impl.name}: ${avgTime.toFixed(4)}ms avg`);
        });
    });
}
```

## Interview Tips

### Discussion Points
1. **Stack Choice**: Explain why stack is perfect for this problem (LIFO nature)
2. **Early Termination**: Discuss optimization opportunities
3. **Edge Cases**: Empty string, single characters, odd length
4. **Real-world Applications**: HTML validation, expression parsing

### Common Follow-ups
1. **"What if we want to know which bracket is unmatched?"** → Return index/position
2. **"How would you handle other bracket types?"** → Extend mapping
3. **"What about nested quotes or strings?"** → State machine approach
4. **"Can you solve without extra space?"** → Discuss space-time tradeoffs

### Microsoft-Specific Context
1. **Code Editor Features**: Bracket matching, auto-completion
2. **Template Validation**: JSX, template literals validation
3. **Performance**: Real-time validation in IDEs
4. **Error Reporting**: Detailed error messages for developers

## Key Takeaways

1. **Stack is Optimal**: Perfect data structure for nested/balanced problems
2. **Early Termination**: Small optimizations can significantly improve performance
3. **Frontend Applications**: Common in parsers, validators, code editors
4. **Pattern Recognition**: Recognize when LIFO behavior is needed
5. **Space-Time Tradeoff**: O(n) space for O(n) time is usually acceptable 