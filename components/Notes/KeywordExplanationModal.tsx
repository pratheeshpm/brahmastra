import React from 'react';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { MermaidDiagram } from '../Markdown/MermaidDiagram';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';

interface KeywordExplanationModalProps {
  showKeywordModal: boolean;
  selectedKeyword: string;
  isLoadingExplanation: boolean;
  keywordExplanation: string;
  explanationError: string;
  isEditingExplanation: boolean;
  editingExplanationText: string;
  handleEditExplanation: () => void;
  handleSaveExplanation: () => void;
  handleCancelEditExplanation: () => void;
  retryKeywordExplanation: () => void;
  onMermaidFullscreen?: (code: string) => void;
  onMermaidPngPreview?: (code: string) => void;
}

export const KeywordExplanationModal: React.FC<KeywordExplanationModalProps> = ({
  showKeywordModal,
  selectedKeyword,
  isLoadingExplanation,
  keywordExplanation,
  explanationError,
  isEditingExplanation,
  editingExplanationText,
  handleEditExplanation,
  handleSaveExplanation,
  handleCancelEditExplanation,
  retryKeywordExplanation,
  onMermaidFullscreen,
  onMermaidPngPreview
}) => {
  if (!showKeywordModal) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Keyword: {selectedKeyword}
          </h3>
          <div className="flex items-center space-x-2">
            {!isLoadingExplanation && keywordExplanation && !isEditingExplanation && (
              <button
                onClick={handleEditExplanation}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center space-x-1"
                title="Edit explanation"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
            )}
            <button
              onClick={retryKeywordExplanation}
              disabled={isLoadingExplanation}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed p-1"
              title="Refresh explanation"
            >
              🔄
            </button>
            <button
              onClick={handleCancelEditExplanation}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoadingExplanation ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading explanation...</span>
            </div>
          ) : explanationError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="text-red-800 font-medium mb-2">Error Loading Explanation</h4>
                <p className="text-red-600 text-sm">{explanationError}</p>
              </div>
              <button
                onClick={retryKeywordExplanation}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Retry</span>
              </button>
            </div>
          ) : keywordExplanation ? (
            isEditingExplanation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Edit Explanation</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveExplanation}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center space-x-1"
                    >
                      <span>✓</span>
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEditExplanation}
                      className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 flex items-center space-x-1"
                    >
                      <span>✕</span>
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
                <textarea
                  value={editingExplanationText}
                  onChange={(e) => {}} // This onChange is empty in the provided code, consider if it should update state
                  className="w-full h-96 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter your explanation in Markdown format..."
                />
                <div className="text-xs text-gray-500">
                  Tip: You can use Markdown formatting including code blocks, lists, and even Mermaid diagrams with ```mermaid
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <MemoizedReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeMathjax]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      if (language === 'mermaid') {
                        return (
                          <MermaidDiagram
                            code={String(children).replace(/\n$/, '')}
                            onFullscreenClick={onMermaidFullscreen}
                            onPngPreviewClick={onMermaidPngPreview}
                          />
                        );
                      }
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    table: ({ children, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border-collapse border border-gray-300" {...props}>
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children, ...props }) => (
                      <thead className="bg-gray-100" {...props}>
                        {children}
                      </thead>
                    ),
                    tbody: ({ children, ...props }) => (
                      <tbody {...props}>
                        {children}
                      </tbody>
                    ),
                    tr: ({ children, ...props }) => (
                      <tr className="border-b border-gray-200 hover:bg-gray-50" {...props}>
                        {children}
                      </tr>
                    ),
                    th: ({ children, ...props }) => (
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold bg-gray-100" {...props}>
                        {children}
                      </th>
                    ),
                    td: ({ children, ...props }) => (
                      <td className="border border-gray-300 px-4 py-2" {...props}>
                        {children}
                      </td>
                    ),
                    blockquote: ({ children, ...props }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-2" {...props}>
                        {children}
                      </blockquote>
                    ),
                    hr: ({ ...props }) => (
                      <hr className="my-8 border-gray-300" {...props} />
                    )
                  }}
                >
                  {keywordExplanation}
                </MemoizedReactMarkdown>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <p>No explanation available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 