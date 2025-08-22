import React, { useState } from 'react';
import CodeExecutor from './CodeExecutor';
import EditableCodeExecutor from './EditableCodeExecutor';
import { LeetCodeSolutionRenderer } from './LeetCodeSolutionRenderer';

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
  agent_response?: string;
  input_type?: string;
}

interface LeetCodeSolverProps {
  solution: LeetCodeSolution;
  onClose?: () => void;
}

export const LeetCodeSolver: React.FC<LeetCodeSolverProps> = ({ solution, onClose }) => {
  const [activeTab, setActiveTab] = useState<'solution' | 'explanation' | 'analysis' | 'execution'>('solution');

  if (!solution.success) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-red-600">❌ Solution Failed</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{solution.error || 'Unknown error occurred'}</p>
          
          {solution.iterations && solution.iterations > 1 && (
            <div className="mt-4">
              <p className="text-sm text-red-600 font-medium">
                Failed after {solution.iterations} attempts
              </p>
              {solution.correction_history && (
                <div className="mt-2">
                  <p className="text-xs text-red-500">Correction attempts:</p>
                  <ul className="text-xs text-red-500 list-disc list-inside mt-1">
                    {solution.correction_history.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-green-600">✅ Solution Generated</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {solution.processing_time && (
              <span>⏱️ {solution.processing_time.toFixed(2)}s</span>
            )}
            {solution.iterations && solution.iterations > 1 && (
              <span>🔄 {solution.iterations} iterations</span>
            )}
            {solution.self_corrected && (
              <span className="text-orange-600">🛠️ Self-corrected</span>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'solution', label: '💻 Solution', available: solution.solution || solution.optimized_solution },
            { id: 'explanation', label: '📖 Explanation', available: solution.explanation },
            { id: 'analysis', label: '📊 Analysis', available: solution.complexity_analysis || solution.brute_force_approach },
            { id: 'execution', label: '🧪 Execution', available: solution.execution_result }
          ].filter(tab => tab.available).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'solution' && (
          <div className="space-y-6">
            {solution.optimized_solution && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Optimized Solution</h3>
                <EditableCodeExecutor 
                  initialCode={solution.optimized_solution} 
                  testCases={solution.test_cases_covered || []} 
                />
              </div>
            )}
            {solution.solution && solution.solution !== solution.optimized_solution && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  {solution.optimized_solution ? 'Alternative Solution' : 'Solution'}
                </h3>
                <EditableCodeExecutor 
                  initialCode={solution.solution} 
                  testCases={solution.test_cases_covered || []} 
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'explanation' && solution.explanation && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Solution Explanation</h3>
            <LeetCodeSolutionRenderer content={solution.explanation} />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {solution.complexity_analysis && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Complexity Analysis</h3>
                <LeetCodeSolutionRenderer content={solution.complexity_analysis} />
              </div>
            )}
            {solution.brute_force_approach && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Brute Force Approach</h3>
                <LeetCodeSolutionRenderer content={solution.brute_force_approach} />
              </div>
            )}
            {solution.test_cases_covered && Array.isArray(solution.test_cases_covered) && solution.test_cases_covered.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Test Cases Covered</h3>
                <ul className="list-disc list-inside space-y-1">
                  {solution.test_cases_covered.map((testCase, index) => (
                    <li key={index} className="text-gray-700">{testCase}</li>
                  ))}
                </ul>
              </div>
            )}
            {solution.test_cases_covered && !Array.isArray(solution.test_cases_covered) && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Test Cases Covered</h3>
                <div className="text-gray-700">{solution.test_cases_covered}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'execution' && solution.execution_result && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Execution Results</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className={`font-medium ${solution.execution_result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {solution.execution_result.success ? '✅ Success' : '❌ Failed'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Return Code:</span>
                  <div className="font-medium">{solution.execution_result.return_code}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Execution Time:</span>
                  <div className="font-medium">{solution.execution_result.execution_time}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Input Type:</span>
                  <div className="font-medium capitalize">{solution.input_type || 'text'}</div>
                </div>
              </div>
              
              {solution.execution_result.error && (
                <div>
                  <span className="text-sm text-gray-600">Error:</span>
                  <pre className="mt-1 bg-red-50 text-red-800 p-3 rounded text-sm overflow-x-auto border border-red-200">
                    {solution.execution_result.error}
                  </pre>
                </div>
              )}
              
              {solution.execution_result.output && (
                <div>
                  <span className="text-sm text-gray-600">Output:</span>
                  <pre className="mt-1 bg-black text-green-400 p-3 rounded text-sm overflow-x-auto">
                    {solution.execution_result.output}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with metadata */}
      <div className="border-t bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {solution.timestamp && (
              <span>🕒 {new Date(solution.timestamp).toLocaleString()}</span>
            )}
            {solution.input_type && (
              <span>📝 Input: {solution.input_type}</span>
            )}
          </div>
          
          {solution.correction_history && solution.correction_history.length > 0 && (
            <details className="cursor-pointer">
              <summary className="text-orange-600 hover:text-orange-800">
                🛠️ Self-correction history ({solution.correction_history.length} attempts)
              </summary>
              <div className="mt-2 space-y-1">
                {solution.correction_history.map((error, index) => (
                  <div key={index} className="text-xs text-gray-500 bg-white p-2 rounded">
                    <strong>Attempt {index + 1}:</strong> {error}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};
