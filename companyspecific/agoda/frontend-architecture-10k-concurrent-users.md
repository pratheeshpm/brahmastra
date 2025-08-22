# Frontend Architecture for 10,000 Concurrent Users

## Question
How would you design the frontend architecture for Agoda's hotel search with 10,000 concurrent users?

## Introduction
Designing a frontend architecture that can handle 10,000 concurrent users requires careful consideration of performance optimization, scalability patterns, efficient resource management, and robust infrastructure. This document outlines a comprehensive approach to building a high-traffic frontend system for hotel booking platforms.

## 1. Understanding the Scale

### Concurrent User Analysis
- **10,000 concurrent users** = users actively using the application at the same time
- **Peak load estimation**: During flash sales or seasonal peaks, this could spike to 15,000-20,000
- **Geographic distribution**: Users spread across multiple time zones and regions
- **Device diversity**: 60% mobile, 30% desktop, 10% tablet users
- **Network conditions**: Varying from high-speed fiber to 3G mobile connections

### Traffic Patterns for Hotel Search
```
┌─────────────────────────────────────────────────────────┐
│                    User Journey                         │
├─────────────────┬─────────────────┬─────────────────────┤
│   Search Flow   │  Browse Results │   Booking Flow     │
│   (High QPS)    │   (Medium QPS)  │   (Low QPS)         │
└─────────────────┴─────────────────┴─────────────────────┘
     │                     │                 │
     ▼                     ▼                 ▼
  5,000 RPS            2,000 RPS         500 RPS
```

### Request Distribution
- **Search requests**: 50% of total traffic (5,000 concurrent searches)
- **Property browsing**: 30% of total traffic (3,000 concurrent browsers)
- **Booking process**: 15% of total traffic (1,500 concurrent bookings)
- **Other actions**: 5% of total traffic (500 concurrent misc. actions)

## 2. Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                       CDN Layer                         │
│              (CloudFlare/AWS CloudFront)                │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Load Balancer                          │
│           (Geographic + Round Robin)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Region    │ │   Region    │ │   Region    │
│   US-East   │ │   EU-West   │ │ Asia-Pacific│
└─────────────┘ └─────────────┘ └─────────────┘
```

### Regional Deployment Strategy
Each region contains:
- **Edge Servers**: Static asset delivery
- **Application Servers**: React/Next.js applications
- **API Gateway**: Request routing and rate limiting
- **Cache Layer**: Redis for session and data caching

## 3. Frontend Architecture Stack

### Technology Stack
```javascript
// Frontend Architecture Stack
const frontendStack = {
  framework: 'Next.js 14',
  stateManagement: 'Generic State Management + Custom Async Layer',
  styling: 'Tailwind CSS + CSS Modules',
  bundler: 'Webpack 5 with Module Federation',
  testing: 'Jest + React Testing Library + Playwright',
  monitoring: 'Sentry + Web Vitals + Custom Analytics',
  deployment: 'Docker + Kubernetes',
  cdn: 'CloudFlare + AWS CloudFront'
};
```

### 3.1 Advanced Performance Architecture Components

#### High-Performance Search Component with Concurrency Management

```typescript
// components/organisms/SearchEngine/HighPerformanceSearch.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce, throttle } from 'lodash';
import { Worker } from 'worker_threads';

interface HighPerformanceSearchProps {
  maxConcurrentRequests: number;
  cacheSize: number;
  virtualScrollThreshold: number;
}

// Web Worker for intensive search operations
class SearchWorkerPool {
  private workers: Worker[] = [];
  private queue: Array<{ data: any; resolve: Function; reject: Function }> = [];
  private activeJobs = 0;
  
  constructor(private maxWorkers: number = 4) {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker('/workers/searchProcessor.js');
      worker.onmessage = (e) => this.handleWorkerMessage(e);
      this.workers.push(worker);
    }
  }

  async processSearch(searchData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data: searchData, resolve, reject });
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.queue.length === 0 || this.activeJobs >= this.maxWorkers) return;

    const job = this.queue.shift();
    if (!job) return;

    const worker = this.workers[this.activeJobs % this.maxWorkers];
    this.activeJobs++;
    
    worker.postMessage({
      id: Date.now(),
      type: 'SEARCH_PROCESS',
      data: job.data,
    });
    
    // Store job reference for completion
    worker.onmessage = (e) => {
      this.activeJobs--;
      job.resolve(e.data.result);
      this.processQueue(); // Process next job
    };
  }

  private handleWorkerMessage(e: MessageEvent) {
    // Handle worker responses and errors
    if (e.data.error) {
      console.error('Worker error:', e.data.error);
    }
  }
}

