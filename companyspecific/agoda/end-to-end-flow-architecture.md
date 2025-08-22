# End-to-End Flow Architecture for Hotel Search and Booking

## Question
Explain the end-to-end flow of a user action (e.g., searching and booking a hotel) and architect the frontend for fast, scalable, and error-resilient UX.

## Introduction
This document outlines the complete end-to-end flow of user interactions in a hotel booking platform like Agoda, from initial search to successful booking completion. We'll focus on frontend architecture that ensures optimal performance, scalability, and error handling while providing a seamless user experience.

## 1. Complete User Journey Flow

### Phase 1: Discovery & Search
```
User Landing → Search Input → Search Results → Filters → Property Selection
```

### Phase 2: Property Evaluation
```
Property Details → Room Selection → Price Comparison → Reviews → Amenities
```

### Phase 3: Booking Process
```
Date Selection → Guest Details → Payment Method → Booking Confirmation
```

### Phase 4: Post-Booking
```
Confirmation Email → Booking Management → Pre-arrival Communication
```

## 2. Detailed End-to-End Flow Architecture

### 2.1 Search Flow (Phase 1)

#### Frontend Components Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Search Bar    │───▶│  Auto-complete  │───▶│ Search Results  │
│   Component     │    │   Service       │    │    Page         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Location API   │    │  Suggestion     │    │   Filter Panel  │
│     Call        │    │   Cache         │    │   Component     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Detailed Frontend Component Implementation

```typescript
// components/pages/SearchPage/SearchPage.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';
import { FilterPanel } from './components/FilterPanel';
import { SearchMap } from './components/SearchMap';
import { useSearchResults } from '../../../hooks/useSearchResults';
import { useSearchFilters } from '../../../hooks/useSearchFilters';
import { searchActions } from '../../../store/slices/searchSlice';

interface SearchPageProps {
  initialFilters?: SearchFilters;
  preloadedResults?: SearchResult[];
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialFilters,
  preloadedResults
}) => {
  const router = useRouter();
  
  // Generic state management - no library dependency
  const {
    results,
    loading,
    error,
    pagination,
    filters,
    query: searchQuery,
    performSearch,
    loadMoreResults,
    refreshResults,
    updateFilters,
    clearFilters,
    addToFavorites
  } = useSearchResults();

  const {
    activeFiltersCount
  } = useSearchFilters();

  // Search state management
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Handle search form submission
  const handleSearch = useCallback(async (searchParams: SearchParams) => {
    // Update URL with search parameters
    const query = {
      destination: searchParams.destination.id,
      checkin: searchParams.dates.checkin.toISOString().split('T')[0],
      checkout: searchParams.dates.checkout.toISOString().split('T')[0],
      guests: searchParams.guests.adults,
      children: searchParams.guests.children,
      rooms: searchParams.guests.rooms,
    };

    // Update URL without causing a page refresh
    router.push(
      {
        pathname: '/search',
        query,
      },
      undefined,
      { shallow: true }
    );

    // Perform search with generic state management
    await performSearch(searchParams);
  }, [router, performSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    updateFilters(newFilters);
    
    // Update URL to reflect filters
    const updatedQuery = {
      ...router.query,
      ...convertFiltersToQuery(newFilters),
    };
    
    router.push(
      {
        pathname: '/search',
        query: updatedQuery,
      },
      undefined,
      { shallow: true }
    );
  }, [updateFilters, router]);

  // Handle sort change
  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
    // Could dispatch a generic sort action or handle in component state
    refreshResults();
  }, [refreshResults]);

  // Initialize search from URL parameters
  useEffect(() => {
    if (router.isReady && router.query.destination) {
      const searchParams = parseUrlToSearchParams(router.query);
      if (searchParams) {
        handleSearch(searchParams);
      }
    }
  }, [router.isReady, router.query, handleSearch]);

  return (
    <div className="search-page">
      {/* Header with search form */}
      <div className="search-header">
        <SearchForm
          initialValues={searchQuery}
          onSearch={handleSearch}
          loading={loading}
        />
      </div>

      <div className="search-content">
        {/* Left sidebar - Filters */}
        <aside 
          className={`search-filters ${showMobileFilters ? 'mobile-open' : ''}`}
        >
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            activeCount={activeFiltersCount}
            loading={loading}
          />
        </aside>

        {/* Main content area */}
        <main className="search-main">
          {/* Search controls */}
          <div className="search-controls">
            <div className="search-info">
              <span className="results-count">
                {results.length} properties found
              </span>
              {searchQuery.destination && (
                <span className="search-location">
                  in {searchQuery.destination.name}
                </span>
              )}
            </div>

            <div className="search-actions">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="sort-select"
              >
                <option value="relevance">Best Match</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Guest Rating</option>
                <option value="distance">Distance</option>
              </select>

              {/* View mode toggle */}
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  ⊞
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  ☰
                </button>
                <button
                  className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                  aria-label="Map view"
                >
                  🗺
                </button>
              </div>

              {/* Mobile filter toggle */}
              <button
                className="mobile-filter-btn"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                Filters ({activeFiltersCount})
              </button>
            </div>
          </div>

          {/* Results area */}
          <div className="search-results-container">
            {viewMode === 'map' ? (
              <SearchMap
                properties={results}
                filters={filters}
                onPropertySelect={(property) => {
                  router.push(`/property/${property.id}`);
                }}
                onMapMove={handleFilterChange}
              />
            ) : (
              <SearchResults
                properties={results}
                viewMode={viewMode}
                loading={loading}
                error={error}
                onLoadMore={loadMoreResults}
                hasMore={pagination.hasMore}
                onPropertySelect={(property) => {
                  // Track analytics
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'property_view', {
                      property_id: property.id,
                      search_destination: searchQuery.destination?.name,
                      search_position: results.indexOf(property) + 1,
                    });
                  }
                  
                  router.push(`/property/${property.id}`);
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
```

