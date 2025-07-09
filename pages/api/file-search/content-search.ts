import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as fuzzball from 'fuzzball';

const execAsync = promisify(exec);

interface ContentSearchRequest {
  query: string;
  folder?: string;
  fileTypes?: string[];
  excludeDirs?: string[];
  caseSensitive?: boolean;
  maxResults?: number;
  enableFuzzy?: boolean;
  enableFlexibleSpacing?: boolean;
  fuzzyOptions?: {
    maxDistance?: number;
    includePartialMatches?: boolean;
    customSubstitutions?: { [key: string]: string[] };
  };
}

interface ContentSearchResult {
  file: string;
  line: number;
  content: string;
  lineNumber: number;
  relativePath: string;
  fileName: string;
  fileExtension?: string;
  contextBefore?: string;
  contextAfter?: string;
}

interface ContentSearchResponse {
  success: boolean;
  results: ContentSearchResult[];
  query: string;
  totalMatches: number;
  searchedFolder: string;
  executionTime: number;
  command: string;
  error?: string;
}

// Default exclude directories
const DEFAULT_EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.cache',
  'coverage',
  '.nyc_output',
  'logs',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
  '.env*',
  '.vscode',
  '.idea'
];

// Default file types to include (if not specified)
const DEFAULT_INCLUDE_TYPES = [
  '*.js',
  '*.jsx',
  '*.ts',
  '*.tsx',
  '*.py',
  '*.java',
  '*.cpp',
  '*.c',
  '*.h',
  '*.cs',
  '*.go',
  '*.rs',
  '*.php',
  '*.rb',
  '*.swift',
  '*.kt',
  '*.scala',
  '*.html',
  '*.css',
  '*.scss',
  '*.sass',
  '*.less',
  '*.vue',
  '*.svelte',
  '*.json',
  '*.xml',
  '*.yaml',
  '*.yml',
  '*.toml',
  '*.ini',
  '*.cfg',
  '*.conf',
  '*.md',
  '*.txt',
  '*.sql',
  '*.sh',
  '*.bash',
  '*.zsh',
  '*.fish',
  '*.ps1',
  '*.bat',
  '*.cmd'
];

