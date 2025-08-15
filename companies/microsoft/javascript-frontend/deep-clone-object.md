# Deep Clone Object ⭐

## Problem Statement

Implement a function that creates a deep copy of a JavaScript object, handling nested objects, arrays, circular references, and special data types.

## Quick Start Example

```javascript
// 1. Simple deep clone (JSON method - has limitations)
function simpleDeepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// 2. Robust deep clone with circular reference handling
function deepClone(obj, seen = new WeakMap()) {
    if (obj === null || typeof obj !== "object") return obj;
    if (seen.has(obj)) return seen.get(obj);
    
    let clone;
    if (obj instanceof Date) clone = new Date(obj);
    else if (obj instanceof Array) clone = [];
    else clone = {};
    
    seen.set(obj, clone);
    
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clone[key] = deepClone(obj[key], seen);
        }
    }
    
    return clone;
}

// 3. Usage examples
const original = {
    name: 'John',
    data: { age: 30, hobbies: ['reading', 'coding'] },
    created: new Date()
};

const copy = deepClone(original);
copy.data.age = 31; // Doesn't affect original
console.log(original.data.age); // Still 30

// 4. React state example
function UserProfile() {
    const [user, setUser] = useState({ 
        profile: { name: '', settings: {} }
    });
    
    const updateUserName = (newName) => {
        setUser(prevUser => {
            const updated = deepClone(prevUser);
            updated.profile.name = newName;
            return updated;
        });
    };
    
    return <input onChange={(e) => updateUserName(e.target.value)} />;
}
```

## Frontend Engineering Context

### Why This Matters for Frontend Engineers

#### 1. State Management Immutability
```javascript
// Redux/state management requires immutable updates
class ImmutableStateManager {
    constructor(initialState = {}) {
        this.state = this.deepClone(initialState);
        this.history = [this.deepClone(initialState)];
        this.currentIndex = 0;
    }
    
    setState(updater) {
        const currentState = this.deepClone(this.state);
        const newState = typeof updater === 'function' 
            ? updater(currentState) 
            : { ...currentState, ...updater };
        
        this.state = this.deepClone(newState);
        
        // Add to history for undo/redo
        this.history = this.history.slice(0, this.currentIndex + 1);
        this.history.push(this.deepClone(newState));
        this.currentIndex++;
        
        // Limit history size
        if (this.history.length > 50) {
            this.history = this.history.slice(-50);
            this.currentIndex = this.history.length - 1;
        }
        
        this.notifySubscribers();
    }
    
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.state = this.deepClone(this.history[this.currentIndex]);
            this.notifySubscribers();
            return true;
        }
        return false;
    }
    
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.state = this.deepClone(this.history[this.currentIndex]);
            this.notifySubscribers();
            return true;
        }
        return false;
    }
    
    getState() {
        // Always return a clone to prevent accidental mutations
        return this.deepClone(this.state);
    }
    
    // Optimized deep clone for state management
    deepClone(obj, visited = new WeakMap()) {
        // Handle null, undefined, and primitives
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // Handle circular references
        if (visited.has(obj)) {
            return visited.get(obj);
        }
        
        // Handle Date
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        // Handle RegExp
        if (obj instanceof RegExp) {
            return new RegExp(obj.source, obj.flags);
        }
        
        // Handle Arrays
        if (Array.isArray(obj)) {
            const clonedArray = [];
            visited.set(obj, clonedArray);
            
            for (let i = 0; i < obj.length; i++) {
                clonedArray[i] = this.deepClone(obj[i], visited);
            }
            
            return clonedArray;
        }
        
        // Handle plain objects
        if (obj.constructor === Object) {
            const clonedObj = {};
            visited.set(obj, clonedObj);
            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key], visited);
                }
            }
            
            return clonedObj;
        }
        
        // For other object types, try to create a copy
        try {
            const clonedObj = Object.create(Object.getPrototypeOf(obj));
            visited.set(obj, clonedObj);
            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key], visited);
                }
            }
            
            return clonedObj;
        } catch (error) {
            // If cloning fails, return the original object
            console.warn('Failed to clone object:', error);
            return obj;
        }
    }
    
    subscribers = [];
    
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }
    
    notifySubscribers() {
        this.subscribers.forEach(callback => {
            try {
                callback(this.getState());
            } catch (error) {
                console.error('Subscriber error:', error);
            }
        });
    }
}

// Usage in React app
const stateManager = new ImmutableStateManager({
    user: {
        id: 1,
        name: 'John',
        preferences: {
            theme: 'dark',
            notifications: true
        }
    },
    todos: [
        { id: 1, text: 'Learn React', completed: false }
    ]
});

// React hook for using the state manager
function useImmutableState() {
    const [state, setState] = useState(stateManager.getState());
    
    useEffect(() => {
        const unsubscribe = stateManager.subscribe(setState);
        return unsubscribe;
    }, []);
    
    const updateState = useCallback((updater) => {
        stateManager.setState(updater);
    }, []);
    
    const undo = useCallback(() => stateManager.undo(), []);
    const redo = useCallback(() => stateManager.redo(), []);
    
    return { state, updateState, undo, redo };
}
```

