# Detect Unique Characters in String ⭐

## Problem Statement

Determine if a string has all unique characters. Implement an algorithm to check if all characters in a string are unique without using additional data structures.

**Example 1:**
```
Input: "abcdef"
Output: true
```

**Example 2:**
```
Input: "hello"
Output: false (character 'l' repeats)
```

**Example 3:**
```
Input: ""
Output: true (empty string has unique characters)
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. Form Validation
```javascript
// Validate unique characters in usernames, IDs, etc.
function validateUniqueId(id) {
    if (!hasUniqueCharacters(id)) {
        return {
            valid: false,
            error: 'ID must contain only unique characters'
        };
    }
    return { valid: true };
}

// Check for duplicate class names in CSS
function validateCSSClasses(classString) {
    const classes = classString.split(' ').filter(cls => cls.trim());
    const uniqueClasses = new Set(classes);
    
    if (classes.length !== uniqueClasses.size) {
        console.warn('Duplicate CSS classes detected:', classString);
    }
    
    return classes.length === uniqueClasses.size;
}
```

#### 2. Data Deduplication
```javascript
// Remove duplicate characters from strings (useful for search tags, keywords)
function deduplicateString(str) {
    if (hasUniqueCharacters(str)) return str;
    
    const seen = new Set();
    return str.split('').filter(char => {
        if (seen.has(char)) return false;
        seen.add(char);
        return true;
    }).join('');
}

// Validate unique keys in configuration objects
function validateConfigKeys(config) {
    const keys = Object.keys(config);
    const keyString = keys.join('');
    
    return {
        hasUniqueKeys: keys.length === new Set(keys).size,
        hasUniqueCharacters: hasUniqueCharacters(keyString)
    };
}
```

#### 3. Input Sanitization
```javascript
// Ensure input fields don't have repeated characters where not allowed
function validatePassword(password, allowRepeats = true) {
    const checks = {
        length: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        uniqueChars: allowRepeats || hasUniqueCharacters(password)
    };
    
    return {
        valid: Object.values(checks).every(Boolean),
        checks
    };
}
```

## Approach 1: Brute Force - Nested Loops

### Algorithm
1. Compare each character with every other character
2. If any duplicate is found, return false
3. If no duplicates found after all comparisons, return true

### Implementation
```javascript
function hasUniqueCharacters(str) {
    // Edge case: empty string or single character
    if (str.length <= 1) return true;
    
    for (let i = 0; i < str.length; i++) {
        for (let j = i + 1; j < str.length; j++) {
            if (str[i] === str[j]) {
                return false;
            }
        }
    }
    
    return true;
}
```

### Complexity Analysis
- **Time Complexity**: O(n²) - Nested loops over all character pairs
- **Space Complexity**: O(1) - No additional data structures used
- **Pros**: Simple implementation, constant space
- **Cons**: Inefficient for large strings

### Example Trace
```
Input: "hello"

i=0, char='h': compare with 'e', 'l', 'l', 'o'
  - h vs e: different ✓
  - h vs l: different ✓  
  - h vs l: different ✓
  - h vs o: different ✓

i=1, char='e': compare with 'l', 'l', 'o'
  - e vs l: different ✓
  - e vs l: different ✓
  - e vs o: different ✓

i=2, char='l': compare with 'l', 'o'
  - l vs l: SAME! ✗

Return: false
```

## Approach 2: Hash Set (Most Common)

### Algorithm
1. Use a Set to track seen characters
2. For each character, check if it's already in the set
3. If found, return false; otherwise add to set
4. If all characters processed without duplicates, return true

### Implementation
```javascript
function hasUniqueCharacters(str) {
    const seen = new Set();
    
    for (let char of str) {
        if (seen.has(char)) {
            return false;
        }
        seen.add(char);
    }
    
    return true;
}

