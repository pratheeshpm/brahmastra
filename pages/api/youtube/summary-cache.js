const fs = require('fs');
const path = require('path');

const SUMMARY_CACHE_DIR = path.join(process.cwd(), 'summary-cache');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(SUMMARY_CACHE_DIR)) {
        return res.json({ cached: [], count: 0 });
      }

      const { videoId } = req.query;
      const files = fs.readdirSync(SUMMARY_CACHE_DIR);

      if (videoId) {
        // Return specific video data including full content
        const matchingFiles = files.filter(file => file.startsWith(`${videoId}_`));
        if (matchingFiles.length > 0) {
          const filePath = path.join(SUMMARY_CACHE_DIR, matchingFiles[0]);
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          return res.json({ 
            cached: [data], 
            count: 1 
          });
        } else {
          return res.json({ cached: [], count: 0 });
        }
      }

      // Return all cached summaries (original behavior)
      const cachedSummaries = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          try {
            const filePath = path.join(SUMMARY_CACHE_DIR, file);
            const stats = fs.statSync(filePath);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            return {
              filename: file,
              videoId: data.videoId,
              title: data.title,
              cachedAt: data.cachedAt,
              size: stats.size,
              hasSummary: !!data.summary,
              hasKeywords: !!data.keywords,
              model: data.model || 'unknown'
            };
          } catch (error) {
            console.error(`Error reading summary cache file ${file}:`, error);
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.cachedAt) - new Date(a.cachedAt));

      res.json({ 
        cached: cachedSummaries, 
        count: cachedSummaries.length,
        cacheDir: SUMMARY_CACHE_DIR
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

      if (!fs.existsSync(SUMMARY_CACHE_DIR)) {
        return res.status(404).json({ error: 'Summary cache directory not found' });
      }

      const files = fs.readdirSync(SUMMARY_CACHE_DIR);
      const matchingFiles = files.filter(file => file.startsWith(`${videoId}_`));
      
      if (matchingFiles.length === 0) {
        return res.status(404).json({ error: 'Cached summary not found' });
      }

      matchingFiles.forEach(file => {
        fs.unlinkSync(path.join(SUMMARY_CACHE_DIR, file));
      });

      res.json({ 
        success: true, 
        deleted: matchingFiles.length,
        files: matchingFiles 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    // Handle editing existing summary or keywords
    try {
      const { videoId, title, summary, keywords, model = 'gpt-4o-mini' } = req.body;
      
      if (!videoId || (!summary && !keywords)) {
        return res.status(400).json({ error: 'videoId and either summary or keywords are required' });
      }

      // Ensure cache directory exists
      if (!fs.existsSync(SUMMARY_CACHE_DIR)) {
        fs.mkdirSync(SUMMARY_CACHE_DIR, { recursive: true });
      }

      // Helper function to generate cache filename (same as in summarize.ts)
      const getCacheFilename = (videoId, title, model) => {
        const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
        return `${videoId}_${cleanTitle}_${model}_v5.json`;
      };

      // Find existing cache file
      const files = fs.readdirSync(SUMMARY_CACHE_DIR);
      const matchingFiles = files.filter(file => file.startsWith(`${videoId}_`));
      
      let existingData = null;
      let cacheFile = null;
      
      if (matchingFiles.length > 0) {
        // Load existing data from the first matching file
        cacheFile = path.join(SUMMARY_CACHE_DIR, matchingFiles[0]);
        existingData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } else {
        // Create new cache file if none exists
        const filename = getCacheFilename(videoId, title || 'Manual Input', model);
        cacheFile = path.join(SUMMARY_CACHE_DIR, filename);
        existingData = {
          videoId: videoId,
          title: title || 'Manual Input',
          model: model
        };
      }

      // Update the data (summary and/or keywords)
      const updatedData = {
        ...existingData,
        cachedAt: new Date().toISOString(),
        lastEditedAt: new Date().toISOString(),
        generatedAt: Date.now()
      };

      // Update summary if provided
      if (summary) {
        updatedData.summary = summary;
      }

      // Update keywords if provided
      if (keywords) {
        updatedData.keywords = keywords;
        updatedData.keywordsGeneratedAt = new Date().toISOString();
      }

      // Save updated data
      fs.writeFileSync(cacheFile, JSON.stringify(updatedData, null, 2));
      
      console.log(`✏️ Updated summary in cache: ${path.basename(cacheFile)}`);
      
      res.json({ 
        success: true, 
        message: 'Summary updated successfully',
        filename: path.basename(cacheFile),
        cachedAt: updatedData.cachedAt,
        lastEditedAt: updatedData.lastEditedAt
      });
    } catch (error) {
      console.error('Error updating summary in cache:', error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    // Handle saving new summary (for compatibility with existing code)
    try {
      const { videoId, title, summary, model = 'gpt-4o-mini' } = req.body;
      
      if (!videoId || !summary) {
        return res.status(400).json({ error: 'videoId and summary are required' });
      }

      // Ensure cache directory exists
      if (!fs.existsSync(SUMMARY_CACHE_DIR)) {
        fs.mkdirSync(SUMMARY_CACHE_DIR, { recursive: true });
      }

      // Helper function to generate cache filename (same as in summarize.ts)
      const getCacheFilename = (videoId, title, model) => {
        const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
        return `${videoId}_${cleanTitle}_${model}_v5.json`;
      };

      const filename = getCacheFilename(videoId, title || 'Manual Input', model);
      const cacheFile = path.join(SUMMARY_CACHE_DIR, filename);

      // Create cache data structure
      const cacheData = {
        videoId: videoId,
        title: title || 'Manual Input',
        model: model,
        summary: summary,
        cachedAt: new Date().toISOString(),
        generatedAt: Date.now()
      };

      // Save to cache file
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
      
      console.log(`💾 Saved summary to cache: ${filename}`);
      
      res.json({ 
        success: true, 
        message: 'Summary saved to cache',
        filename: filename,
        cachedAt: cacheData.cachedAt
      });
    } catch (error) {
      console.error('Error saving summary to cache:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 