export const HighPerformanceSearch: React.FC<HighPerformanceSearchProps> = ({
  maxConcurrentRequests = 10,
  cacheSize = 1000,
  virtualScrollThreshold = 50
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUsers, setActiveUsers] = useState(0);
  const [requestQueue, setRequestQueue] = useState<SearchRequest[]>([]);
  
  const parentRef = useRef<HTMLDivElement>(null);
  const workerPool = useRef(new SearchWorkerPool(4));
  const requestLimiter = useRef(new Map<string, number>());
  const performanceMetrics = useRef({
    searchLatency: [],
    renderTime: [],
    memoryUsage: [],
  });

  // Advanced search with intelligent batching and caching
  const {
    data: searchResults,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['search', searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const startTime = performance.now();
      
      // Check if we're hitting rate limits
      if (!canMakeRequest(searchQuery)) {
        throw new Error('Rate limit exceeded');
      }
      
      // Use worker pool for intensive processing
      const result = await workerPool.current.processSearch({
        query: searchQuery,
        page: pageParam,
        limit: 20,
        userId: getUserId(),
        timestamp: Date.now(),
      });
      
      // Track performance metrics
      const endTime = performance.now();
      performanceMetrics.current.searchLatency.push(endTime - startTime);
      
      // Keep only last 100 metrics for memory efficiency
      if (performanceMetrics.current.searchLatency.length > 100) {
        performanceMetrics.current.searchLatency.shift();
      }
      
      return result;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  });

  // Rate limiting function
  const canMakeRequest = useCallback((query: string): boolean => {
    const now = Date.now();
    const windowSize = 60000; // 1 minute window
    const maxRequests = 10; // Max 10 requests per minute per query
    
    const key = `${query}_${Math.floor(now / windowSize)}`;
    const currentCount = requestLimiter.current.get(key) || 0;
    
    if (currentCount >= maxRequests) {
      return false;
    }
    
    requestLimiter.current.set(key, currentCount + 1);
    
    // Clean up old entries
    requestLimiter.current.forEach((count, k) => {
      const timestamp = parseInt(k.split('_')[1]);
      if (now - timestamp > windowSize) {
        requestLimiter.current.delete(k);
      }
    });
    
    return true;
  }, []);

  // Optimized search with intelligent debouncing
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 2) {
        setSearchQuery(query);
      }
    }, 300),
    []
  );

  // Virtualized list for large result sets
  const allResults = useMemo(() => {
    return searchResults?.pages.flatMap(page => page.results) || [];
  }, [searchResults]);

  const virtualizer = useVirtualizer({
    count: allResults.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each search result
    overscan: 10, // Render 10 items outside viewport
  });

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Monitor memory usage
      if (performance.memory) {
        performanceMetrics.current.memoryUsage.push({
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          timestamp: Date.now(),
        });
      }
      
      // Report metrics to analytics
      reportPerformanceMetrics();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const reportPerformanceMetrics = useCallback(() => {
    const metrics = performanceMetrics.current;
    
    if (metrics.searchLatency.length > 0) {
      const avgLatency = metrics.searchLatency.reduce((a, b) => a + b, 0) / metrics.searchLatency.length;
      const p95Latency = metrics.searchLatency.sort((a, b) => a - b)[Math.floor(metrics.searchLatency.length * 0.95)];
      
      // Send to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'search_performance', {
          avg_latency: avgLatency,
          p95_latency: p95Latency,
          active_users: activeUsers,
          memory_usage: metrics.memoryUsage[metrics.memoryUsage.length - 1]?.used || 0,
        });
      }
    }
  }, [activeUsers]);

  // Smart preloading based on user behavior
  const handleResultHover = useCallback(
    throttle((resultId: string) => {
      // Preload property details for hovered results
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'prefetch';
      preloadLink.href = `/api/properties/${resultId}`;
      document.head.appendChild(preloadLink);
      
      // Remove after some time to avoid memory leaks
      setTimeout(() => {
        document.head.removeChild(preloadLink);
      }, 5000);
    }, 1000),
    []
  );

  // Intelligent pagination based on scroll position
  useEffect(() => {
    const handleScroll = throttle(() => {
      if (!parentRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      
      // Load next page when 80% scrolled
      if (scrollPercentage > 0.8 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, 100);

    const element = parentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="high-performance-search">
      {/* Search input with real-time suggestions */}
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search hotels, cities, landmarks..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="search-input"
          autoComplete="off"
        />
        
        {/* Active users indicator */}
        <div className="active-users-indicator">
          <span className="user-count">{activeUsers.toLocaleString()}</span>
          <span className="user-label">active users</span>
        </div>
      </div>

      {/* Search results with virtualization */}
      <div
        ref={parentRef}
        className="search-results-container"
        style={{ height: '600px', overflow: 'auto' }}
      >
        {isLoading && (
          <div className="search-loading">
            <div className="skeleton-loader">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-item" />
              ))}
            </div>
          </div>
        )}

        {allResults.length > 0 && (
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const result = allResults[virtualItem.index];
              
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
                  onMouseEnter={() => handleResultHover(result.id)}
                >
                  <SearchResultCard
                    result={result}
                    onSelect={(property) => {
                      // Track selection
                      window.gtag?.('event', 'property_select', {
                        property_id: property.id,
                        search_position: virtualItem.index + 1,
                        query: searchQuery,
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Load more indicator */}
        {isFetchingNextPage && (
          <div className="loading-more">
            <div className="spinner" />
            Loading more results...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="search-error">
            <p>Something went wrong. Please try again.</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Performance stats (dev mode only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-stats">
          <div>Avg Latency: {
            performanceMetrics.current.searchLatency.length > 0
              ? Math.round(performanceMetrics.current.searchLatency.reduce((a, b) => a + b, 0) / performanceMetrics.current.searchLatency.length)
              : 0
          }ms</div>
          <div>Active Requests: {requestQueue.length}</div>
          <div>Cache Size: {cacheSize}</div>
        </div>
      )}
    </div>
  );
};

// Search Result Card with optimized rendering
const SearchResultCard: React.FC<{ result: SearchResult; onSelect: (property: Property) => void }> = 
  React.memo(({ result, onSelect }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    return (
      <div className="search-result-card" onClick={() => onSelect(result)}>
        <div className="result-image">
          {!imageError ? (
            <img
              src={result.imageUrl}
              alt={result.name}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          ) : (
            <div className="image-placeholder">🏨</div>
          )}
        </div>
        
        <div className="result-content">
          <h3>{result.name}</h3>
          <p>{result.location}</p>
          <div className="result-rating">
            <span>★ {result.rating}</span>
            <span>({result.reviewCount} reviews)</span>
          </div>
          <div className="result-price">
            <span className="currency">{result.currency}</span>
            <span className="amount">{result.price.toLocaleString()}</span>
            <span className="period">per night</span>
          </div>
        </div>
      </div>
    );
  });

SearchResultCard.displayName = 'SearchResultCard';
```

#### Advanced Caching and State Management Architecture

```typescript
// utils/performance/CacheManager.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  maxSize: number;
  defaultTTL: number;
  enablePersistence: boolean;
  compressionThreshold: number;
}

class AdvancedCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private persistenceTimer: NodeJS.Timeout | null = null;
  
  constructor(private options: CacheOptions) {
    this.startCleanupTimer();
    this.loadFromPersistence();
  }

  // Multi-level cache get with intelligent promotion
  async get<T>(key: string): Promise<T | null> {
    let entry = this.cache.get(key);
    
    if (!entry) {
      // Try to load from IndexedDB
      entry = await this.loadFromIndexedDB(key);
      if (entry) {
        this.cache.set(key, entry);
      }
    }
    
    if (!entry || this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access patterns
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    return entry.data;
  }

  // Intelligent cache set with compression and eviction
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const now = Date.now();
    const entryTTL = ttl || this.options.defaultTTL;
    
    // Compress large objects
    let processedData = data;
    if (this.shouldCompress(data)) {
      processedData = await this.compressData(data);
    }
    
    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: now,
      ttl: entryTTL,
      accessCount: 1,
      lastAccessed: now,
    };
    
    // Check if cache is full and evict if necessary
    if (this.cache.size >= this.options.maxSize) {
      this.evictLeastUsed();
    }
    
    this.cache.set(key, entry);
    
    // Persist to IndexedDB for important data
    if (this.options.enablePersistence && this.shouldPersist(key)) {
      await this.saveToIndexedDB(key, entry);
    }
  }

  // Intelligent cache warming based on user patterns
  async warmCache(patterns: string[]): Promise<void> {
    const promises = patterns.map(async (pattern) => {
      const keys = this.getKeysMatchingPattern(pattern);
      
      return Promise.all(
        keys.map(async (key) => {
          if (!this.cache.has(key)) {
            const data = await this.loadFromIndexedDB(key);
            if (data && !this.isExpired(data)) {
              this.cache.set(key, data);
            }
          }
        })
      );
    });
    
    await Promise.all(promises);
  }

  // Predictive preloading based on user behavior
  async predictivePreload(userContext: UserContext): Promise<void> {
    const predictions = await this.generatePredictions(userContext);
    
    const preloadPromises = predictions.map(async (prediction) => {
      const cacheKey = this.generateCacheKey(prediction);
      
      // Only preload if not already cached and high confidence
      if (!this.cache.has(cacheKey) && prediction.confidence > 0.7) {
        try {
          const data = await this.fetchData(prediction);
          await this.set(cacheKey, data, prediction.ttl);
        } catch (error) {
          console.warn('Predictive preload failed:', error);
        }
      }
    });
    
    await Promise.all(preloadPromises);
  }

  // Efficient cache eviction using LFU + LRU hybrid
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedScore = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      // Score = (access frequency) / (time since last access)
      const timeSinceAccess = Date.now() - entry.lastAccessed;
      const score = entry.accessCount / (timeSinceAccess + 1);
      
      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  private shouldCompress(data: any): boolean {
    const size = JSON.stringify(data).length;
    return size > this.options.compressionThreshold;
  }

  private async compressData(data: any): Promise<any> {
    // Use compression library for large objects
    const compressed = await import('lz-string').then(LZString => 
      LZString.compress(JSON.stringify(data))
    );
    return { compressed: true, data: compressed };
  }

  private async decompressData(compressedData: any): Promise<any> {
    if (compressedData.compressed) {
      const decompressed = await import('lz-string').then(LZString =>
        LZString.decompress(compressedData.data)
      );
      return JSON.parse(decompressed);
    }
    return compressedData;
  }

  // Clean up expired entries periodically
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean up every minute
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private async loadFromIndexedDB(key: string): Promise<CacheEntry<any> | null> {
    try {
      const db = await this.getIndexedDB();
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const entry = request.result;
          if (entry && !this.isExpired(entry)) {
            resolve(this.decompressData(entry));
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('IndexedDB load failed:', error);
      return null;
    }
  }

  private async saveToIndexedDB(key: string, entry: CacheEntry<any>): Promise<void> {
    try {
      const db = await this.getIndexedDB();
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      store.put(entry, key);
    } catch (error) {
      console.warn('IndexedDB save failed:', error);
    }
  }

  private async getIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AgodaCache', 1);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
      };
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}
```

### Application Structure
```
frontend/
├── apps/
│   ├── shell/                    # Main shell application
│   ├── search/                   # Search micro-frontend
│   ├── booking/                  # Booking micro-frontend
│   └── profile/                  # User profile micro-frontend
├── packages/
│   ├── ui/                       # Shared UI components
│   ├── utils/                    # Shared utilities
│   ├── api/                      # API layer
│   └── types/                    # TypeScript definitions
├── infrastructure/
│   ├── docker/                   # Container configurations
│   ├── k8s/                      # Kubernetes manifests
│   └── cdn/                      # CDN configurations
└── monitoring/
    ├── performance/              # Performance monitoring
    └── analytics/                # User analytics
```

## 4. Performance Optimization Strategies

### 4.1 Code Splitting and Lazy Loading

#### Route-Based Code Splitting
```javascript
// Next.js route-based code splitting
const SearchPage = dynamic(() => import('../pages/SearchPage'), {
  loading: () => <SearchPageSkeleton />,
  ssr: true
});

const BookingPage = dynamic(() => import('../pages/BookingPage'), {
  loading: () => <BookingPageSkeleton />,
  ssr: false // Client-side only for sensitive data
});

const PropertyPage = dynamic(() => import('../pages/PropertyPage'), {
  loading: () => <PropertyPageSkeleton />,
  ssr: true
});
```

#### Component-Level Code Splitting
```javascript
// Lazy load heavy components
const MapComponent = lazy(() => 
  import('../components/Map').then(module => ({
    default: module.InteractiveMap
  }))
);

const ImageGallery = lazy(() => 
  import('../components/ImageGallery').then(module => ({
    default: module.LazyImageGallery
  }))
);

// Usage with Suspense
const PropertyDetails = () => (
  <div className="property-details">
    <PropertyInfo />
    <Suspense fallback={<MapSkeleton />}>
      <MapComponent />
    </Suspense>
    <Suspense fallback={<GallerySkeleton />}>
      <ImageGallery />
    </Suspense>
  </div>
);
```

### 4.2 Advanced Caching Strategy

#### Multi-Layer Caching
```javascript
// Service Worker for aggressive caching
class CacheStrategy {
  constructor() {
    this.strategies = {
      static: 'cache-first',      // JS, CSS, Images
      api: 'stale-while-revalidate', // API responses
      search: 'network-first',    // Fresh search results
      user: 'network-only'        // User-specific data
    };
  }

  async handleRequest(request) {
    const url = new URL(request.url);
    const strategy = this.getStrategy(url);
    
    switch (strategy) {
      case 'cache-first':
        return this.cacheFirst(request);
      case 'stale-while-revalidate':
        return this.staleWhileRevalidate(request);
      case 'network-first':
        return this.networkFirst(request);
      default:
        return fetch(request);
    }
  }

  async staleWhileRevalidate(request) {
    const cache = await caches.open('api-cache');
    const cachedResponse = await cache.match(request);
    
    // Return cached version immediately if available
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then(response => {
        cache.put(request, response.clone());
      });
      return cachedResponse;
    }
    
    // If not in cache, fetch and cache
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  }
}
```

#### React Query Configuration for High Traffic
```javascript
// Optimized React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      cacheTime: 30 * 60 * 1000,    // 30 minutes
      retry: (failureCount, error) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Search-specific optimizations
const useSearchResults = (searchParams) => {
  return useQuery({
    queryKey: ['search', searchParams],
    queryFn: () => searchAPI.searchHotels(searchParams),
    staleTime: 2 * 60 * 1000,      // 2 minutes for search results
    cacheTime: 10 * 60 * 1000,     // 10 minutes cache time
    keepPreviousData: true,         // Show previous results while loading
    placeholderData: keepPreviousData,
  });
};
```

### 4.3 Image Optimization

#### Responsive Image Loading
```javascript
// Advanced image component with optimization
const OptimizedImage = ({ 
  src, 
  alt, 
  priority = false,
  sizes = "100vw",
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef();

  // Intersection Observer for lazy loading
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    skip: priority
  });

  const shouldLoad = priority || inView;

  return (
    <div ref={ref} className="image-container">
      {shouldLoad && (
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          sizes={sizes}
          quality={85}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`image ${loaded ? 'loaded' : 'loading'}`}
          {...props}
        />
      )}
      {!loaded && !error && <ImageSkeleton />}
      {error && <ImagePlaceholder />}
    </div>
  );
};

