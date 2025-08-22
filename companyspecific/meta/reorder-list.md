# Reorder List - LeetCode #143

## Problem Explanation
Reorder a singly linked list L₀ → L₁ → … → Lₙ₋₁ → Lₙ to L₀ → Lₙ → L₁ → Lₙ₋₁ → L₂ → Lₙ₋₂ → …
You may not modify the values in the list's nodes. Only nodes themselves may be changed.

## Sample Input and Output

**Example 1:**
```
Input: head = [1,2,3,4]
Output: [1,4,2,3]
Explanation: L₀→L₁→L₂→L₃ becomes L₀→L₃→L₁→L₂
```

**Example 2:**
```
Input: head = [1,2,3,4,5]
Output: [1,5,2,4,3]
Explanation: L₀→L₁→L₂→L₃→L₄ becomes L₀→L₄→L₁→L₃→L₂
```

**Example 3:**
```
Input: head = [1,2]
Output: [1,2]
Explanation: Already in desired format
```

## Algorithm Outline
1. **Find middle**: Use slow/fast pointers to find middle of list
2. **Split**: Break list into two halves
3. **Reverse**: Reverse the second half
4. **Merge**: Alternate nodes from first and reversed second half

## Step-by-Step Dry Run
Using input `head = [1,2,3,4,5]`:

**Step 1 - Find middle:**
- slow = 1, fast = 1 (start)
- slow = 2, fast = 3 (after 1st move)
- slow = 3, fast = 5 (after 2nd move)
- fast.next = null, stop. Middle = 3

**Step 2 - Split:**
- First half: 1 → 2 → 3
- Second half: 4 → 5 (break connection after slow)

**Step 3 - Reverse second half:**
- Original: 4 → 5
- Reversed: 5 → 4

**Step 4 - Merge alternating:**
- Take 1 from first, 5 from second: 1 → 5
- Take 2 from first, 4 from second: 1 → 5 → 2 → 4  
- Take 3 from first: 1 → 5 → 2 → 4 → 3
- Final: [1,5,2,4,3]

## JavaScript Implementation

