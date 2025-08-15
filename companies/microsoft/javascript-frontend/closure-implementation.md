# Closure Implementation ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Implementation](#core-implementation)
  - [Basic Closure](#basic-closure)
  - [Advanced Closure Patterns](#advanced-closure-patterns)
  - [Module Pattern](#module-pattern)
- [Complexity Analysis](#complexity-analysis)
- [Testing](#testing)
- [Usage & Applications](#usage--applications)
  - [Private Variables](#private-variables)
  - [Factory Functions](#factory-functions)
  - [Partial Application](#partial-application)
  - [Data Encapsulation](#data-encapsulation)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Implement various closure patterns to demonstrate understanding of lexical scoping, data encapsulation, and function factories.

## Quick Start Example

```javascript
// 1. Basic closure - private counter
function createCounter() {
    let count = 0; // Private variable
    
    return function() {
        count++; // Access outer scope
        return count;
    };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1 (independent counter)

// 2. Module pattern with multiple methods
function createCalculator() {
    let result = 0; // Private state
    
    return {
        add: (x) => { result += x; return result; },
        subtract: (x) => { result -= x; return result; },
        multiply: (x) => { result *= x; return result; },
        getResult: () => result,
        reset: () => { result = 0; return result; }
    };
}

const calc = createCalculator();
calc.add(10).multiply(2).subtract(5); // Method chaining
console.log(calc.getResult()); // 15

// 3. Function factory with configuration
function createValidator(rules) {
    return function(value) {
        for (const rule of rules) {
            if (!rule(value)) {
                return false;
            }
        }
        return true;
    };
}

const emailValidator = createValidator([
    (val) => val.includes('@'),
    (val) => val.length > 5,
    (val) => /\.[a-z]+$/.test(val)
]);

console.log(emailValidator('test@example.com')); // true

// 4. React hook-like pattern using closures
function createUseState(initialValue) {
    let value = initialValue;
    const listeners = [];
    
    const setState = (newValue) => {
        value = typeof newValue === 'function' ? newValue(value) : newValue;
        listeners.forEach(listener => listener(value));
    };
    
    const subscribe = (listener) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    };
    
    return [() => value, setState, subscribe];
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Implementation

### Basic Closure

```javascript
// Simple closure demonstrating lexical scoping
function createCounter() {
    // Private variable - only accessible within this function and returned functions
    let count = 0;
    
    // Return a function that has access to the outer scope variable 'count'
    // This creates a closure: the inner function 'closes over' the outer variable
    return function() {
        count++; // Modify the outer scope variable
        return count; // Each call increments and returns the current count
    };
}

// Usage: each counter maintains its own independent count
const counter1 = createCounter(); // Creates first closure
const counter2 = createCounter(); // Creates second closure (independent)

console.log(counter1()); // 1 (first counter)
console.log(counter1()); // 2 (first counter)
console.log(counter2()); // 1 (second counter - independent)
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Advanced Closure Patterns

```javascript
// Advanced counter with multiple methods using closure
function createAdvancedCounter(initialValue = 0) {
    // Private variables - encapsulated within closure
    let count = initialValue;
    let history = []; // Track all operations
    
    // Return object with methods that access private variables
    return {
        // Increment and track operation
        increment() {
            count++;
            history.push({action: 'increment', value: count, timestamp: Date.now()});
            return count;
        },
        
        // Decrement and track operation
        decrement() {
            count--;
            history.push({action: 'decrement', value: count, timestamp: Date.now()});
            return count;
        },
        
        // Get current value without modification
        getValue() {
            return count;
        },
        
        // Reset to initial value
        reset() {
            count = initialValue;
            history.push({action: 'reset', value: count, timestamp: Date.now()});
            return count;
        },
        
        // Get operation history (returns copy to prevent mutation)
        getHistory() {
            return [...history];
        },
        
        // Add custom value
        add(value) {
            count += value;
            history.push({action: 'add', addedValue: value, value: count, timestamp: Date.now()});
            return count;
        }
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Module Pattern

```javascript
// Module pattern using IIFE (Immediately Invoked Function Expression) and closures
const Calculator = (function() {
    // Private variables and functions
    let memory = 0;
    let operations = [];
    
    // Private helper function
    function logOperation(operation, operand, result) {
        operations.push({
            operation,
            operand,
            result,
            timestamp: new Date().toISOString()
        });
    }
    
    // Return public API - only these methods are exposed
    return {
        // Public methods that access private variables
        add(value) {
            const result = memory + value;
            logOperation('add', value, result);
            memory = result;
            return this; // Enable method chaining
        },
        
        subtract(value) {
            const result = memory - value;
            logOperation('subtract', value, result);
            memory = result;
            return this;
        },
        
        multiply(value) {
            const result = memory * value;
            logOperation('multiply', value, result);
            memory = result;
            return this;
        },
        
        divide(value) {
            if (value === 0) throw new Error('Division by zero');
            const result = memory / value;
            logOperation('divide', value, result);
            memory = result;
            return this;
        },
        
        // Get current value
        getValue() {
            return memory;
        },
        
        // Clear memory
        clear() {
            memory = 0;
            operations = [];
            logOperation('clear', null, 0);
            return this;
        },
        
        // Get operation history
        getHistory() {
            return [...operations]; // Return copy to prevent external mutation
        }
    };
})();
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Complexity Analysis

### Time Complexity
- **Variable Access**: O(1) - closure variables are in scope
- **Function Creation**: O(1) - closure formation is constant time
- **Method Calls**: O(1) - accessing closure variables

### Space Complexity
- **Memory Overhead**: O(n) where n is the number of variables captured
- **Closure Chain**: O(d) where d is the depth of nested scopes

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
function testClosures() {
    // Test basic closure
    console.log('Testing Basic Closure:');
    const counter = createCounter();
    console.assert(counter() === 1, 'First call should return 1');
    console.assert(counter() === 2, 'Second call should return 2');
    
    // Test independence
    const counter2 = createCounter();
    console.assert(counter2() === 1, 'New counter should start at 1');
    console.assert(counter() === 3, 'Original counter should continue from where it left');
    
    // Test advanced counter
    console.log('\nTesting Advanced Counter:');
    const advCounter = createAdvancedCounter(10);
    console.assert(advCounter.getValue() === 10, 'Initial value should be 10');
    console.assert(advCounter.increment() === 11, 'Increment should return 11');
    console.assert(advCounter.add(5) === 16, 'Add 5 should return 16');
    console.assert(advCounter.reset() === 10, 'Reset should return to initial value');
    
    // Test calculator module
    console.log('\nTesting Calculator Module:');
    Calculator.clear();
    const result = Calculator.add(10).multiply(2).subtract(5).getValue();
    console.assert(result === 15, 'Calculator chain should result in 15');
    
    console.log('All closure tests passed! ✅');
}

testClosures();
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage & Applications

### Private Variables

```javascript
// Bank account with private balance
function createBankAccount(initialBalance = 0) {
    let balance = initialBalance; // Private variable
    let transactions = [];
    
    return {
        deposit(amount) {
            if (amount <= 0) throw new Error('Deposit amount must be positive');
            balance += amount;
            transactions.push({type: 'deposit', amount, balance, date: new Date()});
            return balance;
        },
        
        withdraw(amount) {
            if (amount <= 0) throw new Error('Withdrawal amount must be positive');
            if (amount > balance) throw new Error('Insufficient funds');
            balance -= amount;
            transactions.push({type: 'withdrawal', amount, balance, date: new Date()});
            return balance;
        },
        
        getBalance() {
            return balance; // Read-only access to private variable
        },
        
        getTransactions() {
            return [...transactions]; // Return copy to prevent mutation
        }
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Factory Functions

```javascript
// Factory function creating customized validators
function createValidator(rules) {
    // Private validation rules stored in closure
    const validationRules = {...rules};
    
    return function validate(data) {
        const errors = [];
        
        // Check each rule against the data
        for (const [field, rule] of Object.entries(validationRules)) {
            const value = data[field];
            
            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            
            if (value !== undefined && rule.type && typeof value !== rule.type) {
                errors.push(`${field} must be of type ${rule.type}`);
            }
            
            if (rule.min && value < rule.min) {
                errors.push(`${field} must be at least ${rule.min}`);
            }
            
            if (rule.max && value > rule.max) {
                errors.push(`${field} must be at most ${rule.max}`);
            }
            
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${field} format is invalid`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    };
}

// Create specific validators
const userValidator = createValidator({
    name: {required: true, type: 'string'},
    age: {required: true, type: 'number', min: 0, max: 150},
    email: {required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/}
});
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Partial Application

```javascript
// Partial application using closures
function curry(fn) {
    return function curried(...args) {
        // If we have enough arguments, call the original function
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        
        // Otherwise, return a new function that captures current arguments
        return function(...nextArgs) {
            return curried.apply(this, [...args, ...nextArgs]);
        };
    };
}

// Example: curried addition function
const add = curry((a, b, c) => a + b + c);

// Can be called in multiple ways due to closure
const add5 = add(5); // Partial application
const add5And10 = add5(10); // Another partial application
const result = add5And10(3); // Final call: 5 + 10 + 3 = 18
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Data Encapsulation

```javascript
// React-like state management using closures
function createState(initialState) {
    let state = initialState; // Private state
    const listeners = []; // Private listeners array
    
    return {
        // Get current state (read-only)
        getState() {
            return typeof state === 'object' ? {...state} : state;
        },
        
        // Update state and notify listeners
        setState(newState) {
            const prevState = state;
            state = typeof newState === 'function' ? newState(state) : newState;
            
            // Notify all listeners of state change
            listeners.forEach(listener => {
                try {
                    listener(state, prevState);
                } catch (error) {
                    console.error('State listener error:', error);
                }
            });
        },
        
        // Subscribe to state changes
        subscribe(listener) {
            if (typeof listener !== 'function') {
                throw new Error('Listener must be a function');
            }
            
            listeners.push(listener);
            
            // Return unsubscribe function
            return () => {
                const index = listeners.indexOf(listener);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            };
        }
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Discussion Points
1. **Lexical Scoping**: How JavaScript determines variable access
2. **Memory Management**: Closure impact on garbage collection
3. **Privacy**: Implementing private variables without classes
4. **Module Pattern**: Organizing code with closures

### Common Follow-ups
1. **"Memory leaks with closures"** → Explain closure chains and cleanup
2. **"Difference from class private fields"** → Compare syntax and browser support
3. **"Performance implications"** → Discuss memory overhead vs functionality
4. **"Real-world examples"** → Event handlers, React hooks, libraries

### Microsoft-Specific Context
1. **Office Web Apps**: Module patterns for feature isolation
2. **Teams**: State management in real-time features
3. **TypeScript**: Closure patterns with type safety
4. **Performance**: Memory-conscious patterns for large applications

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

1. **Lexical Scoping**: Closures capture variables from outer scopes at creation time
2. **Data Privacy**: Enable private variables without ES6 classes
3. **Module Pattern**: Organize code with public/private separation
4. **Memory Awareness**: Understand closure chains and cleanup
5. **Practical Applications**: Factory functions, partial application, state management

[⬆️ Back to Table of Contents](#table-of-contents) 