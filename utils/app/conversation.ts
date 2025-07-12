import { Conversation } from '@/types/chat';

// Helper function to get storage size in bytes
const getStorageSize = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};

// Helper function to clean up old conversations to free space
const cleanupOldConversations = () => {
  try {
    const conversationsStr = localStorage.getItem('conversationHistory');
    if (!conversationsStr) return;
    
    const conversations: Conversation[] = JSON.parse(conversationsStr);
    
    // Sort by conversation length (more messages = more recent activity)
    // and by message count as a proxy for recency
    const sortedConversations = conversations.sort((a, b) => {
      // Prefer conversations with more messages (likely more recent)
      const aMessageCount = a.messages.length;
      const bMessageCount = b.messages.length;
      
      if (aMessageCount !== bMessageCount) {
        return bMessageCount - aMessageCount; // More messages first
      }
      
      // If same message count, prefer conversations with longer content (more active)
      const aContentLength = a.messages.reduce((total, msg) => {
        if (typeof msg.content === 'string') {
          return total + msg.content.length;
        } else if (Array.isArray(msg.content)) {
          return total + msg.content.reduce((sum, item) => {
            return sum + (item.text?.length || 0);
          }, 0);
        }
        return total;
      }, 0);
      
      const bContentLength = b.messages.reduce((total, msg) => {
        if (typeof msg.content === 'string') {
          return total + msg.content.length;
        } else if (Array.isArray(msg.content)) {
          return total + msg.content.reduce((sum, item) => {
            return sum + (item.text?.length || 0);
          }, 0);
        }
        return total;
      }, 0);
      
      return bContentLength - aContentLength; // More content first
    });
    
    // Keep only the 10 most recent conversations
    const recentConversations = sortedConversations.slice(0, 10);
    
    console.log(`Cleaned up conversations: ${conversations.length} -> ${recentConversations.length}`);
    localStorage.setItem('conversationHistory', JSON.stringify(recentConversations));
  } catch (error) {
    console.error('Error during conversation cleanup:', error);
    // If cleanup fails, clear all conversations as last resort
    localStorage.removeItem('conversationHistory');
  }
};

// Helper function to compress conversation data by removing large content
const compressConversation = (conversation: Conversation): Conversation => {
  const compressed = { ...conversation };
  
  // Compress messages by truncating very large content
  compressed.messages = conversation.messages.map(message => {
    if (typeof message.content === 'string') {
      // Truncate text messages longer than 10KB
      if (message.content.length > 10000) {
        return {
          ...message,
          content: message.content.substring(0, 10000) + '\n\n[Content truncated due to size...]'
        };
      }
    } else if (Array.isArray(message.content)) {
      // For multimodal messages, remove image data but keep text
      const compressedContent = message.content.map(item => {
        if (item.type === 'image_url') {
          return {
            type: 'image_url' as const,
            image_url: { url: '[Image removed to save space]' }
          };
        }
        return item;
      });
      return {
        ...message,
        content: compressedContent
      };
    }
    return message;
  });
  
  return compressed;
};

// Safe localStorage setter with quota handling
const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, attempting cleanup...');
      
      // Strategy 1: Clean up old conversations
      cleanupOldConversations();
      
      try {
        localStorage.setItem(key, value);
        console.log('Successfully saved after cleanup');
        return true;
      } catch (secondError) {
        console.warn('Still quota exceeded after cleanup, trying compression...');
        
        // Strategy 2: If saving a conversation, try compression
        if (key === 'selectedConversation') {
          try {
            const conversation: Conversation = JSON.parse(value);
            const compressed = compressConversation(conversation);
            const compressedValue = JSON.stringify(compressed);
            
            localStorage.setItem(key, compressedValue);
            console.log('Successfully saved compressed conversation');
            return true;
          } catch (compressionError) {
            console.error('Compression failed:', compressionError);
          }
        }
        
        // Strategy 3: Clear other non-essential data
        const nonEssentialKeys = ['prompts', 'folders', 'pluginKeys'];
        for (const nonEssentialKey of nonEssentialKeys) {
          if (localStorage.getItem(nonEssentialKey)) {
            localStorage.removeItem(nonEssentialKey);
            console.log(`Removed ${nonEssentialKey} to free space`);
            
            try {
              localStorage.setItem(key, value);
              console.log('Successfully saved after removing non-essential data');
              return true;
            } catch (thirdError) {
              // Continue to next strategy
            }
          }
        }
        
        // Strategy 4: Last resort - save only essential data
        if (key === 'selectedConversation') {
          try {
            const conversation: Conversation = JSON.parse(value);
            const minimal = {
              id: conversation.id,
              name: conversation.name,
              messages: conversation.messages.slice(-5), // Keep only last 5 messages
              model: conversation.model,
              prompt: conversation.prompt,
              temperature: conversation.temperature,
              folderId: conversation.folderId
            };
            
            localStorage.setItem(key, JSON.stringify(minimal));
            console.log('Successfully saved minimal conversation data');
            return true;
          } catch (minimalError) {
            console.error('Even minimal save failed:', minimalError);
          }
        }
        
        console.error('All storage strategies failed, data not saved');
        return false;
      }
    } else {
      console.error('Non-quota localStorage error:', error);
      return false;
    }
  }
};

export const updateConversation = (
  updatedConversation: Conversation,
  allConversations: Conversation[],
) => {
  const updatedConversations = allConversations.map((c) => {
    if (c.id === updatedConversation.id) {
      return updatedConversation;
    }

    return c;
  });

  saveConversation(updatedConversation);
  saveConversations(updatedConversations);

  return {
    single: updatedConversation,
    all: updatedConversations,
  };
};

export const saveConversation = (conversation: Conversation) => {
  const success = safeSetItem('selectedConversation', JSON.stringify(conversation));
  if (!success) {
    console.error('Failed to save conversation to localStorage');
    // You could implement alternative storage here (e.g., IndexedDB, server storage)
  }
};

export const saveConversations = (conversations: Conversation[]) => {
  const success = safeSetItem('conversationHistory', JSON.stringify(conversations));
  if (!success) {
    console.error('Failed to save conversation history to localStorage');
    // Fallback: try to save just the most recent conversations
    const recentConversations = conversations.slice(-5);
    const fallbackSuccess = safeSetItem('conversationHistory', JSON.stringify(recentConversations));
    if (fallbackSuccess) {
      console.log('Saved only recent conversations as fallback');
    }
  }
};
