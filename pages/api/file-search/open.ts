import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface OpenFileRequest {
  filePath: string;
  editor: 'cursor' | 'vscode';
  type: 'file' | 'directory';
}

interface OpenFileResponse {
  success: boolean;
  filePath: string;
  editor: 'cursor' | 'vscode';
  command: string;
  message: string;
  error?: string;
}

// Function to check if editor is available
const checkEditorAvailability = async (editor: 'cursor' | 'vscode'): Promise<boolean> => {
  try {
    const command = editor === 'cursor' ? 'cursor --version' : 'code --version';
    await execAsync(command);
    return true;
  } catch (error) {
    return false;
  }
};

// Function to open file/folder in editor
const openInEditor = async (filePath: string, editor: 'cursor' | 'vscode'): Promise<string> => {
  try {
    // Validate file/folder exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File or directory not found: ${filePath}`);
    }

    // Check if editor is available
    const isAvailable = await checkEditorAvailability(editor);
    if (!isAvailable) {
      throw new Error(`${editor === 'cursor' ? 'Cursor' : 'VSCode'} is not installed or not in PATH`);
    }

    // Create command to open file/folder
    const command = editor === 'cursor' ? `cursor "${filePath}"` : `code "${filePath}"`;
    
    console.log(`🚀 Opening ${filePath} in ${editor === 'cursor' ? 'Cursor' : 'VSCode'}`);
    console.log(`📝 Command: ${command}`);

    // Execute command
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('Warning')) {
      console.warn(`⚠️ Editor stderr: ${stderr}`);
    }

    return command;
  } catch (error) {
    throw new Error(`Failed to open in ${editor === 'cursor' ? 'Cursor' : 'VSCode'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<OpenFileResponse>) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      filePath: '',
      editor: 'cursor',
      command: '',
      message: '',
      error: 'Method not allowed' 
    });
  }

  try {
    const { filePath, editor = 'cursor', type = 'file' }: OpenFileRequest = req.body;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        filePath: '',
        editor,
        command: '',
        message: '',
        error: 'File path is required'
      });
    }

    if (!['cursor', 'vscode'].includes(editor)) {
      return res.status(400).json({
        success: false,
        filePath,
        editor,
        command: '',
        message: '',
        error: 'Editor must be either "cursor" or "vscode"'
      });
    }

    // Validate file path exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        filePath,
        editor,
        command: '',
        message: '',
        error: 'File or directory not found'
      });
    }

    // Get file/directory info
    const stats = fs.statSync(filePath);
    const isDirectory = stats.isDirectory();
    const fileName = path.basename(filePath);

    console.log(`📂 Opening ${isDirectory ? 'directory' : 'file'}: ${fileName}`);

    // Open in editor
    const command = await openInEditor(filePath, editor);

    const message = `Successfully opened ${isDirectory ? 'directory' : 'file'} "${fileName}" in ${editor === 'cursor' ? 'Cursor' : 'VSCode'}`;

    res.status(200).json({
      success: true,
      filePath,
      editor,
      command,
      message
    });

  } catch (error) {
    console.error('❌ Error opening file/directory:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    res.status(500).json({
      success: false,
      filePath: req.body?.filePath || '',
      editor: req.body?.editor || 'cursor',
      command: '',
      message: '',
      error: errorMessage
    });
  }
};

export default handler; 