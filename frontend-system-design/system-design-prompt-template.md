# Frontend System Design Interview Prompt Template
## Based on GreatFrontEnd.com Autocomplete Structure

This template provides a structured 7-element array approach for creating comprehensive frontend system design questions similar to the GreatFrontEnd format.

---

## **Array Element 1: Requirements Exploration & Clarification**

### **Core Question Framework:**
```
"Design a [SYSTEM_TYPE] that allows users to [PRIMARY_ACTION] with [KEY_FEATURES]."

Examples:
- "Design an autocomplete component that allows users to enter search terms with real-time suggestions"
- "Design a news feed that allows users to browse and interact with posts"
- "Design an e-commerce platform that allows users to browse and purchase products"
```

### **Requirements Exploration Questions:**
```javascript
const requirementQuestions = [
  // Functional Requirements
  "What are the core features to be supported?",
  "What types of [content/data/results] should be supported?",
  "What user interactions are required?",
  "Do we need real-time updates?",
  "What pagination/loading strategy should be used?",
  
  // Non-Functional Requirements  
  "What devices will this be used on? (mobile, desktop, tablet)",
  "What scale are we designing for? (users, requests per day)",
  "What are the performance requirements?",
  "Are there accessibility requirements?",
  "Do we need offline functionality?",
  
  // Technical Constraints
  "Are there any technology stack preferences?",
  "What browser support is needed?",
  "Are there any third-party integrations required?",
  "What are the security requirements?",
  "Do we need SEO optimization?"
];
```

### **Real-Life Examples Section:**
```markdown
### Real-life examples
* https://example1.com - Primary reference
* https://example2.com - Secondary reference  
* https://example3.com - Alternative approach
* https://example4.com - Mobile-first example
```

---

## **Array Element 2: High-Level Design (HLD) & Architecture**

### **Architecture Diagram Components:**
```javascript
const architectureComponents = {
  // Frontend Layer
  "User Interface": {
    "Input Components": ["Search input", "Form fields", "Interactive elements"],
    "Display Components": ["Results UI", "Content display", "Status indicators"],
    "Navigation Components": ["Menus", "Breadcrumbs", "Pagination"]
  },
  
  // Application Layer  
  "Controller/Logic Layer": {
    "State Management": "Handles application state and data flow",
    "Event Handling": "Manages user interactions and system events", 
    "Business Logic": "Core application logic and rules",
    "API Integration": "Handles server communication"
  },
  
  // Data Layer
  "Data Management": {
    "Cache Layer": "Client-side caching for performance",
    "Local Storage": "Persistent client-side data",
    "Network Layer": "API calls and data fetching"
  },
  
  // External Services
  "Backend Services": {
    "API Server": "Main application server",
    "CDN": "Content delivery network",
    "Third-party APIs": "External service integrations"
  }
};
```

### **Component Responsibilities:**
```markdown
* **[Component Name]**: 
  * Primary responsibility
  * Key interactions with other components  
  * Data flow direction
  * Performance considerations

Example:
* **Search Input Component**:
  * Handles user input and validation
  * Communicates with Controller for search requests
  * Receives suggestions from Results Component
  * Implements debouncing for performance
```

### **Rendering Strategy:**
```javascript
const renderingOptions = {
  "Server-Side Rendering (SSR)": {
    "pros": ["SEO optimization", "Fast initial load", "Better accessibility"],
    "cons": ["Server overhead", "Less interactivity", "Complex hydration"],
    "bestFor": ["Content sites", "E-commerce", "Marketing pages"]
  },
  
  "Client-Side Rendering (CSR)": {
    "pros": ["Rich interactions", "Offline capability", "Reduced server load"],
    "cons": ["SEO challenges", "Slower initial load", "JavaScript dependency"], 
    "bestFor": ["Dashboards", "Chat apps", "Interactive tools"]
  },
  
  "Hybrid (SSR + CSR)": {
    "pros": ["Best of both worlds", "Progressive enhancement"],
    "cons": ["Complex setup", "Bundle size", "Hydration issues"],
    "bestFor": ["Large applications", "News feeds", "Social platforms"]
  }
};
```

