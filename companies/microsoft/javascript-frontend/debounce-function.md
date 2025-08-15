# Debounce Function Implementation ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Implementation](#core-implementation)
  - [Basic Implementation](#basic-implementation)
  - [Advanced Implementation](#advanced-implementation)
  - [Production-Ready Version](#production-ready-version)
- [Complexity Analysis](#complexity-analysis)
- [Testing](#testing)
- [Usage & Applications](#usage--applications)
  - [Search Input Optimization](#1-search-input-optimization)
  - [Window Resize Optimization](#2-window-resize-optimization)
  - [Form Validation](#3-form-validation)
  - [Auto-save Functionality](#4-auto-save-functionality)
- [Interview Variations](#interview-variations)
- [Edge Cases](#edge-cases)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Implement a debounce function that delays the execution of a function until after a specified delay has passed since the last time it was invoked. This is commonly used to limit the rate at which a function can fire.

## Quick Start Example

```javascript
// 1. Basic debounce implementation
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// 2. Use for search optimization
const searchAPI = (query) => {
    console.log('Searching for:', query);
    fetch(`/api/search?q=${query}`);
};

const debouncedSearch = debounce(searchAPI, 300);

// 3. Multiple rapid calls - only last one executes
debouncedSearch('a');     // Cancelled
debouncedSearch('ap');    // Cancelled  
debouncedSearch('app');   // Executes after 300ms

// 4. React usage
function SearchInput() {
    const [query, setQuery] = useState('');
    const debouncedSearch = useMemo(() => debounce(searchAPI, 300), []);
    
    useEffect(() => {
        if (query) debouncedSearch(query);
    }, [query, debouncedSearch]);
    
    return <input onChange={(e) => setQuery(e.target.value)} />;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Implementation

### Basic Implementation

```javascript
function debounce(func, delay) {
    let timeoutId;
    
    return function debounced(...args) {
        // Store context
        const context = this;
        
        // Clear previous timeout
        clearTimeout(timeoutId);
        
        // Set new timeout
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}
```

**Issues with Basic Approach:**
- No immediate execution option
- No cancel/flush methods
- Limited control over timing behavior

[⬆️ Back to Table of Contents](#table-of-contents)

### Advanced Implementation

```javascript
function debounce(func, delay, options = {}) {
    let timeoutId;
    let lastArgs;
    let lastCallTime;
    let lastInvokeTime = 0;
    let result;
    
    const {
        leading = false,
        trailing = true,
        maxWait
    } = options;
    
    function invokeFunc(time) {
        const args = lastArgs;
        lastArgs = undefined;
        lastInvokeTime = time;
        result = func.apply(this, args);
        return result;
    }
    
    function leadingEdge(time) {
        // Reset any `maxWait` timer
        lastInvokeTime = time;
        // Start the timer for the trailing edge
        timeoutId = setTimeout(timerExpired, delay);
        // Invoke the leading edge
        return leading ? invokeFunc.call(this, time) : result;
    }
    
    function remainingWait(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = delay - timeSinceLastCall;
        
        return maxWait !== undefined
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;
    }
    
    function shouldInvoke(time) {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        
        return (lastCallTime === undefined ||
                (timeSinceLastCall >= delay) ||
                (timeSinceLastCall < 0) ||
                (maxWait !== undefined && timeSinceLastInvoke >= maxWait));
    }
    
    function timerExpired() {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        timeoutId = setTimeout(timerExpired, remainingWait(time));
    }
    
    function trailingEdge(time) {
        timeoutId = undefined;
        
        if (trailing && lastArgs) {
            return invokeFunc.call(this, time);
        }
        lastArgs = undefined;
        return result;
    }
    
    function debounced(...args) {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);
        
        lastArgs = args;
        lastCallTime = time;
        
        if (isInvoking) {
            if (timeoutId === undefined) {
                return leadingEdge.call(this, time);
            }
            if (maxWait) {
                timeoutId = setTimeout(timerExpired, delay);
                return invokeFunc.call(this, time);
            }
        }
        if (timeoutId === undefined) {
            timeoutId = setTimeout(timerExpired, delay);
        }
        return result;
    }
    
    // Control methods
    debounced.cancel = function() {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = timeoutId = undefined;
    };
    
    debounced.flush = function() {
        return timeoutId === undefined ? result : trailingEdge(Date.now());
    };
    
    debounced.pending = function() {
        return timeoutId !== undefined;
    };
    
    return debounced;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Production-Ready Version

```javascript
function debounce(func, delay, immediate = false) {
    let timeoutId;
    
    return function debounced(...args) {
        const context = this;
        
        const later = () => {
            timeoutId = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        
        const callNow = immediate && !timeoutId;
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(later, delay);
        
        if (callNow) {
            func.apply(context, args);
        }
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Complexity Analysis

### Time Complexity
- **Function Creation**: O(1)
- **Each Call**: O(1)
- **Memory**: O(1) per debounced function

### Space Complexity
- **O(1)** - Only stores timeout reference and last arguments

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
describe('debounce', () => {
    let mockFn;
    let debouncedFn;
    
    beforeEach(() => {
        mockFn = jest.fn();
        debouncedFn = debounce(mockFn, 100);
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        jest.useRealTimers();
    });
    
    test('should delay function execution', () => {
        debouncedFn('test');
        expect(mockFn).not.toHaveBeenCalled();
        
        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledWith('test');
    });
    
    test('should cancel previous calls', () => {
        debouncedFn('first');
        debouncedFn('second');
        
        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('second');
    });
    
    test('should preserve context', () => {
        const obj = {
            value: 'test',
            method: debounce(function() {
                return this.value;
            }, 100)
        };
        
        const result = obj.method();
        jest.advanceTimersByTime(100);
        expect(result).toBe('test');
    });
});
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage & Applications

### 1. Search Input Optimization

```javascript
// React component with debounced API calls
function SearchComponent() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    
    const searchAPI = async (searchTerm) => {
        if (!searchTerm.trim()) return;
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            setResults(data.results);
        } catch (error) {
            console.error('Search failed:', error);
        }
    };
    
    // Debounce API calls to avoid excessive requests
    const debouncedSearch = useMemo(
        () => debounce(searchAPI, 300),
        []
    );
    
    useEffect(() => {
        debouncedSearch(query);
        
        // Cleanup on unmount
        return () => debouncedSearch.cancel();
    }, [query, debouncedSearch]);
    
    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
            />
            <ul>
                {results.map(result => (
                    <li key={result.id}>{result.title}</li>
                ))}
            </ul>
        </div>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### 2. Window Resize Optimization

```javascript
// Optimize expensive layout calculations
function useWindowSize() {
    const [size, setSize] = useState({ width: 0, height: 0 });
    
    useEffect(() => {
        const updateSize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        // Debounce resize events to avoid excessive re-renders
        const debouncedResize = debounce(updateSize, 150);
        
        window.addEventListener('resize', debouncedResize);
        updateSize(); // Initial size
        
        return () => {
            window.removeEventListener('resize', debouncedResize);
            debouncedResize.cancel();
        };
    }, []);
    
    return size;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### 3. Form Validation

```javascript
// Debounced validation to improve UX
function useValidation(value, validator, delay = 500) {
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    
    const validate = useMemo(
        () => debounce(async (val) => {
            setIsValidating(true);
            try {
                const result = await validator(val);
                setError(result.error || '');
            } catch (err) {
                setError('Validation failed');
            } finally {
                setIsValidating(false);
            }
        }, delay),
        [validator, delay]
    );
    
    useEffect(() => {
        if (value) {
            validate(value);
        } else {
            setError('');
        }
        
        return () => validate.cancel();
    }, [value, validate]);
    
    return { error, isValidating };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### 4. Auto-save Functionality

```javascript
// Auto-save document changes
function useAutoSave(content, saveFunction, delay = 2000) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    
    const save = useMemo(
        () => debounce(async (data) => {
            setIsSaving(true);
            try {
                await saveFunction(data);
                setLastSaved(new Date());
            } catch (error) {
                console.error('Auto-save failed:', error);
            } finally {
                setIsSaving(false);
            }
        }, delay),
        [saveFunction, delay]
    );
    
    useEffect(() => {
        if (content) {
            save(content);
        }
        
        return () => save.cancel();
    }, [content, save]);
    
    return { isSaving, lastSaved };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Variations

### 1. Leading Edge Debounce
```javascript
function debounceLeading(func, delay) {
    let timeoutId;
    let isThrottled = false;
    
    return function(...args) {
        if (!isThrottled) {
            func.apply(this, args);
            isThrottled = true;
        }
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            isThrottled = false;
        }, delay);
    };
}
```

### 2. Debounce with Return Value
```javascript
function debounceWithPromise(func, delay) {
    let timeoutId;
    let resolvePromise;
    let rejectPromise;
    
    return function(...args) {
        return new Promise((resolve, reject) => {
            clearTimeout(timeoutId);
            
            resolvePromise = resolve;
            rejectPromise = reject;
            
            timeoutId = setTimeout(async () => {
                try {
                    const result = await func.apply(this, args);
                    resolvePromise(result);
                } catch (error) {
                    rejectPromise(error);
                }
            }, delay);
        });
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Edge Cases

### 1. Memory Leaks
```javascript
// Ensure cleanup in React components
useEffect(() => {
    const debouncedFn = debounce(callback, delay);
    
    return () => {
        debouncedFn.cancel(); // Prevent memory leaks
    };
}, []);
```

### 2. Error Handling
```javascript
function robustDebounce(func, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(async () => {
            try {
                await func.apply(this, args);
            } catch (error) {
                console.error('Debounced function error:', error);
            }
        }, delay);
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### What Interviewers Look For
1. **Understanding of Closures**: Proper scope management
2. **Context Preservation**: Correct `this` binding
3. **Memory Management**: Cleanup and avoiding leaks
4. **Real-world Usage**: Practical applications

### Common Follow-up Questions
- "How would you test this function?"
- "What's the difference between debounce and throttle?"
- "How would you implement this in a React component?"
- "What are potential memory leaks with this approach?"

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

- **Pattern Recognition**: Debounce is essential for performance optimization
- **Closure Mastery**: Understanding private state in JavaScript
- **Real-world Impact**: Reduces API calls, improves UX
- **Microsoft Context**: Critical for Office 365, search, collaborative features
- **Performance**: Prevents excessive function calls and renders

[⬆️ Back to Table of Contents](#table-of-contents) 