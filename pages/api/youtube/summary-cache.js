const fs = require('fs');
const path = require('path');

const SUMMARY_CACHE_DIR = path.join(process.cwd(), 'summary-cache');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      if (!fs.existsSync(SUMMARY_CACHE_DIR)) {
        return res.json({ cached: [], count: 0 });
      }

      const files = fs.readdirSync(SUMMARY_CACHE_DIR);
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 