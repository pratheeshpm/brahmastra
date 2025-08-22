import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LeetCodeSolver } from '../components/LeetCode';
import useSocket from '../hooks/useSocket';

interface LeetCodeSolution {
  success: boolean;
  solution?: string;
  optimized_solution?: string;
  explanation?: string;
  complexity_analysis?: string;
  brute_force_approach?: string;
  test_cases_covered?: string[];
  execution_result?: {
    success: boolean;
    return_code: number;
    execution_time: string;
    output: string;
    error: string | null;
  };
  processing_time?: number;
  timestamp?: string;
  error?: string;
  iterations?: number;
  self_corrected?: boolean;
  correction_history?: string[];
}

const LeetCodePage: React.FC = () => {
  const router = useRouter();
  const [problemText, setProblemText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [solution, setSolution] = useState<LeetCodeSolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maxCorrections, setMaxCorrections] = useState(3);
  const [storeSolution, setStoreSolution] = useState(true);
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [autoSolveEnabled, setAutoSolveEnabled] = useState(true);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (PNG, JPEG, JPG, GIF, BMP, WebP)');
        return;
      }
      
      // Validate file size (20MB limit)
      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        setError('File size must be less than 20MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clean up preview URL
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = useCallback(async (event?: React.FormEvent, customProblemText?: string, customFile?: File) => {
    if (event) {
      event.preventDefault();
    }
    
    const textToUse = customProblemText || problemText;
    const fileToUse = customFile || selectedFile;
    
    console.log('🚀 handleSubmit called', { 
      problemText: textToUse.trim(), 
      problemTextLength: textToUse.trim().length,
      selectedFile: selectedFile?.name,
      customFile: customFile?.name,
      fileToUse: fileToUse?.name,
      useEnhanced,
      maxCorrections,
      storeSolution,
      isAutoSolve: !!customProblemText,
      isScreenshotAutoSolve: !!customFile
    });

    if (!textToUse.trim() && !fileToUse) {
      console.log('❌ Validation failed: no text or file');
      setError('Please provide either problem text or upload an image');
      return;
    }

    setLoading(true);
    setError(null);
    setSolution(null);

    console.log('Starting solve process...');
    try {
      let response: Response;
      
      if (fileToUse) {
        // Handle image upload
        const formData = new FormData();
        formData.append('file', fileToUse);
        if (textToUse.trim()) {
          formData.append('additional_context', textToUse);
        }
        formData.append('max_corrections', maxCorrections.toString());
        formData.append('store_solution', storeSolution.toString());

        const endpoint = useEnhanced ? '/solve/enhanced-image' : '/solve/image';
        response = await fetch(`http://localhost:8001${endpoint}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // Handle text-only submission
        const endpoint = useEnhanced ? '/solve/enhanced' : '/solve/text';
        const requestBody = {
          problem_text: textToUse,
          max_corrections: maxCorrections,
          store_solution: storeSolution,
          timeout: 30,
        };
        console.log('🌐 Making text request to:', `http://localhost:8001${endpoint}`);
        console.log('📦 Request body:', requestBody);
        
        response = await fetch(`http://localhost:8001${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: LeetCodeSolution = await response.json();
      setSolution(result);
      
      if (!result.success) {
        setError(result.error || 'Failed to solve the problem');
      }
    } catch (err) {
      console.error('❌ Error solving LeetCode problem:', err);
      console.error('❌ Error type:', typeof err);
      console.error('❌ Error details:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      console.log('🏁 Request completed, setting loading to false');
      setLoading(false);
    }
  }, [problemText, selectedFile, useEnhanced, maxCorrections, storeSolution]);

  // Handle clipboard content from socket
  const handleClipboardContent = useCallback((clipboardText: string) => {
    if (!clipboardText || clipboardText.trim() === '') {
      console.log('📋 Received empty clipboard content, ignoring');
      return;
    }

    console.log('📋 Received clipboard content:', clipboardText.substring(0, 100) + (clipboardText.length > 100 ? '...' : ''));
    
    // Set the problem text
    setProblemText(clipboardText);
    
    // Clear any existing solution and error
    setSolution(null);
    setError(null);
    
    // Auto-solve if enabled and not currently loading
    if (autoSolveEnabled && !loading) {
      console.log('🚀 Auto-solving problem from clipboard...');
      // Small delay to ensure state is updated
      setTimeout(() => {
        handleSubmit(undefined, clipboardText, undefined);
      }, 100);
    } else {
      console.log('📋 Clipboard content set, auto-solve disabled or currently loading');
    }
  }, [autoSolveEnabled, loading, handleSubmit]);

  // Set up socket listener for clipboard events
  useSocket('clipboardContent', handleClipboardContent);

  // Handle screenshot events from Ctrl+S shortcut
  const handleScreenshotTaken = useCallback((screenshotData: any) => {
    console.log('📸 Screenshot taken event received:', {
      type: screenshotData.type,
      timestamp: screenshotData.timestamp,
      hasImageData: !!screenshotData.imageData,
      screenshotPath: screenshotData.screenshotPath
    });

    if (!screenshotData.imageData) {
      console.log('📸 No image data in screenshot event, ignoring');
      return;
    }

    // Convert base64 data URL to File object for upload
    const base64Data = screenshotData.imageData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], `screenshot_${screenshotData.timestamp}.jpg`, {
      type: 'image/jpeg'
    });

    // Set the screenshot as selected file
    setSelectedFile(file);
    
    // Create preview URL for screenshot
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    
    // Clear any existing solution and error
    setSolution(null);
    setError(null);
    
    // Auto-solve if enabled and not currently loading
    if (autoSolveEnabled && !loading) {
      console.log('🚀 Auto-solving problem from screenshot...');
      // Pass the file directly to avoid state timing issues
      handleSubmit(undefined, undefined, file);
    } else {
      console.log('📸 Screenshot set, auto-solve disabled or currently loading');
    }
  }, [autoSolveEnabled, loading, handleSubmit]);

  // Set up socket listener for screenshot events
  useSocket('screenshot_taken', handleScreenshotTaken);

  // Handle keyboard shortcuts for image preview
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showImagePreview) {
        setShowImagePreview(false);
      }
    };

    if (showImagePreview) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showImagePreview]);

  const handleClear = () => {
    setProblemText('');
    setSelectedFile(null);
    setSolution(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clean up preview URL
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  const handleExampleProblem = () => {
    setProblemText(`Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">🧠 LeetCode Solver</h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
          </div>
          <p className="text-gray-600">
            AI-powered LeetCode problem solver using GPT-4o. Supports both text input and image upload.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Problem Text Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Problem Description
                </label>
                <button
                  type="button"
                  onClick={handleExampleProblem}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Load Two Sum Example
                </button>
              </div>
              <textarea
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Paste your LeetCode problem here, or upload an image below..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-vertical"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Upload Problem Image
              </label>
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Choose Image
                </button>
                {selectedFile && (
                  <div className="flex items-center space-x-3">
                    {/* Thumbnail */}
                    {imagePreviewUrl && (
                      <div className="relative">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition-colors"
                          onClick={() => setShowImagePreview(true)}
                          title="Click to preview"
                        />
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          🔍
                        </div>
                      </div>
                    )}
                    
                    {/* File Info */}
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${selectedFile.name.includes('screenshot_') ? 'text-purple-600' : 'text-gray-600'}`}>
                        {selectedFile.name.includes('screenshot_') ? '📸' : '📄'} {selectedFile.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)}KB • Click thumbnail to preview
                      </span>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PNG, JPEG, JPG, GIF, BMP, WebP (max 20MB)
                <br />
                💡 Tip: Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+S</kbd> anywhere to take a screenshot and auto-upload it here
              </p>
            </div>

            {/* Settings Toggle */}
            <div className="border-b border-gray-200 pb-4">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className={`transform transition-transform ${showSettings ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                <span>Advanced Settings</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {maxCorrections} corrections • {storeSolution ? 'Store' : 'No Store'} • {useEnhanced ? 'Enhanced' : 'Basic'} • {autoSolveEnabled ? 'Auto-Solve' : 'Manual'}
                </span>
              </button>
              
              {showSettings && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Corrections
                    </label>
                    <select
                      value={maxCorrections}
                      onChange={(e) => setMaxCorrections(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Number of retry attempts if solution fails</p>
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="storeSolution"
                        checked={storeSolution}
                        onChange={(e) => setStoreSolution(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="storeSolution" className="text-sm text-gray-700">
                        Store Solution
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Save solution to database for future reference</p>
                  </div>
                  
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="useEnhanced"
                        checked={useEnhanced}
                        onChange={(e) => setUseEnhanced(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="useEnhanced" className="text-sm text-gray-700">
                        Enhanced Analysis
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use advanced AI analysis with detailed explanations</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoSolveEnabled"
                        checked={autoSolveEnabled}
                        onChange={(e) => setAutoSolveEnabled(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="autoSolveEnabled" className="text-sm text-gray-700">
                        Auto-Solve (Clipboard & Screenshots)
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Automatically solve problems when clipboard content or screenshots are detected</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading || (!problemText.trim() && !selectedFile)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Solving...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Solve Problem</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">❌</span>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Solution Display */}
        {solution && (
          <LeetCodeSolver
            solution={solution}
            onClose={() => setSolution(null)}
          />
        )}
        
        {/* Image Preview Modal */}
        {showImagePreview && imagePreviewUrl && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowImagePreview(false);
              }
            }}
          >
            <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-medium ${selectedFile?.name.includes('screenshot_') ? 'text-purple-600' : 'text-gray-600'}`}>
                    {selectedFile?.name.includes('screenshot_') ? '📸' : '📄'} Image Preview
                  </span>
                  {selectedFile && (
                    <span className="text-sm text-gray-500">
                      {selectedFile.name} • {(selectedFile.size / 1024).toFixed(1)}KB
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowImagePreview(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
                  title="Close preview"
                >
                  ✕
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-4 max-h-[80vh] overflow-auto">
                <img
                  src={imagePreviewUrl}
                  alt="Full size preview"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                />
              </div>
              
              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  💡 This image will be sent to the AI for problem solving
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRemoveFile}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Remove Image
                  </button>
                  <button
                    onClick={() => setShowImagePreview(false)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeetCodePage;
