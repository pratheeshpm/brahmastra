import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface FileContentRequest {
  filePath: string;
  type: 'file' | 'directory';
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

// Function to detect file type and determine how to process it
const detectFileType = (filePath: string): { 
  type: string; 
  renderingFormat: 'text' | 'markdown' | 'json' | 'binary' | 'image' | 'pdf' | 'excalidraw';
  isBinary: boolean;
} => {
  const extension = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath).toLowerCase();

  // Programming languages and text files
  const textExtensions = [
    '.txt', '.md', '.markdown', '.rst', '.rtf',
    '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
    '.py', '.rb', '.php', '.java', '.c', '.cpp', '.h', '.hpp',
    '.cs', '.go', '.rs', '.swift', '.kt', '.scala',
    '.html', '.htm', '.xml', '.xhtml', '.svg',
    '.css', '.scss', '.sass', '.less', '.stylus',
    '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
    '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
    '.sql', '.graphql', '.gql', '.proto',
    '.dockerfile', '.dockerignore', '.gitignore', '.gitattributes',
    '.env', '.env.example', '.env.local', '.env.production',
    '.log', '.lock', '.sum'
  ];

  // Special files
  const specialFiles = [
    'readme', 'license', 'changelog', 'contributing', 'authors',
    'makefile', 'dockerfile', 'vagrantfile', 'gemfile', 'podfile'
  ];

  // Image files
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif'];

  // PDF files
  const pdfExtensions = ['.pdf'];

  // Excalidraw files
  const excalidrawExtensions = ['.excalidraw'];

  // Binary files that we can't easily read
  const binaryExtensions = [
    '.exe', '.bin', '.dll', '.so', '.dylib', '.app',
    '.zip', '.tar', '.gz', '.bz2', '.xz', '.7z', '.rar',
    '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv',
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.db', '.sqlite', '.sqlite3'
  ];

  // Check for special files without extensions
  const baseNameWithoutExt = fileName.replace(extension, '');
  if (specialFiles.includes(baseNameWithoutExt)) {
    return { type: 'text', renderingFormat: 'text', isBinary: false };
  }

  // Check by extension
  if (textExtensions.includes(extension)) {
    if (extension === '.json') {
      return { type: 'json', renderingFormat: 'json', isBinary: false };
    }
    if (['.md', '.markdown'].includes(extension)) {
      return { type: 'markdown', renderingFormat: 'markdown', isBinary: false };
    }
    return { type: 'text', renderingFormat: 'text', isBinary: false };
  }

  if (imageExtensions.includes(extension)) {
    return { type: 'image', renderingFormat: 'image', isBinary: true };
  }

  if (pdfExtensions.includes(extension)) {
    return { type: 'pdf', renderingFormat: 'pdf', isBinary: true };
  }

  if (excalidrawExtensions.includes(extension)) {
    return { type: 'excalidraw', renderingFormat: 'excalidraw', isBinary: false };
  }

  if (binaryExtensions.includes(extension)) {
    return { type: 'binary', renderingFormat: 'binary', isBinary: true };
  }

  // Default: try to detect if it's binary by checking content
  try {
    const buffer = fs.readFileSync(filePath);
    const chunk = buffer.slice(0, 1024); // Check first 1KB
    
    // Check for null bytes (common in binary files)
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i] === 0) {
        return { type: 'binary', renderingFormat: 'binary', isBinary: true };
      }
    }
    
    // Check for high ratio of non-printable characters
    let nonPrintableCount = 0;
    for (let i = 0; i < chunk.length; i++) {
      const byte = chunk[i];
      if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
        nonPrintableCount++;
      }
    }
    
    if (nonPrintableCount / chunk.length > 0.3) {
      return { type: 'binary', renderingFormat: 'binary', isBinary: true };
    }
    
    return { type: 'text', renderingFormat: 'text', isBinary: false };
  } catch (error) {
    return { type: 'unknown', renderingFormat: 'binary', isBinary: true };
  }
};

// Function to get file encoding
const getFileEncoding = (filePath: string): string => {
  try {
    // Try to detect encoding using file command
    const command = `file -b --mime-encoding "${filePath}"`;
    const { stdout } = require('child_process').execSync(command, { encoding: 'utf8' });
    return stdout.trim();
  } catch (error) {
    return 'utf-8'; // Default fallback
  }
};

