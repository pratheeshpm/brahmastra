# First Occurrence of Substring ⭐

## Problem Statement

Given two strings `haystack` and `needle`, return the index of the first occurrence of `needle` in `haystack`, or -1 if `needle` is not part of `haystack`.

**Example 1:**
```
Input: haystack = "sadbutsad", needle = "sad"
Output: 0
Explanation: "sad" occurs at index 0 and 6. The first occurrence is at index 0.
```

**Example 2:**
```
Input: haystack = "leetcode", needle = "leeto"
Output: -1
Explanation: "leeto" did not occur in "leetcode".
```


## Approach 1: Brute Force

### Algorithm
Check every position in the haystack to see if the needle starts there.

### Implementation
```javascript
function findFirstOccurrenceBruteForce(haystack, needle) {
    if (needle === '') return 0;
    if (needle.length > haystack.length) return -1;
    
    for (let i = 0; i <= haystack.length - needle.length; i++) {
        let found = true;
        
        for (let j = 0; j < needle.length; j++) {
            if (haystack[i + j] !== needle[j]) {
                found = false;
                break;
            }
        }
        
        if (found) return i;
    }
    
    return -1;
}
```

### Complexity Analysis
- **Time Complexity**: O(n × m) where n = haystack length, m = needle length
- **Space Complexity**: O(1) - No extra space needed
- **Pros**: Simple to understand and implement
- **Cons**: Inefficient for long strings with many partial matches

### Example Trace
```
haystack = "sadbutsad", needle = "sad"

i=0: Compare "sad" with "sad" → Match! Return 0

haystack = "abababcab", needle = "ababcab"

i=0: "ababcab" vs "ababcab" → Mismatch at position 4 ('b' vs 'c')
i=1: "babcab" vs "ababcab" → Mismatch at position 0 ('b' vs 'a')
i=2: "abcab" vs "ababcab" → Needle longer, skip
...continue until i=2: Found at index 2
```

## Approach 2: KMP Algorithm (Optimal)

### Algorithm
Use the Knuth-Morris-Pratt algorithm with a failure function to avoid redundant comparisons.

### Implementation
```javascript
function findFirstOccurrence(haystack, needle) {
    if (needle === '') return 0;
    if (needle.length > haystack.length) return -1;
    
    // Build LPS (Longest Proper Prefix which is also Suffix) array
    function buildLPS(pattern) {
        const lps = new Array(pattern.length).fill(0);
        let len = 0; // Length of previous longest prefix suffix
        let i = 1;
        
        while (i < pattern.length) {
            if (pattern[i] === pattern[len]) {
                len++;
                lps[i] = len;
                i++;
            } else {
                if (len !== 0) {
                    len = lps[len - 1];
                } else {
                    lps[i] = 0;
                    i++;
                }
            }
        }
        
        return lps;
    }
    
    const lps = buildLPS(needle);
    let i = 0; // Index for haystack
    let j = 0; // Index for needle
    
    while (i < haystack.length) {
        if (haystack[i] === needle[j]) {
            i++;
            j++;
        }
        
        if (j === needle.length) {
            return i - j; // Found match
        } else if (i < haystack.length && haystack[i] !== needle[j]) {
            if (j !== 0) {
                j = lps[j - 1];
            } else {
                i++;
            }
        }
    }
    
    return -1;
}
```

### Complexity Analysis
- **Time Complexity**: O(n + m) - Linear time complexity
- **Space Complexity**: O(m) - For the LPS array
- **Pros**: Optimal time complexity, handles repetitive patterns efficiently
- **Cons**: More complex to implement and understand

