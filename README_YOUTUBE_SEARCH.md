# YouTube Search Feature

A YouTube video search interface that integrates with the existing transcript functionality.

## Current Status

⚠️ **Currently using mock data** - The search API returns sample results due to YouTube blocking automated scraping attempts. The transcript functionality works perfectly with real video IDs.

## Features

- **Search Interface**: Clean, responsive search page at `/youtube-search`
- **Mock Search Results**: Returns sample YouTube videos for testing
- **Transcript Integration**: Click any video to load its real transcript
- **Two-Column Layout**: Search results on left, transcript on right
- **Responsive Design**: Works on mobile and desktop
- **Loading States**: Visual feedback during searches and transcript loading

## API Endpoints

### Search Videos (Mock Data)
```
GET /api/bing-search?query=<SEARCH_TERM>
```

Returns mock YouTube video results for testing the interface.

### Get Transcript (Real Data)
```
GET /api/youtube/transcript?video_id=<VIDEO_ID>&format=text
```

Fetches real transcripts from YouTube videos using the existing transcript extractor.

## Usage

1. Navigate to `/youtube-search` or click "YouTube Search" in the sidebar
2. Enter a search term and press Enter
3. Browse the mock search results
4. Click on any video to load its transcript (if available)
5. The transcript appears in the right panel

## Files

- `pages/youtube-search.tsx` - Main search page component
- `pages/api/bing-search.ts` - Search API (currently mock data)
- `components/Chatbar/components/ChatbarSettings.tsx` - Navigation integration
- `styles/globals.css` - Additional CSS utilities

## Mock Data

The current implementation returns 5 sample videos for any search query:
- Tutorial videos
- Crash courses
- Advanced techniques
- Project tutorials
- Tips and tricks

Each result includes:
- Dynamic title based on search term
- Realistic descriptions
- Valid YouTube video IDs (for transcript testing)
- Proper thumbnail URLs

## YouTube Blocking Issue

**Problem**: YouTube actively blocks automated scraping attempts, even with advanced anti-detection measures including:
- Stealth browser configurations
- User agent spoofing
- Automation flag removal
- Multiple selector strategies

**Attempted Solutions**:
- Puppeteer with stealth settings
- Multiple navigation strategies
- Various selector approaches
- New headless mode
- Anti-detection measures

**Current Workaround**: Mock data allows testing the complete interface and transcript integration while we explore alternative approaches.

## Future Implementation Options

1. **YouTube Data API v3**: Requires API key and has quotas
2. **Alternative Video Platforms**: Search other platforms
3. **RSS Feeds**: YouTube channel RSS feeds (limited)
4. **Proxy Services**: Third-party scraping services
5. **Browser Extension**: Client-side approach

## Dependencies

- `@heroicons/react` - Icons for the interface
- Existing transcript extraction system
- Next.js API routes

## Testing

The interface is fully functional with mock data:

```bash
# Test search API
curl "http://localhost:3000/api/bing-search?query=react%20tutorial"

# Test transcript with mock video ID
curl "http://localhost:3000/api/youtube/transcript?video_id=dQw4w9WgXcQ&format=text"
```

## Styling

Uses Tailwind CSS with custom utilities:
- Line clamp for text truncation
- Responsive grid layouts
- Smooth transitions
- Loading states

The interface maintains consistency with the existing chat application design. 