#### 2. Form Data Management
```javascript
// Complex form handling with nested data structures
class FormDataManager {
    constructor(initialData = {}) {
        this.originalData = this.deepClone(initialData);
        this.currentData = this.deepClone(initialData);
        this.validationErrors = {};
        this.touchedFields = new Set();
    }
    
    setValue(path, value) {
        const keys = path.split('.');
        const clonedData = this.deepClone(this.currentData);
        
        let current = clonedData;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
        this.currentData = clonedData;
        this.touchedFields.add(path);
        
        // Clear validation error for this field
        delete this.validationErrors[path];
    }
    
    getValue(path) {
        const keys = path.split('.');
        let current = this.currentData;
        
        for (const key of keys) {
            if (current && typeof current === 'object') {
                current = current[key];
            } else {
                return undefined;
            }
        }
        
        return current;
    }
    
    reset() {
        this.currentData = this.deepClone(this.originalData);
        this.validationErrors = {};
        this.touchedFields.clear();
    }
    
    isDirty() {
        return !this.isEqual(this.currentData, this.originalData);
    }
    
    getChangedFields() {
        const changes = {};
        this.findChanges(this.originalData, this.currentData, '', changes);
        return changes;
    }
    
    findChanges(original, current, path, changes) {
        if (original === current) return;
        
        if (typeof original !== 'object' || typeof current !== 'object' ||
            original === null || current === null) {
            changes[path] = { from: original, to: current };
            return;
        }
        
        const allKeys = new Set([
            ...Object.keys(original || {}),
            ...Object.keys(current || {})
        ]);
        
        for (const key of allKeys) {
            const newPath = path ? `${path}.${key}` : key;
            this.findChanges(original[key], current[key], newPath, changes);
        }
    }
    
    // Deep clone implementation optimized for form data
    deepClone(obj, visited = new WeakMap()) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (visited.has(obj)) {
            return visited.get(obj);
        }
        
        // Handle Date objects (common in forms)
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        // Handle File objects (for file uploads)
        if (obj instanceof File) {
            // Files can't be cloned, return reference
            return obj;
        }
        
        // Handle Arrays
        if (Array.isArray(obj)) {
            const cloned = [];
            visited.set(obj, cloned);
            
            obj.forEach((item, index) => {
                cloned[index] = this.deepClone(item, visited);
            });
            
            return cloned;
        }
        
        // Handle plain objects
        const cloned = {};
        visited.set(obj, cloned);
        
        Object.keys(obj).forEach(key => {
            cloned[key] = this.deepClone(obj[key], visited);
        });
        
        return cloned;
    }
    
    isEqual(obj1, obj2, visited = new WeakSet()) {
        if (obj1 === obj2) return true;
        
        if (obj1 === null || obj2 === null) return obj1 === obj2;
        if (typeof obj1 !== typeof obj2) return false;
        if (typeof obj1 !== 'object') return obj1 === obj2;
        
        if (visited.has(obj1)) return true;
        visited.add(obj1);
        
        if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
        
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        if (keys1.length !== keys2.length) return false;
        
        return keys1.every(key => 
            keys2.includes(key) && this.isEqual(obj1[key], obj2[key], visited)
        );
    }
    
    // Create a snapshot for undo functionality
    createSnapshot() {
        return {
            data: this.deepClone(this.currentData),
            errors: { ...this.validationErrors },
            touched: new Set(this.touchedFields)
        };
    }
    
    restoreSnapshot(snapshot) {
        this.currentData = this.deepClone(snapshot.data);
        this.validationErrors = { ...snapshot.errors };
        this.touchedFields = new Set(snapshot.touched);
    }
}

// Usage in React form component
function useFormData(initialData) {
    const [formManager] = useState(() => new FormDataManager(initialData));
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    
    const setValue = useCallback((path, value) => {
        formManager.setValue(path, value);
        forceUpdate();
    }, [formManager]);
    
    const getValue = useCallback((path) => {
        return formManager.getValue(path);
    }, [formManager]);
    
    const reset = useCallback(() => {
        formManager.reset();
        forceUpdate();
    }, [formManager]);
    
    return {
        setValue,
        getValue,
        reset,
        isDirty: formManager.isDirty(),
        changedFields: formManager.getChangedFields(),
        data: formManager.currentData
    };
}
```

