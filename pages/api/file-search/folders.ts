import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

interface FolderOption {
  path: string;
  name: string;
  description: string;
  icon: string;
  exists: boolean;
}

interface FoldersResponse {
  success: boolean;
  folders: FolderOption[];
  currentUser: string;
  error?: string;
}

// Function to check if directory exists and is accessible
const checkDirectoryAccess = (dirPath: string): boolean => {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

// Function to get common macOS directories
const getCommonMacOSDirectories = (username: string): FolderOption[] => {
  const homeDir = os.homedir();
  
  const commonFolders: FolderOption[] = [
    // Priority folder - always at the top and default
    {
      path: '/Users/pratheeshpm/Documents/Interview/leetcode/system-design-main',
      name: 'System Design (Default)',
      description: 'LeetCode System Design Main Directory',
      icon: '🎯',
      exists: checkDirectoryAccess('/Users/pratheeshpm/Documents/Interview/leetcode/system-design-main')
    },
    {
      path: '/Users/pratheeshpm/Documents/Interview/leetcode/LeetCode-JavaScript',
      name: 'LeetCode JavaScript',
      description: 'LeetCode JavaScript Directory',
      icon: '💡',
      exists: checkDirectoryAccess('/Users/pratheeshpm/Documents/Interview/leetcode/LeetCode-JavaScript')
    },
    {
      path: '/Users/pratheeshpm/Documents/Interview/leetcode/leetcodeTopicCategorized/topics',
      name: 'LeetCode Topics',
      description: 'LeetCode Topic Categorized Problems',
      icon: '📚',
      exists: checkDirectoryAccess('/Users/pratheeshpm/Documents/Interview/leetcode/leetcodeTopicCategorized/topics')
    },
    {
      path: '/Users/pratheeshpm/Documents/Interview/leetcode/leetcodeTopicCategorized/algorithms',
      name: 'LeetCode Algorithms',
      description: 'LeetCode Algorithm Categorized Problems',
      icon: '🧠',
      exists: checkDirectoryAccess('/Users/pratheeshpm/Documents/Interview/leetcode/leetcodeTopicCategorized/algorithms')
    },
    {
      path: '/Users/pratheeshpm/Documents/Interview/leetcode/leetcodeTopicCategorized/category',
      name: 'LeetCode Category',
      description: 'LeetCode Category Categorized Problems',
      icon: '🗂️',
      exists: checkDirectoryAccess('/Users/pratheeshpm/Documents/Interview/leetcode/leetcodeTopicCategorized/category')
    },
    {
      path: '/Users/pratheeshpm/Documents/Interview/leetcode/GPTSolvedJSProblems',
      name: 'GPT Solved JS Problems',
      description: 'GPT Solved JavaScript Problems',
      icon: '🤖',
      exists: checkDirectoryAccess('/Users/pratheeshpm/Documents/Interview/leetcode/GPTSolvedJSProblems')
    },
    {
      path: `${homeDir}/Documents`,
      name: 'Documents',
      description: 'User Documents folder',
      icon: '📄',
      exists: false
    },
   
  ];

  // Check which directories exist and are accessible
  commonFolders.forEach(folder => {
    folder.exists = checkDirectoryAccess(folder.path);
  });

  // Filter to only return existing directories
  return commonFolders.filter(folder => folder.exists);
};

// Function to get recent directories from shell history (if available)
const getRecentDirectories = async (): Promise<FolderOption[]> => {
  try {
    // Try to get recent directories from various sources
    const commands = [
      'find ~/Documents -type d -maxdepth 2 2>/dev/null | head -10',
      'find ~/Desktop -type d -maxdepth 2 2>/dev/null | head -5',
      'find ~/Downloads -type d -maxdepth 1 2>/dev/null | head -5'
    ];

    const recentDirs: FolderOption[] = [];
    
    for (const command of commands) {
      try {
        const { stdout } = await execAsync(command);
        const dirs = stdout.trim().split('\n').filter(dir => dir.trim() !== '');
        
        dirs.forEach(dir => {
          if (dir && checkDirectoryAccess(dir)) {
            const name = path.basename(dir);
            if (name && !recentDirs.some(existing => existing.path === dir)) {
              recentDirs.push({
                path: dir,
                name: name,
                description: `Recent: ${dir}`,
                icon: '📁',
                exists: true
              });
            }
          }
        });
      } catch (error) {
        // Ignore errors from individual commands
      }
    }

    return recentDirs.slice(0, 10); // Limit to 10 recent directories
  } catch (error) {
    return [];
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<FoldersResponse>) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      folders: [],
      currentUser: '',
      error: 'Method not allowed' 
    });
  }

  try {
    const currentUser = os.userInfo().username;
    
    console.log(`👤 Getting folder options for user: ${currentUser}`);

    // Get common macOS directories
    const commonFolders = getCommonMacOSDirectories(currentUser);
    
    // Get recent directories
    const recentFolders = await getRecentDirectories();

    // Combine all folders, removing duplicates
    const allFolders = [...commonFolders];
    
    // Add recent folders that aren't already in common folders
    recentFolders.forEach(recent => {
      if (!allFolders.some(existing => existing.path === recent.path)) {
        allFolders.push(recent);
      }
    });

    // Sort folders: common ones first, then recent ones
    allFolders.sort((a, b) => {
      // Home directory first
      if (a.path === os.homedir()) return -1;
      if (b.path === os.homedir()) return 1;
      
      // Then Documents, Desktop, Downloads
      const priorityFolders = [
        'System Design (Default)',
        'LeetCode JavaScript',
        'LeetCode Topics',
        'LeetCode Algorithms',
        'LeetCode Category',
        'GPT Solved JS Problems',
        
      ];
      const aIndex = priorityFolders.indexOf(a.name);
      const bIndex = priorityFolders.indexOf(b.name);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // Then alphabetically
      return a.name.localeCompare(b.name);
    });

    console.log(`📁 Found ${allFolders.length} accessible directories`);

    res.status(200).json({
      success: true,
      folders: allFolders,
      currentUser
    });

  } catch (error) {
    console.error('❌ Error getting folder options:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      folders: [],
      currentUser: '',
      error: errorMessage
    });
  }
};

export default handler; 