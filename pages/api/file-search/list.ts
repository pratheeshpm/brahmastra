import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Default base folder - can be overridden by query parameter
const DEFAULT_BASE_FOLDER = '/Users/pratheeshpm/Documents/codebase/aiProjects/brahmastra';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache file path
const CACHE_DIR = path.join(process.cwd(), '.cache');
const FOLDER_CACHE_FILE = path.join(CACHE_DIR, 'folder-cache.json');

interface CacheEntry {
  data: ListResponse;
  timestamp: number;
  folderPath: string;
}

// Ensure cache directory exists
const ensureCacheDir = () => {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log(`📁 Created cache directory: ${CACHE_DIR}`);
  }
};

// Function to load cache from file
const loadFolderCacheFromFile = (): Map<string, CacheEntry> => {
  try {
    ensureCacheDir();
    
    if (!fs.existsSync(FOLDER_CACHE_FILE)) {
      console.log('📄 No folder cache file found, starting with empty cache');
      return new Map();
    }
    
    const cacheData = fs.readFileSync(FOLDER_CACHE_FILE, 'utf8');
    const cacheObject = JSON.parse(cacheData);
    const cache = new Map<string, CacheEntry>();
    
    // Convert object back to Map and clean expired entries
    const now = Date.now();
    let loadedCount = 0;
    let expiredCount = 0;
    
    Object.entries(cacheObject).forEach(([key, entry]) => {
      const cacheEntry = entry as CacheEntry;
      if (now - cacheEntry.timestamp <= CACHE_DURATION) {
        cache.set(key, cacheEntry);
        loadedCount++;
      } else {
        expiredCount++;
      }
    });
    
    console.log(`📄 Loaded ${loadedCount} folder cache entries from file (${expiredCount} expired entries skipped)`);
    return cache;
    
  } catch (error) {
    console.error('❌ Error loading folder cache from file:', error);
    return new Map();
  }
};

// Function to save cache to file
const saveFolderCacheToFile = (cache: Map<string, CacheEntry>) => {
  try {
    ensureCacheDir();
    
    // Convert Map to object for JSON serialization
    const cacheObject: Record<string, CacheEntry> = {};
    cache.forEach((value, key) => {
      cacheObject[key] = value;
    });
    
    fs.writeFileSync(FOLDER_CACHE_FILE, JSON.stringify(cacheObject, null, 2));
    console.log(`💾 Saved ${cache.size} folder cache entries to file`);
    
  } catch (error) {
    console.error('❌ Error saving folder cache to file:', error);
  }
};