---

## **Array Element 3: Data Model & State Management**

### **Entity Definitions:**
```typescript
interface DataModel {
  // Core Entities
  [EntityName]: {
    id: string;
    createdAt: timestamp;
    updatedAt: timestamp;
    // Entity-specific fields
  };
  
  // Example: Autocomplete
  SearchQuery: {
    id: string;
    query: string;
    timestamp: number;
    userId?: string;
  };
  
  SearchResult: {
    id: string;
    text: string;
    type: 'suggestion' | 'history' | 'trending';
    metadata?: Record<string, any>;
    score: number;
  };
  
  // Client-side only entities
  UIState: {
    isLoading: boolean;
    error: string | null;
    focusedIndex: number;
    isOpen: boolean;
  };
}
```

### **State Management Strategy:**
```javascript
const stateManagementOptions = {
  "Local Component State": {
    "tools": ["useState", "useReducer", "class state"],
    "bestFor": ["Simple components", "Isolated state", "UI-only state"],
    "example": "Input focus state, loading indicators"
  },
  
  "Global State Management": {
    "tools": ["Redux Toolkit", "Zustand", "Jotai", "Context API"],
    "bestFor": ["Shared state", "Complex state logic", "Cross-component data"],
    "example": "User authentication, search results, shopping cart"
  },
  
  "Server State Management": {
    "tools": ["React Query", "SWR", "Relay", "Apollo Client"],
    "bestFor": ["API data", "Caching", "Background updates", "Optimistic updates"],
    "example": "Search results, user profiles, product catalogs"
  }
};
```

### **Data Flow Patterns:**
```markdown
### Unidirectional Data Flow
1. User Interaction → Action/Event
2. Action → State Update  
3. State Update → Component Re-render
4. Component Re-render → UI Update

### Example: Search Flow
1. User types → Input onChange event
2. Debounced search → API request action
3. API response → Update search results state
4. State change → Results component re-renders
5. New results → Display updated suggestions
```

---

## **Array Element 4: API Design & Interface Definition**

### **HTTP API Specification:**
```typescript
// Primary API Endpoints
interface APIEndpoints {
  // GET Endpoints
  "GET /api/[resource]": {
    description: "Fetch data with pagination and filtering";
    parameters: {
      query?: string;
      limit?: number;
      cursor?: string; // For cursor-based pagination
      page?: number;   // For offset-based pagination  
      filters?: Record<string, any>;
    };
    response: {
      data: Array<ResourceType>;
      pagination: PaginationMetadata;
      metadata?: Record<string, any>;
    };
  };
  
  // POST Endpoints
  "POST /api/[resource]": {
    description: "Create new resource";
    body: CreateResourceRequest;
    response: ResourceType | { id: string };
  };
  
  // PUT/PATCH Endpoints
  "PUT /api/[resource]/:id": {
    description: "Update existing resource";
    parameters: { id: string };
    body: UpdateResourceRequest;
    response: ResourceType;
  };
}

// Example: Autocomplete Search API
interface SearchAPI {
  "GET /api/search/suggestions": {
    parameters: {
      q: string;           // Search query
      limit?: number;      // Number of results (default: 10)
      types?: string[];    // Filter by result types
      locale?: string;     // Localization
    };
    response: {
      suggestions: SearchResult[];
      query: string;
      took: number; // Response time in ms
    };
  };
}
```

### **Pagination Strategy Comparison:**
```javascript
const paginationStrategies = {
  "Offset-Based Pagination": {
    "parameters": { page: number, size: number },
    "pros": ["Simple to implement", "Can jump to specific page", "Easy to show total count"],
    "cons": ["Performance degrades with large offsets", "Inconsistent results with new data"],
    "bestFor": ["Search results", "Admin panels", "Static content"],
    "example": "?page=2&size=20"
  },
  
  "Cursor-Based Pagination": {
    "parameters": { cursor: string, size: number },
    "pros": ["Consistent results", "Better performance", "Real-time data safe"],
    "cons": ["Cannot jump to specific page", "More complex to implement"],
    "bestFor": ["News feeds", "Real-time data", "Infinite scroll"],
    "example": "?cursor=eyJpZCI6MTIzfQ&size=20"
  }
};
```

