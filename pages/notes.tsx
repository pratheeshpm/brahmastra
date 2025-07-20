import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NotesModal } from '../components/Notes';

interface Note {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  keywords?: string[];
  isSystemDesign?: boolean;
  designType?: 'backend' | 'frontend';
  folderName?: string;
}

const NotesPage: React.FC = () => {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState<{ topic: string; content: string }>({ topic: '', content: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchFilters, setSearchFilters] = useState({
    includeContent: true,
    includeKeywords: true,
    includeFilenames: true,
    caseSensitive: false,
    systemDesignOnly: false,
    regularNotesOnly: false
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  // Initialize search term and filters from URL query parameters
  useEffect(() => {
    if (router.isReady) {
      const querySearch = router.query.search as string;
      if (querySearch) {
        setSearchTerm(querySearch);
      }

      // Initialize search filters from URL
      const urlFilters = { ...searchFilters };
      if (router.query.content === 'false') urlFilters.includeContent = false;
      if (router.query.keywords === 'false') urlFilters.includeKeywords = false;
      if (router.query.filenames === 'false') urlFilters.includeFilenames = false;
      if (router.query.caseSensitive === 'true') urlFilters.caseSensitive = true;
      if (router.query.systemOnly === 'true') urlFilters.systemDesignOnly = true;
      if (router.query.regularOnly === 'true') urlFilters.regularNotesOnly = true;
      
      setSearchFilters(urlFilters);
    }
  }, [router.isReady]);

  // Function to update URL with search term and filters
  const updateSearchInURL = (search: string, filters?: typeof searchFilters) => {
    const currentQuery = { ...router.query };
    
    if (search.trim()) {
      currentQuery.search = search;
    } else {
      delete currentQuery.search;
    }

    // Update filter parameters only if filters are provided
    if (filters) {
      // Only add filter params if they differ from defaults
      if (!filters.includeContent) {
        currentQuery.content = 'false';
      } else {
        delete currentQuery.content;
      }
      
      if (!filters.includeKeywords) {
        currentQuery.keywords = 'false';
      } else {
        delete currentQuery.keywords;
      }
      
      if (!filters.includeFilenames) {
        currentQuery.filenames = 'false';
      } else {
        delete currentQuery.filenames;
      }
      
      if (filters.caseSensitive) {
        currentQuery.caseSensitive = 'true';
      } else {
        delete currentQuery.caseSensitive;
      }
      
      if (filters.systemDesignOnly) {
        currentQuery.systemOnly = 'true';
      } else {
        delete currentQuery.systemOnly;
      }
      
      if (filters.regularNotesOnly) {
        currentQuery.regularOnly = 'true';
      } else {
        delete currentQuery.regularOnly;
      }
    }

    router.push({
      pathname: router.pathname,
      query: currentQuery
    }, undefined, { shallow: true });
  };

  // Handle search term change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateSearchInURL(value);
  };

  // Handle search filter change
  const handleFilterChange = (newFilters: typeof searchFilters) => {
    setSearchFilters(newFilters);
    updateSearchInURL(searchTerm, newFilters);
  };

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
    // Find the note to check if it's a system design note
    const noteToDelete = notes.find(note => note.id === noteId);
    if (noteToDelete?.isSystemDesign) {
      alert('System design notes cannot be deleted.');
      return;
    }

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

  const filteredNotes = notes.filter(note => {
    if (!searchTerm.trim()) {
      // Apply type filters when no search term
      if (searchFilters.systemDesignOnly && !note.isSystemDesign) return false;
      if (searchFilters.regularNotesOnly && note.isSystemDesign) return false;
      return true;
    }

    const searchText = searchFilters.caseSensitive ? searchTerm : searchTerm.toLowerCase();
    const noteText = searchFilters.caseSensitive ? note.topic : note.topic.toLowerCase();
    const contentText = searchFilters.caseSensitive ? note.content : note.content.toLowerCase();
    
    let matches = false;

    // Search in title/topic (always included)
    if (noteText.includes(searchText)) {
      matches = true;
    }

    // Search in content
    if (!matches && searchFilters.includeContent && contentText.includes(searchText)) {
      matches = true;
    }

    // Search in keywords
    if (!matches && searchFilters.includeKeywords && note.keywords) {
      const keywordMatches = note.keywords.some(keyword => {
        const keywordText = searchFilters.caseSensitive ? keyword : keyword.toLowerCase();
        return keywordText.includes(searchText);
      });
      if (keywordMatches) matches = true;
    }

    // Search in filename/folder (for system design notes)
    if (!matches && searchFilters.includeFilenames && note.isSystemDesign && note.folderName) {
      const folderText = searchFilters.caseSensitive ? note.folderName : note.folderName.toLowerCase();
      if (folderText.includes(searchText)) {
        matches = true;
      }
    }

    // Apply type filters
    if (matches) {
      if (searchFilters.systemDesignOnly && !note.isSystemDesign) return false;
      if (searchFilters.regularNotesOnly && note.isSystemDesign) return false;
    }

    return matches;
  });

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
          {/* Search and Controls */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search notes, content, keywords, filenames..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🔲 Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📝 List
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                {filteredNotes.length} of {notes.length} notes
              </div>
            </div>

            {/* Advanced Search Filters */}
            {searchTerm && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Search Options</h3>
                  <button
                    onClick={() => handleFilterChange({
                      includeContent: true,
                      includeKeywords: true,
                      includeFilenames: true,
                      caseSensitive: false,
                      systemDesignOnly: false,
                      regularNotesOnly: false
                    })}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Reset Filters
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchFilters.includeContent}
                      onChange={(e) => handleFilterChange({...searchFilters, includeContent: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <span>Search Content</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchFilters.includeKeywords}
                      onChange={(e) => handleFilterChange({...searchFilters, includeKeywords: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <span>Search Keywords</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchFilters.includeFilenames}
                      onChange={(e) => handleFilterChange({...searchFilters, includeFilenames: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <span>Search Filenames</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchFilters.caseSensitive}
                      onChange={(e) => handleFilterChange({...searchFilters, caseSensitive: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <span>Case Sensitive</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchFilters.systemDesignOnly}
                      onChange={(e) => handleFilterChange({...searchFilters, systemDesignOnly: e.target.checked, regularNotesOnly: e.target.checked ? false : searchFilters.regularNotesOnly})}
                      className="rounded border-gray-300"
                    />
                    <span>System Design Only</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchFilters.regularNotesOnly}
                      onChange={(e) => handleFilterChange({...searchFilters, regularNotesOnly: e.target.checked, systemDesignOnly: e.target.checked ? false : searchFilters.systemDesignOnly})}
                      className="rounded border-gray-300"
                    />
                    <span>Regular Notes Only</span>
                  </label>
                </div>
              </div>
            )}
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
              <div>
                <h2 className="text-xl font-semibold">
                  {editingNote?.isSystemDesign ? 'Edit System Design Document' : 'Edit Note'}
                </h2>
                {editingNote?.isSystemDesign && (
                  <div className="flex items-center mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded mr-2 ${
                      editingNote.designType === 'backend' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {editingNote.designType === 'backend' ? '🔧 Backend' : '🎨 Frontend'}
                    </span>
                    <span className="text-sm text-gray-600">
                      Editing: {editingNote.folderName}/README.md
                    </span>
                  </div>
                )}
              </div>
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
                {!editingNote.isSystemDesign && (
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
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingNote.isSystemDesign ? 'README.md Content' : 'Content'}
                  </label>
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder={editingNote.isSystemDesign ? "Edit the README.md content using Markdown..." : "Enter note content..."}
                  />
                </div>
                {editingNote.isSystemDesign && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded">
                    💡 Tip: This will directly update the README.md file in the {editingNote.folderName} folder. 
                    Use Markdown formatting for best results.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Notes Display */}
        {!isCreating && !isEditing && (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 relative group ${
                      note.isSystemDesign ? 'border-l-4 border-blue-500' : ''
                    }`}
                  >
                    {/* System Design Badge */}
                    {note.isSystemDesign && (
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          note.designType === 'backend' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {note.designType === 'backend' ? '🔧 Backend' : '🎨 Frontend'}
                        </span>
                      </div>
                    )}

                    {/* Delete button - appears on hover, hidden for system design notes */}
                    {!note.isSystemDesign && (
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
                    )}

                    {/* System design indicator */}
                    {note.isSystemDesign && (
                      <div className="absolute top-2 right-2 opacity-60">
                        <span className="text-xs text-gray-500" title="System Design Document (Editable)">📝</span>
                      </div>
                    )}

                    <div
                      onClick={() => handleNoteClick(note)}
                      className="cursor-pointer"
                    >
                      <h3 className={`text-lg font-semibold text-gray-900 mb-2 line-clamp-2 ${
                        note.isSystemDesign ? 'pr-8 pt-6' : 'pr-8'
                      }`}>
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
                              className={`px-2 py-1 text-xs rounded ${
                                note.isSystemDesign 
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
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

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 relative group ${
                      note.isSystemDesign ? 'border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon/Type Indicator */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        {note.isSystemDesign ? (
                          <span className="text-xl">
                            {note.designType === 'backend' ? '🔧' : '🎨'}
                          </span>
                        ) : (
                          <span className="text-xl">📝</span>
                        )}
                      </div>

                      {/* Content */}
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleNoteClick(note)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                              {note.topic}
                            </h3>
                            
                            {/* System Design Info */}
                            {note.isSystemDesign && (
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  note.designType === 'backend' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {note.designType === 'backend' ? 'Backend' : 'Frontend'}
                                </span>
                                {note.folderName && (
                                  <span className="text-xs text-gray-500">
                                    📁 {note.folderName}
                                  </span>
                                )}
                              </div>
                            )}

                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {note.content.substring(0, 200)}...
                            </p>

                            {/* Keywords */}
                            {note.keywords && note.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {note.keywords.slice(0, 6).map((keyword, index) => (
                                  <span
                                    key={index}
                                    className={`px-2 py-1 text-xs rounded ${
                                      note.isSystemDesign 
                                        ? 'bg-gray-100 text-gray-600'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {keyword}
                                  </span>
                                ))}
                                {note.keywords.length > 6 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    +{note.keywords.length - 6} more
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="text-xs text-gray-500">
                              Updated: {new Date(note.updatedAt).toLocaleDateString()} • 
                              Created: {new Date(note.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!note.isSystemDesign && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                title="Delete note"
                              >
                                🗑️
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNote(note);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                              title="Edit note"
                            >
                              ✏️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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