#### Advanced Search Form Component

```typescript
// components/molecules/SearchForm/SearchForm.tsx
import React, { useState, useCallback, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DateRangePicker } from '../DateRangePicker';
import { LocationSearchBox } from '../LocationSearchBox';
import { GuestSelector } from '../GuestSelector';
import { useSearchSuggestions } from '../../../hooks/useSearchSuggestions';

const searchValidationSchema = Yup.object({
  destination: Yup.object().required('Please select a destination'),
  dates: Yup.object({
    checkin: Yup.date().required('Check-in date is required'),
    checkout: Yup.date()
      .required('Check-out date is required')
      .min(Yup.ref('checkin'), 'Check-out must be after check-in'),
  }),
  guests: Yup.object({
    adults: Yup.number().min(1, 'At least 1 adult required').max(10),
    children: Yup.number().min(0).max(10),
    rooms: Yup.number().min(1).max(5),
  }),
});

interface SearchFormProps {
  initialValues?: Partial<SearchParams>;
  onSearch: (params: SearchParams) => void;
  loading?: boolean;
  className?: string;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  initialValues,
  onSearch,
  loading = false,
  className
}) => {
  const [showGuestSelector, setShowGuestSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Form state management with Formik
  const formik = useFormik({
    initialValues: {
      destination: initialValues?.destination || null,
      dates: {
        checkin: initialValues?.dates?.checkin || null,
        checkout: initialValues?.dates?.checkout || null,
      },
      guests: {
        adults: initialValues?.guests?.adults || 2,
        children: initialValues?.guests?.children || 0,
        rooms: initialValues?.guests?.rooms || 1,
      },
    },
    validationSchema: searchValidationSchema,
    onSubmit: (values) => {
      if (values.destination && values.dates.checkin && values.dates.checkout) {
        onSearch(values as SearchParams);
      }
    },
  });

  // Auto-suggestions for location
  const {
    suggestions,
    loading: suggestionsLoading,
    error: suggestionsError,
  } = useSearchSuggestions();

  const handleLocationSelect = useCallback((location: Destination) => {
    formik.setFieldValue('destination', location);
    
    // Auto-focus on dates if location is selected
    if (!formik.values.dates.checkin) {
      setShowDatePicker(true);
    }
  }, [formik]);

  const handleDateSelect = useCallback((dates: { checkin: Date; checkout: Date }) => {
    formik.setFieldValue('dates', dates);
    setShowDatePicker(false);
  }, [formik]);

  const handleGuestChange = useCallback((guests: GuestConfig) => {
    formik.setFieldValue('guests', guests);
    setShowGuestSelector(false);
  }, [formik]);

  // Quick date shortcuts
  const dateShortcuts = [
    { label: 'This Weekend', days: { start: 5, end: 7 } }, // Fri-Sun
    { label: 'Next Weekend', days: { start: 12, end: 14 } },
    { label: '1 Week', days: { start: 0, end: 7 } },
    { label: '2 Weeks', days: { start: 0, end: 14 } },
  ];

  const handleDateShortcut = useCallback((shortcut: { start: number; end: number }) => {
    const checkin = new Date();
    checkin.setDate(checkin.getDate() + shortcut.start);
    
    const checkout = new Date();
    checkout.setDate(checkout.getDate() + shortcut.end);
    
    formik.setFieldValue('dates', { checkin, checkout });
  }, [formik]);

  return (
    <form
      ref={formRef}
      onSubmit={formik.handleSubmit}
      className={`search-form ${className}`}
      noValidate
    >
      <div className="search-fields">
        {/* Location field */}
        <div className="search-field location-field">
          <label htmlFor="destination" className="field-label">
            Where
          </label>
          <LocationSearchBox
            value={formik.values.destination}
            onSelect={handleLocationSelect}
            suggestions={suggestions}
            loading={suggestionsLoading}
            error={suggestionsError}
            placeholder="City, hotel, or landmark"
            className={formik.errors.destination ? 'error' : ''}
          />
          {formik.errors.destination && (
            <span className="error-message">
              {formik.errors.destination as string}
            </span>
          )}
        </div>

        {/* Date fields */}
        <div className="search-field date-field">
          <label className="field-label">When</label>
          <div 
            className="date-input-container"
            onClick={() => setShowDatePicker(true)}
          >
            <div className="date-display">
              {formik.values.dates.checkin ? (
                <>
                  <span className="checkin-date">
                    {formik.values.dates.checkin.toLocaleDateString()}
                  </span>
                  <span className="date-separator">-</span>
                  <span className="checkout-date">
                    {formik.values.dates.checkout?.toLocaleDateString() || 'Select checkout'}
                  </span>
                </>
              ) : (
                <span className="date-placeholder">Select dates</span>
              )}
            </div>
          </div>
          
          {showDatePicker && (
            <div className="date-picker-overlay">
              <div className="date-picker-container">
                {/* Quick shortcuts */}
                <div className="date-shortcuts">
                  {dateShortcuts.map((shortcut) => (
                    <button
                      key={shortcut.label}
                      type="button"
                      className="date-shortcut-btn"
                      onClick={() => handleDateShortcut(shortcut.days)}
                    >
                      {shortcut.label}
                    </button>
                  ))}
                </div>
                
                <DateRangePicker
                  startDate={formik.values.dates.checkin}
                  endDate={formik.values.dates.checkout}
                  onSelect={handleDateSelect}
                  onClose={() => setShowDatePicker(false)}
                  minDate={new Date()}
                  maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year
                />
              </div>
            </div>
          )}
          
          {formik.errors.dates && (
            <span className="error-message">
              {typeof formik.errors.dates === 'string' 
                ? formik.errors.dates 
                : 'Please select valid dates'
              }
            </span>
          )}
        </div>

        {/* Guest selector */}
        <div className="search-field guest-field">
          <label className="field-label">Who</label>
          <div
            className="guest-input-container"
            onClick={() => setShowGuestSelector(true)}
          >
            <div className="guest-display">
              {formik.values.guests.adults + formik.values.guests.children} guests, {formik.values.guests.rooms} room{formik.values.guests.rooms > 1 ? 's' : ''}
            </div>
          </div>
          
          {showGuestSelector && (
            <div className="guest-selector-overlay">
              <GuestSelector
                adults={formik.values.guests.adults}
                children={formik.values.guests.children}
                rooms={formik.values.guests.rooms}
                onChange={handleGuestChange}
                onClose={() => setShowGuestSelector(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Search button */}
      <button
        type="submit"
        className="search-submit-btn"
        disabled={loading || !formik.isValid}
      >
        {loading ? (
          <div className="search-loading">
            <div className="spinner" />
            Searching...
          </div>
        ) : (
          'Search'
        )}
      </button>
    </form>
  );
};
```

