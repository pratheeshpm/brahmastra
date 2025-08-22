import React, { useState, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface EditableCodeExecutorProps {
  initialCode: string;
  testCases: string[];
}

interface ExecutionResult {
  testCase: string;
  result: any;
  error?: string;
  status: 'success' | 'error';
}

const EditableCodeExecutor: React.FC<EditableCodeExecutorProps> = ({ initialCode, testCases }) => {
  const [code, setCode] = useState(initialCode);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate adaptive height based on code length
  const getAdaptiveHeight = () => {
    const lineCount = code.split('\n').length;
    const minHeight = 200; // Minimum height in pixels
    const maxHeight = 600; // Maximum height in pixels
    const lineHeight = 24; // Approximate pixels per line
    const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, lineCount * lineHeight + 40));
    return calculatedHeight;
  };

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const extractFunctionName = (code: string): string => {
    const functionMatch = code.match(/function\s+(\w+)\s*\(/);
    return functionMatch ? functionMatch[1] : 'unknownFunction';
  };

  const executeTestCase = (testCase: string, code: string): any => {
    try {
      const functionName = extractFunctionName(code);
      
      // Function call format (preferred): functionName(args...)
      if (testCase.includes('(') && testCase.includes(')')) {
        // Direct function call - just execute it
        const safeEval = new Function('', `
          ${code}
          return ${testCase};
        `);
        return safeEval();
      } else {
        // Auto-convert legacy formats to function calls
        let convertedTestCase: string;
        
        if (testCase.includes('=')) {
          // Format: "s = \"abcabcbb\", expected = 3"
          const parts = testCase.split(',').map(part => part.trim());
          const params: string[] = [];
          
          for (const part of parts) {
            if (part.includes('expected')) break; // Skip expected results
            const valueMatch = part.match(/=\s*(.+)/);
            if (valueMatch) {
              params.push(valueMatch[1].trim());
            }
          }
          convertedTestCase = `${functionName}(${params.join(', ')})`;
        } else if (testCase.includes(',') && !testCase.startsWith('"') && !testCase.startsWith("'")) {
          // Format: "[2,7,11,15], 9" 
          convertedTestCase = `${functionName}(${testCase})`;
        } else {
          // Single parameter: "abcabcbb" -> lengthOfLongestSubstring('abcabcbb')
          const quotedParam = testCase.startsWith('"') || testCase.startsWith("'") 
            ? testCase 
            : `'${testCase}'`;
          convertedTestCase = `${functionName}(${quotedParam})`;
        }
        
        console.log(`Converting test case: "${testCase}" -> "${convertedTestCase}"`);
        
        // Execute the converted function call
        const safeEval = new Function('', `
          ${code}
          return ${convertedTestCase};
        `);
        return safeEval();
      }
    } catch (error) {
      throw error;
    }
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setExecutionResults([]);
    
    try {
      const results: ExecutionResult[] = [];

      // Execute each test case
      for (const testCase of testCases) {
        try {
          const result = executeTestCase(testCase, code);
          
          results.push({
            testCase: testCase,
            result: result,
            status: 'success'
          });
        } catch (error) {
          results.push({
            testCase: testCase,
            result: null,
            error: error instanceof Error ? error.message : String(error),
            status: 'error'
          });
        }
      }

      setExecutionResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Execution error:', error);
      setExecutionResults([{
        testCase: 'General execution',
        result: null,
        error: error instanceof Error ? error.message : String(error),
        status: 'error'
      }]);
      setShowResults(true);
    } finally {
      setIsExecuting(false);
    }
  };

  const formatResult = (result: any): string => {
    if (result === null) return 'null';
    if (result === undefined) return 'undefined';
    if (Array.isArray(result)) return `[${result.join(', ')}]`;
    if (typeof result === 'object') return JSON.stringify(result);
    return String(result);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = code.substring(0, start) + '    ' + code.substring(end);
        setCode(newValue);
        
        // Set cursor position after the inserted tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
    }
  };

  const resetCode = () => {
    setCode(initialCode);
    setShowResults(false);
    setExecutionResults([]);
  };

  return (
    <div className="mt-6 border rounded-lg bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-semibold text-gray-800">Interactive Code Editor</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isEditing
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isEditing ? '👁️ View Mode' : '✏️ Edit Mode'}
          </button>
          {isEditing && (
            <button
              onClick={resetCode}
              className="px-3 py-2 rounded-md text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
            >
              🔄 Reset
            </button>
          )}
        </div>
      </div>

      {/* Code Display/Editor */}
      <div className="mb-4">
        {isEditing ? (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-4 font-mono text-sm border rounded-md resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              placeholder="Enter your JavaScript code here..."
              style={{ 
                height: `${getAdaptiveHeight()}px`,
                fontSize: '15px',
                lineHeight: '1.6',
                tabSize: 4,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }}
            />
            <div className="absolute top-3 right-3">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded shadow-sm">
                JavaScript • {code.split('\n').length} lines
              </span>
            </div>
          </div>
        ) : (
          <div className="relative border rounded-md overflow-hidden shadow-sm">
            <SyntaxHighlighter
              language="javascript"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '16px',
                fontSize: '15px',
                lineHeight: '1.6',
                height: `${getAdaptiveHeight()}px`,
                overflow: 'auto'
              }}
              showLineNumbers={true}
              wrapLines={true}
              lineNumberStyle={{ 
                minWidth: '3em',
                paddingRight: '12px',
                color: '#6b7280'
              }}
            >
              {code}
            </SyntaxHighlighter>
            <div className="absolute top-3 right-3">
              <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded shadow-sm">
                JavaScript • {code.split('\n').length} lines
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Execution Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">
          {testCases.length > 0 ? (
            <span>Ready to test with {testCases.length} test case{testCases.length !== 1 ? 's' : ''}</span>
          ) : (
            <span>No test cases available</span>
          )}
        </div>
        <button
          onClick={executeCode}
          disabled={isExecuting || testCases.length === 0}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isExecuting || testCases.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isExecuting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running...
            </span>
          ) : (
            'Run Code'
          )}
        </button>
      </div>

      {/* Test Cases Preview */}
      {testCases.length > 0 && !showResults && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Test Cases:</h5>
          <div className="space-y-2">
            {testCases.map((testCase, index) => (
              <div key={index} className="bg-white border rounded-md overflow-hidden">
                <SyntaxHighlighter
                  language="javascript"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '8px 12px',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    background: '#f8fafc'
                  }}
                  PreTag="div"
                >
                  {testCase}
                </SyntaxHighlighter>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Results */}
      {showResults && executionResults.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Execution Results:</h5>
          <div className="space-y-3">
            {executionResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      Test Case {index + 1}:
                    </div>
                    <div className="mb-2 border rounded overflow-hidden">
                      <SyntaxHighlighter
                        language="javascript"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: '6px 10px',
                          fontSize: '11px',
                          lineHeight: '1.3',
                          background: '#ffffff'
                        }}
                        PreTag="div"
                      >
                        {result.testCase}
                      </SyntaxHighlighter>
                    </div>
                    {result.status === 'success' ? (
                      <div className="text-sm">
                        <span className="text-gray-600">Result: </span>
                        <span className="font-mono bg-white px-2 py-1 rounded border">
                          {formatResult(result.result)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">
                        <span className="font-medium">Error: </span>
                        <span className="font-mono">{result.error}</span>
                      </div>
                    )}
                  </div>
                  <div className={`ml-3 flex-shrink-0 ${
                    result.status === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.status === 'success' ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableCodeExecutor;
