import { useState } from 'react';
import Head from 'next/head';

interface YouTubeSearchResult {
  title: string;
  url: string;
  description: string;
  displayUrl: string;
  videoId: string;
  thumbnailUrl: string;
  duration: string;
}

interface SearchResponse {
  webPages: {
    value: YouTubeSearchResult[];
  };
}

const TestYouTubeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{[key: string]: string}>({});
  const [loadingDescriptions, setLoadingDescriptions] = useState<{[key: string]: boolean}>({});

  const handleExpandDescription = async (video: YouTubeSearchResult) => {
    if (expandedDescriptions[video.videoId]) {
      // If already expanded, collapse it
      const newExpanded = { ...expandedDescriptions };
      delete newExpanded[video.videoId];
      setExpandedDescriptions(newExpanded);
      return;
    }

    setLoadingDescriptions(prev => ({ ...prev, [video.videoId]: true }));

    try {
      const response = await fetch(`/api/youtube/details?video_id=${video.videoId}`);
      const data = await response.json();

      if (data.success && data.description) {
        setExpandedDescriptions(prev => ({
          ...prev,
          [video.videoId]: data.description
        }));
      } else {
        console.error('Failed to fetch video details:', data);
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    } finally {
      setLoadingDescriptions(prev => ({ ...prev, [video.videoId]: false }));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/bing-search?query=${encodeURIComponent(searchTerm)}`);
      const data: SearchResponse = await response.json();

      if (data.webPages && data.webPages.value) {
        setSearchResults(data.webPages.value);
      } else {
        setError('No results found');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>YouTube Search Test</title>
      </Head>

      <h1>YouTube Search Test</h1>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter search term..."
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginRight: '10px',
            width: '300px'
          }}
          disabled={isSearching}
        />
        <button
          type="submit"
          disabled={isSearching || !searchTerm.trim()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div>
          <h2>Search Results ({searchResults.length} videos found)</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {searchResults.map((video, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  display: 'flex',
                  gap: '15px'
                }}
              >
                {/* Thumbnail */}
                <div style={{ flexShrink: 0 }}>
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    style={{
                      width: '200px',
                      height: '112px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDIwMCAxMTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTEyIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                    }}
                  />
                </div>
                
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', lineHeight: '1.3' }}>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#1a73e8', textDecoration: 'none' }}
                    >
                      {video.title}
                    </a>
                  </h3>
                  
                  <div style={{ 
                    margin: '0 0 15px 0', 
                    color: '#333', 
                    lineHeight: '1.5',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '2px solid #e1e5e9',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    whiteSpace: 'pre-wrap'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ color: '#1a73e8', fontSize: '14px' }}>
                        📝 Description:
                      </strong>
                      <button
                        onClick={() => handleExpandDescription(video)}
                        disabled={loadingDescriptions[video.videoId]}
                        style={{
                          backgroundColor: loadingDescriptions[video.videoId] ? '#ccc' : '#1a73e8',
                          color: 'white',
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: loadingDescriptions[video.videoId] ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {loadingDescriptions[video.videoId] ? (
                          '⏳ Loading...'
                        ) : expandedDescriptions[video.videoId] ? (
                          '🔼 Collapse'
                        ) : (
                          '🔽 Full Description'
                        )}
                      </button>
                    </div>
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: (expandedDescriptions[video.videoId] || video.description)
                          .replace(/\n/g, '<br/>')
                          .replace(/https?:\/\/[^\s<>]+/g, '<a href="$&" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: underline; word-break: break-all;">$&</a>')
                      }} 
                    />
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div><strong>Duration:</strong> {video.duration}</div>
                      <div><strong>Video ID:</strong> {video.videoId}</div>
                      <div><strong>URL:</strong> <a href={video.url} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8' }}>{video.url}</a></div>
                    </div>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#ff0000',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.backgroundColor = '#cc0000'}
                      onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.backgroundColor = '#ff0000'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.505A2.999 2.999 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.999 2.999 0 0 0 2.112 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.386-.505a2.999 2.999 0 0 0 2.112-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isSearching && searchResults.length === 0 && !error && (
        <p style={{ color: '#666' }}>Enter a search term to find YouTube videos.</p>
      )}
    </div>
  );
};

export default TestYouTubeSearch; 