#### 3. Component Props Cloning
```javascript
// Safe prop passing to prevent accidental mutations
class ComponentPropsManager {
    static cloneProps(props, options = {}) {
        const {
            excludeKeys = ['children', 'ref', 'key'],
            preserveFunctions = true,
            handleCircular = true
        } = options;
        
        const cloned = {};
        
        for (const key in props) {
            if (excludeKeys.includes(key)) {
                cloned[key] = props[key]; // Don't clone these special props
                continue;
            }
            
            const value = props[key];
            
            if (typeof value === 'function' && preserveFunctions) {
                cloned[key] = value; // Functions are typically safe to share
            } else {
                cloned[key] = this.deepClone(value, handleCircular);
            }
        }
        
        return cloned;
    }
    
    static deepClone(obj, handleCircular = true, visited = new WeakMap()) {
        // Handle primitives and null
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // Handle circular references
        if (handleCircular && visited.has(obj)) {
            return visited.get(obj);
        }
        
        // Handle DOM elements (don't clone, return reference)
        if (obj instanceof Element || obj instanceof Document || obj instanceof Window) {
            return obj;
        }
        
        // Handle React elements (don't clone)
        if (obj.$$typeof && typeof obj.$$typeof === 'symbol') {
            return obj;
        }
        
        // Handle Date
        if (obj instanceof Date) {
            const cloned = new Date(obj.getTime());
            if (handleCircular) visited.set(obj, cloned);
            return cloned;
        }
        
        // Handle RegExp
        if (obj instanceof RegExp) {
            const cloned = new RegExp(obj.source, obj.flags);
            if (handleCircular) visited.set(obj, cloned);
            return cloned;
        }
        
        // Handle Map
        if (obj instanceof Map) {
            const cloned = new Map();
            if (handleCircular) visited.set(obj, cloned);
            
            for (const [key, value] of obj) {
                cloned.set(
                    this.deepClone(key, handleCircular, visited),
                    this.deepClone(value, handleCircular, visited)
                );
            }
            
            return cloned;
        }
        
        // Handle Set
        if (obj instanceof Set) {
            const cloned = new Set();
            if (handleCircular) visited.set(obj, cloned);
            
            for (const value of obj) {
                cloned.add(this.deepClone(value, handleCircular, visited));
            }
            
            return cloned;
        }
        
        // Handle Arrays
        if (Array.isArray(obj)) {
            const cloned = [];
            if (handleCircular) visited.set(obj, cloned);
            
            for (let i = 0; i < obj.length; i++) {
                cloned[i] = this.deepClone(obj[i], handleCircular, visited);
            }
            
            // Copy non-enumerable properties
            const descriptors = Object.getOwnPropertyDescriptors(obj);
            for (const key in descriptors) {
                if (!descriptors[key].enumerable && key !== 'length') {
                    Object.defineProperty(cloned, key, descriptors[key]);
                }
            }
            
            return cloned;
        }
        
        // Handle plain objects and class instances
        const cloned = Object.create(Object.getPrototypeOf(obj));
        if (handleCircular) visited.set(obj, cloned);
        
        // Copy all properties including non-enumerable ones
        const descriptors = Object.getOwnPropertyDescriptors(obj);
        
        for (const key in descriptors) {
            const descriptor = descriptors[key];
            
            if (descriptor.value !== undefined) {
                descriptor.value = this.deepClone(descriptor.value, handleCircular, visited);
            }
            
            Object.defineProperty(cloned, key, descriptor);
        }
        
        return cloned;
    }
}

// React HOC for safe prop passing
function withSafeProps(Component, options) {
    return React.memo((props) => {
        const safeProps = useMemo(() => {
            return ComponentPropsManager.cloneProps(props, options);
        }, [props]);
        
        return <Component {...safeProps} />;
    });
}

// Usage
const SafeDataTable = withSafeProps(DataTable, {
    excludeKeys: ['onRowClick', 'onSelectionChange'],
    preserveFunctions: true
});

function ParentComponent() {
    const data = {
        users: [
            { id: 1, name: 'John', settings: { theme: 'dark' } }
        ]
    };
    
    return (
        <SafeDataTable 
            data={data}
            onRowClick={(row) => console.log('Clicked:', row)}
        />
    );
}
```