// Alternative: One-liner using Set
function hasUniqueCharactersOneLiner(str) {
    return str.length === new Set(str).size;
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Single pass through string
- **Space Complexity**: O(min(m, n)) - Where m is charset size (e.g., 128 for ASCII)
- **Pros**: Fast, easy to understand
- **Cons**: Uses extra space

### Example Trace
```
Input: "abcdef"

seen = Set()
char='a': seen.has('a')? No. Add 'a'. seen = {'a'}
char='b': seen.has('b')? No. Add 'b'. seen = {'a', 'b'}  
char='c': seen.has('c')? No. Add 'c'. seen = {'a', 'b', 'c'}
char='d': seen.has('d')? No. Add 'd'. seen = {'a', 'b', 'c', 'd'}
char='e': seen.has('e')? No. Add 'e'. seen = {'a', 'b', 'c', 'd', 'e'}
char='f': seen.has('f')? No. Add 'f'. seen = {'a', 'b', 'c', 'd', 'e', 'f'}

Return: true
```

## Approach 3: Bit Vector (ASCII Optimization)

### Algorithm
1. Use an integer as a bit vector (for ASCII a-z or A-Z)
2. For each character, calculate its bit position
3. Check if that bit is already set
4. If set, return false; otherwise set the bit

### Implementation
```javascript
// For lowercase letters only (a-z)
function hasUniqueCharactersLowercase(str) {
    let checker = 0;
    
    for (let char of str) {
        const charCode = char.charCodeAt(0) - 'a'.charCodeAt(0);
        
        // Check if this character's bit is already set
        if ((checker & (1 << charCode)) > 0) {
            return false;
        }
        
        // Set the bit for this character
        checker |= (1 << charCode);
    }
    
    return true;
}

// For all ASCII characters (0-127)
function hasUniqueCharactersASCII(str) {
    // Use array of integers as bit vectors
    const bitVector = new Array(4).fill(0); // 4 * 32 bits = 128 bits
    
    for (let char of str) {
        const charCode = char.charCodeAt(0);
        
        if (charCode >= 128) {
            throw new Error('Non-ASCII character detected');
        }
        
        const arrayIndex = Math.floor(charCode / 32);
        const bitIndex = charCode % 32;
        
        if ((bitVector[arrayIndex] & (1 << bitIndex)) > 0) {
            return false;
        }
        
        bitVector[arrayIndex] |= (1 << bitIndex);
    }
    
    return true;
}
```

### Complexity Analysis
- **Time Complexity**: O(n) - Single pass through string
- **Space Complexity**: O(1) - Fixed size bit vector
- **Pros**: Constant space, very fast bit operations
- **Cons**: Limited to specific character sets, complex implementation

## Approach 4: Sorting (In-place comparison)

### Algorithm
1. Convert string to array and sort
2. Check adjacent characters for duplicates
3. Return false if any adjacent characters are the same

### Implementation
```javascript
function hasUniqueCharacters(str) {
    if (str.length <= 1) return true;
    
    // Convert to array and sort
    const chars = str.split('').sort();
    
    // Check adjacent characters
    for (let i = 0; i < chars.length - 1; i++) {
        if (chars[i] === chars[i + 1]) {
            return false;
        }
    }
    
    return true;
}

// Alternative: using every() method
function hasUniqueCharactersFunctional(str) {
    if (str.length <= 1) return true;
    
    const chars = str.split('').sort();
    return chars.every((char, index) => 
        index === 0 || char !== chars[index - 1]
    );
}
```

### Complexity Analysis
- **Time Complexity**: O(n log n) - Due to sorting
- **Space Complexity**: O(n) - For the character array
- **Pros**: No hash table needed
- **Cons**: Slower than hash set approach, modifies order

## Approach 5: Early Termination Optimization

### Algorithm
1. Pre-check: if string length > character set size, return false immediately
2. Use optimized hash set with early termination

### Implementation
```javascript
function hasUniqueCharacters(str, charset = 'ASCII') {
    // Early termination based on character set
    const maxChars = charset === 'ASCII' ? 128 : 
                    charset === 'lowercase' ? 26 :
                    charset === 'uppercase' ? 26 :
                    charset === 'alphanumeric' ? 62 : 256;
    
    if (str.length > maxChars) {
        return false; // Pigeonhole principle
    }
    
    const seen = new Set();
    
    for (let char of str) {
        if (seen.has(char)) {
            return false;
        }
        seen.add(char);
        
        // Early termination if we've seen too many characters
        if (seen.size > maxChars) {
            return false;
        }
    }
    
    return true;
}

// Unicode-aware version
function hasUniqueCharactersUnicode(str) {
    // For Unicode, we can't use pigeonhole principle effectively
    // But we can still optimize with Map for better Unicode support
    const seen = new Map();
    
    for (let char of str) {
        if (seen.has(char)) {
            return false;
        }
        seen.set(char, true);
    }
    
    return true;
}
```

## Frontend-Specific Optimizations

### 1. Case-Insensitive Version
```javascript
function hasUniqueCharactersCaseInsensitive(str) {
    const seen = new Set();
    
    for (let char of str.toLowerCase()) {
        if (seen.has(char)) {
            return false;
        }
        seen.add(char);
    }
    
    return true;
}
```

### 2. Ignore Whitespace Version
```javascript
function hasUniqueCharactersIgnoreSpaces(str) {
    const seen = new Set();
    
    for (let char of str) {
        if (char === ' ' || char === '\t' || char === '\n') {
            continue; // Skip whitespace
        }
        
        if (seen.has(char)) {
            return false;
        }
        seen.add(char);
    }
    
    return true;
}
```

### 3. Real-time Validation
```javascript
function createUniqueCharValidator() {
    let seen = new Set();
    let isValid = true;
    
    return {
        addChar(char) {
            if (seen.has(char)) {
                isValid = false;
                return false;
            }
            seen.add(char);
            return true;
        },
        
        removeChar(char) {
            seen.delete(char);
            // Reset validity - we'd need to recheck everything
            isValid = true;
            return true;
        },
        
        isValid() {
            return isValid;
        },
        
        reset() {
            seen.clear();
            isValid = true;
        },
        
        getSeenChars() {
            return Array.from(seen);
        }
    };
}

// Usage for real-time input validation
const validator = createUniqueCharValidator();

function handleInputChange(event) {
    const input = event.target.value;
    validator.reset();
    
    let isValid = true;
    for (let char of input) {
        if (!validator.addChar(char)) {
            isValid = false;
            break;
        }
    }
    
    // Update UI based on validation
    event.target.classList.toggle('invalid', !isValid);
}
```

## Testing & Edge Cases

### Comprehensive Test Suite
```javascript
function testHasUniqueCharacters() {
    const testCases = [
        // Basic cases
        { input: "", expected: true, description: "Empty string" },
        { input: "a", expected: true, description: "Single character" },
        { input: "abc", expected: true, description: "All unique" },
        { input: "aab", expected: false, description: "One duplicate" },
        
        // Edge cases
        { input: "   ", expected: false, description: "Multiple spaces" },
        { input: "a b", expected: true, description: "Space as character" },
        { input: "AaBb", expected: true, description: "Case sensitive" },
        { input: "123", expected: true, description: "Numbers" },
        { input: "12321", expected: false, description: "Duplicate numbers" },
        
        // Special characters
        { input: "!@#$%", expected: true, description: "Special chars" },
        { input: "!!!", expected: false, description: "Duplicate special" },
        { input: "a!a", expected: false, description: "Mixed with duplicate" },
        
        // Unicode
        { input: "café", expected: true, description: "Unicode characters" },
        { input: "😀😂", expected: true, description: "Emojis" },
        { input: "😀😀", expected: false, description: "Duplicate emojis" },
        
        // Long strings
        { input: "abcdefghijklmnopqrstuvwxyz", expected: true, description: "Full alphabet" },
        { input: "abcdefghijklmnopqrstuvwxyza", expected: false, description: "Alphabet with duplicate" }
    ];
    
    const implementations = [
        { name: "Brute Force", func: hasUniqueCharactersBruteForce },
        { name: "Hash Set", func: hasUniqueCharacters },
        { name: "One Liner", func: hasUniqueCharactersOneLiner },
        { name: "Bit Vector (lowercase)", func: hasUniqueCharactersLowercase }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name}:`);
        
        testCases.forEach(test => {
            try {
                const result = impl.func(test.input);
                const passed = result === test.expected;
                console.log(`  ${passed ? '✓' : '✗'} ${test.description}: "${test.input}" -> ${result}`);
                
                if (!passed) {
                    console.log(`    Expected: ${test.expected}, Got: ${result}`);
                }
            } catch (error) {
                console.log(`  ✗ ${test.description}: ERROR - ${error.message}`);
            }
        });
    });
}