#### Step-by-Step Flow:

#### Advanced State Management with Generic Patterns

```typescript
// utils/StateManager.ts
// Generic state management utility - works with any state library or vanilla JS

interface StateListener<T> {
  (state: T): void;
}

interface Action<T = any> {
  type: string;
  payload?: T;
}

class StateManager<T> {
  private state: T;
  private listeners: Set<StateListener<T>> = new Set();
  private middleware: Array<(action: Action, state: T) => T> = [];

  constructor(initialState: T) {
    this.state = initialState;
  }

  // Subscribe to state changes
  subscribe(listener: StateListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get current state
  getState(): T {
    return this.state;
  }

  // Dispatch actions with middleware support
  dispatch(action: Action): void {
    let newState = this.state;
    
    // Apply middleware
    for (const middleware of this.middleware) {
      newState = middleware(action, newState);
    }
    
    // Apply reducers
    newState = this.reducer(newState, action);
    
    if (newState !== this.state) {
      this.state = newState;
      this.notifyListeners();
    }
  }

  // Add middleware
  addMiddleware(middleware: (action: Action, state: T) => T): void {
    this.middleware.push(middleware);
  }

  private reducer(state: T, action: Action): T {
    // Override this method in subclasses
    return state;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Async action handler
class AsyncActionHandler {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  async handleAsync<T>(
    actionType: string,
    asyncFn: () => Promise<T>,
    options: { cacheKey?: string; ttl?: number } = {}
  ): Promise<T> {
    const { cacheKey, ttl = 300000 } = options; // 5 min default TTL
    
    // Check cache first
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const result = await asyncFn();
      
      // Cache the result
      if (cacheKey) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          ttl,
        });
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }
}

// Search-specific state manager
class SearchStateManager extends StateManager<SearchState> {
  private asyncHandler = new AsyncActionHandler();

  constructor() {
    super({
      query: null,
      results: [],
      filters: {
        priceRange: { min: 0, max: 1000 },
        rating: 0,
        amenities: [],
        propertyTypes: [],
        location: null,
      },
      loading: false,
      error: null,
      pagination: {
        page: 1,
        hasMore: true,
        total: 0,
      },
      recentSearches: [],
    });
  }

  // Generic async search handler
  async performSearch(params: SearchParams): Promise<void> {
    this.dispatch({ type: 'SEARCH_START' });
    
    try {
      const cacheKey = this.generateSearchCacheKey(params);
      
      const result = await this.asyncHandler.handleAsync(
        'SEARCH',
        () => this.fetchSearchResults(params),
        { cacheKey, ttl: 300000 }
      );
      
      this.dispatch({ 
        type: 'SEARCH_SUCCESS', 
        payload: { result, params } 
      });
    } catch (error) {
      this.dispatch({ 
        type: 'SEARCH_ERROR', 
        payload: error.message 
      });
    }
  }

  protected reducer(state: SearchState, action: Action): SearchState {
    switch (action.type) {
      case 'SEARCH_START':
        return {
          ...state,
          loading: true,
          error: null,
        };

      case 'SEARCH_SUCCESS':
        const { result, params } = action.payload;
        return {
          ...state,
          loading: false,
          query: params,
          results: result.properties,
          pagination: result.pagination,
          recentSearches: this.updateRecentSearches(state.recentSearches, params),
        };

      case 'SEARCH_ERROR':
        return {
          ...state,
          loading: false,
          error: action.payload,
        };

      case 'UPDATE_FILTERS':
        return {
          ...state,
          filters: { ...state.filters, ...action.payload },
        };

      case 'CLEAR_FILTERS':
        return {
          ...state,
          filters: {
            priceRange: { min: 0, max: 1000 },
            rating: 0,
            amenities: [],
            propertyTypes: [],
            location: null,
          },
        };

      case 'ADD_TO_FAVORITES':
        return {
          ...state,
          results: state.results.map(property =>
            property.id === action.payload
              ? { ...property, isFavorite: true }
              : property
          ),
        };

      default:
        return state;
    }
  }

  private async fetchSearchResults(params: SearchParams): Promise<any> {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    return response.json();
  }

  private generateSearchCacheKey(params: SearchParams): string {
    return `search_${JSON.stringify(params)}`;
  }

  private updateRecentSearches(recent: SearchParams[], newSearch: SearchParams): SearchParams[] {
    return [
      newSearch,
      ...recent.filter(s => s.destination.id !== newSearch.destination.id)
    ].slice(0, 5);
  }
}

interface SearchState {
  query: SearchParams | null;
  results: Property[];
  filters: SearchFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    hasMore: boolean;
    total: number;
  };
  cache: Map<string, CachedSearchResult>;
  recentSearches: SearchParams[];
}

// Async thunk for search with caching
export const performSearch = createAsyncThunk(
  'search/performSearch',
  async (params: SearchParams, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const cacheKey = generateSearchCacheKey(params);
      
      // Check cache first
      const cached = state.search.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 min cache
        return cached.data;
      }

      // Make API call
      const response = await searchAPI.search(params);
      
      // Cache the result
      const cacheEntry: CachedSearchResult = {
        data: response,
        timestamp: Date.now(),
        params,
      };

      return { response, cacheEntry, cacheKey };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: null,
    results: [],
    filters: {
      priceRange: { min: 0, max: 1000 },
      rating: 0,
      amenities: [],
      propertyTypes: [],
      location: null,
    },
    loading: false,
    error: null,
    pagination: {
      page: 1,
      hasMore: true,
      total: 0,
    },
    cache: new Map(),
    recentSearches: [],
  } as SearchState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<SearchParams>) => {
      state.query = action.payload;
      
      // Add to recent searches
      state.recentSearches = [
        action.payload,
        ...state.recentSearches.filter(s => s.destination.id !== action.payload.destination.id)
      ].slice(0, 5);
    },
    updateFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        priceRange: { min: 0, max: 1000 },
        rating: 0,
        amenities: [],
        propertyTypes: [],
        location: null,
      };
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      const property = state.results.find(p => p.id === action.payload);
      if (property) {
        property.isFavorite = true;
      }
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list' | 'map'>) => {
      state.viewMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false;
        
        if ('cacheEntry' in action.payload) {
          // New search result
          state.results = action.payload.response.properties;
          state.pagination = action.payload.response.pagination;
          state.cache.set(action.payload.cacheKey, action.payload.cacheEntry);
        } else {
          // Cached result
          state.results = action.payload.properties;
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const searchActions = searchSlice.actions;
export default searchSlice.reducer;
```