## Approach 1: Shallow Clone (Baseline)

### Algorithm
Copy only the first level of properties, maintaining references to nested objects.

### Implementation
```javascript
function shallowClone(obj) {
    // Handle primitive values and null - these are passed by value, not reference
    // No cloning needed for primitives (numbers, strings, booleans, null, undefined)
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // Handle arrays using spread operator for shallow copy
    // Creates new array with same elements, but nested objects are still referenced
    if (Array.isArray(obj)) {
        return [...obj]; // Equivalent to obj.slice() but more modern syntax
    }
    
    // Handle objects using spread operator for shallow copy
    // Creates new object with same properties, but nested objects are still referenced
    return { ...obj }; // Equivalent to Object.assign({}, obj) but more concise
}

// Alternative implementations demonstrating different approaches
function shallowCloneObject(obj) {
    // Classic approach using Object.assign()
    // Copies enumerable own properties from source to target object
    // More explicit but verbose compared to spread operator
    return Object.assign({}, obj);
}

function shallowCloneArray(arr) {
    // Classic approach using Array.slice()
    // Returns a shallow copy of array from start to end (or beginning to end if no params)
    // Reliable cross-browser method, works in all environments
    return arr.slice();
}
```

### Complexity Analysis
- **Time Complexity**: O(n) where n is the number of properties at the first level
- **Space Complexity**: O(n) for the new object structure
- **Pros**: Fast, simple, works for flat objects
- **Cons**: Nested objects are still referenced, not truly independent

## Approach 2: JSON-based Deep Clone

### Algorithm
Use JSON.stringify and JSON.parse to create a deep copy.

### Implementation
```javascript
function jsonDeepClone(obj) {
    try {
        // Two-step process: serialize to JSON string, then parse back to object
        // JSON.stringify converts object to string representation
        // JSON.parse converts string back to new object with same structure
        // This creates a completely independent copy with no shared references
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        // Handle edge cases where JSON serialization fails:
        // - Circular references (throws TypeError)
        // - Functions (silently ignored, become undefined)
        // - undefined values (silently ignored)
        // - Symbol properties (silently ignored)
        // - BigInt values (throws TypeError)
        console.error('JSON clone failed:', error);
        return obj; // Return original object as fallback
    }
}
```

### Complexity Analysis
- **Time Complexity**: O(n) where n is the total number of values
- **Space Complexity**: O(n) for the cloned structure
- **Pros**: Simple one-liner, handles nested structures
- **Cons**: Loses functions, undefined, symbols, dates become strings, circular references cause errors

## Approach 3: Recursive Deep Clone (Optimal)

### Algorithm
Recursively traverse the object structure, handling different types appropriately.