### **Client-Side API Interfaces:**
```typescript
// Component Props Interface
interface ComponentProps {
  // Configuration
  config: {
    apiUrl: string;
    debounceMs: number;
    maxResults: number;
    minQueryLength: number;
  };
  
  // Event Handlers
  onSelect?: (item: ResultItem) => void;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Customization
  renderItem?: (item: ResultItem) => React.ReactNode;
  placeholder?: string;
  className?: string;
  
  // Advanced Options
  initialResults?: ResultItem[];
  cacheStrategy?: 'memory' | 'localStorage' | 'none';
  retryConfig?: RetryConfig;
}
```

---

## **Array Element 5: Optimizations & Performance Deep Dive**

### **Network Optimizations:**
```javascript
const networkOptimizations = {
  "Request Management": {
    "Debouncing": {
      "purpose": "Reduce API calls frequency",
      "implementation": "Wait 300ms after user stops typing",
      "tradeoff": "Slight delay vs server load reduction"
    },
    
    "Request Deduplication": {
      "purpose": "Avoid duplicate requests for same query",
      "implementation": "Cache ongoing requests by query key",
      "benefit": "Reduced server load and faster responses"
    },
    
    "Race Condition Handling": {
      "purpose": "Ensure latest query results are shown",
      "implementation": "Request ID or timestamp-based filtering",
      "pattern": "Discard outdated responses"
    }
  },
  
  "Caching Strategy": {
    "Memory Cache": {
      "scope": "Session-based caching",
      "eviction": "LRU or time-based",
      "storage": "JavaScript Map or Object"
    },
    
    "Browser Storage": {
      "localStorage": "Persistent across sessions",
      "sessionStorage": "Tab-specific storage", 
      "indexedDB": "Large dataset storage"
    },
    
    "Service Worker": {
      "purpose": "Network-level caching",
      "strategies": ["Cache First", "Network First", "Stale While Revalidate"]
    }
  }
};
```

### **Rendering Performance:**
```javascript
const renderingOptimizations = {
  "Virtual Scrolling": {
    "purpose": "Handle large result lists efficiently",
    "implementation": "Render only visible items + buffer",
    "libraries": ["react-window", "react-virtualized"],
    "benefit": "Constant memory usage regardless of list size"
  },
  
  "Code Splitting": {
    "route-level": "Split by pages/routes", 
    "component-level": "Lazy load heavy components",
    "feature-level": "Load features on demand",
    "example": "Lazy load emoji picker, rich text editor"
  },
  
  "Image Optimization": {
    "formats": ["WebP", "AVIF", "modern formats"],
    "techniques": ["Lazy loading", "Progressive loading", "Responsive images"],
    "CDN": "Use CDN for image delivery and optimization"
  }
};
```

### **User Experience Optimizations:**
```javascript
const uxOptimizations = {
  "Loading States": {
    "skeleton": "Show content placeholder while loading",
    "shimmer": "Animated loading effect",
    "progressive": "Show partial content as it loads"
  },
  
  "Error Handling": {
    "graceful_degradation": "Fallback to cached results",
    "retry_logic": "Exponential backoff retry strategy",
    "user_feedback": "Clear error messages and recovery options"
  },
  
  "Accessibility": {
    "keyboard_navigation": "Arrow keys, Enter, Escape support",
    "screen_readers": "ARIA labels and live regions",
    "focus_management": "Proper focus handling and visual indicators"
  }
};
```

### **Mobile Optimizations:**
```javascript
const mobileOptimizations = {
  "Touch Interactions": {
    "touch_targets": "Minimum 44px touch targets",
    "gesture_support": "Swipe, pull-to-refresh gestures",
    "haptic_feedback": "Tactile feedback for interactions"
  },
  
  "Performance": {
    "bundle_size": "Minimize JavaScript bundle size",
    "network_usage": "Optimize for slower connections",
    "battery_usage": "Reduce CPU-intensive operations"
  },
  
  "UI Adaptations": {
    "responsive_design": "Adaptive layouts for different screen sizes",
    "native_inputs": "Use native input types and keyboards",
    "viewport_handling": "Prevent zoom on input focus"
  }
};
```