// Function to process PDF files
const processPDFFile = async (filePath: string): Promise<string> => {
  try {
    // Try to extract text from PDF using pdftotext (if available)
    const { stdout } = await execAsync(`pdftotext "${filePath}" - 2>/dev/null`);
    return `# PDF Content\n\n**File:** ${filePath}\n\n---\n\n${stdout}`;
  } catch (error) {
    return `# PDF File\n\n**File:** ${filePath}\n\n**Size:** ${fs.statSync(filePath).size} bytes\n\n---\n\n⚠️ **PDF text extraction not available**\n\nThis is a PDF file. To view the content:\n- Open in VSCode/Cursor using the buttons above\n- Or use a PDF viewer application\n\n*Note: Install \`pdftotext\` (poppler-utils) for automatic text extraction*`;
  }
};

// Function to process image files
const processImageFile = async (filePath: string): Promise<string> => {
  const stats = fs.statSync(filePath);
  const extension = path.extname(filePath).toLowerCase();
  
  // Try to get image dimensions if possible
  let dimensions = '';
  try {
    const { stdout } = await execAsync(`file "${filePath}" | grep -o '[0-9]\\+x[0-9]\\+' | head -1`);
    if (stdout.trim()) {
      dimensions = `**Dimensions:** ${stdout.trim()}\n`;
    }
  } catch (error) {
    // Ignore dimension detection errors
  }

  return `# Image File\n\n**File:** ${filePath}\n**Format:** ${extension.toUpperCase().substring(1)}\n**Size:** ${(stats.size / 1024).toFixed(2)} KB\n${dimensions}\n---\n\n![${path.basename(filePath)}](file://${filePath})\n\n*Note: Image preview may not work in all contexts. Use VSCode/Cursor to view the image.*`;
};

// Function to process Excalidraw files
const processExcalidrawFile = async (filePath: string): Promise<string> => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const excalidrawData = JSON.parse(content);
    
    return `# Excalidraw Drawing\n\n**File:** ${filePath}\n\n---\n\n## Drawing Information\n\n- **Type:** Excalidraw Drawing\n- **Elements:** ${excalidrawData.elements?.length || 0} elements\n- **App State:** ${excalidrawData.appState ? 'Present' : 'Not present'}\n\n## Raw Data\n\n\`\`\`json\n${JSON.stringify(excalidrawData, null, 2)}\n\`\`\`\n\n*Note: Open in VSCode/Cursor with Excalidraw extension for proper viewing*`;
  } catch (error) {
    return `# Excalidraw File\n\n**File:** ${filePath}\n\n---\n\n⚠️ **Error parsing Excalidraw file**\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\n*Try opening in VSCode/Cursor with Excalidraw extension*`;
  }
};

// Function to process JSON files with better formatting
const processJSONFile = async (filePath: string): Promise<string> => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(content);
    
    return `# JSON File\n\n**File:** ${filePath}\n\n---\n\n\`\`\`json\n${JSON.stringify(jsonData, null, 2)}\n\`\`\``;
  } catch (error) {
    // If JSON parsing fails, return as text
    const content = fs.readFileSync(filePath, 'utf8');
    return `# JSON File (Invalid)\n\n**File:** ${filePath}\n\n---\n\n⚠️ **Invalid JSON format**\n\n\`\`\`json\n${content}\n\`\`\`\n\n**Error:** ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

// Function to process text files with syntax highlighting
const processTextFile = async (filePath: string): Promise<string> => {
  const extension = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Map extensions to language identifiers for syntax highlighting
  const languageMap: { [key: string]: string } = {
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.py': 'python',
    '.rb': 'ruby',
    '.php': 'php',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.h': 'c',
    '.hpp': 'cpp',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.html': 'html',
    '.htm': 'html',
    '.xml': 'xml',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.less': 'less',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.toml': 'toml',
    '.ini': 'ini',
    '.cfg': 'ini',
    '.conf': 'ini',
    '.sh': 'bash',
    '.bash': 'bash',
    '.zsh': 'zsh',
    '.fish': 'fish',
    '.ps1': 'powershell',
    '.bat': 'batch',
    '.cmd': 'batch',
    '.sql': 'sql',
    '.graphql': 'graphql',
    '.gql': 'graphql',
    '.proto': 'protobuf',
    '.dockerfile': 'dockerfile',
    '.md': 'markdown',
    '.markdown': 'markdown'
  };

  const language = languageMap[extension] || 'text';
  
  return `# ${path.basename(filePath)}\n\n**File:** ${filePath}\n**Type:** ${language.toUpperCase()}\n\n---\n\n\`\`\`${language}\n${content}\n\`\`\``;
};

