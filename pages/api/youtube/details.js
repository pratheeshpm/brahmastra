const yts = require('yt-search');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { video_id } = req.query;
    
    if (!video_id) {
      return res.status(400).json({ error: 'video_id parameter is required' });
    }

    console.log(`🔍 Fetching complete details for video ID: ${video_id}`);

    // Search for the specific video by ID to get complete details
    const videoDetails = await yts({ videoId: video_id });
    
    if (!videoDetails) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Return complete video details
    res.json({
      success: true,
      videoId: videoDetails.videoId,
      title: videoDetails.title,
      description: videoDetails.description || 'No description available',
      author: videoDetails.author?.name || 'Unknown',
      views: videoDetails.views,
      duration: videoDetails.duration?.text || videoDetails.timestamp,
      uploadDate: videoDetails.uploadDate,
      url: videoDetails.url,
      thumbnailUrl: videoDetails.thumbnail,
      channelUrl: videoDetails.author?.url
    });

  } catch (error) {
    console.error('Video details API error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
} 