// Usage with different priorities
const PropertyCard = ({ property }) => (
  <div className="property-card">
    <OptimizedImage
      src={property.mainImage}
      alt={property.name}
      priority={property.featured}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>
);
```

#### CDN Image Optimization
```javascript
// Image URL transformer for CDN optimization
class ImageOptimizer {
  constructor(cdnBaseUrl) {
    this.cdnBaseUrl = cdnBaseUrl;
  }

  optimize(originalUrl, options = {}) {
    const {
      width,
      height,
      quality = 85,
      format = 'webp',
      fit = 'cover'
    } = options;

    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    params.append('q', quality);
    params.append('f', format);
    params.append('fit', fit);

    return `${this.cdnBaseUrl}/${originalUrl}?${params.toString()}`;
  }

  // Generate responsive image sources
  generateSrcSet(originalUrl, sizes) {
    return sizes.map(size => 
      `${this.optimize(originalUrl, { width: size })} ${size}w`
    ).join(', ');
  }
}

// Usage
const imageOptimizer = new ImageOptimizer('https://images.agoda.com');

const ResponsiveImage = ({ src, alt }) => {
  const sizes = [400, 800, 1200, 1600];
  const srcSet = imageOptimizer.generateSrcSet(src, sizes);
  
  return (
    <img
      src={imageOptimizer.optimize(src, { width: 800 })}
      srcSet={srcSet}
      sizes="(max-width: 768px) 100vw, 50vw"
      alt={alt}
      loading="lazy"
    />
  );
};
```

## 5. State Management for High Concurrency

### Generic State Architecture for High Concurrency

```typescript
// Generic high-performance state manager for large-scale applications
interface HighConcurrencyStateConfig {
  maxCacheSize: number;
  performanceThreshold: number;
  enableDevtools: boolean;
  enableSerialization: boolean;
}

