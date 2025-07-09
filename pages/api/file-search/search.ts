import { NextApiRequest, NextApiResponse } from 'next';
import { OPENROUTER_API_KEY } from '@/utils/app/const';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface FileItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  relativePath: string;
}

interface SearchRequest {
  query: string;
  files: FileItem[];
  maxResults?: number;
}

interface SearchResult {
  file: FileItem;
  relevanceScore: number;
  reasoning: string;
}

interface SearchResponse {
  success: boolean;
  results: SearchResult[];
  fileResults: SearchResult[];
  folderResults: SearchResult[];
  query: string;
  totalFiles: number;
  cached?: boolean;
  cacheTimestamp?: number;
  cacheKey?: string;
  error?: string;
}

// Cache configuration
const SEARCH_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

interface SearchCacheEntry {
  data: SearchResponse;
  timestamp: number;
  query: string;
  fileHash: string;
}

// Function to generate a hash of the file list for cache key
const generateFileHash = (files: FileItem[]): string => {
  const fileData = files.map(f => ({
    path: f.relativePath,
    name: f.name,
    type: f.type,
    size: f.size
  }));
  const fileString = JSON.stringify(fileData);
  return crypto.createHash('md5').update(fileString).digest('hex').substring(0, 16);
};

// Function to generate cache key
const generateCacheKey = (query: string, fileHash: string): string => {
  const queryHash = crypto.createHash('md5').update(query.toLowerCase().trim()).digest('hex').substring(0, 8);
  return `${queryHash}_${fileHash}`;
};

// Cache file path
const CACHE_DIR = path.join(process.cwd(), '.cache');
const SEARCH_CACHE_FILE = path.join(CACHE_DIR, 'search-cache.json');
const FOLDER_CACHE_FILE = path.join(CACHE_DIR, 'folder-cache.json');

// Ensure cache directory exists
const ensureCacheDir = () => {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log(`📁 Created cache directory: ${CACHE_DIR}`);
  }
};

// Function to load cache from file
const loadSearchCacheFromFile = (): Map<string, SearchCacheEntry> => {
  try {
    ensureCacheDir();
    
    if (!fs.existsSync(SEARCH_CACHE_FILE)) {
      console.log('📄 No search cache file found, starting with empty cache');
      return new Map();
    }
    
    const cacheData = fs.readFileSync(SEARCH_CACHE_FILE, 'utf8');
    const cacheObject = JSON.parse(cacheData);
    const cache = new Map<string, SearchCacheEntry>();
    
    // Convert object back to Map and clean expired entries
    const now = Date.now();
    let loadedCount = 0;
    let expiredCount = 0;
    
    Object.entries(cacheObject).forEach(([key, entry]) => {
      const cacheEntry = entry as SearchCacheEntry;
      if (now - cacheEntry.timestamp <= SEARCH_CACHE_DURATION) {
        cache.set(key, cacheEntry);
        loadedCount++;
      } else {
        expiredCount++;
      }
    });
    
    console.log(`📄 Loaded ${loadedCount} search cache entries from file (${expiredCount} expired entries skipped)`);
    return cache;
    
  } catch (error) {
    console.error('❌ Error loading search cache from file:', error);
    return new Map();
  }
};

// Function to save cache to file
const saveSearchCacheToFile = (cache: Map<string, SearchCacheEntry>) => {
  try {
    ensureCacheDir();
    
    // Convert Map to object for JSON serialization
    const cacheObject: Record<string, SearchCacheEntry> = {};
    cache.forEach((value, key) => {
      cacheObject[key] = value;
    });
    
    fs.writeFileSync(SEARCH_CACHE_FILE, JSON.stringify(cacheObject, null, 2));
    console.log(`💾 Saved ${cache.size} search cache entries to file`);
    
  } catch (error) {
    console.error('❌ Error saving search cache to file:', error);
  }
};

