# React/Angular Performance Optimization at Scale

## Question
What techniques can you use to optimize the performance of a React/Angular app at scale?

## Introduction
Optimizing large-scale React/Angular applications requires a comprehensive approach that addresses bundle size, runtime performance, memory management, and user experience. This document explores advanced optimization techniques using modern patterns like the PRPL pattern and Selective Frontend Architecture (SFA) for enterprise-scale applications.

## 1. Modern Architectural Patterns for Performance

### 1.1 PRPL Pattern Implementation

The [PRPL pattern](https://web.dev/articles/apply-instant-loading-with-prpl) provides a structured approach to performance optimization:

**What this implementation does:**
• **PRELOAD Strategy**: Identifies and preloads critical resources (fonts, API calls, CSS) that are essential for initial page rendering
• **RENDER Optimization**: Implements server-side rendering for above-the-fold content and extracts critical CSS for faster initial paint
• **PRE-CACHE Management**: Uses Service Worker to cache assets with intelligent strategies based on resource types and usage patterns
• **LAZY LOAD Implementation**: Uses Intersection Observer API to defer loading of non-critical resources until they're needed

**How it's implemented:**
• **Resource Identification**: Categorizes assets by criticality and loading priority using Lighthouse analysis
• **DOM Manipulation**: Programmatically creates link preload elements with appropriate resource type hints
• **Service Worker Registration**: Implements caching strategies with event listeners for cache updates
• **Intersection Observer**: Monitors element visibility with configurable thresholds and root margins for optimal loading timing

```typescript
// PRPL Pattern Implementation
class PRPLManager {
  // PRELOAD critical resources
  preloadCriticalResources() {
    // Preload critical assets identified by Lighthouse
    const criticalAssets = [
      '/assets/critical-fonts.woff2',
      '/api/user-session',
      '/assets/critical-css.css'
    ];
    
    criticalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset;
      link.as = this.getAssetType(asset);
      document.head.appendChild(link);
    });
  }
  
  // RENDER initial route quickly
  renderInitialRoute() {
    // Server-side rendering for critical above-fold content
    return {
      criticalCSS: this.extractCriticalCSS(),
      initialHTML: this.renderCriticalPath(),
      deferredAssets: this.identifyDeferredAssets()
    };
  }
  
  // PRE-CACHE remaining assets
  preCacheAssets() {
    // Service Worker caching strategy
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        registration.addEventListener('updatefound', () => {
          // Cache strategy for different asset types
          this.implementCacheStrategy();
        });
      });
    }
  }
  
  // LAZY LOAD non-critical resources
  lazyLoadResources() {
    // Intersection Observer for images and components
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadDeferredResource(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { 
      rootMargin: '50px',
      threshold: 0.1 
    });
    
    document.querySelectorAll('[data-lazy]').forEach(el => {
      observer.observe(el);
    });
  }
}
```

### 1.2 Selective Frontend Architecture (SFA) for Scalability

Based on the [Selective Frontend Architecture pattern](https://medium.com/@priyankadaida/introducing-selective-frontend-architecture-sfa-a-modular-and-scalable-approach-to-frontend-5679d978dcd3), implement modular loading:

**What this implementation does:**
• **Module Registry System**: Maintains a centralized registry of available modules with their loading functions
• **Permission-Based Loading**: Validates user permissions before loading modules to prevent unauthorized access
• **Predictive Loading**: Analyzes user behavior patterns to preload likely-to-be-used modules
• **Performance Tracking**: Monitors module loading performance for analytics and optimization

**How it's implemented:**
• **Map-Based Storage**: Uses JavaScript Maps for efficient module storage and retrieval with O(1) lookup time
• **Async Module Loading**: Implements dynamic imports with Promise-based loading and error handling
• **Context Validation**: Checks user permissions against module requirements before loading
• **Idle Callback Optimization**: Uses requestIdleCallback for background preloading without affecting main thread performance

```typescript
// Selective Frontend Architecture Implementation
class SFAModuleLoader {
  private loadedModules = new Map<string, any>();
  private moduleRegistry = new Map<string, () => Promise<any>>();
  
  // Register modules for selective loading
  registerModule(name: string, loader: () => Promise<any>) {
    this.moduleRegistry.set(name, loader);
  }
  
  // Load modules based on user context and permissions
  async loadModule(name: string, context: UserContext): Promise<any> {
    if (this.loadedModules.has(name)) {
      return this.loadedModules.get(name);
    }
    
    // Check if user has permission to access this module
    if (!this.hasPermission(name, context)) {
      return null;
    }
    
    const loader = this.moduleRegistry.get(name);
    if (!loader) {
      throw new Error(`Module ${name} not registered`);
    }
    
    try {
      const module = await loader();
      this.loadedModules.set(name, module);
      
      // Track module loading for analytics
      this.trackModuleLoad(name, context);
      
      return module;
    } catch (error) {
      console.error(`Failed to load module ${name}:`, error);
      throw error;
    }
  }
  
  // Predictive module loading based on user behavior
  async predictiveLoad(userBehavior: UserBehaviorData) {
    const predictions = this.generateLoadPredictions(userBehavior);
    
    predictions.forEach(async (prediction) => {
      if (prediction.confidence > 0.7) {
        // Preload high-confidence modules in background
        requestIdleCallback(() => {
          this.loadModule(prediction.module, prediction.context);
        });
      }
    });
  }
}

// Usage in React component
const BookingModule = React.lazy(() => 
  sfaLoader.loadModule('booking', userContext)
);

function App() {
  return (
    <Suspense fallback={<ModuleLoadingSkeleton />}>
      <BookingModule />
    </Suspense>
  );
}
```

## 2. Advanced Bundle Optimization

### 2.1 Webpack 5 Module Federation for Micro-Frontends

**What this implementation does:**
• **Micro-Frontend Architecture**: Enables independent deployment and loading of separate application modules (search, booking, user)
• **Shared Dependencies**: Manages common libraries (React, design system) to avoid duplication across micro-frontends
• **Remote Module Loading**: Dynamically loads remote applications from different domains at runtime
• **Bundle Optimization**: Implements intelligent code splitting with cache groups for optimal bundle sizes

**How it's implemented:**
• **Module Federation Plugin**: Configures Webpack to expose and consume remote modules with version compatibility
• **Singleton Management**: Ensures only one instance of shared libraries like React to prevent conflicts
• **Cache Groups**: Defines vendor, common, and critical chunk separation with priority-based splitting
• **Remote Entry Points**: Establishes connection points for loading external micro-frontend applications

```javascript
// webpack.config.js - Module Federation Configuration
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  mode: 'production',
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        searchModule: 'searchApp@https://search.agoda.com/remoteEntry.js',
        bookingModule: 'bookingApp@https://booking.agoda.com/remoteEntry.js',
        userModule: 'userApp@https://user.agoda.com/remoteEntry.js',
      },
      shared: {
        react: { 
          singleton: true, 
          requiredVersion: '^18.0.0',
          eager: false 
        },
        'react-dom': { 
          singleton: true, 
          requiredVersion: '^18.0.0' 
        },
        '@agoda/design-system': {
          singleton: true,
          strictVersion: true
        }
      },
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 20
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true
        },
        critical: {
          name: 'critical',
          test: /critical/,
          chunks: 'all',
          priority: 30
        }
      }
    }
  }
};
```

### 2.2 Advanced Tree Shaking and Dead Code Elimination

**What this implementation does:**
• **Side Effect Management**: Marks modules as side-effect-free to enable aggressive tree shaking
• **Unused Code Elimination**: Removes dead code and unused exports from final bundles
• **Import Optimization**: Demonstrates proper import patterns to maximize tree shaking effectiveness
• **Build Tool Configuration**: Optimizes Webpack and Babel for maximum dead code elimination

**How it's implemented:**
• **Package.json Configuration**: Uses sideEffects field to mark files that can be safely tree-shaken
• **Webpack Optimization**: Enables usedExports, concatenateModules, and innerGraph analysis for better optimization
• **Selective Imports**: Uses specific function imports instead of namespace imports to reduce bundle size
• **Babel Plugins**: Configures babel-plugin-import for automatic optimization of library imports

```typescript
// Advanced tree shaking configuration
export class TreeShakingOptimizer {
  // Mark side-effect-free modules
  static configureSideEffects() {
    return {
      // package.json configuration
      sideEffects: [
        "*.css",
        "*.scss",
        "./src/polyfills.ts",
        "./src/analytics/**/*"
      ]
    };
  }
  
  // Webpack optimization for tree shaking
  static getWebpackConfig() {
    return {
      optimization: {
        usedExports: true,
        sideEffects: false,
        innerGraph: true, // Webpack 5 feature
        providedExports: true,
        concatenateModules: true, // Enable module concatenation
        mangleExports: 'size', // Mangle exports for size optimization
      },
      resolve: {
        mainFields: ['es2015', 'module', 'main'], // Prefer ES modules
      }
    };
  }
}

// Selective imports to improve tree shaking
// ❌ Bad - imports entire library
import * as _ from 'lodash';

// ✅ Good - imports specific functions
import { debounce, throttle } from 'lodash-es';

// ✅ Better - use babel plugin for automatic optimization
// babel-plugin-import configuration
{
  "plugins": [
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": "css"
    }]
  ]
}
```

## 3. Runtime Performance Optimization

### 3.1 Advanced React Performance Patterns

**What this implementation does:**
• **Virtual Scrolling**: Renders only visible items in large lists to maintain performance with thousands of items
• **Concurrent Features**: Uses React 18's concurrent features to prioritize urgent updates over non-urgent ones
• **Memory Optimization**: Implements memoization and callback optimization to prevent unnecessary re-renders
• **Event Handler Optimization**: Uses debouncing and throttling to limit expensive operations

**How it's implemented:**
• **React Virtual**: Uses virtualization library to render only visible list items with dynamic sizing
• **Transition API**: Wraps non-urgent updates in startTransition to maintain responsive UI
• **Deferred Values**: Uses useDeferredValue to defer expensive computations until React has time
• **Optimized Callbacks**: Combines useCallback with debounce/throttle utilities for efficient event handling

```typescript
// High-performance React patterns for large applications
import React, { memo, useMemo, useCallback, startTransition, useDeferredValue } from 'react';

// 1. Optimized list rendering with virtualization
const VirtualizedPropertyList = memo(({ 
  properties, 
  onPropertySelect,
  containerHeight = 600 
}: VirtualizedListProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Use React Virtual for large lists
  const virtualizer = useVirtualizer({
    count: properties.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
    // Enable smooth scrolling for better UX
    scrollPaddingStart: 50,
    scrollPaddingEnd: 50,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="virtual-list-container"
      style={{ height: containerHeight, overflow: 'auto' }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualItem) => {
          const property = properties[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <PropertyCard 
                property={property} 
                onSelect={onPropertySelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

// 2. Concurrent features for better user experience
const SearchResults = ({ searchQuery }: { searchQuery: string }) => {
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  // Defer expensive computations
  const deferredQuery = useDeferredValue(searchQuery);
  
  const filteredResults = useMemo(() => {
    if (!deferredQuery) return results;
    
    // Heavy filtering operation deferred
    return results.filter(result => 
      result.name.toLowerCase().includes(deferredQuery.toLowerCase()) ||
      result.location.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [results, deferredQuery]);

  const handleSearch = useCallback((query: string) => {
    startTransition(() => {
      // Non-urgent updates wrapped in transition
      performSearch(query).then(setResults);
    });
  }, []);

  return (
    <div>
      {isPending && <SearchLoadingIndicator />}
      <VirtualizedPropertyList 
        properties={filteredResults}
        onPropertySelect={handlePropertySelect}
      />
    </div>
  );
};

// 3. Optimized event handlers with debouncing
const useOptimizedHandlers = () => {
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      // Batch multiple rapid searches
      const results = await searchAPI.search(query);
      return results;
    }, 300),
    []
  );

  const throttledScroll = useCallback(
    throttle((scrollPosition: number) => {
      // Limit scroll event processing
      updateScrollPosition(scrollPosition);
    }, 16), // 60fps
    []
  );

  return { debouncedSearch, throttledScroll };
};
```

### 3.2 Angular Performance Optimization

**What this implementation does:**
• **Change Detection Optimization**: Uses OnPush strategy to minimize change detection cycles
• **Virtual Scrolling**: Implements CDK virtual scrolling for large datasets
• **Zone.js Optimization**: Runs expensive operations outside Angular zone to prevent unnecessary change detection
• **Observable Patterns**: Uses RxJS operators for efficient data flow and caching

**How it's implemented:**
• **OnPush Strategy**: Configures components to only check for changes when inputs change or events occur
• **CDK Virtual Scroll**: Uses Angular CDK's virtual scrolling with trackBy functions for optimal performance
• **Zone Management**: Uses NgZone.runOutsideAngular for DOM operations that don't need change detection
• **RxJS Operators**: Combines debounceTime, distinctUntilChanged, and shareReplay for optimized data streams

```typescript
// Angular Ivy renderer optimizations
@Component({
  selector: 'app-property-list',
  template: `
    <cdk-virtual-scroll-viewport 
      itemSize="200" 
      class="property-viewport"
      [ngStyle]="{ height: containerHeight + 'px' }">
      
      <div *cdkVirtualFor="let property of properties; 
                          trackBy: trackByPropertyId;
                          templateCacheSize: 0"
           class="property-item">
        <app-property-card 
          [property]="property"
          [loading]="loadingStates[property.id]"
          (select)="onPropertySelect($event)"
          changeDetection="OnPush">
        </app-property-card>
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.OnPush
})
export class PropertyListComponent implements OnInit, OnDestroy {
  @Input() properties: Property[] = [];
  @Input() containerHeight = 600;
  
