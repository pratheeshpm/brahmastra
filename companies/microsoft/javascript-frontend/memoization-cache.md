# Memoization Cache Implementation ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Implementation](#core-implementation)
  - [Basic Memoization](#basic-memoization)
  - [LRU Cache with TTL](#lru-cache-with-ttl)
  - [Advanced Memoization](#advanced-memoization)
- [Cache Strategies](#cache-strategies)
  - [LRU (Least Recently Used)](#lru-least-recently-used)
  - [LFU (Least Frequently Used)](#lfu-least-frequently-used)
  - [Time-based Expiration](#time-based-expiration)
- [Complexity Analysis](#complexity-analysis)
- [Testing](#testing)
- [Usage & Applications](#usage--applications)
  - [React Selectors](#react-selectors)
  - [API Response Caching](#api-response-caching)
  - [Expensive Computations](#expensive-computations)
  - [Database Query Caching](#database-query-caching)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Implement a memoization cache that stores the results of expensive function calls and returns the cached result when the same inputs occur again.

## Quick Start Example

```javascript
// 1. Basic memoization function
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key); // Cache hit
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// 2. Usage with expensive computation
const fibonacci = memoize((n) => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(40)); // Fast after first calculation

// 3. API call memoization
const fetchUser = memoize(async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
});

// Same user data returned from cache
await fetchUser(123); // API call
await fetchUser(123); // From cache

// 4. React selector memoization
const useExpensiveSelector = (data) => {
    const selectExpensiveData = useMemo(() => 
        memoize((items) => {
            return items
                .filter(item => item.active)
                .map(item => ({ ...item, computed: heavyComputation(item) }))
                .sort((a, b) => a.priority - b.priority);
        }), []
    );
    
    return selectExpensiveData(data);
};
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Implementation

### Basic Memoization

```javascript
function memoize(fn, options = {}) {
    // Use Map for O(1) lookups and insertion order preservation for LRU
    const cache = new Map();
    
    // Extract options: maxSize prevents memory overflow, keyGenerator customizes cache keys
    const { maxSize = 100, keyGenerator } = options;
    
    // Key generation: use primitive directly for performance, JSON.stringify for complex args
    const generateKey = keyGenerator || ((...args) => {
        return args.length === 1 && typeof args[0] !== 'object' 
            ? args[0]  // Direct primitive key (faster)
            : JSON.stringify(args); // Serialize complex arguments
    });
    
    // Memoized wrapper function that checks cache before executing
    const memoized = function(...args) {
        // Generate consistent key for these arguments
        const key = generateKey(...args);
        
        // Cache hit: return stored result (O(1) lookup vs O(n) computation)
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        // Cache miss: execute original function, preserving 'this' context
        const result = fn.apply(this, args);
        
        // LRU eviction: remove oldest entry when cache is full
        if (cache.size >= maxSize) {
            const firstKey = cache.keys().next().value; // Get oldest key
            cache.delete(firstKey);
        }
        
        // Store result for future calls with same arguments
        cache.set(key, result);
        return result;
    };
    
    // Expose cache management utilities
    memoized.cache = cache; // Direct cache access
    memoized.clear = () => cache.clear(); // Clear all entries
    memoized.delete = (key) => cache.delete(key); // Remove specific entry
    memoized.has = (key) => cache.has(key); // Check if key exists
    memoized.size = () => cache.size; // Get cache size
    
    return memoized;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### LRU Cache with TTL

```javascript
class LRUCache {
    constructor(maxSize = 100, ttl = null) {
        this.maxSize = maxSize;
        this.ttl = ttl; // Time to live in milliseconds
        this.cache = new Map();
        this.accessOrder = new Map(); // Track access order
        this.expirationTimes = new Map(); // Track expiration times
    }
    
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
        
        // Check expiration
        if (this.isExpired(key)) {
            this.delete(key);
            return undefined;
        }
        
        // Update access order
        this.updateAccessOrder(key);
        
        return this.cache.get(key);
    }
    
    set(key, value) {
        // Remove if already exists
        if (this.cache.has(key)) {
            this.delete(key);
        }
        
        // Check size limit
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }
        
        // Add new entry
        this.cache.set(key, value);
        this.updateAccessOrder(key);
        
        // Set expiration time
        if (this.ttl) {
            this.expirationTimes.set(key, Date.now() + this.ttl);
        }
    }
    
    delete(key) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
        this.expirationTimes.delete(key);
    }
    
    updateAccessOrder(key) {
        // Remove and re-add to move to end (most recent)
        this.accessOrder.delete(key);
        this.accessOrder.set(key, Date.now());
    }
    
    evictLRU() {
        // Remove least recently used (first in accessOrder)
        const lruKey = this.accessOrder.keys().next().value;
        if (lruKey !== undefined) {
            this.delete(lruKey);
        }
    }
    
    isExpired(key) {
        if (!this.ttl) return false;
        
        const expirationTime = this.expirationTimes.get(key);
        return expirationTime && Date.now() > expirationTime;
    }
    
    cleanup() {
        // Remove expired entries
        const now = Date.now();
        
        for (const [key, expirationTime] of this.expirationTimes) {
            if (now > expirationTime) {
                this.delete(key);
            }
        }
    }
    
    clear() {
        this.cache.clear();
        this.accessOrder.clear();
        this.expirationTimes.clear();
    }
    
    size() {
        return this.cache.size;
    }
    
    keys() {
        return this.cache.keys();
    }
    
    values() {
        return this.cache.values();
    }
    
    // Get cache statistics
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.hits / (this.hits + this.misses) || 0,
            hits: this.hits || 0,
            misses: this.misses || 0
        };
    }
}

// Enhanced memoization with LRU cache
function memoizeLRU(fn, options = {}) {
    const { 
        maxSize = 100, 
        ttl = null, 
        keyGenerator,
        onCacheHit,
        onCacheMiss 
    } = options;
    
    const cache = new LRUCache(maxSize, ttl);
    let hits = 0;
    let misses = 0;
    
    const generateKey = keyGenerator || ((...args) => {
        return args.length === 1 && typeof args[0] !== 'object' 
            ? args[0] 
            : JSON.stringify(args);
    });
    
    const memoized = function(...args) {
        const key = generateKey(...args);
        const cachedResult = cache.get(key);
        
        if (cachedResult !== undefined) {
            hits++;
            if (onCacheHit) onCacheHit(key, cachedResult);
            return cachedResult;
        }
        
        // Cache miss
        misses++;
        const result = fn.apply(this, args);
        cache.set(key, result);
        
        if (onCacheMiss) onCacheMiss(key, result);
        
        return result;
    };
    
    // Expose cache methods
    memoized.cache = cache;
    memoized.clear = () => cache.clear();
    memoized.cleanup = () => cache.cleanup();
    memoized.getStats = () => ({
        ...cache.getStats(),
        hits,
        misses,
        hitRate: hits / (hits + misses) || 0
    });
    
    // Auto cleanup interval
    if (ttl) {
        const cleanupInterval = setInterval(() => {
            cache.cleanup();
        }, Math.min(ttl, 60000)); // Cleanup every minute or TTL, whichever is less
        
        memoized.destroy = () => clearInterval(cleanupInterval);
    }
    
    return memoized;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Advanced Memoization

```javascript
class AdvancedMemoizationCache {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 1000;
        this.ttl = options.ttl || null;
        this.strategy = options.strategy || 'lru'; // lru, lfu, fifo
        this.keySerializer = options.keySerializer || this.defaultKeySerializer;
        
        this.cache = new Map();
        this.metadata = new Map(); // Store access count, timestamps, etc.
        this.stats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            sets: 0
        };
        
        // Setup cleanup if TTL is enabled
        if (this.ttl) {
            this.cleanupInterval = setInterval(() => {
                this.cleanup();
            }, Math.min(this.ttl, 60000));
        }
    }
    
    defaultKeySerializer(...args) {
        // Handle different argument types
        return args.map(arg => {
            if (arg === null) return 'null';
            if (arg === undefined) return 'undefined';
            if (typeof arg === 'function') return arg.toString();
            if (typeof arg === 'object') {
                // Handle circular references
                return JSON.stringify(arg, this.getCircularReplacer());
            }
            return String(arg);
        }).join('|');
    }
    
    getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular]';
                }
                seen.add(value);
            }
            return value;
        };
    }
    
    get(key) {
        const serializedKey = this.keySerializer(key);
        
        if (!this.cache.has(serializedKey)) {
            this.stats.misses++;
            return undefined;
        }
        
        const meta = this.metadata.get(serializedKey);
        
        // Check expiration
        if (this.isExpired(meta)) {
            this.delete(serializedKey);
            this.stats.misses++;
            return undefined;
        }
        
        // Update metadata based on strategy
        this.updateMetadata(serializedKey, meta);
        
        this.stats.hits++;
        return this.cache.get(serializedKey);
    }
    
    set(key, value) {
        const serializedKey = this.keySerializer(key);
        
        // Check if we need to evict
        if (this.cache.size >= this.maxSize && !this.cache.has(serializedKey)) {
            this.evict();
        }
        
        // Store value and metadata
        this.cache.set(serializedKey, value);
        this.metadata.set(serializedKey, {
            accessCount: 1,
            lastAccessed: Date.now(),
            created: Date.now(),
            expireAt: this.ttl ? Date.now() + this.ttl : null
        });
        
        this.stats.sets++;
    }
    
    delete(key) {
        const serializedKey = typeof key === 'string' ? key : this.keySerializer(key);
        const deleted = this.cache.delete(serializedKey);
        this.metadata.delete(serializedKey);
        return deleted;
    }
    
    updateMetadata(key, meta) {
        meta.accessCount++;
        meta.lastAccessed = Date.now();
    }
    
    isExpired(meta) {
        return meta.expireAt && Date.now() > meta.expireAt;
    }
    
    evict() {
        let keyToEvict;
        
        switch (this.strategy) {
            case 'lru':
                keyToEvict = this.findLRUKey();
                break;
            case 'lfu':
                keyToEvict = this.findLFUKey();
                break;
            case 'fifo':
                keyToEvict = this.findFIFOKey();
                break;
            default:
                keyToEvict = this.cache.keys().next().value;
        }
        
        if (keyToEvict) {
            this.delete(keyToEvict);
            this.stats.evictions++;
        }
    }
    
    findLRUKey() {
        let oldestTime = Date.now();
        let lruKey = null;
        
        for (const [key, meta] of this.metadata) {
            if (meta.lastAccessed < oldestTime) {
                oldestTime = meta.lastAccessed;
                lruKey = key;
            }
        }
        
        return lruKey;
    }
    
    findLFUKey() {
        let lowestCount = Infinity;
        let lfuKey = null;
        
        for (const [key, meta] of this.metadata) {
            if (meta.accessCount < lowestCount) {
                lowestCount = meta.accessCount;
                lfuKey = key;
            }
        }
        
        return lfuKey;
    }
    
    findFIFOKey() {
        let oldestTime = Date.now();
        let fifoKey = null;
        
        for (const [key, meta] of this.metadata) {
            if (meta.created < oldestTime) {
                oldestTime = meta.created;
                fifoKey = key;
            }
        }
        
        return fifoKey;
    }
    
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        
        for (const [key, meta] of this.metadata) {
            if (this.isExpired(meta)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => this.delete(key));
    }
    
    clear() {
        this.cache.clear();
        this.metadata.clear();
    }
    
    size() {
        return this.cache.size;
    }
    
    getStats() {
        return {
            ...this.stats,
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
        };
    }
    
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clear();
    }
}

// Factory function for creating memoized functions
function createMemoizedFunction(fn, options = {}) {
    const cache = new AdvancedMemoizationCache(options);
    
    const memoized = function(...args) {
        const cachedResult = cache.get(args);
        
        if (cachedResult !== undefined) {
            return cachedResult;
        }
        
        const result = fn.apply(this, args);
        cache.set(args, result);
        
        return result;
    };
    
    // Expose cache methods
    memoized.cache = cache;
    memoized.clear = () => cache.clear();
    memoized.getStats = () => cache.getStats();
    memoized.destroy = () => cache.destroy();
    
    return memoized;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Cache Strategies

### LRU (Least Recently Used)

```javascript
class LRUNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class LRUCacheOptimized {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        
        // Dummy head and tail for easier manipulation
        this.head = new LRUNode(0, 0);
        this.tail = new LRUNode(0, 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }
    
    get(key) {
        const node = this.cache.get(key);
        
        if (node) {
            // Move to head (most recently used)
            this.moveToHead(node);
            return node.value;
        }
        
        return undefined;
    }
    
    set(key, value) {
        const node = this.cache.get(key);
        
        if (node) {
            // Update existing node
            node.value = value;
            this.moveToHead(node);
        } else {
            const newNode = new LRUNode(key, value);
            
            if (this.cache.size >= this.capacity) {
                // Remove least recently used
                const tail = this.removeTail();
                this.cache.delete(tail.key);
            }
            
            this.cache.set(key, newNode);
            this.addToHead(newNode);
        }
    }
    
    addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        
        this.head.next.prev = node;
        this.head.next = node;
    }
    
    removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
    
    moveToHead(node) {
        this.removeNode(node);
        this.addToHead(node);
    }
    
    removeTail() {
        const lastNode = this.tail.prev;
        this.removeNode(lastNode);
        return lastNode;
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### LFU (Least Frequently Used)

```javascript
class LFUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.minFreq = 0;
        this.cache = new Map(); // key -> node
        this.frequencies = new Map(); // frequency -> doubly linked list
    }
    
    get(key) {
        const node = this.cache.get(key);
        
        if (!node) {
            return undefined;
        }
        
        this.updateFrequency(node);
        return node.value;
    }
    
    set(key, value) {
        if (this.capacity <= 0) return;
        
        const node = this.cache.get(key);
        
        if (node) {
            node.value = value;
            this.updateFrequency(node);
        } else {
            if (this.cache.size >= this.capacity) {
                this.evictLFU();
            }
            
            const newNode = {
                key,
                value,
                frequency: 1,
                prev: null,
                next: null
            };
            
            this.cache.set(key, newNode);
            this.addToFrequencyList(newNode);
            this.minFreq = 1;
        }
    }
    
    updateFrequency(node) {
        const oldFreq = node.frequency;
        const newFreq = oldFreq + 1;
        
        // Remove from old frequency list
        this.removeFromFrequencyList(node, oldFreq);
        
        // Add to new frequency list
        node.frequency = newFreq;
        this.addToFrequencyList(node);
        
        // Update minFreq if necessary
        if (oldFreq === this.minFreq && !this.frequencies.has(oldFreq)) {
            this.minFreq++;
        }
    }
    
    addToFrequencyList(node) {
        const freq = node.frequency;
        
        if (!this.frequencies.has(freq)) {
            this.frequencies.set(freq, {
                head: { next: null, prev: null },
                tail: { next: null, prev: null }
            });
            
            const list = this.frequencies.get(freq);
            list.head.next = list.tail;
            list.tail.prev = list.head;
        }
        
        const list = this.frequencies.get(freq);
        
        // Add to head of frequency list
        node.next = list.head.next;
        node.prev = list.head;
        list.head.next.prev = node;
        list.head.next = node;
    }
    
    removeFromFrequencyList(node, freq) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        
        // Remove frequency list if empty
        const list = this.frequencies.get(freq);
        if (list.head.next === list.tail) {
            this.frequencies.delete(freq);
        }
    }
    
    evictLFU() {
        const list = this.frequencies.get(this.minFreq);
        const nodeToEvict = list.tail.prev;
        
        this.removeFromFrequencyList(nodeToEvict, this.minFreq);
        this.cache.delete(nodeToEvict.key);
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Time-based Expiration

```javascript
class TTLCache {
    constructor(defaultTTL = 60000) { // Default 1 minute
        this.cache = new Map();
        this.timers = new Map();
        this.defaultTTL = defaultTTL;
    }
    
    set(key, value, ttl = this.defaultTTL) {
        // Clear existing timer if updating
        this.clearTimer(key);
        
        this.cache.set(key, value);
        
        // Set expiration timer
        const timer = setTimeout(() => {
            this.delete(key);
        }, ttl);
        
        this.timers.set(key, timer);
    }
    
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
        
        return this.cache.get(key);
    }
    
    delete(key) {
        this.clearTimer(key);
        return this.cache.delete(key);
    }
    
    clearTimer(key) {
        const timer = this.timers.get(key);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(key);
        }
    }
    
    clear() {
        // Clear all timers
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        
        this.timers.clear();
        this.cache.clear();
    }
    
    has(key) {
        return this.cache.has(key);
    }
    
    size() {
        return this.cache.size;
    }
    
    // Get remaining TTL for a key
    getRemainingTTL(key) {
        const timer = this.timers.get(key);
        if (!timer) return -1;
        
        // This is approximate since we can't easily get remaining time from setTimeout
        return this.defaultTTL; // Simplified implementation
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Complexity Analysis

### Time Complexity
- **Basic Memoization**: 
  - Get: O(1) average, O(n) worst case (hash collision)
  - Set: O(1) average, O(n) worst case
- **LRU Cache**: 
  - Get: O(1)
  - Set: O(1)
- **LFU Cache**: 
  - Get: O(1)
  - Set: O(1)

### Space Complexity
- **O(n)** where n is the number of cached items
- Additional O(n) for metadata storage in advanced implementations

**Performance Characteristics:**
- Map-based storage provides excellent average-case performance
- Doubly-linked lists enable O(1) insertions and deletions
- Memory usage scales linearly with cache size

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
describe('Memoization Cache', () => {
    describe('Basic Memoization', () => {
        test('should cache function results', () => {
            let callCount = 0;
            const expensiveFunction = (n) => {
                callCount++;
                return n * n;
            };
            
            const memoized = memoize(expensiveFunction);
            
            expect(memoized(5)).toBe(25);
            expect(memoized(5)).toBe(25);
            expect(callCount).toBe(1);
        });
        
        test('should handle different argument types', () => {
            const fn = jest.fn((obj) => obj.value * 2);
            const memoized = memoize(fn);
            
            const obj1 = { value: 10 };
            const obj2 = { value: 10 };
            
            memoized(obj1);
            memoized(obj2);
            
            expect(fn).toHaveBeenCalledTimes(2); // Different object instances
        });
        
        test('should respect max size limit', () => {
            const fn = jest.fn((x) => x * 2);
            const memoized = memoize(fn, { maxSize: 2 });
            
            memoized(1);
            memoized(2);
            memoized(3); // Should evict first entry
            
            memoized(1); // Should call function again
            expect(fn).toHaveBeenCalledTimes(4);
        });
    });
    
    describe('LRU Cache', () => {
        test('should evict least recently used items', () => {
            const cache = new LRUCache(2);
            
            cache.set('a', 1);
            cache.set('b', 2);
            cache.set('c', 3); // Should evict 'a'
            
            expect(cache.get('a')).toBeUndefined();
            expect(cache.get('b')).toBe(2);
            expect(cache.get('c')).toBe(3);
        });
        
        test('should update access order on get', () => {
            const cache = new LRUCache(2);
            
            cache.set('a', 1);
            cache.set('b', 2);
            cache.get('a'); // Make 'a' most recently used
            cache.set('c', 3); // Should evict 'b'
            
            expect(cache.get('a')).toBe(1);
            expect(cache.get('b')).toBeUndefined();
            expect(cache.get('c')).toBe(3);
        });
    });
    
    describe('TTL Cache', () => {
        test('should expire items after TTL', (done) => {
            const cache = new TTLCache();
            
            cache.set('key', 'value', 100); // 100ms TTL
            
            expect(cache.get('key')).toBe('value');
            
            setTimeout(() => {
                expect(cache.get('key')).toBeUndefined();
                done();
            }, 150);
        });
    });
    
    describe('Advanced Memoization', () => {
        test('should provide cache statistics', () => {
            const fn = jest.fn((x) => x * 2);
            const memoized = createMemoizedFunction(fn, { maxSize: 10 });
            
            memoized(1);
            memoized(1);
            memoized(2);
            
            const stats = memoized.getStats();
            expect(stats.hits).toBe(1);
            expect(stats.misses).toBe(2);
            expect(stats.hitRate).toBe(0.5);
        });
    });
});
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage & Applications

### React Selectors

```javascript
// Memoized selector for React state
import { createSelector } from 'reselect';

// Custom memoization for React selectors
function createMemoizedSelector(dependencies, resultFunc, options = {}) {
    const memoizedResultFunc = createMemoizedFunction(resultFunc, {
        maxSize: options.maxSize || 100,
        keySerializer: (...args) => args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join('|')
    });
    
    return createSelector(dependencies, memoizedResultFunc);
}

// Usage in Redux selectors
const selectVisibleTodos = createMemoizedSelector(
    [
        state => state.todos,
        state => state.filter
    ],
    (todos, filter) => {
        console.log('Expensive filtering operation');
        
        switch (filter) {
            case 'SHOW_COMPLETED':
                return todos.filter(todo => todo.completed);
            case 'SHOW_ACTIVE':
                return todos.filter(todo => !todo.completed);
            default:
                return todos;
        }
    },
    { maxSize: 50 }
);

// React component using memoized selector
function TodoList() {
    const visibleTodos = useSelector(selectVisibleTodos);
    
    return (
        <div>
            {visibleTodos.map(todo => (
                <TodoItem key={todo.id} todo={todo} />
            ))}
        </div>
    );
}

// Memoized computation hook
function useMemoizedComputation(computeFn, dependencies, options = {}) {
    const memoizedFn = useMemo(
        () => createMemoizedFunction(computeFn, options),
        []
    );
    
    return useMemo(
        () => memoizedFn(...dependencies),
        dependencies
    );
}

// Usage
function ExpensiveComponent({ data, filters }) {
    const processedData = useMemoizedComputation(
        (data, filters) => {
            // Expensive data processing
            return data
                .filter(item => filters.category.includes(item.category))
                .sort((a, b) => a[filters.sortBy] - b[filters.sortBy])
                .slice(0, filters.limit);
        },
        [data, filters],
        { maxSize: 20, ttl: 30000 }
    );
    
    return (
        <div>
            {processedData.map(item => (
                <DataItem key={item.id} item={item} />
            ))}
        </div>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### API Response Caching

```javascript
// Advanced API cache with different strategies
class APICache {
    constructor(options = {}) {
        this.cache = new AdvancedMemoizationCache({
            maxSize: options.maxSize || 500,
            ttl: options.defaultTTL || 300000, // 5 minutes
            strategy: 'lru'
        });
        
        this.requestsInFlight = new Map();
        this.retryConfig = options.retryConfig || { attempts: 3, delay: 1000 };
    }
    
    async get(url, options = {}) {
        const cacheKey = this.generateCacheKey(url, options);
        
        // Check cache first
        const cachedResponse = this.cache.get(cacheKey);
        if (cachedResponse && !this.shouldRefresh(cachedResponse, options)) {
            return cachedResponse.data;
        }
        
        // Check if request is already in flight
        if (this.requestsInFlight.has(cacheKey)) {
            return this.requestsInFlight.get(cacheKey);
        }
        
        // Make new request
        const requestPromise = this.makeRequest(url, options, cacheKey);
        this.requestsInFlight.set(cacheKey, requestPromise);
        
        try {
            const response = await requestPromise;
            return response;
        } finally {
            this.requestsInFlight.delete(cacheKey);
        }
    }
    
    async makeRequest(url, options, cacheKey) {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            ...options
        };
        
        let attempt = 0;
        let lastError;
        
        while (attempt < this.retryConfig.attempts) {
            try {
                const response = await fetch(url, requestOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Cache successful response
                const cacheEntry = {
                    data,
                    timestamp: Date.now(),
                    etag: response.headers.get('etag'),
                    lastModified: response.headers.get('last-modified'),
                    cacheControl: response.headers.get('cache-control')
                };
                
                this.cache.set(cacheKey, cacheEntry);
                return data;
                
            } catch (error) {
                lastError = error;
                attempt++;
                
                if (attempt < this.retryConfig.attempts) {
                    await this.delay(this.retryConfig.delay * attempt);
                }
            }
        }
        
        // Check if we have stale cached data to return
        const staleData = this.cache.get(cacheKey);
        if (staleData && options.allowStale) {
            console.warn('Returning stale data due to request failure');
            return staleData.data;
        }
        
        throw lastError;
    }
    
    generateCacheKey(url, options) {
        const keyParts = [url];
        
        if (options.params) {
            const sortedParams = Object.keys(options.params)
                .sort()
                .map(key => `${key}=${options.params[key]}`)
                .join('&');
            keyParts.push(sortedParams);
        }
        
        if (options.headers) {
            const relevantHeaders = ['authorization', 'accept', 'content-type'];
            const headerParts = relevantHeaders
                .filter(header => options.headers[header])
                .map(header => `${header}:${options.headers[header]}`)
                .join('|');
            keyParts.push(headerParts);
        }
        
        return keyParts.join('|');
    }
    
    shouldRefresh(cacheEntry, options) {
        const now = Date.now();
        const age = now - cacheEntry.timestamp;
        
        // Check explicit TTL
        if (options.ttl && age > options.ttl) {
            return true;
        }
        
        // Parse Cache-Control header
        if (cacheEntry.cacheControl) {
            const maxAge = this.parseCacheControl(cacheEntry.cacheControl).maxAge;
            if (maxAge && age > maxAge * 1000) {
                return true;
            }
        }
        
        return false;
    }
    
    parseCacheControl(cacheControl) {
        const directives = {};
        
        cacheControl.split(',').forEach(directive => {
            const [key, value] = directive.trim().split('=');
            directives[key] = value ? parseInt(value) : true;
        });
        
        return {
            maxAge: directives['max-age'],
            noCache: directives['no-cache'],
            noStore: directives['no-store']
        };
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    invalidate(pattern) {
        // Invalidate cache entries matching pattern
        for (const key of this.cache.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
    
    clear() {
        this.cache.clear();
        this.requestsInFlight.clear();
    }
    
    getStats() {
        return this.cache.getStats();
    }
}

// Usage
const apiCache = new APICache({
    maxSize: 1000,
    defaultTTL: 300000, // 5 minutes
    retryConfig: { attempts: 3, delay: 1000 }
});

// API service using cache
class APIService {
    constructor() {
        this.cache = apiCache;
    }
    
    async getUser(userId) {
        return this.cache.get(`/api/users/${userId}`, {
            ttl: 600000 // Cache user data for 10 minutes
        });
    }
    
    async getProducts(filters = {}) {
        return this.cache.get('/api/products', {
            params: filters,
            ttl: 60000 // 1 minute for product lists
        });
    }
    
    async getProductDetails(productId) {
        return this.cache.get(`/api/products/${productId}`, {
            ttl: 1800000, // 30 minutes for product details
            allowStale: true
        });
    }
    
    invalidateUserCache(userId) {
        this.cache.invalidate(`/api/users/${userId}`);
    }
    
    invalidateProductCache() {
        this.cache.invalidate('/api/products');
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Expensive Computations

```javascript
// Memoization for expensive mathematical computations
class ComputationCache {
    constructor() {
        this.fibonacciCache = createMemoizedFunction(this.fibonacci.bind(this), {
            maxSize: 1000
        });
        
        this.primeCache = createMemoizedFunction(this.isPrime.bind(this), {
            maxSize: 10000
        });
        
        this.factorialCache = createMemoizedFunction(this.factorial.bind(this), {
            maxSize: 100
        });
    }
    
    fibonacci(n) {
        if (n <= 1) return n;
        return this.fibonacciCache(n - 1) + this.fibonacciCache(n - 2);
    }
    
    isPrime(n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 === 0 || n % 3 === 0) return false;
        
        for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0 || n % (i + 2) === 0) {
                return false;
            }
        }
        
        return true;
    }
    
    factorial(n) {
        if (n <= 1) return 1;
        return n * this.factorialCache(n - 1);
    }
    
    // Complex computation with multiple parameters
    complexCalculation = createMemoizedFunction((matrix, operations) => {
        console.log('Performing complex calculation...');
        
        let result = matrix.map(row => [...row]); // Deep copy
        
        operations.forEach(op => {
            switch (op.type) {
                case 'multiply':
                    result = this.multiplyMatrix(result, op.factor);
                    break;
                case 'transpose':
                    result = this.transposeMatrix(result);
                    break;
                case 'rotate':
                    result = this.rotateMatrix(result, op.degrees);
                    break;
            }
        });
        
        return result;
    }, {
        maxSize: 50,
        keySerializer: (matrix, operations) => {
            return JSON.stringify({ matrix, operations });
        }
    });
    
    multiplyMatrix(matrix, factor) {
        return matrix.map(row => row.map(cell => cell * factor));
    }
    
    transposeMatrix(matrix) {
        return matrix[0].map((_, colIndex) => 
            matrix.map(row => row[colIndex])
        );
    }
    
    rotateMatrix(matrix, degrees) {
        // Simplified rotation logic
        let result = matrix;
        const rotations = (degrees / 90) % 4;
        
        for (let i = 0; i < rotations; i++) {
            result = this.transposeMatrix(result).map(row => row.reverse());
        }
        
        return result;
    }
    
    getStats() {
        return {
            fibonacci: this.fibonacciCache.getStats(),
            prime: this.primeCache.getStats(),
            factorial: this.factorialCache.getStats(),
            complex: this.complexCalculation.getStats()
        };
    }
}

// Usage
const computationCache = new ComputationCache();

// Fibonacci sequence
console.log(computationCache.fibonacciCache(40)); // Computed once
console.log(computationCache.fibonacciCache(40)); // Retrieved from cache

// Prime checking
const numbers = [97, 98, 99, 100, 101];
numbers.forEach(n => {
    console.log(`${n} is prime: ${computationCache.primeCache(n)}`);
});

// Complex matrix operations
const matrix = [[1, 2], [3, 4]];
const operations = [
    { type: 'multiply', factor: 2 },
    { type: 'transpose' },
    { type: 'rotate', degrees: 90 }
];

const result1 = computationCache.complexCalculation(matrix, operations);
const result2 = computationCache.complexCalculation(matrix, operations); // Cached

console.log('Cache statistics:', computationCache.getStats());
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Database Query Caching

```javascript
// Database query result caching
class QueryCache {
    constructor(options = {}) {
        this.cache = new AdvancedMemoizationCache({
            maxSize: options.maxSize || 1000,
            ttl: options.defaultTTL || 600000, // 10 minutes
            strategy: 'lru'
        });
        
        this.queryStats = new Map();
        this.invalidationRules = new Map();
    }
    
    async query(sql, params = [], options = {}) {
        const cacheKey = this.generateQueryKey(sql, params);
        
        // Check cache first
        const cachedResult = this.cache.get(cacheKey);
        if (cachedResult && !options.bypassCache) {
            this.recordHit(sql);
            return cachedResult;
        }
        
        // Execute query
        const startTime = Date.now();
        const result = await this.executeQuery(sql, params);
        const executionTime = Date.now() - startTime;
        
        // Cache result if it's a SELECT query
        if (this.isCacheable(sql, options)) {
            const ttl = this.calculateTTL(sql, executionTime, options);
            this.cache.set(cacheKey, result);
            
            // Set up invalidation rules
            this.setupInvalidation(sql, cacheKey);
        }
        
        this.recordMiss(sql, executionTime);
        return result;
    }
    
    generateQueryKey(sql, params) {
        const normalizedSQL = this.normalizeSQL(sql);
        const paramString = params.length > 0 ? JSON.stringify(params) : '';
        return `${normalizedSQL}|${paramString}`;
    }
    
    normalizeSQL(sql) {
        return sql
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim()
            .toLowerCase();
    }
    
    isCacheable(sql, options) {
        if (options.noCache) return false;
        
        const normalizedSQL = this.normalizeSQL(sql);
        
        // Only cache SELECT queries
        if (!normalizedSQL.startsWith('select')) return false;
        
        // Don't cache queries with certain keywords
        const noCacheKeywords = ['now()', 'current_timestamp', 'rand()', 'random()'];
        return !noCacheKeywords.some(keyword => normalizedSQL.includes(keyword));
    }
    
    calculateTTL(sql, executionTime, options) {
        if (options.ttl) return options.ttl;
        
        // Longer TTL for slower queries (they're more expensive to recompute)
        if (executionTime > 5000) return 1800000; // 30 minutes
        if (executionTime > 1000) return 900000;  // 15 minutes
        return 300000; // 5 minutes
    }
    
    setupInvalidation(sql, cacheKey) {
        const tables = this.extractTables(sql);
        
        tables.forEach(table => {
            if (!this.invalidationRules.has(table)) {
                this.invalidationRules.set(table, new Set());
            }
            this.invalidationRules.get(table).add(cacheKey);
        });
    }
    
    extractTables(sql) {
        const normalizedSQL = this.normalizeSQL(sql);
        const fromMatch = normalizedSQL.match(/from\s+(\w+)/);
        const joinMatches = normalizedSQL.match(/join\s+(\w+)/g) || [];
        
        const tables = [];
        
        if (fromMatch) {
            tables.push(fromMatch[1]);
        }
        
        joinMatches.forEach(joinMatch => {
            const table = joinMatch.match(/join\s+(\w+)/)[1];
            tables.push(table);
        });
        
        return [...new Set(tables)]; // Remove duplicates
    }
    
    invalidateTable(tableName) {
        const cacheKeys = this.invalidationRules.get(tableName);
        
        if (cacheKeys) {
            cacheKeys.forEach(key => this.cache.delete(key));
            this.invalidationRules.delete(tableName);
        }
    }
    
    async executeQuery(sql, params) {
        // Mock database execution
        // In real implementation, this would use your database driver
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        return {
            rows: [
                { id: 1, name: 'John', email: 'john@example.com' },
                { id: 2, name: 'Jane', email: 'jane@example.com' }
            ],
            rowCount: 2
        };
    }
    
    recordHit(sql) {
        const stats = this.queryStats.get(sql) || { hits: 0, misses: 0, totalTime: 0 };
        stats.hits++;
        this.queryStats.set(sql, stats);
    }
    
    recordMiss(sql, executionTime) {
        const stats = this.queryStats.get(sql) || { hits: 0, misses: 0, totalTime: 0 };
        stats.misses++;
        stats.totalTime += executionTime;
        this.queryStats.set(sql, stats);
    }
    
    getQueryStats() {
        const stats = {};
        
        for (const [sql, queryStats] of this.queryStats) {
            const total = queryStats.hits + queryStats.misses;
            stats[sql] = {
                ...queryStats,
                hitRate: total > 0 ? queryStats.hits / total : 0,
                avgExecutionTime: queryStats.misses > 0 ? queryStats.totalTime / queryStats.misses : 0
            };
        }
        
        return stats;
    }
    
    clear() {
        this.cache.clear();
        this.invalidationRules.clear();
        this.queryStats.clear();
    }
}

// Usage
const queryCache = new QueryCache({ maxSize: 500, defaultTTL: 300000 });

// Database service using query cache
class DatabaseService {
    constructor() {
        this.queryCache = queryCache;
    }
    
    async getUser(userId) {
        return this.queryCache.query(
            'SELECT * FROM users WHERE id = ?',
            [userId],
            { ttl: 600000 } // Cache user data for 10 minutes
        );
    }
    
    async getUserPosts(userId, limit = 10) {
        return this.queryCache.query(
            'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, limit]
        );
    }
    
    async updateUser(userId, data) {
        // Update user in database
        const result = await this.queryCache.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [data.name, data.email, userId],
            { noCache: true }
        );
        
        // Invalidate cached user data
        this.queryCache.invalidateTable('users');
        
        return result;
    }
    
    getStats() {
        return {
            cache: this.queryCache.cache.getStats(),
            queries: this.queryCache.getQueryStats()
        };
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Key Discussion Points
1. **Cache Strategies**: Understanding LRU, LFU, FIFO, and when to use each
2. **Memory Management**: Preventing memory leaks and handling large datasets
3. **Key Generation**: Handling complex objects and argument serialization
4. **TTL Implementation**: Time-based expiration and cleanup strategies

### Common Follow-up Questions
- **"How would you handle cache invalidation?"**
  - Discuss TTL, manual invalidation, and dependency-based invalidation

- **"What about thread safety?"**
  - Show locks, atomic operations, and concurrent access patterns

- **"How would you implement distributed caching?"**
  - Discuss Redis, Memcached, and consistency strategies

- **"How do you handle cache stampede?"**
  - Show request coalescing and circuit breaker patterns

### Microsoft Context
- **Office 365**: Document caching, collaborative editing state
- **Azure**: Distributed caching services, CDN strategies
- **Gaming**: Game state caching, leaderboard optimization
- **Search**: Query result caching, index optimization

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

1. **Strategy Selection**: Choose the right eviction policy based on access patterns
2. **Key Design**: Proper key generation is crucial for cache effectiveness
3. **Memory Management**: Always implement size limits and cleanup mechanisms
4. **Performance Monitoring**: Track hit rates and execution times for optimization
5. **Invalidation Strategy**: Plan for cache invalidation from the beginning
6. **Complex Data**: Handle object serialization and circular references carefully

[⬆️ Back to Table of Contents](#table-of-contents) 