import React, { useState, useRef, useEffect } from 'react';

interface PerplexitySearchProps {
  apiEndpoint?: string;
  className?: string;
  onResponse?: (response: any) => void;
  onError?: (error: string) => void;
}

interface SearchOptions {
  maxTokens: number;
  temperature: number;
  model: string;
  enableStreaming: boolean;
  searchDomainFilter: string[];
  searchRecencyFilter: string;
  returnCitations: boolean;
  returnImages: boolean;
  returnRelatedQuestions: boolean;
  topP: number;
  frequencyPenalty: number;
  contextSize: string;
}

const MODEL_PRICING = {
  'perplexity/sonar-pro': { input: 3, output: 15 },
  'perplexity/sonar': { input: 0.15, output: 0.15 },
  'perplexity/sonar-deep-research': { input: 3, output: 15 },
  'perplexity/sonar-reasoning': { input: 3, output: 15 }
};

const PerplexitySearch: React.FC<PerplexitySearchProps> = ({
  apiEndpoint = '/api/perplexity-search',
  className = '',
  onResponse,
  onError
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [response, setResponse] = useState('');
  const [citations, setCitations] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [cost, setCost] = useState({ input: 0, output: 0, total: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [options, setOptions] = useState<SearchOptions>({
    maxTokens: 4000,
    temperature: 0.7,
    model: 'perplexity/sonar-pro',
    enableStreaming: true,
    searchDomainFilter: [],
    searchRecencyFilter: '',
    returnCitations: true,
    returnImages: false,
    returnRelatedQuestions: false,
    topP: 0.9,
    frequencyPenalty: 0.1,
    contextSize: 'Medium'
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  // Calculate cost estimate
  useEffect(() => {
    const estimateInputTokens = Math.ceil(query.length / 4);
    const pricing = MODEL_PRICING[options.model as keyof typeof MODEL_PRICING];
    
    if (pricing) {
      const inputCost = (estimateInputTokens / 1000000) * pricing.input;
      const outputCost = (options.maxTokens / 1000000) * pricing.output;
      const totalCost = inputCost + outputCost;
      
      setCost({
        input: inputCost,
        output: outputCost,
        total: totalCost
      });
    }
  }, [query, options.maxTokens, options.model]);

  const showStatus = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setStatus(message);
    setStatusType(type);
  };

  const clearResponse = () => {
    setResponse('');
    setCitations([]);
    setStatus('');
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const stopSearch = () => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSearching(false);
    showStatus('🛑 Search stopped by user', 'info');
  };

  const startSearch = async () => {
    if (!query.trim()) {
      showStatus('❌ Please enter a search query', 'error');
      return;
    }

    setIsSearching(true);
    clearResponse();
    
    const mode = options.enableStreaming ? 'streaming' : 'non-streaming';
    showStatus(`🔍 Searching with ${mode} mode...`, 'info');

    try {
      abortControllerRef.current = new AbortController();
      
      const requestBody = {
        query: query.trim(),
        max_tokens: options.maxTokens,
        temperature: options.temperature,
        model: options.model,
        stream: options.enableStreaming,
        search_domain_filter: options.searchDomainFilter.length > 0 ? options.searchDomainFilter : undefined,
        search_recency_filter: options.searchRecencyFilter || undefined,
        return_citations: options.returnCitations,
        return_images: options.returnImages,
        return_related_questions: options.returnRelatedQuestions,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        web_search_options: {
          search_context_size: options.contextSize
        }
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsSearching(false);
              showStatus('✅ Search completed successfully!', 'success');
              return;
            }

            try {
              const message = JSON.parse(data);
              handleStreamMessage(message);
            } catch (e) {
              console.warn('Failed to parse message:', data);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        showStatus('🛑 Search cancelled', 'info');
      } else {
        const errorMsg = error.message || 'Unknown error occurred';
        showStatus(`❌ Error: ${errorMsg}`, 'error');
        onError?.(errorMsg);
      }
    } finally {
      setIsSearching(false);
      readerRef.current = null;
      abortControllerRef.current = null;
    }
  };

  const handleStreamMessage = (message: any) => {
    switch (message.type) {
      case 'content':
        setResponse(prev => prev + (message.content || ''));
        break;

      case 'citations':
        if (message.citations && Array.isArray(message.citations)) {
          setCitations(prev => [...prev, ...message.citations]);
        }
        break;

      case 'usage':
        if (message.usage) {
          const actualCost = calculateActualCost(message.usage);
          setCost(actualCost);
        }
        break;

      case 'end':
        setIsSearching(false);
        const endMessage = message.message || 'Search completed';
        showStatus(`✅ ${endMessage}`, 'success');
        
        if (options.enableStreaming && citations.length === 0 && options.returnCitations) {
          setResponse(prev => prev + '\n\n📚 **Note:** Streaming mode provides faster results but limited citations. For full source links, disable streaming mode.');
        }
        break;

      case 'error':
        showStatus(`❌ Error: ${message.error}`, 'error');
        onError?.(message.error);
        setIsSearching(false);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }

    onResponse?.(message);
  };

  const calculateActualCost = (usage: any) => {
    const pricing = MODEL_PRICING[options.model as keyof typeof MODEL_PRICING];
    if (!pricing || !usage) return cost;

    const inputCost = (usage.prompt_tokens / 1000000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1000000) * pricing.output;
    
    return {
      input: inputCost,
      output: outputCost,
      total: inputCost + outputCost
    };
  };

  const loadExample = (exampleQuery: string, streamingMode = true) => {
    setQuery(exampleQuery);
    setOptions(prev => ({ ...prev, enableStreaming: streamingMode }));
    showStatus(`📝 Example loaded! ${streamingMode ? 'Streaming' : 'Non-streaming'} mode selected.`, 'success');
  };

  const updateOption = <K extends keyof SearchOptions>(key: K, value: SearchOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`perplexity-search ${className}`}>
      <style jsx>{`
        .perplexity-search {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #2563eb;
          margin-bottom: 10px;
        }
        
        .search-form {
          background: #f8fafc;
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid #e2e8f0;
        }
        
        .query-section {
          margin-bottom: 20px;
        }
        
        .query-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 16px;
          margin-bottom: 15px;
        }
        
        .query-input:focus {
          outline: none;
          border-color: #3b82f6;
        }
        
        .controls-row {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        
        .control-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .control-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .slider-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .slider {
          width: 120px;
        }
        
        .slider-value {
          font-weight: bold;
          color: #3b82f6;
          min-width: 60px;
        }
        
        .select, .checkbox {
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }
        
        .cost-tracker {
          background: #f0f9ff;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #bae6fd;
          font-size: 14px;
          color: #0c4a6e;
          margin-bottom: 15px;
        }
        
        .examples {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        
        .example-btn {
          padding: 8px 12px;
          background: #e0e7ff;
          border: 1px solid #c7d2fe;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          color: #3730a3;
        }
        
        .example-btn:hover {
          background: #c7d2fe;
        }
        
        .action-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        
        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .btn-secondary {
          background: #ef4444;
          color: white;
        }
        
        .btn-secondary:hover {
          background: #dc2626;
        }
        
        .btn-toggle {
          background: #6b7280;
          color: white;
          padding: 8px 16px;
        }
        
        .btn-toggle:hover {
          background: #4b5563;
        }
        
        .advanced-controls {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-top: 15px;
        }
        
        .advanced-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .status {
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .status.info {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }
        
        .status.success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }
        
        .status.error {
          background: #fee2e2;
          color: #dc2626;
          border: 1px solid #fca5a5;
        }
        
        .response-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 25px;
        }
        
        .response-content {
          white-space: pre-wrap;
          line-height: 1.6;
          margin-bottom: 20px;
          font-size: 15px;
        }
        
        .citations {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        .citations h3 {
          color: #374151;
          margin-bottom: 15px;
          font-size: 18px;
        }
        
        .citation-item {
          background: #f8fafc;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #3b82f6;
        }
        
        .citation-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
        }
        
        .citation-link:hover {
          text-decoration: underline;
        }
        
        .clear-btn {
          background: #6b7280;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .clear-btn:hover {
          background: #4b5563;
        }
      `}</style>

      <div className="header">
        <h1>🔍 Perplexity Search</h1>
        <p>Search the web with AI-powered insights and real-time information</p>
      </div>

      <div className="search-form">
        <div className="query-section">
          <textarea
            className="query-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                startSearch();
              }
            }}
          />
        </div>

        <div className="controls-row">
          <div className="control-group">
            <label>Max Tokens</label>
            <div className="slider-container">
              <input
                type="range"
                className="slider"
                min="100"
                max="8000"
                step="100"
                value={options.maxTokens}
                onChange={(e) => updateOption('maxTokens', parseInt(e.target.value))}
              />
              <span className="slider-value">{options.maxTokens}</span>
            </div>
          </div>

          <div className="control-group">
            <label>Temperature</label>
            <div className="slider-container">
              <input
                type="range"
                className="slider"
                min="0"
                max="1"
                step="0.1"
                value={options.temperature}
                onChange={(e) => updateOption('temperature', parseFloat(e.target.value))}
              />
              <span className="slider-value">{options.temperature}</span>
            </div>
          </div>

          <div className="control-group">
            <label>Model</label>
            <select
              className="select"
              value={options.model}
              onChange={(e) => updateOption('model', e.target.value)}
            >
              <option value="perplexity/sonar-pro">Sonar Pro ($3/$15)</option>
              <option value="perplexity/sonar">Sonar ($0.15/$0.15)</option>
              <option value="perplexity/sonar-deep-research">Deep Research ($3/$15)</option>
              <option value="perplexity/sonar-reasoning">Reasoning ($3/$15)</option>
            </select>
          </div>

          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={options.enableStreaming}
                onChange={(e) => updateOption('enableStreaming', e.target.checked)}
              />
              Enable Streaming
            </label>
          </div>
        </div>

        <div className="cost-tracker">
          💰 Estimated cost: Input ${cost.input.toFixed(6)} + Output ${cost.output.toFixed(6)} = Total ${cost.total.toFixed(6)}
        </div>

        <div className="examples">
          <button
            className="example-btn"
            onClick={() => loadExample('What are the latest developments in quantum computing?', true)}
          >
            🔬 Tech News (Streaming)
          </button>
          <button
            className="example-btn"
            onClick={() => loadExample('Compare React vs Vue.js for 2024', false)}
          >
            📚 Detailed Comparison (Non-streaming)
          </button>
          <button
            className="example-btn"
            onClick={() => loadExample('Best practices for system design interviews', false)}
          >
            🎯 With Citations
          </button>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={startSearch}
            disabled={isSearching || !query.trim()}
          >
            {isSearching ? '🔍 Searching...' : '🚀 Start Search'}
          </button>

          {isSearching && (
            <button className="btn btn-secondary" onClick={stopSearch}>
              🛑 Stop Search
            </button>
          )}

          <button
            className="btn-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '📐 Hide Advanced' : '⚙️ Advanced Options'}
          </button>

          {response && (
            <button className="clear-btn" onClick={clearResponse}>
              🗑️ Clear
            </button>
          )}
        </div>

        {showAdvanced && (
          <div className="advanced-controls">
            <h3>Advanced Options</h3>
            <div className="advanced-grid">
              <div className="control-group">
                <label>Top P</label>
                <div className="slider-container">
                  <input
                    type="range"
                    className="slider"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={options.topP}
                    onChange={(e) => updateOption('topP', parseFloat(e.target.value))}
                  />
                  <span className="slider-value">{options.topP}</span>
                </div>
              </div>

              <div className="control-group">
                <label>Frequency Penalty</label>
                <div className="slider-container">
                  <input
                    type="range"
                    className="slider"
                    min="0"
                    max="2"
                    step="0.1"
                    value={options.frequencyPenalty}
                    onChange={(e) => updateOption('frequencyPenalty', parseFloat(e.target.value))}
                  />
                  <span className="slider-value">{options.frequencyPenalty}</span>
                </div>
              </div>

              <div className="control-group">
                <label>Context Size</label>
                <select
                  className="select"
                  value={options.contextSize}
                  onChange={(e) => updateOption('contextSize', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="control-group">
                <label>Recency Filter</label>
                <select
                  className="select"
                  value={options.searchRecencyFilter}
                  onChange={(e) => updateOption('searchRecencyFilter', e.target.value)}
                >
                  <option value="">Any time</option>
                  <option value="hour">Past hour</option>
                  <option value="day">Past day</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                </select>
              </div>

              <div className="control-group">
                <label>
                  <input
                    type="checkbox"
                    checked={options.returnCitations}
                    onChange={(e) => updateOption('returnCitations', e.target.checked)}
                  />
                  Return Citations
                </label>
              </div>

              <div className="control-group">
                <label>
                  <input
                    type="checkbox"
                    checked={options.returnImages}
                    onChange={(e) => updateOption('returnImages', e.target.checked)}
                  />
                  Return Images
                </label>
              </div>

              <div className="control-group">
                <label>
                  <input
                    type="checkbox"
                    checked={options.returnRelatedQuestions}
                    onChange={(e) => updateOption('returnRelatedQuestions', e.target.checked)}
                  />
                  Related Questions
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {status && (
        <div className={`status ${statusType}`}>
          {status}
        </div>
      )}

      {(response || citations.length > 0) && (
        <div className="response-section">
          {response && (
            <div className="response-content">
              {response}
            </div>
          )}

          {citations.length > 0 && (
            <div className="citations">
              <h3>📚 Sources & Citations</h3>
              {citations.map((citation, index) => (
                <div key={index} className="citation-item">
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="citation-link"
                  >
                    {citation.title || citation.url}
                  </a>
                  {citation.snippet && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      {citation.snippet}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerplexitySearch; 