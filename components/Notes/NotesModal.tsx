import React, { useState, useEffect, useRef } from 'react';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { MermaidDiagram } from '../Markdown/MermaidDiagram';

interface Note {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  keywords?: string[];
}

interface NotesModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  note,
  isOpen,
  onClose,
  onEdit
}) => {
  // State management
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string>('');
  const [keywordExplanation, setKeywordExplanation] = useState<string>('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [isKeywordsExpanded, setIsKeywordsExpanded] = useState(false);
  const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(null);
  const [editingKeywordValue, setEditingKeywordValue] = useState<string>('');
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [isAddingKeyword, setIsAddingKeyword] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementRequirements, setEnhancementRequirements] = useState<string>('');
  const [showEnhancementInput, setShowEnhancementInput] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionPosition, setSelectionPosition] = useState<{x: number, y: number} | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mermaidError, setMermaidError] = useState(false);
  const [explanationError, setExplanationError] = useState<string>('');
  const [showTableOfContents, setShowTableOfContents] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize keywords when note changes
  useEffect(() => {
    if (note) {
      setKeywords(note.keywords || note.tags || []);
      setMermaidError(false);
    }
  }, [note]);

  // Handle URL hash navigation
  useEffect(() => {
    if (note && isOpen) {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const toc = generateTableOfContents(note.content);
        if (toc.some(heading => heading.id === hash)) {
          setShowTableOfContents(true);
          
          // Scroll to the anchor after a short delay to ensure the modal is fully rendered
          setTimeout(() => {
            const element = document.getElementById(hash);
            if (element && contentRef.current) {
              const containerRect = contentRef.current.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              const scrollTop = contentRef.current.scrollTop;
              const offsetTop = elementRect.top - containerRect.top + scrollTop - 20;
              
              contentRef.current.scrollTo({ 
                top: Math.max(0, offsetTop), 
                behavior: 'smooth' 
              });
            }
          }, 300);
        }
      }
    }
  }, [note, isOpen]);

  // Auto-generate keywords if none exist
  useEffect(() => {
    if (note && keywords.length === 0 && !isLoadingKeywords) {
      generateKeywords();
    }
  }, [note, keywords.length]);

  // Scroll listener for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        setShowBackToTop(contentRef.current.scrollTop > 300);
      }
    };

    const contentEl = contentRef.current;
    if (contentEl) {
      contentEl.addEventListener('scroll', handleScroll);
      return () => contentEl.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showKeywordModal) {
          setShowKeywordModal(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen || showKeywordModal) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, showKeywordModal, onClose]);

  // Text selection handler
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const text = selection.toString().trim();
        if (text.length > 3 && text.length < 200) {
          setSelectedText(text);
          setSelectionPosition({
            x: e.clientX,
            y: e.clientY
          });
        }
      } else {
        setSelectedText('');
        setSelectionPosition(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isOpen]);

  // Generate keywords automatically
  const generateKeywords = async () => {
    if (!note) return;
    
    setIsLoadingKeywords(true);
    try {
      const response = await fetch('/api/youtube/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note.content })
      });

      if (response.ok) {
        const result = await response.json();
        const newKeywords = result.keywords || [];
        setKeywords(newKeywords);
        
        // Save keywords to note
        await saveKeywordsToNote(newKeywords);
      }
    } catch (error) {
      console.error('Error generating keywords:', error);
    } finally {
      setIsLoadingKeywords(false);
    }
  };

  // Save keywords to note
  const saveKeywordsToNote = async (newKeywords: string[]) => {
    if (!note) return;

    try {
      const updatedNote = {
        ...note,
        keywords: newKeywords,
        tags: newKeywords,
        updatedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/notes?id=${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNote)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save keywords:', errorData.error || response.statusText);
      } else {
        console.log('✅ Keywords saved successfully');
      }
    } catch (error) {
      console.error('Error saving keywords:', error);
    }
  };

  // Handle keyword click for explanation
  const handleKeywordClick = async (keyword: string) => {
    setSelectedKeyword(keyword);
    setShowKeywordModal(true);
    setIsLoadingExplanation(true);
    setKeywordExplanation('');
    setExplanationError('');

    try {
      const response = await fetch('/api/youtube/keyword-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword,
          context: note?.content || ''
        })
      });

      if (response.ok) {
        const result = await response.json();
        let explanation = result.explanation || 'No explanation available.';
        
        // Check for Mermaid diagram correction
        if (explanation.includes('```mermaid')) {
          try {
            const correctionResponse = await fetch('/api/ai/mermaid-correction', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: explanation })
            });

            if (correctionResponse.ok) {
              const correctionResult = await correctionResponse.json();
              explanation = correctionResult.correctedContent || explanation;
            }
          } catch (error) {
            console.error('Error correcting Mermaid diagram:', error);
          }
        }

        setKeywordExplanation(explanation);
        setExplanationError('');
      } else {
        setExplanationError(`Failed to fetch explanation: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching keyword explanation:', error);
      setExplanationError('Network error occurred while fetching explanation. Please check your connection and try again.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  // Retry keyword explanation
  const retryKeywordExplanation = () => {
    if (selectedKeyword) {
      handleKeywordClick(selectedKeyword);
    }
  };

  // Handle keyword editing
  const handleEditKeyword = (index: number) => {
    setEditingKeywordIndex(index);
    setEditingKeywordValue(keywords[index]);
  };

  const handleSaveKeywordEdit = async () => {
    if (editingKeywordIndex === null) return;

    const newKeywords = [...keywords];
    newKeywords[editingKeywordIndex] = editingKeywordValue.trim();
    setKeywords(newKeywords);
    await saveKeywordsToNote(newKeywords);
    setEditingKeywordIndex(null);
    setEditingKeywordValue('');
  };

  const handleCancelKeywordEdit = () => {
    setEditingKeywordIndex(null);
    setEditingKeywordValue('');
  };

  // Handle keyword deletion
  const handleDeleteKeyword = async (index: number) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    await saveKeywordsToNote(newKeywords);
  };

  // Handle adding new keyword
  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) return;

    const keywordsToAdd = newKeyword.split(',').map(k => k.trim()).filter(k => k);
    const newKeywords = [...keywords, ...keywordsToAdd];
    setKeywords(newKeywords);
    await saveKeywordsToNote(newKeywords);
    setNewKeyword('');
    setIsAddingKeyword(false);
  };

  // Format notes with AI
  const handleFormatNotes = async () => {
    if (!note) return;

    setIsFormatting(true);
    try {
      const prompt = `Please format the following content for better readability and navigation. Add a comprehensive table of contents with clickable links, improve structure with proper headings, add back-to-top links, and enhance the overall presentation using markdown formatting tricks:

Requirements:
1. Create a detailed table of contents at the beginning with clickable anchor links
2. Use proper heading hierarchy (H1, H2, H3, etc.) with descriptive IDs
3. Add horizontal rules and emphasis where appropriate
4. Include back-to-top links after major sections
5. Improve bullet points and numbering
6. Add blockquotes for important information
7. Ensure all sections are properly linked and navigable
8. Keep all original content - do not truncate or summarize
9. Make the content comprehensive and well-structured

Content to format:
${note.content}`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const result = await response.json();
        let formattedContent = result.data || result.response || '';
        
        // Strip markdown code block wrappers if present
        if (formattedContent.startsWith('```markdown')) {
          formattedContent = formattedContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
        } else if (formattedContent.startsWith('```')) {
          formattedContent = formattedContent.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
        }

        // Update note with formatted content
        const updatedNote = {
          ...note,
          content: formattedContent,
          updatedAt: new Date().toISOString()
        };

        const saveResponse = await fetch(`/api/notes?id=${note.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedNote)
        });

        if (saveResponse.ok) {
          // Update local note data
          Object.assign(note, updatedNote);
          // Force re-render
          setMermaidError(false);
          console.log('✅ Note formatted and saved successfully');
        } else {
          const errorData = await saveResponse.json();
          console.error('Failed to save formatted note:', errorData.error || saveResponse.statusText);
        }
      }
    } catch (error) {
      console.error('Error formatting notes:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  // Enhance notes with AI
  const handleEnhanceNotes = async () => {
    if (!note) return;

    setIsEnhancing(true);
    try {
      const prompt = `Please enhance the following content by adding missing explanations, relevant additional information, and improving the overall quality. ${enhancementRequirements ? `Specific requirements: ${enhancementRequirements}` : ''}

Requirements:
1. Add detailed explanations for technical concepts mentioned but not explained
2. Include relevant examples and use cases
3. Add system architecture diagrams using Mermaid when helpful (for system design, process flows, database relationships, sequence diagrams, state diagrams)
4. Expand on important topics with more context
5. Add cross-references and connections between concepts
6. Include best practices and common pitfalls
7. Maintain the original structure while enhancing content
8. Keep all original content - only add, don't remove or truncate
9. Use proper markdown formatting with headings, lists, and emphasis

Content to enhance:
${note.content}`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const result = await response.json();
        let enhancedContent = result.data || result.response || '';
        
        // Strip markdown code block wrappers if present
        if (enhancedContent.startsWith('```markdown')) {
          enhancedContent = enhancedContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
        } else if (enhancedContent.startsWith('```')) {
          enhancedContent = enhancedContent.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
        }

        // Update note with enhanced content
        const updatedNote = {
          ...note,
          content: enhancedContent,
          updatedAt: new Date().toISOString()
        };

        const saveResponse = await fetch(`/api/notes?id=${note.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedNote)
        });

        if (saveResponse.ok) {
          // Update local note data
          Object.assign(note, updatedNote);
          // Force re-render
          setMermaidError(false);
          console.log('✅ Note enhanced and saved successfully');
        } else {
          const errorData = await saveResponse.json();
          console.error('Failed to save enhanced note:', errorData.error || saveResponse.statusText);
        }
      }
    } catch (error) {
      console.error('Error enhancing notes:', error);
    } finally {
      setIsEnhancing(false);
      setEnhancementRequirements('');
      setShowEnhancementInput(false);
    }
  };

  // Handle text selection explanation
  const handleExplainSelection = async () => {
    if (!selectedText || !note) return;

    // Add selected text as keyword
    const newKeywords = [...keywords, selectedText];
    setKeywords(newKeywords);
    await saveKeywordsToNote(newKeywords);

    // Clear selection
    setSelectedText('');
    setSelectionPosition(null);
    window.getSelection()?.removeAllRanges();

    // Show explanation directly
    handleKeywordClick(selectedText);
  };

  // Navigation helpers
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
      e.preventDefault();
      const anchor = target.getAttribute('href')?.substring(1);
      if (anchor && contentRef.current) {
        // Try to find the element with various ID formats
        let element = document.getElementById(anchor);
        
        // If not found, try different variations of the anchor
        if (!element) {
          const variations = [
            anchor,
            anchor.toLowerCase(),
            anchor.replace(/\s+/g, '-'),
            anchor.toLowerCase().replace(/\s+/g, '-'),
            anchor.replace(/[^a-z0-9]+/gi, '-'),
            anchor.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            anchor.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, ''),
            anchor.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            // Handle numbered sections like "37-consideration-for-api-and-backend-integration"
            anchor.replace(/^\d+-/, ''),
            anchor.toLowerCase().replace(/^\d+-/, ''),
          ];
          
          for (const variation of variations) {
            element = document.getElementById(variation);
            if (element) break;
          }
        }
        
        // If still not found, try to find by text content
        if (!element) {
          const headings = Array.from(contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          const searchText = anchor.replace(/[-_]/g, ' ').toLowerCase();
          
          for (const heading of headings) {
            const headingText = heading.textContent?.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            if (headingText?.includes(searchText) || searchText.includes(headingText || '')) {
              element = heading as HTMLElement;
              break;
            }
          }
        }
        
        if (element) {
          // Calculate the position relative to the scrollable container
          const containerRect = contentRef.current.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          const scrollTop = contentRef.current.scrollTop;
          const offsetTop = elementRect.top - containerRect.top + scrollTop - 20; // 20px offset for better visibility
          
          contentRef.current.scrollTo({ 
            top: Math.max(0, offsetTop), 
            behavior: 'smooth' 
          });
          
          // Update URL hash for bookmarking
          window.history.replaceState(null, '', `#${anchor}`);
        } else {
          console.warn(`Could not find element for anchor: ${anchor}`);
        }
      }
    }
  };

  // Helper function to generate consistent IDs for headings
  const generateHeadingId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Extract table of contents from the note content
  const generateTableOfContents = (content: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: Array<{level: number, text: string, id: string}> = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = generateHeadingId(text);
      headings.push({ level, text, id });
    }

    return headings;
  };

  const tableOfContents = note ? generateTableOfContents(note.content) : [];

  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
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
              onClick={() => onEdit(note)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Edit
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Enhancement Input */}
        {showEnhancementInput && (
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
        )}

        {/* Keywords Section */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Keywords</h3>
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
                <span className="text-sm text-gray-600">Generating keywords...</span>
              </div>
            ) : (
              <>
                {(isKeywordsExpanded ? keywords : keywords.slice(0, 12)).map((keyword, index) => (
                  <div key={index} className="relative group">
                    {editingKeywordIndex === index ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={editingKeywordValue}
                          onChange={(e) => setEditingKeywordValue(e.target.value)}
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
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded hover:bg-indigo-200 transition-colors relative"
                      >
                        {keyword}
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
                ))}
                
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

        {/* Table of Contents */}
        {tableOfContents.length > 0 && (
          <div className="border-b bg-gray-50">
            <button
              onClick={() => setShowTableOfContents(!showTableOfContents)}
              className="w-full px-6 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            >
              <span className="flex items-center space-x-2">
                <span>📋</span>
                <span>Table of Contents ({tableOfContents.length} sections)</span>
              </span>
              <span className={`transform transition-transform ${showTableOfContents ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            
            {showTableOfContents && (
              <div className="px-6 pb-4 max-h-60 overflow-y-auto">
                <ul className="space-y-1">
                  {tableOfContents.map((heading, index) => (
                    <li key={index} style={{ marginLeft: `${(heading.level - 1) * 16}px` }}>
                      <a
                        href={`#${heading.id}`}
                                                 onClick={(e) => {
                           e.preventDefault();
                           const element = document.getElementById(heading.id);
                           if (element && contentRef.current) {
                             const containerRect = contentRef.current.getBoundingClientRect();
                             const elementRect = element.getBoundingClientRect();
                             const scrollTop = contentRef.current.scrollTop;
                             const offsetTop = elementRect.top - containerRect.top + scrollTop - 20;
                             
                             contentRef.current.scrollTo({ 
                               top: Math.max(0, offsetTop), 
                               behavior: 'smooth' 
                             });
                             
                             // Update URL hash for bookmarking
                             window.history.replaceState(null, '', `#${heading.id}`);
                           }
                         }}
                        className="text-blue-600 hover:text-blue-800 text-sm hover:underline block py-1"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-6 relative"
          onClick={handleLinkClick}
        >
          <div className="prose prose-sm max-w-none">
            <MemoizedReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';

                  if (language === 'mermaid') {
                    return (
                      <MermaidDiagram
                        code={String(children).replace(/\n$/, '')}
                      />
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({ children, ...props }) => {
                  const id = generateHeadingId(String(children));
                  return <h1 id={id} {...props}>{children}</h1>;
                },
                h2: ({ children, ...props }) => {
                  const id = generateHeadingId(String(children));
                  return <h2 id={id} {...props}>{children}</h2>;
                },
                h3: ({ children, ...props }) => {
                  const id = generateHeadingId(String(children));
                  return <h3 id={id} {...props}>{children}</h3>;
                },
                h4: ({ children, ...props }) => {
                  const id = generateHeadingId(String(children));
                  return <h4 id={id} {...props}>{children}</h4>;
                },
                h5: ({ children, ...props }) => {
                  const id = generateHeadingId(String(children));
                  return <h5 id={id} {...props}>{children}</h5>;
                },
                h6: ({ children, ...props }) => {
                  const id = generateHeadingId(String(children));
                  return <h6 id={id} {...props}>{children}</h6>;
                },
                blockquote: ({ children, ...props }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 py-2" {...props}>
                    {children}
                  </blockquote>
                ),
                hr: ({ ...props }) => (
                  <hr className="my-8 border-gray-300" {...props} />
                ),
                em: ({ children, ...props }) => (
                  <em className="font-medium text-blue-600" {...props}>{children}</em>
                ),
                strong: ({ children, ...props }) => (
                  <strong className="font-bold text-gray-900" {...props}>{children}</strong>
                )
              }}
            >
              {note.content}
            </MemoizedReactMarkdown>
          </div>

          {/* Text Selection Menu */}
          {selectedText && selectionPosition && (
            <div
              className="fixed bg-white border border-gray-300 rounded shadow-lg p-2 z-50"
              style={{
                left: selectionPosition.x,
                top: selectionPosition.y - 50
              }}
            >
              <button
                onClick={handleExplainSelection}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center space-x-1"
              >
                <span>🔍</span>
                <span>Explain with AI</span>
              </button>
            </div>
          )}

          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-40"
            >
              ↑
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
          <div className="flex justify-between items-center">
            <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Keyword Explanation Modal */}
      {showKeywordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Keyword: {selectedKeyword}
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={retryKeywordExplanation}
                  disabled={isLoadingExplanation}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                  title="Refresh explanation"
                >
                  🔄
                </button>
                <button
                  onClick={() => setShowKeywordModal(false)}
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
                <div className="prose prose-sm max-w-none">
                  <MemoizedReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';

                        if (language === 'mermaid') {
                          return (
                            <MermaidDiagram
                              code={String(children).replace(/\n$/, '')}
                            />
                          );
                        }

                        return (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
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
              ) : (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <p>No explanation available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 