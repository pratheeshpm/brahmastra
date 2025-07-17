import React from 'react';

interface NotesFooterProps {
  note: any;
}

export const NotesFooter: React.FC<NotesFooterProps> = ({ note }) => {
  return (
    <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
      <div className="flex justify-between items-center">
        <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}; 