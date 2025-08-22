# Multi-Backend API Integration Architecture

## Question
How would you architect the frontend to integrate with multiple backend APIs efficiently while maintaining data consistency and handling failures gracefully?

## Introduction
Modern applications often need to integrate with multiple backend services and APIs to deliver comprehensive functionality. This document outlines a robust architecture for frontend applications to efficiently integrate with multiple backends while ensuring data consistency, optimal performance, and graceful failure handling.

## 1. Architectural Patterns Overview

### Backend for Frontend (BFF) Pattern
The BFF pattern creates dedicated backend services for each frontend type, providing:
- **Client-specific optimization**: Tailored APIs for web, mobile, and third-party clients
- **Data aggregation**: Single endpoint combining multiple backend services
- **Reduced coupling**: Frontend teams control their own backend layer
- **Optimized payload**: Only necessary data sent to each client type

### API Gateway Aggregation Pattern
A centralized API gateway that:
- **Single entry point**: One endpoint for all client requests
- **Request routing**: Intelligent routing to appropriate backend services
- **Cross-cutting concerns**: Authentication, rate limiting, monitoring
- **Protocol transformation**: Convert between different API protocols

## 2. Multi-Backend Integration Strategies

### 2.1 Orchestration Layer Architecture

```typescript
// Frontend Micro-Communication (FMC) Pattern
interface ServiceRequest {
  endpoint: string;
  dependencies?: string[];
  forClient: boolean;
  timeout: number;
}

interface ConsumerContract {
  [endpoint: string]: {
    microservices: ServiceRequest[];
    dependencies: Record<string, string>;
  };
}

// Example contract for hotel booking
const hotelBookingContract: ConsumerContract = {
  '/booking/search': {
    microservices: [
      { endpoint: '/hotels/search', forClient: true, timeout: 5000 },
      { endpoint: '/pricing/calculate', forClient: true, timeout: 3000 },
      { endpoint: '/inventory/check', forClient: false, timeout: 2000 }
    ],
    dependencies: {
      'hotels.response.hotelIds -> pricing.request.hotelIds': true,
      'hotels.response.hotelIds -> inventory.request.hotelIds': true
    }
  }
};
```

### 2.2 API Aggregation Patterns

#### Parallel Aggregation
```typescript
class APIAggregator {
  async aggregateHotelData(searchParams: SearchParams): Promise<HotelResult[]> {
    // Execute calls in parallel for better performance
    const [hotels, pricing, reviews, amenities] = await Promise.allSettled([
      this.hotelService.search(searchParams),
      this.pricingService.getPrices(searchParams),
      this.reviewService.getReviews(searchParams),
      this.amenityService.getAmenities(searchParams)
    ]);

    return this.combineResults(hotels, pricing, reviews, amenities);
  }

  private combineResults(...results: PromiseSettledResult<any>[]): HotelResult[] {
    // Handle partial failures gracefully
    const validResults = results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<any>).value);
    
    return this.mergeHotelData(validResults);
  }
}
```

#### Sequential Aggregation with Dependencies
```typescript
class DependentAPIAggregator {
  async getBookingDetails(bookingId: string): Promise<BookingDetails> {
    try {
      // Step 1: Get booking info (required)
      const booking = await this.bookingService.getBooking(bookingId);
      
      // Step 2: Get dependent data in parallel
      const [user, hotel, payment] = await Promise.allSettled([
        this.userService.getUser(booking.userId),
        this.hotelService.getHotel(booking.hotelId),
        this.paymentService.getPayment(booking.paymentId)
      ]);

      return this.assembleBookingDetails(booking, user, hotel, payment);
    } catch (error) {
      return this.handleBookingError(error, bookingId);
    }
  }
}
```

## 3. Performance Optimization Strategies

### 3.1 Caching Architecture

```typescript
interface CacheStrategy {
  level: 'memory' | 'redis' | 'cdn';
  ttl: number;
  invalidation: 'time' | 'event' | 'manual';
}

class MultiLevelCache {
  private memoryCache = new Map();
  private redisCache: RedisClient;
  private cdnCache: CDNClient;

  async get<T>(key: string, strategies: CacheStrategy[]): Promise<T | null> {
    for (const strategy of strategies) {
      const cached = await this.getCacheByLevel(key, strategy.level);
      if (cached) return cached;
    }
    return null;
  }

  async setWithStrategies<T>(key: string, value: T, strategies: CacheStrategy[]): Promise<void> {
    await Promise.all(
      strategies.map(strategy => 
        this.setCacheByLevel(key, value, strategy.level, strategy.ttl)
      )
    );
  }
}
```

### 3.2 Request Optimization

