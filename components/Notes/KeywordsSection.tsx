import React from 'react';

interface KeywordsSectionProps {
  keywords: string[];
  isLoadingKeywords: boolean;
  isKeywordsExpanded: boolean;
  setIsKeywordsExpanded: (value: boolean) => void;
  editingKeywordIndex: number | null;
  editingKeywordValue: string;
  onEditingKeywordChange: (value: string) => void;
  newKeyword: string;
  isAddingKeyword: boolean;
  handleKeywordClick: (keyword: string) => void;
  handleEditKeyword: (index: number) => void;
  handleSaveKeywordEdit: () => void;
  handleCancelKeywordEdit: () => void;
  handleDeleteKeyword: (index: number) => void;
  setNewKeyword: (value: string) => void;
  setIsAddingKeyword: (value: boolean) => void;
  handleAddKeyword: () => void;
}

export const KeywordsSection: React.FC<KeywordsSectionProps> = ({
  keywords,
  isLoadingKeywords,
  isKeywordsExpanded,
  setIsKeywordsExpanded,
  editingKeywordIndex,
  editingKeywordValue,
  onEditingKeywordChange,
  newKeyword,
  isAddingKeyword,
  handleKeywordClick,
  handleEditKeyword,
  handleSaveKeywordEdit,
  handleCancelKeywordEdit,
  handleDeleteKeyword,
  setNewKeyword,
  setIsAddingKeyword,
  handleAddKeyword
}) => {
  return (
    <div className="p-4 bg-gray-50 border-b">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-700">Keywords</h3>
          <span className="text-xs text-gray-500">(⌘ + 1-9, 0)</span>
        </div>
        {keywords.length > 12 && (
          <button
            onClick={() => setIsKeywordsExpanded(!isKeywordsExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {isKeywordsExpanded ? 'Show Less' : `Show More (${keywords.length - 12} hidden)`}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {isLoadingKeywords ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Generating keywords...</span>
          </div>
        ) : (
          <>
            {(isKeywordsExpanded ? keywords : keywords.slice(0, 12)).map((keyword, index) => {
              const displayIndex = index < 9 ? index + 1 : (index === 9 ? 0 : null);
              const showNumber = displayIndex !== null;
              return (
                <div key={index} className="relative group">
                  {editingKeywordIndex === index ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={editingKeywordValue}
                        onChange={(e) => onEditingKeywordChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveKeywordEdit();
                          if (e.key === 'Escape') handleCancelKeywordEdit();
                        }}
                        className="px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveKeywordEdit}
                        className="text-green-600 hover:text-green-800 text-xs"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancelKeywordEdit}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleKeywordClick(keyword)}
                      className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded hover:bg-indigo-200 transition-colors relative flex items-center space-x-1"
                    >
                      {showNumber && (
                        <span className="inline-flex items-center justify-center w-4 h-4 bg-indigo-600 text-white text-xs rounded-full font-bold mr-1">
                          {displayIndex}
                        </span>
                      )}
                      <span>{keyword}</span>
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditKeyword(index);
                          }}
                          className="w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-blue-600"
                        >
                          ✎
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteKeyword(index);
                          }}
                          className="w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
            {isAddingKeyword ? (
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddKeyword();
                    if (e.key === 'Escape') {
                      setIsAddingKeyword(false);
                      setNewKeyword('');
                    }
                  }}
                  placeholder="keyword1, keyword2, ..."
                  className="px-2 py-1 text-xs border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  autoFocus
                />
                <button
                  onClick={handleAddKeyword}
                  className="text-green-600 hover:text-green-800 text-xs"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setIsAddingKeyword(false);
                    setNewKeyword('');
                  }}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingKeyword(true)}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
              >
                + Add
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 