  // Optimize change detection
  trackByPropertyId = (index: number, property: Property) => property.id;
  
  // Use OnPush strategy with observables
  properties$ = this.propertyService.getProperties().pipe(
    // Debounce rapid updates
    debounceTime(100),
    // Only emit when actually changed
    distinctUntilChanged((prev, curr) => 
      prev.length === curr.length && 
      prev.every((p, i) => p.id === curr[i]?.id)
    ),
    // Share subscription
    shareReplay(1)
  );

  constructor(
    private propertyService: PropertyService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  // Optimize event handling outside Angular zone
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    this.zone.runOutsideAngular(() => {
      // Heavy scroll processing outside Angular
      this.handleScrollOptimized(event);
    });
  }

  // Batch DOM updates
  private handleScrollOptimized = throttle((event: Event) => {
    this.zone.run(() => {
      // Re-enter Angular zone only when necessary
      this.updateScrollPosition(event);
      this.cdr.markForCheck();
    });
  }, 16);

  // Preload strategy for images
  preloadImages() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    }, { rootMargin: '100px' });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }
}

// Advanced Angular service optimization
@Injectable({
  providedIn: 'root'
})
export class OptimizedPropertyService {
  private cache = new Map<string, Observable<Property[]>>();
  private searchSubject = new BehaviorSubject<string>('');
  
