# Custom State Management - Microsoft Frontend Staff Engineer Interview

## Problem Statement

Implement a custom state management library similar to Zustand that supports:
- Simple store creation and usage
- React provider pattern
- Middleware support (logging, persistence, devtools)
- Computed/derived state
- Async actions
- Store composition
- TypeScript support

## Quick Start Example

```javascript
// 1. Create a store
const useCounterStore = createStore((set, get) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}));

// 2. Use in React component
function Counter() {
  const { count, increment, decrement, reset } = useStore(useCounterStore);
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

// 3. Subscribe to specific state (performance optimization)
function CountDisplay() {
  const count = useStore(useCounterStore, state => state.count);
  return <span>Count: {count}</span>;
}
```

## Table of Contents

1. [Basic Implementation](#basic-implementation)
2. [Advanced Implementation](#advanced-implementation)
3. [Usage Examples](#usage-examples)
4. [Complexity Analysis](#complexity-analysis)
5. [Testing](#testing)
6. [Applications](#applications)
7. [Interview Tips](#interview-tips)
8. [Key Takeaways](#key-takeaways)

---

## Basic Implementation

### Simple Store Implementation

```javascript
// Basic store implementation
function createStore(initializer) {
    let state;
    const listeners = new Set(); // Track subscribers
    
    const setState = (partial) => {
        const nextState = typeof partial === 'function' ? partial(state) : partial;
        
        if (nextState !== state) {
            state = { ...state, ...nextState }; // Merge state
            listeners.forEach(listener => listener(state)); // Notify all
        }
    };
    
    const getState = () => state; // Get current state
    
    const subscribe = (listener) => {
        listeners.add(listener); // Add subscriber
        return () => listeners.delete(listener); // Return unsubscribe
    };
    
    const api = { setState, getState, subscribe };
    state = initializer(api); // Initialize with API
    
    return api;
}

// React hook for consuming store state
function useStore(store, selector = (state) => state) {
    const [state, setState] = useState(() => selector(store.getState())); // Initial state
    
    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            setState(selector(store.getState())); // Update on changes
        });
        
        return unsubscribe; // Cleanup
    }, [store, selector]);
    
    return state;
}
```

[🔼 Back to Table of Contents](#table-of-contents)

---

## Advanced Implementation

### Complete State Management System with Provider

```javascript
// React Context for providing store instances
const { createContext, useContext } = require('react');

// Advanced store with middleware support and provider pattern
class StateManager {
    constructor() {
        // Registry of all created stores for debugging and DevTools
        this.stores = new Map();
        
        // Global middleware that applies to all stores
        this.globalMiddleware = [];
    }
    
    // Create store with advanced features
    createStore(initializer, options = {}) {
        const { 
            name = 'unnamed-store',
            middleware = [],
            enableDevTools = true 
        } = options;
        
        // Combine global and local middleware
        const allMiddleware = [...this.globalMiddleware, ...middleware];
        
        // Store state and metadata
        let state;
        const listeners = new Set();
        const computedCache = new Map();
        
        // Enhanced setState with middleware support
        const setState = (partial, actionName = 'setState') => {
            const prevState = state;
            
            // Calculate next state
            const nextState = typeof partial === 'function' ? partial(state) : partial;
            
            if (nextState !== state) {
                // Apply middleware before state change
                const action = { type: actionName, payload: partial, prevState, nextState };
                
                allMiddleware.forEach(middleware => {
                    if (middleware.beforeStateChange) {
                        middleware.beforeStateChange(action, api);
                    }
                });
                
                // Update state
                state = Object.assign({}, state, nextState);
                
                // Clear computed cache since state changed
                computedCache.clear();
                
                // Apply middleware after state change
                allMiddleware.forEach(middleware => {
                    if (middleware.afterStateChange) {
                        middleware.afterStateChange(action, api);
                    }
                });
                
                // Notify all listeners
                listeners.forEach(listener => listener(state, prevState));
            }
        };
        
        const getState = () => state;
        
        const subscribe = (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        };
        
        // Computed state functionality - memoized derived state
        const computed = (selector, deps = []) => {
            const key = JSON.stringify(deps);
            
            if (!computedCache.has(key)) {
                computedCache.set(key, selector(state));
            }
            
            return computedCache.get(key);
        };
        
        // Async action support with error handling
        const asyncAction = async (actionName, asyncFn) => {
            try {
                // Set loading state
                setState({ loading: true }, `${actionName}_START`);
                
                // Execute async function
                const result = await asyncFn(api);
                
                // Handle successful result
                if (result !== undefined) {
                    setState(result, `${actionName}_SUCCESS`);
                }
                
                return result;
            } catch (error) {
                // Handle error state
                setState({ error: error.message, loading: false }, `${actionName}_ERROR`);
                throw error;
            } finally {
                // Always clear loading state
                setState({ loading: false }, `${actionName}_END`);
            }
        };
        
        // Store API with enhanced features
        const api = { 
            setState, 
            getState, 
            subscribe, 
            computed,
            asyncAction,
            name,
            // Destroy method for cleanup
            destroy: () => {
                listeners.clear();
                computedCache.clear();
                this.stores.delete(name);
            }
        };
        
        // Initialize state
        state = initializer(api);
        
        // Register store for debugging
        this.stores.set(name, api);
        
        return api;
    }
    
    // Provider component for React Context
    createProvider(store, ProviderComponent = null) {
        const StoreContext = createContext(store);
        
        const Provider = ({ children, value = store }) => {
            const ContextProvider = ProviderComponent || StoreContext.Provider;
            return React.createElement(ContextProvider, { value }, children);
        };
        
        const useStoreContext = () => {
            const contextStore = useContext(StoreContext);
            if (!contextStore) {
                throw new Error('useStoreContext must be used within a Provider');
            }
            return contextStore;
        };
        
        return { Provider, useStoreContext, Context: StoreContext };
    }
    
    // Add global middleware
    addMiddleware(middleware) {
        this.globalMiddleware.push(middleware);
    }
    
    // Get all stores for debugging
    getAllStores() {
        return Array.from(this.stores.values());
    }
}

// Global state manager instance
const stateManager = new StateManager();

// Enhanced React hook with selector optimization
function useStore(store, selector = (state) => state, equalityFn = Object.is) {
    const { useState, useEffect, useRef } = require('react');
    
    // Memoize selector result to prevent unnecessary re-renders
    const selectedStateRef = useRef();
    const [, forceUpdate] = useState(0);
    
    // Update selected state and check if component should re-render
    const updateSelectedState = () => {
        const nextSelectedState = selector(store.getState());
        
        // Only re-render if selected state actually changed
        if (!equalityFn(selectedStateRef.current, nextSelectedState)) {
            selectedStateRef.current = nextSelectedState;
            forceUpdate(prev => prev + 1);
        }
    };
    
    // Initialize selected state
    if (selectedStateRef.current === undefined) {
        selectedStateRef.current = selector(store.getState());
    }
    
    useEffect(() => {
        const unsubscribe = store.subscribe(updateSelectedState);
        return unsubscribe;
    }, [store, selector, equalityFn]);
    
    return selectedStateRef.current;
}
```

### Common Middleware Implementations

```javascript
// Logging middleware - logs all state changes
const loggingMiddleware = {
    beforeStateChange: (action, store) => {
        console.group(`🔄 ${store.name}: ${action.type}`);
        console.log('Previous State:', action.prevState);
        console.log('Action Payload:', action.payload);
    },
    
    afterStateChange: (action, store) => {
        console.log('Next State:', action.nextState);
        console.groupEnd();
    }
};

// Persistence middleware - saves state to localStorage
const persistenceMiddleware = (key) => ({
    afterStateChange: (action, store) => {
        try {
            localStorage.setItem(key, JSON.stringify(store.getState()));
        } catch (error) {
            console.warn('Failed to persist state:', error);
        }
    }
});

// DevTools middleware - integrates with Redux DevTools
const devToolsMiddleware = {
    beforeStateChange: (action, store) => {
        if (window.__REDUX_DEVTOOLS_EXTENSION__) {
            window.__REDUX_DEVTOOLS_EXTENSION__.send(action, store.getState());
        }
    }
};

// Validation middleware - validates state shape
const validationMiddleware = (schema) => ({
    afterStateChange: (action, store) => {
        const state = store.getState();
        
        // Simple validation example
        Object.keys(schema).forEach(key => {
            if (schema[key].required && !(key in state)) {
                console.error(`Validation Error: Required field '${key}' is missing`);
            }
            
            if (key in state && typeof state[key] !== schema[key].type) {
                console.error(`Validation Error: Field '${key}' should be ${schema[key].type}`);
            }
        });
    }
});
```

[🔼 Back to Table of Contents](#table-of-contents)

---

## Usage Examples

### Basic Counter Store

```javascript
// Create a simple counter store
const counterStore = stateManager.createStore((set, get) => ({
    count: 0,
    increment: () => set(state => ({ count: state.count + 1 }), 'INCREMENT'),
    decrement: () => set(state => ({ count: state.count - 1 }), 'DECREMENT'),
    reset: () => set({ count: 0 }, 'RESET'),
    
    // Computed value
    isEven: () => get().count % 2 === 0,
    
    // Async action
    incrementAsync: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        get().increment();
    }
}), {
    name: 'counter-store',
    middleware: [loggingMiddleware]
});

// React component using the store
function Counter() {
    // Subscribe to specific state slice
    const count = useStore(counterStore, state => state.count);
    const { increment, decrement, reset, incrementAsync } = useStore(
        counterStore, 
        state => ({ 
            increment: state.increment, 
            decrement: state.decrement, 
            reset: state.reset,
            incrementAsync: state.incrementAsync
        })
    );
    
    return (
        <div>
            <h2>Count: {count}</h2>
            <button onClick={increment}>+</button>
            <button onClick={decrement}>-</button>
            <button onClick={reset}>Reset</button>
            <button onClick={incrementAsync}>Async +1</button>
        </div>
    );
}
```

### User Management Store with Provider

```javascript
// Complex user management store
const userStore = stateManager.createStore((set, get, api) => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    
    // Actions
    setUsers: (users) => set({ users }, 'SET_USERS'),
    
    addUser: (user) => set(state => ({
        users: [...state.users, { ...user, id: Date.now() }]
    }), 'ADD_USER'),
    
    removeUser: (id) => set(state => ({
        users: state.users.filter(user => user.id !== id)
    }), 'REMOVE_USER'),
    
    setCurrentUser: (user) => set({ currentUser: user }, 'SET_CURRENT_USER'),
    
    // Async actions using built-in asyncAction
    fetchUsers: () => api.asyncAction('FETCH_USERS', async () => {
        const response = await fetch('/api/users');
        const users = await response.json();
        return { users, error: null };
    }),
    
    // Computed values
    userCount: () => api.computed(
        state => state.users.length,
        [get().users.length]
    ),
    
    activeUsers: () => api.computed(
        state => state.users.filter(user => user.active),
        [get().users]
    )
}), {
    name: 'user-store',
    middleware: [
        loggingMiddleware,
        persistenceMiddleware('user-store'),
        validationMiddleware({
            users: { type: 'object', required: true },
            currentUser: { type: 'object', required: false }
        })
    ]
});

// Create provider
const { Provider: UserProvider, useStoreContext: useUserStore } = 
    stateManager.createProvider(userStore);

// App component with provider
function App() {
    return (
        <UserProvider>
            <UserList />
            <UserForm />
        </UserProvider>
    );
}

// Component using provider context
function UserList() {
    const store = useUserStore();
    const users = useStore(store, state => state.users);
    const loading = useStore(store, state => state.loading);
    const { removeUser, fetchUsers } = useStore(store, state => ({
        removeUser: state.removeUser,
        fetchUsers: state.fetchUsers
    }));
    
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    if (loading) return <div>Loading...</div>;
    
    return (
        <div>
            <h2>Users ({users.length})</h2>
            {users.map(user => (
                <div key={user.id}>
                    <span>{user.name}</span>
                    <button onClick={() => removeUser(user.id)}>Remove</button>
                </div>
            ))}
        </div>
    );
}
```

### Store Composition Example

```javascript
// Combine multiple stores
const appStore = stateManager.createStore((set, get) => ({
    // App-level state
    theme: 'light',
    notifications: [],
    
    // Reference to other stores
    counter: counterStore,
    users: userStore,
    
    // App-level actions
    toggleTheme: () => set(state => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
    }), 'TOGGLE_THEME'),
    
    addNotification: (message) => set(state => ({
        notifications: [...state.notifications, {
            id: Date.now(),
            message,
            timestamp: new Date()
        }]
    }), 'ADD_NOTIFICATION'),
    
    clearNotifications: () => set({ notifications: [] }, 'CLEAR_NOTIFICATIONS'),
    
    // Computed values from multiple stores
    appSummary: () => ({
        theme: get().theme,
        userCount: userStore.getState().users.length,
        counterValue: counterStore.getState().count,
        notificationCount: get().notifications.length
    })
}), {
    name: 'app-store',
    middleware: [loggingMiddleware]
});
```

[🔼 Back to Table of Contents](#table-of-contents)

---

## Complexity Analysis

### Time Complexity

| Operation | Basic Store | Advanced Store | Notes |
|-----------|-------------|----------------|-------|
| **setState** | O(1) | O(m) | m = number of middleware |
| **getState** | O(1) | O(1) | Direct state access |
| **subscribe** | O(1) | O(1) | Add to Set |
| **unsubscribe** | O(1) | O(1) | Remove from Set |
| **notify listeners** | O(n) | O(n) | n = number of subscribers |
| **computed** | - | O(1) | With memoization cache |
| **selector** | O(s) | O(s) | s = selector complexity |

### Space Complexity

| Component | Basic Store | Advanced Store | Notes |
|-----------|-------------|----------------|-------|
| **State storage** | O(s) | O(s) | s = state size |
| **Listeners** | O(n) | O(n) | n = number of subscribers |
| **Computed cache** | - | O(c) | c = number of computed values |
| **Middleware** | - | O(m) | m = middleware count |

### Performance Characteristics

```javascript
// Performance optimization techniques
const optimizedStore = stateManager.createStore((set, get) => ({
    // Use Set for fast lookups
    selectedIds: new Set(),
    
    // Batch updates to prevent multiple re-renders
    batchUpdate: (updates) => {
        // Single setState call for multiple changes
        set(state => ({
            ...state,
            ...updates
        }), 'BATCH_UPDATE');
    },
    
    // Shallow comparison for arrays/objects
    updateArray: (newArray) => {
        const current = get().array;
        
        // Only update if array actually changed
        if (current.length !== newArray.length || 
            current.some((item, index) => item !== newArray[index])) {
            set({ array: newArray });
        }
    }
}));
```

[🔼 Back to Table of Contents](#table-of-contents)

---

## Testing

### Unit Tests

```javascript
// Test suite for custom state management
describe('Custom State Management', () => {
    let store;
    let mockListener;
    
    beforeEach(() => {
        mockListener = jest.fn();
        store = stateManager.createStore((set) => ({
            count: 0,
            increment: () => set(state => ({ count: state.count + 1 }))
        }));
        store.subscribe(mockListener);
    });
    
    afterEach(() => {
        store.destroy();
    });
    
    test('should initialize with initial state', () => {
        expect(store.getState().count).toBe(0);
    });
    
    test('should update state correctly', () => {
        store.setState({ count: 5 });
        expect(store.getState().count).toBe(5);
    });
    
    test('should notify listeners on state change', () => {
        store.setState({ count: 1 });
        expect(mockListener).toHaveBeenCalledWith(
            expect.objectContaining({ count: 1 }),
            expect.objectContaining({ count: 0 })
        );
    });
    
    test('should not notify if state unchanged', () => {
        store.setState({ count: 0 }); // Same as initial
        expect(mockListener).not.toHaveBeenCalled();
    });
    
    test('should handle function updates', () => {
        store.getState().increment();
        expect(store.getState().count).toBe(1);
        expect(mockListener).toHaveBeenCalled();
    });
    
    test('should unsubscribe correctly', () => {
        const unsubscribe = store.subscribe(jest.fn());
        unsubscribe();
        
        store.setState({ count: 10 });
        // Should still only have original listener
        expect(mockListener).toHaveBeenCalledTimes(1);
    });
});

// Middleware testing
describe('Middleware System', () => {
    test('should apply middleware in order', () => {
        const order = [];
        
        const middleware1 = {
            beforeStateChange: () => order.push('before1'),
            afterStateChange: () => order.push('after1')
        };
        
        const middleware2 = {
            beforeStateChange: () => order.push('before2'),
            afterStateChange: () => order.push('after2')
        };
        
        const store = stateManager.createStore((set) => ({
            value: 0,
            update: () => set({ value: 1 })
        }), {
            middleware: [middleware1, middleware2]
        });
        
        store.getState().update();
        
        expect(order).toEqual(['before1', 'before2', 'after1', 'after2']);
    });
});

// React hook testing
describe('useStore Hook', () => {
    test('should return selected state', () => {
        const { result } = renderHook(() => 
            useStore(store, state => state.count)
        );
        
        expect(result.current).toBe(0);
    });
    
    test('should re-render on state change', () => {
        const { result } = renderHook(() => 
            useStore(store, state => state.count)
        );
        
        act(() => {
            store.setState({ count: 5 });
        });
        
        expect(result.current).toBe(5);
    });
    
    test('should not re-render if selected state unchanged', () => {
        let renderCount = 0;
        
        const { result } = renderHook(() => {
            renderCount++;
            return useStore(store, state => state.count);
        });
        
        act(() => {
            store.setState({ otherValue: 'changed' });
        });
        
        expect(renderCount).toBe(1); // Should not re-render
    });
});
```

### Integration Tests

```javascript
// Test complete user workflow
describe('User Management Integration', () => {
    test('should handle complete user workflow', async () => {
        const store = stateManager.createStore((set, get, api) => ({
            users: [],
            loading: false,
            
            fetchUsers: () => api.asyncAction('FETCH_USERS', async () => {
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 100));
                return { 
                    users: [
                        { id: 1, name: 'John', active: true },
                        { id: 2, name: 'Jane', active: false }
                    ]
                };
            }),
            
            getActiveUsers: () => api.computed(
                state => state.users.filter(user => user.active),
                [get().users]
            )
        }));
        
        // Initial state
        expect(store.getState().users).toEqual([]);
        expect(store.getState().loading).toBe(false);
        
        // Start fetch
        const fetchPromise = store.getState().fetchUsers();
        expect(store.getState().loading).toBe(true);
        
        // Wait for completion
        await fetchPromise;
        expect(store.getState().loading).toBe(false);
        expect(store.getState().users).toHaveLength(2);
        
        // Test computed value
        const activeUsers = store.getState().getActiveUsers();
        expect(activeUsers).toHaveLength(1);
        expect(activeUsers[0].name).toBe('John');
    });
});
```

[🔼 Back to Table of Contents](#table-of-contents)

---

## Applications

### Real-World Use Cases

1. **E-commerce Application**
   ```javascript
   const cartStore = stateManager.createStore((set, get) => ({
     items: [],
     total: 0,
     
     addItem: (product) => set(state => {
       const newItems = [...state.items, product];
       return {
         items: newItems,
         total: newItems.reduce((sum, item) => sum + item.price, 0)
       };
     }),
     
     removeItem: (id) => set(state => {
       const newItems = state.items.filter(item => item.id !== id);
       return {
         items: newItems,
         total: newItems.reduce((sum, item) => sum + item.price, 0)
       };
     })
   }));
   ```

2. **Real-time Chat Application**
   ```javascript
   const chatStore = stateManager.createStore((set, get, api) => ({
     messages: [],
     users: [],
     currentRoom: null,
     
     joinRoom: (roomId) => api.asyncAction('JOIN_ROOM', async () => {
       const response = await fetch(`/api/rooms/${roomId}/join`);
       const { messages, users } = await response.json();
       return { currentRoom: roomId, messages, users };
     }),
     
     sendMessage: (message) => set(state => ({
       messages: [...state.messages, {
         id: Date.now(),
         text: message,
         timestamp: new Date(),
         userId: state.currentUser.id
       }]
     }))
   }));
   ```

3. **Form State Management**
   ```javascript
   const formStore = stateManager.createStore((set, get) => ({
     values: {},
     errors: {},
     touched: {},
     isSubmitting: false,
     
     setValue: (field, value) => set(state => ({
       values: { ...state.values, [field]: value },
       errors: { ...state.errors, [field]: null },
       touched: { ...state.touched, [field]: true }
     })),
     
     setError: (field, error) => set(state => ({
       errors: { ...state.errors, [field]: error }
     })),
     
     validate: () => {
       const { values } = get();
       const errors = {};
       
       if (!values.email) errors.email = 'Email is required';
       if (!values.password) errors.password = 'Password is required';
       
       set({ errors });
       return Object.keys(errors).length === 0;
     }
   }));
   ```

### Performance Considerations

1. **Selector Optimization**
   ```javascript
   // Avoid creating new objects in selectors
   const badSelector = state => ({ count: state.count, name: state.name });
   
   // Use memoized selectors
   const goodSelector = useMemo(
     () => state => ({ count: state.count, name: state.name }),
     []
   );
   ```

2. **Batching Updates**
   ```javascript
   // Batch multiple updates into single render
   const batchedUpdate = () => {
     set(state => ({
       ...state,
       loading: false,
       data: newData,
       error: null
     }));
   };
   ```

[🔼 Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Key Discussion Points

1. **Architecture Decisions**
   - Why use global state vs component state?
   - When to use Context vs external state management?
   - How to handle state normalization?

2. **Performance Optimization**
   - Selector memoization strategies
   - Preventing unnecessary re-renders
   - Memory leak prevention

3. **Testing Strategy**
   - Unit testing stores in isolation
   - Integration testing with React components
   - Mocking async actions

4. **Comparison with Existing Solutions**
   - **vs Redux**: Simpler API, less boilerplate
   - **vs Zustand**: Similar API, custom implementation
   - **vs Context API**: Better performance for frequent updates

### Common Interview Questions

1. **"How would you prevent unnecessary re-renders?"**
   ```javascript
   // Use selector optimization
   const count = useStore(store, useCallback(state => state.count, []));
   
   // Shallow comparison for objects
   const user = useStore(store, state => state.user, shallowEqual);
   ```

2. **"How do you handle async actions?"**
   ```javascript
   // Built-in async action support with error handling
   const fetchData = () => api.asyncAction('FETCH_DATA', async () => {
     const response = await fetch('/api/data');
     return { data: await response.json() };
   });
   ```

3. **"How would you implement time travel debugging?"**
   ```javascript
   const historyMiddleware = {
     history: [],
     
     afterStateChange: (action, store) => {
       this.history.push({
         action: action.type,
         state: store.getState(),
         timestamp: Date.now()
       });
     }
   };
   ```

### Microsoft-Specific Considerations

1. **Office 365 Integration**: State management for collaborative features
2. **Teams Application**: Real-time state synchronization
3. **Large Scale**: Performance at enterprise scale
4. **TypeScript**: Strong typing for state shapes

### Best Practices

1. **Keep State Flat**: Avoid deeply nested state structures
2. **Normalize Data**: Use normalized state for complex data
3. **Action Naming**: Use descriptive action names for debugging
4. **Error Boundaries**: Handle errors in async actions
5. **Memory Management**: Clean up subscriptions and stores

[🔼 Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

### Technical Insights

1. **Store Architecture**: Simple API with powerful features through composition
2. **React Integration**: Hooks provide clean integration with React components
3. **Middleware System**: Extensible architecture for logging, persistence, debugging
4. **Performance**: Optimized selectors and batched updates prevent unnecessary renders

### Implementation Highlights

- **Subscription Pattern**: Efficient listener management with Set data structure
- **Functional Updates**: Support for both object and function-based state updates
- **Provider Pattern**: React Context integration for component tree state sharing
- **Computed Values**: Memoized derived state for performance optimization

### Production Considerations

1. **Error Handling**: Comprehensive error boundaries and async error management
2. **DevTools Integration**: Redux DevTools compatibility for debugging
3. **Persistence**: Automatic state persistence with localStorage integration
4. **Testing**: Complete test coverage for stores, hooks, and middleware

This implementation provides a production-ready state management solution that can compete with popular libraries while being customized for specific application needs.

[🔼 Back to Table of Contents](#table-of-contents) 