#### Generic React Hooks for State Management

```typescript
// hooks/useSearchResults.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAnalytics } from './useAnalytics';

// Generic state hook that can work with any state management solution
function useStateManager<T>(stateManager: StateManager<T>) {
  const [state, setState] = useState<T>(stateManager.getState());
  
  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setState);
    return unsubscribe;
  }, [stateManager]);
  
  return [state, stateManager] as const;
}

// Generic async hook for managing async operations
function useAsyncOperation<T, P = any>(
  operation: (params: P) => Promise<T>,
  options: {
    onSuccess?: (result: T) => void;
    onError?: (error: Error) => void;
    cacheKey?: (params: P) => string;
    retries?: number;
  } = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const retryCountRef = useRef(0);
  
  const execute = useCallback(async (params: P) => {
    setLoading(true);
    setError(null);
    retryCountRef.current = 0;
    
    const tryOperation = async (): Promise<T> => {
      try {
        const result = await operation(params);
        setData(result);
        setLoading(false);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        retryCountRef.current++;
        
        if (retryCountRef.current <= (options.retries || 0)) {
          // Exponential backoff for retries
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, retryCountRef.current) * 1000)
          );
          return tryOperation();
        }
        
        const error = err instanceof Error ? err : new Error('Operation failed');
        setError(error.message);
        setLoading(false);
        options.onError?.(error);
        throw error;
      }
    };
    
    return tryOperation();
  }, [operation, options]);
  
  return {
    data,
    loading,
    error,
    execute,
    retry: () => execute,
  };
}

// Search-specific hook using generic patterns
export const useSearchResults = () => {
  const analytics = useAnalytics();
  const searchManager = useRef(new SearchStateManager()).current;
  const [searchState] = useStateManager(searchManager);
  
  const searchOperation = useCallback(async (params: SearchParams) => {
    // Track search analytics
    analytics.track('search_performed', {
      destination: params.destination.name,
      checkin: params.dates.checkin,
      checkout: params.dates.checkout,
      guests: params.guests.adults + params.guests.children,
      rooms: params.guests.rooms,
    });

    await searchManager.performSearch(params);
    return searchManager.getState().results;
  }, [searchManager, analytics]);

  const {
    loading: searchLoading,
    error: searchError,
    execute: performSearch,
  } = useAsyncOperation(searchOperation, {
    retries: 2,
    onError: (error) => {
      console.error('Search failed:', error);
    },
  });

  const loadMoreResults = useCallback(async () => {
    const { pagination, query } = searchState;
    
    if (!pagination.hasMore || searchLoading || !query) return;

    const nextPageParams = {
      ...query,
      page: pagination.page + 1,
    };

    return performSearch(nextPageParams);
  }, [searchState, searchLoading, performSearch]);

  const refreshResults = useCallback(() => {
    const { query } = searchState;
    if (!query) return;
    return performSearch(query);
  }, [searchState, performSearch]);

  // Generic filter update function
  const updateFilters = useCallback((filters: Partial<SearchFilters>) => {
    searchManager.dispatch({
      type: 'UPDATE_FILTERS',
      payload: filters,
    });
  }, [searchManager]);

  const clearFilters = useCallback(() => {
    searchManager.dispatch({ type: 'CLEAR_FILTERS' });
  }, [searchManager]);

  const addToFavorites = useCallback((propertyId: string) => {
    searchManager.dispatch({
      type: 'ADD_TO_FAVORITES',
      payload: propertyId,
    });
  }, [searchManager]);

  return {
    // State
    results: searchState.results,
    loading: searchState.loading || searchLoading,
    error: searchState.error || searchError,
    pagination: searchState.pagination,
    filters: searchState.filters,
    query: searchState.query,
    
    // Actions
    performSearch,
    loadMoreResults,
    refreshResults,
    updateFilters,
    clearFilters,
    addToFavorites,
  };
};

// Generic filters hook that can work with any filter system
export const useSearchFilters = () => {
  const searchManager = useRef(new SearchStateManager()).current;
  const [searchState] = useStateManager(searchManager);
  
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    searchManager.dispatch({
      type: 'UPDATE_FILTERS',
      payload: newFilters,
    });
  }, [searchManager]);

  const clearFilters = useCallback(() => {
    searchManager.dispatch({ type: 'CLEAR_FILTERS' });
  }, [searchManager]);

  const activeFiltersCount = useCallback(() => {
    const { filters } = searchState;
    let count = 0;
    
    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) count++;
    if (filters.rating > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.location) count++;
    
    return count;
  }, [searchState]);

  return {
    filters: searchState.filters,
    updateFilters,
    clearFilters,
    activeFiltersCount: activeFiltersCount(),
  };
};
```

