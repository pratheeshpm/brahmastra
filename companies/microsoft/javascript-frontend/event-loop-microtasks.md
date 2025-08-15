# Event Loop & Microtasks ⭐

## Table of Contents
- [Problem Statement](#problem-statement)
- [Core Implementation](#core-implementation)
  - [Basic Event Loop Simulation](#basic-event-loop-simulation)
  - [Microtask Queue Implementation](#microtask-queue-implementation)
  - [Task Scheduling](#task-scheduling)
- [Complexity Analysis](#complexity-analysis)
- [Testing](#testing)
- [Usage & Applications](#usage--applications)
  - [Promise Resolution Order](#promise-resolution-order)
  - [DOM Updates and Rendering](#dom-updates-and-rendering)
  - [Performance Optimization](#performance-optimization)
  - [Debugging Async Code](#debugging-async-code)
- [Interview Tips](#interview-tips)
- [Key Takeaways](#key-takeaways)

---

## Problem Statement

Implement and demonstrate understanding of JavaScript's event loop, microtask queue, and task scheduling mechanics.

## Quick Start Example

```javascript
// 1. Basic execution order demonstration
console.log('1: Synchronous');

setTimeout(() => console.log('2: Macrotask (setTimeout)'), 0);

Promise.resolve().then(() => console.log('3: Microtask (Promise)'));

queueMicrotask(() => console.log('4: Microtask (queueMicrotask)'));

console.log('5: Synchronous');

// Output order:
// 1: Synchronous
// 5: Synchronous  
// 3: Microtask (Promise)
// 4: Microtask (queueMicrotask)
// 2: Macrotask (setTimeout)

// 2. Simple event loop simulation
class SimpleEventLoop {
    constructor() {
        this.microtasks = [];
        this.macrotasks = [];
        this.isRunning = false;
    }
    
    queueMicrotask(callback) {
        this.microtasks.push(callback);
        if (!this.isRunning) this.tick();
    }
    
    setTimeout(callback, delay = 0) {
        setTimeout(() => {
            this.macrotasks.push(callback);
            if (!this.isRunning) this.tick();
        }, delay);
    }
    
    tick() {
        this.isRunning = true;
        
        // Process all microtasks first
        while (this.microtasks.length > 0) {
            const microtask = this.microtasks.shift();
            microtask();
        }
        
        // Process one macrotask
        if (this.macrotasks.length > 0) {
            const macrotask = this.macrotasks.shift();
            macrotask();
        }
        
        this.isRunning = false;
        
        // Continue if more tasks exist
        if (this.microtasks.length > 0 || this.macrotasks.length > 0) {
            requestAnimationFrame(() => this.tick());
        }
    }
}

// 3. Real-world async pattern
async function handleUserAction() {
    console.log('User clicked button');
    
    // This runs immediately
    updateUIImmediate();
    
    // This runs after current execution
    queueMicrotask(() => {
        console.log('Microtask: Update analytics');
        trackUserInteraction();
    });
    
    // This runs in next event loop cycle
    setTimeout(() => {
        console.log('Macrotask: Cleanup');
        performCleanup();
    }, 0);
    
    // Await runs in microtask
    try {
        const data = await fetchUserData();
        console.log('Promise resolved');
        updateUIWithData(data);
    } catch (error) {
        handleError(error);
    }
}

// 4. React-style state batching simulation
function batchStateUpdates() {
    let pendingUpdates = [];
    let isFlushPending = false;
    
    function setState(update) {
        pendingUpdates.push(update);
        
        if (!isFlushPending) {
            isFlushPending = true;
            queueMicrotask(() => {
                // Batch all state updates
                const finalState = pendingUpdates.reduce((state, update) => 
                    typeof update === 'function' ? update(state) : { ...state, ...update }
                , {});
                
                pendingUpdates = [];
                isFlushPending = false;
                
                console.log('Batched state update:', finalState);
            });
        }
    }
    
    return setState;
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Core Implementation

### Basic Event Loop Simulation

```javascript
// Simplified event loop simulation
class EventLoopSimulator {
    constructor() {
        // Task queue (macrotasks) - setTimeout, setInterval, I/O, UI events
        this.taskQueue = [];
        
        // Microtask queue - Promise.then, queueMicrotask, MutationObserver
        this.microtaskQueue = [];
        
        // Animation frame queue - requestAnimationFrame
        this.animationQueue = [];
        
        // Current execution context
        this.isRunning = false;
        this.frameId = null;
    }
    
    // Add macrotask (setTimeout, setInterval, etc.)
    addTask(callback, delay = 0) {
        const task = {
            callback,
            delay,
            scheduledAt: Date.now()
        };
        
        if (delay > 0) {
            // Simulate timer delay
            setTimeout(() => {
                this.taskQueue.push(task);
            }, delay);
        } else {
            this.taskQueue.push(task);
        }
    }
    
    // Add microtask (Promise.then, queueMicrotask)
    addMicrotask(callback) {
        this.microtaskQueue.push({
            callback,
            type: 'microtask'
        });
    }
    
    // Add animation frame callback
    addAnimationFrame(callback) {
        this.animationQueue.push({
            callback,
            type: 'animation'
        });
    }
    
    // Process all microtasks before continuing
    processMicrotasks() {
        while (this.microtaskQueue.length > 0) {
            const microtask = this.microtaskQueue.shift();
            try {
                console.log('🔄 Executing microtask');
                microtask.callback();
            } catch (error) {
                console.error('Microtask error:', error);
            }
        }
    }
    
    // Process one macrotask
    processTask() {
        if (this.taskQueue.length > 0) {
            const task = this.taskQueue.shift();
            try {
                console.log('⚙️ Executing macrotask');
                task.callback();
            } catch (error) {
                console.error('Task error:', error);
            }
            return true;
        }
        return false;
    }
    
    // Process animation frames
    processAnimationFrames() {
        const callbacks = [...this.animationQueue];
        this.animationQueue = [];
        
        callbacks.forEach(frame => {
            try {
                console.log('🎬 Executing animation frame');
                frame.callback(performance.now());
            } catch (error) {
                console.error('Animation frame error:', error);
            }
        });
    }
    
    // Main event loop tick
    tick() {
        // 1. Execute one macrotask
        const hasTask = this.processTask();
        
        // 2. Process ALL microtasks
        this.processMicrotasks();
        
        // 3. Process animation frames (if any)
        if (this.animationQueue.length > 0) {
            this.processAnimationFrames();
        }
        
        // 4. Continue loop if there are more tasks
        if (this.taskQueue.length > 0 || this.microtaskQueue.length > 0) {
            this.frameId = requestAnimationFrame(() => this.tick());
        } else {
            this.isRunning = false;
            console.log('✅ Event loop finished');
        }
    }
    
    // Start the event loop
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            console.log('🚀 Starting event loop simulation');
            this.tick();
        }
    }
    
    // Stop the event loop
    stop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        this.isRunning = false;
        console.log('🛑 Event loop stopped');
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Microtask Queue Implementation

```javascript
// Custom microtask queue with priority levels
class MicrotaskQueue {
    constructor() {
        // Different priority levels for microtasks
        this.queues = {
            high: [],    // Critical operations
            normal: [],  // Regular Promise.then
            low: []      // Cleanup operations
        };
        
        this.processing = false;
    }
    
    // Add microtask with priority
    enqueue(callback, priority = 'normal') {
        if (!['high', 'normal', 'low'].includes(priority)) {
            priority = 'normal';
        }
        
        this.queues[priority].push({
            callback,
            priority,
            enqueuedAt: performance.now()
        });
        
        // Auto-process if not already processing
        if (!this.processing) {
            this.process();
        }
    }
    
    // Process all microtasks in priority order
    process() {
        if (this.processing) return;
        
        this.processing = true;
        
        // Use queueMicrotask to ensure proper timing
        queueMicrotask(() => {
            try {
                // Process high priority first
                this.processQueue('high');
                this.processQueue('normal');
                this.processQueue('low');
            } finally {
                this.processing = false;
                
                // Check if new microtasks were added during processing
                if (this.hasWork()) {
                    this.process();
                }
            }
        });
    }
    
    // Process specific priority queue
    processQueue(priority) {
        const queue = this.queues[priority];
        
        while (queue.length > 0) {
            const task = queue.shift();
            try {
                console.log(`🎯 Processing ${priority} priority microtask`);
                task.callback();
            } catch (error) {
                console.error(`Microtask error (${priority}):`, error);
            }
        }
    }
    
    // Check if there's work to do
    hasWork() {
        return Object.values(this.queues).some(queue => queue.length > 0);
    }
    
    // Get queue statistics
    getStats() {
        return {
            high: this.queues.high.length,
            normal: this.queues.normal.length,
            low: this.queues.low.length,
            total: Object.values(this.queues).reduce((sum, q) => sum + q.length, 0)
        };
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Task Scheduling

```javascript
// Advanced task scheduler understanding browser behavior
class TaskScheduler {
    constructor() {
        this.taskId = 0;
        this.scheduledTasks = new Map();
        this.metrics = {
            tasksExecuted: 0,
            microtasksExecuted: 0,
            averageDelay: 0
        };
    }
    
    // Schedule task with different strategies
    scheduleTask(callback, options = {}) {
        const {
            delay = 0,
            priority = 'normal',
            type = 'macro',
            maxRetries = 3
        } = options;
        
        const taskId = ++this.taskId;
        const task = {
            id: taskId,
            callback,
            options,
            createdAt: performance.now(),
            retries: 0
        };
        
        this.scheduledTasks.set(taskId, task);
        
        switch (type) {
            case 'immediate':
                this.scheduleImmediate(task);
                break;
            case 'micro':
                this.scheduleMicrotask(task);
                break;
            case 'animation':
                this.scheduleAnimationFrame(task);
                break;
            case 'idle':
                this.scheduleIdleCallback(task);
                break;
            default:
                this.scheduleMacrotask(task, delay);
        }
        
        return taskId;
    }
    
    // Schedule immediate execution (MessageChannel trick)
    scheduleImmediate(task) {
        const channel = new MessageChannel();
        channel.port2.onmessage = () => {
            this.executeTask(task);
        };
        channel.port1.postMessage(null);
    }
    
    // Schedule microtask
    scheduleMicrotask(task) {
        queueMicrotask(() => {
            this.executeTask(task);
        });
    }
    
    // Schedule macrotask
    scheduleMacrotask(task, delay) {
        setTimeout(() => {
            this.executeTask(task);
        }, delay);
    }
    
    // Schedule animation frame
    scheduleAnimationFrame(task) {
        requestAnimationFrame((timestamp) => {
            this.executeTask(task, timestamp);
        });
    }
    
    // Schedule idle callback
    scheduleIdleCallback(task) {
        if (window.requestIdleCallback) {
            requestIdleCallback((deadline) => {
                this.executeTask(task, deadline);
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => this.executeTask(task), 0);
        }
    }
    
    // Execute task with error handling and metrics
    executeTask(task, extra = null) {
        const startTime = performance.now();
        
        try {
            console.log(`🎯 Executing ${task.options.type} task #${task.id}`);
            
            if (task.options.type === 'animation') {
                task.callback(extra); // timestamp
            } else if (task.options.type === 'idle') {
                task.callback(extra); // deadline
            } else {
                task.callback();
            }
            
            // Update metrics
            const delay = startTime - task.createdAt;
            this.updateMetrics(task.options.type, delay);
            
        } catch (error) {
            console.error(`Task #${task.id} failed:`, error);
            
            // Retry logic
            if (task.retries < task.options.maxRetries) {
                task.retries++;
                console.log(`🔄 Retrying task #${task.id} (attempt ${task.retries})`);
                
                // Exponential backoff
                const retryDelay = Math.pow(2, task.retries) * 100;
                setTimeout(() => this.executeTask(task), retryDelay);
                return;
            }
        } finally {
            this.scheduledTasks.delete(task.id);
        }
    }
    
    // Update execution metrics
    updateMetrics(type, delay) {
        if (type === 'micro') {
            this.metrics.microtasksExecuted++;
        } else {
            this.metrics.tasksExecuted++;
        }
        
        // Calculate rolling average delay
        const total = this.metrics.tasksExecuted + this.metrics.microtasksExecuted;
        this.metrics.averageDelay = (
            (this.metrics.averageDelay * (total - 1) + delay) / total
        );
    }
    
    // Cancel scheduled task
    cancelTask(taskId) {
        return this.scheduledTasks.delete(taskId);
    }
    
    // Get scheduler metrics
    getMetrics() {
        return {
            ...this.metrics,
            pendingTasks: this.scheduledTasks.size
        };
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Complexity Analysis

### Time Complexity
- **Task Queue Operations**: O(1) for enqueue/dequeue
- **Microtask Processing**: O(n) where n is queue length
- **Event Loop Tick**: O(m + n) where m is macrotasks, n is microtasks

### Space Complexity
- **Queue Storage**: O(n) for queued tasks and microtasks
- **Execution Context**: O(1) for current execution

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Testing

```javascript
function testEventLoop() {
    console.log('🧪 Testing Event Loop Understanding\n');
    
    // Test execution order
    console.log('1. Synchronous');
    
    setTimeout(() => console.log('5. Macrotask (setTimeout)'), 0);
    
    Promise.resolve().then(() => console.log('3. Microtask (Promise)'));
    
    queueMicrotask(() => console.log('4. Microtask (queueMicrotask)'));
    
    console.log('2. Synchronous');
    
    // Test with nested tasks
    setTimeout(() => {
        console.log('6. Nested macrotask');
        Promise.resolve().then(() => console.log('7. Nested microtask'));
    }, 0);
    
    Promise.resolve().then(() => {
        console.log('8. Chained microtask');
        queueMicrotask(() => console.log('9. Nested queueMicrotask'));
    });
}

function testComplexExecutionOrder() {
    console.log('\n🔬 Testing Complex Execution Order\n');
    
    console.log('Start');
    
    setTimeout(() => console.log('Timer 1'), 0);
    setTimeout(() => console.log('Timer 2'), 0);
    
    Promise.resolve()
        .then(() => {
            console.log('Promise 1');
            return Promise.resolve();
        })
        .then(() => console.log('Promise 2'));
    
    Promise.resolve().then(() => {
        console.log('Promise 3');
        setTimeout(() => console.log('Timer 3'), 0);
    });
    
    queueMicrotask(() => {
        console.log('Microtask 1');
        queueMicrotask(() => console.log('Microtask 2'));
    });
    
    console.log('End');
}

// Run tests
testEventLoop();
setTimeout(testComplexExecutionOrder, 100);
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Usage & Applications

### Promise Resolution Order

```javascript
// Understanding Promise resolution timing
class PromiseExecutionDemo {
    static demonstrateOrder() {
        console.log('🎭 Promise Execution Order Demo\n');
        
        // Immediate resolution vs delayed resolution
        const immediatePromise = Promise.resolve('immediate');
        const delayedPromise = new Promise(resolve => {
            setTimeout(() => resolve('delayed'), 0);
        });
        
        // Chained promises
        immediatePromise
            .then(value => {
                console.log(`1. ${value} promise resolved`);
                return 'chained';
            })
            .then(value => {
                console.log(`2. ${value} value`);
            });
        
        // Multiple then handlers on same promise
        immediatePromise.then(() => console.log('3. Second handler'));
        immediatePromise.then(() => console.log('4. Third handler'));
        
        // Delayed promise
        delayedPromise.then(value => {
            console.log(`5. ${value} promise resolved`);
        });
        
        // Promise.all timing
        Promise.all([immediatePromise, Promise.resolve('batch')])
            .then(values => {
                console.log('6. Promise.all resolved:', values);
            });
    }
    
    static demonstrateErrorHandling() {
        console.log('\n🚨 Promise Error Handling Demo\n');
        
        Promise.reject('error 1')
            .catch(error => {
                console.log(`Caught: ${error}`);
                return 'recovered';
            })
            .then(value => {
                console.log(`Recovery: ${value}`);
                throw new Error('error 2');
            })
            .catch(error => {
                console.log(`Final catch: ${error.message}`);
            });
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### DOM Updates and Rendering

```javascript
// DOM updates and rendering timing
class DOMRenderingDemo {
    constructor() {
        this.counter = 0;
        this.element = null;
    }
    
    // Demonstrate batched DOM updates
    demonstrateBatching() {
        // Create element for testing
        this.element = document.createElement('div');
        this.element.textContent = '0';
        document.body.appendChild(this.element);
        
        console.log('🎨 DOM Batching Demo');
        
        // These updates will be batched
        this.updateCounter(1);
        this.updateCounter(2);
        this.updateCounter(3);
        
        // Force immediate update
        requestAnimationFrame(() => {
            console.log('Animation frame: DOM updated');
        });
        
        // Async update
        Promise.resolve().then(() => {
            this.updateCounter(4);
            console.log('Microtask: Counter updated to 4');
        });
        
        setTimeout(() => {
            this.updateCounter(5);
            console.log('Macrotask: Counter updated to 5');
        }, 0);
    }
    
    updateCounter(value) {
        this.counter = value;
        this.element.textContent = value;
        console.log(`Updated counter to ${value}`);
    }
    
    // Demonstrate efficient DOM updates
    demonstrateEfficientUpdates() {
        const items = Array.from({length: 1000}, (_, i) => `Item ${i}`);
        const container = document.createElement('div');
        document.body.appendChild(container);
        
        // Inefficient: causes layout thrashing
        const inefficientUpdate = () => {
            items.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item;
                container.appendChild(div); // Each append triggers reflow
            });
        };
        
        // Efficient: batched update
        const efficientUpdate = () => {
            const fragment = document.createDocumentFragment();
            items.forEach(item => {
                const div = document.createElement('div');
                div.textContent = item;
                fragment.appendChild(div);
            });
            container.appendChild(fragment); // Single reflow
        };
        
        // Use requestAnimationFrame for optimal timing
        requestAnimationFrame(() => {
            const start = performance.now();
            efficientUpdate();
            const end = performance.now();
            console.log(`Efficient update took ${end - start}ms`);
        });
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Performance Optimization

```javascript
// Performance optimization using event loop knowledge
class PerformanceOptimizer {
    // Break up heavy work across multiple frames
    static async processLargeDataset(data, processor) {
        const CHUNK_SIZE = 1000;
        const FRAME_BUDGET = 16; // 60fps = 16ms per frame
        
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const start = performance.now();
            const chunk = data.slice(i, i + CHUNK_SIZE);
            
            // Process chunk
            chunk.forEach(processor);
            
            // Check if we're running out of frame budget
            const elapsed = performance.now() - start;
            if (elapsed > FRAME_BUDGET) {
                // Yield to browser
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
    }
    
    // Intelligent task scheduling
    static scheduleWork(callback, priority = 'normal') {
        switch (priority) {
            case 'critical':
                // Use microtask for critical work
                queueMicrotask(callback);
                break;
                
            case 'high':
                // Use MessageChannel for high priority
                const channel = new MessageChannel();
                channel.port2.onmessage = callback;
                channel.port1.postMessage(null);
                break;
                
            case 'normal':
                // Use setTimeout for normal priority
                setTimeout(callback, 0);
                break;
                
            case 'low':
                // Use requestIdleCallback for low priority
                if (window.requestIdleCallback) {
                    requestIdleCallback(callback);
                } else {
                    setTimeout(callback, 100);
                }
                break;
        }
    }
    
    // Debounce using microtasks
    static createMicrotaskDebounce(fn, delay) {
        let timeoutId;
        let pending = false;
        
        return function(...args) {
            clearTimeout(timeoutId);
            
            if (!pending) {
                pending = true;
                queueMicrotask(() => {
                    pending = false;
                });
            }
            
            timeoutId = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

### Debugging Async Code

```javascript
// Tools for debugging async execution order
class AsyncDebugger {
    constructor() {
        this.logs = [];
        this.taskCounter = 0;
    }
    
    // Log with execution context
    log(message, context = 'sync') {
        const entry = {
            id: ++this.taskCounter,
            message,
            context,
            timestamp: performance.now(),
            stack: new Error().stack
        };
        
        this.logs.push(entry);
        console.log(`[${context}] ${message} (${entry.id})`);
    }
    
    // Wrap promises for debugging
    wrapPromise(promise, label) {
        return promise
            .then(result => {
                this.log(`${label} resolved`, 'microtask');
                return result;
            })
            .catch(error => {
                this.log(`${label} rejected: ${error}`, 'microtask');
                throw error;
            });
    }
    
    // Wrap setTimeout for debugging
    wrapTimeout(callback, delay, label) {
        return setTimeout(() => {
            this.log(`${label} timeout fired`, 'macrotask');
            callback();
        }, delay);
    }
    
    // Generate execution report
    generateReport() {
        const report = {
            totalTasks: this.logs.length,
            byContext: this.logs.reduce((acc, log) => {
                acc[log.context] = (acc[log.context] || 0) + 1;
                return acc;
            }, {}),
            timeline: this.logs.map(log => ({
                id: log.id,
                message: log.message,
                context: log.context,
                timestamp: log.timestamp
            }))
        };
        
        console.table(report.timeline);
        return report;
    }
}
```

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Interview Tips

### Discussion Points
1. **Event Loop Phases**: Call stack, task queue, microtask queue, render queue
2. **Priority Order**: Microtasks always execute before next macrotask
3. **Browser Rendering**: When repaints and reflows occur
4. **Performance Impact**: How task scheduling affects user experience

### Common Follow-ups
1. **"Difference between setTimeout and Promise.then"** → Macro vs microtask
2. **"When does browser rendering happen?"** → After microtasks, before next task
3. **"How to avoid blocking the main thread?"** → Task chunking and scheduling
4. **"What is requestAnimationFrame?"** → Optimal timing for visual updates

### Microsoft-Specific Context
1. **Office Online**: Handling heavy document processing without blocking UI
2. **Teams**: Real-time updates and message processing
3. **Performance**: Optimizing for 60fps in complex applications
4. **Accessibility**: Ensuring screen readers work with async updates

[⬆️ Back to Table of Contents](#table-of-contents)

---

## Key Takeaways

1. **Event Loop**: Single-threaded JavaScript with async capabilities
2. **Microtask Priority**: Always execute before next macrotask
3. **Rendering Timing**: Browser renders between tasks, not during
4. **Performance**: Proper task scheduling prevents UI blocking
5. **Debugging**: Understanding execution order helps debug async issues

[⬆️ Back to Table of Contents](#table-of-contents) 