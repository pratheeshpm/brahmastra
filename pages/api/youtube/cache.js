const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(process.cwd(), 'transcript-cache');

// Helper function to sanitize filename
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9_-]/gi, '_').substring(0, 100);
}

// Helper function to get cache file path
function getCacheFilePath(videoId, title) {
  const sanitizedTitle = sanitizeFilename(title || 'untitled');
  const filename = `${videoId}_${sanitizedTitle}.json`;
  return path.join(CACHE_DIR, filename);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(CACHE_DIR)) {
        return res.json({ cached: [], count: 0 });
      }

      const files = fs.readdirSync(CACHE_DIR);
      const cachedTranscripts = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          try {
            const filePath = path.join(CACHE_DIR, file);
            const stats = fs.statSync(filePath);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            return {
              filename: file,
              videoId: data.videoId,
              title: data.title,
              cachedAt: data.cachedAt,
              size: stats.size,
              hasTranscript: !!data.text
            };
          } catch (error) {
            console.error(`Error reading cache file ${file}:`, error);
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.cachedAt) - new Date(a.cachedAt));

      res.json({ 
        cached: cachedTranscripts, 
        count: cachedTranscripts.length,
        cacheDir: CACHE_DIR
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { videoId } = req.query;
      
      if (!videoId) {
        return res.status(400).json({ error: 'videoId parameter required' });
      }

      const files = fs.readdirSync(CACHE_DIR);
      const matchingFiles = files.filter(file => file.startsWith(`${videoId}_`));
      
      if (matchingFiles.length === 0) {
        return res.status(404).json({ error: 'Cached transcript not found' });
      }

      matchingFiles.forEach(file => {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      });

      res.json({ 
        success: true, 
        deleted: matchingFiles.length,
        files: matchingFiles 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { videoId, title, transcript, method = 'manual_input', source = 'manual' } = req.body;
      
      if (!videoId || !transcript) {
        return res.status(400).json({ error: 'videoId and transcript are required' });
      }

      // Ensure cache directory exists
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }

      // Create cache data structure similar to automatic extraction
      const cacheData = {
        success: true,
        method: method,
        text: transcript,
        transcript: transcript.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).map(text => ({ text: text.trim() })),
        language: 'unknown', // Manual input doesn't have language detection
        source: source,
        cachedAt: new Date().toISOString(),
        videoId: videoId,
        title: title || 'Manual Input'
      };

      // Save to cache file
      const cacheFile = getCacheFilePath(videoId, title);
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
      
      console.log(`💾 Saved manual transcript to cache: ${path.basename(cacheFile)}`);
      
      res.json({ 
        success: true, 
        message: 'Manual transcript saved to cache',
        filename: path.basename(cacheFile),
        cachedAt: cacheData.cachedAt
      });
    } catch (error) {
      console.error('Error saving manual transcript to cache:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    // Handle editing existing transcript
    try {
      const { videoId, title, transcript } = req.body;
      
      if (!videoId || !transcript) {
        return res.status(400).json({ error: 'videoId and transcript are required' });
      }

      // Ensure cache directory exists
      if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
      }

      // Find existing cache file
      const files = fs.readdirSync(CACHE_DIR);
      const matchingFiles = files.filter(file => file.startsWith(`${videoId}_`));
      
      let existingData = null;
      let cacheFile = null;
      
      if (matchingFiles.length > 0) {
        // Load existing data
        cacheFile = path.join(CACHE_DIR, matchingFiles[0]);
        existingData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } else {
        // Create new cache file if none exists
        cacheFile = getCacheFilePath(videoId, title);
        existingData = {
          success: true,
          method: 'manual_input',
          language: 'unknown',
          source: 'manual',
          videoId: videoId,
          title: title || 'Manual Input'
        };
      }

      // Update the transcript data
      const updatedData = {
        ...existingData,
        text: transcript,
        transcript: transcript.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).map(text => ({ text: text.trim() })),
        source: 'edited',
        cachedAt: new Date().toISOString(),
        lastEditedAt: new Date().toISOString()
      };

      // Save updated data
      fs.writeFileSync(cacheFile, JSON.stringify(updatedData, null, 2));
      
      console.log(`✏️ Updated transcript in cache: ${path.basename(cacheFile)}`);
      
      res.json({ 
        success: true, 
        message: 'Transcript updated successfully',
        filename: path.basename(cacheFile),
        cachedAt: updatedData.cachedAt,
        lastEditedAt: updatedData.lastEditedAt
      });
    } catch (error) {
      console.error('Error updating transcript in cache:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 