class HighConcurrencyStateManager {
  private stateManagers = new Map<string, StateManager<any>>();
  private performanceMonitor = new PerformanceMonitor();
  private config: HighConcurrencyStateConfig;

  constructor(config: HighConcurrencyStateConfig) {
    this.config = config;
    this.initializePerformanceMonitoring();
  }

  // Register domain-specific state managers
  registerStateManager<T>(domain: string, stateManager: StateManager<T>): void {
    // Add performance monitoring middleware
    stateManager.addMiddleware((action, state) => {
      return this.performanceMonitor.wrapAction(action, state);
    });

    this.stateManagers.set(domain, stateManager);
  }

  // Get state manager for specific domain
  getStateManager<T>(domain: string): StateManager<T> | null {
    return this.stateManagers.get(domain) || null;
  }

  // Global state subscription for cross-domain communication
  subscribeToAllDomains(callback: (domain: string, state: any) => void): () => void {
    const unsubscribers = Array.from(this.stateManagers.entries()).map(
      ([domain, manager]) => {
        return manager.subscribe((state) => callback(domain, state));
      }
    );

    return () => unsubscribers.forEach(unsub => unsub());
  }

  private initializePerformanceMonitoring(): void {
    this.performanceMonitor.setThreshold(this.config.performanceThreshold);
    
    if (this.config.enableDevtools && typeof window !== 'undefined') {
      // Enable devtools integration
      (window as any).__HIGH_CONCURRENCY_STATE__ = this;
    }
  }
}

