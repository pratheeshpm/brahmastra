# YouTube Transcript Extractor

A robust YouTube transcript extraction system with multiple fallback methods and rate limiting protection.

## Features

- **Multiple Extraction Methods** with automatic fallback:
  1. `youtube-transcript` library (fastest)
  2. `youtube-dl-exec` with yt-dlp (most reliable)
  3. `puppeteer` web scraping (last resort)

- **Rate Limiting Protection**:
  - In-memory cache to track rate-limited methods
  - Automatic method skipping when rate limited
  - 15-minute cooldown periods
  - Graceful fallback between methods

- **URL Processing**:
  - Support for multiple YouTube URL formats
  - Automatic video ID extraction
  - URL validation

- **Response Formats**:
  - Raw transcript with timestamps
  - Clean text without timestamps
  - Method used for extraction
  - Language detection
  - Available languages list

## API Endpoints

### Get Full Transcript
```
GET /api/youtube/transcript?url=<YOUTUBE_URL>
GET /api/youtube/transcript?video_id=<VIDEO_ID>
```

### Get Text Only
```
GET /api/youtube/transcript?url=<YOUTUBE_URL>&format=text
GET /api/youtube/transcript?video_id=<VIDEO_ID>&format=text
```

## Example Usage

### Full Transcript Response
```bash
curl "http://localhost:3000/api/youtube/transcript?url=https://www.youtube.com/watch?v=Cg3XIqs_-4c"
```

Response:
```json
{
  "success": true,
  "method": "youtube-dl",
  "transcript": [
    { "text": "okay so today we're going to be solving" },
    { "text": "the tiny URL system design interview" }
  ],
  "text": "okay so today we're going to be solving the tiny URL system design interview...",
  "language": "en",
  "subtitleType": "automatic_captions",
  "availableLanguages": ["en", "es", "fr", "de", "it", ...]
}
```

### Text Only Response
```bash
curl "http://localhost:3000/api/youtube/transcript?url=https://www.youtube.com/watch?v=Cg3XIqs_-4c&format=text"
```

Response:
```json
{
  "text": "okay so today we're going to be solving the tiny URL system design interview..."
}
```

## Supported URL Formats

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- Direct video ID: `VIDEO_ID`

## Error Handling

The system gracefully handles:
- Rate limiting (429 errors)
- Network timeouts
- Missing transcripts
- Invalid URLs
- Method failures with automatic fallback

## File Structure

```
src/
├── extractors/
│   ├── youtubeTranscript.js     # Method 1: youtube-transcript
│   ├── youtubeDlExtractor.js    # Method 2: youtube-dl-exec
│   └── puppeteerExtractor.js    # Method 3: Puppeteer
├── utils/
│   ├── urlParser.js             # URL/ID extraction
│   └── rateLimiter.js           # Rate limiting logic
└── transcriptExtractor.js       # Main orchestrator

pages/api/youtube/
└── transcript.js                # Next.js API route
```

## Dependencies

- `youtube-transcript` - Primary transcript extraction
- `youtube-dl-exec` - Fallback method using yt-dlp
- `puppeteer` - Web scraping fallback
- `axios` - HTTP requests for subtitle downloads

## Rate Limiting

Each extraction method has independent rate limiting:
- 15-minute cooldown after rate limit detection
- Automatic method skipping during cooldown
- Exponential backoff between retry attempts

## Language Support

The system automatically detects and extracts transcripts in multiple languages, with preference for:
1. English (`en`)
2. English US (`en-US`)
3. English GB (`en-GB`)
4. First available language

## Performance

- **Method 1 (youtube-transcript)**: ~100-500ms
- **Method 2 (youtube-dl-exec)**: ~2-5 seconds
- **Method 3 (puppeteer)**: ~5-10 seconds

The system automatically uses the fastest available method. 