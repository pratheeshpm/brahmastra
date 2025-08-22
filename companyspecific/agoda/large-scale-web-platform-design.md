# Large-Scale Web Platform Design for Agoda's Accommodation Search

## Question
How would you design a large-scale web platform for Agoda's accommodation search from scratch?

## Introduction
Designing a large-scale accommodation search platform like Agoda requires careful consideration of scalability, performance, user experience, and system reliability. This document provides a comprehensive approach to building such a platform from the ground up, incorporating best practices from industry leaders.

## 1. Requirements Analysis

### Functional Requirements
- **Search and Filtering**: Users can search for accommodations by location, dates, guest count, price range, amenities
- **Property Listings**: Display detailed property information, photos, reviews, availability
- **Real-time Pricing**: Dynamic pricing based on demand, seasonality, and inventory
- **Booking Management**: Create, view, modify, and cancel reservations
- **User Management**: Authentication, profiles, preferences, booking history
- **Multi-language/Multi-currency**: Support for global users
- **Reviews and Ratings**: User-generated content system
- **Partner Integration**: B2B APIs for travel partners and suppliers

### Non-Functional Requirements
- **Scale**: Handle millions of users, 10M+ properties, 100K+ concurrent requests
- **Performance**: Search results < 500ms, page load times < 2s
- **Availability**: 99.9% uptime with global redundancy
- **Consistency**: Eventual consistency for search, strong consistency for bookings
- **Security**: PCI compliance, data encryption, fraud prevention

## 2. Frontend Architecture Deep Dive

### 2.1 Multi-Layer Frontend Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    CDN Layer (CloudFront/Cloudflare)           │
│  • Static Assets (JS, CSS, Images) • Edge Caching • Gzip      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                Frontend Application Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Web App   │  │ Mobile PWA  │  │ Partner UI  │            │
│  │ (React/Next)│  │(React Native)│  │   (Vue)     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                 BFF Layer (Backend for Frontend)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Web BFF   │  │ Mobile BFF  │  │ Partner BFF │            │
│  │ (Node.js)   │  │ (Node.js)   │  │ (Node.js)   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    API Gateway Layer                           │
│         Rate Limiting • Authentication • Load Balancing        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                   Microservices Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │Search Service│  │BookingService│  │User Service │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Architecture Structure

```typescript
// Frontend Component Hierarchy
src/
├── components/           // Atomic Design System
│   ├── atoms/           // Basic building blocks
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Icon/
│   │   └── Typography/
│   ├── molecules/       // Component combinations
│   │   ├── SearchBox/
│   │   ├── DatePicker/
│   │   ├── PropertyCard/
│   │   └── ReviewCard/
│   ├── organisms/       // Complex components
│   │   ├── Header/
│   │   ├── SearchForm/
│   │   ├── PropertyList/
│   │   └── BookingForm/
│   └── templates/       // Page layouts
│       ├── SearchLayout/
│       ├── PropertyLayout/
│       └── BookingLayout/
├── pages/               // Next.js pages
├── hooks/               // Custom React hooks
├── services/            // API service layer
├── store/               // State management
├── utils/               // Utility functions
└── styles/              // Styling system
```

### 2.3 Detailed Component Implementations

