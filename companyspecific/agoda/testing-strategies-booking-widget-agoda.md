# Testing Strategies for Booking Widget: Unit, Integration, and E2E Testing

## Question
What are the key differences between unit tests, integration tests, and E2E tests for a booking widget? When should each be prioritized in Agoda's codebase?

## Introduction
Testing a complex booking widget requires a multi-layered approach that balances coverage, speed, reliability, and maintainability. This document outlines comprehensive testing strategies specifically for booking components, incorporating modern testing practices and the testing pyramid principle for optimal test distribution.

## 1. Testing Pyramid for Booking Widget

### 1.1 Test Distribution Strategy

**The Testing Pyramid Structure:**
```
        /\
       /  \
      / E2E\ (10%)
     /______\
    /        \
   /Integration\ (20%)
  /__________\
 /            \
/     Unit     \ (70%)
/______________\
```

**Optimal Distribution for Booking Widget:**
• **70% Unit Tests**: Fast, focused, numerous
  - Individual component logic testing
  - Business rule validation
  - Utility function verification
  - Form validation logic
  - Price calculation algorithms

• **20% Integration Tests**: Component interactions
  - API integration testing
  - Component communication
  - State management flow
  - Data flow between services
  - Third-party service integration

• **10% E2E Tests**: Critical user flows
  - Complete booking journey
  - Payment processing flow
  - Cross-browser compatibility
  - Mobile responsive behavior
  - Critical business scenarios

### 1.2 Testing Framework Architecture

**Framework Selection Strategy:**
• **Unit Testing Framework**
  - Primary: Jest or Vitest for fast execution
  - Runner: Node.js environment
  - Mocking: Built-in mocking capabilities
  - Coverage: Istanbul or c8 for comprehensive reporting

• **Integration Testing Framework**
  - React Testing Library for component integration
  - JSDOM or Happy-DOM for browser environment simulation
  - Mock Service Worker (MSW) for API mocking
  - Real browser APIs when possible

• **E2E Testing Framework**
  - Playwright for cross-browser testing
  - Support for Chromium, Firefox, and Safari
  - Mobile device emulation capabilities
  - Network throttling and offline testing

**Configuration Best Practices:**
• **Test File Organization**
  - Co-located tests with components
  - Dedicated test directories for complex scenarios
  - Separate configuration for different test types
  - Clear naming conventions for test identification

• **Coverage Requirements**
  - Global minimum: 80% coverage across all metrics
  - Booking components: 90% coverage (critical business logic)
  - Exclude non-testable files (stories, type definitions)
  - Branch coverage prioritized over line coverage

## 2. Unit Testing Strategy

### 2.1 Component-Level Unit Tests

**BookingForm Component Testing Approach:**
• **Rendering Tests**
  - Verify all required form fields are present (check-in, check-out, guests, room type)
  - Confirm property information displays correctly (name, location, price)
  - Test loading states during form submission
  - Validate proper button states and accessibility attributes

• **Form Validation Testing**
  - Required field validation (check-in date, check-out date mandatory)
  - Date range validation (check-out must be after check-in)
  - Guest count limits (maximum occupancy validation)
  - Real-time validation feedback display
  - Error message accuracy and user-friendliness

• **User Interaction Testing**
  - Date selection behavior and constraints
  - Dynamic price calculation based on selections
  - Room type selection and price updates
  - Guest count changes affecting availability
  - Form state persistence during interactions

• **Error Handling Testing**
  - Network failure scenarios during submission
  - API timeout handling
  - Form re-enablement after errors
  - Graceful degradation for failed operations
  - User feedback for error conditions

**Booking Utilities Testing:**
• **Price Calculation Functions**
  - Basic price calculation (nights × base price)
  - Room type multiplier application (suite = 1.5x base price)
  - Seasonal pricing adjustments (holiday premiums)
  - Tax and fee calculations
  - Discount and promotion code application

• **Date Validation Functions**
  - Past date rejection for check-in dates
  - Minimum stay requirements (at least 1 night)
  - Maximum stay limits (typically 30 days)
  - Blackout date handling
  - Weekend vs weekday pricing logic

