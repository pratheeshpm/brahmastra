# Event Emitter Implementation ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Implementation](#core-implementation)
  - [Basic Event Emitter](#basic-event-emitter)
  - [Advanced Event Emitter](#advanced-event-emitter)
  - [TypeScript Version](#typescript-version)
- [Advanced Features](#advanced-features)
  - [Event Namespacing](#event-namespacing)
  - [Event Priority](#event-priority)
  - [Memory Management](#memory-management)
- [Complexity Analysis](#complexity-analysis)
- [Testing](#testing)
- [Usage & Applications](#usage--applications)
  - [Component Communication](#component-communication)
  - [State Management](#state-management)
  - [Custom DOM Events](#custom-dom-events)
  - [Service Layer](#service-layer)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Implement an Event Emitter (Observer Pattern) that allows objects to subscribe to and emit custom events, enabling decoupled communication between different parts of an application.

## Quick Start Example

```javascript
// 1. Basic Event Emitter implementation
class EventEmitter {
    constructor() {
        this.events = new Map();
    }
    
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
        return () => this.off(event, callback);
    }
    
    emit(event, ...args) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => callback(...args));
        }
    }
    
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        }
    }
}

// 2. Usage for component communication
const eventBus = new EventEmitter();

// Subscribe to events
eventBus.on('user:login', (user) => {
    console.log(`${user.name} logged in`);
    // Update UI, analytics, etc.
});

eventBus.on('data:update', (data) => {
    console.log('Data updated:', data);
    // Refresh components
});

// Emit events from anywhere
eventBus.emit('user:login', { name: 'John', id: 123 });
eventBus.emit('data:update', { users: [...] });

// 3. React component usage
function UserComponent() {
    useEffect(() => {
        const unsubscribe = eventBus.on('user:update', (user) => {
            // Handle user updates
        });
        
        return unsubscribe; // Cleanup on unmount
    }, []);
    
    const handleLogin = () => {
        eventBus.emit('user:login', currentUser);
    };
    
    return <button onClick={handleLogin}>Login</button>;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Implementation

### Basic Event Emitter

```javascript
class EventEmitter {
    constructor() {
        // Use Map instead of plain object for better performance and cleaner API
        // Map provides faster lookups, better iteration, and supports any key type
        // Structure: Map<eventName, Array<callback>>
        this.events = new Map();
        /* 
        Data structure visualization:
        Map {   
            'user:login' => [callback1, callback2, callback3],
            'data:update' => [callback1, callback2],
            'error:network' => [callback1]
        }
        
        Why Map over Object:
        - Faster iteration and size checking
        - No prototype pollution concerns
        - Better performance for frequent additions/deletions
        - Cleaner API with has(), get(), set(), delete()
         */
    }
    
    on(event, callback) {
        // Subscribe to an event - core method for registering listeners
        
        // Check if this event type has been registered before
        // If not, initialize an empty array to store callbacks
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        // Add the new callback to the array of listeners for this event
        // Using push() maintains the order of registration (FIFO execution)
        this.events.get(event).push(callback);
        
        // Return an unsubscribe function for convenience
        // This creates a closure that captures the event and callback
        // Allows for easy cleanup: const unsubscribe = emitter.on('event', callback); unsubscribe();
        return () => this.off(event, callback);
    }
    
    off(event, callback) {
        // Unsubscribe from an event - removes specific callback
        
        // Early return if event doesn't exist - no cleanup needed
        // Prevents unnecessary processing and potential errors
        if (!this.events.has(event)) {
            return false; // Indicates no removal occurred
        }
        
        // Get the array of callbacks for this event
        const callbacks = this.events.get(event);
        
        // Find the index of the specific callback to remove
        // Using indexOf to find exact function reference match
        const index = callbacks.indexOf(callback);
        
        if (index !== -1) {
            // Remove the callback from the array using splice
            // splice() modifies the original array and maintains indices
            callbacks.splice(index, 1);
            
            // Memory optimization: clean up empty event arrays
            // Prevents memory leaks from accumulating empty arrays
            // Keeps the events Map lean and improves performance
            if (callbacks.length === 0) {
                this.events.delete(event);
            }
            
            return true; // Indicates successful removal
        }
        
        return false; // Callback was not found
    }
    
    emit(event, ...args) {
        // Trigger an event - calls all registered callbacks with provided arguments
        
        // Early return if no listeners exist for this event
        // Prevents unnecessary processing and provides fast path for unused events
        if (!this.events.has(event)) {
            return false; // Indicates no listeners were called
        }
        
        // Create a shallow copy of the callbacks array to prevent modification during iteration
        // Critical safety measure: if a callback calls off() or on() during emission,
        // it won't affect the current iteration loop, preventing bugs and infinite loops
        const callbacks = this.events.get(event).slice();
        
        // Execute each callback with the provided arguments
        // Using forEach for clean iteration and automatic array handling
        callbacks.forEach(callback => {
            try {
                // Use spread operator to pass all arguments to the callback
                // This allows events to carry any number of parameters
                callback(...args);
            } catch (error) {
                // Error isolation: one callback failure shouldn't stop others
                // Log the error for debugging but continue processing remaining callbacks
                // This ensures robustness in event-driven architectures
                console.error(`Error in event listener for "${event}":`, error);
                // Note: Consider adding error event emission in production systems
            }
        });
        
        return true; // Indicates listeners were called successfully
    }
    
    once(event, callback) {
        // Subscribe to an event that should only fire once
        // Automatically unsubscribes after first execution
        
        // Create a wrapper callback that handles the one-time behavior
        // This wrapper will be the actual callback stored in the events Map
        const onceCallback = (...args) => {
            // First, remove this wrapper from the listeners
            // Must happen before calling the original callback to prevent re-entry issues
            this.off(event, onceCallback);
            
            // Then execute the original callback with all provided arguments
            // Using spread operator to maintain argument transparency
            callback(...args);
        };
        
        // Register the wrapper callback using the standard on() method
        // This leverages existing functionality and maintains consistency
        // Returns the unsubscribe function in case manual cleanup is needed
        return this.on(event, onceCallback);
    }
    
    removeAllListeners(event) {
        // Bulk removal utility for cleanup operations
        
        if (event) {
            // Remove all listeners for a specific event
            // More efficient than calling off() multiple times
            this.events.delete(event);
        } else {
            // Remove all listeners for all events - complete reset
            // Useful for cleanup during component destruction or testing
            this.events.clear();
        }
    }
    
    listenerCount(event) {
        // Utility method to get the number of listeners for an event
        // Useful for debugging, monitoring, and conditional logic
        
        // Use ternary operator for concise null-safe access
        // Returns 0 if event doesn't exist, avoiding errors
        return this.events.has(event) ? this.events.get(event).length : 0;
    }
    
    eventNames() {
        // Get all currently registered event names
        // Useful for introspection, debugging, and dynamic event handling
        
        // Convert Map keys iterator to array for easier consumption
        // Array.from() handles the iterator protocol automatically
        return Array.from(this.events.keys());
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Advanced Event Emitter

```javascript
class AdvancedEventEmitter extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.maxListeners = options.maxListeners || 10;
        this.wildcardEvents = new Map();
        this.eventHistory = options.captureHistory ? [] : null;
        this.errorHandlers = [];
    }
    
    on(event, callback, options = {}) {
        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }
        
        // Check max listeners limit
        if (this.listenerCount(event) >= this.maxListeners) {
            console.warn(`Max listeners (${this.maxListeners}) exceeded for event "${event}"`);
        }
        
        // Handle wildcard events
        if (event.includes('*')) {
            return this.onWildcard(event, callback, options);
        }
        
        const callbackWrapper = this.createCallbackWrapper(callback, options);
        
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        this.events.get(event).push(callbackWrapper);
        
        // Return enhanced unsubscribe function
        return () => this.off(event, callbackWrapper);
    }
    
    createCallbackWrapper(callback, options) {
        const wrapper = (...args) => {
            // Pre-processing
            if (options.filter && !options.filter(...args)) {
                return;
            }
            
            if (options.transform) {
                args = options.transform(...args);
            }
            
            // Execute callback
            try {
                const result = callback(...args);
                
                // Handle async callbacks
                if (result instanceof Promise) {
                    result.catch(error => this.handleError(error, callback));
                }
                
                return result;
            } catch (error) {
                this.handleError(error, callback);
            }
        };
        
        // Store original callback for removal
        wrapper._originalCallback = callback;
        wrapper._options = options;
        
        return wrapper;
    }
    
    onWildcard(pattern, callback, options) {
        if (!this.wildcardEvents.has(pattern)) {
            this.wildcardEvents.set(pattern, []);
        }
        
        const wrapper = this.createCallbackWrapper(callback, options);
        this.wildcardEvents.get(pattern).push(wrapper);
        
        return () => this.offWildcard(pattern, wrapper);
    }
    
    offWildcard(pattern, callback) {
        if (!this.wildcardEvents.has(pattern)) {
            return false;
        }
        
        const callbacks = this.wildcardEvents.get(pattern);
        const index = callbacks.findIndex(cb => 
            cb === callback || cb._originalCallback === callback
        );
        
        if (index !== -1) {
            callbacks.splice(index, 1);
            
            if (callbacks.length === 0) {
                this.wildcardEvents.delete(pattern);
            }
            
            return true;
        }
        
        return false;
    }
    
    emit(event, ...args) {
        const timestamp = Date.now();
        
        // Store in history if enabled
        if (this.eventHistory) {
            this.eventHistory.push({
                event,
                args,
                timestamp
            });
            
            // Limit history size
            if (this.eventHistory.length > 1000) {
                this.eventHistory.shift();
            }
        }
        
        let handled = false;
        
        // Handle direct event listeners
        if (this.events.has(event)) {
            const callbacks = this.events.get(event).slice();
            
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                    handled = true;
                } catch (error) {
                    this.handleError(error, callback);
                }
            });
        }
        
        // Handle wildcard listeners
        for (const [pattern, callbacks] of this.wildcardEvents) {
            if (this.matchWildcard(pattern, event)) {
                callbacks.slice().forEach(callback => {
                    try {
                        callback(...args);
                        handled = true;
                    } catch (error) {
                        this.handleError(error, callback);
                    }
                });
            }
        }
        
        return handled;
    }
    
    matchWildcard(pattern, event) {
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        
        return new RegExp(`^${regexPattern}$`).test(event);
    }
    
    handleError(error, callback) {
        if (this.errorHandlers.length > 0) {
            this.errorHandlers.forEach(handler => {
                try {
                    handler(error, callback);
                } catch (handlerError) {
                    console.error('Error in error handler:', handlerError);
                }
            });
        } else {
            console.error('Unhandled event emitter error:', error);
        }
    }
    
    onError(handler) {
        this.errorHandlers.push(handler);
        
        return () => {
            const index = this.errorHandlers.indexOf(handler);
            if (index !== -1) {
                this.errorHandlers.splice(index, 1);
            }
        };
    }
    
    async emitAsync(event, ...args) {
        const callbacks = this.events.has(event) 
            ? this.events.get(event).slice() 
            : [];
        
        const results = await Promise.allSettled(
            callbacks.map(async callback => {
                return await callback(...args);
            })
        );
        
        return results;
    }
    
    pipe(otherEmitter) {
        const handler = (event, ...args) => {
            otherEmitter.emit(event, ...args);
        };
        
        // Listen to all events and forward them
        this.on('*', handler);
        
        return () => this.off('*', handler);
    }
    
    getHistory(eventFilter) {
        if (!this.eventHistory) {
            return null;
        }
        
        if (eventFilter) {
            return this.eventHistory.filter(entry => 
                typeof eventFilter === 'string' 
                    ? entry.event === eventFilter
                    : eventFilter(entry)
            );
        }
        
        return [...this.eventHistory];
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### TypeScript Version

```typescript
interface EventCallback<T = any> {
    (...args: T[]): void | Promise<void>;
}

interface EventOptions {
    filter?: (...args: any[]) => boolean;
    transform?: (...args: any[]) => any[];
    once?: boolean;
    priority?: number;
}

interface EventHistoryEntry {
    event: string;
    args: any[];
    timestamp: number;
}

class TypedEventEmitter<EventMap = Record<string, any[]>> {
    private events = new Map<keyof EventMap, EventCallback[]>();
    private maxListeners: number;
    
    constructor(maxListeners = 10) {
        this.maxListeners = maxListeners;
    }
    
    on<K extends keyof EventMap>(
        event: K,
        callback: (...args: EventMap[K]) => void,
        options?: EventOptions
    ): () => void {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const callbacks = this.events.get(event)!;
        
        if (callbacks.length >= this.maxListeners) {
            console.warn(`Max listeners exceeded for event "${String(event)}"`);
        }
        
        callbacks.push(callback as EventCallback);
        
        return () => this.off(event, callback);
    }
    
    off<K extends keyof EventMap>(
        event: K,
        callback: (...args: EventMap[K]) => void
    ): boolean {
        const callbacks = this.events.get(event);
        
        if (!callbacks) {
            return false;
        }
        
        const index = callbacks.indexOf(callback as EventCallback);
        
        if (index !== -1) {
            callbacks.splice(index, 1);
            
            if (callbacks.length === 0) {
                this.events.delete(event);
            }
            
            return true;
        }
        
        return false;
    }
    
    emit<K extends keyof EventMap>(event: K, ...args: EventMap[K]): boolean {
        const callbacks = this.events.get(event);
        
        if (!callbacks || callbacks.length === 0) {
            return false;
        }
        
        callbacks.slice().forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error(`Error in event listener for "${String(event)}":`, error);
            }
        });
        
        return true;
    }
    
    once<K extends keyof EventMap>(
        event: K,
        callback: (...args: EventMap[K]) => void
    ): () => void {
        const onceCallback = (...args: EventMap[K]) => {
            this.off(event, onceCallback);
            callback(...args);
        };
        
        return this.on(event, onceCallback);
    }
}

// Usage example
interface AppEvents {
    'user:login': [{ id: string; name: string }];
    'user:logout': [];
    'data:update': [{ type: string; data: any }];
    'error': [Error];
}

const emitter = new TypedEventEmitter<AppEvents>();

emitter.on('user:login', (user) => {
    console.log(`User ${user.name} logged in`);
});
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Advanced Features

### Event Namespacing

```javascript
class NamespacedEventEmitter extends AdvancedEventEmitter {
    constructor(options) {
        super(options);
        this.namespaces = new Map();
    }
    
    namespace(name) {
        if (!this.namespaces.has(name)) {
            this.namespaces.set(name, new NamespaceProxy(this, name));
        }
        
        return this.namespaces.get(name);
    }
    
    emitToNamespace(namespace, event, ...args) {
        return this.emit(`${namespace}:${event}`, ...args);
    }
    
    removeNamespace(name) {
        // Remove all events for this namespace
        const pattern = `${name}:`;
        
        for (const [event] of this.events) {
            if (event.startsWith(pattern)) {
                this.events.delete(event);
            }
        }
        
        this.namespaces.delete(name);
    }
}

class NamespaceProxy {
    constructor(emitter, namespace) {
        this.emitter = emitter;
        this.namespace = namespace;
    }
    
    on(event, callback, options) {
        return this.emitter.on(`${this.namespace}:${event}`, callback, options);
    }
    
    off(event, callback) {
        return this.emitter.off(`${this.namespace}:${event}`, callback);
    }
    
    emit(event, ...args) {
        return this.emitter.emit(`${this.namespace}:${event}`, ...args);
    }
    
    once(event, callback) {
        return this.emitter.once(`${this.namespace}:${event}`, callback);
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Event Priority

```javascript
class PriorityEventEmitter extends AdvancedEventEmitter {
    on(event, callback, options = {}) {
        const priority = options.priority || 0;
        const wrappedCallback = this.createCallbackWrapper(callback, options);
        wrappedCallback._priority = priority;
        
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        const callbacks = this.events.get(event);
        
        // Insert callback based on priority (higher priority first)
        let insertIndex = callbacks.length;
        for (let i = 0; i < callbacks.length; i++) {
            if ((callbacks[i]._priority || 0) < priority) {
                insertIndex = i;
                break;
            }
        }
        
        callbacks.splice(insertIndex, 0, wrappedCallback);
        
        return () => this.off(event, wrappedCallback);
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Memory Management

```javascript
class ManagedEventEmitter extends AdvancedEventEmitter {
    constructor(options) {
        super(options);
        this.activeSubscriptions = new WeakMap();
        this.autoCleanup = options.autoCleanup !== false;
        
        if (this.autoCleanup) {
            this.startCleanupTimer();
        }
    }
    
    on(event, callback, options = {}) {
        const unsubscribe = super.on(event, callback, options);
        
        // Track subscription for cleanup
        if (options.owner) {
            this.trackSubscription(options.owner, unsubscribe);
        }
        
        return unsubscribe;
    }
    
    trackSubscription(owner, unsubscribe) {
        if (!this.activeSubscriptions.has(owner)) {
            this.activeSubscriptions.set(owner, []);
        }
        
        this.activeSubscriptions.get(owner).push(unsubscribe);
    }
    
    cleanup(owner) {
        const subscriptions = this.activeSubscriptions.get(owner);
        
        if (subscriptions) {
            subscriptions.forEach(unsubscribe => unsubscribe());
            this.activeSubscriptions.delete(owner);
        }
    }
    
    startCleanupTimer() {
        setInterval(() => {
            this.performMaintenanceCleanup();
        }, 60000); // Clean up every minute
    }
    
    performMaintenanceCleanup() {
        // Remove empty event arrays
        for (const [event, callbacks] of this.events) {
            if (callbacks.length === 0) {
                this.events.delete(event);
            }
        }
        
        // Trim history if it's getting too large
        if (this.eventHistory && this.eventHistory.length > 1000) {
            this.eventHistory = this.eventHistory.slice(-500);
        }
    }
    
    getMemoryUsage() {
        return {
            events: this.events.size,
            totalListeners: Array.from(this.events.values())
                .reduce((sum, callbacks) => sum + callbacks.length, 0),
            wildcardPatterns: this.wildcardEvents.size,
            historySize: this.eventHistory ? this.eventHistory.length : 0
        };
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Complexity Analysis

### Time Complexity
- **on()**: O(1) - Adding to array/map
- **off()**: O(n) - Finding callback in array
- **emit()**: O(n) - Calling all callbacks
- **once()**: O(1) - Wrapper around on()

### Space Complexity
- **O(n)** - Where n is the number of event listeners
- Memory grows with number of events and listeners per event

**Performance Characteristics:**
- Map-based storage for O(1) event lookup
- Array cloning prevents issues during emission
- Error isolation prevents one bad listener from breaking others

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
describe('EventEmitter', () => {
    let emitter;
    
    beforeEach(() => {
        emitter = new EventEmitter();
    });
    
    describe('Basic functionality', () => {
        test('should add and trigger event listeners', () => {
            const callback = jest.fn();
            
            emitter.on('test', callback);
            emitter.emit('test', 'data');
            
            expect(callback).toHaveBeenCalledWith('data');
        });
        
        test('should remove event listeners', () => {
            const callback = jest.fn();
            
            emitter.on('test', callback);
            emitter.off('test', callback);
            emitter.emit('test');
            
            expect(callback).not.toHaveBeenCalled();
        });
        
        test('should support once listeners', () => {
            const callback = jest.fn();
            
            emitter.once('test', callback);
            emitter.emit('test');
            emitter.emit('test');
            
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('Multiple listeners', () => {
        test('should call all listeners for an event', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            emitter.on('test', callback1);
            emitter.on('test', callback2);
            emitter.emit('test', 'data');
            
            expect(callback1).toHaveBeenCalledWith('data');
            expect(callback2).toHaveBeenCalledWith('data');
        });
        
        test('should handle listener removal correctly', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            
            emitter.on('test', callback1);
            emitter.on('test', callback2);
            emitter.off('test', callback1);
            emitter.emit('test');
            
            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });
    });
    
    describe('Error handling', () => {
        test('should handle errors in listeners', () => {
            const goodCallback = jest.fn();
            const badCallback = jest.fn(() => {
                throw new Error('Test error');
            });
            
            console.error = jest.fn(); // Mock console.error
            
            emitter.on('test', badCallback);
            emitter.on('test', goodCallback);
            emitter.emit('test');
            
            expect(console.error).toHaveBeenCalled();
            expect(goodCallback).toHaveBeenCalled();
        });
    });
    
    describe('Memory management', () => {
        test('should clean up empty event arrays', () => {
            const callback = jest.fn();
            
            emitter.on('test', callback);
            expect(emitter.eventNames()).toContain('test');
            
            emitter.off('test', callback);
            expect(emitter.eventNames()).not.toContain('test');
        });
        
        test('should return unsubscribe function', () => {
            const callback = jest.fn();
            const unsubscribe = emitter.on('test', callback);
            
            unsubscribe();
            emitter.emit('test');
            
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage & Applications

### Component Communication

```javascript
// Global event bus for component communication
class ComponentEventBus extends AdvancedEventEmitter {
    constructor() {
        super({ maxListeners: 50 });
        this.componentRegistry = new Map();
    }
    
    registerComponent(component, id) {
        this.componentRegistry.set(id, component);
        
        // Auto-cleanup when component unmounts
        if (component.componentWillUnmount) {
            const originalUnmount = component.componentWillUnmount.bind(component);
            component.componentWillUnmount = () => {
                this.unregisterComponent(id);
                originalUnmount();
            };
        }
    }
    
    unregisterComponent(id) {
        this.componentRegistry.delete(id);
        // Remove all listeners from this component
        this.removeAllListeners(`component:${id}:*`);
    }
    
    broadcast(event, data, excludeComponents = []) {
        this.componentRegistry.forEach((component, id) => {
            if (!excludeComponents.includes(id)) {
                this.emit(`component:${id}:${event}`, data);
            }
        });
    }
}

// React component using event bus
class UserProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = { user: null };
        this.eventBus = props.eventBus;
    }
    
    componentDidMount() {
        this.eventBus.registerComponent(this, 'userProfile');
        
        this.unsubscribers = [
            this.eventBus.on('user:updated', this.handleUserUpdate.bind(this)),
            this.eventBus.on('user:login', this.handleUserLogin.bind(this)),
            this.eventBus.on('user:logout', this.handleUserLogout.bind(this))
        ];
    }
    
    componentWillUnmount() {
        this.unsubscribers.forEach(unsubscribe => unsubscribe());
        this.eventBus.unregisterComponent('userProfile');
    }
    
    handleUserUpdate(user) {
        this.setState({ user });
    }
    
    handleUserLogin(user) {
        this.setState({ user });
        this.eventBus.emit('analytics:track', 'user_login', { userId: user.id });
    }
    
    handleUserLogout() {
        this.setState({ user: null });
        this.eventBus.emit('analytics:track', 'user_logout');
    }
    
    render() {
        const { user } = this.state;
        
        return (
            <div>
                {user ? (
                    <div>
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                    </div>
                ) : (
                    <p>Please log in</p>
                )}
            </div>
        );
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### State Management

```javascript
// Simple state management using event emitters
class StateStore extends AdvancedEventEmitter {
    constructor(initialState = {}) {
        super();
        this.state = { ...initialState };
        this.reducers = new Map();
        this.middleware = [];
    }
    
    getState() {
        return { ...this.state };
    }
    
    setState(newState) {
        const prevState = this.getState();
        this.state = { ...this.state, ...newState };
        
        this.emit('state:changed', {
            prevState,
            newState: this.getState(),
            changes: newState
        });
    }
    
    addReducer(action, reducer) {
        this.reducers.set(action, reducer);
    }
    
    dispatch(action, payload) {
        // Apply middleware
        let processedAction = { type: action, payload };
        
        for (const middleware of this.middleware) {
            processedAction = middleware(processedAction, this.getState());
            if (!processedAction) return; // Middleware can cancel action
        }
        
        // Apply reducer
        const reducer = this.reducers.get(action);
        if (reducer) {
            const newState = reducer(this.getState(), processedAction);
            this.setState(newState);
        }
        
        // Emit action event
        this.emit(`action:${action}`, processedAction);
    }
    
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    
    subscribe(selector, callback) {
        let lastValue = selector(this.getState());
        
        return this.on('state:changed', ({ newState }) => {
            const currentValue = selector(newState);
            
            if (currentValue !== lastValue) {
                lastValue = currentValue;
                callback(currentValue, newState);
            }
        });
    }
}

// Usage
const store = new StateStore({ users: [], loading: false });

// Add reducers
store.addReducer('FETCH_USERS_START', (state) => ({
    ...state,
    loading: true
}));

store.addReducer('FETCH_USERS_SUCCESS', (state, action) => ({
    ...state,
    users: action.payload,
    loading: false
}));

// Add middleware for logging
store.addMiddleware((action, state) => {
    console.log('Action:', action.type, 'State:', state);
    return action;
});

// Subscribe to specific state changes
const unsubscribe = store.subscribe(
    state => state.users,
    (users) => console.log('Users updated:', users)
);

// Dispatch actions
store.dispatch('FETCH_USERS_START');
store.dispatch('FETCH_USERS_SUCCESS', [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
]);
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Custom DOM Events

```javascript
// Enhanced DOM element with custom events
class SmartElement extends AdvancedEventEmitter {
    constructor(element) {
        super();
        this.element = element;
        this.observers = new Map();
        this.setupObservers();
    }
    
    setupObservers() {
        // Visibility observer
        if (typeof IntersectionObserver !== 'undefined') {
            const visibilityObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    this.emit('visibility:changed', {
                        isVisible: entry.isIntersecting,
                        ratio: entry.intersectionRatio
                    });
                });
            });
            
            visibilityObserver.observe(this.element);
            this.observers.set('visibility', visibilityObserver);
        }
        
        // Resize observer
        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver((entries) => {
                entries.forEach(entry => {
                    this.emit('size:changed', {
                        width: entry.contentRect.width,
                        height: entry.contentRect.height
                    });
                });
            });
            
            resizeObserver.observe(this.element);
            this.observers.set('resize', resizeObserver);
        }
        
        // Click tracking with debouncing
        let clickTimeout;
        this.element.addEventListener('click', (e) => {
            clearTimeout(clickTimeout);
            
            clickTimeout = setTimeout(() => {
                this.emit('click:single', e);
            }, 300);
        });
        
        this.element.addEventListener('dblclick', (e) => {
            clearTimeout(clickTimeout);
            this.emit('click:double', e);
        });
        
        // Hover timing
        let hoverStartTime;
        this.element.addEventListener('mouseenter', () => {
            hoverStartTime = Date.now();
            this.emit('hover:start');
        });
        
        this.element.addEventListener('mouseleave', () => {
            if (hoverStartTime) {
                const hoverDuration = Date.now() - hoverStartTime;
                this.emit('hover:end', { duration: hoverDuration });
            }
        });
    }
    
    destroy() {
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Remove all event listeners
        this.removeAllListeners();
    }
}

// Usage
const smartDiv = new SmartElement(document.getElementById('myDiv'));

smartDiv.on('visibility:changed', ({ isVisible, ratio }) => {
    console.log(`Element visibility: ${isVisible}, ratio: ${ratio}`);
});

smartDiv.on('size:changed', ({ width, height }) => {
    console.log(`Element resized: ${width}x${height}`);
});

smartDiv.on('hover:end', ({ duration }) => {
    if (duration > 2000) {
        console.log('User showed high interest (long hover)');
    }
});
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Service Layer

```javascript
// Service layer with event-driven architecture
class APIService extends AdvancedEventEmitter {
    constructor(baseURL) {
        super();
        this.baseURL = baseURL;
        this.cache = new Map();
        this.requestQueue = [];
        this.isOnline = navigator.onLine;
        
        this.setupNetworkMonitoring();
    }
    
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.emit('network:online');
            this.processQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.emit('network:offline');
        });
    }
    
    async request(endpoint, options = {}) {
        const requestId = Math.random().toString(36);
        
        this.emit('request:start', { requestId, endpoint, options });
        
        if (!this.isOnline && !options.offline) {
            this.queueRequest(endpoint, options);
            this.emit('request:queued', { requestId, endpoint });
            return null;
        }
        
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Cache successful GET requests
            if (options.method === 'GET' || !options.method) {
                this.cache.set(endpoint, data);
            }
            
            this.emit('request:success', { requestId, endpoint, data });
            
            return data;
        } catch (error) {
            this.emit('request:error', { requestId, endpoint, error });
            
            // Return cached data if available
            if (this.cache.has(endpoint)) {
                this.emit('request:cache-hit', { requestId, endpoint });
                return this.cache.get(endpoint);
            }
            
            throw error;
        }
    }
    
    queueRequest(endpoint, options) {
        this.requestQueue.push({ endpoint, options });
    }
    
    async processQueue() {
        if (this.requestQueue.length === 0) return;
        
        this.emit('queue:processing', { count: this.requestQueue.length });
        
        const requests = this.requestQueue.splice(0);
        
        for (const { endpoint, options } of requests) {
            try {
                await this.request(endpoint, { ...options, offline: false });
            } catch (error) {
                this.emit('queue:request-failed', { endpoint, error });
            }
        }
        
        this.emit('queue:processed');
    }
    
    // Convenience methods
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
    }
    
    clearCache() {
        this.cache.clear();
        this.emit('cache:cleared');
    }
}

// Usage with React hook
function useAPIService() {
    const [apiService] = useState(() => new APIService('/api'));
    const [isOnline, setIsOnline] = useState(true);
    const [queueCount, setQueueCount] = useState(0);
    
    useEffect(() => {
        const unsubscribers = [
            apiService.on('network:online', () => setIsOnline(true)),
            apiService.on('network:offline', () => setIsOnline(false)),
            apiService.on('queue:processing', ({ count }) => setQueueCount(count)),
            apiService.on('queue:processed', () => setQueueCount(0))
        ];
        
        return () => {
            unsubscribers.forEach(unsubscribe => unsubscribe());
        };
    }, [apiService]);
    
    return { apiService, isOnline, queueCount };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Key Discussion Points
1. **Observer Pattern**: Understanding the publish-subscribe pattern
2. **Memory Management**: Preventing memory leaks with proper cleanup
3. **Error Handling**: Isolating errors in event listeners
4. **Performance**: Considerations for high-frequency events

### Common Follow-up Questions
- **"How would you prevent memory leaks?"**
  - Discuss proper cleanup, WeakMap usage, automatic unsubscription

- **"How would you handle async event listeners?"**
  - Show async/await support, Promise.allSettled for multiple listeners

- **"How would you implement event priorities?"**
  - Demonstrate priority-based insertion and execution order

- **"How would you add wildcard event support?"**
  - Show pattern matching and regex-based event subscription

### Microsoft Context
- **Office 365**: Document collaboration events, real-time updates
- **Teams**: Message events, presence updates, notification system
- **VS Code**: Extension communication, editor events
- **Gaming**: Game state events, player actions, achievements

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

1. **Decoupling**: Event emitters enable loose coupling between components
2. **Scalability**: Supports multiple listeners per event for flexible architecture
3. **Error Isolation**: Proper error handling prevents cascade failures
4. **Memory Management**: Requires careful cleanup to prevent memory leaks
5. **Performance**: Consider event frequency and listener count for optimization
6. **Type Safety**: TypeScript support enables better developer experience

[⬆️ Back to Table of Contents](#table-of-contents) 