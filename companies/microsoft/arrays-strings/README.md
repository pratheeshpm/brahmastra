# Arrays & Strings - Microsoft Frontend Staff Engineer Interview

This folder contains solutions to Arrays & Strings questions commonly asked in Microsoft Frontend Staff Engineer interviews.

## Question Categories

### Easy Level
- [Remove Duplicates from Array](./remove-duplicates-array.md)
- [Detect Unique Characters in String](./unique-characters-string.md)
- [Valid Parentheses](./valid-parentheses.md)
- [Two Sum](./two-sum.md)
- [First Occurrence Substring](./first-occurrence-substring.md)

### Medium Level
- [Search in Rotated Sorted Array](./search-rotated-array.md)
- [Three Sum](./three-sum.md)
- [Maximum Subarray Sum](./maximum-subarray-sum.md)
- [Longest Substring Without Repeating Characters](./longest-substring-no-repeat.md)
- [Merge Two Sorted Arrays](./merge-sorted-arrays.md)
- [String Permutations](./string-permutations.md)
- [Longest Common Prefix](./longest-common-prefix.md)

### Hard Level
- [Minimum Window Substring](./minimum-window-substring.md)
- [Palindrome Substring Count](./palindrome-substring-count.md)

## Key Patterns to Master

1. **Two Pointers**: Used for problems involving pairs, palindromes, or sorted arrays
2. **Sliding Window**: For substring/subarray problems with constraints
3. **Hash Maps**: For counting frequencies or tracking seen elements
4. **String Manipulation**: Understanding JavaScript string methods and immutability
5. **Array Manipulation**: In-place operations, sorting, searching

## Frontend-Specific Considerations

- **String Processing**: Often used in text editors, search functionality, validation
- **Array Operations**: Common in data manipulation for UI components, filtering, sorting
- **Performance**: Understanding time/space complexity for large datasets in web apps
- **Browser Compatibility**: Knowing which array/string methods are available across browsers

## Time Complexity Goals

- Easy problems: O(n) or better
- Medium problems: O(n log n) or better
- Hard problems: Optimize from brute force to best possible solution

## Common JavaScript Patterns

```javascript
// Two pointers
let left = 0, right = arr.length - 1;

// Sliding window
let windowStart = 0;
for (let windowEnd = 0; windowEnd < arr.length; windowEnd++) {
  // expand window
  while (/* condition */) {
    // shrink window
    windowStart++;
  }
}

// Hash map for frequency counting
const charCount = new Map();
for (const char of str) {
  charCount.set(char, (charCount.get(char) || 0) + 1);
}
```

## Interview Tips

1. **Clarify Requirements**: Ask about edge cases, input constraints
2. **Start with Brute Force**: Explain the naive approach first
3. **Optimize Step by Step**: Identify bottlenecks and improve
4. **Code Clearly**: Use meaningful variable names, add comments
5. **Test with Examples**: Walk through your solution with given examples
6. **Discuss Trade-offs**: Explain time vs space complexity trade-offs 