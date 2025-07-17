import React from 'react';

export const KeyboardShortcutsHelp: React.FC = () => {
  return (
    <div className="p-4 bg-gray-50 border-b">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">⌨️ Keyboard Shortcuts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Keywords (Mac)</h4>
          <div className="space-y-1 text-gray-600">
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">⌘ + 1-9</kbd> Open keyword 1-9
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">⌘ + 0</kbd> Open keyword 10
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">⌘ + K</kbd> Expand/collapse keywords
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Actions (Mac)</h4>
          <div className="space-y-1 text-gray-600">
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">⌘ + D</kbd> Format notes
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">⌘ + E</kbd> Enhance with AI
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">⌘ + J</kbd> Back to top
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">⌘ + M</kbd> Toggle table of contents
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">⌘ + A</kbd> Ask AI
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">⌘ + H</kbd> Toggle this help
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Escape</kbd> Close modal/dialog
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Alternative (All OS)</h4>
          <div className="space-y-1 text-gray-600">
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl + Shift + 1-9</kbd> Keywords
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl + Shift + 0</kbd> Keyword 10
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl + Alt + F</kbd> Format
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl + Shift + E</kbd> Enhance
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl + Alt + T</kbd> Top
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl + Alt + C</kbd> TOC
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl + Alt + A</kbd> Ask AI
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl + Shift + K</kbd> Expand/collapse keywords
            </div>
            <div>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded">Ctrl + Shift + H</kbd> Toggle help
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 