• **Business Rule Validation**
  - Guest capacity limits per room type
  - Age restrictions for certain bookings
  - Cancellation policy validation
  - Payment method compatibility
  - Regional booking restrictions

### 2.2 Service Layer Unit Tests

**BookingService Testing Strategy:**
• **Booking Creation Tests**
  - Successful booking creation with valid data
  - Proper API endpoint calls with correct parameters
  - User ID injection for authenticated requests
  - Response data mapping and validation
  - Booking confirmation number generation

• **Error Handling Tests**
  - Room availability conflicts (409 status codes)
  - Network timeout and retry logic (3 attempts with exponential backoff)
  - Invalid booking data validation before API calls
  - Payment processing failures
  - Server errors and graceful degradation

• **Availability Checking Tests**
  - Room availability fetching for date ranges
  - Proper query parameter construction
  - Response caching for performance optimization
  - Cache invalidation strategies
  - Real-time availability updates

• **Booking Management Tests**
  - Booking cancellation with refund calculations
  - Modification requests and validation
  - Cancellation policy enforcement
  - Time-based restrictions (24-hour rule)
  - Status tracking throughout booking lifecycle

**API Integration Testing Patterns:**
• **Mock Strategy**
  - Complete API client mocking for isolated testing
  - Realistic response data matching production APIs
  - Error scenario simulation for edge cases
  - Network condition simulation (slow, timeout, offline)

• **Validation Testing**
  - Input data validation before API calls
  - Response data structure validation
  - Business rule enforcement at service layer
  - Data transformation and normalization

• **Caching and Performance**
  - Cache hit/miss scenarios for availability data
  - Cache expiration and refresh logic
  - Performance optimization verification
  - Memory usage monitoring for large datasets

## 3. Integration Testing Strategy

### 3.1 Component Integration Tests

**Mock Service Worker (MSW) Setup:**
• **API Endpoint Mocking**
  - Property data endpoints with realistic hotel information
  - Availability checking with date-based logic
  - Booking creation and confirmation workflows
  - Payment processing simulation
  - Error scenario simulation for edge cases

• **Test Environment Configuration**
  - React Query client setup with disabled retries
  - Provider wrapper for booking context
  - Server lifecycle management (setup/teardown)
  - Handler reset between tests for isolation

**Complete Booking Flow Testing:**
• **Happy Path Scenarios**
  - Full booking journey from property selection to confirmation
  - Property data loading and display verification
  - Date selection and availability checking
  - Room type selection with price updates
  - Guest information collection and validation
  - Booking submission and confirmation display

• **Price Calculation Integration**
  - Dynamic price updates based on room type selection
  - Date range changes affecting total cost
  - Guest count impact on pricing
  - Tax and fee calculation accuracy
  - Discount code application and validation

