import React, { useState, useEffect } from 'react';
import { NotesModal } from '../components/Notes';

interface Note {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  keywords?: string[];
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState<{ topic: string; content: string }>({ topic: '', content: '' });

  useEffect(() => {
    fetchNotes();
  }, []);

  // Check for anchor link in URL on page load
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && notes.length > 0) {
      // Find note that might contain this anchor
      const noteWithAnchor = notes.find(note => 
        note.content.toLowerCase().includes(hash.replace(/-/g, ' ').toLowerCase()) ||
        note.topic.toLowerCase().includes(hash.replace(/-/g, ' ').toLowerCase())
      );
      
      if (noteWithAnchor) {
        setSelectedNote(noteWithAnchor);
        setIsModalOpen(true);
        
        // Scroll to anchor after modal opens
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      }
    }
  }, [notes]);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const result = await response.json();
        setNotes(result.data || []);
      } else {
        console.error('Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
    // Clear URL hash when closing modal
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditing(true);
    setIsModalOpen(false);
  };

  const handleSaveNote = async (updatedNote: Note) => {
    try {
      const response = await fetch(`/api/notes?id=${updatedNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote)
      });

      if (response.ok) {
        await fetchNotes();
        setIsEditing(false);
        setEditingNote(null);
        
        // Return to modal view of the updated note
        setSelectedNote(updatedNote);
        setIsModalOpen(true);
        
        // Show success message (you could add a toast notification here)
        console.log('✅ Note saved successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to save note:', errorData.error || response.statusText);
        alert(`Failed to save note: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Network error occurred while saving note. Please check your connection and try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingNote(null);
  };

  const handleCreateNote = () => {
    setIsCreating(true);
    setNewNote({ topic: '', content: '' });
  };

  const handleSaveNewNote = async () => {
    if (!newNote.topic.trim() || !newNote.content.trim()) {
      alert('Please fill in both topic and content');
      return;
    }

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newNote.topic.trim(),
          content: newNote.content.trim(),
          keywords: []
        })
      });

      if (response.ok) {
        const result = await response.json();
        await fetchNotes();
        setIsCreating(false);
        setNewNote({ topic: '', content: '' });
        
        // Open the newly created note in modal
        setSelectedNote(result.data);
        setIsModalOpen(true);
        
        console.log('✅ Note created successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to create note:', errorData.error || response.statusText);
        alert(`Failed to create note: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Network error occurred while creating note. Please check your connection and try again.');
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewNote({ topic: '', content: '' });
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes?id=${noteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchNotes();
        console.log('✅ Note deleted successfully');
        
        // Close modal if the deleted note was currently open
        if (selectedNote && selectedNote.id === noteId) {
          setIsModalOpen(false);
          setSelectedNote(null);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to delete note:', errorData.error || response.statusText);
        alert(`Failed to delete note: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Network error occurred while deleting note. Please check your connection and try again.');
    }
  };

  const filteredNotes = notes.filter(note =>
    note.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.keywords && note.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            <button
              onClick={handleCreateNote}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <span>+</span>
              <span>New Note</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredNotes.length} of {notes.length} notes
            </div>
          </div>
        </div>

        {/* Create New Note Form */}
        {isCreating && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Note</h2>
              <div className="space-x-2">
                <button
                  onClick={handleSaveNewNote}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelCreate}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={newNote.topic}
                  onChange={(e) => setNewNote({...newNote, topic: e.target.value})}
                  placeholder="Enter note topic..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  placeholder="Enter note content... (Markdown supported)"
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Note Form */}
        {isEditing && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Note</h2>
              <div className="space-x-2">
                <button
                  onClick={() => editingNote && handleSaveNote(editingNote)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            {editingNote && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={editingNote.topic}
                    onChange={(e) => setEditingNote({...editingNote, topic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes Grid */}
        {!isCreating && !isEditing && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 relative group"
              >
                {/* Delete button - appears on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  title="Delete note"
                >
                  ×
                </button>

                <div
                  onClick={() => handleNoteClick(note)}
                  className="cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 pr-8">
                    {note.topic}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {note.content.substring(0, 150)}...
                  </p>
                  
                  {/* Keywords */}
                  {note.keywords && note.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.keywords.slice(0, 3).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                      {note.keywords.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{note.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredNotes.length === 0 && !loading && !isCreating && !isEditing && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No notes found</p>
            {searchTerm ? (
              <p className="text-gray-400 mt-2">
                Try adjusting your search terms
              </p>
            ) : (
              <button
                onClick={handleCreateNote}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create your first note
              </button>
            )}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      <NotesModal
        note={selectedNote}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditNote}
      />
    </div>
  );
};

export default NotesPage; 