---

## **Array Element 6: Accessibility & User Experience**

### **WCAG Compliance Framework:**
```javascript
const accessibilityRequirements = {
  "Keyboard Navigation": {
    "tab_order": "Logical tab sequence through interactive elements",
    "keyboard_shortcuts": {
      "Arrow Keys": "Navigate through options",
      "Enter": "Select current option", 
      "Escape": "Close dropdown/modal",
      "Tab": "Move to next focusable element"
    },
    "focus_indicators": "Clear visual focus indicators",
    "no_keyboard_traps": "Users can navigate away from any element"
  },
  
  "Screen Reader Support": {
    "semantic_html": "Use proper HTML semantics (nav, main, article)",
    "aria_attributes": {
      "aria-label": "Accessible names for elements",
      "aria-describedby": "Additional descriptions",
      "aria-expanded": "State of collapsible elements",
      "aria-live": "Announce dynamic content changes"
    },
    "heading_structure": "Logical heading hierarchy (h1, h2, h3...)",
    "alt_text": "Descriptive alt text for images"
  },
  
  "Visual Accessibility": {
    "color_contrast": "Minimum 4.5:1 contrast ratio for text",
    "color_independence": "Don't rely solely on color for information",
    "text_scaling": "Support up to 200% text scaling",
    "reduced_motion": "Respect prefers-reduced-motion setting"
  }
};
```

### **Internationalization (i18n):**
```javascript
const internationalizationSupport = {
  "Text Content": {
    "translation_keys": "Externalize all user-facing text",
    "pluralization": "Handle plural forms correctly",
    "date_time": "Locale-specific date/time formatting",
    "number_formatting": "Currency and number formatting"
  },
  
  "Layout Considerations": {
    "rtl_support": "Right-to-left language support",
    "text_expansion": "Account for text length variations",
    "font_support": "Include fonts for target languages",
    "cultural_adaptation": "Colors, images appropriate for culture"
  },
  
  "Technical Implementation": {
    "locale_detection": "Browser/user preference detection",
    "dynamic_loading": "Load only needed translations",
    "fallback_strategy": "Graceful degradation to default language"
  }
};
```

### **Error Handling & Edge Cases:**
```javascript
const errorHandlingStrategy = {
  "Network Errors": {
    "offline_detection": "Detect when user goes offline",
    "retry_mechanism": "Exponential backoff for failed requests",
    "cached_fallback": "Show cached results when network fails",
    "user_notification": "Clear messaging about connection issues"
  },
  
  "Input Validation": {
    "client_side": "Immediate feedback for invalid input",
    "server_side": "Validate all inputs on server",
    "sanitization": "Prevent XSS and injection attacks",
    "format_validation": "Email, phone, URL format validation"
  },
  
  "Graceful Degradation": {
    "javascript_disabled": "Basic functionality without JavaScript",
    "old_browsers": "Polyfills for missing features",
    "slow_connections": "Progressive enhancement approach"
  }
};
```

---

## **Array Element 7: Advanced Features & System Extensions**

### **Real-time Features:**
```javascript
const realTimeFeatures = {
  "Live Updates": {
    "websockets": "Full-duplex real-time communication",
    "server_sent_events": "Server-to-client streaming",
    "polling": "Periodic checks for updates",
    "implementation": "Subscribe/unsubscribe to relevant data changes"
  },
  
  "Collaborative Features": {
    "concurrent_editing": "Multiple users editing simultaneously", 
    "conflict_resolution": "Handle conflicting changes",
    "presence_indicators": "Show who else is active",
    "change_attribution": "Track who made what changes"
  },
  
  "Offline Capabilities": {
    "service_worker": "Cache resources for offline use",
    "background_sync": "Sync data when connection restored",
    "conflict_resolution": "Handle offline/online data conflicts",
    "storage_management": "Manage offline storage limits"
  }
};
```

