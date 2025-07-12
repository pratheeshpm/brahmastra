import {
  IconArrowDown,
  IconBolt,
  IconBrandGoogle,
  IconPlayerStop,
  IconRepeat,
  IconSend,
  IconPhoto,
  IconX,
} from '@tabler/icons-react';
import {
  KeyboardEvent,
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import { Message } from '@/types/chat';
import { Plugin } from '@/types/plugin';
import { Prompt } from '@/types/prompt';

import HomeContext from '@/pages/api/home/home.context';

import { PluginSelect } from './PluginSelect';
import { PromptList } from './PromptList';
import { VariableModal } from './VariableModal';

interface Props {
  prompt: string;
  onSend: (message: Message, plugin: Plugin | null) => void;
  onRegenerate: () => void;
  onScrollDownClick: () => void;
  stopConversationRef: MutableRefObject<boolean>;
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  showScrollDownButton: boolean;
}

export const ChatInput = ({
  onSend,
  onRegenerate,
  onScrollDownClick,
  stopConversationRef,
  textareaRef,
  showScrollDownButton,
  prompt
}: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: { selectedConversation, messageIsStreaming, prompts },

    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [content, setContent] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showPromptList, setShowPromptList] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [promptInputValue, setPromptInputValue] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showPluginSelect, setShowPluginSelect] = useState(false);
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  
  // New state for image upload
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const promptListRef = useRef<HTMLUListElement | null>(null);

  const filteredPrompts = prompts.filter((prompt) =>
    prompt.name.toLowerCase().includes(promptInputValue.toLowerCase()),
  );

  // Check if current model supports images
  const modelSupportsImages = selectedConversation?.model?.supportsImages || false;
  
  // Debug: Log model information
  console.log('Current model:', selectedConversation?.model);
  console.log('Model supports images:', modelSupportsImages);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const maxLength = selectedConversation?.model.maxLength;

    if (maxLength && value.length > maxLength) {
      alert(
        t(
          `Message limit is {{maxLength}} characters. You have entered {{valueLength}} characters.`,
          { maxLength, valueLength: value.length },
        ),
      );
      return;
    }

    setContent(value);
    updatePromptListVisibility(value);
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(t('Please select only image files'));
        return false;
      }
      // Check file size (max 20MB for raw upload, we'll compress it)
      if (file.size > 20 * 1024 * 1024) {
        alert(t('Image size must be less than 20MB'));
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Limit to 5 images total
    const totalImages = selectedImages.length + validFiles.length;
    if (totalImages > 5) {
      alert(t('Maximum 5 images allowed'));
      return;
    }

    setSelectedImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreviewUrls(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Convert images to base64 for API
  const convertImagesToBase64 = async (files: File[]): Promise<string[]> => {
    const promises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(promises);
  };

  // Compress and convert images to base64 for API
  const compressAndConvertImages = async (files: File[]): Promise<string[]> => {
    const promises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        img.onload = () => {
          try {
            // Calculate new dimensions (max 1024px on longest side)
            const maxSize = 1024;
            let { width, height } = img;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            // Set canvas size
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression (0.8 quality for JPEG)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            
            // Validate the result
            if (!compressedBase64 || compressedBase64 === 'data:,') {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // Check if compressed size is still too large (> 5MB base64)
            const compressedSizeMB = (compressedBase64.length * 0.75) / 1024 / 1024;
            if (compressedSizeMB > 5) {
              console.warn(`Compressed image still large: ${compressedSizeMB.toFixed(2)}MB`);
              // Try with lower quality
              const furtherCompressed = canvas.toDataURL('image/jpeg', 0.6);
              const finalSizeMB = (furtherCompressed.length * 0.75) / 1024 / 1024;
              
              console.log(`Image compressed: ${file.name}`, {
                originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                compressedSize: `${finalSizeMB.toFixed(2)}MB`,
                dimensions: `${width}x${height}`,
                compressionRatio: `${((1 - (furtherCompressed.length * 0.75) / file.size) * 100).toFixed(1)}%`,
                quality: 'reduced'
              });
              
              // Clean up object URL
              URL.revokeObjectURL(img.src);
              resolve(furtherCompressed);
            } else {
              console.log(`Image compressed: ${file.name}`, {
                originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
                compressedSize: `${compressedSizeMB.toFixed(2)}MB`,
                dimensions: `${width}x${height}`,
                compressionRatio: `${((1 - (compressedBase64.length * 0.75) / file.size) * 100).toFixed(1)}%`,
                quality: 'standard'
              });
              
              // Clean up object URL
              URL.revokeObjectURL(img.src);
              resolve(compressedBase64);
            }
          } catch (error) {
            URL.revokeObjectURL(img.src);
            reject(error);
          }
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          reject(new Error(`Failed to load image: ${file.name}`));
        };
        
        // Create object URL for the image
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;
      });
    });
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Image compression failed:', error);
      throw new Error('Failed to compress images. Please try with smaller images.');
    }
  };

  const handleSend = async () => {
    console.log('🚀 handleSend called with:', { 
      content, 
      selectedImagesLength: selectedImages.length,
      messageIsStreaming 
    });
    
    if (messageIsStreaming) {
      console.log('🚀 Aborting - message is streaming');
      return;
    }

    if (!content && selectedImages.length === 0) {
      console.log('🚀 Showing alert - no content and no images');
      alert(t('Please enter a message or select an image'));
      return;
    }

    console.log('🚀 Proceeding with send...');

    try {
      let messageContent: Message['content'];

      if (selectedImages.length > 0) {
        // Show loading state while compressing
        setIsProcessingImages(true);
        const loadingToast = toast.loading('Compressing images...');
        
        try {
          // Compress and convert images
          const compressedBase64Images = await compressAndConvertImages(selectedImages);
          
          // Dismiss loading toast
          toast.dismiss(loadingToast);
          setIsProcessingImages(false);
          
          // Create the default image analysis prompt
          const imageAnalysisPrompt = `📸 Image Analysis Request
Please analyze this image and respond based on the following priority:

1. **If it's a coding question/problem:**
   - Provide the most optimized solution code with proper comments and explanation in JAVASCRIPT
   - Include all edge cases and corner cases handled
   - Optimal Technique with brief explanation and sample data example flowing through the code
   - Time Complexity: O(?) with detailed reasoning (step-by-step breakdown)
   - Space Complexity: O(?) with memory usage explanation
   - Key Insight: The critical observation enabling optimization and edge cases handled

2. **If it's not a coding question but has a clear flow/process:**
   - Continue and follow the flow shown in the image
   - Provide next steps or complete the process
   - Explain the workflow or methodology depicted

3. **If neither applies:**
   - Provide a detailed description of the image
   - Explain what you see and any relevant context
   - Identify key elements, text, diagrams, or concepts shown

Please proceed with the analysis:`;

          // Create message with images
          const contentArray: Array<{
            type: 'text' | 'image_url';
            text?: string;
            image_url?: { url: string };
          }> = [];

          // Check if we have a custom prompt from screenshot functionality (e.g., from Ctrl+O)
          // If content starts with specific markers, use it as the analysis prompt
          let finalTextContent = '';
          if (content && (content.includes('🔍 Code Analysis:') || content.includes('📸 Screenshot Analysis'))) {
            // Use the custom prompt from the screenshot functionality
            finalTextContent = content;
          } else {
            // Add the default image analysis prompt first, then user's custom text if any
            finalTextContent = content ? 
              `${imageAnalysisPrompt}\n\n**Additional Context:** ${content}` : 
              imageAnalysisPrompt;
          }

          contentArray.push({
            type: 'text',
            text: finalTextContent,
          });

          compressedBase64Images.forEach(base64 => {
            contentArray.push({
              type: 'image_url',
              image_url: {
                url: base64,
              },
            });
          });

          messageContent = contentArray;
        } catch (compressionError) {
          // Dismiss loading toast
          toast.dismiss(loadingToast);
          setIsProcessingImages(false);
          
          console.error('Image compression failed:', compressionError);
          toast.error(t('Failed to process images. Please try with smaller images or different formats.'));
          return;
        }
      } else {
        messageContent = content;
      }

      onSend({ role: 'user', content: messageContent }, plugin);
      
      // Reset form
      console.log('Resetting form after send...');
      setContent('');
      setPlugin(null);
      setSelectedImages([]);
      setImagePreviewUrls([]);
      console.log('Form reset complete');

      if (window.innerWidth < 640 && textareaRef && textareaRef.current) {
        textareaRef.current.blur();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(t('Error sending message. Please try again.'));
    }
  };

  const handleStopConversation = () => {
    stopConversationRef.current = true;
    setTimeout(() => {
      stopConversationRef.current = false;
    }, 1000);
  };

  const isMobile = () => {
    const userAgent =
      typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
    const mobileRegex =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    return mobileRegex.test(userAgent);
  };

  const handleInitModal = () => {
    const selectedPrompt = filteredPrompts[activePromptIndex];
    if (selectedPrompt) {
      setContent((prevContent) => {
        const newContent = prevContent?.replace(
          /\/\w*$/,
          selectedPrompt.content,
        );
        return newContent;
      });
      handlePromptSelect(selectedPrompt);
    }
    setShowPromptList(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showPromptList) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < prompts.length - 1 ? prevIndex + 1 : prevIndex,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : prevIndex,
        );
      } else if (e.key === 'Tab') {
        e.preventDefault();
        setActivePromptIndex((prevIndex) =>
          prevIndex < prompts.length - 1 ? prevIndex + 1 : 0,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleInitModal();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowPromptList(false);
      } else {
        setActivePromptIndex(0);
      }
    } else if (e.key === 'Enter' && !isTyping && !isMobile() && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === '/' && e.metaKey) {
      e.preventDefault();
      setShowPluginSelect(!showPluginSelect);
    }
  };

  const parseVariables = (content: string) => {
    const regex = /{{(.*?)}}/g;
    const foundVariables = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      foundVariables.push(match[1]);
    }

    return foundVariables;
  };

  const updatePromptListVisibility = useCallback((text: string) => {
    const match = text.match(/\/\w*$/);

    if (match) {
      setShowPromptList(true);
      setPromptInputValue(match[0].slice(1));
    } else {
      setShowPromptList(false);
      setPromptInputValue('');
    }
  }, []);

  const handlePromptSelect = (prompt: Prompt) => {
    const parsedVariables = parseVariables(prompt.content);
    setVariables(parsedVariables);

    if (parsedVariables.length > 0) {
      setIsModalVisible(true);
    } else {
      setContent((prevContent) => {
        const updatedContent = prevContent?.replace(/\/\w*$/, prompt.content);
        return updatedContent;
      });
      updatePromptListVisibility(prompt.content);
    }
  };

  const handleSubmit = (updatedVariables: string[]) => {
    const newContent = content?.replace(/{{(.*?)}}/g, (match, variable) => {
      const index = variables.indexOf(variable);
      return updatedVariables[index];
    });

    setContent(newContent);

    if (textareaRef && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    if (promptListRef.current) {
      promptListRef.current.scrollTop = activePromptIndex * 30;
    }
  }, [activePromptIndex]);

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
      textareaRef.current.style.overflow = `${
        textareaRef?.current?.scrollHeight > 400 ? 'auto' : 'hidden'
      }`;
    }
  }, [content]);

  // Update content when prompt prop changes (for screenshot functionality and system design prompts)
  useEffect(() => {
    console.log('🔍 useEffect triggered:', { 
      prompt, 
      content, 
      screenshotProcessed: (window as any).screenshotProcessed,
      screenshotData: !!(window as any).screenshotData,
      screenshotDataReady: (window as any).screenshotDataReady
    });
    
    // Skip if we just processed a screenshot to prevent re-triggering
    if ((window as any).screenshotProcessed) {
      console.log('🔍 Skipping - screenshot already processed');
      delete (window as any).screenshotProcessed;
      return;
    }
    
    // Handle screenshot prompts (special processing with images)
    if (prompt && 
        prompt !== content && 
        (prompt.includes('🔍 Code Analysis:') || prompt.includes('📸 Screenshot Analysis')) && 
        (window as any).screenshotData && 
        (window as any).screenshotDataReady) {
      
      console.log('🔍 Processing screenshot with prompt:', prompt);
      
      // Set content temporarily for the screenshot
      setContent(prompt);
      
      // Small delay to ensure the content is set and UI is updated
      setTimeout(() => {
        const screenshotData = (window as any).screenshotData;
        if (screenshotData && screenshotData.imageData) {
          console.log('🔍 Setting up screenshot preview and auto-sending...');
          
          // Get the base64 data (it should already include the data:image/jpeg;base64, prefix)
          let base64Data = screenshotData.imageData;
          
          // Ensure the data URL has the proper format
          if (!base64Data.startsWith('data:image/')) {
            base64Data = `data:image/jpeg;base64,${base64Data}`;
          }
          
          // Convert base64 to blob for file creation
          try {
            const base64Content = base64Data.split(',')[1];
            const byteCharacters = atob(base64Content);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            
            // Create a File object from the blob
            const file = new File([blob], 'screenshot.jpg', { type: 'image/jpeg' });
            
            // Set the selected images and preview URLs to show the screenshot in the input
            setSelectedImages([file]);
            setImagePreviewUrls([base64Data]);
            
            console.log('🔍 Screenshot preview set up successfully');
            
            // Clear the screenshot data from window to prevent reprocessing
            delete (window as any).screenshotData;
            delete (window as any).screenshotDataReady;
            
            // Auto-trigger send after a small delay to show the preview briefly
            setTimeout(async () => {
              console.log('🔍 Auto-triggering send for screenshot with image...');
              
              // Instead of calling handleSend which relies on state, directly process the screenshot
              try {
                console.log('🔍 Compressing screenshot image...');
                // Compress and convert the screenshot image
                const compressedBase64Images = await compressAndConvertImages([file]);
                
                console.log('🔍 Creating message content array...');
                // Create message with screenshot
                const contentArray: Array<{
                  type: 'text' | 'image_url';
                  text?: string;
                  image_url?: { url: string };
                }> = [];

                // Use the screenshot prompt as the text content
                contentArray.push({
                  type: 'text',
                  text: prompt, // Use the prompt directly
                });

                compressedBase64Images.forEach(base64 => {
                  contentArray.push({
                    type: 'image_url',
                    image_url: {
                      url: base64,
                    },
                  });
                });

                console.log('🔍 Sending message directly via onSend...');
                // Send the message directly
                onSend({ role: 'user', content: contentArray }, plugin);
                
                // Force clear everything after sending
                console.log('🔍 Force clearing form after screenshot send...');
                setContent('');
                setSelectedImages([]);
                setImagePreviewUrls([]);
                
                // Set a flag to prevent the useEffect from running again
                (window as any).screenshotProcessed = true;
                console.log('🔍 Screenshot processing completed successfully');
              } catch (error) {
                console.error('🔍 Error processing screenshot:', error);
                alert('Error processing screenshot. Please try again.');
              }
            }, 500);
            
          } catch (error) {
            console.error('🔍 Error processing screenshot data:', error);
          }
        } else {
          console.log('🔍 No screenshot data found in window object');
        }
      }, 200);
    } 
    // Handle regular prompts (like system design prompts) - just set the content
    else if (prompt && prompt !== content && prompt.trim() !== '') {
      console.log('📝 Setting regular prompt in chat input:', prompt);
      setContent(prompt);
    } else {
      console.log('🔍 Not processing - conditions not met:', {
        hasPrompt: !!prompt,
        promptDifferent: prompt !== content,
        isScreenshotPrompt: prompt && (prompt.includes('🔍 Code Analysis:') || prompt.includes('📸 Screenshot Analysis')),
        hasScreenshotData: !!(window as any).screenshotData,
        screenshotDataReady: (window as any).screenshotDataReady,
        promptNotEmpty: prompt && prompt.trim() !== ''
      });
    }
  }, [prompt]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        promptListRef.current &&
        !promptListRef.current.contains(e.target as Node)
      ) {
        setShowPromptList(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);

    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full border-transparent bg-gradient-to-b from-transparent via-white to-white pt-6 dark:border-white/20 dark:via-[#343541] dark:to-[#343541] md:pt-2">
      <div className="stretch mx-2 mt-4 flex flex-row gap-3 last:mb-2 md:mx-4 md:mt-[52px] md:last:mb-6 lg:mx-auto lg:max-w-3xl">
        {messageIsStreaming && (
          <button
            className="absolute top-0 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
            onClick={handleStopConversation}
          >
            <IconPlayerStop size={16} /> {t('Stop Generating')}
          </button>
        )}

        {!messageIsStreaming &&
          selectedConversation &&
          selectedConversation.messages.length > 0 && (
            <button
              className="absolute top-0 left-0 right-0 mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
              onClick={onRegenerate}
            >
              <IconRepeat size={16} /> {t('Regenerate response')}
            </button>
          )}

        <div className="relative mx-2 flex w-full flex-grow flex-col rounded-md border border-black/10 bg-white shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:border-gray-900/50 dark:bg-[#40414F] dark:text-white dark:shadow-[0_0_15px_rgba(0,0,0,0.10)] sm:mx-4">
          
          {/* Image Preview Area */}
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border-b border-neutral-200 dark:border-neutral-600">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                  >
                    <IconX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className="absolute left-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={() => setShowPluginSelect(!showPluginSelect)}
            onKeyDown={(e) => {}}
          >
            {plugin ? <IconBrandGoogle size={20} /> : <IconBolt size={20} />}
          </button>

          {/* Image Upload Button */}
          {modelSupportsImages && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                className="absolute left-10 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
                onClick={() => fileInputRef.current?.click()}
                title={String(t('Upload images'))}
              >
                <IconPhoto size={20} />
              </button>
            </>
          )}

          {showPluginSelect && (
            <div className="absolute left-0 bottom-14 rounded bg-white dark:bg-[#343541]">
              <PluginSelect
                plugin={plugin}
                onKeyDown={(e: any) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowPluginSelect(false);
                    textareaRef.current?.focus();
                  }
                }}
                onPluginChange={(plugin: Plugin) => {
                  setPlugin(plugin);
                  setShowPluginSelect(false);

                  if (textareaRef && textareaRef.current) {
                    textareaRef.current.focus();
                  }
                }}
              />
            </div>
          )}

          <textarea
            ref={textareaRef}
            className={`m-0 w-full resize-none border-0 bg-transparent p-0 py-2 pr-8 text-black dark:bg-transparent dark:text-white md:py-3 ${
              modelSupportsImages ? 'pl-20' : 'pl-10'
            }`}
            style={{
              resize: 'none',
              bottom: `${textareaRef?.current?.scrollHeight}px`,
              maxHeight: '400px',
              overflow: `${
                textareaRef.current && textareaRef.current.scrollHeight > 400
                  ? 'auto'
                  : 'hidden'
              }`,
            }}
            placeholder={
              modelSupportsImages
                ? String(t('Type a message, upload images (auto-analyzed), or type "/" to select a prompt...'))
                : String(t('Type a message or type "/" to select a prompt...'))
            }
            value={content}
            rows={1}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          <button
            id="send-button"
            className="absolute right-2 top-2 rounded-sm p-1 text-neutral-800 opacity-60 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-opacity-50 dark:text-neutral-100 dark:hover:text-neutral-200"
            onClick={handleSend}
            disabled={isProcessingImages}
          >
            {messageIsStreaming || isProcessingImages ? (
              <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-neutral-800 opacity-60 dark:border-neutral-100"></div>
            ) : (
              <IconSend size={18} />
            )}
          </button>

          {showScrollDownButton && (
            <div className="absolute bottom-12 right-0 lg:bottom-0 lg:-right-10">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-300 text-gray-800 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-neutral-200"
                onClick={onScrollDownClick}
              >
                <IconArrowDown size={18} />
              </button>
            </div>
          )}

          {showPromptList && filteredPrompts.length > 0 && (
            <div className="absolute bottom-12 w-full">
              <PromptList
                activePromptIndex={activePromptIndex}
                prompts={filteredPrompts}
                onSelect={handleInitModal}
                onMouseOver={setActivePromptIndex}
                promptListRef={promptListRef}
              />
            </div>
          )}

          {isModalVisible && (
            <VariableModal
              prompt={filteredPrompts[activePromptIndex]}
              variables={variables}
              onSubmit={handleSubmit}
              onClose={() => setIsModalVisible(false)}
            />
          )}
        </div>
      </div>
      <div className="px-3 pt-2 pb-3 text-center text-[12px] text-black/50 dark:text-white/50 md:px-4 md:pt-3 md:pb-6">
        <a
          href="https://github.com/mckaywrigley/chatbot-ui"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          ChatBot UI
        </a>
        .{' '}
        {t(
          "Chatbot UI is an advanced chatbot kit for OpenAI's chat models aiming to mimic ChatGPT's interface and functionality.",
        )}
      </div>
    </div>
  );
};
