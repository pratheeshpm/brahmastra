import { NextApiRequest, NextApiResponse } from 'next';
import yts from 'yt-search';

interface YouTubeSearchResult {
  title: string;
  url: string;
  description: string;
  displayUrl: string;
  videoId: string;
  thumbnailUrl: string;
  duration: string;
}

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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log('Searching YouTube for:', query);

    // Search YouTube using yt-search
    const searchResults = await yts(query);
    
    // Extract up to 10 video results
    const videos = searchResults.videos.slice(0, 10);
    
    // Transform results to match our interface
    const results: YouTubeSearchResult[] = videos.map((video: any) => ({
      title: video.title,
      url: video.url,
      description: video.description || `${video.author.name} • ${video.views} views • ${video.ago}`,
      displayUrl: 'youtube.com',
      videoId: video.videoId,
      thumbnailUrl: video.thumbnail,
      duration: video.duration?.text || video.timestamp || 'Unknown'
    }));

    // Sort by duration (longest first)
    results.sort((a, b) => {
      const durationA = parseDurationToSeconds(a.duration);
      const durationB = parseDurationToSeconds(b.duration);
      return durationB - durationA; // Descending order (longest first)
    });

    console.log(`Found ${results.length} YouTube videos (sorted by duration)`);
    
    return res.status(200).json({
      webPages: {
        value: results
      }
    });

  } catch (error) {
    console.error('YouTube search error:', error);
    return res.status(500).json({ 
      error: 'Failed to search YouTube',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default handler; 