#### Booking Flow Component with Optimistic Updates

```typescript
// components/pages/BookingPage/BookingPage.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';
import { BookingForm } from './components/BookingForm';
import { PaymentForm } from './components/PaymentForm';
import { BookingSummary } from './components/BookingSummary';
import { ProgressIndicator } from '../../molecules/ProgressIndicator';
import { useOptimisticBooking } from '../../../hooks/useOptimisticBooking';
import { useBookingValidation } from '../../../hooks/useBookingValidation';

interface BookingPageProps {
  property: Property;
  searchParams: SearchParams;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  property,
  searchParams
}) => {
  const router = useRouter();
  
  // Booking flow state
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({
    propertyId: property.id,
    dates: searchParams.dates,
    guests: searchParams.guests,
  });

  // Custom hooks
  const {
    createBooking,
    updateBooking,
    optimisticBookings,
    loading: bookingLoading,
    error: bookingError,
  } = useOptimisticBooking();

  const {
    validateStep,
    errors: validationErrors,
    isStepValid,
  } = useBookingValidation();

  // Handle step navigation
  const handleNextStep = useCallback(async () => {
    // Validate current step
    const isValid = await validateStep(currentStep, bookingData);
    if (!isValid) return;

    if (currentStep === 'details') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      // Create booking with optimistic update
      try {
        const booking = await createBooking(bookingData as BookingData);
        setCurrentStep('confirmation');
        
        // Track successful booking
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'purchase', {
            transaction_id: booking.id,
            value: booking.totalAmount,
            currency: booking.currency,
            items: [{
              item_id: property.id,
              item_name: property.name,
              category: 'accommodation',
              quantity: bookingData.guests?.rooms || 1,
              price: booking.totalAmount,
            }],
          });
        }
      } catch (error) {
        console.error('Booking failed:', error);
        // Error handling is managed by the hook
      }
    }
  }, [currentStep, bookingData, validateStep, createBooking, property]);

  const handlePreviousStep = useCallback(() => {
    if (currentStep === 'payment') {
      setCurrentStep('details');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment');
    }
  }, [currentStep]);

  // Handle booking data updates
  const handleBookingDataChange = useCallback((updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  }, []);

  // Auto-save booking data to localStorage
  useEffect(() => {
    const bookingKey = `booking_${property.id}`;
    localStorage.setItem(bookingKey, JSON.stringify(bookingData));
  }, [bookingData, property.id]);

  // Load saved booking data on mount
  useEffect(() => {
    const bookingKey = `booking_${property.id}`;
    const saved = localStorage.getItem(bookingKey);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setBookingData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Failed to parse saved booking data:', error);
      }
    }
  }, [property.id]);

  const steps = [
    { id: 'details', label: 'Booking Details', completed: currentStep !== 'details' },
    { id: 'payment', label: 'Payment', completed: currentStep === 'confirmation' },
    { id: 'confirmation', label: 'Confirmation', completed: false },
  ];

  return (
    <div className="booking-page">
      {/* Header with property info */}
      <div className="booking-header">
        <div className="property-summary">
          <h1>{property.name}</h1>
          <p>{property.location}</p>
          <div className="booking-dates">
            {searchParams.dates.checkin.toLocaleDateString()} - {searchParams.dates.checkout.toLocaleDateString()}
          </div>
        </div>
        
        {/* Progress indicator */}
        <ProgressIndicator
          steps={steps}
          currentStep={currentStep}
          className="booking-progress"
        />
      </div>

      <div className="booking-content">
        <div className="booking-main">
          {/* Step content */}
          {currentStep === 'details' && (
            <BookingForm
              property={property}
              bookingData={bookingData}
              onChange={handleBookingDataChange}
              errors={validationErrors}
              loading={bookingLoading}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentForm
              bookingData={bookingData}
              onChange={handleBookingDataChange}
              errors={validationErrors}
              loading={bookingLoading}
            />
          )}

          {currentStep === 'confirmation' && (
            <div className="booking-confirmation">
              <div className="confirmation-icon">✓</div>
              <h2>Booking Confirmed!</h2>
              <p>Your booking reference is: <strong>{optimisticBookings[0]?.id}</strong></p>
              <button
                onClick={() => router.push('/bookings')}
                className="view-booking-btn"
              >
                View My Bookings
              </button>
            </div>
          )}

          {/* Step navigation */}
          <div className="booking-navigation">
            {currentStep !== 'details' && currentStep !== 'confirmation' && (
              <button
                onClick={handlePreviousStep}
                className="btn-secondary"
                disabled={bookingLoading}
              >
                Previous
              </button>
            )}
            
            {currentStep !== 'confirmation' && (
              <button
                onClick={handleNextStep}
                className="btn-primary"
                disabled={!isStepValid(currentStep) || bookingLoading}
              >
                {bookingLoading ? (
                  <div className="loading-spinner" />
                ) : (
                  currentStep === 'payment' ? 'Complete Booking' : 'Continue'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Booking summary sidebar */}
        <aside className="booking-sidebar">
          <BookingSummary
            property={property}
            bookingData={bookingData}
            readonly={currentStep === 'confirmation'}
          />
        </aside>
      </div>

      {/* Error display */}
      {bookingError && (
        <div className="booking-error">
          <div className="error-message">
            {bookingError}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
```

