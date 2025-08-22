# Add Two Numbers

## Problem Statement
You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

**LeetCode Problem Number: 2**

## Sample Input and Output
**Input:** `l1 = [2,4,3]`, `l2 = [5,6,4]`
**Output:** `[7,0,8]`
**Explanation:** 342 + 465 = 807.

**Input:** `l1 = [0]`, `l2 = [0]`
**Output:** `[0]`

**Input:** `l1 = [9,9,9,9,9,9,9]`, `l2 = [9,9,9,9]`
**Output:** `[8,9,9,9,0,0,0,1]`
**Explanation:** 9999999 + 9999 = 10009998.

## Algorithm Outline
The approach simulates **elementary addition with carry**:

1. Initialize a dummy head for the result linked list
2. Traverse both linked lists simultaneously
3. For each position, add corresponding digits plus any carry from previous position
4. Create new node with sum % 10, update carry = sum / 10
5. Continue until both lists are exhausted and no carry remains
6. Return the result list (skip dummy head)

## Step-by-Step Dry Run
Let's trace through `l1 = [2,4,3]`, `l2 = [5,6,4]`:

**Represents:** 342 + 465 = 807

1. **Position 0:**
   - l1: 2, l2: 5, carry: 0
   - sum = 2 + 5 + 0 = 7
   - result digit: 7, new carry: 0
   - Result so far: [7]

2. **Position 1:**
   - l1: 4, l2: 6, carry: 0
   - sum = 4 + 6 + 0 = 10
   - result digit: 0, new carry: 1
   - Result so far: [7,0]

3. **Position 2:**
   - l1: 3, l2: 4, carry: 1
   - sum = 3 + 4 + 1 = 8
   - result digit: 8, new carry: 0
   - Result so far: [7,0,8]

4. **Both lists exhausted, carry = 0**
   - Final result: [7,0,8] representing 807

## JavaScript Implementation

```javascript
// Definition for singly-linked list
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
}

// Main solution
function addTwoNumbers(l1, l2) {
    const dummyHead = new ListNode(0);
    let current = dummyHead;
    let carry = 0;
    
    while (l1 !== null || l2 !== null || carry !== 0) {
        // Get values from current nodes (0 if null)
        const val1 = l1 ? l1.val : 0;
        const val2 = l2 ? l2.val : 0;
        
        // Calculate sum
        const sum = val1 + val2 + carry;
        carry = Math.floor(sum / 10);
        const digit = sum % 10;
        
        // Create new node for result
        current.next = new ListNode(digit);
        current = current.next;
        
        // Move to next nodes if they exist
        if (l1) l1 = l1.next;
        if (l2) l2 = l2.next;
    }
    
    return dummyHead.next;
}

// Alternative implementation with more explicit logic
function addTwoNumbersVerbose(l1, l2) {
    const dummyHead = new ListNode(0);
    let current = dummyHead;
    let carry = 0;
    
    while (l1 || l2) {
        const val1 = l1 ? l1.val : 0;
        const val2 = l2 ? l2.val : 0;
        const sum = val1 + val2 + carry;
        
        carry = Math.floor(sum / 10);
        current.next = new ListNode(sum % 10);
        current = current.next;
        
        if (l1) l1 = l1.next;
        if (l2) l2 = l2.next;
    }
    
    // Handle final carry
    if (carry > 0) {
        current.next = new ListNode(carry);
    }
    
    return dummyHead.next;
}

// Recursive solution (less memory efficient due to call stack)
function addTwoNumbersRecursive(l1, l2, carry = 0) {
    // Base case: both lists are null and no carry
    if (!l1 && !l2 && carry === 0) {
        return null;
    }
    
    const val1 = l1 ? l1.val : 0;
    const val2 = l2 ? l2.val : 0;
    const sum = val1 + val2 + carry;
    
    const newCarry = Math.floor(sum / 10);
    const digit = sum % 10;
    
    const result = new ListNode(digit);
    result.next = addTwoNumbersRecursive(
        l1 ? l1.next : null,
        l2 ? l2.next : null,
        newCarry
    );
    
    return result;
}

// Helper function to create linked list from array (for testing)
function createLinkedList(arr) {
    const dummyHead = new ListNode(0);
    let current = dummyHead;
    
    for (const val of arr) {
        current.next = new ListNode(val);
        current = current.next;
    }
    
    return dummyHead.next;
}

// Helper function to convert linked list to array (for testing)
function linkedListToArray(head) {
    const result = [];
    let current = head;
    
    while (current) {
        result.push(current.val);
        current = current.next;
    }
    
    return result;
}

// Test the solution
function testAddTwoNumbers() {
    // Test case 1: [2,4,3] + [5,6,4] = [7,0,8]
    const l1 = createLinkedList([2, 4, 3]);
    const l2 = createLinkedList([5, 6, 4]);
    const result = addTwoNumbers(l1, l2);
    console.log(linkedListToArray(result)); // [7, 0, 8]
    
    // Test case 2: [9,9,9,9,9,9,9] + [9,9,9,9] = [8,9,9,9,0,0,0,1]
    const l3 = createLinkedList([9, 9, 9, 9, 9, 9, 9]);
    const l4 = createLinkedList([9, 9, 9, 9]);
    const result2 = addTwoNumbers(l3, l4);
    console.log(linkedListToArray(result2)); // [8, 9, 9, 9, 0, 0, 0, 1]
}
```

## Time and Space Complexity Analysis

**Time Complexity:** O(max(m, n))
- Where m and n are the lengths of the two input linked lists
- We traverse both lists exactly once
- Each node is processed in constant time

**Space Complexity:** O(max(m, n) + 1)
- The result linked list has at most max(m, n) + 1 nodes
- Additional space for variables (carry, pointers) is O(1)
- Note: The space for the result list is typically not counted as "extra" space since it's the required output

**Recursive Solution Complexity:**
- **Time Complexity:** O(max(m, n)) - same as iterative
- **Space Complexity:** O(max(m, n)) - due to recursion call stack depth