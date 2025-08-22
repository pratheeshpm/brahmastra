# Valid Palindrome

## Problem Statement
A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.

**LeetCode Problem Number: 125**

## Sample Input and Output
**Input:** `s = "A man, a plan, a canal: Panama"`
**Output:** `true`
**Explanation:** "amanaplanacanalpanama" is a palindrome.

**Input:** `s = "race a car"`
**Output:** `false`
**Explanation:** "raceacar" is not a palindrome.

**Input:** `s = " "`
**Output:** `true`
**Explanation:** After removing non-alphanumeric characters, s becomes an empty string "" which is a palindrome.

## Algorithm Outline
The most efficient approach uses **two pointers**:

1. Initialize two pointers: left at start, right at end
2. Move pointers towards each other:
   - Skip non-alphanumeric characters
   - Compare characters (case-insensitive)
   - If mismatch found, return false
3. If all characters match, return true

Alternative approaches:
- **Clean and reverse**: Remove non-alphanumeric, convert to lowercase, compare with reverse
- **Recursive**: Similar logic with recursion

## Step-by-Step Dry Run
Let's trace through `s = "A man, a plan, a canal: Panama"`:

1. **Initialize:** left = 0, right = 32 (length - 1)

2. **Step 1:**
   - s[left=0] = 'A' → alphanumeric, lowercase = 'a'
   - s[right=32] = 'a' → alphanumeric, lowercase = 'a'
   - Match! Move both: left = 1, right = 31

3. **Step 2:**
   - s[left=1] = ' ' → not alphanumeric, move left: left = 2
   - s[right=31] = 'm' → alphanumeric, lowercase = 'm'

4. **Step 3:**
   - s[left=2] = 'm' → alphanumeric, lowercase = 'm'
   - s[right=31] = 'm' → alphanumeric, lowercase = 'm'
   - Match! Move both: left = 3, right = 30

5. **Continue this process...**
   - Skip non-alphanumeric characters
   - Compare: a-a, m-m, a-a, n-n, a-a, p-p, l-l, a-a, n-n, a-a, c-c, a-a, n-n, a-a, l-l, p-p, a-a, n-n, a-a, m-m, a-a

6. **All characters match** → return true

**Cleaned string:** "amanaplanacanalpanama" which is indeed a palindrome.

## JavaScript Implementation