// Function to clean expired cache entries
const cleanExpiredFolderCache = (cache: Map<string, CacheEntry>): Map<string, CacheEntry> => {
  const now = Date.now();
  let cleanedCount = 0;
  
  const keysToDelete: string[] = [];
  cache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    cache.delete(key);
    cleanedCount++;
  });
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned ${cleanedCount} expired folder cache entries`);
    // Save updated cache to file
    saveFolderCacheToFile(cache);
  }
  
  return cache;
};

// Initialize cache from file
let folderCache = loadFolderCacheFromFile();

interface FileItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  relativePath: string;
}

interface ListResponse {
  success: boolean;
  files: FileItem[];
  totalFiles: number;
  totalDirectories: number;
  baseFolder: string;
  cached?: boolean;
  cacheTimestamp?: number;
  error?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<ListResponse>) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      files: [], 
      totalFiles: 0, 
      totalDirectories: 0, 
      baseFolder: DEFAULT_BASE_FOLDER,
      cached: false,
      error: 'Method not allowed' 
    });
  }

  try {
    // Get folder and refresh parameter from query
    const { folder, refresh } = req.query;
    const baseFolder = (folder as string) || DEFAULT_BASE_FOLDER;
    const forceRefresh = refresh === 'true';

    // Validate that the folder exists
    if (!fs.existsSync(baseFolder)) {
      return res.status(400).json({
        success: false,
        files: [],
        totalFiles: 0,
        totalDirectories: 0,
        baseFolder,
        cached: false,
        error: `Folder does not exist: ${baseFolder}`
      });
    }

    // Check if it's actually a directory
    const stats = fs.statSync(baseFolder);
    if (!stats.isDirectory()) {
      return res.status(400).json({
        success: false,
        files: [],
        totalFiles: 0,
        totalDirectories: 0,
        baseFolder,
        cached: false,
        error: `Path is not a directory: ${baseFolder}`
      });
    }

    console.log(`📁 Listing files in: ${baseFolder}`);
    
    // Clean expired cache entries periodically
    folderCache = cleanExpiredFolderCache(folderCache);
    
    // Check cache first (unless refresh is requested)
    if (!forceRefresh) {
      const cachedEntry = folderCache.get(baseFolder);
      if (cachedEntry) {
        const isExpired = Date.now() - cachedEntry.timestamp > CACHE_DURATION;
        if (!isExpired) {
          console.log(`🚀 Using cached data for: ${baseFolder}`);
          return res.status(200).json({
            ...cachedEntry.data,
            cached: true,
            cacheTimestamp: cachedEntry.timestamp
          });
        } else {
          console.log(`⏰ Cache expired for: ${baseFolder}`);
          folderCache.delete(baseFolder);
          saveFolderCacheToFile(folderCache);
        }
      }
    } else {
      console.log(`🔄 Force refresh requested for: ${baseFolder}`);
      if (folderCache.has(baseFolder)) {
        folderCache.delete(baseFolder);
        saveFolderCacheToFile(folderCache);
      }
    }
    
    // Use find command to recursively list all files and directories
    // Exclude common unwanted directories and files
    const findCommand = `find "${baseFolder}" \\( -name "node_modules" -o -name ".git" -o -name ".next" -o -name "build" -o -name "dist" -o -name ".DS_Store" -o -name "*.log" -o -name ".cache" -o -name "coverage" -o -name "__pycache__" -o -name "*.pyc" -o -name ".env" -o -name ".tmp" -o -name ".temp" \\) -prune -o -type f -print -o -type d -print | head -1000`;

    const { stdout } = await execAsync(findCommand);
    const filePaths = stdout.trim().split('\n').filter(p => p.trim() !== '');

    console.log(`📊 Found ${filePaths.length} items`);

    const files: FileItem[] = [];
    let totalFiles = 0;
    let totalDirectories = 0;

    // Process each path and get file info
    for (const fullPath of filePaths) {
      if (!fullPath.trim()) continue;

      try {
        // Get file stats using stat command
        const statCommand = `stat -c "%F %s" "${fullPath}" 2>/dev/null || stat -f "%HT %z" "${fullPath}" 2>/dev/null`;
        const { stdout: statOutput } = await execAsync(statCommand);
        const [fileType, sizeStr] = statOutput.trim().split(' ');
        
        const isDirectory = fileType.includes('directory') || fileType.includes('Directory');
        const fileName = path.basename(fullPath);
        const relativePath = path.relative(baseFolder, fullPath);
        const extension = isDirectory ? undefined : path.extname(fileName).toLowerCase();
        const size = isDirectory ? undefined : parseInt(sizeStr) || 0;

        const fileItem: FileItem = {
          path: fullPath,
          name: fileName,
          type: isDirectory ? 'directory' : 'file',
          relativePath,
          ...(extension && { extension }),
          ...(size !== undefined && { size })
        };

        files.push(fileItem);
        
        if (isDirectory) {
          totalDirectories++;
        } else {
          totalFiles++;
        }
      } catch (error) {
        console.warn(`⚠️ Could not get stats for: ${fullPath}`);
      }
    }

    // Sort files: directories first, then files, both alphabetically
    files.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    console.log(`✅ Successfully processed ${files.length} items (${totalFiles} files, ${totalDirectories} directories)`);

    const response: ListResponse = {
      success: true,
      files,
      totalFiles,
      totalDirectories,
      baseFolder,
      cached: false,
      cacheTimestamp: Date.now()
    };

    // Store in cache
    const cacheEntry: CacheEntry = {
      data: response,
      timestamp: Date.now(),
      folderPath: baseFolder
    };
    
    folderCache.set(baseFolder, cacheEntry);
    saveFolderCacheToFile(folderCache);
    console.log(`💾 Cached data for: ${baseFolder}`);

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error listing files:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      files: [],
      totalFiles: 0,
      totalDirectories: 0,
      baseFolder: DEFAULT_BASE_FOLDER,
      cached: false,
      error: errorMessage
    });
  }
};

export default handler; 