### Implementation
```javascript
function deepClone(obj, visited = new WeakMap()) {
    // Handle primitive values and null - these don't need cloning
    // Primitives (number, string, boolean, null, undefined, symbol, bigint) are immutable
    // They're passed by value, so returning them directly is safe
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // Handle circular references using WeakMap for tracking visited objects
    // WeakMap prevents memory leaks as it doesn't prevent garbage collection
    // If we've seen this object before, return the cloned version to prevent infinite recursion
    if (visited.has(obj)) {
        return visited.get(obj);
    }
    
    // Handle Date objects - preserve the timestamp value
    // getTime() returns milliseconds since epoch, constructor recreates equivalent Date
    // Must track in visited map before recursion to handle potential circular refs
    if (obj instanceof Date) {
        const cloned = new Date(obj.getTime());
        visited.set(obj, cloned);
        return cloned;
    }
    
    // Handle RegExp objects - preserve pattern and flags
    // source: the regex pattern, flags: modifiers like 'g', 'i', 'm', etc.
    // Must track in visited map before recursion to handle potential circular refs
    if (obj instanceof RegExp) {
        const cloned = new RegExp(obj.source, obj.flags);
        visited.set(obj, cloned);
        return cloned;
    }
    
    // Handle Map objects - key-value pairs where keys can be any type
    // Must clone both keys and values as they could be objects with references
    // Track in visited map first to handle circular references
    if (obj instanceof Map) {
        const cloned = new Map();
        visited.set(obj, cloned);
        
        for (const [key, value] of obj) {
            cloned.set(
                deepClone(key, visited),   // Clone the key (could be an object)
                deepClone(value, visited)  // Clone the value recursively
            );
        }
        
        return cloned;
    }
    
    // Handle Set objects - collection of unique values
    // Must clone each value as they could be objects with references
    // Track in visited map first to handle circular references
    if (obj instanceof Set) {
        const cloned = new Set();
        visited.set(obj, cloned);
        
        for (const value of obj) {
            cloned.add(deepClone(value, visited)); // Clone each value recursively
        }
        
        return cloned;
    }
    
    // Handle Arrays - ordered list of values
    // Use for loop for better performance than forEach/map for large arrays
    // Track in visited map first to handle circular references
    if (Array.isArray(obj)) {
        const cloned = [];
        visited.set(obj, cloned);
        
        for (let i = 0; i < obj.length; i++) {
            cloned[i] = deepClone(obj[i], visited); // Clone each element recursively
        }
        
        return cloned;
    }
    
    // Handle plain Objects - key-value pairs where keys are strings/symbols
    // Use hasOwnProperty to avoid cloning inherited properties from prototype chain
    // Track in visited map first to handle circular references
    const cloned = {};
    visited.set(obj, cloned);
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key], visited); // Clone each property recursively
        }
    }
    
    return cloned;
}
```