// Function to clean expired cache entries
const cleanExpiredCache = (cache: Map<string, SearchCacheEntry>): Map<string, SearchCacheEntry> => {
  const now = Date.now();
  let cleanedCount = 0;
  
  const keysToDelete: string[] = [];
  cache.forEach((entry, key) => {
    if (now - entry.timestamp > SEARCH_CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    cache.delete(key);
    cleanedCount++;
  });
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned ${cleanedCount} expired search cache entries`);
    // Save updated cache to file
    saveSearchCacheToFile(cache);
  }
  
  return cache;
};

// Initialize cache from file
let searchCache = loadSearchCacheFromFile();

// Function to create OpenRouter stream for AI search
const createOpenRouterStream = async (
  prompt: string,
  apiKey: string
) => {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  console.log('🚀 Making OpenRouter API call...');
  console.log('📝 API URL:', url);
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🔑 API Key length:', apiKey?.length || 0);
  console.log('📊 Model:', 'mistralai/ministral-8b');
  
  const requestBody = {
    model: 'mistralai/ministral-8b', // Mistral 8B
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that analyzes file lists and finds the most relevant files based on user queries. You should respond with a JSON array of relevant files with their relevance scores and reasoning.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
          max_tokens: 2000,
    temperature: 0.3,
          stream: false, // Wait for complete response, no streaming
  };
  
  console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://localhost:3000', // Optional
      'X-Title': 'File Search AI', // Optional
    },
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  console.log('📥 Response status:', response.status);
  console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    console.error('❌ OpenRouter API error response status:', response.status);
    const errorText = await response.text();
    console.error('❌ OpenRouter API error response text:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
      console.error('❌ OpenRouter API error data:', errorData);
    } catch (parseError) {
      console.error('❌ Failed to parse error response as JSON:', parseError);
      errorData = { error: { message: errorText } };
    }
    
    throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
  }

  const responseData = await response.json();
  console.log('✅ OpenRouter API response:', JSON.stringify(responseData, null, 2));
  
  return responseData;
};

// Function to create the AI prompt for file search
const createSearchPrompt = (query: string, files: FileItem[], maxResults: number = 10) => {
  // Separate files and directories
  const fileItems = files.filter(f => f.type === 'file');
  const directoryItems = files.filter(f => f.type === 'directory');
  
  const fileList = fileItems.slice(0, 200).map(file => ({
    path: file.relativePath,
    name: file.name,
    type: file.type,
    extension: file.extension || 'none'
  }));
  
  const directoryList = directoryItems.slice(0, 100).map(dir => ({
    path: dir.relativePath,
    name: dir.name,
    type: dir.type
  }));

  return `You are a file search expert. Find the most relevant items for the user query.

User Query: "${query}"

SEARCH PRIORITY:
1. FIRST: Look for FILES with exact word matches in filename or path
2. SECOND: Look for FILES with partial matches or related terms
3. THIRD: Look for DIRECTORIES that might contain relevant files
4. FOURTH: Look for FILES with relevant extensions

FILES (${fileList.length} items):
${JSON.stringify(fileList, null, 2)}

DIRECTORIES (${directoryList.length} items):
${JSON.stringify(directoryList, null, 2)}

SEARCH STRATEGY:
1. Start with exact word matches in filenames
2. Then look for partial matches in paths
3. Consider file extensions that match the query context
4. Include relevant directories last

RESPONSE RULES:
- Return EXACTLY ${maxResults} unique items
- Prioritize FILES over directories
- No duplicates
- Score 1-10 (10 = perfect match)
- Brief reasoning for each

JSON FORMAT (return ONLY this):
[
  {
    "path": "exact/path/from/above/list",
    "name": "exact_name",
    "type": "file",
    "relevanceScore": 9,
    "reasoning": "Exact filename match"
  }
]`;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<SearchResponse>) => {
  console.log('🚀 File search API called');
  console.log('📝 Request method:', req.method);
  
  if (req.method === 'POST') {
    // Handle POST request (existing functionality)
    console.log('📝 POST Request body keys:', Object.keys(req.body || {}));
    
    try {
      const { query, files, maxResults = 10, fresh }: SearchRequest & { fresh?: boolean } = req.body;
      
      console.log('📊 Request parameters:');
      console.log('  - Query:', query);
      console.log('  - Files count:', files?.length || 0);
      console.log('  - Max results:', maxResults);
      console.log('  - Fresh search:', fresh || false);

      if (!query || !query.trim()) {
        console.log('❌ Query is empty or missing');
        return res.status(400).json({
          success: false,
          results: [],
          fileResults: [],
          folderResults: [],
          query: query || '',
          totalFiles: files?.length || 0,
          error: 'Query is required'
        });
      }

      if (!files || !Array.isArray(files) || files.length === 0) {
        console.log('❌ Files array is empty or missing');
        return res.status(400).json({
          success: false,
          results: [],
          fileResults: [],
          folderResults: [],
          query,
          totalFiles: 0,
          error: 'Files array is required'
        });
      }

      return await performSearch(query, files, maxResults, fresh);
      
    } catch (error) {
      console.error('❌ POST request error:', error);
      return res.status(500).json({
        success: false,
        results: [],
        fileResults: [],
        folderResults: [],
        query: '',
        totalFiles: 0,
        error: 'Internal server error'
      });
    }
  } else if (req.method === 'GET') {
    // Handle GET request with query parameters
    console.log('📝 GET Request query params:', req.query);
    
    try {
      const { 
        q, 
        query, 
        folder, 
        maxResults = '10', 
        fresh = 'false' 
      } = req.query;
      
      const searchQuery = (q || query) as string;
      const searchFolder = folder as string;
      const maxResultsNum = parseInt(maxResults as string) || 10;
      const freshSearch = fresh === 'true';
      
      console.log('📊 GET Request parameters:');
      console.log('  - Query:', searchQuery);
      console.log('  - Folder:', searchFolder);
      console.log('  - Max results:', maxResultsNum);
      console.log('  - Fresh search:', freshSearch);

      if (!searchQuery || !searchQuery.trim()) {
        console.log('❌ Query is empty or missing');
        return res.status(400).json({
          success: false,
          results: [],
          fileResults: [],
          folderResults: [],
          query: searchQuery || '',
          totalFiles: 0,
          error: 'Query parameter (q or query) is required'
        });
      }

      // Load files from the specified folder or default folder
      const files = await loadFilesFromFolder(searchFolder);
      
      if (!files || files.length === 0) {
        console.log('❌ No files found in folder');
        return res.status(400).json({
          success: false,
          results: [],
          fileResults: [],
          folderResults: [],
          query: searchQuery,
          totalFiles: 0,
          error: 'No files found in the specified folder'
        });
      }

      return await performSearch(searchQuery, files, maxResultsNum, freshSearch);
      
    } catch (error) {
      console.error('❌ GET request error:', error);
      return res.status(500).json({
        success: false,
        results: [],
        fileResults: [],
        folderResults: [],
        query: '',
        totalFiles: 0,
        error: 'Internal server error'
      });
    }
  } else {
    // Method not allowed
    console.log('❌ Method not allowed:', req.method);
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ 
      success: false, 
      results: [], 
      fileResults: [],
      folderResults: [],
      query: '',
      totalFiles: 0,
      error: 'Method not allowed. Use GET or POST.' 
    });
  }

  // Shared search logic
  async function performSearch(query: string, files: FileItem[], maxResults: number, fresh?: boolean): Promise<void> {
    console.log(`🔍 AI searching for: "${query}" in ${files.length} files`);
    console.log('📁 Sample files:', files.slice(0, 5).map(f => f.relativePath));

    // Generate cache key
    const fileHash = generateFileHash(files);
    const cacheKey = generateCacheKey(query, fileHash);
    console.log(`🔑 Cache key: ${cacheKey} (query hash + file hash)`);

    // Clean expired cache entries periodically
    searchCache = cleanExpiredCache(searchCache);

    // Check cache first (unless fresh search is requested)
    if (!fresh) {
      const cachedEntry = searchCache.get(cacheKey);
      if (cachedEntry) {
        const isExpired = Date.now() - cachedEntry.timestamp > SEARCH_CACHE_DURATION;
        if (!isExpired) {
          console.log(`🚀 Using cached search results for: "${query}"`);
          return res.status(200).json({
            ...cachedEntry.data,
            cached: true,
            cacheTimestamp: cachedEntry.timestamp,
            cacheKey
          });
        } else {
          console.log(`⏰ Cache expired for: "${query}"`);
          searchCache.delete(cacheKey);
          saveSearchCacheToFile(searchCache);
        }
      }
    } else {
      console.log(`🔄 Fresh search requested for: "${query}"`);
      if (searchCache.has(cacheKey)) {
        searchCache.delete(cacheKey);
        saveSearchCacheToFile(searchCache);
      }
    }

    // Check if OpenRouter API key is available
    const apiKey = OPENROUTER_API_KEY;
    console.log('🔑 Checking API key...');
    console.log('🔑 API key exists:', !!apiKey);
    console.log('🔑 API key length:', apiKey?.length || 0);
    console.log('🔑 API key first 10 chars:', apiKey?.substring(0, 10) || 'N/A');
    
    if (!apiKey) {
      console.log('❌ OpenRouter API key is missing');
      return res.status(401).json({
        success: false,
        results: [],
        fileResults: [],
        folderResults: [],
        query,
        totalFiles: files.length,
        error: 'OpenRouter API key is required'
      });
    }

    // Create the search prompt
    console.log('📝 Creating search prompt...');
    const searchPrompt = createSearchPrompt(query, files, maxResults);
    console.log('📝 Search prompt length:', searchPrompt.length);
    console.log('📝 Search prompt preview:', searchPrompt.substring(0, 500) + '...');

    // Call OpenRouter API
    console.log('🤖 Calling OpenRouter API...');
    const aiResponse = await createOpenRouterStream(searchPrompt, apiKey);
    
    console.log('📊 AI Response structure:');
    console.log('  - Has choices:', !!aiResponse.choices);
    console.log('  - Choices length:', aiResponse.choices?.length || 0);
    console.log('  - First choice has message:', !!aiResponse.choices?.[0]?.message);
    console.log('  - Finish reason:', aiResponse.choices?.[0]?.finish_reason);
    console.log('  - Usage:', aiResponse.usage);
    
    if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message) {
      console.error('❌ Invalid response structure from OpenRouter API');
      console.error('❌ Full response:', JSON.stringify(aiResponse, null, 2));
      throw new Error('Invalid response from OpenRouter API');
    }

    const aiContent = aiResponse.choices[0].message.content;
    const finishReason = aiResponse.choices[0].finish_reason;
    
    console.log(`🤖 AI Response content length: ${aiContent?.length || 0}`);
    console.log(`🤖 AI Response finish reason: ${finishReason}`);
    console.log(`🤖 AI Response content: ${aiContent}`);
    
    // Check if response was truncated
    if (finishReason === 'length') {
      console.warn('⚠️ AI response was truncated due to token limit');
    }

    // Parse the AI response
    let searchResults: SearchResult[] = [];
    console.log('🔄 Parsing AI response...');
    
    try {
      // Try to fix truncated JSON by adding closing brackets if needed
      let cleanedContent = aiContent.trim();
      
      // If response was truncated, try to fix it
      if (finishReason === 'length') {
        console.log('🔧 Attempting to fix truncated JSON...');
        
        // Count opening and closing brackets
        const openBrackets = (cleanedContent.match(/\[/g) || []).length;
        const closeBrackets = (cleanedContent.match(/\]/g) || []).length;
        const openBraces = (cleanedContent.match(/\{/g) || []).length;
        const closeBraces = (cleanedContent.match(/\}/g) || []).length;
        
        console.log(`📊 Brackets: open=[${openBrackets}], close=[${closeBrackets}]`);
        console.log(`📊 Braces: open={${openBraces}}, close={${closeBraces}}`);
        
        // If we have unmatched braces, try to close them
        if (openBraces > closeBraces) {
          const missingBraces = openBraces - closeBraces;
          cleanedContent += '}'.repeat(missingBraces);
          console.log(`🔧 Added ${missingBraces} closing braces`);
        }
        
        // If we have unmatched brackets, try to close them
        if (openBrackets > closeBrackets) {
          const missingBrackets = openBrackets - closeBrackets;
          cleanedContent += ']'.repeat(missingBrackets);
          console.log(`🔧 Added ${missingBrackets} closing brackets`);
        }
        
        console.log('🔧 Fixed content:', cleanedContent);
      }
      
      const parsedResults = JSON.parse(cleanedContent);
      console.log('✅ Successfully parsed AI response as JSON');
      console.log('📊 Parsed results type:', typeof parsedResults);
      console.log('📊 Parsed results is array:', Array.isArray(parsedResults));
      console.log('📊 Parsed results length:', parsedResults?.length || 0);
      
      if (Array.isArray(parsedResults)) {
        console.log('🔄 Processing array results...');
        
        // Remove duplicates by path
        const uniqueResults = parsedResults.filter((result, index, self) => 
          index === self.findIndex(r => r.path === result.path)
        );
        
        console.log(`🔄 Removed ${parsedResults.length - uniqueResults.length} duplicate entries`);
        
        searchResults = uniqueResults
          .map((result: any, index: number) => {
            console.log(`  Processing result ${index + 1}:`, result);
            
            // Find the original file object
            const originalFile = files.find(f => 
              f.relativePath === result.path || 
              f.name === result.name
            );
            
            if (!originalFile) {
              console.warn(`⚠️ Could not find original file for: ${result.path}`);
              return null;
            }

            const processedResult = {
              file: originalFile,
              relevanceScore: Math.min(10, Math.max(1, result.relevanceScore || 5)),
              reasoning: result.reasoning || 'AI found this file relevant'
            };
            
            console.log(`  ✅ Processed result ${index + 1}:`, processedResult);
            return processedResult;
          })
          .filter((result): result is SearchResult => result !== null); // Type guard
          
        console.log(`✅ Processed ${searchResults.length} valid results`);
      } else {
        console.warn('⚠️ AI response is not an array, attempting to extract results');
        console.log('⚠️ Response type:', typeof parsedResults);
        console.log('⚠️ Response content:', parsedResults);
        // Try to extract results from a different format
        searchResults = [];
      }
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      console.error('❌ Raw AI response:', aiContent);
      
      // Fallback: Smart text search with prioritization
      console.log('🔄 Using fallback smart search...');
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);
      
      // Prioritized search
      const fileResults = files
        .filter(file => file.type === 'file')
        .map(file => {
          const nameLower = file.name.toLowerCase();
          const pathLower = file.relativePath.toLowerCase();
          
          // Calculate relevance score
          let score = 0;
          let reasoning = '';
          
          // Exact filename match (highest priority)
          if (nameLower === queryLower) {
            score = 10;
            reasoning = 'Exact filename match';
          }
          // Filename contains exact query
          else if (nameLower.includes(queryLower)) {
            score = 9;
            reasoning = 'Filename contains query';
          }
          // Filename contains all query words
          else if (queryWords.every(word => nameLower.includes(word))) {
            score = 8;
            reasoning = 'Filename contains all query words';
          }
          // Path contains exact query
          else if (pathLower.includes(queryLower)) {
            score = 7;
            reasoning = 'Path contains query';
          }
          // Path contains all query words
          else if (queryWords.every(word => pathLower.includes(word))) {
            score = 6;
            reasoning = 'Path contains all query words';
          }
          // Filename contains any query word
          else if (queryWords.some(word => nameLower.includes(word))) {
            score = 5;
            reasoning = 'Filename contains query word';
          }
          // Path contains any query word
          else if (queryWords.some(word => pathLower.includes(word))) {
            score = 4;
            reasoning = 'Path contains query word';
          }
          
          return score > 0 ? { file, relevanceScore: score, reasoning } : null;
        })
        .filter((result): result is SearchResult => result !== null)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Add directories if we need more results
      const directoryResults = files
        .filter(file => file.type === 'directory')
        .map(file => {
          const nameLower = file.name.toLowerCase();
          const pathLower = file.relativePath.toLowerCase();
          
          let score = 0;
          let reasoning = '';
          
          if (nameLower.includes(queryLower)) {
            score = 3;
            reasoning = 'Directory name contains query';
          } else if (pathLower.includes(queryLower)) {
            score = 2;
            reasoning = 'Directory path contains query';
          }
          
          return score > 0 ? { file, relevanceScore: score, reasoning } : null;
        })
        .filter((result): result is SearchResult => result !== null)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      // Combine results, prioritizing files over directories
      searchResults = [...fileResults, ...directoryResults].slice(0, maxResults);
      
      console.log(`🔄 Fallback search found ${searchResults.length} results`);
    }

    // Separate files and folders
    const fileResults = searchResults.filter(result => result.file.type === 'file');
    const folderResults = searchResults.filter(result => result.file.type === 'directory');
    
    console.log(`📊 Final results: ${fileResults.length} files, ${folderResults.length} folders`);

    // Create response
    const response: SearchResponse = {
      success: true,
      results: searchResults,
      fileResults,
      folderResults,
      query,
      totalFiles: files.length,
      cached: false,
      cacheTimestamp: Date.now(),
      cacheKey
    };

    // Cache the response for future use
    const cacheEntry: SearchCacheEntry = {
      data: response,
      timestamp: Date.now(),
      query,
      fileHash: generateFileHash(files)
    };
    
    searchCache.set(cacheKey, cacheEntry);
    saveSearchCacheToFile(searchCache);
    
    console.log(`✅ Search completed successfully for: "${query}"`);
    console.log(`📊 Returning ${searchResults.length} results (${fileResults.length} files, ${folderResults.length} folders)`);
    
    return res.status(200).json(response);

  }

  // Function to load files from a folder
  async function loadFilesFromFolder(folderPath?: string): Promise<FileItem[]> {
    try {
      const targetFolder = folderPath || '/Users/pratheeshpm/Documents/Interview/leetcode/system-design-main';
      
      // Import the list API handler directly instead of making HTTP request
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      const fs = require('fs');
      const path = require('path');
      
      // Check if folder exists
      if (!fs.existsSync(targetFolder)) {
        console.error(`Folder does not exist: ${targetFolder}`);
        return [];
      }
      
      // Get files using direct file system access
      const files: FileItem[] = [];
      
      const scanDirectory = (dirPath: string, basePath: string): void => {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item);
          const relativePath = path.relative(basePath, fullPath);
          
          try {
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              files.push({
                path: fullPath,
                name: item,
                type: 'directory',
                relativePath,
                extension: undefined
              });
              
              // Recursively scan subdirectories (with depth limit)
              if (relativePath.split(path.sep).length < 10) {
                scanDirectory(fullPath, basePath);
              }
            } else if (stat.isFile()) {
              const extension = path.extname(item);
              files.push({
                path: fullPath,
                name: item,
                type: 'file',
                size: stat.size,
                relativePath,
                extension: extension || undefined
              });
            }
          } catch (error) {
            // Skip items that can't be accessed
            console.warn(`Skipping inaccessible item: ${fullPath}`);
          }
        }
      };
      
      scanDirectory(targetFolder, targetFolder);
      console.log(`📁 Loaded ${files.length} files from ${targetFolder}`);
      
      return files;
    } catch (error) {
      console.error('Error loading files from folder:', error);
      return [];
    }
  }
};

export default handler; 