// Performance monitoring utility
class PerformanceMonitor {
  private threshold = 16; // 1 frame at 60fps
  private metrics: Map<string, number[]> = new Map();

  setThreshold(ms: number): void {
    this.threshold = ms;
  }

  wrapAction<T>(action: Action, state: T): T {
    const start = performance.now();
    
    // Process action (this would be implemented by each state manager)
    const newState = state; // Placeholder - actual implementation would apply the action
    
    const end = performance.now();
    const duration = end - start;
    
    // Track performance metrics
    this.trackMetric(action.type, duration);
    
    if (duration > this.threshold) {
      console.warn(`Slow action: ${action.type} took ${duration}ms`);
      
      // Send to analytics for production monitoring
      this.reportSlowAction(action.type, duration);
    }
    
    return newState;
  }

  private trackMetric(actionType: string, duration: number): void {
    if (!this.metrics.has(actionType)) {
      this.metrics.set(actionType, []);
    }
    
    const metrics = this.metrics.get(actionType)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  private reportSlowAction(actionType: string, duration: number): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'slow_state_action', {
        action_type: actionType,
        duration_ms: duration,
        threshold_ms: this.threshold,
      });
    }
  }

  getMetrics(): Record<string, { avg: number; p95: number; p99: number }> {
    const result: Record<string, { avg: number; p95: number; p99: number }> = {};
    
    for (const [actionType, durations] of this.metrics.entries()) {
      if (durations.length === 0) continue;
      
      const sorted = [...durations].sort((a, b) => a - b);
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];
      
      result[actionType] = { avg, p95, p99 };
    }
    
    return result;
  }
}

// Optimized data normalization utility
class DataNormalizer {
  private entityMap = new Map<string, Map<string, any>>();

  // Normalize entity collections by ID
  normalize<T extends { id: string }>(
    entityType: string,
    entities: T[]
  ): { entities: Record<string, T>; ids: string[] } {
    const normalized: Record<string, T> = {};
    const ids: string[] = [];

    if (!this.entityMap.has(entityType)) {
      this.entityMap.set(entityType, new Map());
    }

    const entityCache = this.entityMap.get(entityType)!;

    entities.forEach(entity => {
      normalized[entity.id] = entity;
      ids.push(entity.id);
      
      // Cache for future lookups
      entityCache.set(entity.id, entity);
    });

    return { entities: normalized, ids };
  }

  // Denormalize entities by IDs
  denormalize<T>(entityType: string, ids: string[]): T[] {
    const entityCache = this.entityMap.get(entityType);
    if (!entityCache) return [];

    return ids
      .map(id => entityCache.get(id))
      .filter(Boolean) as T[];
  }

  // Optimized search state with normalization
  createSearchStateManager(): SearchStateManager {
    return new SearchStateManager();
  }
}

// High-performance search state manager with normalization
class OptimizedSearchStateManager extends StateManager<OptimizedSearchState> {
  private normalizer = new DataNormalizer();