  // Intelligent caching with TTL
  getProperties(searchParams: SearchParams): Observable<Property[]> {
    const cacheKey = JSON.stringify(searchParams);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const properties$ = this.http.post<Property[]>('/api/search', searchParams).pipe(
      // Retry with exponential backoff
      retryWhen(errors => 
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) throw error;
            return retryCount + 1;
          }, 0),
          delay(retryCount => Math.pow(2, retryCount) * 1000)
        )
      ),
      // Cache for 5 minutes
      shareReplay({ bufferSize: 1, refCount: false }),
      // Auto-cleanup cache
      finalize(() => {
        setTimeout(() => this.cache.delete(cacheKey), 300000);
      })
    );
    
    this.cache.set(cacheKey, properties$);
    return properties$;
  }
  
  // Batched search with debouncing
  search$ = this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(query => this.performSearch(query)),
    catchError(error => {
      console.error('Search failed:', error);
      return of([]);
    })
  );
}
```

## 4. Memory Management and Optimization

### 4.1 Advanced Memory Leak Prevention

**What this implementation does:**
• **Automatic Cleanup**: Tracks all subscriptions, timers, observers, and event listeners for automatic cleanup
• **Resource Management**: Provides a centralized system to manage all types of resources that need cleanup
• **Memory Leak Prevention**: Ensures no resources are left hanging when components unmount
• **React Hook Integration**: Provides a custom hook that automatically cleans up resources

**How it's implemented:**
• **Set-Based Tracking**: Uses Sets and Maps to efficiently track different types of resources
• **Cleanup Interface**: Provides methods to register resources and automatically clean them up
• **useEffect Integration**: Uses React's useEffect cleanup function to trigger resource cleanup
• **Comprehensive Coverage**: Handles subscriptions, timers, observers, and event listeners in one system

```typescript
// Comprehensive memory management utility
class MemoryManager {
  private subscriptions = new Set<Subscription>();
  private timers = new Set<number>();
  private observers = new Set<IntersectionObserver | MutationObserver>();
  private eventListeners = new Map<EventTarget, Map<string, EventListener>>();
  