### Advanced Deep Clone with Full Feature Support
```javascript
function advancedDeepClone(obj, options = {}) {
    const {
        includeNonEnumerable = false,
        preservePrototype = false,
        handleFunctions = 'ignore', // 'ignore', 'serialize', 'preserve'
        maxDepth = Infinity,
        customCloners = new Map()
    } = options;
    
    const visited = new WeakMap();
    let currentDepth = 0;
    
    function clone(value, depth = 0) {
        currentDepth = depth;
        
        // Check max depth
        if (depth > maxDepth) {
            return value;
        }
        
        // Handle primitives
        if (value === null || typeof value !== 'object') {
            if (typeof value === 'function') {
                switch (handleFunctions) {
                    case 'serialize':
                        return new Function('return ' + value.toString())();
                    case 'preserve':
                        return value;
                    default:
                        return undefined;
                }
            }
            return value;
        }
        
        // Handle circular references
        if (visited.has(value)) {
            return visited.get(value);
        }
        
        // Check for custom cloners
        for (const [type, cloner] of customCloners) {
            if (value instanceof type) {
                const cloned = cloner(value, (v) => clone(v, depth + 1));
                visited.set(value, cloned);
                return cloned;
            }
        }
        
        // Handle built-in types
        if (value instanceof Date) {
            const cloned = new Date(value.getTime());
            visited.set(value, cloned);
            return cloned;
        }
        
        if (value instanceof RegExp) {
            const cloned = new RegExp(value.source, value.flags);
            visited.set(value, cloned);
            return cloned;
        }
        
        if (value instanceof Map) {
            const cloned = new Map();
            visited.set(value, cloned);
            
            for (const [k, v] of value) {
                cloned.set(clone(k, depth + 1), clone(v, depth + 1));
            }
            
            return cloned;
        }
        
        if (value instanceof Set) {
            const cloned = new Set();
            visited.set(value, cloned);
            
            for (const v of value) {
                cloned.add(clone(v, depth + 1));
            }
            
            return cloned;
        }
        
        if (value instanceof ArrayBuffer) {
            const cloned = value.slice(0);
            visited.set(value, cloned);
            return cloned;
        }
        
        // Handle typed arrays
        if (ArrayBuffer.isView(value)) {
            const cloned = new value.constructor(value);
            visited.set(value, cloned);
            return cloned;
        }
        
        // Handle Arrays
        if (Array.isArray(value)) {
            const cloned = [];
            visited.set(value, cloned);
            
            for (let i = 0; i < value.length; i++) {
                cloned[i] = clone(value[i], depth + 1);
            }
            
            // Handle sparse arrays
            if (value.length !== Object.keys(value).length) {
                for (const key in value) {
                    if (key !== 'length' && !cloned.hasOwnProperty(key)) {
                        cloned[key] = clone(value[key], depth + 1);
                    }
                }
            }
            
            return cloned;
        }
        
        // Handle Objects
        const cloned = preservePrototype 
            ? Object.create(Object.getPrototypeOf(value))
            : {};
        
        visited.set(value, cloned);
        
        // Get property descriptors
        const descriptors = includeNonEnumerable 
            ? Object.getOwnPropertyDescriptors(value)
            : Object.getOwnPropertyDescriptors(value);
        
        for (const key in descriptors) {
            const descriptor = descriptors[key];
            
            if (!includeNonEnumerable && !descriptor.enumerable) {
                continue;
            }
            
            if ('value' in descriptor) {
                descriptor.value = clone(descriptor.value, depth + 1);
            }
            
            if ('get' in descriptor && typeof descriptor.get === 'function') {
                if (handleFunctions === 'preserve') {
                    // Keep the getter
                } else {
                    delete descriptor.get;
                }
            }
            
            if ('set' in descriptor && typeof descriptor.set === 'function') {
                if (handleFunctions === 'preserve') {
                    // Keep the setter
                } else {
                    delete descriptor.set;
                }
            }
            
            Object.defineProperty(cloned, key, descriptor);
        }
        
        return cloned;
    }
    
    return clone(obj);
}
```

### Complexity Analysis
- **Time Complexity**: O(n) where n is the total number of values in the object tree
- **Space Complexity**: O(n) for the cloned structure + O(d) for recursion stack where d is depth
- **Pros**: Handles all cases, preserves object types, prevents circular reference issues
- **Cons**: More complex, higher memory usage for tracking visited objects

## Advanced Features & Optimizations

### 1. Streaming Deep Clone for Large Objects
```javascript
class StreamingCloner {
    constructor(options = {}) {
        this.batchSize = options.batchSize || 1000;
        this.delay = options.delay || 0;
    }
    
    async cloneAsync(obj) {
        const visited = new WeakMap();
        const queue = [{ obj, parent: null, key: null }];
        let result = null;
        let processed = 0;
        
        while (queue.length > 0) {
            const batch = queue.splice(0, this.batchSize);
            
            for (const { obj, parent, key } of batch) {
                const cloned = this.cloneValue(obj, visited, queue);
                
                if (parent === null) {
                    result = cloned;
                } else {
                    parent[key] = cloned;
                }
                
                processed++;
            }
            
            // Allow UI to breathe
            if (this.delay > 0 && queue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, this.delay));
            }
        }
        
        return result;
    }
    
    cloneValue(obj, visited, queue) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        if (visited.has(obj)) {
            return visited.get(obj);
        }
        
        let cloned;
        
        if (Array.isArray(obj)) {
            cloned = [];
            visited.set(obj, cloned);
            
            obj.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    queue.push({ obj: item, parent: cloned, key: index });
                } else {
                    cloned[index] = item;
                }
            });
        } else {
            cloned = {};
            visited.set(obj, cloned);
            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    if (typeof value === 'object' && value !== null) {
                        queue.push({ obj: value, parent: cloned, key: key });
                    } else {
                        cloned[key] = value;
                    }
                }
            }
        }
        
        return cloned;
    }
}

// Usage for large objects
const cloner = new StreamingCloner({ batchSize: 500, delay: 1 });

async function handleLargeDataClone(largeObject) {
    showLoading(true);
    
    try {
        const cloned = await cloner.cloneAsync(largeObject);
        console.log('Large object cloned successfully');
        return cloned;
    } catch (error) {
        console.error('Cloning failed:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}
```