• **Availability Handling**
  - Real-time availability checking on date changes
  - Unavailable date handling (New Year's Eve example)
  - Room type availability display
  - Booking button state management
  - User feedback for availability issues

**Error Handling Integration:**
• **Network Error Scenarios**
  - Server errors during booking submission (500 status)
  - Network timeouts and retry mechanisms
  - API unavailability graceful degradation
  - Form re-enablement after error recovery
  - User-friendly error message display

• **Payment Processing Errors**
  - Payment gateway failures (402 status)
  - Credit card decline handling
  - Retry payment functionality
  - Payment status tracking
  - Refund processing for failed payments

• **Business Logic Errors**
  - Room availability conflicts during booking
  - Pricing discrepancies and resolution
  - Guest limit violations
  - Date validation failures
  - Cancellation policy enforcement

**Accessibility Integration Testing:**
• **Keyboard Navigation**
  - Tab order through all form elements
  - Focus management during interactions
  - Enter key submission functionality
  - Escape key for modal dismissal
  - Arrow key navigation for date pickers

• **Screen Reader Support**
  - ARIA live regions for dynamic content updates
  - Proper labeling for all form inputs
  - Status announcements for availability changes
  - Error message accessibility
  - Progress indication for multi-step flows

### 3.2 State Management Integration Tests

**Booking State Lifecycle Testing:**
• **Initial State Verification**
  - Default booking data structure with property ID
  - Empty date fields and default guest count
  - Standard room type as default selection
  - Idle booking status on initialization
  - Clean validation error state

• **State Update Flow Testing**
  - Check-in date updates triggering availability checks
  - Check-out date validation against check-in date
  - Guest count changes affecting room availability
  - Room type selection updating pricing
  - Real-time price calculation on any change

• **Availability Integration**
  - Automatic availability checking on date changes
  - Availability status updates in state
  - Room type availability filtering
  - Price updates based on availability data
  - Error handling for availability check failures

• **Booking Submission Flow**
  - Complete booking data validation before submission
  - Loading state management during API calls
  - Success state with confirmation number
  - Error state handling with user feedback
  - State reset after successful booking

**State Persistence Testing:**
• **Component Remount Scenarios**
  - State preservation across component unmounts
  - Browser refresh state recovery
  - Navigation state persistence
  - Session storage integration
  - State hydration from stored data

• **Validation Error Management**
  - Required field validation error display
  - Error clearing on field updates
  - Multiple validation error handling
  - Custom validation rule enforcement
  - Real-time validation feedback

• **Cross-Component State Sharing**
  - State updates propagating to all consumers
  - Context provider state management
  - Hook-based state access patterns
  - State synchronization across components
  - Performance optimization for state updates

## 4. End-to-End Testing Strategy

### 4.1 Critical User Journey Tests

**Playwright Test Setup:**
• **Browser Context Configuration**
  - Standard desktop viewport (1280x720) for baseline tests
  - Locale and timezone settings for consistent behavior
  - API route mocking for predictable test scenarios
  - Property data, availability, and booking endpoint simulation

• **Test Environment Management**
  - Fresh browser context for each test suite
  - Page cleanup after each test for isolation
  - Consistent API response mocking
  - Test data management and cleanup

**Complete Booking Flow Testing:**
• **Successful Booking Journey**
  - Property page loading and hotel information display
  - Booking widget opening and form visibility
  - Date selection with availability checking
  - Guest count and room type selection
  - Price calculation verification ($260 for 2 nights deluxe)
  - Guest details form completion
  - Booking submission and confirmation display
  - Confirmation number verification (AGD123456)

• **Mobile Responsive Testing**
  - Mobile viewport configuration (375x667)
  - Mobile-optimized layout verification
  - Vertical form field stacking validation
  - Touch interaction support (tap vs click)
  - Mobile-specific UI component testing
  - Responsive design element positioning

• **Network Connectivity Scenarios**
  - Network failure simulation during booking
  - Error message display and user feedback
  - Retry functionality after network restoration
  - Graceful degradation for offline scenarios
  - Connection timeout handling

**Form Validation Testing:**
• **Required Field Validation**
  - Empty form submission error handling
  - Check-in and check-out date requirement validation
  - Guest information mandatory field checking
  - Real-time validation feedback display

• **Data Format Validation**
  - Date range validation (check-out after check-in)
  - Email format validation with error messages
  - Phone number format checking
  - Guest count limits and restrictions

• **Error Recovery Testing**
  - Form correction and re-submission flow
  - Error message clearing on field updates
  - Successful submission after validation fixes

**Accessibility Testing:**
• **Keyboard Navigation**
  - Tab order through all interactive elements
  - Focus management and visual indicators
  - Enter key submission functionality
  - Escape key for modal dismissal

• **Screen Reader Support**
  - ARIA label verification for form inputs
  - Proper semantic HTML structure
  - Status announcements for dynamic content
  - Error message accessibility

**Session Management Testing:**
• **Session Timeout Scenarios**
  - Session expiration during booking process
  - Form data preservation across session issues
  - Login prompt display for expired sessions
  - State recovery after re-authentication

### 4.2 Cross-Browser and Performance E2E Tests

**Cross-Browser Compatibility Testing:**
• **Multi-Browser Test Execution**
  - Chromium (Chrome/Edge) compatibility verification
  - Firefox browser-specific behavior testing
  - WebKit (Safari) date input and form handling
  - Consistent functionality across all browsers
  - Browser-specific UI rendering validation

• **Browser-Specific Behavior Testing**
  - Date input format differences (Safari vs Chrome)
  - Form validation message display variations
  - JavaScript API availability differences
  - CSS rendering consistency checks
  - Touch event handling on different browsers

• **Feature Compatibility Matrix**
  - Modern JavaScript features support
  - CSS Grid and Flexbox layout consistency
  - Web API availability (localStorage, sessionStorage)
  - Form validation API differences
  - Performance API support variations

**Performance Testing Strategy:**
• **Loading Performance Metrics**
  - Time to Interactive (TTI) under 3 seconds
  - Booking widget rendering under 500ms
  - First Contentful Paint optimization
  - Largest Contentful Paint monitoring
  - Cumulative Layout Shift measurement

• **Large Dataset Handling**
  - 100+ room types selection performance
  - Room type dropdown rendering under 100ms
  - Search and filter performance with large datasets
  - Memory usage monitoring for large data
  - UI responsiveness during data processing

• **Network Performance Testing**
  - Slow 3G network simulation
  - Offline functionality testing
  - API timeout handling performance
  - Progressive loading implementation
  - Caching effectiveness measurement

• **User Interaction Performance**
  - Form field response time measurement
  - Date picker interaction speed
  - Real-time price calculation performance
  - Availability checking response time
  - Booking submission processing speed

## 5. Test Prioritization Strategy for Agoda

### 5.1 Priority Matrix for Booking Widget Tests

**Test Type Priority Assessment:**

| Test Type | Critical Path | High Traffic | Business Impact | Maintenance Cost | Priority |
|-----------|---------------|--------------|-----------------|------------------|----------|
| **Unit Tests** | ✓ | ✓ | ✓ | Low | **High** |
| **Integration Tests** | ✓ | ✓ | ✓ | Medium | **High** |
| **E2E Critical Path** | ✓ | ✓ | ✓ | High | **High** |
| **E2E Edge Cases** | ✗ | ✗ | ✓ | High | **Medium** |
| **Visual Regression** | ✗ | ✓ | ✓ | Medium | **Medium** |
| **Performance Tests** | ✓ | ✓ | ✓ | High | **High** |
| **Accessibility Tests** | ✗ | ✓ | ✓ | Low | **Medium** |

### 5.2 When to Prioritize Each Test Type

**Prioritize Unit Tests (70%) when:**
• **Development Phase Activities**
  - Developing new booking logic or validation rules
  - Refactoring complex pricing calculations
  - Adding new room types or pricing models
  - Working on form validation logic
  - Implementing business rule changes

• **Business Logic Updates**
  - Commission calculation modifications
  - Tax calculation rule changes
  - Seasonal pricing algorithm updates
  - Cancellation policy implementations
  - Discount and promotion logic

**Prioritize Integration Tests (20%) when:**
• **System Integration Work**
  - Connecting booking widget to new APIs
  - Implementing payment gateway integrations
  - Adding third-party services (maps, reviews)
  - Testing state management across components
  - Validating data flow between services

• **Cross-Service Communication**
  - User authentication integration
  - Property management system connections
  - Inventory management synchronization
  - Analytics and tracking implementations
  - Email and notification service integration

**Prioritize E2E Tests (10%) when:**
• **Production Readiness**
  - Deploying to production environments
  - Major UI/UX changes to booking flow
  - Testing critical user journeys
  - Validating cross-browser compatibility
  - Performance regression testing

• **Critical Business Scenarios**
  - Peak season booking preparation
  - New market launches
  - Payment system updates
  - Mobile app releases
  - Regulatory compliance validation

### 5.3 Agoda-Specific Test Strategy

**Critical Booking Flows (Must Always Pass):**
• **Core Business Processes**
  - Complete booking flow from search to confirmation
  - Payment processing with multiple gateways
  - Real-time availability checking
  - Dynamic price calculation with all factors
  - Mobile-optimized booking experience

• **Revenue-Critical Functions**
  - Commission calculation accuracy
  - Tax calculation by jurisdiction
  - Currency conversion handling
  - Promotional code application
  - Refund and cancellation processing

**High-Traffic Scenarios (Performance Priority):**
• **Peak Usage Patterns**
  - Peak season booking volumes
  - Mobile responsive design under load
  - Multiple room selection scenarios
  - Guest limit validation at scale
  - Promotional campaign traffic spikes

• **Geographic Considerations**
  - Multi-language booking flows
  - Regional payment method support
  - Local tax and regulation compliance
  - Currency-specific pricing display
  - Time zone handling for bookings

**Test Distribution by Environment:**
• **Development Environment (Focus on Speed)**
  - 80% Unit Tests for rapid feedback
  - 15% Integration Tests for component verification
  - 5% E2E Tests for critical path validation

• **Staging Environment (Balanced Approach)**
  - 60% Unit Tests for comprehensive coverage
  - 30% Integration Tests for system validation
  - 10% E2E Tests for user journey verification

• **Production Environment (Quality Assurance)**
  - 50% Unit Tests for foundation stability
  - 30% Integration Tests for system reliability
  - 20% E2E Tests for complete user experience

**Continuous Monitoring Metrics:**
• **Business Performance Indicators**
  - Booking success rate (target: >95%)
  - Payment success rate (target: >98%)
  - Page load performance (target: <3s)
  - Conversion funnel metrics tracking
  - Error rate monitoring and alerting

## 6. Conclusion

Effective testing of a booking widget requires a balanced approach that prioritizes:

**Testing Strategy Foundation:**
• **Unit Tests (70%)**: Fast feedback, business logic validation, high coverage
  - Rapid development cycle support
  - Individual component reliability
  - Business rule accuracy verification
  - Cost-effective comprehensive coverage

• **Integration Tests (20%)**: Component interactions, API integrations, state management
  - System component communication validation
  - API contract verification
  - State management flow testing
  - Cross-service integration assurance

• **E2E Tests (10%)**: Critical user flows, cross-browser compatibility, real-world scenarios
  - Complete user journey validation
  - Production environment simulation
  - Cross-browser compatibility assurance
  - Real-world scenario testing

**Agoda-Specific Priorities:**
• **High Priority (Critical Business Impact)**
  - Complete booking flows from search to confirmation
  - Payment processing with multiple gateway support
  - Mobile-responsive booking experience
  - Real-time availability and pricing accuracy
  - Revenue calculation and commission handling

• **Medium Priority (Quality Assurance)**
  - Edge case scenarios and error handling
  - Accessibility compliance and keyboard navigation
  - Visual regression testing for UI consistency
  - Performance optimization and monitoring
  - Cross-browser compatibility validation

• **Continuous Monitoring (Operational Excellence)**
  - Booking success rate tracking (>95% target)
  - Payment success rate monitoring (>98% target)
  - Page load performance optimization (<3s target)
  - Conversion funnel metrics analysis
  - Error rate monitoring and alerting

**Implementation Success Factors:**
• **Development Velocity**: Fast unit tests enable rapid iteration
• **System Reliability**: Integration tests catch component interaction issues
• **User Experience**: E2E tests validate complete user journeys
• **Business Continuity**: Continuous monitoring ensures operational stability
• **Scalability**: Proper test distribution supports growth and complexity

This comprehensive testing strategy ensures Agoda's booking widget maintains high quality, reliability, and performance while supporting rapid development and deployment cycles at enterprise scale.

## References

- Testing Library Best Practices and Patterns
- Playwright End-to-End Testing Guide
- Jest Unit Testing Configuration and Best Practices
- Web Performance Testing Standards and Metrics
- Web Accessibility Testing Guidelines (WCAG 2.1)
- Mock Service Worker (MSW) Integration Testing
- React Testing Library Component Testing Strategies