  // Automatic cleanup on component unmount
  addSubscription(subscription: Subscription) {
    this.subscriptions.add(subscription);
  }
  
  addTimer(timerId: number) {
    this.timers.add(timerId);
  }
  
  addObserver(observer: IntersectionObserver | MutationObserver) {
    this.observers.add(observer);
  }
  
  addEventListener(target: EventTarget, event: string, listener: EventListener) {
    if (!this.eventListeners.has(target)) {
      this.eventListeners.set(target, new Map());
    }
    this.eventListeners.get(target)!.set(event, listener);
    target.addEventListener(event, listener);
  }
  
  // Clean up all resources
  cleanup() {
    // Unsubscribe from observables
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
    
    // Clear timers
    this.timers.forEach(id => clearTimeout(id));
    this.timers.clear();
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Remove event listeners
    this.eventListeners.forEach((events, target) => {
      events.forEach((listener, event) => {
        target.removeEventListener(event, listener);
      });
    });
    this.eventListeners.clear();
  }
}

// React hook for automatic memory management
function useMemoryManager() {
  const memoryManager = useRef(new MemoryManager());
  
  useEffect(() => {
    return () => {
      memoryManager.current.cleanup();
    };
  }, []);
  
  return memoryManager.current;
}

// Usage in component
function PropertyListComponent() {
  const memoryManager = useMemoryManager();
  
  useEffect(() => {
    const subscription = propertyService.getProperties().subscribe(setProperties);
    memoryManager.addSubscription(subscription);
    
    const timer = setTimeout(() => refreshProperties(), 30000);
    memoryManager.addTimer(timer);
    
    const observer = new IntersectionObserver(handleIntersection);
    memoryManager.addObserver(observer);
  }, [memoryManager]);
  
  // Component automatically cleans up on unmount
}
```

### 4.2 Object Pool Pattern for Heavy Components

**What this implementation does:**
• **Object Reuse**: Maintains a pool of pre-created objects to avoid expensive instantiation
• **Memory Optimization**: Reduces garbage collection pressure by reusing objects instead of creating new ones
• **Performance Improvement**: Eliminates object creation overhead for frequently used components
• **Resource Tracking**: Monitors pool usage and provides statistics for optimization

**How it's implemented:**
• **Pool Management**: Uses arrays to store available objects and Sets to track active objects
• **Factory Pattern**: Uses factory functions to create new objects when pool is empty
• **Reset Mechanism**: Provides reset functions to clean objects before returning them to pool
• **Statistics Tracking**: Monitors pool size, active items, and total objects created

```typescript
// Object pool for expensive components
class ComponentPool<T> {
  private pool: T[] = [];
  private active = new Set<T>();
  private factory: () => T;
  private reset: (item: T) => void;
  
