# Frontend System Design - Microsoft Staff Engineer Interview

This folder contains solutions to Frontend System Design questions commonly asked in Microsoft Frontend Staff Engineer interviews.

## Question Categories

### Core Frontend Systems
- [Design a Chat Application UI](./chat-application.md) ⭐
- [Design Email Client Interface](./email-client.md) ⭐
- [Design Notification System](./notification-system.md) ⭐
- [Design Real-time Collaborative Editor](./collaborative-editor.md)
- [Design Video Streaming Platform](./video-streaming.md)
- [Design Social Media Feed](./social-media-feed.md)
- [Design Search Autocomplete](./search-autocomplete.md)

### Microsoft-Specific Systems
- [Design Office 365 Web Interface](./office-365-interface.md)
- [Design Teams Chat Interface](./teams-chat.md)
- [Design SharePoint Document Viewer](./sharepoint-viewer.md)
- [Design Azure Portal Dashboard](./azure-dashboard.md)
- [Design Visual Studio Code Web](./vscode-web.md)

### Advanced Frontend Architecture
- [Design Micro-frontend Architecture](./micro-frontend.md)
- [Design Component Library System](./component-library.md)
- [Design Progressive Web App](./progressive-web-app.md)
- [Design Performance Monitoring Dashboard](./performance-monitoring.md)
- [Design A/B Testing Framework](./ab-testing-framework.md)

### Data-Heavy Applications
- [Design Excel Online](./excel-online.md)
- [Design Data Visualization Platform](./data-visualization.md)
- [Design Analytics Dashboard](./analytics-dashboard.md)
- [Design Financial Trading Platform](./trading-platform.md)

## Key Frontend System Design Principles

### 1. Scalability & Performance
```javascript
// Example: Virtual scrolling for large datasets
class VirtualScroller {
    constructor(container, itemHeight, renderItem) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.renderItem = renderItem;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        this.setupScrolling();
    }
    
    setupScrolling() {
        this.container.addEventListener('scroll', this.onScroll.bind(this));
        this.updateVisibleItems();
    }
    
    onScroll() {
        const scrollTop = this.container.scrollTop;
        const containerHeight = this.container.clientHeight;
        
        this.visibleStart = Math.floor(scrollTop / this.itemHeight);
        this.visibleEnd = Math.min(
            this.visibleStart + Math.ceil(containerHeight / this.itemHeight) + 1,
            this.totalItems
        );
        
        this.updateVisibleItems();
    }
    
    updateVisibleItems() {
        // Only render visible items for performance
        this.renderVisibleItems(this.visibleStart, this.visibleEnd);
    }
}
```

### 2. Real-time Data & State Management
```javascript
// WebSocket connection with reconnection logic
class RealtimeConnection {
    constructor(url, onMessage, onError) {
        this.url = url;
        this.onMessage = onMessage;
        this.onError = onError;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.onMessage(data);
        };
        
        this.ws.onclose = () => {
            this.handleReconnection();
        };
        
        this.ws.onerror = (error) => {
            this.onError(error);
        };
    }
    
    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.pow(2, this.reconnectAttempts) * 1000;
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, delay);
        }
    }
}
```

### 3. Component Architecture & Reusability
```javascript
// Compound component pattern for flexible UI
const Modal = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

Modal.Header = ({ children }) => (
    <div className="modal-header">{children}</div>
);

Modal.Body = ({ children }) => (
    <div className="modal-body">{children}</div>
);

Modal.Footer = ({ children }) => (
    <div className="modal-footer">{children}</div>
);

// Usage
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
    <Modal.Header>
        <h2>Confirmation</h2>
    </Modal.Header>
    <Modal.Body>
        <p>Are you sure you want to delete this item?</p>
    </Modal.Body>
    <Modal.Footer>
        <button onClick={handleConfirm}>Yes</button>
        <button onClick={handleCancel}>No</button>
    </Modal.Footer>
</Modal>
```

### 4. Caching & Data Layer
```javascript
// Multi-level caching strategy
class DataManager {
    constructor() {
        this.memoryCache = new Map();
        this.sessionCache = sessionStorage;
        this.localCache = localStorage;
        this.cacheExpiry = new Map();
    }
    
    async getData(key, fetchFn, options = {}) {
        const { ttl = 300000, useLocal = false, useSession = true } = options;
        
        // Check memory cache first
        if (this.memoryCache.has(key) && !this.isExpired(key)) {
            return this.memoryCache.get(key);
        }
        
        // Check session storage
        if (useSession) {
            const sessionData = this.sessionCache.getItem(key);
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                this.memoryCache.set(key, parsed);
                return parsed;
            }
        }
        
        // Check local storage
        if (useLocal) {
            const localData = this.localCache.getItem(key);
            if (localData) {
                const parsed = JSON.parse(localData);
                this.memoryCache.set(key, parsed);
                if (useSession) {
                    this.sessionCache.setItem(key, localData);
                }
                return parsed;
            }
        }
        
        // Fetch from API
        const data = await fetchFn();
        this.setCache(key, data, ttl, { useLocal, useSession });
        return data;
    }
    
    setCache(key, data, ttl, options) {
        this.memoryCache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + ttl);
        
        if (options.useSession) {
            this.sessionCache.setItem(key, JSON.stringify(data));
        }
        
        if (options.useLocal) {
            this.localCache.setItem(key, JSON.stringify(data));
        }
    }
    
    isExpired(key) {
        const expiry = this.cacheExpiry.get(key);
        return expiry && Date.now() > expiry;
    }
}
```

