#!/usr/bin/env python3
"""
Research Prompts Library for Web Research Engine
Contains predefined prompts for different types of system design and technical questions
"""

from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class PromptTemplate:
    """Template for research prompts"""
    name: str
    category: str
    description: str
    prompt_template: str
    expected_sections: List[str]
    mermaid_types: List[str]


class ResearchPromptsLibrary:
    """Library of predefined research prompts for different domains"""
    
    def __init__(self):
        self.prompts = {
            # Frontend System Design Prompts
            "frontend_architecture": PromptTemplate(
                name="Frontend System Design Interview",
                category="frontend_system_design",
                description="Frontend system design following interview best practices",
                prompt_template="""
You are a senior frontend architect creating comprehensive technical documentation. Provide an in-depth analysis of: {query}

**COMPREHENSIVE FRONTEND SYSTEM DESIGN - DETAILED NOTES FORMAT:**

## 1. Requirements Clarification
[thoroughly understand all frontend requirements and constraints with detailed analysis]

### Functional Requirements
- [all core user interactions and features with detailed user flows]
- [complete device and browser support matrix with fallback strategies]
- [user experience expectations with accessibility considerations]
- [offline functionality and progressive web app capabilities]
- [real-time features and data synchronization requirements]

### Non-Functional Requirements
- **Performance Targets (with detailed metrics):**
  - Core Web Vitals targets (LCP, FID, CLS) with specific thresholds
  - Bundle size optimization goals and lazy loading strategies
  - Runtime performance benchmarks and memory usage limits
  - Network optimization and critical resource priorities
- **User Base Analysis:**
  - Expected user base with growth projections and usage patterns
  - Geographic distribution and network condition variations
  - Device usage statistics and performance characteristics
- **Accessibility Requirements:**
  - WCAG 2.1 AA compliance with detailed implementation guidelines
  - Screen reader compatibility and semantic markup requirements
  - Keyboard navigation patterns and focus management
  - Color contrast ratios and responsive design considerations
- **SEO Requirements:**
  - Server-side rendering vs client-side rendering strategies
  - Meta tag management and structured data implementation
  - Page speed optimization and search engine crawlability

## 2. High-Level Frontend Architecture
[design comprehensive frontend system architecture with detailed component analysis]

```mermaid
graph TB
    A[users] --> B[cdn/edge cache]
    B --> C[load balancer]
    C --> D[frontend applications]
    
    subgraph "Frontend Layer"
        D --> E[spa/ssr app]
        D --> F[mobile app]
        D --> G[desktop app]
    end
    
    subgraph "API Layer"
        E --> H[api gateway]
        F --> H
        G --> H
        H --> I[backend services]
    end
    
    subgraph "Data & State"
        E --> J[local storage]
        E --> K[session storage]
        E --> L[indexeddb]
        E --> M[service worker cache]
    end
```

## 3. Component Architecture Design
[design the component hierarchy with providers, hooks, states, and interfaces]

### Component Hierarchy with Context & State
```mermaid
graph TD
    A[app container] --> B[global providers]
    B --> C[authprovider]
    B --> D[themeprovider]
    B --> E[stateprovider]
    B --> F[routerprovider]
    
    A --> G[header component]
    A --> H[main content area]
    A --> I[footer component]
    
    H --> J[navigation component]
    H --> K[content container]
    
    K --> L[feature components]
    K --> M[shared components]
    
    subgraph "Smart Components (with hooks & state)"
        L --> N[userdashboard]
        L --> O[productlist]
        L --> P[ordermanagement]
    end
    
    subgraph "Presentation Components (stateless)"
        M --> Q[button]
        M --> R[modal]
        M --> S[card]
        M --> T[form components]
    end
    
    subgraph "Custom Hooks"
        U[useauth]
        V[useapi]
        W[uselocalstorage]
        X[usedebounce]
    end
    
    N --> U
    O --> V
    P --> W
```

### Component Interfaces & Types
```typescript
// Core Application Interfaces
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
}

// Component Props Interfaces
interface UserDashboardProps {
  user: User;
  onUserUpdate: (user: Partial<User>) => Promise<void>;
  isLoading?: boolean;
}

interface ProductListProps {
  products: Product[];
  onProductSelect: (productId: string) => void;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

// State Management Types
interface AppState {
  user: User | null;
  products: Product[];
  orders: Order[];
  ui: {
    theme: Theme;
    loading: boolean;
    errors: ErrorState[];
  };
}

// Hook Return Types
interface UseAuthReturn {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

### Context Providers & State Management
```mermaid
graph LR
    A[app context] --> B[authcontext]
    A --> C[themecontext]
    A --> D[apicontext]
    A --> E[notificationcontext]
    
    B --> F[useauth hook]
    C --> G[usetheme hook]
    D --> H[useapi hook]
    E --> I[usenotification hook]
    
    subgraph "Global State"
        J[redux store] --> K[user slice]
        J --> L[product slice]
        J --> M[order slice]
        J --> N[ui slice]
    end
    
    subgraph "Server State"
        O[react query] --> P[user queries]
        O --> Q[product queries]
        O --> R[order mutations]
    end
```

## 4. State Management Strategy
[design comprehensive state management and data flow with detailed patterns]

```mermaid
graph LR
    A[user actions] --> B[action dispatchers]
    B --> C[state store]
    C --> D[state selectors]
    D --> E[component props]
    E --> F[ui updates]
    
    subgraph "State Layers"
        G[global state] --> H[redux/zustand]
        I[component state] --> J[react state/hooks]
        K[server state] --> L[react query/swr]
        M[url state] --> N[router state]
    end
```

## 5. Performance Optimization
[frontend performance optimization strategies and implementation]

### Performance Strategy
```mermaid
graph TB
    A[performance optimization] --> B[bundle optimization]
    A --> C[runtime optimization]
    A --> D[network optimization]
    
    B --> E[code splitting]
    B --> F[tree shaking]
    B --> G[bundle analysis]
    
    C --> H[lazy loading]
    C --> I[memoization]
    C --> J[virtual scrolling]
    
    D --> K[cdn usage]
    D --> L[resource hints]
    D --> M[service workers]
```

### Core Web Vitals Optimization
```mermaid
graph LR
    A[lcp optimization] --> B[critical resource loading]
    C[fid optimization] --> D[javascript optimization]
    E[cls optimization] --> F[layout stability]
    
    B --> G[preload critical assets]
    D --> H[code splitting]
    F --> I[reserved space for dynamic content]
```

## 6. Rendering Strategy
[choose appropriate rendering approach]

```mermaid
graph TD
    A[rendering strategy] --> B[client-side rendering]
    A --> C[server-side rendering]
    A --> D[static site generation]
    A --> E[incremental static regeneration]
    
    B --> F[spa with react/vue]
    C --> G[next.js/nuxt.js]
    D --> H[gatsby/next.js ssg]
    E --> I[next.js isr]
    
    F --> J[client hydration]
    G --> J
    H --> J
    I --> J
```

## 7. API Integration & Data Flow
[design api communication, payloads, and data management]

### Critical API Endpoints & Payloads
```typescript
// Authentication APIs
POST /api/auth/login
Request: {
  email: string;
  password: string;
  rememberMe?: boolean;
}
Response: {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// User Management APIs
GET /api/users/profile
Response: {
  user: User;
  permissions: string[];
  lastLogin: string;
}

PUT /api/users/profile
Request: {
  name?: string;
  email?: string;
  preferences?: UserPreferences;
}

// Product APIs
GET /api/products?page=1&limit=20&category=electronics
Response: {
  products: Product[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
  };
  filters: ProductFilters;
}

POST /api/products
Request: {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inventory: {
    quantity: number;
    sku: string;
  };
}

// Order APIs
POST /api/orders
Request: {
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}
Response: {
  order: Order;
  paymentUrl?: string;
  estimatedDelivery: string;
}

// Real-time APIs
WebSocket /ws/orders/{orderId}/status
Message: {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  message: string;
}
```

### API Communication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant H as Custom Hook
    participant A as API Service
    participant I as Interceptor
    participant B as Backend
    
    U->>C: User Action (e.g., Create Order)
    C->>H: useCreateOrder()
    H->>A: createOrder(orderData)
    A->>I: HTTP Request + Auth Headers
    I->>B: Authenticated Request
    B->>I: Response + New Data
    I->>A: Handle Response/Errors
    A->>H: Update React Query Cache
    H->>C: Return {data, loading, error}
    C->>U: Update UI with New State
    
    Note over I,B: Error Handling
    B-->>I: 401 Unauthorized
    I-->>A: Refresh Token
    A-->>B: Retry Original Request
```

### API Error Handling & Types
```typescript
// API Response Types
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

// API Service Configuration
interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  headers: Record<string, string>;
}

// Request/Response Interceptors
interface RequestInterceptor {
  onRequest: (config: RequestConfig) => RequestConfig;
  onError: (error: ApiError) => Promise<never>;
}

interface ResponseInterceptor {
  onResponse: (response: ApiResponse) => ApiResponse;
  onError: (error: ApiError) => Promise<never>;
}
```

## 8. Routing & Navigation
[design client-side routing and navigation]

```mermaid
graph TB
    A[router] --> B[route matching]
    B --> C[component loading]
    C --> D[route guards]
    D --> E[component rendering]
    
    F[nested routes] --> G[layout components]
    G --> H[child components]
    
    I[dynamic routes] --> J[parameter extraction]
    J --> K[data fetching]
    K --> E
```

## 9. Security & Authentication
[address frontend security requirements]

```mermaid
graph TB
    A[frontend security] --> B[authentication]
    A --> C[authorization]
    A --> D[data protection]
    
    B --> E[jwt tokens]
    B --> F[oauth/oidc]
    B --> G[session management]
    
    C --> H[role-based access]
    C --> I[route protection]
    C --> J[component-level guards]
    
    D --> K[xss prevention]
    D --> L[csrf protection]
    D --> M[content security policy]
```

## 10. Testing & Quality Assurance
[design comprehensive testing strategy]

```mermaid
graph LR
    A[testing strategy] --> B[unit tests]
    A --> C[integration tests]
    A --> D[e2e tests]
    A --> E[visual tests]
    
    B --> F[jest/vitest]
    C --> G[react testing library]
    D --> H[cypress/playwright]
    E --> I[chromatic/percy]
```

**CRITICAL REQUIREMENTS FOR COMPREHENSIVE FRONTEND ANALYSIS:**
- Include detailed Mermaid diagrams for ALL architecture components with comprehensive explanations
- Validate all Mermaid syntax for correctness and visual clarity
- Provide in-depth frontend technical analysis beyond basic requirements
- Include comprehensive performance metrics and optimization strategies with specific tools and measurements
- Address mobile-first and responsive design with detailed breakpoint strategies and device considerations
- Provide comprehensive accessibility (a11y) implementation throughout the design with WCAG 2.1 AA compliance
- Include detailed SEO considerations for public-facing apps with Core Web Vitals optimization
- Address comprehensive browser compatibility and progressive enhancement with specific fallback strategies
- Provide detailed implementation guidelines and best practices for each component
- Include real-world examples and case studies where relevant
- Address edge cases, performance bottlenecks, and optimization opportunities
- Provide specific technology stack recommendations with detailed justifications
- Include operational concerns (deployment, monitoring, debugging)
- Address security considerations for frontend applications

**COMPREHENSIVE DOCUMENTATION APPROACH:**
- Assume the reader wants to understand EVERY aspect of frontend architecture in detail
- Don't skip "obvious" implementation details - explain the reasoning behind each decision
- Include multiple alternative approaches and compare them thoroughly
- Provide specific configuration examples and implementation patterns
- Address both technical implementation and user experience considerations
- Include troubleshooting guides and common pitfalls to avoid
- Provide scalable patterns that can grow with the application

**SOURCES:** Include modern frontend architecture patterns, performance optimization techniques, accessibility best practices, and cutting-edge frontend technologies.
                """,
                expected_sections=[
                    "requirements clarification", "high-level frontend architecture", "component architecture design",
                    "state management strategy", "performance optimization", "rendering strategy",
                    "api integration & data flow", "routing & navigation", "security & authentication",
                    "testing & quality assurance"
                ],
                mermaid_types=["graph", "flowchart", "sequencediagram"]
            ),
            
            "ui_component_design": PromptTemplate(
                name="Design System & Component Library Interview",
                category="frontend_system_design",
                description="Design system architecture following interview best practices",
                prompt_template="""
You are a senior design system engineer at a major tech company. Design a comprehensive solution for: {query}

**FOLLOW DESIGN SYSTEM INTERVIEW FORMAT:**

## 1. Requirements & Scope
[understand design system requirements and constraints]

### Functional Requirements
- [component types and use cases]
- [supported platforms (web, mobile, desktop)]
- [team size and usage scale]
- [customization and theming needs]

### Non-Functional Requirements
- [performance targets (bundle size, runtime)]
- [accessibility compliance (wcag 2.1 aa)]
- [browser support matrix]
- [maintenance and versioning]

## 2. Design System Architecture
[design the overall design system structure]

```mermaid
graph TB
    A[design system] --> B[design tokens]
    A --> C[component library]
    A --> D[documentation]
    A --> E[tooling & infrastructure]
    
    B --> F[color palette]
    B --> G[typography scale]
    B --> H[spacing system]
    B --> I[motion/animation]
    
    C --> J[primitive components]
    C --> K[composite components]
    C --> L[layout components]
    C --> M[pattern library]
    
    D --> N[component docs]
    D --> O[design guidelines]
    D --> P[code examples]
    
    E --> Q[build system]
    E --> R[testing framework]
    E --> S[distribution]
```

## 3. Design Token Architecture
[design the token system and theming strategy]

```mermaid
graph LR
    A[brand tokens] --> B[semantic tokens]
    B --> C[component tokens]
    C --> D[css variables]
    
    subgraph "Token Categories"
        E[colors] --> F[primary/secondary]
        E --> G[neutral/semantic]
        H[typography] --> I[font families]
        H --> J[font sizes/weights]
        K[spacing] --> L[base unit]
        K --> M[scale ratios]
    end
    
    subgraph "Platform Output"
        D --> N[web css]
        D --> O[ios tokens]
        D --> P[android tokens]
        D --> Q[design tools]
    end
```

## 4. Component Hierarchy & Composition
[design component structure and relationships]

```mermaid
graph TD
    A[atomic components] --> B[tokens/primitives]
    C[molecular components] --> A
    D[organism components] --> C
    E[template components] --> D
    F[page components] --> E
    
    subgraph "Atomic Level"
        G[button] --> H[colors]
        G --> I[typography]
        G --> J[spacing]
        G --> K[borders]
    end
    
    subgraph "Molecular Level"
        L[form field] --> G
        L --> M[input]
        L --> N[label]
        L --> O[help text]
    end
    
    subgraph "Organism Level"
        P[form] --> L
        P --> Q[form header]
        P --> R[form actions]
    end
```

## 5. Component API Design
[design consistent component interfaces]

```mermaid
graph TB
    A[component api] --> B[props interface]
    A --> C[event handlers]
    A --> D[slot/children pattern]
    A --> E[styling api]
    
    B --> F[required props]
    B --> G[optional props]
    B --> H[variant props]
    
    C --> I[user events]
    C --> J[state changes]
    C --> K[lifecycle events]
    
    E --> L[css classes]
    E --> M[style props]
    E --> N[css-in-js]
```

### Example Component Interface
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary'
  size: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  onClick: (event: MouseEvent) => void
  children: ReactNode
  className?: string
  'data-testid'?: string
}
```

## 6. Theming & Customization
[design theming and brand customization]

```mermaid
graph LR
    A[theme provider] --> B[brand themes]
    A --> C[context themes]
    
    B --> D[light theme]
    B --> E[dark theme]
    B --> F[high contrast]
    
    C --> G[product themes]
    C --> H[white label]
    C --> I[a/b test variants]
    
    subgraph "Theme Structure"
        J[color schemes] --> K[surface colors]
        J --> L[content colors]
        J --> M[border colors]
        N[component overrides] --> O[size variants]
        N --> P[style variants]
    end
```

## 7. Accessibility & Inclusive Design
[ensure comprehensive accessibility]

```mermaid
graph TB
    A[accessibility strategy] --> B[wcag compliance]
    A --> C[semantic html]
    A --> D[aria patterns]
    A --> E[testing framework]
    
    B --> F[level aa]
    B --> G[color contrast]
    B --> H[keyboard navigation]
    
    C --> I[proper elements]
    C --> J[document structure]
    C --> K[form semantics]
    
    D --> L[live regions]
    D --> M[focus management]
    D --> N[screen reader support]
    
    E --> O[automated testing]
    E --> P[manual testing]
    E --> Q[user testing]
```

## 8. Performance & Bundle Optimization
[optimize for performance and bundle size]

```mermaid
graph LR
    A[performance strategy] --> B[tree shaking]
    A --> C[code splitting]
    A --> D[bundle analysis]
    
    B --> E[es modules]
    B --> F[named exports]
    
    C --> G[component chunks]
    C --> H[icon libraries]
    C --> I[theme chunks]
    
    D --> J[size monitoring]
    D --> K[usage analytics]
    D --> L[performance budgets]
```

## 9. Testing & Quality Assurance
[testing strategy]

```mermaid
graph TB
    A[testing strategy] --> B[unit tests]
    A --> C[visual regression]
    A --> D[accessibility tests]
    A --> E[integration tests]
    
    B --> F[component behavior]
    B --> G[api contracts]
    
    C --> H[storybook stories]
    C --> I[chromatic/percy]
    
    D --> J[axe-core]
    D --> K[manual testing]
    
    E --> L[cross-platform]
    E --> M[theme variations]
```

## 10. Distribution & Adoption
[package and distribute the design system]

```mermaid
graph LR
    A[distribution] --> B[npm package]
    A --> C[cdn distribution]
    A --> D[design tool plugins]
    
    B --> E[component library]
    B --> F[token packages]
    B --> G[icon library]
    
    C --> H[umd bundles]
    C --> I[esm bundles]
    
    D --> J[figma plugin]
    D --> K[sketch plugin]
    D --> L[adobe xd]
    
    subgraph "Documentation"
        M[storybook] --> N[component playground]
        M --> O[design guidelines]
        M --> P[code examples]
    end
```

**CRITICAL REQUIREMENTS:**
- All Mermaid diagrams must use correct syntax
- Include comprehensive accessibility considerations
- Address performance and bundle size optimization
- Design for multi-platform consistency
- Include proper versioning and migration strategies
- Consider developer experience and adoption

**SOURCES:** Include design system best practices, accessibility guidelines (WCAG), and component library documentation.
                """,
                expected_sections=[
                    "requirements & scope", "design system architecture", "design token architecture",
                    "component hierarchy & composition", "component api design", "theming & customization",
                    "accessibility & inclusive design", "performance & bundle optimization", 
                    "testing & quality assurance", "distribution & adoption"
                ],
                mermaid_types=["graph", "flowchart"]
            ),
            
            # Backend System Design Prompts
            "microservices_architecture": PromptTemplate(
                name="Backend System Design Interview",
                category="backend_system_design",
                description="Backend microservices design following interview best practices",
                prompt_template="""
You are a principal backend engineer at a FAANG company conducting a system design interview. Design a backend system for: {query}

**FOLLOW BACKEND SYSTEM DESIGN INTERVIEW FORMAT:**

## 1. Requirements Clarification
[gather functional and non-functional requirements]

### Functional Requirements
- [core business logic and features]
- [user actions and system behaviors]
- [data operations (crud)]
- [external integrations]

### Non-Functional Requirements
- [scale: users, requests/sec, data size]
- [performance: latency, throughput]
- [availability: uptime requirements]
- [consistency: acid vs eventual consistency]
- [security: authentication, authorization]

### Scale Estimates
- Daily Active Users: [x million]
- Peak QPS: [x thousand/second]
- Data Storage: [x tb/year]
- Read/Write Ratio: [x:1]

## 2. API Design
[design the external api interface]

```mermaid
graph TB
    A[client applications] --> B[api gateway]
    B --> C[load balancer]
    C --> D[service mesh]
    
    subgraph "API Layer"
        D --> E[user service api]
        D --> F[order service api] 
        D --> G[payment service api]
        D --> H[notification service api]
    end
```

### REST API Endpoints with Detailed Payloads
```typescript
// Authentication & User Management
POST /api/v1/auth/login
Request: {
  email: string;
  password: string;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
  };
}
Response: {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  permissions: string[];
}

POST /api/v1/users
Request: {
  email: string;
  password: string;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  role: 'customer' | 'admin' | 'seller';
}
Response: {
  user: User;
  verificationRequired: boolean;
  verificationToken?: string;
}

GET /api/v1/users/{userId}
Response: {
  user: User;
  stats: {
    totalOrders: number;
    totalSpent: number;
    joinDate: string;
    lastActivity: string;
  };
}

// Product & Inventory Management
GET /api/v1/products?page=1&limit=20&category={category}&minPrice={price}
Response: {
  products: Product[];
  pagination: PaginationMeta;
  filters: {
    categories: Category[];
    priceRange: { min: number; max: number };
    brands: Brand[];
  };
  facets: SearchFacet[];
}

POST /api/v1/products
Request: {
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  inventory: {
    sku: string;
    quantity: number;
    lowStockThreshold: number;
  };
  media: {
    images: ImageUpload[];
    videos?: VideoUpload[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
  };
}

// Order Management
POST /api/v1/orders
Request: {
  items: {
    productId: string;
    quantity: number;
    customizations?: Record<string, any>;
  }[];
  shipping: {
    address: Address;
    method: ShippingMethod;
    instructions?: string;
  };
  payment: {
    method: PaymentMethod;
    billingAddress?: Address;
  };
  promotions?: {
    couponCode?: string;
    discountCode?: string;
  };
}
Response: {
  order: Order;
  payment: {
    status: PaymentStatus;
    paymentUrl?: string;
    paymentIntentId: string;
  };
  fulfillment: {
    estimatedDelivery: string;
    trackingInfo?: TrackingInfo;
  };
}

PUT /api/v1/orders/{orderId}/status
Request: {
  status: OrderStatus;
  reason?: string;
  notifyCustomer: boolean;
  trackingInfo?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
  };
}

// Real-time & Notification APIs
GET /api/v1/orders/{orderId}/status (Server-Sent Events)
Event Data: {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  message: string;
  estimatedTime?: string;
}

WebSocket /ws/notifications/{userId}
Message Types: {
  orderUpdate: OrderUpdateNotification;
  inventoryAlert: InventoryNotification;
  systemAlert: SystemNotification;
  priceAlert: PriceAlertNotification;
}

// Analytics & Reporting
GET /api/v1/analytics/sales?startDate={date}&endDate={date}&granularity={period}
Response: {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  timeSeries: TimeSeriesData[];
  breakdown: {
    byCategory: CategorySales[];
    byRegion: RegionSales[];
    byPaymentMethod: PaymentMethodStats[];
  };
}
```

## 3. High-Level Architecture
[design the overall system architecture]

```mermaid
graph TB
    subgraph "Client Layer"
        A[web app] 
        B[mobile app]
        C[admin dashboard]
    end
    
    subgraph "Gateway Layer"
        D[api gateway/load balancer]
        E[rate limiter]
        F[authentication service]
    end
    
    subgraph "Service Layer"
        G[user service]
        H[order service]
        I[payment service]
        J[notification service]
        K[analytics service]
    end
    
    subgraph "Data Layer"
        L[user db - postgresql]
        M[order db - postgresql] 
        N[payment db - postgresql]
        O[cache - redis]
        P[search - elasticsearch]
        Q[file storage - s3]
    end
    
    subgraph "Message Layer"
        R[message queue - kafka]
        S[event bus]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
    
    G --> L
    H --> M
    I --> N
    G --> O
    H --> O
    I --> O
    H --> P
    J --> Q
    
    H --> R
    I --> R
    J --> R
    R --> S
    S --> K
```

## 4. Database Design
[design data storage and management]

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ ADDRESS : has
    USER ||--o{ PAYMENT_METHOD : owns
    USER ||--o{ REVIEW : writes
    USER ||--o{ CART : has
    
    USER {
        uuid user_id PK
        string email UK
        string username UK
        string password_hash
        string first_name
        string last_name
        string phone
        enum role
        jsonb preferences
        boolean email_verified
        boolean is_active
        timestamp created_at
        timestamp updated_at
        timestamp last_login
    }
    
    ADDRESS {
        uuid address_id PK
        uuid user_id FK
        string type
        string street_address
        string city
        string state
        string postal_code
        string country
        boolean is_default
        timestamp created_at
    }
    
    CATEGORY ||--o{ PRODUCT : contains
    CATEGORY {
        uuid category_id PK
        string name UK
        string slug UK
        text description
        string image_url
        uuid parent_id FK
        integer sort_order
        boolean is_active
    }
    
    PRODUCT ||--o{ ORDER_ITEM : ordered
    PRODUCT ||--o{ CART_ITEM : added_to_cart
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT ||--o{ INVENTORY : tracked
    PRODUCT ||--|| CATEGORY : belongs_to
    
    PRODUCT {
        uuid product_id PK
        string name
        string slug UK
        text description
        text short_description
        decimal price
        decimal compare_price
        string sku UK
        uuid category_id FK
        jsonb attributes
        jsonb images
        jsonb seo_data
        boolean is_active
        boolean is_featured
        integer sort_order
        timestamp created_at
        timestamp updated_at
    }
    
    INVENTORY {
        uuid inventory_id PK
        uuid product_id FK
        integer quantity
        integer reserved_quantity
        integer low_stock_threshold
        string warehouse_location
        timestamp last_updated
    }
    
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER ||--|| PAYMENT : has_payment
    ORDER ||--|| SHIPPING : has_shipping
    ORDER ||--|| USER : placed_by
    ORDER ||--|| ADDRESS : ships_to
    
    ORDER {
        uuid order_id PK
        string order_number UK
        uuid user_id FK
        uuid shipping_address_id FK
        enum status
        enum payment_status
        enum fulfillment_status
        decimal subtotal
        decimal tax_amount
        decimal shipping_cost
        decimal discount_amount
        decimal total_amount
        string currency
        jsonb metadata
        timestamp created_at
        timestamp updated_at
        timestamp shipped_at
        timestamp delivered_at
    }
    
    ORDER_ITEM {
        uuid item_id PK
        uuid order_id FK
        uuid product_id FK
        string product_name
        string product_sku
        integer quantity
        decimal unit_price
        decimal total_price
        jsonb product_snapshot
    }
    
    PAYMENT ||--|| ORDER : pays_for
    PAYMENT {
        uuid payment_id PK
        uuid order_id FK
        string payment_intent_id UK
        string payment_method
        string provider
        enum status
        decimal amount
        string currency
        jsonb provider_data
        timestamp processed_at
        timestamp created_at
    }
    
    SHIPPING {
        uuid shipping_id PK
        uuid order_id FK
        string carrier
        string tracking_number
        string method
        decimal cost
        enum status
        timestamp estimated_delivery
        timestamp actual_delivery
        jsonb tracking_data
    }
    
    CART ||--|| USER : belongs_to
    CART ||--|{ CART_ITEM : contains
    
    CART {
        uuid cart_id PK
        uuid user_id FK
        decimal total_amount
        integer total_items
        timestamp created_at
        timestamp updated_at
        timestamp expires_at
    }
    
    CART_ITEM {
        uuid cart_item_id PK
        uuid cart_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
        timestamp added_at
        timestamp updated_at
    }
    
    REVIEW ||--|| USER : written_by
    REVIEW ||--|| PRODUCT : reviews
    REVIEW ||--|| ORDER : verified_purchase
    
    REVIEW {
        uuid review_id PK
        uuid user_id FK
        uuid product_id FK
        uuid order_id FK
        integer rating
        string title
        text comment
        boolean verified_purchase
        boolean is_approved
        jsonb helpful_votes
        timestamp created_at
        timestamp updated_at
    }
    
    COUPON ||--o{ ORDER : applied_to
    COUPON {
        uuid coupon_id PK
        string code UK
        string name
        text description
        enum type
        decimal value
        decimal minimum_amount
        integer usage_limit
        integer used_count
        timestamp starts_at
        timestamp expires_at
        boolean is_active
    }
```

### Database Strategy
```mermaid
graph LR
    A[database per service] --> B[user db]
    A --> C[order db]
    A --> D[payment db]
    A --> E[analytics db]
    
    F[read replicas] --> G[query distribution]
    H[sharding strategy] --> I[horizontal scaling]
    J[cache layer] --> K[redis cluster]
    
    L[data consistency] --> M[eventual consistency]
    L --> N[saga pattern]
    L --> O[event sourcing]
```

## 5. Microservices Decomposition
[break down into services and define boundaries]

```mermaid
graph TB
    subgraph "User Domain"
        A[user service]
        A1[authentication]
        A2[profile management]
        A3[preferences]
    end
    
    subgraph "Order Domain"  
        B[order service]
        B1[order management]
        B2[inventory check]
        B3[order status]
    end
    
    subgraph "Payment Domain"
        C[payment service]
        C1[payment processing]
        C2[billing]
        C3[refunds]
    end
    
    subgraph "Communication Domain"
        D[notification service]
        D1[email service]
        D2[sms service]
        D3[push notifications]
    end
    
    subgraph "Cross-Cutting"
        E[api gateway]
        F[config service]
        G[logging service]
        H[monitoring service]
    end
```

## 6. Inter-Service Communication
[design communication patterns]

```mermaid
sequenceDiagram
    participant U as User
    participant AG as API Gateway
    participant OS as Order Service
    participant PS as Payment Service
    participant NS as Notification Service
    participant MQ as Message Queue
    
    U->>AG: Create Order Request
    AG->>OS: POST /orders
    OS->>OS: Validate & Create Order
    OS->>MQ: Publish OrderCreated Event
    OS->>AG: Return Order ID
    AG->>U: Order Created Response
    
    MQ->>PS: OrderCreated Event
    PS->>PS: Process Payment
    PS->>MQ: Publish PaymentProcessed Event
    
    MQ->>OS: PaymentProcessed Event
    OS->>OS: Update Order Status
    OS->>MQ: Publish OrderConfirmed Event
    
    MQ->>NS: OrderConfirmed Event
    NS->>U: Send Confirmation Email
```

### Communication Patterns
```mermaid
graph LR
    A[synchronous] --> B[rest apis]
    A --> C[graphql]
    A --> D[grpc]
    
    E[asynchronous] --> F[message queues]
    E --> G[event streaming]
    E --> H[pub/sub]
    
    I[patterns] --> J[request-response]
    I --> K[event-driven]
    I --> L[cqrs]
    I --> M[saga pattern]
```

## 7. Scalability & Performance
[address scaling challenges]

```mermaid
graph TB
    A[horizontal scaling] --> B[load balancers]
    A --> C[service replicas]
    A --> D[database sharding]
    A --> E[caching strategy]
    
    B --> F[round robin]
    B --> G[least connections]
    B --> H[health-based]
    
    C --> I[auto-scaling groups]
    C --> J[container orchestration]
    
    D --> K[user-based sharding]
    D --> L[geographic sharding]
    
    E --> M[redis cluster]
    E --> N[cdn for static assets]
    E --> O[application-level cache]
```

### Performance Optimization
```mermaid
graph LR
    A[database optimization] --> B[indexing strategy]
    A --> C[query optimization]
    A --> D[connection pooling]
    
    E[caching strategy] --> F[l1: application cache]
    E --> G[l2: redis cache]
    E --> H[l3: cdn cache]
    
    I[async processing] --> J[background jobs]
    I --> K[message queues]
    I --> L[event-driven updates]
```

## 8. Reliability & Fault Tolerance
[design for high availability]

```mermaid
graph TB
    A[fault tolerance] --> B[circuit breaker]
    A --> C[retry logic]
    A --> D[bulkhead pattern]
    A --> E[graceful degradation]
    
    B --> F[open/closed/half-open]
    C --> G[exponential backoff]
    D --> H[resource isolation]
    E --> I[fallback responses]
    
    J[high availability] --> K[multi-az deployment]
    J --> L[health checks]
    J --> M[auto-failover]
    
    N[data resilience] --> O[replication]
    N --> P[backup strategy]
    N --> Q[disaster recovery]
```

## 9. Security Architecture
[implement comprehensive security]

```mermaid
graph TB
    A[security layers] --> B[api gateway security]
    A --> C[service-to-service auth]
    A --> D[data protection]
    
    B --> E[rate limiting]
    B --> F[jwt validation]
    B --> G[oauth 2.0/oidc]
    
    C --> H[service mesh mtls]
    C --> I[api keys]
    C --> J[rbac]
    
    D --> K[encryption at rest]
    D --> L[encryption in transit]
    D --> M[pii protection]
    
    N[network security] --> O[vpc/subnets]
    N --> P[security groups]
    N --> Q[waf]
```

## 10. Monitoring & Observability
[implement comprehensive monitoring]

```mermaid
graph LR
    A[observability] --> B[metrics]
    A --> C[logging]  
    A --> D[tracing]
    A --> E[alerting]
    
    B --> F[prometheus]
    B --> G[business metrics]
    B --> H[infrastructure metrics]
    
    C --> I[structured logging]
    C --> J[centralized logs]
    C --> K[log aggregation]
    
    D --> L[distributed tracing]
    D --> M[request flow]
    D --> N[performance bottlenecks]
    
    E --> O[threshold alerts]
    E --> P[anomaly detection]
    E --> Q[on-call rotation]
```

**CRITICAL REQUIREMENTS:**
- All Mermaid diagrams must use correct syntax
- Address data consistency patterns (Saga, Event Sourcing)
- Include comprehensive error handling and retry logic
- Design for eventual consistency where appropriate
- Include service mesh considerations for large-scale deployments
- Address deployment strategies (blue-green, canary)

**SOURCES:** Include microservices patterns, distributed systems principles, and cloud-native best practices.
                """,
                expected_sections=[
                    "requirements clarification", "api design", "high-level architecture",
                    "database design", "microservices decomposition", "inter-service communication",
                    "scalability & performance", "reliability & fault tolerance", "security architecture",
                    "monitoring & observability"
                ],
                mermaid_types=["graph", "erdiagram", "sequencediagram", "flowchart"]
            ),
            
            "database_design": PromptTemplate(
                name="Database System Design Interview",
                category="backend_system_design",
                description="Database architecture design following interview best practices",
                prompt_template="""
You are a senior database engineer at a tech company conducting a database design interview. Design a database system for: {query}

**FOLLOW DATABASE DESIGN INTERVIEW FORMAT:**

## 1. Requirements Analysis
[understand data requirements and constraints]

### Data Requirements
- [types of data to store]
- [data relationships and entities]
- [data access patterns]
- [data volume and growth projections]

### Performance Requirements
- [read/write ratio]
- [query patterns and frequency]
- [response time requirements]
- [concurrent user load]

### Consistency Requirements
- [acid vs eventual consistency needs]
- [data integrity constraints]
- [conflict resolution strategies]

## 2. Database Technology Selection
[choose appropriate database technologies]

```mermaid
graph TB
    A[database selection] --> B[relational - acid]
    A --> C[nosql - scale]
    A --> D[newsql - best of both]
    A --> E[specialized stores]
    
    B --> F[postgresql]
    B --> G[mysql]
    B --> H[oracle]
    
    C --> I[document - mongodb]
    C --> J[key-value - redis]
    C --> K[wide column - cassandra]
    C --> L[graph - neo4j]
    
    D --> M[cockroachdb]
    D --> N[google spanner]
    
    E --> O[time series - influxdb]
    E --> P[search - elasticsearch]
    E --> Q[cache - redis]
```

### Selection Criteria
```mermaid
graph LR
    A[selection factors] --> B[data structure]
    A --> C[scale requirements]
    A --> D[consistency needs]
    A --> E[query patterns]
    
    B --> F[structured/semi/unstructured]
    C --> G[horizontal/vertical scaling]
    D --> H[strong/eventual consistency]
    E --> I[oltp/olap/mixed]
```

## 3. Schema Design & Data Modeling
[design the database schema and relationships]

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER {
        uuid user_id PK
        string email UK
        string username
        string first_name
        string last_name
        string password_hash
        jsonb preferences
        timestamp created_at
        timestamp updated_at
        timestamp last_login
    }
    
    PRODUCT ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT {
        uuid product_id PK
        string name
        text description
        decimal price
        integer stock_quantity
        string category
        jsonb attributes
        uuid seller_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER ||--|| PAYMENT : has_payment
    ORDER {
        uuid order_id PK
        uuid user_id FK
        enum status
        decimal total_amount
        decimal tax_amount
        decimal shipping_cost
        jsonb shipping_address
        timestamp created_at
        timestamp updated_at
        timestamp shipped_at
    }
    
    ORDER_ITEM {
        uuid item_id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
        decimal total_price
    }
    
    REVIEW {
        uuid review_id PK
        uuid user_id FK
        uuid product_id FK
        integer rating
        text comment
        boolean verified_purchase
        timestamp created_at
    }
    
    PAYMENT {
        uuid payment_id PK
        uuid order_id FK
        string payment_method
        enum status
        decimal amount
        string transaction_id
        timestamp processed_at
    }
```

### Indexing Strategy
```mermaid
graph TB
    A[index strategy] --> B[primary indexes]
    A --> C[secondary indexes]
    A --> D[composite indexes]
    A --> E[partial indexes]
    
    B --> F[primary keys]
    B --> G[unique constraints]
    
    C --> H[foreign keys]
    C --> I[query optimization]
    
    D --> J[multi-column queries]
    D --> K[sort optimization]
    
    E --> L[filtered conditions]
    E --> M[sparse data]
```

## 4. Scalability Architecture
[design for horizontal and vertical scaling]

```mermaid
graph TB
    subgraph "Read Scaling"
        A[master db] --> B[read replica 1]
        A --> C[read replica 2]
        A --> D[read replica 3]
        E[read load balancer] --> B
        E --> C
        E --> D
    end
    
    subgraph "Write Scaling"
        F[application] --> G[shard router]
        G --> H[shard 1]
        G --> I[shard 2]
        G --> J[shard 3]
        G --> K[shard n]
    end
    
    subgraph "Caching Layer"
        L[application cache] --> M[redis cluster]
        M --> N[cache node 1]
        M --> O[cache node 2]
        M --> P[cache node 3]
    end
```

### Sharding Strategy
```mermaid
graph LR
    A[sharding methods] --> B[range-based]
    A --> C[hash-based]
    A --> D[directory-based]
    A --> E[geographic]
    
    B --> F[user id ranges]
    C --> G[consistent hashing]
    D --> H[lookup service]
    E --> I[regional deployment]
    
    J[sharding key selection] --> K[high cardinality]
    J --> L[even distribution]
    J --> M[query locality]
```

## 5. Data Consistency & Transactions
[handle consistency and transaction requirements]

```mermaid
graph TB
    A[consistency models] --> B[strong consistency]
    A --> C[eventual consistency]
    A --> D[causal consistency]
    
    B --> E[acid transactions]
    B --> F[synchronous replication]
    
    C --> G[asynchronous replication]
    C --> H[conflict resolution]
    
    D --> I[vector clocks]
    D --> J[causal dependencies]
    
    K[distributed transactions] --> L[2pc]
    K --> M[saga pattern]
    K --> N[tcc pattern]
```

### Transaction Patterns
```mermaid
sequenceDiagram
    participant A as Application
    participant DB1 as User DB
    participant DB2 as Order DB
    participant DB3 as Payment DB
    participant S as Saga Coordinator
    
    A->>S: Start Order Transaction
    S->>DB1: Reserve User Credit
    S->>DB2: Create Order
    S->>DB3: Process Payment
    
    alt Success
        S->>DB1: Confirm Credit
        S->>DB2: Confirm Order
        S->>DB3: Confirm Payment
        S->>A: Transaction Success
    else Failure
        S->>DB3: Rollback Payment
        S->>DB2: Rollback Order
        S->>DB1: Rollback Credit
        S->>A: Transaction Failed
    end
```

## 6. Performance Optimization
[optimize database performance]

```mermaid
graph TB
    A[performance optimization] --> B[query optimization]
    A --> C[index optimization]
    A --> D[connection management]
    A --> E[caching strategy]
    
    B --> F[query analysis]
    B --> G[execution plans]
    B --> H[query rewriting]
    
    C --> I[index types]
    C --> J[index maintenance]
    C --> K[covering indexes]
    
    D --> L[connection pooling]
    D --> M[prepared statements]
    D --> N[connection limits]
    
    E --> O[result caching]
    E --> P[query caching]
    E --> Q[object caching]
```

### Caching Architecture
```mermaid
graph LR
    A[application] --> B[l1: application cache]
    B --> C[l2: redis cache]
    C --> D[l3: database query cache]
    D --> E[database]
    
    F[cache patterns] --> G[cache-aside]
    F --> H[write-through]
    F --> I[write-behind]
    F --> J[refresh-ahead]
```

## 7. Backup & Disaster Recovery
[implement data protection and recovery]

```mermaid
graph TB
    A[backup strategy] --> B[full backups]
    A --> C[incremental backups]
    A --> D[point-in-time recovery]
    A --> E[cross-region replication]
    
    B --> F[weekly schedule]
    C --> G[daily/hourly deltas]
    D --> H[transaction log replay]
    E --> I[geographic distribution]
    
    J[recovery objectives] --> K[rto: recovery time]
    J --> L[rpo: data loss tolerance]
    
    M[disaster recovery] --> N[hot standby]
    M --> O[warm standby]
    M --> P[cold standby]
```

## 8. Security & Compliance
[implement database security measures]

```mermaid
graph TB
    A[database security] --> B[access control]
    A --> C[data encryption]
    A --> D[audit & monitoring]
    A --> E[compliance]
    
    B --> F[authentication]
    B --> G[authorization/rbac]
    B --> H[network security]
    
    C --> I[encryption at rest]
    C --> J[encryption in transit]
    C --> K[key management]
    
    D --> L[access logs]
    D --> M[query monitoring]
    D --> N[anomaly detection]
    
    E --> O[gdpr/pii protection]
    E --> P[sox compliance]
    E --> Q[hipaa requirements]
```

## 9. Monitoring & Observability
[implement comprehensive database monitoring]

```mermaid
graph LR
    A[database monitoring] --> B[performance metrics]
    A --> C[health monitoring]
    A --> D[capacity planning]
    A --> E[alerting]
    
    B --> F[query performance]
    B --> G[connection metrics]
    B --> H[resource utilization]
    
    C --> I[replication lag]
    C --> J[error rates]
    C --> K[availability]
    
    D --> L[storage growth]
    D --> M[capacity thresholds]
    D --> N[performance trends]
    
    E --> O[sla violations]
    E --> P[resource alerts]
    E --> Q[failure detection]
```

## 10. Migration & Evolution Strategy
[plan for schema changes and migrations]

```mermaid
graph TB
    A[schema evolution] --> B[backward compatible]
    A --> C[non-breaking changes]
    A --> D[breaking changes]
    
    B --> E[add columns]
    B --> F[add indexes]
    B --> G[add tables]
    
    C --> H[modify constraints]
    C --> I[rename columns]
    
    D --> J[remove columns]
    D --> K[change data types]
    D --> L[multi-phase migration]
    
    M[migration strategy] --> N[blue-green deployment]
    M --> O[rolling updates]
    M --> P[shadow migration]
```

**CRITICAL REQUIREMENTS:**
- All Mermaid diagrams must use correct syntax
- Include comprehensive indexing strategy
- Address both SQL and NoSQL considerations
- Design for data consistency and integrity
- Include monitoring and alerting for database health
- Consider compliance and security requirements

**SOURCES:** Include database design patterns, scalability best practices, and performance optimization guides.
                """,
                expected_sections=[
                    "requirements analysis", "database technology selection", "schema design & data modeling",
                    "scalability architecture", "data consistency & transactions", "performance optimization",
                    "backup & disaster recovery", "security & compliance", "monitoring & observability",
                    "migration & evolution strategy"
                ],
                mermaid_types=["erdiagram", "graph", "sequencediagram", "flowchart"]
            ),
            
            # System Design Interview Prompts
            "system_design_interview": PromptTemplate(
                name="System Design Interview Analysis",
                category="system_design_interview",
                description="Comprehensive system design following interview best practices",
                prompt_template="""
You are a senior system architect creating comprehensive technical documentation. Provide an in-depth analysis of the following system design: {query}

**COMPREHENSIVE SYSTEM DESIGN ANALYSIS - DETAILED NOTES FORMAT:**

## 1. Problem Understanding & Requirements Gathering
[thoroughly analyze the problem scope and gather all functional/non-functional requirements with detailed explanations]

### Functional Requirements
- [list all core features and functionalities with detailed descriptions]
- [include user stories and use cases for each feature]
- [describe edge cases and special scenarios]
- [consider future feature extensions and scalability needs]

### Non-Functional Requirements  
- [detailed scale, performance, availability, consistency requirements with justifications]
- **User Scale Analysis:**
  - Current user base estimation with growth projections
  - Geographic distribution and usage patterns
  - Peak vs average load considerations
- **Performance Requirements:**
  - Detailed QPS analysis by feature/endpoint
  - Latency requirements for different operations
  - Throughput expectations
- **Storage Requirements:**
  - Comprehensive data storage estimates with growth
  - Different data types and retention policies
  - Backup and archival requirements
- **Availability & Reliability:**
  - Uptime requirements (99.9%, 99.99%, etc.)
  - Disaster recovery expectations
  - Failover and fault tolerance needs

## 2. Capacity Estimation & Constraints
[perform detailed capacity planning with comprehensive calculations and multiple scenarios]

### Traffic Estimates
```mermaid
graph LR
    A[daily active users] --> B[requests per day]
    B --> C[requests per second]
    C --> D[peak qps]
```

### Storage Estimates
```mermaid
graph TD
    A[data per user] --> B[total users]
    B --> C[total storage]
    C --> D[storage with replication]
```

## 3. High-Level System Design
[design the overall system architecture with comprehensive component analysis]

```mermaid
graph TB
    A[client apps] --> B[load balancer]
    B --> C[api gateway]
    C --> D[application servers]
    D --> E[cache layer]
    D --> F[database]
    D --> G[message queue]
    G --> H[background services]
```

## 4. Database Design
[design comprehensive data model and database schema with detailed analysis]

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER {
        int user_id
        string username
        string email
    }
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER {
        int order_id
        int user_id
        datetime created_at
    }
```

## 5. API Design
[define comprehensive api specifications and contracts with detailed payloads]

### REST API Endpoints
```
POST /api/v1/users
GET /api/v1/users/{user_id}
POST /api/v1/orders
GET /api/v1/orders/{order_id}
```

## 6. Detailed Component Design
[deep dive into all critical components with implementation details]

### Core Service Architecture
```mermaid
graph TB
    subgraph "Service Layer"
        A[user service]
        B[order service]
        C[payment service]
        D[notification service]
    end
    
    subgraph "Data Layer"
        E[user db]
        F[order db]
        G[cache]
    end
    
    A --> E
    B --> F
    A --> G
    B --> G
```

## 7. Scalability & Performance
[analysis of scaling challenges, optimizations, and performance strategies]

### Scaling Strategy
```mermaid
graph LR
    A[horizontal scaling] --> B[load balancers]
    A --> C[database sharding]
    A --> D[microservices]
    E[vertical scaling] --> F[resource optimization]
    G[caching] --> H[redis/memcached]
    G --> I[cdn]
```

## 8. Reliability & Fault Tolerance
[design for high availability, fault tolerance, and disaster recovery]

### Fault Tolerance Mechanisms
```mermaid
graph TD
    A[circuit breaker] --> B[fallback mechanisms]
    C[health checks] --> D[auto-scaling]
    E[data replication] --> F[multi-az deployment]
    G[monitoring] --> H[alerting]
```

## 9. Security Considerations
[security analysis with detailed implementation strategies]

### Security Framework
```mermaid
graph TB
    A[authentication] --> B[jwt/oauth]
    C[authorization] --> D[rbac]
    E[data protection] --> F[encryption]
    G[network security] --> H[https/vpn]
```

## 10. Monitoring & Observability
[monitoring, logging, and observability strategy with detailed implementation]

```mermaid
graph LR
    A[application metrics] --> B[prometheus]
    C[logs] --> D[elk stack]
    E[traces] --> F[jaeger]
    B --> G[grafana]
    D --> G
    F --> G
```

**CRITICAL REQUIREMENTS FOR COMPREHENSIVE ANALYSIS:**
- Include detailed Mermaid diagrams for ALL architecture components with comprehensive explanations
- Validate all Mermaid syntax for correctness and visual clarity
- Provide in-depth technical analysis beyond interview-level requirements
- Address scalability from Day 1 to 100M+ users with detailed growth stages
- Consider and compare multiple database solutions (SQL, NoSQL, NewSQL, Graph, etc.)
- Include comprehensive load balancing, caching, and performance optimization strategies
- Provide detailed implementation guidelines and best practices
- Include real-world examples and case studies where relevant
- Address edge cases, failure scenarios, and recovery strategies
- Provide detailed capacity planning with mathematical calculations
- Include technology stack recommendations with justifications
- Address operational concerns (deployment, maintenance, monitoring)
- Consider regulatory compliance and data privacy requirements
- Include cost optimization strategies and trade-off analysis

**COMPREHENSIVE DOCUMENTATION APPROACH:**
- Assume the reader wants to understand EVERY aspect in detail
- Don't skip "obvious" details - explain the reasoning behind decisions
- Include multiple alternative approaches and compare them
- Provide specific configuration examples and implementation details
- Address both technical and business considerations
- Include troubleshooting guides and common pitfalls

**SOURCES:** Include system design best practices, real-world architecture patterns, industry case studies, and cutting-edge technologies.
                """,
                expected_sections=[
                    "problem understanding & requirements gathering", "capacity estimation & constraints",
                    "high-level system design", "database design", "api design", "detailed component design",
                    "scalability & performance", "reliability & fault tolerance", "security considerations",
                    "monitoring & observability"
                ],
                mermaid_types=["graph", "erdiagram", "flowchart", "sequencediagram", "gitgraph"]
            )
        }
    
    def get_prompt_by_name(self, name: str) -> Optional[PromptTemplate]:
        """Get a specific prompt by name"""
        return self.prompts.get(name)
    
    def get_prompts_by_category(self, category: str) -> List[PromptTemplate]:
        """Get all prompts in a specific category"""
        return [prompt for prompt in self.prompts.values() if prompt.category == category]
    
    def list_all_prompts(self) -> Dict[str, PromptTemplate]:
        """Get all available prompts"""
        return self.prompts.copy()
    
    def get_categories(self) -> List[str]:
        """Get all available categories"""
        return list(set(prompt.category for prompt in self.prompts.values()))
    
    def auto_select_prompt(self, query: str) -> PromptTemplate:
        """Automatically select the best prompt based on query content"""
        query_lower = query.lower()
        
        # System design interview keywords (highest priority)
        if any(keyword in query_lower for keyword in [
            'system design', 'design a system', 'architecture for', 'build a system',
            'scalable system', 'distributed system', 'design interview'
        ]):
            return self.prompts['system_design_interview']
        
        # Frontend-related keywords
        elif any(keyword in query_lower for keyword in [
            'frontend', 'ui', 'ux', 'react', 'vue', 'angular', 'component', 
            'design system', 'responsive', 'client-side', 'browser', 'web app'
        ]):
            if any(keyword in query_lower for keyword in ['component', 'design system', 'ui component', 'library']):
                return self.prompts['ui_component_design']
            return self.prompts['frontend_architecture']
        
        # Database-related keywords (check before backend to catch specific DB queries)
        elif any(keyword in query_lower for keyword in [
            'database', 'db ', 'sql', 'nosql', 'data model', 'schema',
            'postgres', 'mysql', 'mongodb', 'redis', 'data storage', 'orm',
            'database architecture', 'database design', 'data architecture'
        ]):
            return self.prompts['database_design']
        
        # Backend-related keywords
        elif any(keyword in query_lower for keyword in [
            'backend', 'microservices', 'api', 'server', 'service', 
            'distributed', 'scalability', 'performance', 'rest api', 'graphql'
        ]):
            return self.prompts['microservices_architecture']
        
        # Default to system design interview for comprehensive analysis
        else:
            return self.prompts['system_design_interview']
    
    def format_prompt(self, prompt_name: str, query: str) -> str:
        """Format a prompt template with the given query"""
        prompt = self.get_prompt_by_name(prompt_name)
        if not prompt:
            raise ValueError(f"Prompt '{prompt_name}' not found")
        
        return prompt.prompt_template.format(query=query)


