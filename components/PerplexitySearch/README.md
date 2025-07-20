# PerplexitySearch React Component

A powerful, reusable React component for web search with AI-powered insights using Perplexity's Sonar models.

## Features

- 🔍 **Real-time web search** with AI-powered insights
- ⚡ **Streaming support** for fast responses
- 📚 **Citation support** with source links
- 🎛️ **Advanced controls** for fine-tuning search parameters
- 💰 **Cost estimation** with real-time pricing
- 🛑 **Stop/cancel** functionality to save costs
- 📱 **Responsive design** that works on all devices
- 🎨 **Customizable styling** via className prop

## Quick Start

### 1. Import the component

```tsx
import PerplexitySearch from './components/PerplexitySearch';
```

### 2. Use in your React component

```tsx
function MyApp() {
  const handleResponse = (response: any) => {
    console.log('Search response:', response);
  };

  const handleError = (error: string) => {
    console.error('Search error:', error);
  };

  return (
    <PerplexitySearch
      apiEndpoint="/api/perplexity-search"
      onResponse={handleResponse}
      onError={handleError}
      className="my-search"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | `string` | `'/api/perplexity-search'` | API endpoint URL |
| `className` | `string` | `''` | Custom CSS class for styling |
| `onResponse` | `(response: any) => void` | `undefined` | Callback for search responses |
| `onError` | `(error: string) => void` | `undefined` | Callback for errors |

## Built-in Features

### Search Options
- **Max Tokens**: Control response length (100-8000)
- **Temperature**: Control randomness (0-1)
- **Model Selection**: Choose from Sonar models
- **Streaming**: Toggle between streaming and non-streaming modes
- **Citations**: Get source links and references

### Advanced Controls
- **Top P**: Nucleus sampling parameter
- **Frequency Penalty**: Reduce repetition
- **Context Size**: Search context (Low/Medium/High)
- **Recency Filter**: Filter by time (hour/day/week/month)
- **Domain Filter**: Search specific domains
- **Images & Related Questions**: Additional content types

### Cost Management
- **Real-time cost estimation** based on model pricing
- **Stop search** functionality to prevent overrun
- **Usage tracking** with actual token counts

## Models Supported

| Model | Input Cost | Output Cost | Description |
|-------|------------|-------------|-------------|
| `perplexity/sonar-pro` | $3/1M | $15/1M | Advanced search capabilities |
| `perplexity/sonar` | $0.15/1M | $0.15/1M | Lightweight, cost-effective |
| `perplexity/sonar-deep-research` | $3/1M | $15/1M | Research-focused |
| `perplexity/sonar-reasoning` | $3/1M | $15/1M | Reasoning with web search |

## API Requirements

This component requires a backend API endpoint that:
1. Accepts POST requests with search parameters
2. Supports streaming responses (Server-Sent Events)
3. Integrates with OpenRouter/Perplexity API

See the included `pages/api/perplexity-search.ts` for a complete implementation.

## Styling

The component uses CSS-in-JS with responsive design. You can:
- Add custom classes via the `className` prop
- Override styles using CSS specificity
- Customize colors and spacing by modifying the internal styles

## Example Responses

The component handles these message types:

```typescript
// Content chunk (streaming)
{ type: 'content', content: 'Search results...' }

// Citations
{ type: 'citations', citations: [{ url: '...', title: '...' }] }

// Usage stats
{ type: 'usage', usage: { prompt_tokens: 50, completion_tokens: 200 } }

// Completion
{ type: 'end', message: 'Search completed' }

// Errors
{ type: 'error', error: 'Error message' }
```

## Moving to Another Project

This component is completely self-contained and portable:

1. Copy the `components/PerplexitySearch/` folder
2. Ensure your project has React 16.8+ (hooks support)
3. Set up the API endpoint in your backend
4. Import and use!

No external dependencies required beyond React. 