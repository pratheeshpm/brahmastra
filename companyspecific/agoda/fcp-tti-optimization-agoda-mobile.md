# FCP and TTI Optimization Strategies for Agoda Mobile Web

## Question
What strategies would you use to reduce FCP and TTI on Agoda mobile web?

## Introduction
Optimizing First Contentful Paint (FCP) and Time to Interactive (TTI) for mobile web requires a comprehensive approach that addresses network constraints, device limitations, and user experience expectations. This document outlines specific strategies for optimizing these Core Web Vitals on Agoda's mobile platform, incorporating the PRPL pattern and modern optimization techniques.

## 1. Understanding FCP and TTI for Mobile

### 1.1 Mobile-Specific Challenges

**Network Constraints:**
• **Connection Type Variations**
  - 2G networks: 800ms average latency, 280 kbps bandwidth
  - 3G networks: 300ms average latency, 1.6 Mbps bandwidth  
  - 4G networks: 40ms average latency, 10.2 Mbps bandwidth
  - 5G networks: 10ms average latency, 50 Mbps bandwidth
  - Variable connection quality affecting resource loading

• **Device Hardware Limitations**
  - Memory constraints ranging from <2GB to >8GB
  - CPU cores varying from 1 to 8 cores
  - Battery drain concerns with intensive processing
  - Thermal throttling affecting performance
  - Storage limitations impacting caching strategies

• **User Experience Expectations**
  - FCP threshold: 1.8 seconds for mobile (vs 1.2s desktop)
  - TTI threshold: 3.8 seconds for mobile (vs 2.5s desktop)
  - 32% bounce rate increase for every 1s delay after 3s
  - Mobile users more sensitive to performance issues
  - Touch interaction responsiveness requirements

**Current Agoda Mobile Performance Baseline:**
• **Current Metrics (Need Improvement)**
  - FCP: 2.4s (p50), 3.2s (p75), 4.8s (p90)
  - TTI: 4.2s (p50), 6.8s (p75), 9.5s (p90)

• **Target Metrics (Optimization Goals)**
  - FCP: 1.4s (p50), 1.8s (p75), 2.5s (p90) - up to 2.3s improvement
  - TTI: 2.8s (p50), 3.8s (p75), 5.2s (p90) - up to 4.3s improvement

### 1.2 PRPL Pattern Implementation for Mobile FCP/TTI