1. **User Input Capture**
```javascript
// React Component with optimized input handling
const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  const { data: suggestions } = useQuery(
    ['autocomplete', debouncedQuery],
    () => locationService.getSuggestions(debouncedQuery),
    {
      enabled: debouncedQuery.length > 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return (
    <SearchInput
      value={searchQuery}
      onChange={setSearchQuery}
      suggestions={suggestions}
      onSubmit={handleSearch}
    />
  );
};
```

2. **Search API Call with State Management**
```javascript
// Redux slice for search state
const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query: {},
    results: [],
    loading: false,
    error: null,
    filters: {},
    pagination: { page: 1, hasMore: true }
  },
  reducers: {
    searchStart: (state, action) => {
      state.loading = true;
      state.query = action.payload;
      state.error = null;
    },
    searchSuccess: (state, action) => {
      state.loading = false;
      state.results = action.payload.data;
      state.pagination = action.payload.pagination;
    },
    searchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});
```

3. **API Layer with Error Handling**
```javascript
// API service with retry logic and error handling
class SearchService {
  async searchHotels(params) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new SearchError(response.status, await response.text());
      }
      
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new SearchError('TIMEOUT', 'Search request timed out');
      }
      throw error;
    }
  }
}
```

### 2.2 Property Details Flow (Phase 2)

#### Component Architecture
```
┌─────────────────────────────────────────────────────────┐
│                Property Details Page                    │
├─────────────────┬─────────────────┬─────────────────────┤
│  Image Gallery  │  Property Info  │    Booking Panel    │
│   Component     │   Component     │     Component       │
├─────────────────┼─────────────────┼─────────────────────┤
│ • Lazy Loading  │ • Room Details  │ • Price Calculator  │
│ • Image Zoom    │ • Amenities     │ • Date Picker       │
│ • Virtual Tour  │ • Reviews       │ • Guest Counter     │
└─────────────────┴─────────────────┴─────────────────────┘
```

#### Implementation Details:

1. **Lazy Loading Strategy**
```javascript
const PropertyGallery = ({ images }) => {
  const [visibleImages, setVisibleImages] = useState(3);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  useEffect(() => {
    if (inView) {
      setVisibleImages(prev => Math.min(prev + 6, images.length));
    }
  }, [inView]);
  
  return (
    <div className="gallery-container">
      {images.slice(0, visibleImages).map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.url}
          alt={image.alt}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ))}
      <div ref={ref} />
    </div>
  );
};
```

2. **Real-time Price Updates**
```javascript
const BookingPanel = ({ propertyId }) => {
  const [bookingDetails, setBookingDetails] = useState({
    checkIn: null,
    checkOut: null,
    guests: 1
  });
  
  const { data: pricing, isLoading } = useQuery(
    ['pricing', propertyId, bookingDetails],
    () => pricingService.calculatePrice(propertyId, bookingDetails),
    {
      enabled: bookingDetails.checkIn && bookingDetails.checkOut,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );
  
  return (
    <div className="booking-panel">
      <DateRangePicker
        value={[bookingDetails.checkIn, bookingDetails.checkOut]}
        onChange={handleDateChange}
        disabledDates={unavailableDates}
      />
      <GuestCounter
        value={bookingDetails.guests}
        onChange={handleGuestChange}
      />
      {pricing && (
        <PriceBreakdown pricing={pricing} loading={isLoading} />
      )}
    </div>
  );
};
```

### 2.3 Booking Flow (Phase 3)

#### Multi-step Form Architecture
```
┌─────────────────────────────────────────────────────────┐
│                Booking Wizard                           │
├─────────────────┬─────────────────┬─────────────────────┤
│   Guest Info    │     Payment     │   Confirmation      │
│      Step       │      Step       │       Step          │
└─────────────────┴─────────────────┴─────────────────────┘
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Form Validation │ │ Secure Payment  │ │ Booking Success │
│ Error Handling  │ │ Processing      │ │ Notification    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

#### Implementation:

1. **Form State Management with Validation**
```javascript
const BookingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    guestInfo: {},
    paymentInfo: {},
    preferences: {}
  });
  
  const { register, handleSubmit, formState: { errors }, trigger } = useForm({
    mode: 'onChange',
    resolver: yupResolver(bookingSchema)
  });
  
  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setCurrentStep(prev => prev + 1);
      // Save to sessionStorage for recovery
      sessionStorage.setItem('bookingData', JSON.stringify(formData));
    }
  };
  
  return (
    <FormProvider {...formMethods}>
      <ProgressIndicator currentStep={currentStep} totalSteps={3} />
      {currentStep === 1 && <GuestInfoStep />}
      {currentStep === 2 && <PaymentStep />}
      {currentStep === 3 && <ConfirmationStep />}
    </FormProvider>
  );
};
```

2. **Error Recovery and Retry Logic**
```javascript
const useBookingMutation = () => {
  return useMutation(
    (bookingData) => bookingService.createBooking(bookingData),
    {
      retry: (failureCount, error) => {
        // Don't retry client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        // Show user-friendly error message
        if (error.code === 'INVENTORY_UNAVAILABLE') {
          showNotification('Room is no longer available', 'error');
        } else if (error.code === 'PAYMENT_FAILED') {
          showNotification('Payment failed. Please try again.', 'error');
        }
      }
    }
  );
};
```

## 3. Frontend Architecture for Performance & Scalability

### 3.1 Component Architecture Pattern

```
┌─────────────────────────────────────────────────────────┐
│                   Application Shell                     │
├─────────────────────────────────────────────────────────┤
│  Header | Search Bar | User Menu | Notifications       │
├─────────────────────────────────────────────────────────┤
│                     Router Outlet                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │            Page Components                      │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │   │
│  │  │   Search    │ │  Property   │ │   Booking   │ │   │
│  │  │    Page     │ │   Details   │ │    Flow     │ │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│             Shared Components Library                  │
│  SearchBar | DatePicker | Modal | Button | Card       │
└─────────────────────────────────────────────────────────┘
```

### 3.2 State Management Architecture

```javascript
// Store configuration with RTK Query
export const store = configureStore({
  reducer: {
    search: searchSlice.reducer,
    booking: bookingSlice.reducer,
    user: userSlice.reducer,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
});

// API slice with caching strategy
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = selectCurrentToken(getState());
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Property', 'Booking', 'User'],
  endpoints: (builder) => ({
    getProperties: builder.query({
      query: (params) => `search?${new URLSearchParams(params)}`,
      providesTags: ['Property'],
      keepUnusedDataFor: 300, // 5 minutes
    }),
    getProperty: builder.query({
      query: (id) => `properties/${id}`,
      providesTags: (result, error, id) => [{ type: 'Property', id }],
      keepUnusedDataFor: 600, // 10 minutes
    }),
  }),
});
```

### 3.3 Performance Optimization Strategies

#### Code Splitting and Lazy Loading
```javascript
// Route-based code splitting
const SearchPage = lazy(() => import('../pages/SearchPage'));
const PropertyPage = lazy(() => import('../pages/PropertyPage'));
const BookingPage = lazy(() => import('../pages/BookingPage'));