  constructor(
    factory: () => T,
    reset: (item: T) => void,
    initialSize = 5
  ) {
    this.factory = factory;
    this.reset = reset;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }
  
  acquire(): T {
    let item = this.pool.pop();
    
    if (!item) {
      item = this.factory();
    }
    
    this.active.add(item);
    return item;
  }
  
  release(item: T) {
    if (this.active.has(item)) {
      this.active.delete(item);
      this.reset(item);
      this.pool.push(item);
    }
  }
  
  getStats() {
    return {
      poolSize: this.pool.length,
      activeItems: this.active.size,
      totalCreated: this.pool.length + this.active.size
    };
  }
}

// Usage for heavy chart components
const chartPool = new ComponentPool(
  () => new ChartComponent(),
  (chart) => chart.destroy(),
  3
);
```

## 5. Advanced Caching Strategies

### 5.1 Multi-Level Caching Implementation

**What this implementation does:**
• **Hierarchical Caching**: Implements L1 (memory), L2 (IndexedDB), and L3 (Service Worker) cache levels
• **Cache Promotion**: Automatically promotes frequently accessed data to faster cache levels
• **Intelligent Eviction**: Uses access patterns and recency to determine which items to remove when cache is full
• **Persistent Storage**: Provides persistent caching across browser sessions using IndexedDB

**How it's implemented:**
• **Three-Tier Architecture**: Memory cache for speed, IndexedDB for persistence, Service Worker for network resources
• **Fallback Strategy**: Checks faster caches first, falls back to slower ones if data not found
• **TTL Management**: Implements time-to-live for cache entries with automatic expiration
• **LRU Eviction**: Uses least-recently-used algorithm combined with access frequency for optimal cache management

```typescript
// Hierarchical caching system
class MultiLevelCache {
  private memoryCache = new Map<string, CacheEntry>();
  private indexedDB: IDBDatabase | null = null;
  private serviceWorkerCache: Cache | null = null;
  