// Sanitize query to prevent command injection
const sanitizeQuery = (query: string): string => {
  // Remove potentially dangerous characters but keep regex-safe ones
  return query.replace(/[;&|`${}[\]\\<>]/g, '');
};

// Enhanced fuzzy pattern generation using fuzzball library
const generateFuzzyPatterns = (word: string, options: {
  maxDistance?: number;
  includePartialMatches?: boolean;
  customSubstitutions?: { [key: string]: string[] };
} = {}): string[] => {
  const {
    maxDistance = 1,
    includePartialMatches = true,
    customSubstitutions = {}
  } = options;

  const patterns: string[] = [word]; // Original word
  
  // Default character substitutions (can be extended with customSubstitutions)
  const defaultSubstitutions: { [key: string]: string[] } = {
    'a': ['a', 'e', 'i', '@'],
    'e': ['e', 'a', 'i', '3'],
    'i': ['i', 'e', 'a', '1', 'l'],
    'o': ['o', 'u', '0'],
    'u': ['u', 'o'],
    's': ['s', 'z', '$', '5'],
    'z': ['z', 's'],
    'c': ['c', 'k', 'ck'],
    'k': ['k', 'c', 'ck'],
    'f': ['f', 'ph', 'v'],
    'ph': ['ph', 'f'],
    'v': ['v', 'f'],
    'y': ['y', 'i'],
    'tion': ['tion', 'sion', 'shun'],
    'sion': ['sion', 'tion'],
    'ght': ['ght', 'te', 't'],
    'th': ['th', 'd'],
    'w': ['w', 'wh', 'u'],
    'x': ['x', 'ks', 'cs'],
    'q': ['q', 'k', 'c']
  };

  // Merge custom substitutions with defaults
  const substitutions = { ...defaultSubstitutions, ...customSubstitutions };
  
  // Generate patterns with single character substitutions
  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase();
    const alternatives = substitutions[char];
    
    if (alternatives) {
      for (const alt of alternatives) {
        if (alt !== char) {
          const pattern = word.substring(0, i) + alt + word.substring(i + 1);
          patterns.push(pattern);
        }
      }
    }
  }
  
  // Add patterns for common errors (only for words longer than 3 characters)
  if (word.length > 3) {
    // Missing character patterns
    for (let i = 0; i < word.length; i++) {
      const pattern = word.substring(0, i) + word.substring(i + 1);
      patterns.push(pattern);
    }
    
    // Extra character patterns (common doubled letters)
    const doubleLetters = ['l', 'r', 'n', 'm', 's', 't', 'p', 'f', 'c'];
    for (const letter of doubleLetters) {
      if (word.includes(letter) && !word.includes(letter + letter)) {
        patterns.push(word.replace(letter, letter + letter));
      }
    }
    
    // Transposition patterns (swapping adjacent characters)
    for (let i = 0; i < word.length - 1; i++) {
      const chars = word.split('');
      [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
      patterns.push(chars.join(''));
    }
    
    // Partial matches for longer words
    if (includePartialMatches && word.length > 5) {
      // Add patterns for common prefixes/suffixes
      const prefixes = ['un', 'pre', 'dis', 'mis', 'over', 'under', 'out'];
      const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ment'];
      
      for (const prefix of prefixes) {
        if (word.startsWith(prefix) && word.length > prefix.length + 2) {
          patterns.push(word.substring(prefix.length));
        }
      }
      
      for (const suffix of suffixes) {
        if (word.endsWith(suffix) && word.length > suffix.length + 2) {
          patterns.push(word.substring(0, word.length - suffix.length));
        }
      }
    }
  }
  
  // Use fuzzball to generate additional fuzzy matches for common words
  if (word.length >= 4) {
    try {
      // Generate some common misspellings using fuzzball's processing
      const processedWord = fuzzball.full_process(word);
      if (processedWord !== word) {
        patterns.push(processedWord);
      }
      
      // Add some phonetic-like patterns
      const phoneticPatterns = generatePhoneticPatterns(word);
      patterns.push(...phoneticPatterns);
      
    } catch (error) {
      // If fuzzball fails, continue with existing patterns
      console.warn('Fuzzball processing failed:', error);
    }
  }
  
  return Array.from(new Set(patterns)); // Remove duplicates
};

// Generate phonetic-like patterns for common sound substitutions
const generatePhoneticPatterns = (word: string): string[] => {
  const patterns: string[] = [];
  
  // Common phonetic substitutions
  const phoneticRules = [
    { from: 'ph', to: 'f' },
    { from: 'ck', to: 'k' },
    { from: 'qu', to: 'kw' },
    { from: 'x', to: 'ks' },
    { from: 'ght', to: 'te' },
    { from: 'ough', to: 'uf' },
    { from: 'augh', to: 'af' },
    { from: 'eigh', to: 'a' },
    { from: 'tion', to: 'shun' },
    { from: 'sion', to: 'shun' },
    { from: 'cious', to: 'shus' },
    { from: 'tious', to: 'shus' }
  ];
  
  for (const rule of phoneticRules) {
    if (word.includes(rule.from)) {
      patterns.push(word.replace(new RegExp(rule.from, 'g'), rule.to));
    }
  }
  
  return patterns;
};

// Create flexible regex pattern from query
const createFlexiblePattern = (query: string, enableFuzzy: boolean = true, fuzzyOptions: {
  maxDistance?: number;
  includePartialMatches?: boolean;
  customSubstitutions?: { [key: string]: string[] };
} = {}): string => {
  // Split query into words
  const words = query.trim().split(/\s+/);
  
  if (words.length === 1) {
    const word = words[0];
    
    if (enableFuzzy && word.length > 3) {
      // Generate fuzzy patterns for single word
      const fuzzyPatterns = generateFuzzyPatterns(word, fuzzyOptions);
      return `(${fuzzyPatterns.join('|')})`;
    } else {
      return word;
    }
  }
  
  // For multiple words, create a flexible pattern
  const flexibleWords = words.map(word => {
    if (enableFuzzy && word.length > 3) {
      const fuzzyPatterns = generateFuzzyPatterns(word, fuzzyOptions);
      return `(${fuzzyPatterns.join('|')})`;
    } else {
      return word;
    }
  });
  
  // Join words with flexible whitespace pattern (allows multiple spaces, tabs, newlines)
  return flexibleWords.join('\\s+');
};

// Build grep command
const buildGrepCommand = (
  query: string,
  folder: string,
  options: {
    fileTypes?: string[];
    excludeDirs?: string[];
    caseSensitive?: boolean;
    maxResults?: number;
    enableFuzzy?: boolean;
    enableFlexibleSpacing?: boolean;
    fuzzyOptions?: {
      maxDistance?: number;
      includePartialMatches?: boolean;
      customSubstitutions?: { [key: string]: string[] };
    };
  }
): string => {
  const {
    fileTypes = DEFAULT_INCLUDE_TYPES,
    excludeDirs = DEFAULT_EXCLUDE_DIRS,
    caseSensitive = false,
    maxResults = 100,
    enableFuzzy = true,
    enableFlexibleSpacing = true,
    fuzzyOptions = {}
  } = options;

  let searchPattern: string;
  
  if (enableFlexibleSpacing || enableFuzzy) {
    // Use flexible regex pattern with fuzzy options
    searchPattern = createFlexiblePattern(query, enableFuzzy, fuzzyOptions);
  } else {
    // Use simple sanitized query
    searchPattern = sanitizeQuery(query);
  }

  // Start with grep command with extended regex support
  let command = 'grep -rn';
  
  // Add case insensitive flag if needed
  if (!caseSensitive) {
    command += 'i';
  }
  
  // Add extended regex flag for flexible patterns
  if (enableFlexibleSpacing || enableFuzzy) {
    command += 'E'; // Extended regex
  }

  // Add the search pattern
  command += ` "${searchPattern}"`;

  // Add the folder
  command += ` "${folder}"`;

  // Add include patterns for file types
  if (fileTypes && fileTypes.length > 0) {
    const includePatterns = fileTypes.map(type => `--include="${type}"`).join(' ');
    command += ` ${includePatterns}`;
  }

  // Add exclude patterns for directories
  if (excludeDirs && excludeDirs.length > 0) {
    const excludePatterns = excludeDirs.map(dir => `--exclude-dir="${dir}"`).join(' ');
    command += ` ${excludePatterns}`;
  }

  // Limit results and handle errors
  command += ` | head -${maxResults}`;

  return command;
};

// Parse grep output
const parseGrepOutput = (output: string, baseFolder: string): ContentSearchResult[] => {
  if (!output.trim()) return [];

  const lines = output.split('\n').filter(line => line.trim());
  const results: ContentSearchResult[] = [];

  for (const line of lines) {
    // Parse grep output format: filepath:lineNumber:content
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const secondColonIndex = line.indexOf(':', colonIndex + 1);
    if (secondColonIndex === -1) continue;

    const filePath = line.substring(0, colonIndex);
    const lineNumberStr = line.substring(colonIndex + 1, secondColonIndex);
    const content = line.substring(secondColonIndex + 1);

    const lineNumber = parseInt(lineNumberStr, 10);
    if (isNaN(lineNumber)) continue;

    const relativePath = path.relative(baseFolder, filePath);
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(fileName).toLowerCase();

    results.push({
      file: filePath,
      line: lineNumber,
      content: content.trim(),
      lineNumber,
      relativePath,
      fileName,
      fileExtension: fileExtension || undefined
    });
  }

  return results;
};

// Get context lines around a match
const getContextLines = async (
  filePath: string,
  lineNumber: number,
  contextLines: number = 2
): Promise<{ before?: string; after?: string }> => {
  try {
    const startLine = Math.max(1, lineNumber - contextLines);
    const endLine = lineNumber + contextLines;
    
    // Use sed to get specific line ranges
    const beforeCommand = `sed -n '${startLine},${lineNumber - 1}p' "${filePath}"`;
    const afterCommand = `sed -n '${lineNumber + 1},${endLine}p' "${filePath}"`;

    const [beforeResult, afterResult] = await Promise.all([
      execAsync(beforeCommand).catch(() => ({ stdout: '' })),
      execAsync(afterCommand).catch(() => ({ stdout: '' }))
    ]);

    return {
      before: beforeResult.stdout.trim() || undefined,
      after: afterResult.stdout.trim() || undefined
    };
  } catch (error) {
    return {};
  }
};

// Execute grep command and return results
const executeContentSearch = async (
  query: string,
  folder: string,
  options: {
    fileTypes?: string[];
    excludeDirs?: string[];
    caseSensitive?: boolean;
    maxResults?: number;
    enableFuzzy?: boolean;
    enableFlexibleSpacing?: boolean;
    fuzzyOptions?: {
      maxDistance?: number;
      includePartialMatches?: boolean;
      customSubstitutions?: { [key: string]: string[] };
    };
  }
): Promise<{
  results: ContentSearchResult[];
  totalMatches: number;
  command: string;
}> => {
  const {
    fileTypes = DEFAULT_INCLUDE_TYPES,
    excludeDirs = DEFAULT_EXCLUDE_DIRS,
    caseSensitive = false,
    maxResults = 100,
    enableFuzzy = true,
    enableFlexibleSpacing = true,
    fuzzyOptions = {}
  } = options;

  // Validate inputs
  if (!query || !query.trim()) {
    throw new Error('Query is required');
  }

  // Decode URL-encoded path and normalize
  const normalizedFolder = decodeURIComponent(folder).trim();
  console.log('📁 Checking folder existence:', { 
    original: folder, 
    normalized: normalizedFolder,
    exists: fs.existsSync(normalizedFolder)
  });

  if (!normalizedFolder || !fs.existsSync(normalizedFolder)) {
    throw new Error(`Folder does not exist: ${normalizedFolder}`);
  }

  // Build and execute grep command
  const grepCommand = buildGrepCommand(query, normalizedFolder, {
    fileTypes,
    excludeDirs,
    caseSensitive,
    maxResults,
    enableFuzzy,
    enableFlexibleSpacing,
    fuzzyOptions
  });

  console.log('📝 Executing command:', grepCommand);

  const { stdout, stderr } = await execAsync(grepCommand);

  // Parse results
  const results = parseGrepOutput(stdout, normalizedFolder);

  // Add context for first few results (to avoid performance issues)
  const resultsWithContext = await Promise.all(
    results.slice(0, 20).map(async (result) => {
      const context = await getContextLines(result.file, result.lineNumber);
      return {
        ...result,
        contextBefore: context.before,
        contextAfter: context.after
      };
    })
  );

  // Add remaining results without context
  const finalResults = [
    ...resultsWithContext,
    ...results.slice(20)
  ];

  console.log(`✅ Content search completed: ${finalResults.length} results`);

  return {
    results: finalResults,
    totalMatches: finalResults.length,
    command: grepCommand
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Handle POST request (existing functionality)
    const {
      query,
      folder = '/Users/pratheeshpm/Documents/Interview/leetcode/leetcode-js',
      fileTypes = [],
      excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'],
      caseSensitive = false,
      maxResults = 100,
      enableFuzzy = false,
      enableFlexibleSpacing = false,
      fuzzyOptions = {}
    } = req.body as ContentSearchRequest;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    try {
      const startTime = Date.now();
      
      const searchResult = await executeContentSearch(query, folder, {
        fileTypes,
        excludeDirs,
        caseSensitive,
        maxResults,
        enableFuzzy,
        enableFlexibleSpacing,
        fuzzyOptions
      });

      const executionTime = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        results: searchResult.results,
        totalMatches: searchResult.totalMatches,
        executionTime,
        command: searchResult.command
      });
    } catch (error) {
      console.error('Content search error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during content search'
      });
    }
  } else if (req.method === 'GET') {
    // Handle GET request with query parameters
    const {
      q,
      query,
      folder = '/Users/pratheeshpm/Documents/Interview/leetcode/leetcode-js',
      fileTypes,
      excludeDirs,
      caseSensitive = 'false',
      maxResults = '100',
      enableFuzzy = 'false',
      enableFlexibleSpacing = 'false',
      maxDistance = '1',
      includePartialMatches = 'true',
      customSubstitutions
    } = req.query;

    const searchQuery = (q || query) as string;
    
    if (!searchQuery || !searchQuery.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter (q or query) is required'
      });
    }

    try {
      const startTime = Date.now();
      
      // Parse query parameters
      const parsedFileTypes = fileTypes ? (Array.isArray(fileTypes) ? fileTypes : [fileTypes]) : [];
      const parsedExcludeDirs = excludeDirs ? (Array.isArray(excludeDirs) ? excludeDirs : [excludeDirs]) : ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
      
      // Parse custom substitutions from query string format: "a:e,i ph:f c:k,ck"
      const parsedCustomSubstitutions: { [key: string]: string[] } = {};
      if (customSubstitutions && typeof customSubstitutions === 'string') {
        const pairs = customSubstitutions.split(' ').filter(p => p.trim());
        pairs.forEach(pair => {
          const [key, values] = pair.split(':');
          if (key && values) {
            parsedCustomSubstitutions[key.trim()] = values.split(',').map(v => v.trim());
          }
        });
      }

      const fuzzyOptions = {
        maxDistance: parseInt(maxDistance as string) || 1,
        includePartialMatches: includePartialMatches === 'true',
        customSubstitutions: parsedCustomSubstitutions
      };

      const searchResult = await executeContentSearch(searchQuery, folder as string, {
        fileTypes: parsedFileTypes,
        excludeDirs: parsedExcludeDirs,
        caseSensitive: caseSensitive === 'true',
        maxResults: parseInt(maxResults as string) || 100,
        enableFuzzy: enableFuzzy === 'true',
        enableFlexibleSpacing: enableFlexibleSpacing === 'true',
        fuzzyOptions
      });

      const executionTime = Date.now() - startTime;

      return res.status(200).json({
        success: true,
        results: searchResult.results,
        totalMatches: searchResult.totalMatches,
        executionTime,
        command: searchResult.command,
        queryParams: {
          query: searchQuery,
          folder,
          fileTypes: parsedFileTypes,
          excludeDirs: parsedExcludeDirs,
          caseSensitive: caseSensitive === 'true',
          maxResults: parseInt(maxResults as string) || 100,
          enableFuzzy: enableFuzzy === 'true',
          enableFlexibleSpacing: enableFlexibleSpacing === 'true',
          fuzzyOptions
        }
      });
    } catch (error) {
      console.error('Content search error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error during content search'
      });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET or POST.'
    });
  }
} 