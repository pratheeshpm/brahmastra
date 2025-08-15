# Throttle Function Implementation ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Implementation](#core-implementation)
  - [Basic Throttle Implementation](#basic-throttle-implementation)
  - [Advanced Throttle with Options](#advanced-throttle-with-options)
  - [RequestAnimationFrame Throttle](#requestanimationframe-throttle)
- [Complexity Analysis](#complexity-analysis)
- [Testing](#testing)
- [Usage & Applications](#usage--applications)
  - [Scroll Event Optimization](#scroll-event-optimization)
  - [Mouse Movement Tracking](#mouse-movement-tracking)
  - [API Rate Limiting](#api-rate-limiting)
  - [Input Validation](#input-validation)
- [Comparison with Debounce](#comparison-with-debounce)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Implement a throttle function that limits the rate at which a function can fire. Unlike debounce, throttle ensures the function is called at most once per specified time interval.

## Quick Start Example

```javascript
// 1. Basic throttle implementation
function throttle(func, delay) {
    let lastCall = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            func.apply(this, args);
        }
    };
}

// 2. Use for scroll optimization
const handleScroll = () => {
    console.log('Scroll position:', window.scrollY);
    // Update navbar, load content, etc.
};

const throttledScroll = throttle(handleScroll, 100);

// 3. Multiple rapid calls - executes at intervals
window.addEventListener('scroll', throttledScroll);
// Calls handleScroll at most once every 100ms during scrolling

// 4. React usage for input
function SearchInput() {
    const [query, setQuery] = useState('');
    const throttledSearch = useMemo(() => 
        throttle((value) => {
            console.log('Searching:', value);
            // API call here
        }, 500), []
    );
    
    const handleInput = (e) => {
        const value = e.target.value;
        setQuery(value);
        throttledSearch(value); // Executes max once per 500ms
    };
    
    return <input onChange={handleInput} value={query} />;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Implementation

### Basic Throttle Implementation

```javascript
function throttle(func, delay) {
    let lastExecTime = 0;
    
    return function throttled(...args) {
        const now = Date.now();
        
        if (now - lastExecTime >= delay) {
            lastExecTime = now;
            return func.apply(this, args);
        }
    };
}
```

**Characteristics:**
- Simple time-based throttling
- Immediate execution on first call
- Drops subsequent calls within delay period
- No trailing execution

[⬆️ Back to Table of Contents](#table-of-contents)

### Advanced Throttle with Options

```javascript
function throttle(func, delay, options = {}) {
    const { leading = true, trailing = true } = options;

    let lastExecTime = 0;
    let timeoutId = null;
    let lastArgs = null;
    let lastThis = null;

    const execute = function() {
        lastExecTime = Date.now();
        timeoutId = null;
        const result = func.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
        return result;
    };

    const throttled = function(...args) {
        const now = Date.now();
        const elapsed = now - lastExecTime;

        lastArgs = args;
        lastThis = this;

        if (lastExecTime === 0 && !leading) {
            lastExecTime = now;
        }

        if (elapsed >= delay) {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            return execute();
        } else if (!timeoutId && trailing) {
            timeoutId = setTimeout(() => {
                execute();
            }, delay - elapsed);
        }
    };

    throttled.cancel = function() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        lastExecTime = 0;
        lastArgs = lastThis = null;
    };

    throttled.flush = function() {
        if (timeoutId) {
            clearTimeout(timeoutId);
            return execute();
        }
    };

    return throttled;
}
```

**Features:**
- Leading edge execution control
- Trailing edge execution support
- Cancel and flush methods
- Context preservation
- Argument handling

[⬆️ Back to Table of Contents](#table-of-contents)

### RequestAnimationFrame Throttle

```javascript
function rafThrottle(func) {
    let frameId = null;
    let lastArgs = null;
    let lastThis = null;

    const throttled = function(...args) {
        lastArgs = args;
        lastThis = this;

        if (frameId === null) {
            frameId = requestAnimationFrame(() => {
                frameId = null;
                func.apply(lastThis, lastArgs);
                lastArgs = lastThis = null;
            });
        }
    };

    throttled.cancel = function() {
        if (frameId !== null) {
            cancelAnimationFrame(frameId);
            frameId = null;
            lastArgs = lastThis = null;
        }
    };

    return throttled;
}
```

**Benefits:**
- Synchronized with browser refresh rate
- Optimal for animations and visual updates
- Automatically pauses when tab is not visible
- Better performance for DOM manipulation

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Complexity Analysis

### Time Complexity
- **Function Creation**: O(1)
- **Each Invocation**: O(1)
- **Memory Usage**: O(1) per throttled function

### Space Complexity
- **O(1)** - Stores only timing information and last call data

**Performance Characteristics:**
- Guarantees maximum execution frequency
- Predictable performance overhead
- Memory efficient

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
describe('throttle', () => {
    let mockFn;
    let throttledFn;
    
    beforeEach(() => {
        mockFn = jest.fn();
        throttledFn = throttle(mockFn, 100);
        jest.useFakeTimers();
    });
    
    afterEach(() => {
        jest.useRealTimers();
    });
    
    test('should execute immediately on first call', () => {
        throttledFn('test');
        expect(mockFn).toHaveBeenCalledWith('test');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    test('should throttle subsequent calls', () => {
        throttledFn('first');
        throttledFn('second');
        throttledFn('third');
        
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith('first');
    });
    
    test('should allow execution after delay', () => {
        throttledFn('first');
        
        jest.advanceTimersByTime(100);
        
        throttledFn('second');
        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(mockFn).toHaveBeenNthCalledWith(2, 'second');
    });
    
    test('should preserve context', () => {
        const obj = {
            value: 'test',
            method: throttle(function() {
                return this.value;
            }, 100)
        };
        
        const result = obj.method();
        expect(result).toBe('test');
    });
    
    test('should cancel pending executions', () => {
        const throttledWithTrailing = throttle(mockFn, 100, { trailing: true });
        
        throttledWithTrailing('test');
        throttledWithTrailing('test2');
        
        throttledWithTrailing.cancel();
        
        jest.advanceTimersByTime(100);
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage & Applications

### Scroll Event Optimization

```javascript
// Optimizing scroll-based animations and calculations
function ScrollHandler() {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    
    useEffect(() => {
        let scrollTimeout;
        
        const handleScroll = throttle(() => {
            setScrollPosition(window.pageYOffset);
            setIsScrolling(true);
            
            // Clear existing timeout
            clearTimeout(scrollTimeout);
            
            // Set scrolling to false after scroll ends
            scrollTimeout = setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        }, 16); // ~60fps
        
        const handleScrollRAF = rafThrottle(() => {
            // RAF version for smooth animations
            setScrollPosition(window.pageYOffset);
        });
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            handleScroll.cancel();
            clearTimeout(scrollTimeout);
        };
    }, []);
    
    return (
        <div>
            <div className="scroll-indicator" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: `${(scrollPosition / (document.body.scrollHeight - window.innerHeight)) * 100}%`,
                height: '4px',
                backgroundColor: '#007bff',
                transition: isScrolling ? 'none' : 'opacity 0.3s'
            }} />
            
            <div style={{ transform: `translateY(${scrollPosition * 0.5}px)` }}>
                Parallax Content
            </div>
        </div>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Mouse Movement Tracking

```javascript
// Efficient mouse tracking for interactive features
function MouseTracker() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    
    useEffect(() => {
        const handleMouseMove = throttle((e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        }, 16); // 60fps
        
        const handleMouseEnter = () => setIsHovering(true);
        const handleMouseLeave = () => setIsHovering(false);
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
            handleMouseMove.cancel();
        };
    }, []);
    
    return (
        <div style={{ position: 'relative', height: '100vh' }}>
            {isHovering && (
                <div
                    style={{
                        position: 'fixed',
                        left: mousePosition.x + 10,
                        top: mousePosition.y + 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '8px',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        zIndex: 1000
                    }}
                >
                    X: {mousePosition.x}, Y: {mousePosition.y}
                </div>
            )}
        </div>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### API Rate Limiting

```javascript
// Client-side API rate limiting
class APIThrottler {
    constructor(maxRequestsPerSecond = 10) {
        this.maxRequests = maxRequestsPerSecond;
        this.requests = [];
        this.queue = [];
        this.processing = false;
    }
    
    async request(url, options = {}) {
        return new Promise((resolve, reject) => {
            this.queue.push({ url, options, resolve, reject });
            this.processQueue();
        });
    }
    
    processQueue = throttle(async function() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        // Clean old requests (older than 1 second)
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < 1000);
        
        // Process requests up to the limit
        while (this.queue.length > 0 && this.requests.length < this.maxRequests) {
            const { url, options, resolve, reject } = this.queue.shift();
            this.requests.push(now);
            
            try {
                const response = await fetch(url, options);
                const data = await response.json();
                resolve(data);
            } catch (error) {
                reject(error);
            }
        }
        
        this.processing = false;
        
        // Continue processing if there are more requests
        if (this.queue.length > 0) {
            setTimeout(() => this.processQueue(), 100);
        }
    }, 100);
    
    getQueueLength() {
        return this.queue.length;
    }
    
    clear() {
        this.queue = [];
        this.requests = [];
    }
}

// Usage
const apiThrottler = new APIThrottler(5); // 5 requests per second

function DataFetcher() {
    const [data, setData] = useState([]);
    const [queueLength, setQueueLength] = useState(0);
    
    const fetchData = async (endpoint) => {
        try {
            const result = await apiThrottler.request(`/api/${endpoint}`);
            setData(prev => [...prev, result]);
        } catch (error) {
            console.error('Fetch failed:', error);
        } finally {
            setQueueLength(apiThrottler.getQueueLength());
        }
    };
    
    return (
        <div>
            <button onClick={() => fetchData('users')}>Fetch Users</button>
            <button onClick={() => fetchData('posts')}>Fetch Posts</button>
            <button onClick={() => fetchData('comments')}>Fetch Comments</button>
            
            {queueLength > 0 && (
                <div>Queued requests: {queueLength}</div>
            )}
            
            <div>
                {data.map((item, index) => (
                    <div key={index}>{JSON.stringify(item)}</div>
                ))}
            </div>
        </div>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Input Validation

```javascript
// Real-time input validation with throttling
function useValidatedInput(validator, delay = 300) {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    
    const validate = useMemo(
        () => throttle(async (inputValue) => {
            setIsValidating(true);
            try {
                await validator(inputValue);
                setError('');
            } catch (err) {
                setError(err.message);
            } finally {
                setIsValidating(false);
            }
        }, delay),
        [validator, delay]
    );
    
    const handleChange = (newValue) => {
        setValue(newValue);
        if (newValue.trim()) {
            validate(newValue);
        } else {
            setError('');
            setIsValidating(false);
        }
    };
    
    useEffect(() => {
        return () => validate.cancel();
    }, [validate]);
    
    return {
        value,
        error,
        isValidating,
        onChange: handleChange,
        setValue
    };
}

// Usage in a form
function RegistrationForm() {
    const emailValidator = async (email) => {
        if (!/\S+@\S+\.\S+/.test(email)) {
            throw new Error('Invalid email format');
        }
        
        // Simulate API call to check email availability
        const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
            throw new Error('Email already exists');
        }
    };
    
    const usernameValidator = async (username) => {
        if (username.length < 3) {
            throw new Error('Username must be at least 3 characters');
        }
        
        // Check username availability
        const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
        if (!response.ok) {
            throw new Error('Username already taken');
        }
    };
    
    const email = useValidatedInput(emailValidator, 500);
    const username = useValidatedInput(usernameValidator, 300);
    
    return (
        <form>
            <div>
                <input
                    type="email"
                    value={email.value}
                    onChange={(e) => email.onChange(e.target.value)}
                    placeholder="Email"
                />
                {email.isValidating && <span>Validating...</span>}
                {email.error && <span style={{ color: 'red' }}>{email.error}</span>}
            </div>
            
            <div>
                <input
                    type="text"
                    value={username.value}
                    onChange={(e) => username.onChange(e.target.value)}
                    placeholder="Username"
                />
                {username.isValidating && <span>Checking availability...</span>}
                {username.error && <span style={{ color: 'red' }}>{username.error}</span>}
            </div>
            
            <button
                type="submit"
                disabled={email.error || username.error || email.isValidating || username.isValidating}
            >
                Register
            </button>
        </form>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Comparison with Debounce

| Aspect | Throttle | Debounce |
|--------|----------|----------|
| **Execution Pattern** | Regular intervals | After inactivity period |
| **Use Case** | Continuous events | User input completion |
| **Performance** | Steady execution rate | Reduces total executions |
| **Examples** | Scroll, resize, mousemove | Search input, API calls |
| **Timing** | Every X milliseconds | X milliseconds after last call |

### Visual Comparison

```javascript
// Throttle: Executes at regular intervals
// Input:  ||||||||||||||||||||||||
// Output: |   |   |   |   |   |   |

// Debounce: Executes after silence period
// Input:  ||||||||||||    ||||||||
// Output:                |        |

// Example demonstrating the difference
function ComparisonDemo() {
    const [throttleCount, setThrottleCount] = useState(0);
    const [debounceCount, setDebounceCount] = useState(0);
    
    const throttledIncrement = useMemo(
        () => throttle(() => setThrottleCount(prev => prev + 1), 500),
        []
    );
    
    const debouncedIncrement = useMemo(
        () => debounce(() => setDebounceCount(prev => prev + 1), 500),
        []
    );
    
    const handleClick = () => {
        throttledIncrement();
        debouncedIncrement();
    };
    
    return (
        <div>
            <button onClick={handleClick}>
                Click rapidly
            </button>
            <div>Throttle count: {throttleCount}</div>
            <div>Debounce count: {debounceCount}</div>
        </div>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Key Discussion Points
1. **Timing Behavior**: Throttle executes at intervals vs debounce waits for quiet period
2. **Use Cases**: Continuous events vs completion events
3. **Performance**: When to use each technique
4. **Implementation Details**: Leading/trailing edge, cancellation

### Common Follow-up Questions
- **"When would you use throttle vs debounce?"**
  - Throttle: scroll, resize, mousemove events
  - Debounce: search input, form validation, save operations

- **"How would you implement throttle with requestAnimationFrame?"**
  - Show RAF-based implementation for visual updates

- **"What are the memory implications?"**
  - Discuss cleanup, memory leaks, and proper disposal

- **"How would you test throttled functions?"**
  - Mock timers, test timing behavior, verify execution counts

### Microsoft Context
- **Office 365**: Smooth scrolling, real-time collaboration updates
- **Teams**: Message throttling, typing indicators
- **Gaming**: Input handling, frame rate optimization
- **Analytics**: Event tracking with rate limiting

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

1. **Execution Pattern**: Throttle maintains steady execution rate unlike debounce
2. **Performance Optimization**: Essential for handling high-frequency events
3. **Context Preservation**: Must maintain `this` binding and argument passing
4. **Control Methods**: Cancel and flush provide fine-grained control
5. **Browser Optimization**: RAF throttling for visual updates
6. **Testing**: Requires mock timers and careful timing verification

[⬆️ Back to Table of Contents](#table-of-contents) 