testHasUniqueCharacters();
```

### Performance Benchmark
```javascript
function benchmarkUniqueCharacters() {
    const implementations = [
        { name: "Brute Force", func: hasUniqueCharactersBruteForce },
        { name: "Hash Set", func: hasUniqueCharacters },
        { name: "Bit Vector", func: hasUniqueCharactersLowercase }
    ];
    
    const testStrings = [
        "a".repeat(10),
        "abcdefghij",
        "a".repeat(100),
        "abcdefghijklmnopqrstuvwxyz".repeat(4),
        "a".repeat(1000)
    ];
    
    testStrings.forEach(testStr => {
        console.log(`\nTesting string length: ${testStr.length}`);
        
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

benchmarkUniqueCharacters();
```

## Interview Tips

### Discussion Points
1. **Character Set Assumptions**: Ask about ASCII vs Unicode, case sensitivity
2. **Space Constraints**: Discuss when O(1) space is required vs when O(n) is acceptable
3. **Performance Requirements**: For real-time validation vs one-time checks
4. **Edge Cases**: Empty strings, very long strings, special characters

### Common Follow-ups
1. **"What if you can't use additional data structures?"** → Show bit vector or sorting approach
2. **"How would you handle Unicode characters?"** → Discuss limitations and Unicode-aware solutions
3. **"Can you implement this without modifying the input?"** → Show read-only approaches
4. **"What about very large strings?"** → Discuss streaming/chunked processing

### Microsoft-Specific Context
1. **DOM Processing**: Relate to finding duplicate CSS classes or IDs
2. **Form Validation**: Real-time input validation for unique constraints
3. **Data Processing**: Deduplication in data pipelines
4. **Performance**: Optimization techniques for large-scale applications

## Key Takeaways

1. **Algorithm Choice**: Hash Set is usually best balance of simplicity and efficiency
2. **Space Optimization**: Bit vectors for limited character sets, sorting for no extra space
3. **Early Termination**: Use pigeonhole principle when character set size is known
4. **Frontend Applications**: Form validation, CSS class deduplication, data sanitization
5. **Performance Awareness**: Consider string length and frequency of calls when choosing approach 