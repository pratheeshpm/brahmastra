import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MemoizedReactMarkdown } from '@/components/Markdown/MemoizedReactMarkdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';

interface FileItem {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  relativePath: string;
}

interface FolderOption {
  path: string;
  name: string;
  description: string;
  icon: string;
  exists: boolean;
}

interface SearchResult {
  file: FileItem;
  relevanceScore: number;
  reasoning: string;
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

interface FileContentResponse {
  success: boolean;
  content?: string;
  filePath: string;
  fileName: string;
  fileSize?: number;
  fileType: 'file' | 'directory';
  encoding?: string;
  detectedFileType?: string;
  renderingFormat?: 'text' | 'markdown' | 'json' | 'binary' | 'image' | 'pdf' | 'excalidraw';
  directoryContents?: Array<{
    name: string;
    type: 'file' | 'directory';
    size?: number;
    extension?: string;
  }>;
  error?: string;
}

type SortOption = 'relevance' | 'name_asc' | 'name_desc' | 'size_desc' | 'size_asc' | 'type';
type SearchFilter = 'both' | 'files' | 'folders';
type SearchMode = 'filename' | 'content';

const FileSearchPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [fileResults, setFileResults] = useState<SearchResult[]>([]);
  const [folderResults, setFolderResults] = useState<SearchResult[]>([]);
  const [contentSearchResults, setContentSearchResults] = useState<ContentSearchResult[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [searchFilter, setSearchFilter] = useState<SearchFilter>('both');
  const [searchMode, setSearchMode] = useState<SearchMode>('filename');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileContentResponse, setFileContentResponse] = useState<FileContentResponse | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [directoryContents, setDirectoryContents] = useState<Array<{
    name: string;
    type: 'file' | 'directory';
    size?: number;
    extension?: string;
  }> | null>(null);
  const [baseFolder, setBaseFolder] = useState<string>('');
  const [totalStats, setTotalStats] = useState({ files: 0, directories: 0 });
  const [selectedEditor, setSelectedEditor] = useState<'cursor' | 'vscode'>('cursor');
  const [openingFile, setOpeningFile] = useState<string | null>(null);
  const [availableFolders, setAvailableFolders] = useState<FolderOption[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{
    cached: boolean;
    cacheTimestamp?: number;
  }>({ cached: false });
  const [searchCacheInfo, setSearchCacheInfo] = useState<{
    cached: boolean;
    cacheTimestamp?: number;
    cacheKey?: string;
  }>({ cached: false });
  const [contentSearchTerm, setContentSearchTerm] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [maxResults, setMaxResults] = useState(100);
  const [enableFuzzy, setEnableFuzzy] = useState(true);
  const [enableFlexibleSpacing, setEnableFlexibleSpacing] = useState(true);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [fuzzyOptions, setFuzzyOptions] = useState({
    maxDistance: 1,
    includePartialMatches: true,
    customSubstitutions: {} as { [key: string]: string[] }
  });

  // Load all files and folders on component mount
  useEffect(() => {
    loadAvailableFolders();
    loadAllFiles();
  }, []);

  // Handle URL query parameters
  useEffect(() => {
    if (router.isReady) {
      const { q, query, mode, folder } = router.query;
      const searchQuery = (q || query) as string;
      const searchModeFromUrl = (mode as SearchMode) || 'filename';
      const folderFromUrl = folder as string;
      
      // Set search mode first
      if (searchModeFromUrl !== searchMode) {
        setSearchMode(searchModeFromUrl);
      }
      
      // Handle folder selection from URL
      if (folderFromUrl && availableFolders.length > 0) {
        const folderExists = availableFolders.some(f => f.path === folderFromUrl);
        if (folderExists) {
          if (folderFromUrl !== selectedFolder) {
            setSelectedFolder(folderFromUrl);
            // Load files from the URL folder
            loadAllFiles(folderFromUrl);
          }
        } else {
          // Show error message for non-existent folder
          console.warn(`Folder from URL not found in available folders: ${folderFromUrl}`);
          alert(`⚠️ The folder "${folderFromUrl}" is not available in your folder list. Using default folder instead.`);
          // Use default folder for the search mode
          const defaultFolder = getDefaultFolder(searchModeFromUrl, availableFolders);
          if (defaultFolder !== selectedFolder) {
            setSelectedFolder(defaultFolder);
            loadAllFiles(defaultFolder);
          }
        }
      }
      
      // Handle search query - only if we haven't already processed this query
      if (searchQuery && searchQuery.trim()) {
        if (searchModeFromUrl === 'content') {
          if (contentSearchTerm !== searchQuery) {
            setContentSearchTerm(searchQuery);
            // Wait a bit for folder to be set, then perform search
            setTimeout(() => performContentSearch(searchQuery), 100);
          }
        } else {
          if (searchTerm !== searchQuery && allFiles.length > 0) {
            setSearchTerm(searchQuery);
            performAISearch(searchQuery);
          }
        }
      }
    }
  }, [router.isReady, router.query.q, router.query.query, router.query.mode, router.query.folder, availableFolders]);

  // Sort results whenever sortOption changes
  useEffect(() => {
    if (searchResults.length > 0) {
      const sortedResults = sortResults(searchResults, sortOption);
      setSearchResults(sortedResults);
    }
  }, [sortOption]);

  // Update folder selection when search mode changes - but avoid infinite loops
  useEffect(() => {
    if (availableFolders.length > 0 && !router.query.folder) {
      const newDefaultFolder = getDefaultFolder(searchMode, availableFolders);
      if (newDefaultFolder !== selectedFolder) {
        handleFolderChange(newDefaultFolder);
      }
    }
  }, [searchMode, availableFolders, router.query.folder]);

  // Get default folder based on search mode
  const getDefaultFolder = (mode: SearchMode, folders: FolderOption[]): string => {
    if (mode === 'content') {
      // For content search, prefer JavaScript directory
      const jsFolder = '/Users/pratheeshpm/Documents/Interview/leetcode/leetcode-js';
      const jsFolderExists = folders.some(f => f.path === jsFolder);
      if (jsFolderExists) return jsFolder;
    } else {
      // For filename search, prefer system design directory
      const systemDesignFolder = '/Users/pratheeshpm/Documents/Interview/leetcode/system-design-main';
      const systemDesignFolderExists = folders.some(f => f.path === systemDesignFolder);
      if (systemDesignFolderExists) return systemDesignFolder;
    }
    
    // Fallback to first available folder
    return folders.length > 0 ? folders[0].path : '';
  };

  // Load available folders from the API
  const loadAvailableFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const response = await fetch('/api/file-search/folders');
      const data = await response.json();

      if (data.success) {
        setAvailableFolders(data.folders);
        
        // Set default folder based on current search mode
        if (!selectedFolder && data.folders.length > 0) {
          const defaultFolder = getDefaultFolder(searchMode, data.folders);
          setSelectedFolder(defaultFolder);
        }
        
        console.log(`📁 Loaded ${data.folders.length} available folders`);
      } else {
        console.error('Failed to load folders:', data.error);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Load all files from the API
  const loadAllFiles = async (folder?: string, refresh = false) => {
    setIsLoadingFiles(true);
    try {
      const folderParam = folder || selectedFolder;
      const refreshParam = refresh ? '&refresh=true' : '';
      const url = folderParam ? 
        `/api/file-search/list?folder=${encodeURIComponent(folderParam)}${refreshParam}` : 
        `/api/file-search/list${refreshParam}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAllFiles(data.files);
        setBaseFolder(data.baseFolder);
        setTotalStats({
          files: data.totalFiles,
          directories: data.totalDirectories
        });
        setCacheInfo({
          cached: data.cached || false,
          cacheTimestamp: data.cacheTimestamp
        });
        
        const cacheStatus = data.cached ? '(cached)' : '(fresh)';
        console.log(`📁 Loaded ${data.files.length} files from ${data.baseFolder} ${cacheStatus}`);
      } else {
        console.error('Failed to load files:', data.error);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Function to sort results
  const sortResults = (results: SearchResult[], option: SortOption): SearchResult[] => {
    const sortedResults = [...results];
    
    switch (option) {
      case 'name_asc':
        return sortedResults.sort((a, b) => a.file.name.localeCompare(b.file.name));
      case 'name_desc':
        return sortedResults.sort((a, b) => b.file.name.localeCompare(a.file.name));
      case 'size_desc':
        return sortedResults.sort((a, b) => (b.file.size || 0) - (a.file.size || 0));
      case 'size_asc':
        return sortedResults.sort((a, b) => (a.file.size || 0) - (b.file.size || 0));
      case 'type':
        return sortedResults.sort((a, b) => {
          if (a.file.type !== b.file.type) {
            return a.file.type === 'directory' ? -1 : 1;
          }
          return a.file.name.localeCompare(b.file.name);
        });
      case 'relevance':
      default:
        return sortedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  };

  // Perform AI search using the search API
  const performAISearch = async (query: string, fresh = false) => {
    if (!query.trim() || allFiles.length === 0) return;

    setIsSearching(true);
    setSelectedFile(null);
    setFileContent(null);
    setDirectoryContents(null);

    try {
      const response = await fetch('/api/file-search/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          files: allFiles,
          maxResults: 20,
          fresh
        }),
      });

      const data = await response.json();

      if (data.success) {
        const files = data.fileResults || [];
        const folders = data.folderResults || [];
        const combinedResults = [...files, ...folders];
        
        setFileResults(files);
        setFolderResults(folders);
        setSearchResults(combinedResults);
        setSearchCacheInfo({
          cached: data.cached || false,
          cacheTimestamp: data.cacheTimestamp,
          cacheKey: data.cacheKey
        });
        
        const cacheStatus = data.cached ? '(cached)' : '(fresh)';
        console.log(`🔍 AI search found ${files.length} files and ${folders.length} folders ${cacheStatus}`);
      } else {
        console.error('AI search failed:', data.error);
        setSearchResults([]);
        setFileResults([]);
        setFolderResults([]);
      }
    } catch (error) {
      console.error('AI search error:', error);
      setSearchResults([]);
      setFileResults([]);
      setFolderResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform content search using grep
  const performContentSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSelectedFile(null);
    setFileContent(null);
    setDirectoryContents(null);
    setContentSearchResults([]);

    try {
      const response = await fetch('/api/file-search/content-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          folder: selectedFolder,
          caseSensitive,
          maxResults,
          enableFuzzy,
          enableFlexibleSpacing,
          fuzzyOptions
        }),
      });

      const data = await response.json();

      if (data.success) {
        setContentSearchResults(data.results);
        console.log(`🔍 Content search found ${data.results.length} matches in ${data.executionTime}ms`);
      } else {
        console.error('Content search failed:', data.error);
        setContentSearchResults([]);
      }
    } catch (error) {
      console.error('Content search error:', error);
      setContentSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle refresh folder structure
  const handleRefreshFiles = async () => {
    await loadAllFiles(selectedFolder, true);
  };

  // Handle folder selection change
  const handleFolderChange = async (folderPath: string) => {
    setSelectedFolder(folderPath);
    setSearchResults([]); // Clear previous search results
    setContentSearchResults([]); // Clear content search results
    setSelectedFile(null); // Clear selected file
    setFileContent(null); // Clear file content
    setFileContentResponse(null); // Clear file content response
    setDirectoryContents(null); // Clear directory contents
    
    // Reload files from the new folder
    await loadAllFiles(folderPath);
  };

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchMode === 'content' ? contentSearchTerm : searchTerm;
    if (!query.trim()) return;

    // Update URL with search query
    router.push({
      pathname: '/file-search',
      query: { q: query, mode: searchMode }
    }, undefined, { shallow: true });

    // Perform the appropriate search
    if (searchMode === 'content') {
      await performContentSearch(query);
    } else {
      await performAISearch(query);
    }
  };

  // Handle file/directory click to load content
  const handleFileClick = async (file: FileItem) => {
    setSelectedFile(file);
    setIsLoadingContent(true);
    setFileContent(null);
    setFileContentResponse(null);
    setDirectoryContents(null);

    try {
      const response = await fetch(`/api/file-search/content?filePath=${encodeURIComponent(file.path)}&type=${file.type}`);
      const data: FileContentResponse = await response.json();

      if (data.success) {
        setFileContentResponse(data);
        if (data.fileType === 'directory') {
          setDirectoryContents(data.directoryContents || []);
        } else {
          setFileContent(data.content || '');
        }
      } else {
        console.error('Failed to load file content:', data.error);
        setFileContent(`Error loading file: ${data.error}`);
        setFileContentResponse(null);
      }
    } catch (error) {
      console.error('Error loading file content:', error);
      setFileContent('Failed to load file content.');
      setFileContentResponse(null);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Handle opening file in editor
  const handleOpenInEditor = async (file: FileItem, editor: 'cursor' | 'vscode') => {
    setOpeningFile(file.path);
    
    try {
      const response = await fetch('/api/file-search/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filePath: file.path,
          editor,
          type: file.type
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(`✅ ${data.message}`);
        // Could show a toast notification here
      } else {
        console.error('Failed to open file:', data.error);
        alert(`Failed to open file: ${data.error}`);
      }
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Failed to open file in editor.');
    } finally {
      setOpeningFile(null);
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Get file type icon
  const getFileIcon = (file: FileItem): string => {
    if (file.type === 'directory') return '📁';
    
    const ext = file.extension?.toLowerCase();
    switch (ext) {
      // JavaScript/TypeScript
      case '.js':
      case '.jsx':
        return '🟨';
      case '.ts':
      case '.tsx':
        return '🔷';
      case '.vue':
        return '💚';
      case '.svelte':
        return '🧡';
      
      // Python
      case '.py':
        return '🐍';
      
      // Java/JVM
      case '.java':
        return '☕';
      case '.kt':
      case '.kotlin':
        return '🟣';
      case '.scala':
        return '🔴';
      
      // C/C++
      case '.cpp':
      case '.c':
      case '.h':
      case '.hpp':
        return '⚙️';
      
      // C#
      case '.cs':
        return '🟦';
      
      // Go
      case '.go':
        return '🐹';
      
      // Rust
      case '.rs':
        return '🦀';
      
      // Swift
      case '.swift':
        return '🧡';
      
      // Ruby
      case '.rb':
        return '💎';
      
      // PHP
      case '.php':
        return '🐘';
      
      // Web
      case '.html':
      case '.htm':
        return '🌐';
      case '.css':
        return '🎨';
      case '.scss':
      case '.sass':
        return '💅';
      case '.less':
        return '📘';
      
      // Data formats
      case '.json':
        return '📋';
      case '.xml':
        return '📄';
      case '.yaml':
      case '.yml':
        return '⚙️';
      case '.toml':
        return '🔧';
      case '.ini':
      case '.cfg':
      case '.conf':
        return '⚙️';
      
      // Documentation
      case '.md':
      case '.markdown':
        return '📝';
      case '.txt':
        return '📄';
      case '.rst':
        return '📖';
      
      // Shell scripts
      case '.sh':
      case '.bash':
      case '.zsh':
      case '.fish':
        return '🐚';
      case '.ps1':
        return '💙';
      case '.bat':
      case '.cmd':
        return '⚫';
      
      // Database
      case '.sql':
        return '🗄️';
      case '.db':
      case '.sqlite':
      case '.sqlite3':
        return '💾';
      
      // Images
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.bmp':
      case '.webp':
        return '🖼️';
      case '.svg':
        return '🎨';
      case '.ico':
        return '🔷';
      
      // Documents
      case '.pdf':
        return '📕';
      case '.doc':
      case '.docx':
        return '📘';
      case '.xls':
      case '.xlsx':
        return '📗';
      case '.ppt':
      case '.pptx':
        return '📙';
      
      // Special files
      case '.excalidraw':
        return '✏️';
      case '.dockerfile':
        return '🐳';
      case '.gitignore':
        return '🚫';
      case '.env':
        return '🔐';
      case '.lock':
        return '🔒';
      case '.log':
        return '📊';
      
      // Archives
      case '.zip':
      case '.tar':
      case '.gz':
      case '.bz2':
      case '.7z':
      case '.rar':
        return '📦';
      
      // Media
      case '.mp3':
      case '.wav':
      case '.flac':
        return '🎵';
      case '.mp4':
      case '.avi':
      case '.mov':
      case '.wmv':
        return '🎬';
      
      default:
        return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>File Search - AI-Powered Code Search</title>
        <meta name="description" content="AI-powered file and folder search with smart content analysis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto px-4 py-4 min-h-screen flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">AI-Powered File Search</h1>
            <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              ← Back to Chat
            </Link>
          </div>
          <p className="text-gray-300 text-sm">
            Search through your codebase using AI to find the most relevant files
            {baseFolder && (
              <span className="text-xs text-gray-400 ml-2">
                📁 Base: {baseFolder} • {totalStats.files} files, {totalStats.directories} directories
                {cacheInfo.cached && cacheInfo.cacheTimestamp && (
                  <span className="text-green-400 ml-1">
                    • 🚀 Cached ({new Date(cacheInfo.cacheTimestamp).toLocaleTimeString()})
                  </span>
                )}
              </span>
            )}
          </p>
        </div>

        {/* Folder Selection */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <label htmlFor="folder-select" className="text-sm font-medium text-gray-300 whitespace-nowrap">
              📁 Search in:
            </label>
            <select
              id="folder-select"
              value={selectedFolder}
              onChange={(e) => handleFolderChange(e.target.value)}
              disabled={isLoadingFolders || isLoadingFiles}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
            >
              {availableFolders.map((folder) => (
                <option key={folder.path} value={folder.path}>
                  {folder.icon} {folder.name} - {folder.description}
                </option>
              ))}
            </select>
            <button
              onClick={() => loadAvailableFolders()}
              disabled={isLoadingFolders}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              title="Refresh folder list"
            >
              {isLoadingFolders ? (
                <>
                  <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </>
              )}
            </button>
            <button
              onClick={handleRefreshFiles}
              disabled={isLoadingFiles}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                cacheInfo.cached 
                  ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-700'
              } text-white disabled:opacity-50`}
              title={cacheInfo.cached ? "Refresh cached folder structure" : "Refresh folder structure"}
            >
              {isLoadingFiles ? (
                <>
                  <div className="animate-spin w-4 h-4 border border-white border-t-transparent rounded-full"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {cacheInfo.cached ? '🚀 Refresh Cache' : '🔄 Refresh'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-4 flex-shrink-0">
          {/* Search Mode Toggle */}
          <div className="flex items-center gap-4 mb-3">
            <label className="text-sm font-medium text-gray-300">Search Mode:</label>
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSearchMode('filename')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'filename'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                📄 Filename Search
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('content')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'content'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                🔍 Content Search
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="space-y-3">
            <div className="flex gap-4">
              {searchMode === 'filename' ? (
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Describe what you're looking for... (e.g., 'authentication logic', 'API endpoints', 'React components')"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  disabled={isSearching || isLoadingFiles}
                />
              ) : (
                <input
                  type="text"
                  value={contentSearchTerm}
                  onChange={(e) => setContentSearchTerm(e.target.value)}
                  placeholder="Search file contents... (e.g., 'function authenticate', 'lowest common', 'authentcate' - supports fuzzy matching & flexible spacing)"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white"
                  disabled={isSearching || isLoadingFiles}
                />
              )}
              
              <button
                type="submit"
                disabled={isSearching || isLoadingFiles || 
                  (searchMode === 'filename' ? !searchTerm.trim() || allFiles.length === 0 : !contentSearchTerm.trim())}
                className={`px-6 py-3 ${
                  searchMode === 'filename' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors`}
              >
                {isSearching ? 'Searching...' : isLoadingFiles ? 'Loading...' : 
                  searchMode === 'filename' ? 'AI Search' : 'Content Search'}
              </button>
              
              {((searchMode === 'filename' && searchResults.length > 0) || 
                (searchMode === 'content' && contentSearchResults.length > 0)) && (
                <button
                  type="button"
                  onClick={async () => {
                    const query = searchMode === 'content' ? contentSearchTerm : searchTerm;
                    if (query.trim()) {
                      if (searchMode === 'content') {
                        await performContentSearch(query);
                      } else {
                        await performAISearch(query, true);
                      }
                    }
                  }}
                  disabled={isSearching || isLoadingFiles || 
                    (searchMode === 'filename' ? !searchTerm.trim() : !contentSearchTerm.trim())}
                  className="px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  Fresh Search
                </button>
              )}
            </div>
            
            {/* Search Options for Content Search */}
            {searchMode === 'content' && (
              <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded"
                  />
                  Case Sensitive
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={enableFlexibleSpacing}
                    onChange={(e) => setEnableFlexibleSpacing(e.target.checked)}
                    className="rounded"
                  />
                  Flexible Spacing
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={enableFuzzy}
                    onChange={(e) => setEnableFuzzy(e.target.checked)}
                    className="rounded"
                  />
                  Fuzzy Match
                </label>
                
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                >
                  <option value={50}>50 results</option>
                  <option value={100}>100 results</option>
                  <option value={200}>200 results</option>
                  <option value={500}>500 results</option>
                </select>
                
                {/* Advanced Fuzzy Options */}
                {enableFuzzy && (
                  <div className="w-full mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span className={`transform transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                      Advanced Fuzzy Options
                    </button>
                    
                    {showAdvancedOptions && (
                      <div className="space-y-3 p-3 bg-gray-700 rounded-lg border border-gray-500 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Max Distance</label>
                            <select
                              value={fuzzyOptions.maxDistance}
                              onChange={(e) => setFuzzyOptions({
                                ...fuzzyOptions,
                                maxDistance: Number(e.target.value)
                              })}
                              className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-white"
                            >
                              <option value={1}>1 (strict)</option>
                              <option value={2}>2 (moderate)</option>
                              <option value={3}>3 (loose)</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="flex items-center gap-2 text-xs text-gray-300">
                              <input
                                type="checkbox"
                                checked={fuzzyOptions.includePartialMatches}
                                onChange={(e) => setFuzzyOptions({
                                  ...fuzzyOptions,
                                  includePartialMatches: e.target.checked
                                })}
                                className="rounded"
                              />
                              Partial Matches
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">
                            Custom Substitutions (e.g., "a:e,i" for a↔e↔i)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., a:e,i ph:f c:k,ck"
                            className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-white placeholder-gray-400"
                            onChange={(e) => {
                              const customSubs: { [key: string]: string[] } = {};
                              const pairs = e.target.value.split(' ').filter(p => p.trim());
                              
                              pairs.forEach(pair => {
                                const [key, values] = pair.split(':');
                                if (key && values) {
                                  customSubs[key.trim()] = values.split(',').map(v => v.trim());
                                }
                              });
                              
                              setFuzzyOptions({
                                ...fuzzyOptions,
                                customSubstitutions: customSubs
                              });
                            }}
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Format: "key:value1,value2 key2:value3,value4"
                          </p>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-500">
                          <p className="text-xs text-gray-400 mb-2">Quick Presets:</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setFuzzyOptions({
                                maxDistance: 1,
                                includePartialMatches: true,
                                customSubstitutions: {}
                              })}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white transition-colors"
                            >
                              Default
                            </button>
                            <button
                              type="button"
                              onClick={() => setFuzzyOptions({
                                maxDistance: 2,
                                includePartialMatches: true,
                                customSubstitutions: {
                                  'a': ['a', 'e', 'i'],
                                  'e': ['e', 'a', 'i'],
                                  'i': ['i', 'e', 'a'],
                                  'o': ['o', 'u'],
                                  'u': ['u', 'o']
                                }
                              })}
                              className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs text-white transition-colors"
                            >
                              Vowel Swap
                            </button>
                            <button
                              type="button"
                              onClick={() => setFuzzyOptions({
                                maxDistance: 2,
                                includePartialMatches: true,
                                customSubstitutions: {
                                  'c': ['c', 'k', 'ck'],
                                  'k': ['k', 'c', 'ck'],
                                  'f': ['f', 'ph'],
                                  'ph': ['ph', 'f'],
                                  's': ['s', 'z'],
                                  'z': ['z', 's']
                                }
                              })}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs text-white transition-colors"
                            >
                              Phonetic
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Cache Info */}
        {(searchCacheInfo.cached || searchCacheInfo.cacheTimestamp) && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className={`flex items-center gap-2 ${searchCacheInfo.cached ? 'text-green-400' : 'text-blue-400'}`}>
                  {searchCacheInfo.cached ? '🟢' : '🔵'}
                  Search: {searchCacheInfo.cached ? 'Cached' : 'Fresh'}
                </span>
                {searchCacheInfo.cacheTimestamp && (
                  <span className="text-gray-400">
                    {new Date(searchCacheInfo.cacheTimestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              {searchCacheInfo.cacheKey && (
                <span className="text-xs text-gray-500 font-mono">
                  Key: {searchCacheInfo.cacheKey.substring(0, 8)}...
                </span>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoadingFiles && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3">Loading files from directory...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
          {/* Search Results */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Search Results</h2>
              
              {/* Sort Dropdown */}
              {searchResults.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="sort-select" className="text-sm text-gray-300">
                    Sort by:
                  </label>
                  <select
                    id="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance Score</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="size_desc">Size (Largest First)</option>
                    <option value="size_asc">Size (Smallest First)</option>
                    <option value="type">Type (Directories First)</option>
                  </select>
                </div>
              )}
            </div>
            
            {searchMode === 'filename' && searchResults.length === 0 && !isSearching && !isLoadingFiles && (
              <p className="text-gray-400">No results yet. Enter a search term to find relevant files using AI.</p>
            )}

            {searchMode === 'content' && contentSearchResults.length === 0 && !isSearching && !isLoadingFiles && (
              <p className="text-gray-400">No results yet. Enter a search term to find content within files.</p>
            )}

            {/* Results Count */}
            {searchMode === 'filename' && searchResults.length > 0 && (
              <div className="mb-3 text-sm text-gray-400 flex items-center gap-4">
                <span>{searchResults.length} total results</span>
                <span>📄 {fileResults.length} files</span>
                <span>📁 {folderResults.length} folders</span>
              </div>
            )}

            {searchMode === 'content' && contentSearchResults.length > 0 && (
              <div className="mb-3 text-sm text-gray-400 flex items-center gap-4">
                <span>{contentSearchResults.length} content matches</span>
                <span>📄 {new Set(contentSearchResults.map(r => r.file)).size} files</span>
              </div>
            )}

            <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {/* Content Search Results */}
              {searchMode === 'content' && contentSearchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                    🔍 Content Matches ({contentSearchResults.length})
                  </h3>
                  <div className="space-y-3">
                    {contentSearchResults.map((result, index) => (
                      <div
                        key={`content-${index}`}
                        onClick={() => handleFileClick({
                          path: result.file,
                          name: result.fileName,
                          type: 'file',
                          relativePath: result.relativePath,
                          extension: result.fileExtension
                        })}
                        className="p-4 bg-gray-800 rounded-lg cursor-pointer transition-all hover:bg-gray-700 border-2 border-transparent hover:border-green-500"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">
                            {getFileIcon({
                              path: result.file,
                              name: result.fileName,
                              type: 'file',
                              relativePath: result.relativePath,
                              extension: result.fileExtension
                            })}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white truncate">
                                {result.fileName}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-green-600 text-green-100 px-2 py-1 rounded">
                                  Line {result.lineNumber}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {result.fileExtension?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-300 mb-2">
                              📂 {result.relativePath}
                            </p>
                            
                            {/* Context Before */}
                            {result.contextBefore && (
                              <div className="text-xs text-gray-500 mb-1 font-mono bg-gray-900 p-2 rounded">
                                {result.contextBefore.split('\n').map((line, i) => (
                                  <div key={i}>{line}</div>
                                ))}
                              </div>
                            )}
                            
                            {/* Matching Line */}
                            <div className="text-sm font-mono bg-yellow-900 bg-opacity-30 p-2 rounded mb-1">
                              <span className="text-yellow-400 font-bold">
                                {result.content}
                              </span>
                            </div>
                            
                            {/* Context After */}
                            {result.contextAfter && (
                              <div className="text-xs text-gray-500 mb-2 font-mono bg-gray-900 p-2 rounded">
                                {result.contextAfter.split('\n').map((line, i) => (
                                  <div key={i}>{line}</div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  Match on line {result.lineNumber}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenInEditor({
                                      path: result.file,
                                      name: result.fileName,
                                      type: 'file',
                                      relativePath: result.relativePath,
                                      extension: result.fileExtension
                                    }, 'cursor');
                                  }}
                                  disabled={openingFile === result.file}
                                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                                >
                                  {openingFile === result.file ? '...' : 'Cursor'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenInEditor({
                                      path: result.file,
                                      name: result.fileName,
                                      type: 'file',
                                      relativePath: result.relativePath,
                                      extension: result.fileExtension
                                    }, 'vscode');
                                  }}
                                  disabled={openingFile === result.file}
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                                >
                                  {openingFile === result.file ? '...' : 'VSCode'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files Section */}
              {searchMode === 'filename' && fileResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    📄 Files ({fileResults.length})
                  </h3>
                  <div className="space-y-3">
                    {fileResults.map((result, index) => (
                      <div
                        key={`file-${index}`}
                        onClick={() => handleFileClick(result.file)}
                        className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all hover:bg-gray-700 border-2 ${
                          selectedFile?.path === result.file.path 
                            ? 'border-blue-500 bg-gray-700' 
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">
                            {getFileIcon(result.file)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white truncate">
                                {result.file.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">
                                  Score: {result.relevanceScore}/10
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatFileSize(result.file.size)}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-300 mb-2">
                              📂 {result.file.relativePath}
                            </p>
                            
                            <p className="text-sm text-gray-400 italic">
                              💡 {result.reasoning}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {result.file.extension && `${result.file.extension.toUpperCase()}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenInEditor(result.file, 'cursor');
                                  }}
                                  disabled={openingFile === result.file.path}
                                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                                >
                                  {openingFile === result.file.path ? '...' : 'Cursor'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenInEditor(result.file, 'vscode');
                                  }}
                                  disabled={openingFile === result.file.path}
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                                >
                                  {openingFile === result.file.path ? '...' : 'VSCode'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Folders Section */}
              {searchMode === 'filename' && folderResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                    📁 Folders ({folderResults.length})
                  </h3>
                  <div className="space-y-3">
                    {folderResults.map((result, index) => (
                      <div
                        key={`folder-${index}`}
                        onClick={() => handleFileClick(result.file)}
                        className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all hover:bg-gray-700 border-2 ${
                          selectedFile?.path === result.file.path 
                            ? 'border-yellow-500 bg-gray-700' 
                            : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">
                            {getFileIcon(result.file)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white truncate">
                                {result.file.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                                  Score: {result.relevanceScore}/10
                                </span>
                                <span className="text-xs text-gray-400">
                                  Directory
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-300 mb-2">
                              📂 {result.file.relativePath}
                            </p>
                            
                            <p className="text-sm text-gray-400 italic">
                              💡 {result.reasoning}
                            </p>
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  FOLDER
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenInEditor(result.file, 'cursor');
                                  }}
                                  disabled={openingFile === result.file.path}
                                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                                >
                                  {openingFile === result.file.path ? '...' : 'Cursor'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenInEditor(result.file, 'vscode');
                                  }}
                                  disabled={openingFile === result.file.path}
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                                >
                                  {openingFile === result.file.path ? '...' : 'VSCode'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback for old combined results display */}
              {searchMode === 'filename' && searchResults.length > 0 && fileResults.length === 0 && folderResults.length === 0 && (
                <div className="space-y-3">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleFileClick(result.file)}
                      className={`p-4 bg-gray-800 rounded-lg cursor-pointer transition-all hover:bg-gray-700 border-2 ${
                        selectedFile?.path === result.file.path 
                          ? 'border-blue-500 bg-gray-700' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {getFileIcon(result.file)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-white truncate">
                              {result.file.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded">
                                Score: {result.relevanceScore}/10
                              </span>
                              <span className="text-xs text-gray-400">
                                {result.file.type === 'file' ? formatFileSize(result.file.size) : 'Directory'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-2">
                            📂 {result.file.relativePath}
                          </p>
                          
                          <p className="text-sm text-gray-400 italic">
                            💡 {result.reasoning}
                          </p>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {result.file.extension && `${result.file.extension.toUpperCase()}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenInEditor(result.file, 'cursor');
                                }}
                                disabled={openingFile === result.file.path}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                              >
                                {openingFile === result.file.path ? '...' : 'Cursor'}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenInEditor(result.file, 'vscode');
                                }}
                                disabled={openingFile === result.file.path}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                              >
                                {openingFile === result.file.path ? '...' : 'VSCode'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File Content Display */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">File Content</h2>
              {selectedFile && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenInEditor(selectedFile, 'cursor')}
                    disabled={openingFile === selectedFile.path}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                  >
                    {openingFile === selectedFile.path ? 'Opening...' : 'Open in Cursor'}
                  </button>
                  <button
                    onClick={() => handleOpenInEditor(selectedFile, 'vscode')}
                    disabled={openingFile === selectedFile.path}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
                  >
                    {openingFile === selectedFile.path ? 'Opening...' : 'Open in VSCode'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4 max-h-[calc(100vh-12rem)] flex flex-col">
              {!selectedFile && (
                <p className="text-gray-400">Click on a file to view its content</p>
              )}

              {selectedFile && isLoadingContent && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3">Loading content...</span>
                </div>
              )}
              
              {selectedFile && !isLoadingContent && (
                <div className="flex flex-col h-full">
                  <div className="mb-4 pb-4 border-b border-gray-600">
                    <h3 className="font-medium text-blue-400 flex items-center gap-2">
                      {getFileIcon(selectedFile)}
                      {selectedFile.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      📂 {selectedFile.relativePath}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      {selectedFile.type === 'file' && selectedFile.size && (
                        <p className="text-xs text-gray-500">
                          Size: {formatFileSize(selectedFile.size)}
                        </p>
                      )}
                      {fileContentResponse?.detectedFileType && (
                        <p className="text-xs text-gray-500">
                          Type: {fileContentResponse.detectedFileType.toUpperCase()}
                        </p>
                      )}
                      {fileContentResponse?.renderingFormat && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          fileContentResponse.renderingFormat === 'markdown' ? 'bg-blue-600 text-blue-100' :
                          fileContentResponse.renderingFormat === 'json' ? 'bg-yellow-600 text-yellow-100' :
                          fileContentResponse.renderingFormat === 'image' ? 'bg-green-600 text-green-100' :
                          fileContentResponse.renderingFormat === 'pdf' ? 'bg-red-600 text-red-100' :
                          fileContentResponse.renderingFormat === 'excalidraw' ? 'bg-purple-600 text-purple-100' :
                          'bg-gray-600 text-gray-100'
                        }`}>
                          {fileContentResponse.renderingFormat.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    {selectedFile.type === 'directory' && directoryContents ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Directory Contents:</h4>
                        {directoryContents.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                            <span className="text-lg">{item.type === 'directory' ? '📁' : getFileIcon({ ...item, type: item.type, path: '', relativePath: '' })}</span>
                            <span className="flex-1">{item.name}</span>
                            {item.size && (
                              <span className="text-xs text-gray-400">{formatFileSize(item.size)}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : fileContent ? (
                      <div className="prose prose-invert max-w-none">
                        <MemoizedReactMarkdown
                          className="text-gray-200"
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeMathjax]}
                        >
                          {fileContent}
                        </MemoizedReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-gray-400">No content available</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSearchPage;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
      ])),
    },
  };
}; 