## Microsoft-Specific Considerations

### 1. Office 365 Integration
```javascript
// Microsoft Graph API integration pattern
class MSGraphClient {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://graph.microsoft.com/v1.0';
    }
    
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            ...options
        };
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`Graph API error: ${response.status}`);
        }
        
        return response.json();
    }
    
    async getUser() {
        return this.makeRequest('/me');
    }
    
    async getEmails(top = 10) {
        return this.makeRequest(`/me/messages?$top=${top}&$orderby=receivedDateTime desc`);
    }
    
    async getCalendarEvents() {
        return this.makeRequest('/me/events');
    }
}
```

### 2. Azure Services Integration
```javascript
// Azure Service Bus integration for real-time messaging
class AzureServiceBusClient {
    constructor(connectionString, queueName) {
        this.connectionString = connectionString;
        this.queueName = queueName;
        this.setupConnection();
    }
    
    setupConnection() {
        // In a real implementation, this would use Azure SDK
        this.connection = new ServiceBusConnection(this.connectionString);
        this.receiver = this.connection.createReceiver(this.queueName);
        this.sender = this.connection.createSender(this.queueName);
    }
    
    async sendMessage(data) {
        const message = {
            body: JSON.stringify(data),
            contentType: 'application/json',
            timeToLive: 60000 // 1 minute TTL
        };
        
        await this.sender.sendMessages(message);
    }
    
    startListening(onMessage) {
        this.receiver.subscribe({
            processMessage: async (message) => {
                const data = JSON.parse(message.body);
                await onMessage(data);
                await message.complete();
            },
            processError: async (args) => {
                console.error('Message processing error:', args.error);
            }
        });
    }
}
```

### 3. Teams Integration
```javascript
// Microsoft Teams SDK integration
class TeamsAppClient {
    constructor() {
        this.isInitialized = false;
        this.initialize();
    }
    
    async initialize() {
        await microsoftTeams.app.initialize();
        this.isInitialized = true;
        
        // Get app context
        this.context = await microsoftTeams.app.getContext();
    }
    
    async getAuthToken() {
        return new Promise((resolve, reject) => {
            microsoftTeams.authentication.getAuthToken({
                successCallback: resolve,
                failureCallback: reject
            });
        });
    }
    
    async showNotification(message, type = 'info') {
        if (!this.isInitialized) await this.initialize();
        
        return microsoftTeams.app.showNotification({
            message,
            notificationType: type
        });
    }
    
    async openTask(url, title) {
        return microsoftTeams.tasks.startTask({
            url,
            title,
            height: 600,
            width: 800
        });
    }
}
```

## System Design Interview Process

### 1. Requirements Gathering (5-10 minutes)
```
Example Questions to Ask:
- What are the core features needed?
- How many users do we expect?
- What devices/browsers need to be supported?
- Are there specific performance requirements?
- Do we need real-time functionality?
- What's the data volume we're dealing with?
- Are there accessibility requirements?
- Integration with existing Microsoft services?
```

### 2. High-Level Architecture (10-15 minutes)
```
Components to Consider:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   API Gateway   │    │   Microservices │
│                 │    │                 │    │                 │
│ React/Angular   │◄──►│  Load Balancer  │◄──►│  User Service   │
│ State Manager   │    │  Rate Limiting  │    │  Chat Service   │
│ Caching Layer   │    │  Authentication │    │  File Service   │
│ WebSocket       │    │  Monitoring     │    │  Notification   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     CDN         │    │    Databases    │    │   External APIs │
│                 │    │                 │    │                 │
│ Static Assets   │    │ PostgreSQL      │    │ Microsoft Graph │
│ Images/Videos   │    │ Redis Cache     │    │ Azure Services  │
│ JS/CSS Bundles  │    │ Elasticsearch   │    │ Third-party APIs│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 3. Component Design (15-20 minutes)
Focus on specific frontend components and their interactions.

### 4. Data Flow & APIs (10-15 minutes)
Design API contracts and data flow patterns.

### 5. Performance & Optimization (10-15 minutes)
Discuss bottlenecks and optimization strategies.

### 6. Monitoring & Analytics (5-10 minutes)
How to track performance and user behavior.

## Common Patterns in Frontend System Design

### 1. Event-Driven Architecture
```javascript
// Custom event system for component communication
class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        };
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

// Usage in components
const eventBus = new EventBus();

// Component A
eventBus.on('user-login', (user) => {
    console.log('User logged in:', user);
    updateUserUI(user);
});