### 2. Selective Deep Clone
```javascript
class SelectiveCloner {
    constructor(options = {}) {
        this.shouldClone = options.shouldClone || (() => true);
        this.transform = options.transform || ((value) => value);
        this.pathFilters = options.pathFilters || [];
    }
    
    clone(obj, path = '') {
        if (!this.shouldClonePath(path)) {
            return this.transform(obj, path);
        }
        
        if (obj === null || typeof obj !== 'object') {
            return this.transform(obj, path);
        }
        
        if (!this.shouldClone(obj, path)) {
            return this.transform(obj, path);
        }
        
        if (Array.isArray(obj)) {
            return obj.map((item, index) => 
                this.clone(item, `${path}[${index}]`)
            );
        }
        
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newPath = path ? `${path}.${key}` : key;
                cloned[key] = this.clone(obj[key], newPath);
            }
        }
        
        return this.transform(cloned, path);
    }
    
    shouldClonePath(path) {
        if (this.pathFilters.length === 0) return true;
        
        return this.pathFilters.some(filter => {
            if (typeof filter === 'string') {
                return path.includes(filter);
            }
            if (filter instanceof RegExp) {
                return filter.test(path);
            }
            if (typeof filter === 'function') {
                return filter(path);
            }
            return true;
        });
    }
}

// Usage examples
const sensitiveDataCloner = new SelectiveCloner({
    shouldClone: (obj, path) => {
        // Don't clone sensitive data
        if (path.includes('password') || path.includes('token')) {
            return false;
        }
        return true;
    },
    transform: (value, path) => {
        if (path.includes('password')) {
            return '[REDACTED]';
        }
        if (path.includes('email')) {
            return value.replace(/(.{2}).*(@.*)/, '$1***$2');
        }
        return value;
    }
});

const user = {
    id: 1,
    name: 'John',
    email: 'john@example.com',
    password: 'secret123',
    settings: {
        apiToken: 'abc123',
        theme: 'dark'
    }
};

const safeUser = sensitiveDataCloner.clone(user);
// Result: { id: 1, name: 'John', email: 'jo***@example.com', password: '[REDACTED]', settings: { apiToken: '[REDACTED]', theme: 'dark' } }
```

## Testing & Edge Cases

