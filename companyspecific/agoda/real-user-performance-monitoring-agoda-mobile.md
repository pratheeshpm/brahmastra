# Real User Performance Monitoring for Agoda Mobile Web

## Question
What tools and techniques would you use to monitor and improve real user performance metrics (e.g., FCP, TTI) for Agoda's mobile web? Describe an end-to-end measurement process.

## Introduction
Real User Monitoring (RUM) for mobile web applications requires a comprehensive approach that captures actual user experiences across diverse devices, networks, and geographic locations. This document outlines a complete RUM strategy specifically tailored for Agoda's mobile web platform, incorporating modern performance monitoring techniques and the PRPL pattern for optimization.

## 1. Core Web Vitals and Mobile-Specific Metrics

### 1.1 Essential Performance Metrics for Mobile

**Core Web Vitals Monitoring:**
• **First Contentful Paint (FCP)**
  - Measures when first content appears on screen
  - Mobile threshold: 1.8s good, 3.0s poor
  - Critical for perceived loading performance
  - PerformanceObserver for paint entries

• **Largest Contentful Paint (LCP)**
  - Measures when largest content element renders
  - Mobile threshold: 2.5s good, 4.0s poor
  - Indicates main content loading completion
  - Continuous monitoring for dynamic content

• **First Input Delay (FID)**
  - Measures responsiveness to first user interaction
  - Mobile threshold: 100ms good, 300ms poor
  - Critical for mobile touch interactions
  - Processing delay calculation (processingStart - startTime)

• **Cumulative Layout Shift (CLS)**
  - Measures visual stability during loading
  - Mobile threshold: 0.1 good, 0.25 poor
  - Excludes user-initiated layout shifts
  - Continuous measurement throughout page lifecycle

**Mobile-Specific Performance Metrics:**
• **Time to Interactive (TTI)**
  - Measures when page becomes fully interactive
  - Mobile threshold: 3.8s good, 7.3s poor
  - Based on main thread quiet periods (5 seconds)
  - Long task monitoring for blocking detection

• **Network-Aware Metrics**
  - Connection type detection (2G, 3G, 4G, 5G)
  - Effective connection type (slow-2g, 2g, 3g, 4g)
  - Network speed (downlink) and latency (RTT)
  - Data saver mode detection

• **Device-Specific Metrics**
  - Available device memory (navigator.deviceMemory)
  - CPU cores (navigator.hardwareConcurrency)
  - Device pixel ratio for display density
  - Viewport dimensions for responsive analysis

**User Experience Metrics:**
• **Business-Critical Timings**
  - Page load time from navigation start
  - Search response time for query results
  - Booking flow completion time
  - Error rate and bounce rate correlation
  - Conversion funnel performance tracking

**Performance Observer Implementation:**
• **Real-Time Metric Collection**
  - PerformanceObserver for paint, LCP, FID, and layout shift events
  - Long task monitoring for TTI calculation
  - Network change event listeners for dynamic conditions
  - Device capability detection on initialization

• **Multi-Platform Analytics Integration**
  - Google Analytics 4 event tracking
  - Datadog RUM integration
  - New Relic performance monitoring
  - Custom analytics endpoint reporting

### 1.2 PRPL Pattern Implementation for Mobile Performance

