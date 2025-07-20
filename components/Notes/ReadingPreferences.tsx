import React from 'react';

interface ReadingPreferencesProps {
  fontSize: string;
  lineHeight: string;
  fontFamily: string;
  zoom: number;
  isOpen: boolean;
  onToggle: () => void;
  onFontSizeChange: (size: string) => void;
  onLineHeightChange: (height: string) => void;
  onFontFamilyChange: (family: string) => void;
  onZoomChange: (zoom: number) => void;
  onReset: () => void;
}

export const ReadingPreferences: React.FC<ReadingPreferencesProps> = ({
  fontSize,
  lineHeight,
  fontFamily,
  zoom,
  isOpen,
  onToggle,
  onFontSizeChange,
  onLineHeightChange,
  onFontFamilyChange,
  onZoomChange,
  onReset
}) => {
  const fontSizeOptions = [
    { value: 'text-xs', label: 'Extra Small (12px)' },
    { value: 'text-sm', label: 'Small (14px)' },
    { value: 'text-base', label: 'Normal (16px)' },
    { value: 'text-lg', label: 'Large (18px)' },
    { value: 'text-xl', label: 'Extra Large (20px)' },
    { value: 'text-2xl', label: '2X Large (24px)' }
  ];

  const lineHeightOptions = [
    { value: 'leading-tight', label: 'Tight (1.25)' },
    { value: 'leading-snug', label: 'Snug (1.375)' },
    { value: 'leading-normal', label: 'Normal (1.5)' },
    { value: 'leading-relaxed', label: 'Relaxed (1.625)' },
    { value: 'leading-loose', label: 'Loose (2.0)' }
  ];

  const fontFamilyOptions = [
    { value: 'font-sans', label: 'Sans Serif (System)' },
    { value: 'font-serif', label: 'Serif (Georgia)' },
    { value: 'font-mono', label: 'Monospace (Code)' },
    { value: 'font-inter', label: 'Inter' },
    { value: 'font-roboto', label: 'Roboto' }
  ];

  const zoomOptions = [
    { value: 0.8, label: '80%' },
    { value: 0.9, label: '90%' },
    { value: 1.0, label: '100%' },
    { value: 1.1, label: '110%' },
    { value: 1.2, label: '120%' },
    { value: 1.3, label: '130%' },
    { value: 1.4, label: '140%' },
    { value: 1.5, label: '150%' }
  ];

  return (
    <div className="border-b border-gray-200">
      {/* Toggle Button */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span className="text-lg">👁️</span>
          <span className="font-medium">Reading Preferences</span>
          <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Preferences Panel */}
      {isOpen && (
        <div className="px-6 py-4 bg-white border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Font Size */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Font Size
              </label>
              <select
                value={fontSize}
                onChange={(e) => onFontSizeChange(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fontSizeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Line Height */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Line Spacing
              </label>
              <select
                value={lineHeight}
                onChange={(e) => onLineHeightChange(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {lineHeightOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => onFontFamilyChange(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fontFamilyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Zoom */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Zoom Level
              </label>
              <select
                value={zoom}
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {zoomOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Adjust settings for better reading experience
            </div>
            <button
              onClick={onReset}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Reset to Default
            </button>
          </div>

          {/* Quick Presets */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-700 mb-2">Quick Presets:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onFontSizeChange('text-sm');
                  onLineHeightChange('leading-tight');
                  onZoomChange(0.9);
                }}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                📝 Compact
              </button>
              <button
                onClick={() => {
                  onFontSizeChange('text-base');
                  onLineHeightChange('leading-normal');
                  onZoomChange(1.0);
                }}
                className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
              >
                📖 Balanced
              </button>
              <button
                onClick={() => {
                  onFontSizeChange('text-lg');
                  onLineHeightChange('leading-relaxed');
                  onZoomChange(1.2);
                }}
                className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
              >
                👀 Comfortable
              </button>
              <button
                onClick={() => {
                  onFontSizeChange('text-xl');
                  onLineHeightChange('leading-loose');
                  onZoomChange(1.3);
                }}
                className="px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
              >
                🔍 Large Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 