Following the [PRPL pattern](https://web.dev/articles/apply-instant-loading-with-prpl) for optimal mobile performance:

**PRELOAD - Critical Resource Prioritization:**
• **Device-Aware Resource Loading**
  - Assess device tier (low/mid/high) based on memory and CPU
  - Detect network conditions (2G/3G/4G/5G) for adaptive loading
  - Skip non-critical preloads on slow networks (2G connections)
  - Prioritize resources based on device capabilities

• **Critical Resource Identification**
  - Base resources: Critical fonts (24KB), above-fold CSS (12KB)
  - Page-specific resources: API data, hero images, essential scripts
  - Search page: User context API, search hero image (45KB)
  - Property page: Property details API, property hero image (60KB)
  - Booking page: Booking session API, booking form script (35KB)

• **Optimized Preloading Strategies**
  - Font preloading with `font-display: swap` for faster FCP
  - Critical image preloading with responsive hints
  - API data preloading for immediate interactivity
  - Graceful fallback for failed resource loads

**RENDER - Fast Initial Route Rendering:**
• **Critical CSS Extraction and Inlining**
  - Extract above-the-fold CSS based on viewport dimensions
  - Include essential layout selectors (html, body, header, main)
  - Add mobile-specific selectors for screens ≤768px
  - Inline critical CSS before external stylesheets
  - Page-specific critical styles for immediate rendering

• **Progressive Enhancement Setup**
  - Render above-the-fold content immediately
  - Defer below-the-fold content loading
  - Set up progressive enhancement for non-critical features
  - Measure and optimize rendering performance impact

**PRE-CACHE - Smart Caching Strategy:**
• **Service Worker Implementation**
  - Cache-First strategy for critical resources (24-hour TTL)
  - Stale-While-Revalidate for images (7-day TTL)
  - Network-First for API calls with fast timeouts
  - Device-tier aware cache size limits (50MB low-tier, 100MB high-tier)

• **Mobile-Optimized Caching**
  - Shorter timeouts for 2G connections (5s vs 3s)
  - Smaller cache sizes for low-memory devices
  - Intelligent cache eviction based on usage patterns
  - Background cache updates for better performance

**LAZY LOAD - Intelligent Resource Loading:**
• **Intersection Observer Optimization**
  - Larger root margins for mobile scrolling behavior (100-200px)
  - Device-tier specific thresholds for loading triggers
  - Progressive image loading with quality tiers
  - Component-level lazy loading for heavy features

• **Adaptive Image Loading**
  - Device pixel ratio consideration for optimal sizing
  - WebP format with fallback for better compression
  - CDN-based image optimization with quality parameters
  - Low-quality placeholder immediate display

## 2. Critical CSS Optimization

### 2.1 Automated Critical CSS Extraction

**Puppeteer-Based CSS Analysis:**
• **Mobile-First Extraction Process**
  - Launch headless browser with mobile viewport (375x667)
  - Navigate to target pages with network idle waiting
  - Use CSS coverage API to identify actually used styles
  - Trigger mobile-specific interactions and scroll behaviors
  - Extract only CSS that affects above-the-fold rendering

• **Critical Interaction Simulation**
  - Add mobile-specific CSS classes for device detection
  - Trigger hover states important for mobile interfaces
  - Simulate scroll behavior to capture scroll-dependent styles
  - Wait for CSS transitions and animations to complete
  - Capture dynamic styles that affect initial paint

• **Coverage Analysis Strategy**
  - Focus on CSS files marked as 'critical' or 'above-fold'
  - Extract CSS used from the beginning of stylesheets
  - Prioritize styles that affect layout and positioning
  - Include font-face declarations for text rendering
  - Filter out unused selectors and properties

**CSS Optimization Techniques:**
• **Minification and Cleanup**
  - Remove CSS comments and unnecessary whitespace
  - Eliminate non-critical properties for initial paint
  - Remove animation delays, transition delays, and decorative effects
  - Strip box-shadows, text-shadows, and outline properties
  - Optimize selector specificity for faster parsing

• **Font Declaration Optimization**
  - Add `font-display: swap` to all @font-face rules
  - Prioritize system fonts for immediate text rendering
  - Optimize font loading for better FCP scores
  - Use font fallback stacks for graceful degradation

**Page-Specific Critical CSS Generation:**
• **Base Critical Styles (All Pages)**
  - HTML text size adjustment for mobile (-webkit-text-size-adjust: 100%)
  - Body reset with system font stack
  - Fixed header positioning and z-index management
  - Main content margin adjustment for fixed headers
  - Accessibility utilities (hidden, sr-only classes)

• **Search Page Critical Styles**
  - Search hero section with gradient background (40vh height)
  - Search form styling with transparency and border radius
  - Search input field styling with full width and padding
  - Mobile-optimized form layout and spacing

• **Property Page Critical Styles**
  - Property hero image container (50vh height)
  - Property title typography (24px, bold, proper margins)
  - Property price styling with brand colors (#2c5aa0)
  - Responsive image positioning and sizing

• **Booking Page Critical Styles**
  - Booking header with background color and border
  - Booking form container with proper padding
  - Form group spacing and layout structure
  - Form label styling with appropriate font weight

## 3. JavaScript Bundle Optimization

### 3.1 Advanced Code Splitting and Module Loading

**Route-Based Code Splitting Strategy:**
• **High-Priority Routes**
  - Search page: SearchForm and FilterPanel components preloaded
  - Property page: Gallery and BookingWidget components preloaded
  - Booking page: PaymentForm and GuestDetails components preloaded
  - Dynamic imports for route-specific functionality
  - Predictive loading based on user navigation patterns

• **Feature-Based Module Organization**
  - Core features: Authentication, user session, error handling (loaded immediately)
  - High-priority features: Search, booking, payment (loaded on first interaction)
  - Low-priority features: Reviews, recommendations, wishlist (loaded when idle)
  - Social sharing and non-critical features deferred until needed

**Component-Level Lazy Loading:**
• **Interaction-Triggered Loading**
  - Image gallery: Load on hover with 500ms delay to avoid accidental triggers
  - Map component: Load when map tab is clicked
  - Reviews section: Load when scrolling within 100px of reviews
  - Advanced filters: Load when filter expansion is triggered

• **Intelligent Loading Strategies**
  - Hover-based preloading with timeout management
  - Click-based loading for immediate feature access
  - Intersection Observer for scroll-based loading
  - Idle callback loading for non-critical features

**Bundle Analysis and Optimization:**
• **Performance Monitoring**
  - Track chunk loading times with performance measurement API
  - Alert for chunks taking >1000ms to load on mobile
  - Monitor bundle size growth and optimization opportunities
  - Analyze module duplication and unused code

• **Optimization Recommendations**
  - Split chunks larger than 250KB for better mobile performance
  - Deduplicate common modules using webpack splitChunks
  - Enable tree shaking to remove unused code (target: <100KB unused)
  - Implement intelligent module caching with preload hints

**Module Loading Infrastructure:**
• **Caching and Performance**
  - Module cache with Promise-based loading to prevent duplicate requests
  - Loading queue management to handle concurrent requests
  - Performance measurement for all module loads
  - Preload link hints for better browser optimization

• **Error Handling and Fallbacks**
  - Graceful degradation for failed module loads
  - Retry mechanisms for network-related failures
  - Fallback loading strategies for critical components
  - User feedback for loading states and errors

## 4. Image and Asset Optimization

### 4.1 Progressive Image Loading

**Intersection Observer Implementation:**
• **Smart Loading Triggers**
  - Start loading 50px before images enter viewport
  - Use low threshold (0.01) for early detection
  - Unobserve images after loading to free memory
  - Batch process multiple images for efficiency

• **Multi-Quality Loading Strategy**
  - Step 1: SVG placeholder with loading text for immediate display
  - Step 2: Low-quality image (if available) for quick preview
  - Step 3: Medium-quality WebP (60% quality) optimized for mobile
  - Step 4: High-quality image only on fast connections and high-memory devices

• **Connection-Aware Loading**
  - Skip high-quality images on 2G/slow-2G connections
  - Respect data saver mode preferences
  - Consider device memory (<4GB = medium quality only)
  - Adaptive quality based on network conditions

**Image Optimization Techniques:**
• **Format and Compression**
  - WebP format with JPEG fallback for better compression
  - Dynamic quality adjustment (60% for mobile, 80% for desktop)
  - Responsive image sizing based on device pixel ratio
  - Maximum width constraints (800px) for mobile optimization

• **Placeholder Generation**
  - SVG-based placeholders with dominant color backgrounds
  - Loading text for accessibility and user feedback
  - Smooth fade-in transitions (0.3s ease) for quality upgrades
  - CSS class management for different loading states

• **Batch Processing and Caching**
  - Limit concurrent image loads (3 images max) to prevent network congestion
  - Image cache for preloaded critical images
  - Sequential batch processing for large image sets
  - Error handling with fallback to original images

### 4.2 Font Loading Optimization

**Critical Font Loading Strategy:**
• **Font Priority Management**
  - Critical fonts: Agoda-Regular and Agoda-Bold for immediate text rendering
  - System font fallbacks: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
  - Font-display: swap for all custom fonts to prevent invisible text
  - Unicode range optimization for Latin character sets only

• **Progressive Font Enhancement**
  - Load critical fonts immediately with Promise.all for parallel loading
  - Apply loaded fonts with CSS class management
  - Dispatch custom events for component font loading awareness
  - Graceful degradation when font loading fails

**Format Detection and Optimization:**
• **Modern Font Format Support**
  - WOFF2 format preferred for 30% better compression
  - WOFF fallback for older browser support
  - TTF as final fallback for maximum compatibility
  - Feature detection using FontFace API availability

• **Intelligent Font Preloading**
  - Additional fonts (Light, Medium) loaded on user engagement
  - Trigger preloading on scroll, click, or touch interactions
  - Idle callback loading when main thread is available
  - Single-use event listeners to prevent duplicate loading

**Font Display and Performance:**
• **CSS Font-Face Optimization**
  - Font-display: swap for immediate fallback font rendering
  - Proper font-weight and font-style declarations
  - Fallback font stack matching for consistent layout
  - CSS class application for loaded font states

• **Loading State Management**
  - Font cache to prevent duplicate loading requests
  - Loading status tracking with Map-based storage
  - Error handling with console warnings for failed loads
  - Document-level class management for font loading states

## 5. Network and Caching Optimization

### 5.1 Service Worker for Mobile Performance

**Multi-Strategy Caching Approach:**
• **Cache-First Strategy (Critical Resources)**
  - Critical CSS, app shell, fonts cached immediately on install
  - Offline fallbacks for navigation and image requests
  - 24-hour TTL for critical resources
  - Background updates for cache freshness

• **Network-First Strategy (API Requests)**
  - 3-second timeout for network requests
  - Fallback to cached responses if network fails
  - 5-minute TTL for API responses
  - Cache expiration tracking for data freshness

• **Stale-While-Revalidate Strategy (Images)**
  - Immediate cached response for better performance
  - Background fetch to update cache
  - Graceful handling of background update failures
  - Optimal for frequently accessed images

**Resource Classification:**
• **Critical Resources**
  - App shell JavaScript and critical CSS
  - Essential fonts (Agoda-Regular.woff2)
  - Offline fallback pages
  - Core navigation and layout assets

• **API Resources**
  - All /api/ endpoints with network-first strategy
  - Short cache TTL for data consistency
  - Timeout handling for slow networks
  - Fallback to cached data when available

• **Image Resources**
  - JPG, PNG, WebP, AVIF, SVG formats
  - Stale-while-revalidate for optimal loading
  - Placeholder fallbacks for offline scenarios
  - Size-limited caching for mobile devices

**Cache Management and Optimization:**
• **Automatic Cache Cleanup**
  - Remove old cache versions on service worker updates
  - Limit image cache to 100MB on mobile devices
  - LRU (Least Recently Used) eviction strategy
  - Access time tracking for intelligent cleanup

• **Performance Monitoring**
  - Cache hit/miss ratio tracking
  - Network timeout monitoring
  - Cache size and performance impact measurement
  - Background update success rate tracking

## 6. Performance Monitoring and Optimization

### 6.1 Real-Time Performance Tracking

**Core Web Vitals Monitoring:**
• **First Contentful Paint (FCP) Tracking**
  - PerformanceObserver for paint entries
  - Mobile threshold: 1.8s good, 3.0s poor
  - Real-time reporting to analytics platforms
  - Context-aware measurement with device capabilities

• **Time to Interactive (TTI) Measurement**
  - Long task monitoring for main thread blocking
  - 5-second quiet period detection after FCP
  - Fallback measurement after 10-second timeout
  - Mobile threshold: 3.8s good, 7.3s poor

• **Cumulative Layout Shift (CLS) Tracking**
  - Layout shift observer excluding user-initiated shifts
  - Continuous measurement throughout page lifecycle
  - Mobile threshold: 0.1 good, 0.25 poor
  - Visual stability impact assessment

• **First Input Delay (FID) Monitoring**
  - First user interaction response time measurement
  - Processing delay calculation (processingStart - startTime)
  - Mobile threshold: 100ms good, 300ms poor
  - Touch interaction responsiveness tracking

**Custom Performance Metrics:**
• **Page Load Performance**
  - DOM Content Loaded timing
  - Complete page load timing
  - DNS lookup and TCP connection timing
  - Server response time measurement
  - Resource loading waterfall analysis

• **Resource Load Monitoring**
  - Critical resource load time tracking (CSS, fonts, app shell)
  - Large resource identification (>100KB)
  - Resource size and duration correlation
  - Network efficiency measurement

• **User Interaction Responsiveness**
  - Click, touch, and keyboard interaction delays
  - Idle callback timing for interaction processing
  - Event handler execution time measurement
  - UI responsiveness during user actions

**Performance Context and Analytics:**
• **Device and Network Context**
  - Device memory and CPU core detection
  - Network connection type and speed (2G/3G/4G/5G)
  - Data saver mode detection
  - Viewport dimensions and pixel ratio
  - User agent and browser capabilities

• **Threshold-Based Alerting**
  - High severity alerts for poor performance (>threshold)
  - Medium severity alerts for suboptimal performance
  - Immediate alert dispatch for critical issues
  - Performance degradation trend analysis

• **Multi-Platform Analytics Integration**
  - Google Analytics event tracking
  - Custom analytics endpoint reporting
  - Real-time dashboard updates
  - Performance metric correlation with business KPIs

## 7. Conclusion

Optimizing FCP and TTI for Agoda's mobile web requires a comprehensive approach that addresses:

**Priority 1 - Critical for FCP (Target: <1.8s)**
• **Critical CSS Inlining**: Extract and inline above-the-fold CSS
  - Mobile viewport-based extraction (375x667)
  - Page-specific critical styles for immediate rendering
  - System font fallbacks for instant text display
  - Minification and non-critical property removal

• **Font Loading Optimization**: Use `font-display: swap` and preload critical fonts
  - WOFF2 format with WOFF fallback for better compression
  - Critical fonts (Regular, Bold) loaded immediately
  - Progressive enhancement for additional font weights
  - Unicode range optimization for Latin characters

• **Image Optimization**: Progressive loading with responsive images and WebP
  - Multi-quality loading strategy (placeholder → low → medium → high)
  - Connection-aware quality selection (2G = medium only)
  - WebP format with JPEG fallback
  - Intersection Observer with mobile-optimized margins

• **PRPL Pattern**: Preload critical resources, render initial route quickly
  - Device-tier assessment for adaptive loading
  - Critical resource identification per page type
  - Progressive enhancement for below-the-fold content

**Priority 2 - Essential for TTI (Target: <3.8s)**
• **Code Splitting**: Route-based and component-based splitting
  - Dynamic imports for route-specific functionality
  - Feature-based module organization (core → high → low priority)
  - Interaction-triggered loading (hover, click, intersection)
  - Bundle size limits (250KB chunks) for mobile performance

• **Lazy Loading**: Intelligent loading of non-critical components
  - Idle callback loading for non-critical features
  - User engagement-triggered preloading
  - Component-level splitting for heavy features
  - Error handling and fallback strategies

• **Service Worker**: Smart caching strategies for mobile
  - Multi-strategy approach (Cache-First, Network-First, Stale-While-Revalidate)
  - Mobile-specific cache size limits (100MB)
  - LRU eviction for optimal memory usage
  - Offline fallbacks for critical functionality

• **Bundle Optimization**: Tree shaking and dead code elimination
  - Module deduplication with webpack splitChunks
  - Performance monitoring for chunk loading times
  - Unused code removal (target: <100KB unused)
  - Intelligent module caching with preload hints

**Priority 3 - Continuous Optimization**
• **Performance Monitoring**: Real-time tracking of Core Web Vitals
  - FCP, TTI, CLS, FID measurement with mobile thresholds
  - Device and network context collection
  - Threshold-based alerting for performance degradation
  - Multi-platform analytics integration

• **Device-Aware Loading**: Adapt to device capabilities and network conditions
  - Memory and CPU assessment for loading strategies
  - Network speed detection for quality optimization
  - Data saver mode respect for bandwidth conservation
  - Progressive enhancement based on device capabilities

**Expected Impact**
• **FCP Improvement**: -1000ms to -2300ms across percentiles
  - p50: 2.4s → 1.4s (-1000ms)
  - p75: 3.2s → 1.8s (-1400ms)  
  - p90: 4.8s → 2.5s (-2300ms)

• **TTI Improvement**: -1400ms to -4300ms across percentiles
  - p50: 4.2s → 2.8s (-1400ms)
  - p75: 6.8s → 3.8s (-3000ms)
  - p90: 9.5s → 5.2s (-4300ms)

• **Business Impact**
  - Bounce Rate Reduction: 15-25% improvement
  - Conversion Rate Increase: 5-10% improvement on mobile
  - User Engagement: Improved session duration and page views
  - SEO Benefits: Better Core Web Vitals scores for search ranking

This comprehensive strategy ensures Agoda's mobile web platform provides excellent user experience across all device and network conditions while maintaining business KPIs and supporting rapid development cycles.

## References

- [PRPL Pattern - Web.dev](https://web.dev/articles/apply-instant-loading-with-prpl)
- Core Web Vitals Documentation and Thresholds
- Mobile Performance Best Practices (Google)
- Critical CSS Extraction Techniques and Tools
- Progressive Image Loading Standards (WebP, AVIF)
- Service Worker Caching Strategies Guide
- Font Loading Performance Optimization