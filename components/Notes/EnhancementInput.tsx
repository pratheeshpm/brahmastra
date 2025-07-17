import React from 'react';

interface EnhancementInputProps {
  enhancementRequirements: string;
  setEnhancementRequirements: (value: string) => void;
  showEnhancementInput: boolean;
  setShowEnhancementInput: (value: boolean) => void;
  isEnhancing: boolean;
  handleEnhanceNotes: () => void;
}

export const EnhancementInput: React.FC<EnhancementInputProps> = ({
  enhancementRequirements,
  setEnhancementRequirements,
  showEnhancementInput,
  setShowEnhancementInput,
  isEnhancing,
  handleEnhanceNotes
}) => {
  return (
    <div className="p-4 bg-purple-50 border-b">
      <div className="flex space-x-2">
        <input
          type="text"
          value={enhancementRequirements}
          onChange={(e) => setEnhancementRequirements(e.target.value)}
          placeholder="Optional: Specific requirements for enhancement..."
          className="flex-1 px-3 py-2 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleEnhanceNotes}
          disabled={isEnhancing}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          Enhance
        </button>
        <button
          onClick={() => setShowEnhancementInput(false)}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}; 