import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface KeywordExplanationCache {
  videoId: string;
  title: string;
  keyword: string;
  explanation: string;
  model: string;
  generatedAt: string;
  lastEditedAt?: string;
}

interface CacheResponse {
  success: boolean;
  cached?: KeywordExplanationCache[];
  error?: string;
}

// Create cache directory if it doesn't exist
const CACHE_DIR = path.join(process.cwd(), 'keyword-explanations-cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Generate filename for keyword explanation cache
function generateCacheFilename(videoId: string, keyword: string, title: string): string {
  // Clean the title and keyword for filename
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
  const cleanKeyword = keyword.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 20);
  return `${videoId}_${cleanKeyword}_${cleanTitle}.json`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CacheResponse>
) {
  const { method } = req;
  const { videoId, keyword, title } = req.query;

  try {
    switch (method) {
      case 'GET':
        // Get cached explanation for specific keyword
        if (videoId && keyword && title) {
          const filename = generateCacheFilename(
            videoId as string, 
            keyword as string, 
            title as string
          );
          const filePath = path.join(CACHE_DIR, filename);

          if (fs.existsSync(filePath)) {
            const cached = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return res.status(200).json({ success: true, cached: [cached] });
          } else {
            return res.status(404).json({ success: false, error: 'No cached explanation found' });
          }
        }

        // Get all cached explanations for a video
        if (videoId) {
          const files = fs.readdirSync(CACHE_DIR);
          const videoFiles = files.filter(file => file.startsWith(videoId as string));
          const cached: KeywordExplanationCache[] = [];

          for (const file of videoFiles) {
            try {
              const filePath = path.join(CACHE_DIR, file);
              const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              cached.push(data);
            } catch (error) {
              console.error(`Error reading cache file ${file}:`, error);
            }
          }

          return res.status(200).json({ success: true, cached });
        }

        return res.status(400).json({ success: false, error: 'videoId is required' });

      case 'POST':
        // Save new explanation to cache
        const { explanation, model, keyword: postKeyword } = req.body;
        
        if (!videoId || !postKeyword || !title || !explanation || !model) {
          return res.status(400).json({ 
            success: false, 
            error: 'videoId, keyword, title, explanation, and model are required' 
          });
        }

        const newCache: KeywordExplanationCache = {
          videoId: videoId as string,
          title: title as string,
          keyword: postKeyword,
          explanation,
          model,
          generatedAt: new Date().toISOString(),
        };

        const newFilename = generateCacheFilename(
          videoId as string, 
          postKeyword, 
          title as string
        );
        const newFilePath = path.join(CACHE_DIR, newFilename);

        fs.writeFileSync(newFilePath, JSON.stringify(newCache, null, 2));
        console.log(`✅ Saved keyword explanation to cache: ${newFilename}`);

        return res.status(200).json({ success: true, cached: [newCache] });

      case 'PUT':
        // Update existing explanation
        const { explanation: updatedExplanation } = req.body;
        
        if (!videoId || !keyword || !title || !updatedExplanation) {
          return res.status(400).json({ 
            success: false, 
            error: 'videoId, keyword, title, and explanation are required' 
          });
        }

        const updateFilename = generateCacheFilename(
          videoId as string, 
          keyword as string, 
          title as string
        );
        const updateFilePath = path.join(CACHE_DIR, updateFilename);

        if (!fs.existsSync(updateFilePath)) {
          return res.status(404).json({ success: false, error: 'Cached explanation not found' });
        }

        const existingCache = JSON.parse(fs.readFileSync(updateFilePath, 'utf8'));
        const updatedCache = {
          ...existingCache,
          explanation: updatedExplanation,
          lastEditedAt: new Date().toISOString(),
        };

        fs.writeFileSync(updateFilePath, JSON.stringify(updatedCache, null, 2));
        console.log(`✏️ Updated keyword explanation in cache: ${updateFilename}`);

        return res.status(200).json({ success: true, cached: [updatedCache] });

      case 'DELETE':
        // Delete cached explanation
        if (!videoId || !keyword || !title) {
          return res.status(400).json({ 
            success: false, 
            error: 'videoId, keyword, and title are required' 
          });
        }

        const deleteFilename = generateCacheFilename(
          videoId as string, 
          keyword as string, 
          title as string
        );
        const deleteFilePath = path.join(CACHE_DIR, deleteFilename);

        if (fs.existsSync(deleteFilePath)) {
          fs.unlinkSync(deleteFilePath);
          console.log(`🗑️ Deleted keyword explanation cache: ${deleteFilename}`);
          return res.status(200).json({ success: true });
        } else {
          return res.status(404).json({ success: false, error: 'Cached explanation not found' });
        }

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Error in keyword explanations cache:', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
} 