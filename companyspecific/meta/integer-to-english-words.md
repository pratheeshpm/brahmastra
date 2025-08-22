# Integer to English Words - LeetCode #273

## Problem Explanation
Convert a non-negative integer `num` to its English words representation.

## Sample Input and Output

**Example 1:**
```
Input: num = 123
Output: "One Hundred Twenty Three"
```

**Example 2:**
```
Input: num = 12345
Output: "Twelve Thousand Three Hundred Forty Five"
```

**Example 3:**
```
Input: num = 1234567891
Output: "One Billion Two Hundred Thirty Four Million Five Hundred Sixty Seven Thousand Eight Hundred Ninety One"
```

## Algorithm Outline
1. **Handle zero**: Special case for 0
2. **Break into groups**: Split number into billions, millions, thousands, hundreds
3. **Convert each group**: Use helper to convert 3-digit groups
4. **Add scale words**: Append "Billion", "Million", "Thousand" as needed
5. **Combine results**: Join all parts with spaces

## Step-by-Step Dry Run
Using input `num = 12345`:

1. **Extract groups**:
   - Billions: 0 (skip)
   - Millions: 0 (skip)  
   - Thousands: 12 → "Twelve"
   - Remainder: 345 → "Three Hundred Forty Five"

2. **Combine**: "Twelve" + "Thousand" + "Three Hundred Forty Five"
3. **Result**: "Twelve Thousand Three Hundred Forty Five"

## JavaScript Implementation

```javascript
function numberToWords(num) {
    if (num === 0) return "Zero";
    
    const below20 = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
                     "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    const thousands = ["", "Thousand", "Million", "Billion"];
    
    function helper(num) {
        if (num === 0) return "";
        if (num < 20) return below20[num] + " ";
        if (num < 100) return tens[Math.floor(num / 10)] + " " + helper(num % 10);
        return below20[Math.floor(num / 100)] + " Hundred " + helper(num % 100);
    }
    
    let result = "";
    let i = 0;
    
    while (num > 0) {
        if (num % 1000 !== 0) {
            result = helper(num % 1000) + thousands[i] + " " + result;
        }
        num = Math.floor(num / 1000);
        i++;
    }
    
    return result.trim();
}
```

## Time and Space Complexity

**Time Complexity:** O(log n) - process each 3-digit group
**Space Complexity:** O(1) - constant space for arrays