```typescript
class RequestOptimizer {
  private requestBatcher = new Map<string, Promise<any>>();

  // Batch similar requests
  async batchRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.requestBatcher.has(key)) {
      return this.requestBatcher.get(key);
    }

    const promise = fetcher();
    this.requestBatcher.set(key, promise);
    
    // Clean up after request completes
    promise.finally(() => this.requestBatcher.delete(key));
    
    return promise;
  }

  // Request deduplication
  async deduplicateRequest<T>(requestId: string, fetcher: () => Promise<T>): Promise<T> {
    return this.batchRequest(`dedup_${requestId}`, fetcher);
  }
}
```

## 4. Error Handling and Resilience

### 4.1 Circuit Breaker Pattern

```typescript
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttempt = 0;

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private monitoringPeriod: number = 10000
  ) {}

  async call<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HALF_OPEN;
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

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}
```

### 4.2 Graceful Degradation

```typescript
class ServiceManager {
  private circuitBreakers = new Map<string, CircuitBreaker>();

  async callServiceWithFallback<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback: () => T
  ): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(serviceName);
    
    try {
      return await circuitBreaker.call(operation);
    } catch (error) {
      console.warn(`Service ${serviceName} failed, using fallback:`, error);
      return fallback();
    }
  }

  async getHotelSearchResults(params: SearchParams): Promise<SearchResults> {
    // Primary search with fallbacks for each service
    const hotels = await this.callServiceWithFallback(
      'hotel-search',
      () => this.hotelService.search(params),
      () => ({ hotels: [], hasMore: false })
    );

    const pricing = await this.callServiceWithFallback(
      'pricing',
      () => this.pricingService.getPrices(params),
      () => ({ prices: new Map() })
    );

    const reviews = await this.callServiceWithFallback(
      'reviews',
      () => this.reviewService.getReviews(params),
      () => ({ reviews: new Map(), averageRatings: new Map() })
    );

    return this.combineSearchResults(hotels, pricing, reviews);
  }
}
```

## 5. Data Consistency Management

### 5.1 Event-Driven Updates

```typescript
interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  data: any;
  timestamp: number;
}

class EventDrivenBFF {
  private eventStore: EventStore;
  private projectionStore: ProjectionStore;

  async handleDomainEvent(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'BOOKING_CREATED':
        await this.updateBookingProjection(event);
        await this.notifyConnectedClients(event);
        break;
      
      case 'PAYMENT_PROCESSED':
        await this.updatePaymentProjection(event);
        await this.notifyConnectedClients(event);
        break;
      
      case 'HOTEL_INVENTORY_UPDATED':
        await this.updateInventoryProjection(event);
        await this.notifyConnectedClients(event);
        break;
    }
  }

  private async notifyConnectedClients(event: DomainEvent): Promise<void> {
    const connectedClients = await this.getConnectedClients(event.aggregateId);
    
    await Promise.all(
      connectedClients.map(clientId => 
        this.websocketManager.send(clientId, {
          type: 'DATA_UPDATE',
          aggregateId: event.aggregateId,
          eventType: event.eventType,
          data: event.data
        })
      )
    );
  }
}
```

### 5.2 Optimistic Updates with Compensation

```typescript
class OptimisticUpdateManager {
  private pendingUpdates = new Map<string, PendingUpdate>();

  async performOptimisticUpdate<T>(
    updateId: string,
    optimisticUpdate: () => void,
    serverUpdate: () => Promise<T>,
    compensationUpdate: () => void
  ): Promise<T> {
    // Apply optimistic update immediately
    optimisticUpdate();
    
    this.pendingUpdates.set(updateId, {
      timestamp: Date.now(),
      compensationUpdate
    });

    try {
      const result = await serverUpdate();
      this.pendingUpdates.delete(updateId);
      return result;
    } catch (error) {
      // Compensate for the optimistic update
      compensationUpdate();
      this.pendingUpdates.delete(updateId);
      throw error;
    }
  }

  // Example usage for booking update
  async updateBooking(bookingId: string, updates: BookingUpdates): Promise<Booking> {
    const originalBooking = this.store.getBooking(bookingId);
    
    return this.performOptimisticUpdate(
      `booking_${bookingId}`,
      () => this.store.updateBookingOptimistically(bookingId, updates),
      () => this.bookingService.updateBooking(bookingId, updates),
      () => this.store.revertBookingUpdate(bookingId, originalBooking)
    );
  }
}
```

## 6. Real-time Communication Architecture

### 6.1 WebSocket Management