### Comprehensive Test Suite
```javascript
function testDeepClone() {
    const testCases = [
        {
            name: 'Primitives',
            input: 42,
            test: (original, cloned) => original === cloned
        },
        {
            name: 'Simple Object',
            input: { a: 1, b: 'hello' },
            test: (original, cloned) => 
                cloned.a === 1 && cloned.b === 'hello' && original !== cloned
        },
        {
            name: 'Nested Object',
            input: { a: { b: { c: 1 } } },
            test: (original, cloned) => 
                cloned.a.b.c === 1 && original.a !== cloned.a
        },
        {
            name: 'Array',
            input: [1, 2, { a: 3 }],
            test: (original, cloned) => 
                Array.isArray(cloned) && cloned[2].a === 3 && original[2] !== cloned[2]
        },
        {
            name: 'Date',
            input: new Date('2023-01-01'),
            test: (original, cloned) => 
                cloned instanceof Date && cloned.getTime() === original.getTime() && original !== cloned
        },
        {
            name: 'RegExp',
            input: /test/gi,
            test: (original, cloned) => 
                cloned instanceof RegExp && cloned.source === 'test' && cloned.flags === 'gi'
        },
        {
            name: 'Circular Reference',
            input: (() => {
                const obj = { a: 1 };
                obj.self = obj;
                return obj;
            })(),
            test: (original, cloned) => 
                cloned.a === 1 && cloned.self === cloned && original !== cloned
        },
        {
            name: 'Map',
            input: new Map([['key1', 'value1'], ['key2', { nested: true }]]),
            test: (original, cloned) => 
                cloned instanceof Map && cloned.get('key1') === 'value1' && 
                cloned.get('key2').nested === true
        },
        {
            name: 'Set',
            input: new Set([1, 2, { a: 3 }]),
            test: (original, cloned) => 
                cloned instanceof Set && cloned.size === 3 && cloned.has(1)
        }
    ];
    
    const implementations = [
        { name: 'Basic Deep Clone', func: deepClone },
        { name: 'JSON Clone', func: jsonDeepClone },
        { name: 'Advanced Clone', func: (obj) => advancedDeepClone(obj) }
    ];
    
    implementations.forEach(impl => {
        console.log(`\nTesting ${impl.name}:`);
        let passed = 0;
        
        testCases.forEach(testCase => {
            try {
                const cloned = impl.func(testCase.input);
                const success = testCase.test(testCase.input, cloned);
                
                console.log(`  ${success ? '✓' : '✗'} ${testCase.name}`);
                if (success) passed++;
            } catch (error) {
                console.log(`  ✗ ${testCase.name}: ERROR - ${error.message}`);
            }
        });
        
        console.log(`  Summary: ${passed}/${testCases.length} tests passed`);
    });
}

testDeepClone();
```

## Performance Benchmarking
```javascript
function benchmarkCloning() {
    // Create test data of different sizes
    const createTestData = (size) => {
        const data = { arrays: [], objects: [], nested: {} };
        
        for (let i = 0; i < size; i++) {
            data.arrays.push([i, `item-${i}`, { value: i * 2 }]);
            data.objects.push({ id: i, name: `Object ${i}`, active: i % 2 === 0 });
            data.nested[`key${i}`] = {
                level1: {
                    level2: {
                        level3: { value: i }
                    }
                }
            };
        }
        
        return data;
    };
    
    const sizes = [100, 1000, 5000];
    const methods = [
        { name: 'JSON', func: jsonDeepClone },
        { name: 'Recursive', func: deepClone },
        { name: 'Advanced', func: (obj) => advancedDeepClone(obj) }
    ];
    
    console.log('Performance Benchmark:\n');
    
    sizes.forEach(size => {
        console.log(`Data size: ${size} items`);
        const testData = createTestData(size);
        
        methods.forEach(method => {
            const start = performance.now();
            
            try {
                const cloned = method.func(testData);
                const end = performance.now();
                const time = (end - start).toFixed(2);
                const memory = JSON.stringify(cloned).length;
                
                console.log(`  ${method.name}: ${time}ms (${(memory / 1024).toFixed(1)}KB)`);
            } catch (error) {
                console.log(`  ${method.name}: ERROR - ${error.message}`);
            }
        });
        
        console.log();
    });
}

benchmarkCloning();
```

## Interview Tips

### Discussion Points
1. **Different Approaches**: Compare JSON vs recursive vs library solutions
2. **Edge Cases**: Circular references, special objects, functions
3. **Performance**: Memory usage vs speed trade-offs
4. **Use Cases**: When deep cloning is necessary vs alternatives

### Common Follow-ups
1. **"Handle circular references"** → WeakMap tracking
2. **"Clone specific object types"** → Custom handlers for Date, RegExp, etc.
3. **"Optimize for performance"** → Streaming, selective cloning
4. **"Immutable updates"** → Integration with state management

### Microsoft-Specific Context
1. **Office Applications**: Document state management, undo/redo systems
2. **Teams**: Message history, user data handling
3. **Gaming**: Game state snapshots, save systems
4. **Development Tools**: Configuration management, debugging data

## Key Takeaways

1. **Choose Right Approach**: JSON for simple data, recursive for complex objects
2. **Handle Edge Cases**: Circular references, special object types
3. **Performance Matters**: Consider object size and cloning frequency
4. **Immutability**: Essential for state management and preventing bugs
5. **Testing**: Always test with real-world data structures and edge cases 