const AppRouter = () => (
  <Router>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/property/:id" element={<PropertyPage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Routes>
    </Suspense>
  </Router>
);
```

#### Image Optimization
```javascript
const OptimizedImage = ({ src, alt, ...props }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setImageLoaded(true);
    };
    img.src = src;
  }, [src]);
  
  return (
    <div className="image-container">
      {!imageLoaded && <ImageSkeleton />}
      <img
        src={imageSrc}
        alt={alt}
        loading="lazy"
        style={{ opacity: imageLoaded ? 1 : 0 }}
        {...props}
      />
    </div>
  );
};
```

## 4. Error Handling & Resilience

### 4.1 Error Boundary Implementation
```javascript
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
    
    // Log error to monitoring service
    errorTrackingService.captureException(error, {
      extra: errorInfo,
      tags: { component: this.props.name }
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

### 4.2 Network Error Handling
```javascript
const useApiWithRetry = () => {
  const retryRequest = async (fn, retries = 3) => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && isRetryableError(error)) {
        await delay(1000 * (4 - retries)); // Exponential backoff
        return retryRequest(fn, retries - 1);
      }
      throw error;
    }
  };
  
  return { retryRequest };
};

const isRetryableError = (error) => {
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return retryableStatusCodes.includes(error.status) || 
         error.name === 'NetworkError';
};
```

## 5. Real-time Features Implementation

### 5.1 Price Updates via WebSocket
```javascript
const usePriceUpdates = (propertyId) => {
  const [price, setPrice] = useState(null);
  const { lastMessage } = useWebSocket(
    `${WS_URL}/price-updates/${propertyId}`,
    {
      onOpen: () => console.log('Price updates connected'),
      shouldReconnect: () => true,
      reconnectAttempts: 5,
      reconnectInterval: 3000,
    }
  );
  
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'PRICE_UPDATE') {
        setPrice(data.price);
      }
    }
  }, [lastMessage]);
  
  return price;
};
```

### 5.2 Inventory Availability Updates
```javascript
const InventoryTracker = ({ propertyId, roomType }) => {
  const [availableRooms, setAvailableRooms] = useState(null);
  
  useEffect(() => {
    const eventSource = new EventSource(
      `/api/inventory/stream?propertyId=${propertyId}&roomType=${roomType}`
    );
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAvailableRooms(data.available);
      
      if (data.available === 0) {
        showNotification('This room type is no longer available', 'warning');
      }
    };
    
    return () => eventSource.close();
  }, [propertyId, roomType]);
  
  return (
    <div className="inventory-status">
      {availableRooms !== null && (
        <span className={availableRooms < 5 ? 'urgent' : 'normal'}>
          {availableRooms > 0 
            ? `${availableRooms} rooms left`
            : 'Sold out'
          }
        </span>
      )}
    </div>
  );
};
```

## 6. Mobile Optimization

### 6.1 Responsive Design Strategy
```javascript
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return {
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width >= 768 && windowSize.width < 1024,
    isDesktop: windowSize.width >= 1024,
  };
};
```

### 6.2 Touch-Optimized Components
```javascript
const MobileSearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={`search-bar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="search-trigger"
        onClick={() => setIsExpanded(true)}
        aria-label="Open search"
      >
        <SearchIcon />
        <span>Where are you going?</span>
      </button>
      
      {isExpanded && (
        <Modal
          isOpen={isExpanded}
          onClose={() => setIsExpanded(false)}
          className="mobile-search-modal"
        >
          <SearchForm onSubmit={() => setIsExpanded(false)} />
        </Modal>
      )}
    </div>
  );
};
```

## 7. Analytics and Monitoring

### 7.1 User Journey Tracking
```javascript
const useAnalytics = () => {
  const trackEvent = useCallback((eventName, properties = {}) => {
    // Send to analytics service
    analytics.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      userId: getCurrentUserId(),
    });
  }, []);
  
  return { trackEvent };
};