  constructor() {
    super({
      queries: {},           // Normalized by query hash
      entities: {},          // Normalized by property ID
      pagination: {},        // Pagination state by query
      filters: {},           // Active filters
      loading: {},           // Loading states by query
      errors: {},            // Error states by query
      metadata: {},          // Additional metadata by query
    });
  }

  protected reducer(state: OptimizedSearchState, action: Action): OptimizedSearchState {
    switch (action.type) {
      case 'SEARCH_START': {
        const { queryHash } = action.payload;
        return {
          ...state,
          loading: { ...state.loading, [queryHash]: true },
          errors: { ...state.errors, [queryHash]: null },
        };
      }

      case 'SEARCH_SUCCESS': {
        const { queryHash, results, pagination } = action.payload;
        
        // Normalize the results for efficient access
        const { entities, ids } = this.normalizer.normalize('properties', results);
        
        return {
          ...state,
          entities: { ...state.entities, ...entities },
          queries: {
            ...state.queries,
            [queryHash]: {
              resultIds: ids,
              timestamp: Date.now(),
            },
          },
          pagination: { ...state.pagination, [queryHash]: pagination },
          loading: { ...state.loading, [queryHash]: false },
        };
      }

      case 'SEARCH_ERROR': {
        const { queryHash, error } = action.payload;
        return {
          ...state,
          loading: { ...state.loading, [queryHash]: false },
          errors: { ...state.errors, [queryHash]: error },
        };
      }

      case 'UPDATE_ENTITY': {
        const { entityId, updates } = action.payload;
        const existingEntity = state.entities[entityId];
        
        if (existingEntity) {
          return {
            ...state,
            entities: {
              ...state.entities,
              [entityId]: { ...existingEntity, ...updates },
            },
          };
        }
        
        return state;
      }

      default:
        return state;
    }
  }

  // Selector for getting denormalized results by query
  getResultsByQuery(queryHash: string): Property[] {
    const state = this.getState();
    const query = state.queries[queryHash];
    
    if (!query) return [];
    
    return this.normalizer.denormalize('properties', query.resultIds);
  }

  // Optimized property lookup
  getProperty(propertyId: string): Property | null {
    return this.getState().entities[propertyId] || null;
  }
}

interface OptimizedSearchState {
  queries: Record<string, { resultIds: string[]; timestamp: number }>;
  entities: Record<string, Property>;
  pagination: Record<string, PaginationState>;
  filters: Record<string, SearchFilters>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  metadata: Record<string, any>;
}
```

## 6. Real-time Features Implementation

### WebSocket Management for High Concurrency
```javascript
// WebSocket connection manager
class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect(endpoint, options = {}) {
    const connectionId = this.generateConnectionId(endpoint);
    
    if (this.connections.has(connectionId)) {
      return this.connections.get(connectionId);
    }

    const ws = new WebSocket(endpoint);
    const connection = {
      ws,
      id: connectionId,
      status: 'connecting',
      subscribers: new Set(),
    };

    ws.onopen = () => {
      connection.status = 'connected';
      this.reconnectAttempts.set(connectionId, 0);
      this.notifySubscribers(connectionId, 'connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifySubscribers(connectionId, 'message', data);
    };

    ws.onclose = () => {
      connection.status = 'disconnected';
      this.handleReconnect(connectionId, endpoint, options);
    };

    this.connections.set(connectionId, connection);
    return connection;
  }

  handleReconnect(connectionId, endpoint, options) {
    const attempts = this.reconnectAttempts.get(connectionId) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts.set(connectionId, attempts + 1);
        this.connect(endpoint, options);
      }, this.reconnectDelay * Math.pow(2, attempts));
    }
  }

  subscribe(connectionId, callback) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.subscribers.add(callback);
    }
  }
}

// Real-time price updates
const usePriceUpdates = (propertyIds) => {
  const [prices, setPrices] = useState({});
  const wsManager = useRef(new WebSocketManager());

  useEffect(() => {
    const connection = wsManager.current.connect(
      `${WS_BASE_URL}/price-updates`
    );

    const handlePriceUpdate = (type, data) => {
      if (type === 'message' && data.type === 'PRICE_UPDATE') {
        setPrices(prev => ({
          ...prev,
          [data.propertyId]: data.price
        }));
      }
    };

    wsManager.current.subscribe(connection.id, handlePriceUpdate);

    // Subscribe to specific properties
    if (connection.status === 'connected') {
      connection.ws.send(JSON.stringify({
        type: 'SUBSCRIBE',
        propertyIds: propertyIds
      }));
    }

    return () => {
      connection.ws.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        propertyIds: propertyIds
      }));
    };
  }, [propertyIds]);

  return prices;
};
```

## 7. Infrastructure and Deployment

### Container Orchestration
```yaml
# kubernetes/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agoda-frontend
  labels:
    app: agoda-frontend
spec:
  replicas: 15  # Handle 10k users across multiple pods
  selector:
    matchLabels:
      app: agoda-frontend
  template:
    metadata:
      labels:
        app: agoda-frontend
    spec:
      containers:
      - name: frontend
        image: agoda/frontend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: agoda-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