  async initialize() {
    // Initialize IndexedDB
    this.indexedDB = await this.openIndexedDB();
    
    // Initialize Service Worker cache
    if ('caches' in window) {
      this.serviceWorkerCache = await caches.open('agoda-v1');
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    // L1: Memory cache (fastest)
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult && !this.isExpired(memoryResult)) {
      return memoryResult.data;
    }
    
    // L2: IndexedDB (persistent)
    const idbResult = await this.getFromIndexedDB<T>(key);
    if (idbResult) {
      // Promote to memory cache
      this.memoryCache.set(key, {
        data: idbResult,
        timestamp: Date.now(),
        ttl: 300000 // 5 minutes
      });
      return idbResult;
    }
    
    // L3: Service Worker cache (network resources)
    const swResult = await this.getFromServiceWorker<T>(key);
    if (swResult) {
      return swResult;
    }
    
    return null;
  }
  
  async set<T>(key: string, data: T, options: CacheOptions = {}) {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: options.ttl || 300000
    };
    
    // Store in memory
    this.memoryCache.set(key, entry);
    
    // Store in IndexedDB for persistence
    if (options.persist !== false) {
      await this.setInIndexedDB(key, entry);
    }
    
    // Store in Service Worker cache if it's a network resource
    if (options.isNetworkResource) {
      await this.setInServiceWorker(key, data);
    }
  }
  
  // Intelligent cache eviction
  private evictMemoryCache() {
    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by access frequency and recency
    entries.sort(([, a], [, b]) => {
      const scoreA = a.accessCount / (Date.now() - a.timestamp);
      const scoreB = b.accessCount / (Date.now() - b.timestamp);
      return scoreA - scoreB;
    });
    
    // Remove least valuable entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.memoryCache.delete(entries[i][0]);
    }
  }
}
```

## 6. Performance Monitoring and Optimization

### 6.1 Real-Time Performance Monitoring

**What this implementation does:**
• **Core Web Vitals Tracking**: Monitors FCP, LCP, CLS, and FID in real-time for performance assessment
• **Custom Metrics**: Tracks application-specific performance metrics and user interactions
• **Bundle Analysis**: Analyzes JavaScript bundle performance and identifies optimization opportunities
• **Performance Reporting**: Sends metrics to analytics platforms for monitoring and alerting

**How it's implemented:**
• **PerformanceObserver API**: Uses browser's native performance monitoring to capture timing data
• **Multiple Observers**: Sets up separate observers for different metric types (paint, navigation, resource)
• **Metric Processing**: Processes raw performance entries and calculates meaningful metrics
• **Analytics Integration**: Sends performance data to Google Analytics and stores locally for analysis

```typescript
// Comprehensive performance monitoring
class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric>();
  private observer: PerformanceObserver;
  
  constructor() {
    this.initializeObserver();
    this.monitorVitals();
  }
  
  private initializeObserver() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processPerformanceEntry(entry);
      }
    });
    
    // Observe all performance entry types
    this.observer.observe({ 
      entryTypes: ['measure', 'navigation', 'resource', 'paint', 'largest-contentful-paint'] 
    });
  }
  
  // Monitor Core Web Vitals
  private monitorVitals() {
    // First Contentful Paint
    new PerformanceObserver((list) => {
      const fcp = list.getEntries()[0];
      this.reportMetric('FCP', fcp.startTime);
    }).observe({ entryTypes: ['paint'] });
    
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const lcp = list.getEntries()[list.getEntries().length - 1];
      this.reportMetric('LCP', lcp.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.reportMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
    
    // First Input Delay
    new PerformanceObserver((list) => {
      const fid = list.getEntries()[0];
      this.reportMetric('FID', (fid as any).processingStart - fid.startTime);
    }).observe({ entryTypes: ['first-input'] });
  }
  
  // Custom metric tracking
  startMeasure(name: string) {
    performance.mark(`${name}-start`);
  }
  
  endMeasure(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }
  
  // Bundle analysis
  analyzeBundlePerformance() {
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    
    const bundleAnalysis = {
      totalJSSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      largestBundle: jsResources.reduce((largest, current) => 
        (current.transferSize || 0) > (largest.transferSize || 0) ? current : largest
      ),
      loadTimes: jsResources.map(r => ({
        name: r.name,
        loadTime: r.responseEnd - r.requestStart,
        size: r.transferSize
      }))
    };
    
    return bundleAnalysis;
  }
  
  private reportMetric(name: string, value: number) {
    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        page_path: window.location.pathname
      });
    }
    
    // Store for local analysis
    this.metrics.set(name, {
      value,
      timestamp: Date.now(),
      url: window.location.href
    });
  }
}