// Component B
eventBus.emit('user-login', { id: 1, name: 'John' });
```

### 2. State Management Pattern
```javascript
// Redux-like state management
class StateManager {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = [];
        this.middleware = [];
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    
    dispatch(action) {
        // Apply middleware
        let finalAction = action;
        for (const middleware of this.middleware) {
            finalAction = middleware(finalAction, this.state);
        }
        
        // Update state
        this.state = this.reducer(this.state, finalAction);
        
        // Notify listeners
        this.listeners.forEach(listener => listener(this.state));
    }
    
    reducer(state, action) {
        switch (action.type) {
            case 'UPDATE_USER':
                return { ...state, user: action.payload };
            case 'SET_LOADING':
                return { ...state, loading: action.payload };
            default:
                return state;
        }
    }
    
    use(middleware) {
        this.middleware.push(middleware);
    }
}

// Logger middleware
const logger = (action, state) => {
    console.log('Action:', action);
    console.log('Previous state:', state);
    return action;
};

const store = new StateManager({ user: null, loading: false });
store.use(logger);
```

### 3. Component Lazy Loading
```javascript
// Dynamic component loading system
class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loading = new Map();
    }
    
    async loadComponent(componentPath) {
        // Check cache first
        if (this.cache.has(componentPath)) {
            return this.cache.get(componentPath);
        }
        
        // Check if already loading
        if (this.loading.has(componentPath)) {
            return this.loading.get(componentPath);
        }
        
        // Start loading
        const loadPromise = this.loadComponentAsync(componentPath);
        this.loading.set(componentPath, loadPromise);
        
        try {
            const component = await loadPromise;
            this.cache.set(componentPath, component);
            this.loading.delete(componentPath);
            return component;
        } catch (error) {
            this.loading.delete(componentPath);
            throw error;
        }
    }
    
    async loadComponentAsync(componentPath) {
        const module = await import(componentPath);
        return module.default || module;
    }
    
    preloadComponent(componentPath) {
        // Preload in background without blocking
        this.loadComponent(componentPath).catch(console.error);
    }
}

// Usage
const loader = new ComponentLoader();

// Lazy load component
const LazyComponent = React.lazy(() => 
    loader.loadComponent('./components/HeavyComponent')
);

// Preload for better UX
loader.preloadComponent('./components/NextPageComponent');
```

## Performance Optimization Strategies

### 1. Bundle Optimization
```javascript
// Webpack configuration for code splitting
module.exports = {
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    }
};
```

### 2. Resource Loading Strategy
```javascript
// Progressive loading with priorities
class ResourceLoader {
    constructor() {
        this.queue = [];
        this.loading = new Set();
        this.loaded = new Set();
        this.maxConcurrent = 3;
    }
    
    loadResource(url, priority = 'normal') {
        return new Promise((resolve, reject) => {
            this.queue.push({ url, priority, resolve, reject });
            this.processQueue();
        });
    }
    
    processQueue() {
        // Sort by priority
        this.queue.sort((a, b) => {
            const priorities = { high: 3, normal: 2, low: 1 };
            return priorities[b.priority] - priorities[a.priority];
        });
        
        // Load resources up to max concurrent limit
        while (this.loading.size < this.maxConcurrent && this.queue.length > 0) {
            const resource = this.queue.shift();
            this.loadSingleResource(resource);
        }
    }
    
    async loadSingleResource({ url, resolve, reject }) {
        if (this.loaded.has(url)) {
            resolve(url);
            return;
        }
        
        this.loading.add(url);
        
        try {
            if (url.endsWith('.js')) {
                await this.loadScript(url);
            } else if (url.endsWith('.css')) {
                await this.loadStylesheet(url);
            } else {
                await this.loadGeneric(url);
            }
            
            this.loaded.add(url);
            resolve(url);
        } catch (error) {
            reject(error);
        } finally {
            this.loading.delete(url);
            this.processQueue(); // Continue with next resources
        }
    }
    
    loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    loadStylesheet(url) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }
}
```

## Interview Tips & Best Practices

### What Interviewers Look For
1. **Systematic Thinking**: Breaking down complex problems
2. **Trade-off Analysis**: Understanding performance vs complexity
3. **Scalability Awareness**: Designing for growth
4. **User Experience Focus**: Considering end-user impact
5. **Technical Depth**: Knowledge of frontend technologies
6. **Communication Skills**: Explaining complex concepts clearly

### Common Follow-up Questions
- "How would you handle 10x more users?"
- "What happens if a microservice goes down?"
- "How would you optimize for mobile devices?"
- "How would you implement real-time updates?"
- "What metrics would you track?"
- "How would you handle internationalization?"

### Microsoft-Specific Questions
- "How would you integrate with Office 365?"
- "How would you handle Teams integration?"
- "What Azure services would you use?"
- "How would you implement SSO with Azure AD?"
- "How would you handle compliance requirements?"

## Key Takeaways

- **Start with Requirements**: Always clarify scope and constraints
- **Think in Components**: Design reusable, modular systems  
- **Consider Performance**: Optimize for real-world usage patterns
- **Plan for Scale**: Design systems that can grow
- **Focus on UX**: Prioritize user experience in technical decisions
- **Leverage Microsoft Ecosystem**: Show knowledge of Microsoft services
- **Communicate Clearly**: Explain your reasoning and trade-offs 