### Horizontal Pod Autoscaler
```yaml
# kubernetes/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: frontend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agoda-frontend
  minReplicas: 10
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

## 8. Monitoring and Observability

### Performance Monitoring
```javascript
// Performance monitoring service
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = {
      navigation: null,
      paint: null,
      layout: null,
    };
    
    this.initializeObservers();
  }

  initializeObservers() {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      this.observers.navigation = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('navigation', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
      this.observers.navigation.observe({ entryTypes: ['navigation'] });

      // Core Web Vitals
      this.observers.paint = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('fcp', { value: entry.startTime });
          }
          if (entry.name === 'largest-contentful-paint') {
            this.recordMetric('lcp', { value: entry.startTime });
          }
        }
      });
      this.observers.paint.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

      // Layout shift
      this.observers.layout = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.recordMetric('cls', { value: clsValue });
      });
      this.observers.layout.observe({ entryTypes: ['layout-shift'] });
    }
  }

  recordMetric(name, data) {
    const timestamp = Date.now();
    this.metrics.set(`${name}_${timestamp}`, {
      name,
      timestamp,
      ...data,
    });

    // Send to analytics service
    this.sendToAnalytics(name, data);
  }

  async sendToAnalytics(name, data) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          data,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.warn('Failed to send analytics:', error);
    }
  }

  // React hook for component-level monitoring
  measureComponent(componentName) {
    return (WrappedComponent) => {
      return function MeasuredComponent(props) {
        const renderStart = useRef();
        
        useLayoutEffect(() => {
          renderStart.current = performance.now();
        });

        useEffect(() => {
          const renderEnd = performance.now();
          const renderTime = renderEnd - renderStart.current;
          
          this.recordMetric('component_render', {
            component: componentName,
            duration: renderTime,
          });
        });

        return <WrappedComponent {...props} />;
      };
    };
  }
}

// Usage
const performanceMonitor = new PerformanceMonitor();

// Wrap components for monitoring
const MonitoredSearchResults = performanceMonitor.measureComponent('SearchResults')(SearchResults);
```

### Error Tracking and Alerting
```javascript
// Error boundary with detailed reporting
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send to error tracking service
    this.reportError(error, errorInfo);
  }

  reportError(error, errorInfo) {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      props: this.props,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      userId: this.props.userId,
    };

    // Send to multiple services for redundancy
    Promise.allSettled([
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport),
      }),
      // Send to external service (Sentry, etc.)
      window.Sentry?.captureException(error, {
        extra: errorInfo,
        tags: { component: this.props.componentName },
      }),
    ]);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
```

## 9. Security Considerations

### Rate Limiting and DDoS Protection
```javascript
// Client-side rate limiting
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old requests
    for (const [key, timestamp] of this.requests) {
      if (timestamp < windowStart) {
        this.requests.delete(key);
      }
    }

    // Count requests in current window
    const requestsInWindow = Array.from(this.requests.values())
      .filter(timestamp => timestamp >= windowStart).length;

    if (requestsInWindow >= this.maxRequests) {
      return false;
    }

    this.requests.set(`${identifier}_${now}`, now);
    return true;
  }
}

// API service with rate limiting
class APIService {
  constructor() {
    this.rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute
    this.requestQueue = [];
    this.processing = false;
  }