Following the [PRPL pattern](https://web.dev/articles/apply-instant-loading-with-prpl) specifically for mobile optimization:

**Device Capability Assessment:**
• **Device Tier Classification**
  - Low tier: ≤2GB memory or ≤2 CPU cores
  - Mid tier: ≤4GB memory or ≤4 CPU cores  
  - High tier: >4GB memory and >4 CPU cores
  - Connection speed detection (2G, 3G, 4G, 5G)

**PRELOAD - Adaptive Resource Loading:**
• **Device-Aware Preloading Strategy**
  - Base resources: User session API, critical CSS (always loaded)
  - High-tier + 4G: Additional search and booking modules
  - Low-tier or 2G: Critical resources only
  - Importance hints for mobile optimization

• **Resource Prioritization**
  - Critical resources marked with high importance
  - Non-critical resources skipped on slow connections
  - Adaptive loading based on device capabilities
  - Link preload with appropriate resource types

**RENDER - Progressive Mobile Rendering:**
• **Above-the-Fold Priority**
  - Critical CSS extraction and inlining
  - Immediate above-the-fold HTML rendering
  - Deferred below-the-fold content using requestIdleCallback
  - Progressive enhancement for non-critical features

**PRE-CACHE - Mobile-Optimized Caching:**
• **Service Worker Strategy**
  - Essential resources: Cache-First (24-hour TTL)
  - Images: Stale-While-Revalidate with size limits (50MB low-tier, 100MB high-tier)
  - API calls: Network-First with adaptive timeouts (5s for 2G, 3s for faster)
  - Offline fallback pages for navigation requests

**LAZY LOAD - Intelligent Mobile Loading:**
• **Intersection Observer Optimization**
  - Larger root margins for mobile scrolling (100px low-tier, 200px high-tier)
  - Low threshold (0.1) for early loading detection
  - Device-tier specific loading strategies
  - Automatic unobserving after loading to free memory

## 2. Comprehensive Monitoring Infrastructure

### 2.1 Multi-Platform Analytics Integration

**Unified Analytics Platform:**
• **Multi-Platform Reporting**
  - Google Analytics 4 for performance event tracking
  - Datadog RUM for real-time monitoring and alerting
  - New Relic for application performance monitoring
  - Custom analytics endpoint for business-specific metrics

• **Metric Data Enrichment**
  - Device tier classification (low/mid/high)
  - Network connection type and speed
  - Page type and user segment identification
  - Geographic location and session tracking
  - User ID correlation for personalized insights

**Performance Threshold Monitoring:**
• **Mobile-Specific Thresholds**
  - FCP: 1.8s good, 3.0s poor
  - LCP: 2.5s good, 4.0s poor
  - FID: 100ms good, 300ms poor
  - CLS: 0.1 good, 0.25 poor
  - TTI: 3.8s good, 7.3s poor

• **Real-Time Alerting System**
  - High severity alerts for poor performance (above poor threshold)
  - Medium severity alerts for suboptimal performance (above good threshold)
  - Immediate alert dispatch to monitoring systems
  - WebSocket-based real-time dashboard updates

### 2.2 Synthetic Monitoring for Mobile

**Test Configuration Matrix:**
• **Device and Network Combinations**
  - iPhone 12 with 4G in Singapore (premium experience)
  - Samsung Galaxy S20 with 3G in Bangkok (mid-tier experience)
  - iPhone SE with 2G in Jakarta (budget/slow network experience)
  - Pixel 5 with WiFi in Mumbai (high-speed connection baseline)

• **Lighthouse Programmatic Testing**
  - Headless Chrome with mobile emulation
  - Performance-focused auditing (Core Web Vitals)
  - Network throttling simulation for realistic conditions
  - CPU throttling for device capability simulation

**Network Throttling Configurations:**
• **Connection Speed Simulation**
  - 4G: 40ms RTT, 10.24 Mbps throughput, 1x CPU
  - 3G: 300ms RTT, 1.6 Mbps throughput, 2x CPU slowdown
  - 2G: 800ms RTT, 280 kbps throughput, 4x CPU slowdown
  - WiFi: Optimal conditions for baseline comparison

• **Performance Regression Detection**
  - Historical baseline comparison for each device/network combination
  - Automated regression detection and alerting
  - Trend analysis for performance degradation over time
  - Configuration-specific performance tracking

## 3. End-to-End Measurement Process

### 3.1 Data Collection Pipeline

**Four-Phase Measurement Process:**
• **Phase 1: Real-Time Data Collection**
  - Web Vitals collection (FCP, LCP, FID, CLS)
  - Resource timing analysis
  - Navigation timing metrics
  - Custom Agoda-specific metrics
  - User interaction tracking
  - Error rate monitoring

• **Phase 2: Batch Data Processing**
  - Data cleaning and normalization
  - Multi-dimensional aggregation (device, network, location, page, time)
  - Percentile calculation (50th, 75th, 90th, 95th, 99th)
  - Anomaly detection for unusual patterns

• **Phase 3: Analysis and Insights Generation**
  - Trend analysis for performance patterns
  - Correlation analysis between metrics
  - Automated recommendation generation
  - Alert generation for threshold violations
  - Performance forecasting

• **Phase 4: Reporting and Alerting**
  - Real-time dashboard updates
  - Automated report generation
  - Stakeholder notification system
  - Performance regression alerts

**Data Collection Strategies:**
• **Web Vitals Collection**
  - PerformanceObserver for paint, LCP, first-input, and layout-shift entries
  - 10-second collection window for comprehensive data
  - Page context enrichment for better analysis
  - URL and timestamp correlation

• **Resource Timing Analysis**
  - Complete resource loading waterfall
  - Resource type classification and size tracking
  - Cache hit/miss ratio analysis
  - Load time correlation with resource size

• **Custom Agoda Metrics**
  - Search-to-results response time
  - Booking flow completion time
  - Property card rendering performance
  - Business-critical user journey timing

**Data Processing and Analysis:**
• **Multi-Dimensional Aggregation**
  - Device tier performance breakdown
  - Network condition impact analysis
  - Geographic location performance patterns
  - Page type performance comparison
  - Time-based trend identification

• **Percentile Analysis**
  - P50, P75, P90, P95, P99 calculation for all Core Web Vitals
  - Performance distribution understanding
  - Outlier identification and analysis
  - Benchmark comparison against industry standards

• **Automated Recommendations**
  - FCP optimization for >1.8s P75 performance
  - LCP optimization for >2.5s P75 performance
  - Network-specific optimization for slow connections (>5s load time)
  - Device-tier specific performance improvements

## 4. Performance Improvement Strategies

### 4.1 Mobile-Specific Optimization Techniques

**Image Optimization Strategy:**
• **Responsive Image Implementation**
  - WebP format with JPEG fallback for better compression
  - Multiple breakpoints (480px, 768px) for optimal sizing
  - Lazy loading for below-the-fold images
  - Progressive JPEG for faster perceived loading

• **CDN and Format Optimization**
  - CloudFlare/AWS CloudFront with automatic format conversion
  - Dynamic image resizing based on device capabilities
  - Quality optimization (80% for mobile, 90% for desktop)
  - AVIF format support for modern browsers

**JavaScript Optimization Approach:**
• **Code Splitting Implementation**
  - Route-based splitting (SearchPage, BookingPage, PropertyPage)
  - Dynamic imports for lazy loading
  - Bundle analysis with webpack-bundle-analyzer
  - Tree shaking for unused code elimination

• **Performance Monitoring**
  - Bundle size tracking and alerting
  - Chunk loading performance measurement
  - Third-party library impact analysis
  - Dead code detection and removal

**Network Optimization Techniques:**
• **Adaptive Loading Strategy**
  - 2G networks: Minimal experience with essential features only
  - 3G networks: Progressive enhancement with core functionality
  - 4G+ networks: Full feature set with enhanced experience
  - Connection change handling for dynamic optimization

• **HTTP/2 and Caching**
  - Server push for critical resources
  - Resource prioritization hints
  - Intelligent prefetching based on user behavior
  - Service worker caching strategies

## 5. Automated Performance Testing

### 5.1 CI/CD Integration for Performance

**Automated Testing Pipeline:**
• **Multi-Configuration Testing**
  - Mobile 3G throttling for realistic conditions
  - Mobile 4G for optimal mobile experience
  - Desktop baseline for comparison
  - Programmatic Lighthouse execution

• **Performance Regression Detection**
  - Automated benchmark comparison
  - Build failure on performance degradation
  - Regression threshold enforcement
  - Detailed regression reporting

**Performance Benchmarks:**
• **Mobile-Specific Thresholds**
  - FCP: 1.8s maximum (mobile)
  - LCP: 2.5s maximum (mobile)
  - FID: 100ms maximum
  - CLS: 0.1 maximum
  - TTI: 3.8s maximum (mobile)
  - Speed Index: 3.4s maximum (mobile)

• **CI/CD Integration Benefits**
  - Continuous performance monitoring
  - Early regression detection
  - Automated performance reporting
  - Development team feedback loop

## 6. Conclusion

Implementing comprehensive Real User Monitoring for Agoda's mobile web requires a multi-layered approach that combines:

**Core Monitoring Components:**
• **Real-Time Performance Tracking**
  - Core Web Vitals monitoring (FCP, LCP, FID, CLS) with mobile-specific thresholds
  - Device and network context collection for adaptive optimization
  - Custom Agoda metrics (search response time, booking flow completion)
  - Multi-platform analytics integration (GA4, Datadog, New Relic)

• **PRPL Pattern Implementation**
  - Device-tier assessment for adaptive resource loading
  - Progressive rendering with above-the-fold prioritization
  - Intelligent caching strategies for mobile constraints
  - Lazy loading optimized for mobile scrolling behavior

• **End-to-End Measurement Process**
  - Four-phase pipeline: collection → processing → analysis → reporting
  - Multi-dimensional data aggregation and percentile analysis
  - Automated recommendation generation and alerting
  - Performance regression detection and forecasting

**Optimization Strategies:**
• **Mobile-Specific Techniques**
  - Responsive image optimization with WebP/AVIF formats
  - Code splitting and dynamic imports for faster TTI
  - Adaptive loading based on network conditions (2G/3G/4G)
  - Service worker caching with device-aware size limits

• **Continuous Improvement**
  - CI/CD integration with automated performance testing
  - Lighthouse programmatic execution with mobile emulation
  - Performance benchmark enforcement and regression prevention
  - Real-time alerting for threshold violations

**Expected Outcomes:**
• **Performance Improvements**
  - Faster FCP and TTI across all device tiers and network conditions
  - Reduced bounce rates and improved user engagement
  - Better Core Web Vitals scores for SEO benefits
  - Enhanced mobile user experience leading to higher conversion rates

• **Operational Benefits**
  - Proactive performance issue identification
  - Data-driven optimization decisions
  - Automated performance regression prevention
  - Comprehensive visibility into real user experiences

This comprehensive RUM strategy ensures Agoda can maintain excellent mobile performance across diverse user conditions while proactively identifying and addressing performance issues before they impact user experience and business metrics.

## References

- [PRPL Pattern - Web.dev](https://web.dev/articles/apply-instant-loading-with-prpl)
- Core Web Vitals Documentation and Mobile Thresholds
- Real User Monitoring Best Practices (Google)
- Mobile Performance Optimization Guidelines
- Lighthouse Performance Auditing Documentation
- Service Worker Caching Strategies for Mobile
- Performance Observer API and Web Vitals Library