### **Analytics & Monitoring:**
```javascript
const analyticsAndMonitoring = {
  "User Analytics": {
    "interaction_tracking": "Track user clicks, searches, selections",
    "performance_metrics": "Page load times, interaction delays",
    "conversion_tracking": "Track goal completions",
    "user_journey": "Understand user flow through application"
  },
  
  "Performance Monitoring": {
    "core_web_vitals": "LCP, FID/INP, CLS tracking",
    "custom_metrics": "Business-specific performance indicators",
    "error_tracking": "JavaScript errors and stack traces",
    "real_user_monitoring": "Actual user experience data"
  },
  
  "A/B Testing": {
    "feature_flags": "Toggle features for different user groups",
    "variant_testing": "Test different UI implementations",
    "statistical_significance": "Ensure reliable test results",
    "gradual_rollout": "Safely deploy changes to subsets of users"
  }
};
```

### **Security Considerations:**
```javascript
const securityMeasures = {
  "Data Protection": {
    "input_sanitization": "Prevent XSS attacks through user input",
    "csp_headers": "Content Security Policy implementation",
    "https_enforcement": "Secure data transmission",
    "sensitive_data": "Avoid storing sensitive data in client"
  },
  
  "Authentication & Authorization": {
    "token_management": "Secure storage and refresh of auth tokens",
    "session_handling": "Proper session lifecycle management",
    "role_based_access": "Feature access based on user roles",
    "csrf_protection": "Cross-site request forgery prevention"
  },
  
  "Privacy Compliance": {
    "gdpr_compliance": "Data protection regulation compliance",
    "cookie_consent": "User consent for tracking cookies",
    "data_minimization": "Collect only necessary user data",
    "user_data_control": "Allow users to control their data"
  }
};
```

### **Scalability & Future Extensions:**
```javascript
const scalabilityConsiderations = {
  "Performance Scaling": {
    "cdn_usage": "Global content delivery network",
    "image_optimization": "Responsive images and modern formats",
    "bundle_optimization": "Tree shaking and code splitting",
    "caching_strategy": "Multi-level caching approach"
  },
  
  "Feature Extensibility": {
    "plugin_architecture": "Allow third-party extensions",
    "theming_system": "Customizable UI themes",
    "api_versioning": "Backward-compatible API changes",
    "configuration_options": "Flexible component configuration"
  },
  
  "Infrastructure": {
    "microservices": "Decompose into smaller services",
    "api_gateway": "Centralized API management",
    "load_balancing": "Distribute traffic across servers",
    "monitoring": "Comprehensive system monitoring"
  }
};
```

---

## **Template Usage Example**

To use this template for creating a new system design question:

```markdown
# System Design: [Your System Name]

## 1. Requirements Exploration
[Use Array Element 1 framework]
- Replace [SYSTEM_TYPE] with your specific system
- Customize the requirement questions for your use case
- Add real-life examples

## 2. High-Level Design  
[Use Array Element 2 framework]
- Adapt architecture components for your system
- Define component responsibilities
- Choose appropriate rendering strategy

## 3. Data Model
[Use Array Element 3 framework]
- Define your specific entities
- Choose state management approach
- Map out data flow

## 4. API Design
[Use Array Element 4 framework]  
- Define your HTTP endpoints
- Choose pagination strategy
- Specify client interfaces

## 5. Optimizations
[Use Array Element 5 framework]
- Apply relevant optimizations
- Consider your specific performance needs
- Address mobile requirements

## 6. Accessibility & UX
[Use Array Element 6 framework]
- Ensure WCAG compliance
- Plan for internationalization
- Handle error cases

## 7. Advanced Features
[Use Array Element 7 framework]
- Add real-time capabilities if needed
- Plan analytics and monitoring
- Consider security and scalability
```

This template provides a comprehensive framework that mirrors the depth and structure of GreatFrontEnd's system design questions while being flexible enough to adapt to any frontend system design challenge. 