  async request(url, options = {}) {
    const identifier = this.getIdentifier();
    
    if (!this.rateLimiter.isAllowed(identifier)) {
      throw new Error('Rate limit exceeded');
    }

    return new Promise((resolve, reject) => {
      this.requestQueue.push({ url, options, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const { url, options, resolve, reject } = this.requestQueue.shift();
      
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    this.processing = false;
  }

  getIdentifier() {
    return sessionStorage.getItem('session-id') || 'anonymous';
  }
}
```

## 10. Testing Strategy for High Traffic

### Load Testing Setup
```javascript
// Performance testing utilities
class LoadTestHelper {
  constructor() {
    this.metrics = {
      responseTime: [],
      errorRate: 0,
      throughput: 0,
      memoryUsage: [],
    };
  }

  async simulateUserJourney(userCount = 100) {
    const promises = Array.from({ length: userCount }, (_, index) =>
      this.simulateUser(index)
    );

    const results = await Promise.allSettled(promises);
    return this.analyzeResults(results);
  }

  async simulateUser(userId) {
    const startTime = performance.now();
    
    try {
      // Simulate search
      await this.performSearch({
        destination: 'Bangkok',
        checkIn: '2024-03-01',
        checkOut: '2024-03-03',
      });

      // Simulate browsing
      await this.browseResults(5); // Browse 5 properties

      // Simulate booking (10% conversion)
      if (Math.random() < 0.1) {
        await this.initiateBooking();
      }

      const endTime = performance.now();
      return {
        userId,
        duration: endTime - startTime,
        success: true,
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        userId,
        duration: endTime - startTime,
        success: false,
        error: error.message,
      };
    }
  }

  async performSearch(params) {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    return response.json();
  }

  analyzeResults(results) {
    const successful = results.filter(r => r.value?.success).length;
    const failed = results.length - successful;
    
    const responseTimes = results
      .filter(r => r.value?.success)
      .map(r => r.value.duration);

    return {
      totalRequests: results.length,
      successfulRequests: successful,
      failedRequests: failed,
      successRate: (successful / results.length) * 100,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      p95ResponseTime: this.percentile(responseTimes, 95),
      p99ResponseTime: this.percentile(responseTimes, 99),
    };
  }

  percentile(arr, p) {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
}
```

### Automated Performance Testing
```javascript
// Jest performance test
describe('Performance under load', () => {
  let loadTestHelper;

  beforeEach(() => {
    loadTestHelper = new LoadTestHelper();
  });

  test('handles 1000 concurrent users', async () => {
    const results = await loadTestHelper.simulateUserJourney(1000);
    
    expect(results.successRate).toBeGreaterThan(95);
    expect(results.averageResponseTime).toBeLessThan(2000);
    expect(results.p99ResponseTime).toBeLessThan(5000);
  }, 60000); // 60 second timeout

  test('search response time under load', async () => {
    const searchPromises = Array.from({ length: 100 }, () =>
      loadTestHelper.performSearch({
        destination: 'Bangkok',
        checkIn: '2024-03-01',
        checkOut: '2024-03-03',
      })
    );

    const startTime = performance.now();
    const results = await Promise.allSettled(searchPromises);
    const endTime = performance.now();

    const successfulResults = results.filter(r => r.status === 'fulfilled');
    const averageTime = (endTime - startTime) / searchPromises.length;

    expect(successfulResults.length).toBeGreaterThan(95);
    expect(averageTime).toBeLessThan(500); // 500ms average
  });
});
```

## 11. Crisis Management and Fallback Strategies

### Circuit Breaker Pattern
```javascript
// Circuit breaker for API calls
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttempt = Date.now();
  }

  async call(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      } else {
        this.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.recoveryTimeout;
    }
  }
}

// Usage with fallback strategies
class SearchService {
  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      recoveryTimeout: 30000,
    });
    this.fallbackCache = new Map();
  }

  async search(params) {
    try {
      return await this.circuitBreaker.call(async () => {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Search API failed: ${response.status}`);
        }

        const data = await response.json();
        
        // Cache successful responses
        this.fallbackCache.set(this.getCacheKey(params), {
          data,
          timestamp: Date.now(),
        });

        return data;
      });
    } catch (error) {
      // Fallback to cached data
      return this.getFallbackData(params);
    }
  }

  getFallbackData(params) {
    const cacheKey = this.getCacheKey(params);
    const cached = this.fallbackCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour
      return {
        ...cached.data,
        _fallback: true,
        _message: 'Showing cached results due to service issues',
      };
    }

    // Return empty state with error message
    return {
      properties: [],
      total: 0,
      _error: true,
      _message: 'Search is temporarily unavailable. Please try again later.',
    };
  }

  getCacheKey(params) {
    return btoa(JSON.stringify(params));
  }
}
```

## 12. Interview Discussion Points

### Scalability Questions

1. **How do you handle memory leaks with 10,000 concurrent users?**
   - Implement memory monitoring and alerting
   - Use WeakMap and WeakSet for temporary references
   - Regular garbage collection monitoring
   - Component cleanup in useEffect hooks

2. **How do you optimize bundle size for faster initial loads?**
   - Route-based code splitting
   - Dynamic imports for non-critical features
   - Tree shaking and dead code elimination
   - Micro-frontend architecture

3. **How do you handle state synchronization across multiple tabs?**
   - BroadcastChannel API for same-origin communication
   - SharedWorker for complex state management
   - LocalStorage events for simple data sharing

### Performance Questions

1. **How do you maintain 60fps rendering with heavy data updates?**
   - Use React.memo and useMemo strategically
   - Implement virtual scrolling for large lists
   - Batch state updates with React 18 automatic batching
   - Use CSS transforms instead of changing layout properties

2. **How do you optimize search performance for concurrent users?**
   - Implement debounced search inputs
   - Use search indexing and caching
   - Parallel request processing
   - Progressive search results loading

### Infrastructure Questions

1. **How do you handle deployment with zero downtime?**
   - Blue-green deployment strategy
   - Rolling updates with health checks
   - Feature flags for gradual rollouts
   - Database migration strategies

2. **How do you ensure consistent performance across regions?**
   - Multi-region CDN deployment
   - Edge computing for dynamic content
   - Regional load balancing
   - Performance monitoring per region

## Conclusion

Building a frontend architecture for 10,000 concurrent users requires a holistic approach that encompasses:

1. **Performance-First Design**: Every component and feature should be optimized for speed and efficiency
2. **Scalable Infrastructure**: Container orchestration with auto-scaling capabilities
3. **Robust Monitoring**: Comprehensive observability to detect and resolve issues quickly
4. **Graceful Degradation**: Fallback strategies to maintain service during peak loads or failures
5. **Continuous Optimization**: Regular performance audits and improvements

The key to success is not just handling the current load, but building a system that can scale gracefully as traffic grows while maintaining excellent user experience across all devices and network conditions.

---

**References:**
- [Scaling to 500K Users: A Frontend Architect's Playbook](https://dev.to/kiran_raj_r/scaling-to-500k-users-a-frontend-architects-playbook-44n9)
- [How I Optimized My React Application to Handle 3M Traffic](https://medium.com/full-stack-forge/how-i-optimized-my-react-application-to-handle-3m-traffic-54c4c341db9e)
- [Top 25 Tips for Building an EXTREMELY FAST Website](https://dev.to/dustinbrett/top-25-tips-for-building-an-extremely-fast-website-iaf)
- [Strategies for Implementing Scalable Frontend Architectures](https://blog.stackademic.com/strategies-for-implementing-scalable-frontend-architectures-in-large-organizations-f10d08c1e74a)