const SearchResults = () => {
  const { trackEvent } = useAnalytics();
  
  const handlePropertyClick = (property) => {
    trackEvent('property_viewed', {
      propertyId: property.id,
      propertyName: property.name,
      price: property.price,
      searchQuery: searchParams,
    });
  };
  
  return (
    <div className="search-results">
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={() => handlePropertyClick(property)}
        />
      ))}
    </div>
  );
};
```

### 7.2 Performance Monitoring
```javascript
const usePerformanceMonitoring = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }, []);
  
  const onPerfEntry = (metric) => {
    // Send metrics to monitoring service
    performanceMonitoring.record(metric.name, metric.value, {
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    });
  };
};
```

## 8. Backend Integration Patterns

### 8.1 API Request Deduplication
```javascript
const createDedupedRequest = () => {
  const cache = new Map();
  
  return async (key, requestFn) => {
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const promise = requestFn().finally(() => {
      // Remove from cache after request completes
      setTimeout(() => cache.delete(key), 1000);
    });
    
    cache.set(key, promise);
    return promise;
  };
};

const dequedRequest = createDedupedRequest();

const searchProperties = (params) => {
  const cacheKey = JSON.stringify(params);
  return dequedRequest(cacheKey, () => api.search(params));
};
```

### 8.2 Optimistic Updates
```javascript
const useOptimisticBooking = () => {
  const [optimisticBooking, setOptimisticBooking] = useState(null);
  
  const createBooking = async (bookingData) => {
    // Immediately show success state
    const tempBooking = {
      ...bookingData,
      id: `temp_${Date.now()}`,
      status: 'confirming'
    };
    setOptimisticBooking(tempBooking);
    
    try {
      const result = await bookingService.create(bookingData);
      setOptimisticBooking(null);
      return result;
    } catch (error) {
      // Revert optimistic update
      setOptimisticBooking(null);
      throw error;
    }
  };
  
  return { optimisticBooking, createBooking };
};
```

## 9. Testing Strategy

### 9.1 Component Testing
```javascript
describe('SearchResults', () => {
  it('should handle loading state correctly', async () => {
    const { getByTestId } = render(
      <SearchResults loading={true} results={[]} />
    );
    
    expect(getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('should track property clicks', async () => {
    const mockTrackEvent = jest.fn();
    jest.mock('../hooks/useAnalytics', () => ({
      useAnalytics: () => ({ trackEvent: mockTrackEvent })
    }));
    
    const { getByTestId } = render(
      <SearchResults results={mockProperties} />
    );
    
    fireEvent.click(getByTestId('property-1'));
    
    expect(mockTrackEvent).toHaveBeenCalledWith('property_viewed', {
      propertyId: '1',
      propertyName: 'Test Property',
    });
  });
});
```

### 9.2 E2E Testing Flow
```javascript
describe('Booking Flow', () => {
  it('should complete full booking journey', async () => {
    // Start search
    await page.goto('/search');
    await page.fill('[data-testid=destination-input]', 'Bangkok');
    await page.click('[data-testid=search-button]');
    
    // Select property
    await page.waitForSelector('[data-testid=property-card]');
    await page.click('[data-testid=property-card]:first-child');
    
    // Book room
    await page.click('[data-testid=book-now-button]');
    await page.fill('[data-testid=guest-name]', 'John Doe');
    await page.fill('[data-testid=guest-email]', 'john@example.com');
    
    // Payment
    await page.click('[data-testid=continue-to-payment]');
    await page.fill('[data-testid=card-number]', '4111111111111111');
    await page.click('[data-testid=complete-booking]');
    
    // Verify confirmation
    await page.waitForSelector('[data-testid=booking-confirmation]');
    expect(page.url()).toContain('/booking/confirmation');
  });
});
```

## 10. Interview Discussion Points

### Performance Questions
1. **How do you handle search result caching?**
   - Implement stale-while-revalidate strategy
   - Use React Query with appropriate cache times
   - Cache popular searches at CDN level

2. **How do you optimize initial page load?**
   - Code splitting by routes
   - Critical CSS inlining
   - Preload key resources
   - Service worker for caching

3. **How do you handle large image galleries?**
   - Virtual scrolling for large lists
   - Lazy loading with intersection observer
   - Progressive image loading (blur-up technique)
   - WebP format with fallbacks

### Scalability Questions
1. **How do you handle high concurrent bookings?**
   - Optimistic locking in frontend
   - Real-time inventory updates
   - Graceful degradation on conflicts
   - Queue-based processing

2. **How do you scale the frontend globally?**
   - CDN distribution
   - Edge-side rendering
   - Regional API endpoints
   - Localized content caching

### Error Handling Questions
1. **How do you handle payment failures?**
   - Retry logic with exponential backoff
   - Clear error messaging
   - Alternative payment methods
   - Session recovery

2. **How do you ensure data consistency?**
   - Optimistic updates with rollback
   - Real-time sync with backend
   - Local state validation
   - Conflict resolution strategies

## Conclusion

The end-to-end flow architecture for hotel booking requires careful consideration of user experience, performance, and reliability. Key principles include:

1. **Progressive Enhancement**: Start with core functionality and enhance with advanced features
2. **Graceful Degradation**: Ensure the system works even when some components fail
3. **Performance First**: Optimize for perceived performance through smart loading strategies
4. **Error Resilience**: Comprehensive error handling and recovery mechanisms
5. **Real-time Updates**: Keep users informed with live data updates
6. **Mobile Optimization**: Responsive design with touch-friendly interactions

The architecture should be modular, testable, and maintainable while providing a seamless experience across all devices and network conditions.

---

**References:**
- [How to Design a Hotel Booking System](https://javascript.plainenglish.io/how-to-design-a-hotel-booking-system-56ef18b6adfc)
- [Software Architecture - Hotel Reservation Booking System](https://austincorso.com/2020/01/23/hotel-reservation-booking-system.html)
- [Designing Airbnb or a hotel booking system](https://tianpan.co/notes/177-designing-Airbnb-or-a-hotel-booking-system)