### Example Trace
```
haystack = "abababcab", needle = "ababcab"

Build LPS for "ababcab": [0, 0, 1, 2, 0, 1, 2]

Matching process:
i=0,j=0: 'a'='a' ✓ → i=1,j=1
i=1,j=1: 'b'='b' ✓ → i=2,j=2  
i=2,j=2: 'a'='a' ✓ → i=3,j=3
i=3,j=3: 'b'='b' ✓ → i=4,j=4
i=4,j=4: 'a'≠'c' ✗ → j=lps[3]=2, i remains 4
i=4,j=2: 'a'='a' ✓ → i=5,j=3
i=5,j=3: 'b'='b' ✓ → i=6,j=4
i=6,j=4: 'c'='c' ✓ → i=7,j=5
i=7,j=5: 'a'='a' ✓ → i=8,j=6
i=8,j=6: 'b'='b' ✓ → i=9,j=7

j=7 equals needle.length, return i-j = 9-7 = 2
```

## Alternative: Built-in JavaScript Methods

### Using indexOf (Most Practical)
```javascript
function findFirstOccurrenceBuiltIn(haystack, needle) {
    if (needle === '') return 0;
    return haystack.indexOf(needle);
}
```

### Using includes for Boolean Check
```javascript
function containsSubstring(haystack, needle) {
    return haystack.includes(needle);
}
```

## Frontend-Specific Optimizations

### 1. Case-Insensitive Search
```javascript
function findFirstOccurrenceCaseInsensitive(haystack, needle) {
    if (needle === '') return 0;
    return haystack.toLowerCase().indexOf(needle.toLowerCase());
}
```

### 2. Multiple Needle Search
```javascript
function findMultipleSubstrings(haystack, needles) {
    const results = [];
    
    for (const needle of needles) {
        const index = findFirstOccurrence(haystack, needle);
        if (index !== -1) {
            results.push({
                needle,
                index,
                endIndex: index + needle.length - 1
            });
        }
    }
    
    // Sort by occurrence order
    return results.sort((a, b) => a.index - b.index);
}
```

### 3. Fuzzy Search Implementation
```javascript
function fuzzySearch(haystack, needle, maxDistance = 2) {
    // Simple fuzzy search allowing character mismatches
    if (needle === '') return 0;
    if (needle.length > haystack.length) return -1;
    
    for (let i = 0; i <= haystack.length - needle.length; i++) {
        let mismatches = 0;
        
        for (let j = 0; j < needle.length; j++) {
            if (haystack[i + j] !== needle[j]) {
                mismatches++;
                if (mismatches > maxDistance) break;
            }
        }
        
        if (mismatches <= maxDistance) {
            return i;
        }
    }
    
    return -1;
}
```

### 4. Search with Context
```javascript
function searchWithContext(text, searchTerm, contextLength = 50) {
    const index = findFirstOccurrence(text.toLowerCase(), searchTerm.toLowerCase());
    if (index === -1) return null;
    
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + searchTerm.length + contextLength);
    
    return {
        index,
        match: text.slice(index, index + searchTerm.length),
        context: text.slice(start, end),
        beforeContext: text.slice(start, index),
        afterContext: text.slice(index + searchTerm.length, end)
    };
}
```

## Testing & Edge Cases

