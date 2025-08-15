# Custom React Hooks ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Hook Implementations](#core-hook-implementations)
  - [useLocalStorage Hook](#uselocalstorage-hook)
  - [useDebounce Hook](#usedebounce-hook)
  - [useFetch Hook](#usefetch-hook)
  - [Utility Hooks](#utility-hooks)
- [Advanced Hook Patterns](#advanced-hook-patterns)
  - [useForm Hook](#useform-hook)
  - [useQuery Hook](#usequery-hook)
  - [useMutation Hook](#usemutation-hook)
- [Performance Optimization Hooks](#performance-optimization-hooks)
  - [useVirtualScroll Hook](#usevirtualscroll-hook)
  - [useIntersectionObserver Hook](#useintersectionobserver-hook)
  - [useWindowSize Hook](#usewindowsize-hook)
  - [useMediaQuery Hook](#usemediaquette-hook)
- [Testing](#testing)
- [Usage & Applications](#usage--applications)
  - [Form Management](#form-management)
  - [Data Fetching](#data-fetching)
  - [Performance Optimization](#performance-optimization)
  - [Real-World Examples](#real-world-examples)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Create custom React hooks that encapsulate common logic and demonstrate understanding of:

- Hook composition and reusability
- State management with useState and useReducer
- Side effects with useEffect
- Performance optimization with useMemo and useCallback
- Complex state logic patterns
- Error handling and cleanup

**Common Custom Hooks to Implement:**
- `useLocalStorage` - Persistent state with localStorage
- `useDebounce` - Debounced values for search/input
- `useFetch` - API data fetching with loading states
- `useToggle` - Boolean state management
- `usePrevious` - Track previous values
- `useAsync` - Async operation management

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Hook Implementations

### useLocalStorage Hook

```javascript
function useLocalStorage(key, initialValue) {
    // Initialize state with value from localStorage or fallback to initial value
    // Using lazy initial state to avoid reading localStorage on every render
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // SSR compatibility: return initial value if window is undefined (server-side)
            // This prevents hydration mismatches between server and client
            if (typeof window === 'undefined') {
                return initialValue;
            }
            
            // Attempt to read from localStorage using the provided key
            const item = window.localStorage.getItem(key);
            
            // Parse JSON if item exists, otherwise use initial value
            // JSON.parse handles strings, numbers, booleans, objects, arrays
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // Handle cases where localStorage is disabled, JSON is invalid, or quota exceeded
            // This ensures the hook doesn't break the component if localStorage fails
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });
    
    // Create a setter function that updates both state and localStorage
    // Using useCallback to prevent unnecessary re-renders of child components
    const setValue = useCallback((value) => {
        try {
            // Support functional updates like useState: setValue(prev => prev + 1)
            // This maintains consistency with React's useState API
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            // Update React state first to trigger re-render
            setStoredValue(valueToStore);
            
            // Persist to localStorage if available (client-side only)
            // JSON.stringify converts objects/arrays to strings for storage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            // Handle localStorage quota exceeded or other storage errors
            // Component continues to work even if persistence fails
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);
    
    // Listen for storage events from other tabs/windows
    // This enables real-time synchronization across browser tabs
    useEffect(() => {
        // Skip event listener setup on server-side
        if (typeof window === 'undefined') return;
        
        const handleStorageChange = (e) => {
            // Only respond to changes for our specific key
            // e.newValue is null when item is removed, string when updated
            if (e.key === key && e.newValue !== null) {
                try {
                    // Update our state to match the new localStorage value
                    // This keeps all tabs in sync when localStorage changes
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    // Handle invalid JSON from external modifications
                    console.error(`Error parsing localStorage key "${key}":`, error);
                }
            }
        };
        
        // Listen for storage events (fired when localStorage changes in other tabs)
        window.addEventListener('storage', handleStorageChange);
        
        // Cleanup listener to prevent memory leaks
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);
    
    // Utility function to remove the item from localStorage
    // Resets state to initial value and clears persisted data
    const removeValue = useCallback(() => {
        try {
            // Reset React state to initial value
            setStoredValue(initialValue);
            
            // Remove the item from localStorage if available
            // This triggers storage events in other tabs
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            // Handle errors during removal (though these are rare)
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);
    
    // Return tuple similar to useState: [value, setter, remover]
    // This API is familiar to developers and provides clear functionality
    return [storedValue, setValue, removeValue];
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### useDebounce Hook

```javascript
function useDebounce(value, delay, options = {}) {
    // Extract debounce options with sensible defaults
    // leading: execute immediately on first call
    // trailing: execute after delay when calls stop
    // maxWait: maximum time to wait before forcing execution
    const {
        leading = false,
        trailing = true,
        maxWait = null
    } = options;
    
    // State to hold the debounced value that will be returned to components
    // This only updates when the debounce condition is met
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    // Refs to persist values across renders without causing re-renders
    // timeoutRef: tracks the main debounce timeout
    // maxTimeoutRef: tracks the maximum wait timeout
    // lastCallTimeRef: timestamp of the most recent debounce call
    // lastInvokeTimeRef: timestamp of the most recent function execution
    const timeoutRef = useRef(null);
    const maxTimeoutRef = useRef(null);
    const lastCallTimeRef = useRef(0);
    const lastInvokeTimeRef = useRef(0);
    
    // Function to actually update the debounced value
    // Wrapped in useCallback to prevent unnecessary effect runs
    const invokeFunc = useCallback(() => {
        const time = Date.now();
        lastInvokeTimeRef.current = time;
        setDebouncedValue(value); // Update the debounced value with current input
    }, [value]);
    
    // Handle leading edge execution (immediate execution on first call)
    const leadingEdge = useCallback((time) => {
        lastInvokeTimeRef.current = time;
        
        // Set up the trailing edge timeout to potentially execute after delay
        // This ensures trailing execution happens if no more calls come in
        timeoutRef.current = setTimeout(() => {
            // Only execute on trailing edge if enabled and we have pending calls
            if (trailing && lastCallTimeRef.current > lastInvokeTimeRef.current) {
                invokeFunc();
            }
            timeoutRef.current = null; // Clear timeout reference when done
        }, delay);
        
        // Execute immediately on leading edge if enabled
        // This provides instant feedback for the first call
        if (leading) {
            invokeFunc();
        }
    }, [delay, leading, trailing, invokeFunc]);
    
    // Handle trailing edge execution when timer expires
    const trailingEdge = useCallback(() => {
        timeoutRef.current = null; // Clear the timeout reference
        
        // Only execute if trailing is enabled and we have calls newer than last execution
        // This ensures we don't execute unnecessarily when no new calls happened
        if (trailing && lastCallTimeRef.current > lastInvokeTimeRef.current) {
            invokeFunc();
        }
    }, [trailing, invokeFunc]);
    
    // Called when any timeout expires to determine next action
    const timerExpired = useCallback(() => {
        const time = Date.now();
        
        // Check if we should execute based on current timing
        if (shouldInvoke(time)) {
            return trailingEdge(); // Execute on trailing edge
        }
        
        // If not ready to execute, restart the timer with remaining time
        // This handles cases where calls are still coming in
        const remainingWait = remainingDelay(time);
        timeoutRef.current = setTimeout(timerExpired, remainingWait);
    }, [trailingEdge]);
    
    // Determine if the function should be invoked based on timing constraints
    const shouldInvoke = useCallback((time) => {
        const timeSinceLastCall = time - lastCallTimeRef.current;
        const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
        
        return (
            lastCallTimeRef.current === 0 ||               // First call ever
            timeSinceLastCall >= delay ||                   // Enough time has passed since last call
            timeSinceLastCall < 0 ||                        // Clock moved backwards (edge case)
            (maxWait !== null && timeSinceLastInvoke >= maxWait) // Maximum wait time exceeded
        );
    }, [delay, maxWait]);
    
    // Calculate how much longer to wait before next possible execution
    const remainingDelay = useCallback((time) => {
        const timeSinceLastCall = time - lastCallTimeRef.current;
        const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
        const timeWaiting = delay - timeSinceLastCall; // Time left in normal delay
        
        // Return the shorter of normal delay or maxWait constraint
        // This ensures maxWait is respected even if normal delay would be longer
        return maxWait === null
            ? timeWaiting
            : Math.min(timeWaiting, maxWait - timeSinceLastInvoke);
    }, [delay, maxWait]);
    
    // Main effect that runs whenever the input value changes
    // This is where the debouncing logic is coordinated
    useEffect(() => {
        const time = Date.now();
        lastCallTimeRef.current = time; // Record when this call happened
        
        // Check if we should execute immediately based on timing rules
        if (shouldInvoke(time)) {
            // If no timeout is running, start the leading edge flow
            if (timeoutRef.current === null) {
                return leadingEdge(time);
            }
            
            // Handle maxWait constraint if specified
            if (maxWait !== null) {
                // Set up regular timeout for trailing edge
                timeoutRef.current = setTimeout(timerExpired, delay);
                
                // Set up maxWait timeout to force execution if needed
                // This ensures function executes even if calls keep coming
                if (maxTimeoutRef.current === null) {
                    maxTimeoutRef.current = setTimeout(() => {
                        // Clear regular timeout since we're forcing execution
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                            timeoutRef.current = null;
                        }
                        invokeFunc(); // Force execution after maxWait
                        maxTimeoutRef.current = null; // Clear maxWait timeout
                    }, maxWait);
                }
                
                return;
            }
        }
        
        // If no timeout is running, start one for the trailing edge
        // This is the normal debounce behavior for most cases
        if (timeoutRef.current === null) {
            timeoutRef.current = setTimeout(timerExpired, delay);
        }
    }, [value, delay, maxWait, shouldInvoke, leadingEdge, timerExpired, invokeFunc]);
    
    // Cleanup effect to prevent memory leaks and unwanted executions
    // This runs when the component unmounts or dependencies change
    useEffect(() => {
        return () => {
            // Clear main debounce timeout to prevent execution after unmount
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Clear maxWait timeout to prevent forced execution after unmount
            if (maxTimeoutRef.current) {
                clearTimeout(maxTimeoutRef.current);
            }
        };
    }, []);
    
    const flush = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            invokeFunc();
        }
    }, [invokeFunc]);
    
    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
            maxTimeoutRef.current = null;
        }
        lastCallTimeRef.current = 0;
        lastInvokeTimeRef.current = 0;
    }, []);
    
    return [debouncedValue, { flush, cancel }];
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### useFetch Hook

```javascript
function useFetch(url, options = {}) {
    const {
        immediate = true,
        method = 'GET',
        headers = {},
        body = null,
        timeout = 10000,
        retries = 3,
        retryDelay = 1000,
        onSuccess,
        onError
    } = options;
    
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [abortController, setAbortController] = useState(null);
    
    const fetchData = useCallback(async (fetchUrl = url, fetchOptions = {}) => {
        if (!fetchUrl) return;
        
        const controller = new AbortController();
        setAbortController(controller);
        setLoading(true);
        setError(null);
        
        const requestOptions = {
            method,
            headers,
            body,
            signal: controller.signal,
            ...fetchOptions
        };
        
        let attempt = 0;
        
        const tryFetch = async () => {
            try {
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, timeout);
                
                const response = await fetch(fetchUrl, requestOptions);
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                
                setData(result);
                setError(null);
                
                if (onSuccess) {
                    onSuccess(result, response);
                }
                
                return result;
            } catch (err) {
                if (err.name === 'AbortError') {
                    throw err; // Don't retry aborted requests
                }
                
                attempt++;
                
                if (attempt <= retries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
                    return tryFetch();
                } else {
                    setError(err);
                    
                    if (onError) {
                        onError(err);
                    }
                    
                    throw err;
                }
            } finally {
                setLoading(false);
                setAbortController(null);
            }
        };
        
        return tryFetch();
    }, [url, method, headers, body, timeout, retries, retryDelay, onSuccess, onError]);
    
    const abort = useCallback(() => {
        if (abortController) {
            abortController.abort();
        }
    }, [abortController]);
    
    const refetch = useCallback(() => {
        return fetchData();
    }, [fetchData]);
    
    // Execute fetch on mount if immediate is true
    useEffect(() => {
        if (immediate) {
            fetchData();
        }
        
        return () => {
            if (abortController) {
                abortController.abort();
            }
        };
    }, [immediate, fetchData]);
    
    return {
        data,
        error,
        loading,
        refetch,
        abort,
        execute: fetchData
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Utility Hooks

```javascript
// useToggle - Boolean state management
function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);
    
    const toggle = useCallback(() => setValue(prev => !prev), []);
    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    
    return [value, { toggle, setTrue, setFalse, setValue }];
}

// usePrevious - Track previous values
function usePrevious(value) {
    const ref = useRef();
    
    useEffect(() => {
        ref.current = value;
    });
    
    return ref.current;
}

// useAsync - Async operation management
function useAsync(asyncFunction, immediate = true) {
    const [status, setStatus] = useState('idle');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    
    const execute = useCallback(async (...args) => {
        setStatus('pending');
        setData(null);
        setError(null);
        
        try {
            const result = await asyncFunction(...args);
            setData(result);
            setStatus('success');
            return result;
        } catch (error) {
            setError(error);
            setStatus('error');
            throw error;
        }
    }, [asyncFunction]);
    
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);
    
    return {
        execute,
        status,
        data,
        error,
        isIdle: status === 'idle',
        isPending: status === 'pending',
        isSuccess: status === 'success',
        isError: status === 'error'
    };
}

// useInterval - Declarative setInterval
function useInterval(callback, delay) {
    const savedCallback = useRef(callback);
    
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    
    useEffect(() => {
        if (delay === null) return;
        
        const tick = () => savedCallback.current();
        const id = setInterval(tick, delay);
        
        return () => clearInterval(id);
    }, [delay]);
}

// useTimeout - Declarative setTimeout
function useTimeout(callback, delay) {
    const savedCallback = useRef(callback);
    
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    
    useEffect(() => {
        if (delay === null) return;
        
        const tick = () => savedCallback.current();
        const id = setTimeout(tick, delay);
        
        return () => clearTimeout(id);
    }, [delay]);
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Advanced Hook Patterns

### useForm Hook

```javascript
function useForm(initialValues = {}, validationSchema = {}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);
    
    // Validate field
    const validateField = useCallback((name, value) => {
        const validator = validationSchema[name];
        if (!validator) return null;
        
        try {
            validator(value);
            return null;
        } catch (error) {
            return error.message;
        }
    }, [validationSchema]);
    
    // Validate all fields
    const validateAll = useCallback(() => {
        const newErrors = {};
        let hasErrors = false;
        
        Object.keys(validationSchema).forEach(field => {
            const error = validateField(field, values[field]);
            if (error) {
                newErrors[field] = error;
                hasErrors = true;
            }
        });
        
        setErrors(newErrors);
        return !hasErrors;
    }, [values, validateField]);
    
    // Handle field change
    const handleChange = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);
    
    // Handle field blur
    const handleBlur = useCallback((name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        
        const error = validateField(name, values[name]);
        if (error) {
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    }, [validateField, values]);
    
    // Handle form submission
    const handleSubmit = useCallback(async (onSubmit) => {
        setSubmitCount(prev => prev + 1);
        setTouched(
            Object.keys(validationSchema).reduce((acc, field) => {
                acc[field] = true;
                return acc;
            }, {})
        );
        
        if (!validateAll()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            await onSubmit(values);
        } catch (error) {
            console.error('Form submission error:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [values, validateAll, validationSchema]);
    
    // Reset form
    const reset = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
        setSubmitCount(0);
    }, [initialValues]);
    
    // Field helpers
    const getFieldProps = useCallback((name) => ({
        value: values[name] || '',
        onChange: (e) => {
            const value = e.target ? e.target.value : e;
            handleChange(name, value);
        },
        onBlur: () => handleBlur(name),
        error: touched[name] && errors[name],
        'aria-invalid': !!(touched[name] && errors[name]),
        'aria-describedby': errors[name] ? `${name}-error` : undefined
    }), [values, handleChange, handleBlur, touched, errors]);
    
    // Form state
    const formState = useMemo(() => ({
        isValid: Object.keys(errors).length === 0,
        isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
        isSubmitting,
        submitCount,
        touchedFields: Object.keys(touched).length,
        errorCount: Object.keys(errors).length
    }), [values, initialValues, errors, touched, isSubmitting, submitCount]);
    
    return {
        values,
        errors,
        touched,
        ...formState,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        getFieldProps,
        setFieldValue: handleChange,
        setFieldError: useCallback((name, error) => {
            setErrors(prev => ({ ...prev, [name]: error }));
        }, []),
        validateField,
        validateAll
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### useQuery Hook

```javascript
function useQuery(key, queryFn, options = {}) {
    const {
        enabled = true,
        staleTime = 0,
        cacheTime = 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus = true,
        retry = 3,
        retryDelay = 1000,
        onSuccess,
        onError,
        initialData
    } = options;
    
    const [state, dispatch] = useReducer(queryReducer, {
        data: initialData,
        error: null,
        isLoading: false,
        isFetching: false,
        isStale: false,
        lastUpdated: null,
        retryCount: 0
    });
    
    const cache = useRef(new Map());
    const abortController = useRef(null);
    const retryTimeout = useRef(null);
    
    // Query reducer
    function queryReducer(state, action) {
        switch (action.type) {
            case 'FETCH_START':
                return {
                    ...state,
                    isFetching: true,
                    error: state.data ? null : state.error
                };
            
            case 'FETCH_SUCCESS':
                return {
                    ...state,
                    data: action.payload,
                    error: null,
                    isLoading: false,
                    isFetching: false,
                    isStale: false,
                    lastUpdated: Date.now(),
                    retryCount: 0
                };
            
            case 'FETCH_ERROR':
                return {
                    ...state,
                    error: action.payload,
                    isLoading: false,
                    isFetching: false,
                    retryCount: state.retryCount + 1
                };
            
            case 'SET_STALE':
                return {
                    ...state,
                    isStale: true
                };
            
            case 'SET_LOADING':
                return {
                    ...state,
                    isLoading: action.payload
                };
            
            default:
                return state;
        }
    }
    
    // Execute query
    const executeQuery = useCallback(async () => {
        if (!enabled) return;
        
        // Check cache first
        const cacheKey = JSON.stringify(key);
        const cached = cache.current.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < staleTime) {
            dispatch({ type: 'FETCH_SUCCESS', payload: cached.data });
            return;
        }
        
        // Cancel previous request
        if (abortController.current) {
            abortController.current.abort();
        }
        
        abortController.current = new AbortController();
        
        dispatch({ type: 'FETCH_START' });
        
        try {
            const data = await queryFn({
                signal: abortController.current.signal
            });
            
            // Cache the result
            cache.current.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            dispatch({ type: 'FETCH_SUCCESS', payload: data });
            
            if (onSuccess) {
                onSuccess(data);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return; // Request was cancelled
            }
            
            dispatch({ type: 'FETCH_ERROR', payload: error });
            
            // Retry logic
            if (state.retryCount < retry) {
                retryTimeout.current = setTimeout(() => {
                    executeQuery();
                }, retryDelay * Math.pow(2, state.retryCount)); // Exponential backoff
            } else if (onError) {
                onError(error);
            }
        }
    }, [key, queryFn, enabled, staleTime, retry, retryDelay, state.retryCount, onSuccess, onError]);
    
    // Refetch function
    const refetch = useCallback(() => {
        dispatch({ type: 'SET_LOADING', payload: true });
        return executeQuery();
    }, [executeQuery]);
    
    // Invalidate cache
    const invalidate = useCallback(() => {
        const cacheKey = JSON.stringify(key);
        cache.current.delete(cacheKey);
        dispatch({ type: 'SET_STALE' });
    }, [key]);
    
    // Initial fetch and cleanup...
    useEffect(() => {
        if (enabled) {
            dispatch({ type: 'SET_LOADING', payload: true });
            executeQuery();
        }
    }, [executeQuery, enabled]);
    
    return {
        ...state,
        refetch,
        invalidate,
        isInitialLoading: state.isLoading && !state.data,
        isRefetching: state.isFetching && !!state.data
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### useMutation Hook

```javascript
function useMutation(mutationFn, options = {}) {
    const {
        onSuccess,
        onError,
        onSettled
    } = options;
    
    const [state, setState] = useState({
        data: null,
        error: null,
        isLoading: false
    });
    
    const mutate = useCallback(async (variables) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        try {
            const data = await mutationFn(variables);
            
            setState({
                data,
                error: null,
                isLoading: false
            });
            
            if (onSuccess) {
                onSuccess(data, variables);
            }
            
            return data;
        } catch (error) {
            setState(prev => ({
                ...prev,
                error,
                isLoading: false
            }));
            
            if (onError) {
                onError(error, variables);
            }
            
            throw error;
        } finally {
            if (onSettled) {
                onSettled();
            }
        }
    }, [mutationFn, onSuccess, onError, onSettled]);
    
    const reset = useCallback(() => {
        setState({
            data: null,
            error: null,
            isLoading: false
        });
    }, []);
    
    return {
        ...state,
        mutate,
        reset
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Performance Optimization Hooks

### useVirtualScroll Hook

```javascript
function useVirtualScroll(items, itemHeight, containerHeight) {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerElement, setContainerElement] = useState(null);
    
    const visibleItems = useMemo(() => {
        if (!containerElement || !items.length) return [];
        
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
            startIndex + Math.ceil(containerHeight / itemHeight) + 1,
            items.length
        );
        
        return items.slice(startIndex, endIndex).map((item, index) => ({
            ...item,
            index: startIndex + index,
            top: (startIndex + index) * itemHeight
        }));
    }, [items, itemHeight, containerHeight, scrollTop]);
    
    const totalHeight = items.length * itemHeight;
    
    const handleScroll = useCallback((e) => {
        setScrollTop(e.target.scrollTop);
    }, []);
    
    const scrollToIndex = useCallback((index) => {
        if (containerElement) {
            containerElement.scrollTop = index * itemHeight;
        }
    }, [containerElement, itemHeight]);
    
    return {
        containerRef: setContainerElement,
        visibleItems,
        totalHeight,
        handleScroll,
        scrollToIndex
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### useIntersectionObserver Hook

```javascript
function useIntersectionObserver(options = {}) {
    const {
        threshold = 0,
        root = null,
        rootMargin = '0%',
        triggerOnce = false
    } = options;
    
    const [entry, setEntry] = useState(null);
    const [node, setNode] = useState(null);
    
    const observer = useMemo(() => {
        if (typeof IntersectionObserver === 'undefined') return null;
        
        return new IntersectionObserver(
            ([entry]) => {
                setEntry(entry);
                
                if (triggerOnce && entry.isIntersecting) {
                    observer?.disconnect();
                }
            },
            {
                threshold,
                root,
                rootMargin
            }
        );
    }, [threshold, root, rootMargin, triggerOnce]);
    
    useEffect(() => {
        if (!observer || !node) return;
        
        observer.observe(node);
        
        return () => {
            observer.disconnect();
        };
    }, [observer, node]);
    
    return [setNode, entry];
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### useWindowSize Hook

```javascript
function useWindowSize(debounceMs = 100) {
    const [windowSize, setWindowSize] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });
    
    const debouncedSetSize = useMemo(() => {
        let timeoutId;
        
        return () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, debounceMs);
        };
    }, [debounceMs]);
    
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        window.addEventListener('resize', debouncedSetSize);
        
        return () => {
            window.removeEventListener('resize', debouncedSetSize);
        };
    }, [debouncedSetSize]);
    
    return windowSize;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### useMediaQuery Hook

```javascript
function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);
        
        const handler = (event) => {
            setMatches(event.matches);
        };
        
        mediaQuery.addEventListener('change', handler);
        
        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
    }, [query]);
    
    return matches;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
import { renderHook, act } from '@testing-library/react';

describe('Custom Hooks', () => {
    test('useToggle should toggle boolean values', () => {
        const { result } = renderHook(() => useToggle(false));
        
        expect(result.current[0]).toBe(false);
        
        act(() => {
            result.current[1].toggle();
        });
        
        expect(result.current[0]).toBe(true);
        
        act(() => {
            result.current[1].setFalse();
        });
        
        expect(result.current[0]).toBe(false);
    });
    
    test('useLocalStorage should persist values', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        
        expect(result.current[0]).toBe('initial');
        
        act(() => {
            result.current[1]('updated');
        });
        
        expect(result.current[0]).toBe('updated');
        expect(localStorage.getItem('test-key')).toBe('"updated"');
    });
    
    test('useDebounce should debounce values', async () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        );
        
        expect(result.current[0]).toBe('initial');
        
        rerender({ value: 'updated', delay: 500 });
        
        // Value should not change immediately
        expect(result.current[0]).toBe('initial');
        
        // Wait for debounce
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 600));
        });
        
        expect(result.current[0]).toBe('updated');
    });
});
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage & Applications

### Form Management

```javascript
function UserRegistrationForm() {
    const form = useForm(
        { email: '', password: '', confirmPassword: '' },
        {
            email: (value) => {
                if (!value) throw new Error('Email is required');
                if (!/\S+@\S+\.\S+/.test(value)) throw new Error('Email is invalid');
            },
            password: (value) => {
                if (!value) throw new Error('Password is required');
                if (value.length < 8) throw new Error('Password must be at least 8 characters');
            },
            confirmPassword: (value) => {
                if (value !== form.values.password) throw new Error('Passwords do not match');
            }
        }
    );
    
    const handleSubmit = async (values) => {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
        });
        
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        
        console.log('User registered successfully');
    };
    
    return (
        <form onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(handleSubmit);
        }}>
            <div>
                <input
                    {...form.getFieldProps('email')}
                    type="email"
                    placeholder="Email"
                />
                {form.errors.email && (
                    <div id="email-error" role="alert">
                        {form.errors.email}
                    </div>
                )}
            </div>
            
            <button 
                type="submit" 
                disabled={!form.isValid || form.isSubmitting}
            >
                {form.isSubmitting ? 'Registering...' : 'Register'}
            </button>
        </form>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Data Fetching

```javascript
function UserProfile({ userId }) {
    const {
        data: user,
        isLoading,
        error,
        refetch
    } = useQuery(
        ['user', userId],
        ({ signal }) => fetch(`/api/users/${userId}`, { signal }).then(r => r.json()),
        {
            enabled: !!userId,
            staleTime: 30000, // 30 seconds
            onError: (error) => {
                console.error('Failed to fetch user:', error);
            }
        }
    );
    
    const updateUserMutation = useMutation(
        (userData) => fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }).then(r => r.json()),
        {
            onSuccess: () => {
                refetch(); // Refetch user data after update
            }
        }
    );
    
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!user) return null;
    
    return (
        <div>
            <h1>{user.name}</h1>
            <p>{user.email}</p>
            <button
                onClick={() => updateUserMutation.mutate({ name: 'Updated Name' })}
                disabled={updateUserMutation.isLoading}
            >
                {updateUserMutation.isLoading ? 'Updating...' : 'Update Name'}
            </button>
        </div>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Performance Optimization

```javascript
function VirtualizedList({ items }) {
    const containerHeight = 400;
    const itemHeight = 50;
    
    const {
        containerRef,
        visibleItems,
        totalHeight,
        handleScroll,
        scrollToIndex
    } = useVirtualScroll(items, itemHeight, containerHeight);
    
    return (
        <div>
            <button onClick={() => scrollToIndex(100)}>
                Scroll to item 100
            </button>
            
            <div
                ref={containerRef}
                style={{
                    height: containerHeight,
                    overflow: 'auto'
                }}
                onScroll={handleScroll}
            >
                <div style={{ height: totalHeight, position: 'relative' }}>
                    {visibleItems.map(item => (
                        <div
                            key={item.index}
                            style={{
                                position: 'absolute',
                                top: item.top,
                                height: itemHeight,
                                width: '100%'
                            }}
                        >
                            {item.name} - {item.index}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Real-World Examples

```javascript
// Responsive design hook
function useResponsive() {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
    const isDesktop = useMediaQuery('(min-width: 1025px)');
    
    return { isMobile, isTablet, isDesktop };
}

// Auto-save hook for forms
function useAutoSave(data, saveFunction, delay = 2000) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    
    const [debouncedData] = useDebounce(data, delay);
    
    useEffect(() => {
        if (!debouncedData || JSON.stringify(debouncedData) === JSON.stringify({})) return;
        
        setIsSaving(true);
        saveFunction(debouncedData)
            .then(() => {
                setLastSaved(new Date());
            })
            .catch(error => {
                console.error('Auto-save failed:', error);
            })
            .finally(() => {
                setIsSaving(false);
            });
    }, [debouncedData, saveFunction]);
    
    return { isSaving, lastSaved };
}

// Shopping cart hook
function useShoppingCart() {
    const [items, setItems] = useLocalStorage('cart-items', []);
    
    const addItem = useCallback((product) => {
        setItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }, [setItems]);
    
    const removeItem = useCallback((productId) => {
        setItems(prev => prev.filter(item => item.id !== productId));
    }, [setItems]);
    
    const updateQuantity = useCallback((productId, quantity) => {
        if (quantity <= 0) {
            removeItem(productId);
            return;
        }
        
        setItems(prev =>
            prev.map(item =>
                item.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    }, [setItems, removeItem]);
    
    const total = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [items]);
    
    const itemCount = useMemo(() => {
        return items.reduce((count, item) => count + item.quantity, 0);
    }, [items]);
    
    const clearCart = useCallback(() => {
        setItems([]);
    }, [setItems]);
    
    return {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount
    };
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Discussion Points
1. **Hook Rules**: Understanding the rules of hooks and why they exist
2. **Performance**: Using useMemo, useCallback appropriately to prevent unnecessary re-renders
3. **Cleanup**: Proper cleanup of side effects, event listeners, timers
4. **Testing**: How to test custom hooks effectively

### Common Follow-ups
1. **"Optimize this hook for performance"** → Add memoization, reduce re-renders
2. **"Handle error cases"** → Add proper error boundaries and fallbacks
3. **"Make it more flexible"** → Add configuration options, composition patterns
4. **"Add TypeScript"** → Type the hook parameters and return values

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

1. **Reusability**: Custom hooks encapsulate logic that can be shared across components
2. **Separation of Concerns**: Separate business logic from UI components
3. **Performance**: Use optimization hooks appropriately to prevent unnecessary work
4. **Error Handling**: Always include proper error handling and cleanup
5. **Testing**: Custom hooks should be thoroughly tested in isolation

[⬆️ Back to Table of Contents](#table-of-contents) 