```javascript
// Approach 1: Two Pointers (Optimal)
function isPalindrome(s) {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        // Skip non-alphanumeric characters from left
        while (left < right && !isAlphanumeric(s[left])) {
            left++;
        }
        
        // Skip non-alphanumeric characters from right
        while (left < right && !isAlphanumeric(s[right])) {
            right--;
        }
        
        // Compare characters (case-insensitive)
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}

// Helper function to check if character is alphanumeric
function isAlphanumeric(char) {
    return /^[a-zA-Z0-9]$/.test(char);
}

// Approach 2: Clean and Compare
function isPalindromeClean(s) {
    // Remove non-alphanumeric and convert to lowercase
    const cleaned = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Compare with reverse
    const reversed = cleaned.split('').reverse().join('');
    return cleaned === reversed;
}

// Approach 3: Two Pointers with manual character check
function isPalindromeManual(s) {
    const isAlphanumeric = (char) => {
        const code = char.charCodeAt(0);
        return (code >= 48 && code <= 57) ||   // 0-9
               (code >= 65 && code <= 90) ||   // A-Z
               (code >= 97 && code <= 122);    // a-z
    };
    
    const toLowerCase = (char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            return String.fromCharCode(code + 32);
        }
        return char;
    };
    
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        while (left < right && !isAlphanumeric(s[left])) {
            left++;
        }
        
        while (left < right && !isAlphanumeric(s[right])) {
            right--;
        }
        
        if (toLowerCase(s[left]) !== toLowerCase(s[right])) {
            return false;
        }
        
        left++;
        right--;
    }
    
    return true;
}

// Approach 4: Recursive solution
function isPalindromeRecursive(s) {
    function helper(left, right) {
        // Base case
        if (left >= right) return true;
        
        // Skip non-alphanumeric from left
        if (!isAlphanumeric(s[left])) {
            return helper(left + 1, right);
        }
        
        // Skip non-alphanumeric from right
        if (!isAlphanumeric(s[right])) {
            return helper(left, right - 1);
        }
        
        // Compare characters
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        
        return helper(left + 1, right - 1);
    }
    
    return helper(0, s.length - 1);
}

// Approach 5: Using array for better performance
function isPalindromeArray(s) {
    const chars = [];
    
    // Extract alphanumeric characters and convert to lowercase
    for (const char of s) {
        if (isAlphanumeric(char)) {
            chars.push(char.toLowerCase());
        }
    }
    
    // Check palindrome using two pointers
    let left = 0;
    let right = chars.length - 1;
    
    while (left < right) {
        if (chars[left] !== chars[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}

// Approach 6: One-pass with string building
function isPalindromeOnePass(s) {
    let cleaned = '';
    
    // Build cleaned string
    for (const char of s) {
        if (isAlphanumeric(char)) {
            cleaned += char.toLowerCase();
        }
    }
    
    // Check if palindrome
    const n = cleaned.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
        if (cleaned[i] !== cleaned[n - 1 - i]) {
            return false;
        }
    }
    
    return true;
}

// Advanced: Handle Unicode characters
function isPalindromeUnicode(s) {
    // Normalize and remove non-alphanumeric Unicode characters
    const cleaned = s.normalize('NFD')
                     .replace(/[\u0300-\u036f]/g, '') // Remove accents
                     .replace(/[^\p{L}\p{N}]/gu, '')   // Keep only letters and numbers
                     .toLowerCase();
    
    let left = 0;
    let right = cleaned.length - 1;
    
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}

// Test the solution
function testIsPalindrome() {
    const testCases = [
        "A man, a plan, a canal: Panama",
        "race a car",
        " ",
        "Madam",
        "No 'x' in Nixon",
        "Was it a car or a cat I saw?",
        "12321",
        "12345",
        "",
        "a"
    ];
    
    console.log("Testing isPalindrome function:");
    testCases.forEach((test, index) => {
        const result = isPalindrome(test);
        console.log(`Test ${index + 1}: "${test}" -> ${result}`);
    });
    
    // Performance comparison
    const longString = "A man, a plan, a canal: Panama".repeat(1000);
    
    console.time("Two Pointers");
    isPalindrome(longString);
    console.timeEnd("Two Pointers");
    
    console.time("Clean and Compare");
    isPalindromeClean(longString);
    console.timeEnd("Clean and Compare");
    
    console.time("Array Approach");
    isPalindromeArray(longString);
    console.timeEnd("Array Approach");
}

// Extended: Valid Palindrome II (at most one character deletion)
function validPalindromeII(s) {
    function isPalindromeRange(left, right) {
        while (left < right) {
            if (s[left] !== s[right]) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
    
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        if (s[left] !== s[right]) {
            // Try deleting either left or right character
            return isPalindromeRange(left + 1, right) || 
                   isPalindromeRange(left, right - 1);
        }
        left++;
        right--;
    }
    
    return true;
}
```

## Time and Space Complexity Analysis

**Two Pointers Approach (Optimal):**
- **Time Complexity:** O(n)
  - Single pass through the string
  - Each character is examined at most once
  - Character operations (isAlphanumeric, toLowerCase) are O(1)

- **Space Complexity:** O(1)
  - Only using constant extra space for pointers and variables
  - No additional data structures needed

**Clean and Compare Approach:**
- **Time Complexity:** O(n)
  - O(n) to clean the string
  - O(n) to reverse the string
  - O(n) to compare strings

- **Space Complexity:** O(n)
  - Creating cleaned string takes O(n) space
  - Reversed string takes another O(n) space

**Array Approach:**
- **Time Complexity:** O(n)
  - O(n) to extract and clean characters
  - O(n) to check palindrome

- **Space Complexity:** O(n)
  - Array to store cleaned characters takes O(n) space

**Recursive Approach:**
- **Time Complexity:** O(n)
  - Each character processed once
  - Recursion depth is at most O(n)

- **Space Complexity:** O(n)
  - Recursion call stack can go up to O(n) deep
  - In worst case (all characters need to be checked)

**Key Insights:**
1. **Two pointers is optimal:** Best time and space complexity
2. **Character validation:** Need to handle both letters and digits
3. **Case insensitive:** Convert to lowercase for comparison
4. **Skip non-alphanumeric:** Move pointers past invalid characters
5. **Early termination:** Return false as soon as mismatch is found