import React, { useState } from 'react';

interface CodeExecutorProps {
  code: string;
  testCases: string[];
}

interface ExecutionResult {
  testCase: string;
  result: any;
  error?: string;
  status: 'success' | 'error';
}

const CodeExecutor: React.FC<CodeExecutorProps> = ({ code, testCases }) => {
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
          // Format: "nums = [2,7,11,15], target = 9"
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

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-medium text-gray-800">Interactive Code Execution</h4>
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

      {testCases.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          No test cases available for execution
        </div>
      )}

      {testCases.length > 0 && !showResults && (
        <div className="text-sm text-gray-600">
          <p className="mb-2">Available test cases:</p>
          <ul className="list-disc list-inside space-y-1">
            {testCases.map((testCase, index) => (
              <li key={index} className="font-mono text-sm bg-gray-50 p-1 rounded">
                {testCase}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showResults && executionResults.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Execution Results:</h5>
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
                    <div className="text-xs font-mono bg-white p-2 rounded border mb-2">
                      {result.testCase}
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

export default CodeExecutor;