// Usage in application
const performanceMonitor = new PerformanceMonitor();

// Track custom operations
performanceMonitor.startMeasure('search-operation');
await performSearch(query);
performanceMonitor.endMeasure('search-operation');
```

## 7. Conclusion

Optimizing React/Angular applications at scale requires a multi-faceted approach combining modern architectural patterns like PRPL and SFA with advanced performance techniques. Key strategies include:

1. **Architectural Optimization**: Implementing PRPL pattern and Selective Frontend Architecture for modular, efficient loading
2. **Bundle Optimization**: Using Module Federation, advanced tree shaking, and intelligent code splitting
3. **Runtime Performance**: Leveraging React 18 concurrent features, Angular Ivy optimizations, and virtual scrolling
4. **Memory Management**: Implementing comprehensive cleanup strategies and object pooling
5. **Caching Strategies**: Multi-level caching with intelligent eviction policies
6. **Performance Monitoring**: Real-time monitoring of Core Web Vitals and custom metrics

The combination of these techniques, informed by modern patterns from the web development community, ensures applications can scale efficiently while maintaining excellent user experience.

## References

- [PRPL Pattern - Web.dev](https://web.dev/articles/apply-instant-loading-with-prpl)
- [Selective Frontend Architecture](https://medium.com/@priyankadaida/introducing-selective-frontend-architecture-sfa-a-modular-and-scalable-approach-to-frontend-5679d978dcd3)
- React 18 Documentation
- Angular Performance Guide
- Web Performance Working Group Specifications