### Comprehensive Test Suite
```javascript
function testFindFirstOccurrence() {
    const testCases = [
        // Basic cases
        { haystack: "hello", needle: "ll", expected: 2, description: "Basic match" },
        { haystack: "aaaaa", needle: "bba", expected: -1, description: "No match" },
        { haystack: "", needle: "", expected: 0, description: "Both empty" },
        { haystack: "abc", needle: "", expected: 0, description: "Empty needle" },
        
        // Edge cases
        { haystack: "a", needle: "a", expected: 0, description: "Single character match" },
        { haystack: "a", needle: "b", expected: -1, description: "Single character no match" },
        { haystack: "abc", needle: "abcd", expected: -1, description: "Needle longer than haystack" },
        
        // Multiple occurrences
        { haystack: "sadbutsad", needle: "sad", expected: 0, description: "First of multiple" },
        { haystack: "abababab", needle: "abab", expected: 0, description: "Overlapping patterns" },
        
        // Complex patterns
        { haystack: "mississippi", needle: "issip", expected: 4, description: "Complex pattern" },
        { haystack: "aabaaabaaac", needle: "aabaaac", expected: 4, description: "KMP advantage case" },
        
        // Unicode
        { haystack: "café", needle: "fé", expected: 2, description: "Unicode characters" },
        { haystack: "😀😂😀😂", needle: "😂😀", expected: 1, description: "Emoji patterns" }
    ];
    
    const implementations = [
        { name: "Brute Force", func: findFirstOccurrenceBruteForce },
        { name: "KMP Algorithm", func: findFirstOccurrence },
        { name: "Built-in indexOf", func: findFirstOccurrenceBuiltIn }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name}:`);
        let passed = 0;
        
        testCases.forEach(test => {
            try {
                const result = impl.func(test.haystack, test.needle);
                const success = result === test.expected;
                
                console.log(`  ${success ? '✓' : '✗'} ${test.description}`);
                if (!success) {
                    console.log(`    Input: "${test.haystack}", "${test.needle}"`);
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

testFindFirstOccurrence();
```

### Performance Benchmark
```javascript
function benchmarkSubstringSearch() {
    // Generate test strings with worst-case scenarios for brute force
    const generateWorstCase = (n, m) => {
        const haystack = 'a'.repeat(n - 1) + 'b';
        const needle = 'a'.repeat(m - 1) + 'b';
        return { haystack, needle };
    };
    
    const testCases = [
        { name: "Normal case", haystack: "x".repeat(10000), needle: "xyz" },
        { name: "Worst case small", ...generateWorstCase(1000, 10) },
        { name: "Worst case medium", ...generateWorstCase(5000, 50) },
        { name: "Best case", haystack: "abcd".repeat(2500), needle: "abcd" }
    ];
    
    const implementations = [
        { name: "Brute Force", func: findFirstOccurrenceBruteForce },
        { name: "KMP Algorithm", func: findFirstOccurrence },
        { name: "Built-in indexOf", func: findFirstOccurrenceBuiltIn }
    ];
    
    testCases.forEach(testCase => {
        console.log(`\n${testCase.name}:`);
        console.log(`  Haystack length: ${testCase.haystack.length}`);
        console.log(`  Needle length: ${testCase.needle.length}`);
        
        implementations.forEach(impl => {
            const start = performance.now();
            const iterations = 100;
            
            for (let i = 0; i < iterations; i++) {
                impl.func(testCase.haystack, testCase.needle);
            }
            
            const end = performance.now();
            const avgTime = (end - start) / iterations;
            console.log(`  ${impl.name}: ${avgTime.toFixed(4)}ms avg`);
        });
    });
}
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. Search Functionality
```javascript
// Implement search highlighting in text content
function highlightSearchTerms(text, searchTerm) {
    if (!searchTerm) return text;
    
    const index = findFirstOccurrence(text.toLowerCase(), searchTerm.toLowerCase());
    if (index === -1) return text;
    
    // Highlight all occurrences
    const regex = new RegExp(`(${escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Usage in search components
class SearchHighlighter {
    constructor(content) {
        this.content = content;
    }
    
    highlight(searchTerm) {
        return highlightSearchTerms(this.content, searchTerm);
    }
    
    findAllOccurrences(searchTerm) {
        const occurrences = [];
        let startIndex = 0;
        
        while (startIndex < this.content.length) {
            const index = findFirstOccurrence(
                this.content.slice(startIndex).toLowerCase(), 
                searchTerm.toLowerCase()
            );
            
            if (index === -1) break;
            
            const actualIndex = startIndex + index;
            occurrences.push({
                index: actualIndex,
                text: this.content.slice(actualIndex, actualIndex + searchTerm.length)
            });
            
            startIndex = actualIndex + 1;
        }
        
        return occurrences;
    }
}
```

#### 2. URL Pattern Matching
```javascript
// Find route patterns in URLs
function findRoutePattern(url, pattern) {
    // Convert route pattern to searchable format
    // /users/:id/posts -> /users/*/posts
    const searchPattern = pattern.replace(/:[^/]+/g, '*');
    
    // Simple pattern matching using substring search
    if (searchPattern.includes('*')) {
        const parts = searchPattern.split('*');
        let currentIndex = 0;
        
        for (const part of parts) {
            if (part === '') continue;
            
            const index = findFirstOccurrence(url.slice(currentIndex), part);
            if (index === -1) return -1;
            
            currentIndex += index + part.length;
        }
        
        return 0; // Pattern matches
    }
    
    return findFirstOccurrence(url, searchPattern);
}

// Usage in routing
class SimpleRouter {
    constructor() {
        this.routes = [];
    }
    
    addRoute(pattern, handler) {
        this.routes.push({ pattern, handler });
    }
    
    match(url) {
        for (const route of this.routes) {
            if (findRoutePattern(url, route.pattern) !== -1) {
                return route.handler;
            }
        }
        return null;
    }
}
```

#### 3. Template String Processing
```javascript
// Find placeholder patterns in templates
function findTemplatePlaceholders(template, placeholderStart = '{{', placeholderEnd = '}}') {
    const placeholders = [];
    let startIndex = 0;
    
    while (startIndex < template.length) {
        const start = findFirstOccurrence(template.slice(startIndex), placeholderStart);
        if (start === -1) break;
        
        const actualStart = startIndex + start;
        const endSearch = template.slice(actualStart + placeholderStart.length);
        const end = findFirstOccurrence(endSearch, placeholderEnd);
        
        if (end === -1) break;
        
        const actualEnd = actualStart + placeholderStart.length + end + placeholderEnd.length;
        const placeholder = template.slice(actualStart, actualEnd);
        const variable = template.slice(
            actualStart + placeholderStart.length, 
            actualEnd - placeholderEnd.length
        ).trim();
        
        placeholders.push({
            placeholder,
            variable,
            startIndex: actualStart,
            endIndex: actualEnd
        });
        
        startIndex = actualEnd;
    }
    
    return placeholders;
}

// Template processor
class TemplateProcessor {
    constructor(template) {
        this.template = template;
        this.placeholders = findTemplatePlaceholders(template);
    }
    
    render(data) {
        let result = this.template;
        
        // Replace in reverse order to maintain indices
        for (let i = this.placeholders.length - 1; i >= 0; i--) {
            const { placeholder, variable } = this.placeholders[i];
            const value = data[variable] || '';
            result = result.replace(placeholder, value);
        }
        
        return result;
    }
}
```


## Interview Tips

### Discussion Points
1. **Algorithm Choice**: When to use brute force vs KMP
2. **Built-in Methods**: JavaScript indexOf() implementation details
3. **Unicode Handling**: Character encoding considerations
4. **Performance**: Time-space tradeoffs

### Common Follow-ups
1. **"Find all occurrences"** → Modify to continue searching
2. **"Case-insensitive search"** → Preprocessing strings
3. **"Fuzzy matching"** → Allow character mismatches
4. **"Multiple patterns"** → Aho-Corasick algorithm

### Microsoft-Specific Context
1. **Search Features**: Text search in applications like Office
2. **Code Editors**: Find/replace functionality
3. **Template Processing**: Variable substitution in templates
4. **URL Routing**: Pattern matching in web frameworks

## Key Takeaways

1. **Built-in First**: Use JavaScript's indexOf() for production code
2. **Understand Algorithms**: Know brute force and KMP for interviews
3. **Edge Cases**: Empty strings, Unicode, case sensitivity
4. **Performance**: KMP shines with repetitive patterns
5. **Frontend Applications**: Search, routing, template processing 