import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MemoizedReactMarkdown } from '@/components/Markdown/MemoizedReactMarkdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';

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

interface TranscriptResponse {
  success?: boolean;
  text?: string;
  transcript?: Array<{ text: string }>;
  error?: string;
  message?: string;
  source?: 'cache' | 'api';
  cachedAt?: string;
}

type SortOption = 'relevance' | 'duration_desc' | 'duration_asc' | 'title_asc' | 'title_desc' | 'views_desc' | 'recent_first';

// Function to convert duration string to seconds for sorting
const parseDurationToSeconds = (duration: string): number => {
  if (!duration || duration === 'Unknown') return 0;
  
  // Handle formats like "5:23", "1:15:30", "45", etc.
  const parts = duration.split(':').map(part => parseInt(part.trim(), 10));
  
  if (parts.length === 1) {
    // Just seconds: "45"
    return parts[0] || 0;
  } else if (parts.length === 2) {
    // Minutes:Seconds: "5:23"
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  } else if (parts.length === 3) {
    // Hours:Minutes:Seconds: "1:15:30"
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  
  return 0;
};

// Function to extract view count from description
const extractViewCount = (description: string): number => {
  // Look for patterns like "1.2M views", "500K views", "1,234 views"
  const viewMatch = description.match(/([0-9,]+\.?[0-9]*)\s*([KMB])?\s*views/i);
  if (viewMatch) {
    const number = parseFloat(viewMatch[1].replace(/,/g, ''));
    const multiplier = viewMatch[2];
    
    switch (multiplier?.toUpperCase()) {
      case 'K': return number * 1000;
      case 'M': return number * 1000000;
      case 'B': return number * 1000000000;
      default: return number;
    }
  }
  return 0;
};

// Function to extract upload date from description
const extractUploadDate = (description: string): Date => {
  // Look for patterns like "2 days ago", "1 week ago", "3 months ago", "1 year ago"
  const timeMatch = description.match(/(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago/i);
  if (timeMatch) {
    const number = parseInt(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    const now = new Date();
    
    switch (unit) {
      case 'second': return new Date(now.getTime() - number * 1000);
      case 'minute': return new Date(now.getTime() - number * 60 * 1000);
      case 'hour': return new Date(now.getTime() - number * 60 * 60 * 1000);
      case 'day': return new Date(now.getTime() - number * 24 * 60 * 60 * 1000);
      case 'week': return new Date(now.getTime() - number * 7 * 24 * 60 * 60 * 1000);
      case 'month': return new Date(now.getTime() - number * 30 * 24 * 60 * 60 * 1000);
      case 'year': return new Date(now.getTime() - number * 365 * 24 * 60 * 60 * 1000);
      default: return new Date(0);
    }
  }
  return new Date(0);
};

const YouTubeSearchPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [originalSearchResults, setOriginalSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeSearchResult | null>(null);
  const [lastTranscriptSource, setLastTranscriptSource] = useState<'cache' | 'api' | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{[key: string]: string}>({});
  const [loadingDescriptions, setLoadingDescriptions] = useState<{[key: string]: boolean}>({});
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [lastSummarySource, setLastSummarySource] = useState<'cache' | 'api' | null>(null);
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  const [isSavingManualTranscript, setIsSavingManualTranscript] = useState(false);

  // Handle URL query parameters on component mount
  useEffect(() => {
    if (router.isReady) {
      const { q, query } = router.query;
      const searchQuery = (q || query) as string;
      
      if (searchQuery && searchQuery.trim()) {
        setSearchTerm(searchQuery);
        performSearch(searchQuery);
      }
    }
  }, [router.isReady, router.query]);

  // Sort results whenever sortOption changes
  useEffect(() => {
    if (originalSearchResults.length > 0) {
      const sortedResults = sortResults(originalSearchResults, sortOption);
      setSearchResults(sortedResults);
    }
  }, [sortOption, originalSearchResults]);

  // Function to sort results based on the selected option
  const sortResults = (results: YouTubeSearchResult[], option: SortOption): YouTubeSearchResult[] => {
    const sortedResults = [...results];
    
    switch (option) {
      case 'duration_desc':
        return sortedResults.sort((a, b) => {
          const durationA = parseDurationToSeconds(a.duration);
          const durationB = parseDurationToSeconds(b.duration);
          return durationB - durationA; // Descending (longest first)
        });
      
      case 'duration_asc':
        return sortedResults.sort((a, b) => {
          const durationA = parseDurationToSeconds(a.duration);
          const durationB = parseDurationToSeconds(b.duration);
          return durationA - durationB; // Ascending (shortest first)
        });
      
      case 'title_asc':
        return sortedResults.sort((a, b) => a.title.localeCompare(b.title));
      
      case 'title_desc':
        return sortedResults.sort((a, b) => b.title.localeCompare(a.title));
      
      case 'views_desc':
        return sortedResults.sort((a, b) => {
          const viewsA = extractViewCount(a.description);
          const viewsB = extractViewCount(b.description);
          return viewsB - viewsA; // Descending (most views first)
        });
      
      case 'recent_first':
        return sortedResults.sort((a, b) => {
          const dateA = extractUploadDate(a.description);
          const dateB = extractUploadDate(b.description);
          return dateB.getTime() - dateA.getTime(); // Most recent first
        });
      
      case 'relevance':
      default:
        return sortedResults; // Keep original order (relevance from search API)
    }
  };

  // Separate search function that can be called from multiple places
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSelectedTranscript(null);
    setSelectedVideo(null);

    try {
      const response = await fetch(`/api/bing-search?query=${encodeURIComponent(query)}`);
      const data: SearchResponse = await response.json();

      if (data.webPages && data.webPages.value) {
        setOriginalSearchResults(data.webPages.value);
        // Apply current sort option to new results
        const sortedResults = sortResults(data.webPages.value, sortOption);
        setSearchResults(sortedResults);
      } else {
        console.error('Search failed:', data);
        setSearchResults([]);
        setOriginalSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setOriginalSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Update URL with search query
    router.push({
      pathname: '/youtube-search',
      query: { q: searchTerm }
    }, undefined, { shallow: true });

    // Perform the search
    await performSearch(searchTerm);
  };

  const handleSortChange = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
  };

  const handleExpandDescription = async (video: YouTubeSearchResult, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering transcript fetch
    
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

  const handleVideoClick = async (video: YouTubeSearchResult) => {
    setSelectedVideo(video);
    setIsLoadingTranscript(true);
    setSelectedTranscript(null);
    setSummary(null); // Reset summary when switching videos
    setShowSummary(false);
    setLastSummarySource(null);
    setShowManualInput(false); // Reset manual input state
    setManualTranscript('');

    try {
      const encodedTitle = encodeURIComponent(video.title);
      const response = await fetch(`/api/youtube/transcript?video_id=${video.videoId}&format=text&title=${encodedTitle}`);
      const data: TranscriptResponse = await response.json();

      console.log('Transcript API response:', data); // Debug log

      // Handle different response formats
      if (data.text) {
        setSelectedTranscript(data.text);
        setLastTranscriptSource(data.source || 'api');
      } else if (data.success && data.text) {
        setSelectedTranscript(data.text);
        setLastTranscriptSource(data.source || 'api');
      } else if (data.transcript && Array.isArray(data.transcript)) {
        // Handle array format transcript
        const transcriptText = data.transcript.map(item => item.text).join(' ');
        setSelectedTranscript(transcriptText);
        setLastTranscriptSource(data.source || 'api');
      } else if (data.error === 'rate_limited') {
        setSelectedTranscript(`⚠️ Rate Limited by YouTube\n\n${data.message || 'YouTube is blocking transcript requests from your network.'}\n\nSuggestions:\n• Switch to a different WiFi network\n• Use mobile data instead of WiFi\n• Wait 15-30 minutes and try again\n• Try a VPN if available\n\nThis is a temporary limitation imposed by YouTube's anti-bot measures.`);
        setLastTranscriptSource(null);
      } else if (data.error === 'timeout') {
        setSelectedTranscript(`⏱️ Request Timed Out\n\n${data.message || 'Transcript extraction took too long and was cancelled.'}\n\nThis usually happens when:\n• YouTube is blocking your network\n• The video has very long transcripts\n• Network connection is slow\n\nSuggestions:\n• Try switching networks\n• Wait a few minutes and retry\n• Try a different video first`);
        setLastTranscriptSource(null);
      } else if (data.error) {
        setSelectedTranscript(`Error: ${data.error}`);
        setLastTranscriptSource(null);
      } else {
        setSelectedTranscript('Transcript not available for this video.');
        setLastTranscriptSource(null);
      }
    } catch (error) {
      console.error('Transcript error:', error);
      
      // Check if it's a rate limiting error (429 status)
      if (error instanceof Error && error.message.includes('429')) {
        setSelectedTranscript(`⚠️ Rate Limited by YouTube\n\nYouTube is blocking transcript requests from your network.\n\nSuggestions:\n• Switch to a different WiFi network\n• Use mobile data instead of WiFi\n• Wait 15-30 minutes and try again\n• Try a VPN if available\n\nThis is a temporary limitation imposed by YouTube's anti-bot measures.`);
      } else {
        setSelectedTranscript('Failed to load transcript.');
      }
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const checkCachedSummary = async () => {
    if (!selectedVideo) return;

    try {
      const response = await fetch('/api/youtube/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: selectedTranscript,
          model_id: 'gpt-4o',
          video_id: selectedVideo.videoId,
          title: selectedVideo.title,
          force_refresh: false, // This will check cache first
        }),
      });

      if (response.ok) {
        const cacheStatus = response.headers.get('X-Cache-Status');
        if (cacheStatus === 'hit') {
          // We have a cached summary, read it
          setLastSummarySource('cache');
          
          const reader = response.body?.getReader();
          if (reader) {
            let summaryText = '';
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
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.content) {
                      summaryText += data.content;
                    } else if (data.done) {
                      break;
                    }
                  } catch (parseError) {
                    // Ignore parse errors
                  }
                }
              }
            }
            
            if (summaryText.trim()) {
              setSummary(summaryText);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking cached summary:', error);
    }
  };

  const handleSummarizeTranscript = async (forceRefresh = false) => {
    if (!selectedTranscript || selectedTranscript.includes('Error:') || selectedTranscript.includes('not available') || !selectedVideo) {
      return;
    }

    setIsLoadingSummary(true);
    setSummary(null);
    setLastSummarySource(null);

    try {
      const response = await fetch('/api/youtube/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: selectedTranscript,
          model_id: 'gpt-4o', // Use OpenAI GPT-4o by default for summarization
          video_id: selectedVideo.videoId,
          title: selectedVideo.title,
          force_refresh: forceRefresh,
          // key is handled server-side using OpenAI API key
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if this was from cache
      const cacheStatus = response.headers.get('X-Cache-Status');
      setLastSummarySource(cacheStatus === 'hit' ? 'cache' : 'api');

      // Handle Server-Sent Events streaming like the chat system
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let summaryText = '';
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.content) {
                summaryText += data.content;
                setSummary(summaryText);
              } else if (data.done) {
                // Stream completed
                break;
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }

    } catch (error) {
      console.error('Summarization error:', error);
      setSummary('Failed to generate summary. Please try again.');
      setLastSummarySource(null);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleDeleteSummaryCache = async () => {
    if (!selectedVideo) return;

    try {
      const response = await fetch(`/api/youtube/summary-cache?videoId=${selectedVideo.videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Summary cache deleted successfully');
        // Reset summary and source to force fresh generation
        setSummary(null);
        setLastSummarySource(null);
      } else {
        console.error('Failed to delete summary cache');
      }
    } catch (error) {
      console.error('Error deleting summary cache:', error);
    }
  };

  const handleManualTranscriptSubmit = async () => {
    if (manualTranscript.trim() && selectedVideo) {
      const cleanTranscript = manualTranscript.trim();
      setIsSavingManualTranscript(true);
      
      // Save manual transcript to cache
      try {
        const cacheResponse = await fetch('/api/youtube/cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId: selectedVideo.videoId,
            title: selectedVideo.title,
            transcript: cleanTranscript,
            method: 'manual_input',
            source: 'manual'
          }),
        });

        if (cacheResponse.ok) {
          console.log('✅ Manual transcript saved to cache');
          setLastTranscriptSource('cache'); // Mark as cached since we just saved it
        } else {
          console.warn('⚠️ Failed to save manual transcript to cache');
          setLastTranscriptSource(null); // Mark as manual input if caching failed
        }
      } catch (error) {
        console.error('❌ Error saving manual transcript to cache:', error);
        setLastTranscriptSource(null); // Mark as manual input if caching failed
      } finally {
        setIsSavingManualTranscript(false);
      }

      setSelectedTranscript(cleanTranscript);
      setShowManualInput(false);
      setManualTranscript('');
      console.log('Manual transcript submitted and cached');
    }
  };

  const handleCancelManualInput = () => {
    setShowManualInput(false);
    setManualTranscript('');
  };

  const handleDeleteTranscriptCache = async () => {
    if (!selectedVideo) return;

    try {
      const response = await fetch(`/api/youtube/cache?videoId=${selectedVideo.videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Transcript cache deleted successfully');
        // Reset transcript and source to force fresh generation
        setSelectedTranscript(null);
        setLastTranscriptSource(null);
        // Also reset summary since it depends on transcript
        setSummary(null);
        setLastSummarySource(null);
      } else {
        console.error('Failed to delete transcript cache');
      }
    } catch (error) {
      console.error('Error deleting transcript cache:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>YouTube Search - Chatbot UI</title>
        <meta name="description" content="Search YouTube videos and view transcripts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-4 min-h-screen flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">YouTube Video Search</h1>
            <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              ← Back to Chat
            </Link>
          </div>
          <p className="text-gray-300 text-sm">
            Search for YouTube videos and view their transcripts
            <span className="text-xs text-gray-400 ml-2">
              💡 Tip: Use URL parameters like <code className="bg-gray-800 px-1 rounded">?q=your+search+term</code>
            </span>
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-4 flex-shrink-0">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter search term..."
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              disabled={isSearching}
            />
            <button
              type="submit"
              disabled={isSearching || !searchTerm.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Search Results */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Search Results</h2>
              
              {/* Sort Dropdown */}
              {searchResults.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm text-gray-300">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortOption}
                    onChange={(e) => handleSortChange(e.target.value as SortOption)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="duration_desc">Duration (Longest First)</option>
                    <option value="duration_asc">Duration (Shortest First)</option>
                    <option value="views_desc">Most Views</option>
                    <option value="recent_first">Most Recent</option>
                    <option value="title_asc">Title (A-Z)</option>
                    <option value="title_desc">Title (Z-A)</option>
                  </select>
                </div>
              )}
            </div>
            
            {searchResults.length === 0 && !isSearching && (
              <p className="text-gray-400">No results yet. Enter a search term to get started.</p>
            )}

            {/* Results Count and Sort Info */}
            {searchResults.length > 0 && (
              <div className="mb-3 text-sm text-gray-400 flex items-center justify-between">
                <span>{searchResults.length} video{searchResults.length !== 1 ? 's' : ''} found</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  {sortOption === 'relevance' && 'Sorted by relevance'}
                  {sortOption === 'duration_desc' && 'Sorted by duration (longest first)'}
                  {sortOption === 'duration_asc' && 'Sorted by duration (shortest first)'}
                  {sortOption === 'views_desc' && 'Sorted by most views'}
                  {sortOption === 'recent_first' && 'Sorted by most recent'}
                  {sortOption === 'title_asc' && 'Sorted by title (A-Z)'}
                  {sortOption === 'title_desc' && 'Sorted by title (Z-A)'}
                </span>
              </div>
            )}

            <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {searchResults.map((video, index) => (
                <div
                  key={index}
                  onClick={() => handleVideoClick(video)}
                  className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all hover:bg-gray-700 border-2 ${
                    selectedVideo?.videoId === video.videoId 
                      ? 'border-blue-500 bg-gray-700' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 relative">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-32 h-24 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/favicon.ico';
                        }}
                      />
                      {/* Duration badge */}
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white mb-3 line-clamp-2">
                        {video.title}
                      </h3>
                      
                      {/* Complete Description with Links */}
                      <div className="text-sm text-gray-300 mb-3 p-3 bg-gray-900 rounded border border-gray-700 max-h-48 overflow-y-auto">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-400 font-medium">Description:</span>
                          <button
                            onClick={(e) => handleExpandDescription(video, e)}
                            disabled={loadingDescriptions[video.videoId]}
                            className="text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                          >
                            {loadingDescriptions[video.videoId] ? (
                              <>
                                <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                                Loading...
                              </>
                            ) : expandedDescriptions[video.videoId] ? (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                Collapse
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Full Description
                              </>
                            )}
                          </button>
                        </div>
                        <div 
                          className="leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ 
                            __html: (expandedDescriptions[video.videoId] || video.description)
                              .replace(/\n/g, '<br/>')
                              .replace(/https?:\/\/[^\s<>]+/g, '<a href="$&" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline break-all">$&</a>')
                          }} 
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{video.displayUrl}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Duration: {video.duration}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400">Video ID: {video.videoId}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(video.url);
                              setCopiedVideoId(video.videoId);
                              setTimeout(() => setCopiedVideoId(null), 2000);
                            }}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                              copiedVideoId === video.videoId 
                                ? 'bg-green-600 text-green-100' 
                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                            }`}
                            title="Copy YouTube video URL"
                          >
                            {copiedVideoId === video.videoId ? (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Share
                              </>
                            )}
                          </button>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} // Prevent triggering transcript fetch
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.498 6.186a2.999 2.999 0 0 0-2.112-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.505A2.999 2.999 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.999 2.999 0 0 0 2.112 2.136C4.495 20.455 12 20.455 12 20.455s7.505 0 9.386-.505a2.999 2.999 0 0 0 2.112-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            Watch
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript Display */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Transcript</h2>
              <div className="flex items-center gap-2">
                {selectedVideo && !showManualInput && (
                  <button
                    onClick={() => setShowManualInput(true)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                    title="Enter transcript manually"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Manual Input
                  </button>
                )}
                {selectedVideo && !isLoadingTranscript && selectedTranscript && 
                 !selectedTranscript.includes('Error:') && !selectedTranscript.includes('not available') && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      if (!showSummary) {
                        // Switching to summary view - check for cached summary first
                        setShowSummary(true);
                        if (!summary) {
                          await checkCachedSummary();
                        }
                      } else {
                        // Switching back to transcript view
                        setShowSummary(false);
                      }
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      showSummary 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
                    }`}
                  >
                    {showSummary ? '📄 Show Transcript' : '🤖 Show Summary'}
                  </button>
                  {showSummary && !summary && (
                    <button
                      onClick={() => handleSummarizeTranscript(false)}
                      disabled={isLoadingSummary}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      {isLoadingSummary ? (
                        <>
                          <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                          Summarizing...
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Generate Summary
                        </>
                      )}
                    </button>
                  )}
                  {showSummary && summary && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSummarizeTranscript(true)}
                        disabled={isLoadingSummary}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                        title="Generate fresh summary from AI"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </button>
                      <button
                        onClick={handleDeleteSummaryCache}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                        title="Delete cached summary"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Cache
                      </button>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 max-h-[calc(100vh-12rem)] flex flex-col">
              {!selectedVideo && (
                <p className="text-gray-400">Click on a video to view its transcript</p>
              )}

              {/* Manual Transcript Input */}
              {showManualInput && selectedVideo && (
                <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <h4 className="text-lg font-medium text-blue-400 mb-3">Enter Transcript Manually</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Paste the transcript text below. This is useful when automatic extraction fails.
                  </p>
                  <textarea
                    value={manualTranscript}
                    onChange={(e) => setManualTranscript(e.target.value)}
                    placeholder="Paste the video transcript here..."
                    className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white resize-vertical"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={handleCancelManualInput}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleManualTranscriptSubmit}
                      disabled={!manualTranscript.trim() || isSavingManualTranscript}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      {isSavingManualTranscript ? (
                        <>
                          <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                          Saving...
                        </>
                      ) : (
                        'Use This Transcript'
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {selectedVideo && isLoadingTranscript && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3">Loading transcript...</span>
                </div>
              )}
              
              {selectedVideo && !isLoadingTranscript && selectedTranscript && (
                <div className="flex flex-col h-full">
                  <div className="mb-4 pb-4 border-b border-gray-600">
                    <h3 className="font-medium text-blue-400">{selectedVideo.title}</h3>
                    <div className="flex justify-between items-center">
                      <a 
                        href={selectedVideo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-gray-300"
                      >
                        View on YouTube ↗
                      </a>
                      <div className="flex items-center gap-2">
                        {(lastTranscriptSource || (!lastTranscriptSource && selectedTranscript)) && (
                          <div className="flex items-center gap-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              lastTranscriptSource === 'cache' 
                                ? 'bg-green-600 text-green-100' 
                                : lastTranscriptSource === 'api'
                                ? 'bg-blue-600 text-blue-100'
                                : 'bg-purple-600 text-purple-100'
                            }`}>
                              {lastTranscriptSource === 'cache' 
                                ? '📁 Transcript Cache' 
                                : lastTranscriptSource === 'api'
                                ? '🌐 Fresh Transcript'
                                : '✏️ Manual Transcript'}
                            </span>
                            {lastTranscriptSource === 'cache' && (
                              <button
                                onClick={handleDeleteTranscriptCache}
                                className="text-xs bg-red-500 hover:bg-red-600 text-white px-1 py-1 rounded transition-colors flex items-center"
                                title="Delete transcript cache"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                        {showSummary && (
                          <span className="text-xs px-2 py-1 rounded bg-purple-600 text-purple-100">
                            🤖 AI Summary
                          </span>
                        )}
                        {showSummary && lastSummarySource && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            lastSummarySource === 'cache' 
                              ? 'bg-orange-600 text-orange-100' 
                              : 'bg-cyan-600 text-cyan-100'
                          }`}>
                            {lastSummarySource === 'cache' ? '💾 Summary Cache' : '✨ Fresh Summary'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Display */}
                  <div className={`leading-relaxed overflow-y-auto max-h-[calc(100vh-20rem)] ${
                    selectedTranscript?.includes('⚠️ Rate Limited') 
                      ? 'text-yellow-200 bg-yellow-900/20 p-4 rounded border border-yellow-600' 
                      : selectedTranscript?.includes('⏱️ Request Timed Out')
                      ? 'text-orange-200 bg-orange-900/20 p-4 rounded border border-orange-600'
                      : 'text-gray-200'
                  }`}>
                    {showSummary ? (
                      <div>
                        {isLoadingSummary && (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                            <span className="ml-3 text-purple-400">Generating AI summary...</span>
                          </div>
                        )}
                        {summary ? (
                          <MemoizedReactMarkdown
                            className="prose prose-invert max-w-none prose-purple"
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeMathjax]}
                          >
                            {summary}
                          </MemoizedReactMarkdown>
                        ) : !isLoadingSummary && (
                          <div className="text-center py-8">
                            <p className="text-gray-400 mb-4">No summary generated yet.</p>
                            <button
                              onClick={() => handleSummarizeTranscript(false)}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors flex items-center gap-2 mx-auto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Generate AI Summary
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="whitespace-pre-wrap">
                          {selectedTranscript}
                        </div>
                        {(selectedTranscript?.includes('⚠️ Rate Limited') || selectedTranscript?.includes('⏱️ Request Timed Out')) && (
                          <div className={`mt-4 pt-4 ${
                            selectedTranscript?.includes('⚠️ Rate Limited') 
                              ? 'border-t border-yellow-600' 
                              : 'border-t border-orange-600'
                          }`}>
                            <button
                              onClick={() => selectedVideo && handleVideoClick(selectedVideo)}
                              className={`px-4 py-2 rounded font-medium transition-colors flex items-center gap-2 ${
                                selectedTranscript?.includes('⚠️ Rate Limited')
                                  ? 'bg-yellow-600 hover:bg-yellow-700 text-yellow-100'
                                  : 'bg-orange-600 hover:bg-orange-700 text-orange-100'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              {selectedTranscript?.includes('⚠️ Rate Limited') 
                                ? 'Retry After Network Switch' 
                                : 'Retry Transcript Extraction'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeSearchPage;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
      ])),
    },
  };
}; 