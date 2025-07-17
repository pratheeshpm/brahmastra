import React, { useState, useEffect, useRef } from 'react';
import { MemoizedReactMarkdown } from '../Markdown/MemoizedReactMarkdown';
import { MermaidDiagram } from '../Markdown/MermaidDiagram';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import { NotesModalHeader } from './NotesModalHeader';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { EnhancementInput } from './EnhancementInput';
import { KeywordsSection } from './KeywordsSection';
import { TableOfContents } from './TableOfContents';
import { NotesContent } from './NotesContent';
import { NotesFooter } from './NotesFooter';
import { KeywordExplanationModal } from './KeywordExplanationModal';

interface Note {
  id: string;
  topic: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isEditingExplanation, setIsEditingExplanation] = useState(false);
  const [editingExplanationText, setEditingExplanationText] = useState('');
  const [enhancedContentPreview, setEnhancedContentPreview] = useState<string>('');
  const [showEnhancementPreview, setShowEnhancementPreview] = useState(false);
  const [isEditingEnhancedContent, setIsEditingEnhancedContent] = useState(false);
  const [formattedContentPreview, setFormattedContentPreview] = useState<string>('');
  const [showFormatPreview, setShowFormatPreview] = useState(false);
  const [isEditingFormattedContent, setIsEditingFormattedContent] = useState(false);
  const [showAskAI, setShowAskAI] = useState(false);
  const [askAIQuery, setAskAIQuery] = useState<string>('');
  const [askAIResponse, setAskAIResponse] = useState<string>('');
  const [isLoadingAskAI, setIsLoadingAskAI] = useState(false);
  const [showAskAIModal, setShowAskAIModal] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize keywords when note changes
  useEffect(() => {
    if (note) {
      setKeywords(note.keywords || []);
      setMermaidError(false);
    }
  }, [note]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal container to ensure it can receive keyboard events
      modalRef.current.focus();
    }
  }, [isOpen]);

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

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Escape key
      if (e.key === 'Escape') {
        if (showKeywordModal) {
          setShowKeywordModal(false);
        } else if (showEnhancementPreview) {
          handleCancelEnhancement();
        } else if (showFormatPreview) {
          handleCancelFormat();
        } else if (showAskAIModal) {
          handleCloseAskAI();
        } else if (isOpen) {
          onClose();
        }
        return;
      }

      // Only handle shortcuts when modal is open and not editing
      if (!isOpen || editingKeywordIndex !== null || isAddingKeyword) {
        return;
      }

      // Handle Cmd + number keys for keyword shortcuts (Mac-friendly)
      if (e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        const keyNumber = parseInt(e.key);
        if (!isNaN(keyNumber)) {
          e.preventDefault();
          
          // Map 1-9 to indices 0-8, and 0 to index 9
          const keywordIndex = keyNumber === 0 ? 9 : keyNumber - 1;
          
          if (keywordIndex < keywords.length) {
            handleKeywordClick(keywords[keywordIndex]);
          }
          return;
        }

        // Handle other Cmd shortcuts
        switch (e.key.toLowerCase()) {
          case 'e': // Cmd + E for Enhance
            e.preventDefault();
            setShowEnhancementInput(!showEnhancementInput);
            break;
          case 'k': // Cmd + K for Keywords
            e.preventDefault();
            setIsKeywordsExpanded(!isKeywordsExpanded);
            break;
          case 'h': // Cmd + H for Help
          case '?':
            e.preventDefault();
            setShowKeyboardHelp(!showKeyboardHelp);
            break;
        }
      }
      
      // New: Command + letter combinations for Mac users (may conflict with system/browser shortcuts)
      if (e.metaKey && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'd': // Cmd + D for Format
            e.preventDefault();
            handleFormatNotes();
            break;
          case 'j': // Cmd + J for Scroll to Top
            e.preventDefault();
            scrollToTop();
            break;
          case 'm': // Cmd + M for Table of Contents
            e.preventDefault();
            setShowTableOfContents(!showTableOfContents);
            break;
          case 'a': // Cmd + A for Ask AI
            e.preventDefault();
            handleAskAI();
            break;
        }
      }

      // Alternative: Ctrl + Shift combinations for broader compatibility (includes number keys)
      if (e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey) {
        const keyNumber = parseInt(e.key);
        if (!isNaN(keyNumber)) {
          e.preventDefault();
          
          // Map 1-9 to indices 0-8, and 0 to index 9
          const keywordIndex = keyNumber === 0 ? 9 : keyNumber - 1;
          
          if (keywordIndex < keywords.length) {
            handleKeywordClick(keywords[keywordIndex]);
          }
          return;
        }

        // Handle other Ctrl+Shift shortcuts
        switch (e.key.toLowerCase()) {
          case 'e': // Ctrl + Shift + E for Enhance
            e.preventDefault();
            setShowEnhancementInput(!showEnhancementInput);
            break;
          case 'k': // Ctrl + Shift + K for Keywords
            e.preventDefault();
            setIsKeywordsExpanded(!isKeywordsExpanded);
            break;
          case 'h': // Ctrl + Shift + H for Help
          case '?':
            e.preventDefault();
            setShowKeyboardHelp(!showKeyboardHelp);
            break;
        }
      }
      
      // New: Ctrl + Alt combinations for Windows/Linux users
      if (e.ctrlKey && e.altKey && !e.metaKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'f': // Ctrl + Alt + F for Format
            e.preventDefault();
            handleFormatNotes();
            break;
          case 't': // Ctrl + Alt + T for Scroll to Top
            e.preventDefault();
            scrollToTop();
            break;
          case 'c': // Ctrl + Alt + C for Table of Contents
            e.preventDefault();
            setShowTableOfContents(!showTableOfContents);
            break;
          case 'a': // Ctrl + Alt + A for Ask AI
            e.preventDefault();
            handleAskAI();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showKeywordModal, onClose, keywords, editingKeywordIndex, isAddingKeyword, showEnhancementInput, showTableOfContents, isKeywordsExpanded, showKeyboardHelp, showEnhancementPreview, showFormatPreview, showAskAIModal]);

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
        const result = await response.json();
        console.log('✅ Keywords saved successfully:', {
          savedKeywords: newKeywords,
          response: result
        });
        // Update the note in the parent component
        if (onEdit) {
          onEdit({
            ...note,
            keywords: newKeywords,
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error saving keywords:', error);
    }
  };

  // Handle keyword click for explanation
  const handleKeywordClick = async (keyword: string, forceRefresh = false) => {
    setSelectedKeyword(keyword);
    setShowKeywordModal(true);
    setIsLoadingExplanation(true);
    setKeywordExplanation('');
    setExplanationError('');
    setIsEditingExplanation(false);

    try {
      // First check if we have a cached explanation for this note + keyword
      if (!forceRefresh && note?.id) {
        try {
          const cacheResponse = await fetch(`/api/youtube/keyword-explanations-cache?videoId=${encodeURIComponent(note.id)}&keyword=${encodeURIComponent(keyword)}&title=${encodeURIComponent(note.topic)}`);
          
          if (cacheResponse.ok) {
            const cacheData = await cacheResponse.json();
            if (cacheData.success && cacheData.cached && cacheData.cached.length > 0) {
              console.log(`✅ Found cached explanation for keyword: ${keyword}`);
              setKeywordExplanation(cacheData.cached[0].explanation);
              setExplanationError('');
              setIsLoadingExplanation(false);
              return;
            }
          }
        } catch (cacheError) {
          console.warn('Cache check failed, proceeding with generation:', cacheError);
        }
      }

      // If no cache or force refresh, generate new explanation
      const response = await fetch('/api/youtube/keyword-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword,
          context: note?.content || '',
          videoId: note?.id,
          title: note?.topic,
          forceRefresh
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
      handleKeywordClick(selectedKeyword, true); // Force refresh
    }
  };

  // Handle editing keyword explanation
  const handleEditExplanation = () => {
    setIsEditingExplanation(true);
    setEditingExplanationText(keywordExplanation);
  };

  const handleSaveExplanation = async () => {
    if (!selectedKeyword || !note?.id || !editingExplanationText.trim()) return;

    try {
      // Save the edited explanation to cache
      const response = await fetch(`/api/youtube/keyword-explanations-cache?videoId=${encodeURIComponent(note.id)}&title=${encodeURIComponent(note.topic)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: selectedKeyword,
          explanation: editingExplanationText.trim(),
          model: 'user-edited',
        }),
      });

      if (response.ok) {
        setKeywordExplanation(editingExplanationText.trim());
        setIsEditingExplanation(false);
        console.log(`✅ Saved edited explanation for keyword: ${selectedKeyword}`);
      } else {
        console.error('Failed to save explanation');
      }
    } catch (error) {
      console.error('Error saving explanation:', error);
    }
  };

  const handleCancelEditExplanation = () => {
    setIsEditingExplanation(false);
    setEditingExplanationText('');
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

        // Show preview instead of directly applying
        setFormattedContentPreview(formattedContent);
        setShowFormatPreview(true);
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
      const prompt = `Based on the following content, generate ONLY additional new content that would enhance and complement the existing material. Do not rewrite or repeat any existing content.

${enhancementRequirements ? `Specific requirements: ${enhancementRequirements}` : ''}

Generate additional content that includes:
1. Missing explanations for technical concepts that are mentioned but not fully explained
2. Relevant examples and use cases that aren't already covered
3. System architecture diagrams using Mermaid (if helpful and not already present)
4. Best practices and common pitfalls related to the topics
5. Advanced concepts or related topics that would be valuable
6. Cross-references and connections between concepts
7. Practical implementation details or code examples (if applicable)

Important instructions:
- Generate ONLY NEW content that adds value
- Do NOT repeat or rewrite existing content
- Use proper markdown formatting
- Keep the additional content focused and relevant
- Start with a clear heading for the new section(s)

Existing content to complement:
${note.content}

Generate additional content:`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (response.ok) {
        const result = await response.json();
        let additionalContent = result.data || result.response || '';
        
        // Strip markdown code block wrappers if present
        if (additionalContent.startsWith('```markdown')) {
          additionalContent = additionalContent.replace(/^```markdown\n/, '').replace(/\n```$/, '');
        } else if (additionalContent.startsWith('```')) {
          additionalContent = additionalContent.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
        }

        // Show preview of additional content
        setEnhancedContentPreview(additionalContent);
        setShowEnhancementPreview(true);
        setIsEditingEnhancedContent(false);
        console.log('✅ Additional content generated, showing preview');
      }
    } catch (error) {
      console.error('Error generating additional content:', error);
      alert('Failed to generate additional content. Please try again.');
    } finally {
      setIsEnhancing(false);
      setEnhancementRequirements('');
      setShowEnhancementInput(false);
    }
  };

  // Handle enhancement preview actions
  const handleApproveEnhancement = async (position: 'top' | 'bottom' | 'replace') => {
    if (!note || !enhancedContentPreview) return;

    try {
      let updatedContent = '';
      
      switch (position) {
        case 'top':
          updatedContent = enhancedContentPreview + '\n\n---\n\n' + note.content;
          break;
        case 'bottom':
          updatedContent = note.content + '\n\n---\n\n' + enhancedContentPreview;
          break;
        case 'replace':
          updatedContent = enhancedContentPreview;
          break;
        default:
          updatedContent = note.content + '\n\n---\n\n' + enhancedContentPreview;
      }

      const updatedNote = {
        ...note,
        content: updatedContent,
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
        setShowEnhancementPreview(false);
        setEnhancedContentPreview('');
        console.log(`✅ Additional content added at ${position} and saved successfully`);
      } else {
        const errorData = await saveResponse.json();
        console.error('Failed to save enhanced note:', errorData.error || saveResponse.statusText);
        alert('Failed to save enhanced note. Please try again.');
      }
    } catch (error) {
      console.error('Error saving enhanced note:', error);
      alert('Failed to save enhanced note. Please try again.');
    }
  };

  // Specific handlers for each position
  const handleAddToTop = () => handleApproveEnhancement('top');
  const handleAddToBottom = () => handleApproveEnhancement('bottom');
  const handleReplaceContent = () => handleApproveEnhancement('replace');

  const handleEditEnhancement = () => {
    setIsEditingEnhancedContent(true);
  };

  const handleSaveEditedEnhancement = () => {
    // Exit edit mode to show position options
    setIsEditingEnhancedContent(false);
  };

  const handleCancelEnhancement = () => {
    setShowEnhancementPreview(false);
    setEnhancedContentPreview('');
    setIsEditingEnhancedContent(false);
  };

  const handleRegenerateEnhancement = () => {
    setShowEnhancementPreview(false);
    setEnhancedContentPreview('');
    setIsEditingEnhancedContent(false);
    setShowEnhancementInput(true);
  };

  // Format preview handlers
  const handleApproveFormat = async () => {
    if (!note || !formattedContentPreview) return;

    try {
      // Update note with formatted content
      const updatedNote = {
        ...note,
        content: formattedContentPreview,
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
        // Clear preview
        setShowFormatPreview(false);
        setFormattedContentPreview('');
        setIsEditingFormattedContent(false);
        console.log('✅ Note formatted and saved successfully');
      } else {
        const errorData = await saveResponse.json();
        console.error('Failed to save formatted note:', errorData.error || saveResponse.statusText);
      }
    } catch (error) {
      console.error('Error saving formatted note:', error);
    }
  };

  const handleEditFormat = () => {
    setIsEditingFormattedContent(true);
  };

  const handleSaveEditedFormat = () => {
    // Exit edit mode to show approve option
    setIsEditingFormattedContent(false);
  };

  const handleCancelFormat = () => {
    setShowFormatPreview(false);
    setFormattedContentPreview('');
    setIsEditingFormattedContent(false);
  };

  const handleRegenerateFormat = () => {
    setShowFormatPreview(false);
    setFormattedContentPreview('');
    setIsEditingFormattedContent(false);
    // Trigger format again
    handleFormatNotes();
  };

  // Ask AI handlers
  const handleAskAI = () => {
    setShowAskAIModal(true);
    setAskAIQuery('');
    setAskAIResponse('');
  };

  const handleCloseAskAI = () => {
    setShowAskAIModal(false);
    setAskAIQuery('');
    setAskAIResponse('');
    setIsLoadingAskAI(false);
  };

  const handleSubmitAskAI = async () => {
    if (!askAIQuery.trim()) return;

    setIsLoadingAskAI(true);
    try {
      const contextContent = note?.content ? `\n\nNote Context:\n${note.content.substring(0, 1000)}...` : '';
      const prompt = `${askAIQuery.trim()}${contextContent}`;

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          model_id: 'gpt-4o-mini',
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const result = await response.json();
        const aiResponse = result.data || result.response || '';
        setAskAIResponse(aiResponse);
      } else {
        setAskAIResponse('Failed to get AI response. Please try again.');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setAskAIResponse('Failed to get AI response. Please try again.');
    } finally {
      setIsLoadingAskAI(false);
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
      <div 
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-xl max-w-full w-full max-h-[90vh] flex flex-col outline-none"
      >
        <NotesModalHeader
          note={note}
          isFormatting={isFormatting}
          handleFormatNotes={handleFormatNotes}
          isEnhancing={isEnhancing}
          showEnhancementInput={showEnhancementInput}
          setShowEnhancementInput={setShowEnhancementInput}
          onEdit={onEdit}
          onClose={onClose}
          showKeyboardHelp={showKeyboardHelp}
          setShowKeyboardHelp={setShowKeyboardHelp}
          handleAskAI={handleAskAI}
        />

        {/* Keyboard Shortcuts Help */}
        {showKeyboardHelp && <KeyboardShortcutsHelp />}

        {/* Enhancement Input */}
        {showEnhancementInput && <EnhancementInput
          enhancementRequirements={enhancementRequirements}
          setEnhancementRequirements={setEnhancementRequirements}
          showEnhancementInput={showEnhancementInput}
          setShowEnhancementInput={setShowEnhancementInput}
          isEnhancing={isEnhancing}
          handleEnhanceNotes={handleEnhanceNotes}
        />}

        {/* Enhancement Preview */}
        {showEnhancementPreview && (
          <div className="border-t border-gray-200 bg-yellow-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔍</span>
                  <h3 className="text-lg font-semibold text-gray-900">Additional Content Preview</h3>
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">
                    Choose where to add this content
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleAddToTop}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                  >
                    <span>⬆️</span>
                    <span>Add to Top</span>
                  </button>
                  <button
                    onClick={handleAddToBottom}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1"
                  >
                    <span>⬇️</span>
                    <span>Add to Bottom</span>
                  </button>
                  <button
                    onClick={handleEditEnhancement}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center space-x-1"
                  >
                    <span>✏️</span>
                    <span>Edit First</span>
                  </button>
                  <button
                    onClick={handleRegenerateEnhancement}
                    className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center space-x-1"
                  >
                    <span>🔄</span>
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handleCancelEnhancement}
                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center space-x-1"
                  >
                    <span>✕</span>
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
              
              {isEditingEnhancedContent ? (
                <div className="space-y-4">
                  <textarea
                    value={enhancedContentPreview}
                    onChange={(e) => setEnhancedContentPreview(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Edit the enhanced content..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEditedEnhancement}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Done Editing
                    </button>
                    <button
                      onClick={() => setIsEditingEnhancedContent(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto border border-gray-300 rounded p-4 bg-white">
                  <div className="prose prose-sm max-w-none">
                    <MemoizedReactMarkdown>{enhancedContentPreview}</MemoizedReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Format Preview */}
        {showFormatPreview && (
          <div className="border-t border-gray-200 bg-blue-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📝</span>
                  <h3 className="text-lg font-semibold text-gray-900">Formatted Content Preview</h3>
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                    Review the formatted content
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleApproveFormat}
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-1"
                  >
                    <span>✅</span>
                    <span>Apply Format</span>
                  </button>
                  <button
                    onClick={handleEditFormat}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center space-x-1"
                  >
                    <span>✏️</span>
                    <span>Edit First</span>
                  </button>
                  <button
                    onClick={handleRegenerateFormat}
                    className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center space-x-1"
                  >
                    <span>🔄</span>
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handleCancelFormat}
                    className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center space-x-1"
                  >
                    <span>✕</span>
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
              
              {isEditingFormattedContent ? (
                <div className="space-y-4">
                  <textarea
                    value={formattedContentPreview}
                    onChange={(e) => setFormattedContentPreview(e.target.value)}
                    className="w-full h-96 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Edit the formatted content..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEditedFormat}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Done Editing
                    </button>
                    <button
                      onClick={() => setIsEditingFormattedContent(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto border border-gray-300 rounded p-4 bg-white">
                  <div className="prose prose-sm max-w-none">
                    <MemoizedReactMarkdown>{formattedContentPreview}</MemoizedReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Keywords Section */}
        <KeywordsSection
          keywords={keywords}
          isLoadingKeywords={isLoadingKeywords}
          isKeywordsExpanded={isKeywordsExpanded}
          setIsKeywordsExpanded={setIsKeywordsExpanded}
          editingKeywordIndex={editingKeywordIndex}
          editingKeywordValue={editingKeywordValue}
          onEditingKeywordChange={setEditingKeywordValue}
          newKeyword={newKeyword}
          isAddingKeyword={isAddingKeyword}
          handleKeywordClick={handleKeywordClick}
          handleEditKeyword={handleEditKeyword}
          handleSaveKeywordEdit={handleSaveKeywordEdit}
          handleCancelKeywordEdit={handleCancelKeywordEdit}
          handleDeleteKeyword={handleDeleteKeyword}
          setNewKeyword={setNewKeyword}
          setIsAddingKeyword={setIsAddingKeyword}
          handleAddKeyword={handleAddKeyword}
        />

        {/* Table of Contents */}
        {tableOfContents.length > 0 &&
          <TableOfContents
            tableOfContents={tableOfContents}
            showTableOfContents={showTableOfContents}
            toggleTableOfContents={() => setShowTableOfContents(!showTableOfContents)}
            contentRef={contentRef}
          />
        }

        {/* Content */}
        <NotesContent
          note={note}
          contentRef={contentRef}
          handleLinkClick={handleLinkClick}
          selectedText={selectedText}
          selectionPosition={selectionPosition}
          handleExplainSelection={handleExplainSelection}
          showBackToTop={showBackToTop}
          scrollToTop={scrollToTop}
          generateHeadingId={generateHeadingId}
        />

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 z-40"
          >
            ↑
          </button>
        )}
        <NotesFooter note={note} />
      </div>

      {/* Ask AI Modal */}
      {showAskAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span>🤖</span>
                <span>Ask AI About This Note</span>
              </h2>
              <button
                onClick={handleCloseAskAI}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to know about this note?
                  </label>
                  <textarea
                    value={askAIQuery}
                    onChange={(e) => setAskAIQuery(e.target.value)}
                    placeholder="Ask any question about this note's content, request explanations, ask for examples, or get related information..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        handleSubmitAskAI();
                      }
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Press Cmd/Ctrl + Enter to submit
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitAskAI}
                    disabled={!askAIQuery.trim() || isLoadingAskAI}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoadingAskAI ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Asking AI...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Ask AI</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCloseAskAI}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>

                {askAIResponse && (
                  <div className="mt-6 border-t pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <span>💡</span>
                        <span>AI Response</span>
                      </h3>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(askAIResponse);
                          // You could add a toast notification here
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center space-x-1"
                        title="Copy AI response"
                      >
                        <span>📋</span>
                        <span>Copy</span>
                      </button>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-blue-200 shadow-sm">
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
                            ),
                            em: ({ children, ...props }) => (
                              <em className="font-medium text-blue-600" {...props}>{children}</em>
                            ),
                            strong: ({ children, ...props }) => (
                              <strong className="font-bold text-gray-900" {...props}>{children}</strong>
                            ),
                            h1: ({ children, ...props }) => (
                              <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props}>{children}</h1>
                            ),
                            h2: ({ children, ...props }) => (
                              <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3" {...props}>{children}</h2>
                            ),
                            h3: ({ children, ...props }) => (
                              <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2" {...props}>{children}</h3>
                            ),
                            ul: ({ children, ...props }) => (
                              <ul className="list-disc pl-6 space-y-1" {...props}>{children}</ul>
                            ),
                            ol: ({ children, ...props }) => (
                              <ol className="list-decimal pl-6 space-y-1" {...props}>{children}</ol>
                            ),
                            li: ({ children, ...props }) => (
                              <li className="text-gray-800" {...props}>{children}</li>
                            ),
                            p: ({ children, ...props }) => (
                              <p className="text-gray-800 leading-relaxed mb-3" {...props}>{children}</p>
                            ),
                            a: ({ children, href, ...props }) => (
                              <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props}>
                                {children}
                              </a>
                            )
                          }}
                        >
                          {askAIResponse}
                        </MemoizedReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyword Explanation Modal */}
      <KeywordExplanationModal
        showKeywordModal={showKeywordModal}
        selectedKeyword={selectedKeyword}
        isLoadingExplanation={isLoadingExplanation}
        keywordExplanation={keywordExplanation}
        explanationError={explanationError}
        isEditingExplanation={isEditingExplanation}
        editingExplanationText={editingExplanationText}
        handleEditExplanation={handleEditExplanation}
        handleSaveExplanation={handleSaveExplanation}
        handleCancelEditExplanation={() => { setShowKeywordModal(false); setIsEditingExplanation(false); }}
        retryKeywordExplanation={retryKeywordExplanation}
      />
    </div>
  );
}; 