# Convenience functions
def get_research_prompts() -> ResearchPromptsLibrary:
    """Get the research prompts library instance"""
    return ResearchPromptsLibrary()


def auto_select_and_format_prompt(query: str) -> tuple[str, PromptTemplate]:
    """Automatically select and format the best prompt for a query"""
    library = ResearchPromptsLibrary()
    selected_prompt = library.auto_select_prompt(query)
    formatted_prompt = library.format_prompt(selected_prompt.name, query)
    return formatted_prompt, selected_prompt


if __name__ == "__main__":
    # Example usage and testing
    library = ResearchPromptsLibrary()
    
    print("🧪 Research Prompts Library Test")
    print("=" * 50)
    
    # Test auto-selection
    test_queries = [
        "how to design a scalable react component library",
        "system design for a ride-sharing application like uber", 
        "database design for a social media platform with user data and posts",
        "backend microservices for an e-commerce system",
        "frontend architecture for a video streaming platform",
        "design system for a multi-platform design library"
    ]
    
    for query in test_queries:
        selected = library.auto_select_prompt(query)
        print(f"Query: {query}")
        print(f"Selected: {selected.name} ({selected.category})")
        print("-" * 30)
    
    print(f"\n📊 Available Categories: {library.get_categories()}")
    print(f"📝 Total Prompts: {len(library.list_all_prompts())}")