# Group Anagrams - LeetCode #49

## Problem Explanation
Given an array of strings, group the anagrams together. An anagram is a word formed by rearranging the letters of another word, such as "eat" and "tea". Return the groups in any order.

## Sample Input and Output

**Example 1:**
```
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
Explanation: 
- "eat", "tea", "ate" are anagrams (same letters)
- "tan", "nat" are anagrams
- "bat" stands alone
```

**Example 2:**
```
Input: strs = [""]
Output: [[""]]
Explanation: Empty string forms its own group
```

**Example 3:**
```
Input: strs = ["a"]
Output: [["a"]]
Explanation: Single character forms its own group
```

## Algorithm Outline
1. **Use HashMap**: Map sorted string → list of anagrams
2. **Process each string**: Sort characters to get canonical form
3. **Group by key**: Add string to corresponding group in map
4. **Return groups**: Extract all values from map as result

## Step-by-Step Dry Run
Using input `strs = ["eat","tea","tan","ate","nat","bat"]`:

1. **Process "eat"**: Sort → "aet", map["aet"] = ["eat"]
2. **Process "tea"**: Sort → "aet", map["aet"] = ["eat", "tea"]
3. **Process "tan"**: Sort → "ant", map["ant"] = ["tan"]
4. **Process "ate"**: Sort → "aet", map["aet"] = ["eat", "tea", "ate"]
5. **Process "nat"**: Sort → "ant", map["ant"] = ["tan", "nat"]
6. **Process "bat"**: Sort → "abt", map["abt"] = ["bat"]
7. **Final map**: {"aet": ["eat","tea","ate"], "ant": ["tan","nat"], "abt": ["bat"]}
8. **Result**: [["eat","tea","ate"], ["tan","nat"], ["bat"]]

## JavaScript Implementation

```javascript
function groupAnagrams(strs) {
    const anagramMap = new Map();
    
    for (const str of strs) {
        // Sort characters to create canonical form
        const sortedStr = str.split('').sort().join('');
        
        // Group strings with same sorted form
        if (!anagramMap.has(sortedStr)) {
            anagramMap.set(sortedStr, []);
        }
        anagramMap.get(sortedStr).push(str);
    }
    
    // Return all groups
    return Array.from(anagramMap.values());
}

// Alternative approach using character frequency
function groupAnagramsFrequency(strs) {
    const anagramMap = new Map();
    
    for (const str of strs) {
        // Create frequency signature
        const freq = new Array(26).fill(0);
        for (const char of str) {
            freq[char.charCodeAt(0) - 'a'.charCodeAt(0)]++;
        }
        
        // Use frequency array as key
        const key = freq.join(',');
        
        if (!anagramMap.has(key)) {
            anagramMap.set(key, []);
        }
        anagramMap.get(key).push(str);
    }
    
    return Array.from(anagramMap.values());
}

// Optimized approach with prime number hashing
function groupAnagramsPrime(strs) {
    // Prime numbers for each letter
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101];
    
    const anagramMap = new Map();
    
    for (const str of strs) {
        // Calculate prime product hash
        let hash = 1;
        for (const char of str) {
            hash *= primes[char.charCodeAt(0) - 'a'.charCodeAt(0)];
        }
        
        if (!anagramMap.has(hash)) {
            anagramMap.set(hash, []);
        }
        anagramMap.get(hash).push(str);
    }
    
    return Array.from(anagramMap.values());
}

// Using Object instead of Map (alternative implementation)
function groupAnagramsObject(strs) {
    const anagramGroups = {};
    
    for (const str of strs) {
        const sortedStr = str.split('').sort().join('');
        
        if (!anagramGroups[sortedStr]) {
            anagramGroups[sortedStr] = [];
        }
        anagramGroups[sortedStr].push(str);
    }
    
    return Object.values(anagramGroups);
}

// Helper function to verify if two strings are anagrams
function areAnagrams(str1, str2) {
    if (str1.length !== str2.length) return false;
    
    const freq1 = {};
    const freq2 = {};
    
    for (const char of str1) {
        freq1[char] = (freq1[char] || 0) + 1;
    }
    
    for (const char of str2) {
        freq2[char] = (freq2[char] || 0) + 1;
    }
    
    for (const char in freq1) {
        if (freq1[char] !== freq2[char]) return false;
    }
    
    return true;
}

// Test cases
function testGroupAnagrams() {
    const testCases = [
        ["eat", "tea", "tan", "ate", "nat", "bat"],
        [""],
        ["a"],
        ["abc", "bca", "cab", "xyz", "zyx", "yxz"],
        ["ab", "ba", "abc", "cba", "bac", "acb"],
        ["listen", "silent", "hello", "world"]
    ];
    
    console.log("Testing groupAnagrams (sorting approach):");
    testCases.forEach((input, index) => {
        const result = groupAnagrams([...input]);
        console.log(`Test ${index + 1}:`);
        console.log(`Input: [${input.map(s => `"${s}"`).join(', ')}]`);
        console.log(`Output: [${result.map(group => `[${group.map(s => `"${s}"`).join(', ')}]`).join(', ')}]`);
        console.log();
    });
    
    console.log("Testing groupAnagramsFrequency:");
    testCases.forEach((input, index) => {
        const result = groupAnagramsFrequency([...input]);
        console.log(`Test ${index + 1}: [${result.map(group => `[${group.map(s => `"${s}"`).join(', ')}]`).join(', ')}]`);
    });
}

// Performance comparison
function comparePerformance() {
    const largeInput = [];
    for (let i = 0; i < 1000; i++) {
        largeInput.push(Math.random().toString(36).substring(2, 8));
    }
    
    console.time("Sorting approach");
    groupAnagrams([...largeInput]);
    console.timeEnd("Sorting approach");
    
    console.time("Frequency approach");
    groupAnagramsFrequency([...largeInput]);
    console.timeEnd("Frequency approach");
    
    console.time("Prime hashing approach");
    groupAnagramsPrime([...largeInput]);
    console.timeEnd("Prime hashing approach");
}

// testGroupAnagrams();
```

## Time and Space Complexity

**Approach 1 - Sorting:**
- **Time Complexity:** O(n × k log k) where n = number of strings, k = maximum length of string
  - Sorting each string takes O(k log k)
  - We do this for n strings
- **Space Complexity:** O(n × k) for storing all strings in groups

**Approach 2 - Character Frequency:**
- **Time Complexity:** O(n × k) where n = number of strings, k = maximum length of string
  - Counting frequency takes O(k) per string
  - Creating frequency key takes O(26) = O(1)
- **Space Complexity:** O(n × k) for storing all strings in groups

**Approach 3 - Prime Hashing:**
- **Time Complexity:** O(n × k)
  - Computing prime product takes O(k) per string
- **Space Complexity:** O(n × k)
- **Note:** Risk of integer overflow for long strings

**Comparison:**
1. **Sorting**: Simple but slower due to O(k log k) per string
2. **Frequency**: Faster O(k) per string, but more space for keys
3. **Prime hashing**: Fastest but potential overflow issues

**Best Choice:** Character frequency approach for most practical cases - good balance of speed and reliability.