```javascript
// Definition for singly-linked list
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
}

function reorderList(head) {
    if (!head || !head.next || !head.next.next) {
        return; // List has 0, 1, or 2 nodes
    }
    
    // Step 1: Find the middle of the list
    const middle = findMiddle(head);
    
    // Step 2: Split the list into two halves
    const secondHalf = middle.next;
    middle.next = null;
    
    // Step 3: Reverse the second half
    const reversedSecond = reverseList(secondHalf);
    
    // Step 4: Merge the two halves alternately
    mergeLists(head, reversedSecond);
}

function findMiddle(head) {
    let slow = head;
    let fast = head;
    
    // Move slow one step and fast two steps
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return slow;
}

function reverseList(head) {
    let prev = null;
    let current = head;
    
    while (current) {
        const nextNode = current.next;
        current.next = prev;
        prev = current;
        current = nextNode;
    }
    
    return prev;
}

function mergeLists(first, second) {
    while (second) {
        const firstNext = first.next;
        const secondNext = second.next;
        
        first.next = second;
        second.next = firstNext;
        
        first = firstNext;
        second = secondNext;
    }
}

// Alternative implementation - all in one function
function reorderListInline(head) {
    if (!head || !head.next) return;
    
    // Find middle
    let slow = head, fast = head;
    while (fast.next && fast.next.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    // Split and reverse second half
    let second = slow.next;
    slow.next = null;
    
    let prev = null;
    while (second) {
        let temp = second.next;
        second.next = prev;
        prev = second;
        second = temp;
    }
    second = prev;
    
    // Merge
    let first = head;
    while (second) {
        let temp1 = first.next;
        let temp2 = second.next;
        
        first.next = second;
        second.next = temp1;
        
        first = temp1;
        second = temp2;
    }
}

// Stack-based approach (uses O(n) extra space)
function reorderListStack(head) {
    if (!head || !head.next) return;
    
    // Push all nodes to stack
    const stack = [];
    let current = head;
    while (current) {
        stack.push(current);
        current = current.next;
    }
    
    // Reorder using stack
    current = head;
    let count = 0;
    const totalNodes = stack.length;
    
    while (count < Math.floor(totalNodes / 2)) {
        const tail = stack.pop();
        const nextNode = current.next;
        
        current.next = tail;
        tail.next = nextNode;
        current = nextNode;
        count++;
    }
    
    // Cut off the remaining part
    current.next = null;
}

// Helper functions for testing
function createLinkedList(arr) {
    if (!arr.length) return null;
    
    const head = new ListNode(arr[0]);
    let current = head;
    
    for (let i = 1; i < arr.length; i++) {
        current.next = new ListNode(arr[i]);
        current = current.next;
    }
    
    return head;
}

function linkedListToArray(head) {
    const result = [];
    let current = head;
    
    while (current) {
        result.push(current.val);
        current = current.next;
    }
    
    return result;
}

// Test cases
function testReorderList() {
    const testCases = [
        [1, 2, 3, 4],
        [1, 2, 3, 4, 5],
        [1, 2],
        [1],
        [1, 2, 3],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6, 7]
    ];
    
    console.log("Testing reorderList:");
    
    testCases.forEach((test, index) => {
        const original = [...test];
        const head = createLinkedList(test);
        
        reorderList(head);
        const result = linkedListToArray(head);
        
        console.log(`Test ${index + 1}:`);
        console.log(`Input:  [${original.join(', ')}]`);
        console.log(`Output: [${result.join(', ')}]`);
        console.log();
    });
}

// Verify the pattern manually
function verifyReorderPattern(original, reordered) {
    const n = original.length;
    const expected = [];
    
    let left = 0;
    let right = n - 1;
    let takeFromLeft = true;
    
    while (left <= right) {
        if (takeFromLeft) {
            expected.push(original[left++]);
        } else {
            expected.push(original[right--]);
        }
        takeFromLeft = !takeFromLeft;
    }
    
    return JSON.stringify(expected) === JSON.stringify(reordered);
}

// Performance comparison
function compareApproaches() {
    const largeList = Array.from({length: 10000}, (_, i) => i + 1);
    
    console.time("Standard approach");
    const head1 = createLinkedList([...largeList]);
    reorderList(head1);
    console.timeEnd("Standard approach");
    
    console.time("Stack approach");
    const head2 = createLinkedList([...largeList]);
    reorderListStack(head2);
    console.timeEnd("Stack approach");
}

// testReorderList();
```

## Time and Space Complexity

**Standard Approach (Optimal):**
- **Time Complexity:** O(n) where n = number of nodes
  - Finding middle: O(n)
  - Reversing second half: O(n/2) = O(n)
  - Merging: O(n/2) = O(n)
  - Total: O(n)

- **Space Complexity:** O(1)
  - Only uses constant extra space for pointers
  - All operations done in-place

**Stack Approach:**
- **Time Complexity:** O(n)
  - One pass to push to stack: O(n)
  - One pass to reorder: O(n)

- **Space Complexity:** O(n)
  - Stack stores all n nodes

**Key Insights:**
1. **Two-pointer technique**: Essential for finding middle efficiently
2. **List reversal**: Classic technique that's reusable
3. **Alternating merge**: Pattern useful for many list problems
4. **In-place operations**: Achieves O(1) space by modifying pointers

**Pattern Applications:**
- This problem combines three fundamental linked list techniques
- Similar patterns appear in "Palindrome Linked List", "Merge Sort for Lists"
- The "split-process-merge" paradigm is widely applicable

**Edge Cases Handled:**
- Empty list or single node
- Two nodes (already in correct order)
- Odd vs even length lists
- Proper null termination after reordering