```typescript
class WebSocketManager {
  private connections = new Map<string, WebSocket>();
  private subscriptions = new Map<string, Set<string>>();

  async subscribe(clientId: string, topics: string[]): Promise<void> {
    topics.forEach(topic => {
      if (!this.subscriptions.has(topic)) {
        this.subscriptions.set(topic, new Set());
      }
      this.subscriptions.get(topic)!.add(clientId);
    });
  }

  async broadcast(topic: string, message: any): Promise<void> {
    const subscribers = this.subscriptions.get(topic) || new Set();
    
    await Promise.all(
      Array.from(subscribers).map(async clientId => {
        try {
          await this.send(clientId, message);
        } catch (error) {
          console.error(`Failed to send to client ${clientId}:`, error);
          this.removeClient(clientId);
        }
      })
    );
  }

  async send(clientId: string, message: any): Promise<void> {
    const connection = this.connections.get(clientId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  }
}
```

## 7. Monitoring and Observability

### 7.1 Request Tracing

```typescript
class RequestTracer {
  async traceMultiServiceRequest<T>(
    traceId: string,
    operation: string,
    services: string[],
    executor: () => Promise<T>
  ): Promise<T> {
    const span = this.startSpan(traceId, operation, { services });
    
    try {
      const result = await executor();
      span.setStatus({ code: 'OK' });
      return result;
    } catch (error) {
      span.setStatus({ code: 'ERROR', message: error.message });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  private startSpan(traceId: string, operation: string, attributes: any) {
    return this.tracer.startSpan(operation, {
      attributes: {
        'trace.id': traceId,
        'operation.name': operation,
        ...attributes
      }
    });
  }
}
```

## 8. Performance Metrics and KPIs

### Key Performance Indicators
- **Response Time**: Target < 200ms for cached data, < 2s for aggregated calls
- **Availability**: 99.9% uptime for critical booking flows
- **Error Rate**: < 0.1% for primary user journeys
- **Cache Hit Ratio**: > 80% for frequently accessed data
- **API Success Rate**: > 99.5% for individual service calls

### Monitoring Dashboard Metrics
```typescript
interface PerformanceMetrics {
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: {
    rate: number;
    errors: ErrorBreakdown[];
  };
  cacheMetrics: {
    hitRatio: number;
    missRatio: number;
    evictionRate: number;
  };
  serviceHealth: {
    [serviceName: string]: {
      availability: number;
      avgResponseTime: number;
      errorRate: number;
    };
  };
}
```

## 9. Best Practices and Recommendations

### 9.1 API Design Principles
- **Idempotency**: All mutation operations should be idempotent
- **Versioning**: Use semantic versioning for API contracts
- **Pagination**: Implement cursor-based pagination for large datasets
- **Rate Limiting**: Implement client-specific rate limiting
- **Documentation**: Maintain OpenAPI/GraphQL schemas

### 9.2 Security Considerations
- **Authentication**: JWT tokens with short expiration times
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Strict input validation on all API endpoints
- **HTTPS Everywhere**: All communication must use TLS encryption
- **API Security**: Implement OWASP API security best practices

### 9.3 Development Guidelines
- **Contract Testing**: Use consumer-driven contract testing
- **Circuit Breakers**: Implement for all external service calls
- **Timeouts**: Set appropriate timeouts for all network calls
- **Retries**: Use exponential backoff for retry strategies
- **Logging**: Implement structured logging with correlation IDs

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- Set up API Gateway infrastructure
- Implement basic BFF services
- Establish monitoring and logging

### Phase 2: Core Features (Weeks 5-8)
- Implement service aggregation patterns
- Add caching layers
- Implement basic error handling

### Phase 3: Resilience (Weeks 9-12)
- Add circuit breakers
- Implement graceful degradation
- Add performance optimization

### Phase 4: Real-time (Weeks 13-16)
- Implement WebSocket connections
- Add event-driven updates
- Implement optimistic updates

## Conclusion

Multi-backend API integration requires careful architectural planning to ensure performance, reliability, and maintainability. The combination of BFF patterns, API gateways, and event-driven architectures provides a robust foundation for building scalable frontend applications that efficiently integrate with multiple backend services.

Key success factors include:
- **Service isolation** through proper abstraction layers
- **Performance optimization** through caching and request batching
- **Resilience** through circuit breakers and graceful degradation
- **Real-time capabilities** through WebSocket connections and event-driven updates
- **Comprehensive monitoring** for observability and debugging

This architecture enables teams to build responsive, reliable applications that can scale to handle high traffic while maintaining excellent user experience.

## Interview Preparation Tips

### Technical Deep Dive Questions
1. **How would you handle version compatibility between frontend and multiple backend services?**
2. **Explain the trade-offs between BFF pattern vs direct service calls**
3. **How would you implement distributed caching across multiple services?**
4. **Describe strategies for handling partial failures in aggregated API calls**
5. **How would you ensure data consistency across multiple backend updates?**

### System Design Scenarios
- Design a real-time booking system integrating inventory, pricing, and payment services
- Architect a search interface that aggregates results from multiple hotel providers
- Design a notification system that reacts to events from multiple backend services
- Plan a migration strategy from monolithic backend to microservices architecture