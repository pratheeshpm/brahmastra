import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { LeetCodeSolver } from '../components/LeetCode';

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
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('🚀 handleSubmit called', { 
      problemText: problemText.trim(), 
      problemTextLength: problemText.trim().length,
      selectedFile,
      useEnhanced,
      maxCorrections,
      storeSolution 
    });
    
    if (!problemText.trim() && !selectedFile) {
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
      
      if (selectedFile) {
        // Handle image upload
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (problemText.trim()) {
          formData.append('additional_context', problemText);
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
          problem_text: problemText,
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
  };

  const handleClear = () => {
    setProblemText('');
    setSelectedFile(null);
    setSolution(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
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
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}KB)
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PNG, JPEG, JPG, GIF, BMP, WebP (max 20MB)
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
                  {maxCorrections} corrections • {storeSolution ? 'Store' : 'No Store'} • {useEnhanced ? 'Enhanced' : 'Basic'}
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
      </div>
    </div>
  );
};

export default LeetCodePage;