// Function to read file content safely with enhanced processing
const readFileContent = async (filePath: string): Promise<{ content: string; detectedType: string; renderingFormat: string }> => {
  try {
    const fileInfo = detectFileType(filePath);
    
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);

    // Limit file size to prevent memory issues
    if (fileSizeInMB > 10) {
      const content = `# Large File\n\n**File:** ${filePath}\n**Size:** ${fileSizeInMB.toFixed(2)}MB\n\n---\n\n⚠️ **File too large to display in full**\n\nShowing first 5000 characters:\n\n\`\`\`\n${fs.readFileSync(filePath, 'utf8').substring(0, 5000)}...\n\`\`\`\n\n*Use VSCode/Cursor to view the complete file*`;
      return { content, detectedType: fileInfo.type, renderingFormat: 'text' };
    }

    let content: string;

    // Process based on detected file type
    switch (fileInfo.renderingFormat) {
      case 'pdf':
        content = await processPDFFile(filePath);
        break;
      case 'image':
        content = await processImageFile(filePath);
        break;
      case 'excalidraw':
        content = await processExcalidrawFile(filePath);
        break;
      case 'json':
        content = await processJSONFile(filePath);
        break;
      case 'markdown':
        content = `# ${path.basename(filePath)}\n\n**File:** ${filePath}\n\n---\n\n${fs.readFileSync(filePath, 'utf8')}`;
        break;
      case 'text':
        content = await processTextFile(filePath);
        break;
      case 'binary':
      default:
        content = `# Binary File\n\n**File:** ${filePath}\n**Type:** ${fileInfo.type.toUpperCase()}\n**Size:** ${(stats.size / 1024).toFixed(2)} KB\n\n---\n\n⚠️ **Binary file cannot be displayed as text**\n\nThis file contains binary data and cannot be displayed as text.\n\n*Use VSCode/Cursor to open this file with appropriate extensions*`;
        break;
    }

    return { content, detectedType: fileInfo.type, renderingFormat: fileInfo.renderingFormat };
  } catch (error) {
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Function to read directory contents
const readDirectoryContents = async (dirPath: string) => {
  try {
    const items = fs.readdirSync(dirPath);
    const contents = [];

    for (const item of items.slice(0, 100)) { // Limit to first 100 items
      const itemPath = path.join(dirPath, item);
      
      try {
        const stats = fs.statSync(itemPath);
        const isDirectory = stats.isDirectory();
        
        contents.push({
          name: item,
          type: isDirectory ? 'directory' as const : 'file' as const,
          size: isDirectory ? undefined : stats.size,
          extension: isDirectory ? undefined : path.extname(item).toLowerCase()
        });
      } catch (error) {
        console.warn(`⚠️ Could not get stats for: ${itemPath}`);
      }
    }

    // Sort: directories first, then files
    contents.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return contents;
  } catch (error) {
    throw new Error(`Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<FileContentResponse>) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      filePath: '',
      fileName: '',
      fileType: 'file',
      error: 'Method not allowed' 
    });
  }

  try {
    const { filePath, type } = req.query as { filePath: string; type: 'file' | 'directory' };

    if (!filePath) {
      return res.status(400).json({
        success: false,
        filePath: '',
        fileName: '',
        fileType: 'file',
        error: 'File path is required'
      });
    }

    // Validate file path exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        filePath,
        fileName: path.basename(filePath),
        fileType: type || 'file',
        error: 'File or directory not found'
      });
    }

    const stats = fs.statSync(filePath);
    const isDirectory = stats.isDirectory();
    const fileName = path.basename(filePath);

    console.log(`📄 Reading ${isDirectory ? 'directory' : 'file'}: ${filePath}`);

    if (isDirectory) {
      // Read directory contents
      const directoryContents = await readDirectoryContents(filePath);
      
      res.status(200).json({
        success: true,
        filePath,
        fileName,
        fileType: 'directory',
        directoryContents
      });
    } else {
      // Read file content
      const fileResult = await readFileContent(filePath);
      const encoding = getFileEncoding(filePath);
      
      res.status(200).json({
        success: true,
        content: fileResult.content,
        filePath,
        fileName,
        fileSize: stats.size,
        fileType: 'file',
        encoding,
        detectedFileType: fileResult.detectedType,
        renderingFormat: fileResult.renderingFormat as 'text' | 'markdown' | 'json' | 'binary' | 'image' | 'pdf' | 'excalidraw'
      });
    }

  } catch (error) {
    console.error('❌ Error reading file/directory:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      filePath: req.query.filePath as string || '',
      fileName: path.basename(req.query.filePath as string || ''),
      fileType: (req.query.type as 'file' | 'directory') || 'file',
      error: errorMessage
    });
  }
};

export default handler; 