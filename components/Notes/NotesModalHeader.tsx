import React from 'react';

interface NotesModalHeaderProps {
  note: any;
  isFormatting: boolean;
  handleFormatNotes: () => void;
  isEnhancing: boolean;
  showEnhancementInput: boolean;
  setShowEnhancementInput: (value: boolean) => void;
  onEdit: (note: any) => void;
  onClose: () => void;
  showKeyboardHelp: boolean;
  setShowKeyboardHelp: (value: boolean) => void;
  handleAskAI: () => void;
  showReadingPreferences: boolean;
  setShowReadingPreferences: (value: boolean) => void;
}

export const NotesModalHeader: React.FC<NotesModalHeaderProps> = ({
  note,
  isFormatting,
  handleFormatNotes,
  isEnhancing,
  showEnhancementInput,
  setShowEnhancementInput,
  onEdit,
  onClose,
  showKeyboardHelp,
  setShowKeyboardHelp,
  handleAskAI,
  showReadingPreferences,
  setShowReadingPreferences,
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b">
      <h2 className="text-xl font-semibold text-gray-900 flex-1 mr-4">
        {note.topic}
      </h2>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleFormatNotes}
          disabled={isFormatting}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
        >
          {isFormatting ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span>Formatting...</span>
            </>
          ) : (
            <>
              <span>📝</span>
              <span>Format Notes</span>
            </>
          )}
        </button>
        <button
          onClick={() => setShowEnhancementInput(!showEnhancementInput)}
          disabled={isEnhancing}
          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-1"
        >
          {isEnhancing ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span>Enhancing...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Enhance with AI</span>
            </>
          )}
        </button>
        <button
          onClick={handleAskAI}
          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center space-x-1"
        >
          <span>🤖</span>
          <span>Ask AI</span>
        </button>
        <button
          onClick={() => setShowReadingPreferences(!showReadingPreferences)}
          className={`px-3 py-1.5 text-sm rounded flex items-center space-x-1 transition-colors ${
            showReadingPreferences 
              ? 'bg-orange-600 text-white hover:bg-orange-700' 
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
          title="Reading Preferences"
        >
          <span>👁️</span>
          <span>Reading</span>
        </button>
        <button
          onClick={() => onEdit(note)}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Edit
        </button>
        <button
          onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
          className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 flex items-center space-x-1"
          title="Keyboard Shortcuts"
        >
          <span>⌨️</span>
          <span>Shortcuts</span>
        </button>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}; 