#### Advanced Search Box with Virtualization
```typescript
// components/molecules/SearchBox/SearchBox.tsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCombobox } from 'downshift';

interface SearchSuggestion {
  id: string;
  type: 'city' | 'hotel' | 'landmark';
  name: string;
  country: string;
  coordinates?: [number, number];
  popularity: number;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  onLocationSelect,
  placeholder = "Where are you going?",
  autoFocus = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const parentRef = useRef<HTMLDivElement>(null);
  const suggestionsCache = useRef(new Map<string, SearchSuggestion[]>());

  // Virtualized list for performance with large suggestion lists
  const virtualizer = useVirtualizer({
    count: suggestions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  // Debounced search to prevent excessive API calls
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      // Check cache first
      const cachedResults = suggestionsCache.current.get(query);
      if (cachedResults) {
        setSuggestions(cachedResults);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Use Web Worker for search processing
        const worker = new Worker('/workers/searchWorker.js');
        worker.postMessage({ query, type: 'LOCATION_SEARCH' });
        
        worker.onmessage = (e) => {
          const results = e.data.results;
          suggestionsCache.current.set(query, results);
          setSuggestions(results);
          setIsLoading(false);
          worker.terminate();
        };
      } catch (error) {
        console.error('Search error:', error);
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Downshift for accessible combobox behavior
  const {
    getInputProps,
    getMenuProps,
    getItemProps,
    isOpen,
    highlightedIndex,
  } = useCombobox({
    items: suggestions,
    inputValue,
    onInputValueChange: ({ inputValue: newValue }) => {
      setInputValue(newValue || '');
      debouncedSearch(newValue || '');
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        onLocationSelect(selectedItem);
      }
    },
    itemToString: (item) => item?.name || '',
  });

  return (
    <div className="search-box">
      <input
        {...getInputProps({
          placeholder,
          autoFocus,
          className: 'search-input',
        })}
      />
      {isLoading && <div className="spinner" />}
      
      {isOpen && suggestions.length > 0 && (
        <div {...getMenuProps()} className="suggestions-menu">
          <div ref={parentRef} className="suggestions-container">
            <div style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const suggestion = suggestions[virtualItem.index];
                return (
                  <div
                    key={virtualItem.key}
                    {...getItemProps({ 
                      item: suggestion, 
                      index: virtualItem.index 
                    })}
                    className={`suggestion-item ${
                      highlightedIndex === virtualItem.index ? 'highlighted' : ''
                    }`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div className="suggestion-content">
                      <span className="suggestion-icon">
                        {suggestion.type === 'city' && '🏙️'}
                        {suggestion.type === 'hotel' && '🏨'}
                        {suggestion.type === 'landmark' && '📍'}
                      </span>
                      <div className="suggestion-text">
                        <div className="suggestion-name">{suggestion.name}</div>
                        <div className="suggestion-country">{suggestion.country}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### High-Performance Property Card
```typescript
// components/molecules/PropertyCard/PropertyCard.tsx
import React, { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver';

export const PropertyCard: React.FC<PropertyCardProps> = memo(({
  property,
  onSelect,
  onFavorite,
  isFavorite,
  priority = false
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Intersection observer for lazy loading
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  const handleCardClick = useCallback(() => {
    onSelect(property);
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'property_card_click', {
        property_id: property.id,
        property_name: property.name,
        price: property.price.amount,
        rating: property.rating,
      });
    }
  }, [property, onSelect]);

  // Performance: only render when intersecting
  if (!isIntersecting && !hasIntersected) {
    return (
      <div 
        ref={ref} 
        className="property-card-placeholder"
        style={{ height: '320px' }}
      />
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        ref={ref}
        className="property-card"
        onClick={handleCardClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="property-image-container">
          <Image
            src={property.images[imageIndex]}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={priority}
            onLoad={() => setIsImageLoaded(true)}
            style={{
              objectFit: 'cover',
              opacity: isImageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
          
          {/* Image navigation */}
          {property.images.length > 1 && (
            <div className="image-nav">
              <button onClick={(e) => {
                e.stopPropagation();
                setImageIndex(i => i === 0 ? property.images.length - 1 : i - 1);
              }}>←</button>
              <button onClick={(e) => {
                e.stopPropagation();
                setImageIndex(i => (i + 1) % property.images.length);
              }}>→</button>
            </div>
          )}

          {/* Favorite button */}
          <button
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(property.id);
            }}
          >
            ♡
          </button>
        </div>

        <div className="property-content">
          <h3 className="property-name">{property.name}</h3>
          <p className="property-location">{property.location}</p>
          
          <div className="property-rating">
            <span className="rating-score">{property.rating.toFixed(1)}</span>
            <span className="review-count">({property.reviewCount} reviews)</span>
          </div>

          <div className="property-amenities">
            {property.amenities.slice(0, 3).map(amenity => (
              <span key={amenity} className="amenity-tag">{amenity}</span>
            ))}
          </div>

          <div className="property-price">
            <span className="price-amount">
              {property.price.currency} {property.price.amount.toLocaleString()}
            </span>
            <span className="price-period">per night</span>
          </div>
        </div>
      </m.div>
    </LazyMotion>
  );
});
```

### 2.4 Performance Optimization Hooks

#### Virtual Scrolling Hook
```typescript
// hooks/useVirtualScrolling.ts
import { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useWindowSize } from './useWindowSize';

export const useVirtualScrolling = (
  items: any[],
  itemHeight: number,
  containerHeight: number
) => {
  const { width } = useWindowSize();
  
  const { itemsPerRow, visibleItems } = useMemo(() => {
    const itemsPerRow = width < 768 ? 1 : width < 1024 ? 2 : 3;
    const rows = Math.ceil(items.length / itemsPerRow);
    
    return {
      itemsPerRow,
      visibleItems: rows,
    };
  }, [items.length, width]);

  const getItemsForRow = (rowIndex: number) => {
    const startIndex = rowIndex * itemsPerRow;
    return items.slice(startIndex, startIndex + itemsPerRow);
  };

  return {
    itemsPerRow,
    visibleItems,
    getItemsForRow,
    containerHeight: Math.min(containerHeight, visibleItems * itemHeight),
  };
};
```

#### Image Optimization Hook
```typescript
// hooks/useImageOptimization.ts
import { useState, useEffect, useMemo } from 'react';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
}

export const useImageOptimization = (
  src: string,
  options: ImageOptimizationOptions = {}
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const {
    width = 400,
    height = 300,
    quality = 80,
    format = 'auto'
  } = options;

  // Generate optimized URLs
  const optimizedUrls = useMemo(() => {
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_CDN;
    const params = new URLSearchParams({
      w: width.toString(),
      h: height.toString(),
      q: quality.toString(),
    });

    return {
      webp: `${baseUrl}/${src}?${params}&f=webp`,
      avif: `${baseUrl}/${src}?${params}&f=avif`,
      original: `${baseUrl}/${src}?${params}`,
      placeholder: `${baseUrl}/${src}?w=20&h=15&q=10&blur=20`,
    };
  }, [src, width, height, quality]);

  // Preload images
  useEffect(() => {
    const img = new Image();
    
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setHasError(true);
    
    // Try modern formats first
    const tryFormats = [
      optimizedUrls.avif,
      optimizedUrls.webp,
      optimizedUrls.original
    ];

    const loadNext = (index = 0) => {
      if (index >= tryFormats.length) {
        setHasError(true);
        return;
      }
      img.src = tryFormats[index];
      img.onerror = () => loadNext(index + 1);
    };

    loadNext();

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [optimizedUrls]);

  return {
    ...optimizedUrls,
    isLoaded,
    hasError,
  };
};
```

## 3. High-Level Architecture

### Microservices Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Gateway   │    │   Mobile Apps   │    │   Partner APIs  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │      API Gateway         │
                    │   (Load Balancer)        │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐    ┌─────────▼────────┐    ┌───────▼────────┐
│ Search Service │    │ Booking Service  │    │ User Service   │
└────────┬───────┘    └─────────┬────────┘    └───────┬────────┘
         │                      │                     │
┌────────▼───────┐    ┌─────────▼────────┐    ┌───────▼────────┐
│Inventory Service│   │ Payment Service  │    │Profile Service │
└────────┬───────┘    └─────────┬────────┘    └───────┬────────┘
         │                      │                     │
┌────────▼───────┐    ┌─────────▼────────┐    ┌───────▼────────┐
│Pricing Service │    │Notification Svc  │    │Content Service │
└────────────────┘    └──────────────────┘    └────────────────┘
```

### Core Services

#### 1. Search Service
- **Technology**: Elasticsearch/OpenSearch for full-text search
- **Features**: 
  - Geo-spatial search for location-based queries
  - Faceted search with filters (price, amenities, ratings)
  - Auto-complete and spell correction
  - Search result ranking based on relevance and business rules
- **Caching**: Redis for frequently searched queries
- **Database**: Search index with property metadata

#### 2. Inventory Service
- **Purpose**: Real-time availability management
- **Technology**: PostgreSQL with read replicas
- **Features**:
  - Real-time inventory tracking
  - Rate limiting to prevent overbooking
  - Bulk availability updates from suppliers
- **Caching**: Redis for hot inventory data

#### 3. Booking Service
- **Technology**: PostgreSQL with ACID transactions
- **Features**:
  - Reservation workflow management
  - Payment processing integration
  - Booking confirmation and voucher generation
  - Cancellation and modification handling
- **Consistency**: Strong consistency required for financial transactions

#### 4. Pricing Service
- **Purpose**: Dynamic pricing engine
- **Technology**: Machine Learning models + real-time computation
- **Features**:
  - Demand-based pricing algorithms
  - Competitive pricing analysis
  - Promotional pricing management
  - Currency conversion

## 3. Frontend Architecture

### Modern Frontend Stack
```
┌─────────────────────────────────────────────────────────┐
│                    CDN Layer                            │
│              (CloudFront/CloudFlare)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│                  Web Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   Desktop   │ │   Mobile    │ │   WebView   │      │
│  │   Website   │ │   Website   │ │  (Native)   │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Application Layer                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           React/Next.js Frontend                 │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │  │
│  │  │Search Module│ │Booking Flow │ │User Portal│  │  │
│  │  └─────────────┘ └─────────────┘ └───────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Choices
- **Framework**: Next.js for SSR/SSG capabilities and SEO optimization
- **State Management**: Redux Toolkit for complex state management
- **Styling**: Tailwind CSS for rapid UI development
- **Performance**: 
  - React Query for server state management and caching
  - Code splitting and lazy loading
  - Image optimization with next/image
  - Service Workers for offline capabilities

### Key Frontend Components
1. **SearchBar Component**: Auto-complete, location search, date picker
2. **PropertyCard Component**: Reusable property display with images, pricing, ratings
3. **FilterPanel Component**: Advanced filtering with real-time results
4. **BookingFlow Component**: Multi-step booking process with form validation
5. **MapView Component**: Interactive map with property markers

## 4. Database Design

### Database Strategy
- **Polyglot Persistence**: Different databases for different use cases
- **Read Replicas**: For read-heavy operations like search and browsing
- **Sharding**: Horizontal partitioning for scalability

### Database Choices

#### PostgreSQL (Primary Database)
```sql
-- Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address JSONB,
    coordinates POINT,
    property_type VARCHAR(50),
    amenities JSONB,
    images JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE room_inventory (
    id UUID PRIMARY KEY,
    property_id UUID REFERENCES properties(id),
    room_type VARCHAR(100),
    date DATE,
    available_rooms INTEGER,
    base_price DECIMAL(10,2),
    currency VARCHAR(3),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY,
    user_id UUID,
    property_id UUID REFERENCES properties(id),
    check_in DATE,
    check_out DATE,
    guests INTEGER,
    total_amount DECIMAL(10,2),
    currency VARCHAR(3),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### Redis (Caching Layer)
- Search results caching (TTL: 5-15 minutes)
- Session management
- Rate limiting counters
- Real-time inventory cache

#### Elasticsearch (Search Engine)
```json
{
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "name": {"type": "text", "analyzer": "standard"},
      "location": {"type": "geo_point"},
      "price_range": {"type": "integer_range"},
      "amenities": {"type": "keyword"},
      "rating": {"type": "float"},
      "available_dates": {"type": "date_range"}
    }
  }
}
```

## 5. Performance Optimization

### Caching Strategy
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │     CDN     │    │ Application │
│   Cache     │    │    Cache    │    │   Cache     │
└─────────────┘    └─────────────┘    └─────────────┘
     │                     │                   │
     ▼                     ▼                   ▼
Static Assets         Images/JS/CSS        API Responses
(24 hours)           (1 hour - 1 day)    (5-30 minutes)
```

### Database Optimization
- **Indexing Strategy**: Composite indexes for common query patterns
- **Connection Pooling**: PgBouncer for PostgreSQL connections
- **Query Optimization**: Analyze slow queries and optimize with EXPLAIN
- **Partitioning**: Date-based partitioning for inventory and booking tables

### Frontend Performance
- **Code Splitting**: Route-based and component-based splitting
- **Image Optimization**: WebP format, responsive images, lazy loading
- **Critical CSS**: Inline critical CSS for above-the-fold content
- **Preloading**: DNS prefetch, resource hints for faster loading

## 6. Scalability Considerations

### Horizontal Scaling
- **Microservices**: Independent scaling of services based on demand
- **Database Sharding**: Partition data by geographic region or property ID
- **Auto-scaling**: Kubernetes HPA based on CPU/memory/custom metrics

### Global Distribution
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   US West   │    │   EU West   │    │ Asia Pacific│
│   Region    │    │   Region    │    │   Region    │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │
      ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Primary DB   │◄──►│Read Replica │◄──►│Read Replica │
│(Write)      │    │(Read Only)  │    │(Read Only)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Traffic Management
- **Load Balancing**: Application Load Balancer with health checks
- **Circuit Breakers**: Prevent cascade failures
- **Rate Limiting**: API rate limiting to prevent abuse
- **Geographic Routing**: Route users to nearest data center

## 7. Security & Reliability

### Security Measures
- **Authentication**: JWT tokens with refresh token rotation
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Input Validation**: Comprehensive input sanitization
- **PCI Compliance**: For payment processing
- **GDPR Compliance**: Data privacy and user consent management

### Reliability Patterns
- **Circuit Breakers**: Prevent cascade failures
- **Retry Logic**: Exponential backoff for transient failures
- **Health Checks**: Service health monitoring
- **Graceful Degradation**: Fallback mechanisms for critical features
- **Disaster Recovery**: Multi-region backup and recovery

## 8. Monitoring & Observability

### Metrics & Logging
- **Application Metrics**: Response times, error rates, throughput
- **Business Metrics**: Conversion rates, booking success rates, revenue
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Distributed Tracing**: Request flow across microservices

### Tools
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger or Zipkin
- **Error Tracking**: Sentry for real-time error monitoring

## 9. Deployment & DevOps

### CI/CD Pipeline
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Source    │───►│    Build    │───►│    Test     │───►│   Deploy    │
│   Control   │    │  (Docker)   │    │ (Unit/E2E)  │    │(Kubernetes) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Container Orchestration
- **Kubernetes**: Container orchestration with auto-scaling
- **Docker**: Containerization for consistent deployments
- **Helm Charts**: Package management for Kubernetes deployments

### Infrastructure as Code
- **Terraform**: Infrastructure provisioning
- **Ansible**: Configuration management
- **GitOps**: Git-based deployment workflows

## 10. Interview Discussion Points

### Performance Questions
1. **How would you handle 100K concurrent search requests?**
   - Horizontal scaling with load balancers
   - Redis caching for frequent searches
   - Database read replicas
   - CDN for static content

2. **How would you optimize search response times?**
   - Elasticsearch with proper indexing
   - Result caching with TTL
   - Pagination and result limiting
   - Pre-computed popular searches

### Scalability Questions
1. **How would you scale to 10 million properties?**
   - Database sharding by region/property ID
   - Microservices architecture
   - Separate read/write databases
   - Caching layer optimization

2. **How would you handle global traffic?**
   - Multi-region deployment
   - CDN with edge locations
   - Geographic load balancing
   - Regional data replication

### Reliability Questions
1. **How would you prevent double bookings?**
   - Database transactions with ACID properties
   - Optimistic locking for inventory updates
   - Idempotency keys for booking requests
   - Real-time inventory synchronization

2. **How would you handle payment failures?**
   - Retry mechanism with exponential backoff
   - Circuit breakers for payment gateways
   - Payment status reconciliation
   - User notification system

## 11. Technology Stack Summary

### Frontend
- **Framework**: Next.js with React
- **State Management**: Redux Toolkit + React Query
- **Styling**: Tailwind CSS
- **Build Tools**: Webpack, TypeScript
- **Testing**: Jest, Cypress

### Backend
- **Languages**: Node.js/TypeScript, Python (ML), Go (high-performance services)
- **Frameworks**: Express.js, FastAPI, Gin
- **Databases**: PostgreSQL, Redis, Elasticsearch
- **Message Queues**: Apache Kafka, RabbitMQ

### Infrastructure
- **Cloud**: AWS/GCP/Azure
- **Containers**: Docker, Kubernetes
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **CI/CD**: GitHub Actions, Jenkins

## Conclusion

Building a large-scale accommodation search platform requires a comprehensive approach covering architecture design, technology selection, performance optimization, and operational excellence. The key is to start with a solid foundation that can evolve with business needs while maintaining performance, reliability, and user experience standards.

The modular microservices architecture allows for independent scaling and development, while the frontend optimization ensures fast, responsive user experiences. Proper caching, database design, and monitoring are crucial for maintaining performance at scale.

---

**References:**
- [Software Architecture - Hotel Reservation Booking System](https://austincorso.com/2020/01/23/hotel-reservation-booking-system.html)
- [Front End System Design: Travel Booking](https://www.greatfrontend.com/questions/system-design/travel-booking-airbnb)
- [Breaking the Monolith - Agoda Engineering](https://medium.com/agoda-engineering/breaking-the-monolith-f3538d9c3ad6)
- [High-Level System Architecture of Booking.com](https://medium.com/@sahintalha1/high-level-system-architecture-of-booking-com-06c199003d94)