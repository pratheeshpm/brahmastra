import { useCallback, useEffect, useRef, useState } from 'react';
import Collapsible from 'react-collapsible';
import { useQuery } from 'react-query';



import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';



import { useCreateReducer } from '@/hooks/useCreateReducer';
import useSocket from '@/hooks/useSocket';



import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';



import { cleanConversationHistory, cleanSelectedConversation } from '@/utils/app/clean';
import { DIAGRAM_SEARCH_ENDPOINT, RECEIVER_IP, sysDesignFolder, sysDesignPath, getApiProvider } from '@/utils/app/const';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { saveConversation, saveConversations, updateConversation } from '@/utils/app/conversation';
import { saveFolders } from '@/utils/app/folders';
import { savePrompts } from '@/utils/app/prompts';
import { getSettings } from '@/utils/app/settings';
import { codeErrorPrompt, codeOutputPrompt, FESystemDesignPrompts, leetcodePrompt, reactPrompt, systemDesignPrompts, diagramPrompts } from './promptConstants';



import { Conversation } from '@/types/chat';
import { KeyValuePair } from '@/types/data';
import { FolderInterface, FolderType } from '@/types/folder';
import { OpenAIModelID, OpenAIModels, fallbackModelID } from '@/types/openai';
import { Prompt } from '@/types/prompt';



import KeypressDetector from '../../../components/KeyPressDetector/KeyPressDetector';
import MsgCopy from '../../../components/MsgCopy';
import SpeechRecognitionComponent from '../../../components/SpeechRec/SpeechRecognitionComponent';
import { Chat } from '@/components/Chat/Chat';
import { Chatbar } from '@/components/Chatbar/Chatbar';
import { Navbar } from '@/components/Mobile/Navbar';
import Promptbar from '@/components/Promptbar';



import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';



import axios, { AxiosError, AxiosResponse } from 'axios';
import chalk from 'chalk';
import io from 'socket.io-client';
import { useFilePicker } from 'use-file-picker';
import { v4 as uuidv4 } from 'uuid';


const enableWebsockets = true;

const openOnGo = false;

const isBrowser = typeof window !== 'undefined';
const isReveiver = 0;


let clipboardData = '';
let sysDesignQuestion = '';
let feQs = '30secsJsStuff';
const labelStyle = {margin:'3px'}

let ws:WebSocket,ws2:WebSocket,wsReceiver: WebSocket,  ws3: any;

let socket: any, selfSocket: any;//, diagramSocket: any;
if(isBrowser){
  console.log("\n\nRECEIVER_IP-->",RECEIVER_IP)
   socket = io(RECEIVER_IP); 
   selfSocket = io(location.origin);
   //diagramSocket = io(DIAGRAM_SEARCH_ENDPOINT);
}



/*
 detailed requirementDiagram for system design of google calender
 detailed graph  for system design of google calender
 detailed user journey  for system design of google calender
*/
let diagramsOpened: boolean = false;
const openUpDiagrams = ((data: string) => {
  let counter = 0;
  const interval = setInterval(() => {
    if (counter < diagramPrompts.length) {
      //window.open(`${DIAGRAM_SEARCH_ENDPOINT}/?search=${data}&prefix=${diagramPrompts[counter]}`, '_blank');
      // REDIRECTION: Opens new tab to DIAGRAM_SEARCH_ENDPOINT with diagram prompts
      openNewTabStayOnCurrent(`${DIAGRAM_SEARCH_ENDPOINT}/?search=${data}&prefix=${diagramPrompts[counter]}`)
      counter++;
    } else {
      clearInterval(interval);
    }
  }, 100);
  //window.open(`${RECEIVER_IP}/?search=${data}&prefix=${diagramPrompts[0]}`, '_blank');
})

const openUpSearch = ((data: string) => {
  // REDIRECTION: Opens new tab to DIAGRAM_SEARCH_ENDPOINT with /summary path for FE System Design search
  openNewTabStayOnCurrent(`${DIAGRAM_SEARCH_ENDPOINT}/summary?search=${data}&prefix=${"FE System Design for"}`)
})

const initialOpt = ''
if(enableWebsockets && typeof window !== 'undefined'){
    let domain = location.host.split(":")[0]
  // Connect to the WebSocket server
  ws = new WebSocket(`ws://${domain}:8080`);
  ws2 = new WebSocket(`ws://${domain}:8081`);
  wsReceiver = new WebSocket(`ws://${domain}:8082`); // Initialize wsReceiver
  //ws3 = new WebSocket('ws://localhost:8082');
}

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  listening: boolean;
}



/* if(typeof window !== 'undefined'){
  const clipboard = navigator.clipboard;
  document.addEventListener('copy', function (e: ClipboardEvent) {
    // Get the selected text from the document
    const selectedText = window.getSelection()?.toString() || '';
    console.log("\n\n\n🚀 ~ file: home.tsx:64 ~ selectedText:", selectedText)
 
  });
  
  // Create a callback function to be called when the clipboard content changes.
  const clipboardChangeCallback = () => {
    // Get the current clipboard content.
    const clipboardContent = clipboard.readText();
  
    // Do something with the clipboard content.
    console.log(`\n\n\n\nClipboard content changed: ${clipboardContent}`);
  };
  
  // Register the callback function to be called when the clipboard content changes.
  clipboard.addEventListener('change', clipboardChangeCallback);
  
} */

// Function to open a new tab and stay on the current page
function openNewTabStayOnCurrent(url: string) {
  // REDIRECTION: Opens new tab with provided URL
  window.open(url,'_blank');
  //newTab.location.href = url;
  window.focus();
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
  
}: Props) => {
  const { t } = useTranslation('chat');
  const { getModels } = useApiService();
  const { getModelsError } = useErrorService();
  const [initialRender, setInitialRender] = useState<boolean>(true);
  const [fileContent, setFileContent] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('leetcode');
  const [messagedCopied, setMessageCopied] = useState(false);
  const [sysDesignCounter, setSysDesignCounter] = useState<any>('none');
  const [selectedSystemDesign, setSelectedSystemDesign] = useState<string>('FE');
  const [relevantFiles, setRelevantFiles] = useState<any>();
  const [fileSearch, setFileSearch] = useState<string>('');

  const [speechResult, setSpeechResult] = useState('');

  const handleSpeechResult = (result: string) => {
    setSpeechResult(result);
  };
  //  console.log("🚀 ~ file: home.tsx:71 ~ selectedOption:", selectedOption)


  const [openFileSelector, { filesContent, loading, errors }] = useFilePicker({
    readAs: 'DataURL',
    accept: 'image/*',
    multiple: true,
    limitFilesConfig: { max: 2 },
    // minFileSize: 1,
    maxFileSize: 50, // in megabytes
    onFilesSelected: ({ plainFiles, filesContent, errors }) => {
      // this callback is always called, even if there are errors
      var base64Data =
        filesContent && filesContent[0] && filesContent[0].content;
      let data = JSON.stringify({
        data: base64Data.split(';base64,')[1],
      });
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: '/api/ocr',
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };

      // REDIRECTION: Makes API call to /api/ocr endpoint for OCR processing
      axios
        .request(config)
        .then((response: AxiosResponse) => {
          let prompt = ''
          console.log('RSP------->', JSON.stringify(response.data));
          switch(selectedOption){
            case 'finderror':
              prompt = codeErrorPrompt;
              break;
            case 'leetcode':
              prompt = leetcodePrompt;
              break;
            case 'react':
              prompt = reactPrompt;
              break;
            case 'codeoutput':
              prompt = codeOutputPrompt;
              break;
            default:    
          }
          let correctPropmpt = `${prompt}${JSON.stringify(response.data)}`
          setFileContent(correctPropmpt);
          console.log("🚀 ~ file: home.tsx:119 ~ .then ~ correctPropmpt:", correctPropmpt)
        })
        .catch((error: AxiosError) => {
          console.log(error);
        });
      console.log(
        '🚀 ~ file: ocr.js:25 ~ Dashboard ~ base64Data:',
        base64Data && base64Data.split(';base64,')[1],
      );
    },
    onFilesRejected: ({ errors }) => {
      // this callback is called when there were validation errors
      console.log('onFilesRejected', errors);
    },
    onFilesSuccessfulySelected: ({ plainFiles, filesContent }) => {
      // this callback is called when there were no validation errors
      //console.log('onFilesSuccessfulySelected', plainFiles, filesContent);
    },
  });




  useSocket('clipboardContent', data => {
    if(data){
      socket.emit('clipboardContent',data);
      console.log("\n\n\n\n\npratheesh🚀 ~ file: home.tsx:225 ~ useSocket ~ data:", data)
      console.log("📋 Current selectedOption:", selectedOption)
      console.log("📋 Current sysDesignCounter:", sysDesignCounter)
      console.log("📋 Current selectedSystemDesign:", selectedSystemDesign)
      
      // Special handling for system design first prompt
      if(selectedOption === 'systemdesign' && sysDesignCounter === 0 ){
        data && setFileContent(`${ selectedSystemDesign == 'FE' ? FESystemDesignPrompts[0] :  systemDesignPrompts[0]} ${data}`);
        executeClick()
        console.log("\n\n\npratheesh in System Design--->",selectedOption,data)
        sysDesignQuestion = data;
        //openUpDiagrams(data);
        diagramsOpened = true;
        fetchRelevantFiles(data);
        return;
      }
      
      // For all other cases, process through onMsgHandler
      console.log("\n\n\npratheesh--->",selectedOption,data)
      
      // Try to process through onMsgHandler
      try {
        data && onMsgHandler({data: data})
      } catch (error) {
        console.error("❌ Error in onMsgHandler, using fallback:", error);
        // Fallback: just set the raw clipboard content
        setFileContent(data);
      }
      
      // Special handling for leetcode
      if(selectedOption == 'leetcode'){
        console.log("\n\n pratheesh should come here")
        // REDIRECTION: Opens new tab to localhost:3001 search with leetcode data
        window.open(`http://localhost:3001/search?term=${data}&from=chatbotai`, '_blank');
      }
      
      setTimeout(()=>{
        // Simulating a click event on the button
          let button = document.getElementById('send-button');

          if (button) {
            button.click();
            console.log("✅ Send button clicked successfully");
          } else {
            console.error("❌ Send button not found!");
          }

          let clipboardContent = data;
          const capturedLogs: any[] = [];
          const originalConsoleLog = console.log;
          
          // Function to apply color to console output
          const colorLog = (args: any[], colorFunction: any) => {
            const coloredArgs = args.map(arg => {
              return colorFunction(arg)
            });
            originalConsoleLog(...coloredArgs);
          };
          
          console.log = (...args: any[]) => {
            capturedLogs.push(args);
            colorLog(args, chalk.yellow); // Yellow color using chalk
          };
          try{

            eval(clipboardContent);
          }catch(e){}
          console.log = originalConsoleLog; // Restore original console.log
          console.log('\n\n\n\n\n\nCaptured logs:');
          capturedLogs.forEach(log => colorLog(log, chalk.red));
              

      },1000);
    }
  })

  // Screenshot socket events - integrates with existing chat flow
  useSocket('screenshot_taken', data => {
    console.log('Screenshot taken:', data);
    
    // Store the screenshot data in the window object for ChatInput to access
    (window as any).screenshotData = {
      imageData: data.imageData,
      model: data.model
    };
    
    // Check if this is a screenshot prompt that should show preview
    const shouldShowPreview = data.prompt.includes('🔍 Code Analysis:') || 
                             data.prompt.includes('📸 Screenshot Analysis');
    
    if (shouldShowPreview) {
      // For screenshot types that should show preview AND auto-execute
      console.log('Screenshot with preview - setting prompt for ChatInput to handle');
      
      // Set a flag to indicate screenshot data is ready
      (window as any).screenshotDataReady = true;
      
      // Set the prompt which will trigger the ChatInput useEffect
      setFileContent(data.prompt);
      
      // DO NOT call executeClick() - let ChatInput handle everything
      console.log('Screenshot data stored, ChatInput will handle the rest');
    } else {
      // For regular screenshots, use the old behavior with auto-execution
      setFileContent(data.prompt);
      executeClick();
    }
    
    console.log('Screenshot data stored, prompt set to:', data.prompt);
  });

  useSocket('screenshot_error', data => {
    console.log('Screenshot error:', data);
    setFileContent(`❌ Error taking screenshot: ${data.error}`);
    executeClick();
  });

  // New socket event handler for Ctrl+N - Click to Next functionality
  useSocket('click_to_next_triggered', data => {
    console.log('Click to Next triggered via Ctrl+N:', data);
    
    // Force focus on the window if it's in background
    if (typeof window !== 'undefined') {
      window.focus();
    }
    
    // Replicate the "Click To Next" button behavior with auto-send
    setTimeout(() => {
      console.log('Ctrl+N: Processing system design prompt progression...');
      console.log('Current sysDesignCounter:', sysDesignCounter);
      console.log('Current selectedSystemDesign:', selectedSystemDesign);
      
      if(sysDesignCounter === 'none'){
        // Set the first prompt in the chat input and auto-send
        const firstPrompt = selectedSystemDesign == 'FE' ? FESystemDesignPrompts[0] : systemDesignPrompts[0];
        setFileContent(firstPrompt);
        setSysDesignCounter(0);
        setSelectedOption('systemdesign');
        console.log('Ctrl+N: Set first system design prompt and auto-sending:', firstPrompt);
        executeClick(); // Auto-send the message
        return;
      }
      
      // Check if we can move to next prompt (both arrays have 7 elements, indices 0-6)
      const maxIndex = selectedSystemDesign == 'FE' ? FESystemDesignPrompts.length - 1 : systemDesignPrompts.length - 1;
      const currentArray = selectedSystemDesign == 'FE' ? FESystemDesignPrompts : systemDesignPrompts;
      
      console.log('Ctrl+N: Current counter:', sysDesignCounter, 'Max index:', maxIndex, 'Array type:', selectedSystemDesign);
      
      if(!isNaN(sysDesignCounter) && sysDesignCounter < maxIndex){
        const nextPrompt = currentArray[sysDesignCounter + 1];
        // Set the next prompt in the chat input area and auto-send
        setFileContent(nextPrompt);
        setSysDesignCounter(sysDesignCounter + 1);
        console.log(`Ctrl+N: Set system design prompt ${sysDesignCounter + 1} and auto-sending:`, nextPrompt);
        executeClick(); // Auto-send the message
      } else {
        // We've reached the end, show completion message and auto-send
        const completionMessage = selectedSystemDesign == 'FE' 
          ? "🎉 You've completed all Frontend System Design prompts! Use 'Reset' to start over."
          : "🎉 You've completed all Backend System Design prompts! Use 'Reset' to start over.";
        setFileContent(completionMessage);
        console.log('Ctrl+N: Reached end of system design prompts, sending completion message');
        executeClick(); // Auto-send the completion message
      }
      
      // Special handling for first system design prompt with additional text (Ctrl+N)
      // Check if we're at counter 0 (first prompt) and if user has added extra text
      console.log('🎬 Ctrl+N DEBUG: Checking YouTube search conditions...');
      console.log('🎬 Ctrl+N DEBUG: sysDesignCounter:', sysDesignCounter);
      console.log('🎬 Ctrl+N DEBUG: selectedOption:', selectedOption);
      console.log('🎬 Ctrl+N DEBUG: fileContent length:', fileContent ? fileContent.length : 0);
      
      if(sysDesignCounter === 0 && selectedOption === 'systemdesign'){
        const currentPrompt = selectedSystemDesign == 'FE' ? FESystemDesignPrompts[0] : systemDesignPrompts[0];
        console.log('🎬 Ctrl+N DEBUG: currentPrompt length:', currentPrompt.length);
        
        // Check if the current fileContent has additional text beyond the original prompt
        if(fileContent && fileContent.length > currentPrompt.length && fileContent.includes(currentPrompt)){
          console.log('🎬 Ctrl+N DEBUG: Additional text detected!');
          // Extract the additional text that user appended
          const additionalText = fileContent.replace(currentPrompt, '').trim();
          console.log('🎬 Ctrl+N DEBUG: Extracted additional text:', additionalText);
          
          if(additionalText.length > 0){
            console.log('🎬 Ctrl+N: Opening YouTube search for additional text:', additionalText);
            // Open YouTube search tab with the additional text before executing click
            const youtubeSearchUrl = `http://localhost:3000/youtube-search?q=${encodeURIComponent(additionalText)}`;
            console.log('🎬 Ctrl+N DEBUG: Opening URL:', youtubeSearchUrl);
            
            try {
              const youtubeWindow = window.open(youtubeSearchUrl, '_blank');
              if (youtubeWindow) {
                console.log('🎬 Ctrl+N: YouTube search opened successfully!');
              } else {
                console.error('🎬 Ctrl+N ERROR: YouTube search window was blocked!');
              }
            } catch (error) {
              console.error('🎬 Ctrl+N ERROR: Failed to open YouTube search:', error);
            }

            // Use requestAnimationFrame to queue the second window opening
            requestAnimationFrame(() => {
              const fileSearchUrl = `http://localhost:3000/file-search?q=${encodeURIComponent(additionalText)}&mode=filename`;
              console.log('🎬 Ctrl+N DEBUG: Opening File Search URL:', fileSearchUrl);
              try {
                const fileSearchWindow = window.open(fileSearchUrl, '_blank');
                if (fileSearchWindow) {
                  console.log('🎬 Ctrl+N: File search opened successfully!');
                } else {
                  console.error('🎬 Ctrl+N ERROR: File search window was blocked!');
                }
              } catch (error) {
                console.error('🎬 Ctrl+N ERROR: Failed to open File search:', error);
              }
            });
          } else {
            console.log('🎬 Ctrl+N DEBUG: Additional text is empty after trim');
          }
        } else {
          console.log('🎬 Ctrl+N DEBUG: No additional text found');
          console.log('🎬 Ctrl+N DEBUG: fileContent includes currentPrompt:', fileContent ? fileContent.includes(currentPrompt) : false);
        }
      } else {
        console.log('🎬 Ctrl+N DEBUG: Conditions not met for YouTube search');
      }
    }, 100);
  });

  // Screenshot processing is now handled entirely by ChatInput component

  const fetchRelevantFiles = async (file: string = sysDesignQuestion, path: string = '', project: string = '') => {
    // REDIRECTION: Makes API call to /match endpoint for file/folder matching
    console.log("\n\nurl-->",`/match?keyword=${file}&folder=${path ? path : `${sysDesignPath}${sysDesignFolder}`}`,project);
    //const res = await axios.get(`/match?keyword=${file}&folder=${sysDesignPath}${sysDesignFolder}&project=${sysDesignFolder}`);
    const res = await axios.get(`/match?keyword=${file}&folder=${path ? path : `${sysDesignPath}${sysDesignFolder}`}&project=${project ? project : sysDesignFolder}`);
    const files = res.data;
    console.log("🚀 ~ file: home.tsx:333 ~ fetchRelevantFiles ~ res.data:", res.data)
    setRelevantFiles(files);
    return files;
  }

  const executeClick = () => {
    setTimeout(()=>{
      // Simulating a click event on the button
      let button = document.getElementById('send-button');

      if (button) 
        button.click();
    },1000)
    return;
  }
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
  };
  //  console.log("🚀 ~ file: home.tsx:60 ~ fileContent:", fileContent)

  const onMsgHandler = (event: any) => {
    console.log(
      '🚀 ~ file: home.tsx:116 ~ onMsgHandler ~ event.data:',
      event.data,
    );
    console.log('🔍 onMsgHandler - selectedOption:', selectedOption);
    console.log('🔍 onMsgHandler - sysDesignCounter:', sysDesignCounter);
    console.log('🔍 onMsgHandler - selectedSystemDesign:', selectedSystemDesign);
    
    let prompt = ''
    switch(selectedOption){
      case 'finderror':
        prompt = codeErrorPrompt || '';
        console.log('📝 Using codeErrorPrompt');
        break;
      case 'leetcode':
        prompt = leetcodePrompt || '';
        console.log('📝 Using leetcodePrompt');
        break;
      case 'react':
        prompt = reactPrompt || '';
        console.log('📝 Using reactPrompt');
        break;
      case 'codeoutput':
        prompt = codeOutputPrompt || '';
        console.log('📝 Using codeOutputPrompt');
        break;
      case 'systemdesign':
        // Handle system design prompts with bounds checking
        const currentArray = selectedSystemDesign == 'FE' ? FESystemDesignPrompts : systemDesignPrompts;
        
        // Validate that the arrays exist
        if (!currentArray || !Array.isArray(currentArray) || currentArray.length === 0) {
          console.error('❌ System design prompts array is invalid:', currentArray);
          prompt = '';
          break;
        }
        
        const maxIndex = currentArray.length - 1;
        
        console.log('📝 System design - currentArray length:', currentArray.length);
        console.log('📝 System design - maxIndex:', maxIndex);
        console.log('📝 System design - sysDesignCounter:', sysDesignCounter);
        
        // If sysDesignCounter is valid, use it; otherwise use the first prompt
        if (typeof sysDesignCounter === 'number' && sysDesignCounter >= 0 && sysDesignCounter <= maxIndex) {
          prompt = currentArray[sysDesignCounter] || '';
          console.log('📝 Using system design prompt at index:', sysDesignCounter);
        } else {
          // Fallback to first prompt if counter is invalid
          prompt = currentArray[0] || '';
          console.log('🔧 Using fallback system design prompt (first prompt) due to invalid counter:', sysDesignCounter);
        }
        break;
      case 'plain':
        // For plain text, don't add any prefix prompt
        prompt = '';
        console.log('📝 Using plain text (no prompt prefix)');
        break;
      default:    
        // For unknown options, use plain text
        prompt = '';
        console.log('📝 Using default (no prompt prefix) for unknown option:', selectedOption);
    }
    
    // Ensure we always have valid data
    const dataToUse = event.data || '';
    let correctPropmpt = `${prompt}${dataToUse}`
    
    // If prompt is empty and we have data, just use the data
    if (!prompt && dataToUse) {
      correctPropmpt = dataToUse;
      console.log('📝 No prompt prefix, using raw data');
    }
    
    setFileContent(correctPropmpt);
    console.log("🚀 ~ file: home.tsx:119 ~ onMsgHandler ~ correctPropmpt:", correctPropmpt)
  }

  useEffect(() => {
    if(isReveiver && wsReceiver){ 
      wsReceiver.onmessage = onMsgHandler;
    }
    if(enableWebsockets){
      // When a message is received from the server
        ws.onmessage = onMsgHandler;
        ws2.onmessage = onMsgHandler;
    }
    //const button = document.getElementById('send-button');
  

/*     ws3.on('clipboardContent',(event: MessageEvent) => {
      
      if(event.data){
        console.log("\n\n\n\n\npratheesh🚀 ~ file: home.tsx:225 ~ useEffect ~ sysDesignCounter:", sysDesignCounter)
        if(sysDesignCounter === 0){
          event.data && setFileContent(`${ selectedSystemDesign == 'FE' ? FESystemDesignPrompts[0] :  systemDesignPrompts[0]} ${event.data}`);
          executeClick()
          return;
        }
        event.data && setFileContent(event.data)
        setTimeout(()=>{
          // Simulating a click event on the button
            let button = document.getElementById('send-button');

            if (button) 
              button.click();

            let clipboardContent = event.data;
            const capturedLogs: any[] = [];
            const originalConsoleLog = console.log;
            
            // Function to apply color to console output
            const colorLog = (args: any[], colorFunction: any) => {
              const coloredArgs = args.map(arg => {
                return colorFunction(arg)
              });
              originalConsoleLog(...coloredArgs);
            };
            
            console.log = (...args: any[]) => {
              capturedLogs.push(args);
              colorLog(args, chalk.yellow); // Yellow color using chalk
            };
            try{

              eval(clipboardContent);
            }catch(e){}
            console.log = originalConsoleLog; // Restore original console.log
            console.log('\n\n\n\n\n\nCaptured logs:');
            capturedLogs.forEach(log => colorLog(log, chalk.red));
                

        },1000);
      }
      })

 */    // Clean up the WebSocket connection when component unmounts
    return () => {
      // ws.close();
      // ws2.close();
      // ws3.close();
    };
  }, [selectedOption, sysDesignCounter]);

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      apiKey,
      lightMode,
      folders,
      conversations,
      selectedConversation,
      prompts,
      temperature,
    },
    dispatch,
  } = contextValue;

  const stopConversationRef = useRef<boolean>(false);

  const { data, error, refetch } = useQuery(
    ['GetModels', apiKey, serverSideApiKeyIsSet, getApiProvider()], // Add API provider to query key
    ({ signal }) => {
      if (!apiKey && !serverSideApiKeyIsSet) return null;

      return getModels(
        {
          key: apiKey,
          apiProvider: getApiProvider(), // Add the current API provider
        },
        signal,
      );
    },
    { enabled: true, refetchOnMount: false },
  );

  useEffect(() => {
    if (data) dispatch({ field: 'models', value: data });
  }, [data, dispatch]);

  useEffect(() => {
    dispatch({ field: 'modelError', value: getModelsError(error) });
  }, [dispatch, error, getModelsError]);

  // FETCH MODELS ----------------------------------------------

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      field: 'selectedConversation',
      value: conversation,
    });

    saveConversation(conversation);
  };

  // FOLDER OPERATIONS  --------------------------------------------

  const handleCreateFolder = (name: string, type: FolderType) => {
    const newFolder: FolderInterface = {
      id: uuidv4(),
      name,
      type,
    };

    const updatedFolders = [...folders, newFolder];

    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
  };

  const handleDeleteFolder = (folderId: string) => {
    const updatedFolders = folders.filter((f) => f.id !== folderId);
    dispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);

    const updatedConversations: Conversation[] = conversations.map((c) => {
      if (c.folderId === folderId) {
        return {
          ...c,
          folderId: null,
        };
      }

      return c;
    });

    dispatch({ field: 'conversations', value: updatedConversations });
    saveConversations(updatedConversations);

    const updatedPrompts: Prompt[] = prompts.map((p) => {
      if (p.folderId === folderId) {
        return {
          ...p,
          folderId: null,
        };
      }

      return p;
    });

    dispatch({ field: 'prompts', value: updatedPrompts });
    savePrompts(updatedPrompts);
  };

  const handleUpdateFolder = (folderId: string, name: string) => {
    const updatedFolders = folders.map((f) => {
      if (f.id === folderId) {
        return {
          ...f,
          name,
        };
      }

      return f;
    });

    dispatch({ field: 'folders', value: updatedFolders });

    saveFolders(updatedFolders);
  };

  // CONVERSATION OPERATIONS  --------------------------------------------

  const handleNewConversation = () => {
    const lastConversation = conversations[conversations.length - 1];

    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New Conversation'),
      messages: [],
      model: lastConversation?.model || {
        id: OpenAIModels[defaultModelId].id,
        name: OpenAIModels[defaultModelId].name,
        maxLength: OpenAIModels[defaultModelId].maxLength,
        tokenLimit: OpenAIModels[defaultModelId].tokenLimit,
      },
      prompt: DEFAULT_SYSTEM_PROMPT,
      temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
      folderId: null,
    };

    const updatedConversations = [...conversations, newConversation];

    dispatch({ field: 'selectedConversation', value: newConversation });
    dispatch({ field: 'conversations', value: updatedConversations });

    saveConversation(newConversation);
    saveConversations(updatedConversations);

    dispatch({ field: 'loading', value: false });
  };

  const handleUpdateConversation = (
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const { single, all } = updateConversation(
      updatedConversation,
      conversations,
    );

    dispatch({ field: 'selectedConversation', value: single });
    dispatch({ field: 'conversations', value: all });
  };

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
    }
  }, [selectedConversation]);

  useEffect(() => {
    defaultModelId &&
      dispatch({ field: 'defaultModelId', value: defaultModelId });
    serverSideApiKeyIsSet &&
      dispatch({
        field: 'serverSideApiKeyIsSet',
        value: serverSideApiKeyIsSet,
      });
    serverSidePluginKeysSet &&
      dispatch({
        field: 'serverSidePluginKeysSet',
        value: serverSidePluginKeysSet,
      });
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet]);


  const copyOnClick = (prompt: string, execute: boolean = false) => {
    if (!navigator.clipboard) return;
    clipboardData = prompt;
    setFileContent(prompt)
    execute && executeClick()
    /* navigator.clipboard.writeText(prompt).then(() => {
      setMessageCopied(true);
      setTimeout(() => {
        setMessageCopied(false);
      }, 2000);
    }); */
  };

  // diagram n search
  const fetchDiagramNSearch = () => {
    console.log('fetchDiagramNSearch');
    openUpDiagrams(sysDesignQuestion);
    // REDIRECTION: Opens search functionality with /summary path
    openUpSearch(sysDesignQuestion)
  }
  
  // ON LOAD --------------------------------------------

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      });
    }

    const apiKey = localStorage.getItem('apiKey');

    if (serverSideApiKeyIsSet) {
      dispatch({ field: 'apiKey', value: '' });

      localStorage.removeItem('apiKey');
    } else if (apiKey) {
      dispatch({ field: 'apiKey', value: apiKey });
    }

    const pluginKeys = localStorage.getItem('pluginKeys');
    if (serverSidePluginKeysSet) {
      dispatch({ field: 'pluginKeys', value: [] });
      localStorage.removeItem('pluginKeys');
    } else if (pluginKeys) {
      dispatch({ field: 'pluginKeys', value: pluginKeys });
    }

    if (window.innerWidth < 640) {
      dispatch({ field: 'showChatbar', value: false });
      dispatch({ field: 'showPromptbar', value: false });
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({ field: 'showChatbar', value: showChatbar === 'true' });
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({ field: 'showPromptbar', value: showPromptbar === 'true' });
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      dispatch({ field: 'folders', value: JSON.parse(folders) });
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch({ field: 'prompts', value: JSON.parse(prompts) });
    }

    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );

      dispatch({ field: 'conversations', value: cleanedConversationHistory });
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );

      dispatch({
        field: 'selectedConversation',
        value: cleanedSelectedConversation,
      });
    } else {
      const lastConversation = conversations[conversations.length - 1];
      dispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: lastConversation?.temperature ?? DEFAULT_TEMPERATURE,
          folderId: null,
        },
      });
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleCreateFolder,
        handleDeleteFolder,
        handleUpdateFolder,
        handleSelectConversation,
        handleUpdateConversation,
      }}
    >
      <Head>
        <title>Chatbot UI</title>
        <meta name="description" content="ChatGPT but better." />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      {selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
            
          </div>
          

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            <Chatbar />
            <div className="flex flex-1">
              <Chat
                key={fileContent.length}
                stopConversationRef={stopConversationRef}
                prompt={fileContent}
              />
            </div>
            <div style={{width:'250px'}}>
              <button style={{color:'yellow'}} onClick={() => openFileSelector()}>Select to auto-gen OCR </button>
              {filesContent.map((file, index) => {
                //console.log("file-->",file)
                return (
                  <div key={index}>
                    <h2>{file.name}</h2>
                    <br />
                  </div>
                );
              })}
              <div>---------</div>



              <Collapsible trigger={(<div style={{color:'yellow'}}>{`CODING -->`}</div>)}>
                <div style={{display:'grid', padding:'10px'}}>
                    <label style={labelStyle}>
                      <input
                        type="radio"
                        value="leetcode"
                        checked={selectedOption === 'leetcode'}
                        onChange={handleOptionChange}
                      />
                      Leetcode
                    </label>

                    <label style={labelStyle}>
                      <input
                        type="radio"
                        value="react"
                        checked={selectedOption === 'react'}
                        onChange={handleOptionChange}
                      />
                      React
                    </label>

                    <label style={labelStyle}>
                      <input
                        type="radio"
                        value="codeoutput"
                        checked={selectedOption === 'codeoutput'}
                        onChange={handleOptionChange}
                      />
                      Code Output
                    </label>

                    <label style={labelStyle}>
                      <input
                        type="radio"
                        value="finderror"
                        checked={selectedOption === 'finderror'}
                        onChange={handleOptionChange}
                      />
                      Find Error
                    </label>

                    <label style={labelStyle}>
                      <input
                        type="radio"
                        value="plain"
                        checked={selectedOption === 'plain'}
                        onChange={handleOptionChange}
                      />
                      Plain text
                    </label>

                    {/* You can display the selected option */}
                    <p>Selected Option: {selectedOption}</p>

                    <div>---------</div>

                    <div style={{width:'150px',marginTop:'5px'}}>
                      Set Prompts in Chat:
                      <button style={{color:'yellow', margin:'3px'}} onClick={() => {
                        setFileContent(leetcodePrompt);
                        setSelectedOption('leetcode');
                        console.log('Set Leetcode prompt in chat input');
                      }}>Leetcode prompt</button>
                      <button style={{color:'yellow', margin:'3px'}} onClick={() => {
                        setFileContent(reactPrompt);
                        setSelectedOption('react');
                        console.log('Set React prompt in chat input');
                      }}>React prompt</button>
                      <button style={{color:'yellow', margin:'3px'}} onClick={() => {
                        setFileContent(codeOutputPrompt);
                        setSelectedOption('codeoutput');
                        console.log('Set Code-Output prompt in chat input');
                      }}>Code-Output prompt</button>
                      <button style={{color:'yellow', margin:'3px'}} onClick={() => {
                        setFileContent(codeErrorPrompt);
                        setSelectedOption('codeerror');
                        console.log('Set Code-Error prompt in chat input');
                      }}>Code-Error prompt</button>
                    </div>
                    <div>
                    <input type="text"  style={{ color: 'black' }} value={fileSearch} placeholder="Search..." onChange={(e)=>{setFileSearch(e.target.value)}} />
                    <button onClick={()=>{
                      
                      // REDIRECTION: Fetches relevant files from specific path with feQs project
                      fetchRelevantFiles(fileSearch,`${sysDesignPath}${feQs}`,feQs);
                    }}>Search</button>
                     <div>
                  {relevantFiles && relevantFiles.matchingFolders && (<div>Folders:</div>)}
                  {relevantFiles && relevantFiles.matchingFolders && relevantFiles.matchingFolders.map((file : string, index: number) => {
                    if(file && !file.includes('node_modules')){
                      console.log("file-->",file)
                      return (
                        <div key={index}>
                          <button style={{textAlign:'left'}} onClick={()=>{
                            console.log("\n\n\nCLicked on file-->",file)
                            // REDIRECTION: Makes API call to /open endpoint to open file
                            axios.get(`/open?path=${sysDesignPath}${feQs}${file}`)
                          }}>{`->${file}`}</button>
                          <br />
                        </div>
                      );
                      }
                  })}
                  <div>------</div>
                  {relevantFiles && relevantFiles.matchingFiles && (<div>Files:</div>)}
                  {relevantFiles && relevantFiles.matchingFiles && relevantFiles.matchingFiles.map((file : string, index: number) => {
                    if(file && !file.includes('node_modules')){
                      console.log("file-->",file)
                      return (
                        <div key={index}>
                          <button  style={{textAlign:'left'}}  onClick={()=>{
                            console.log("\n\n\nCLicked on file-->",file)
                            // REDIRECTION: Makes API call to /open endpoint to open file
                            axios.get(`/open?path=${sysDesignPath}${feQs}${file}`)
                          }}>{`->${file}`}</button>
                          <br />
                        </div>
                      );
                    }
                  })}
                </div>
                </div>
                </div>


              </Collapsible>
              
              <div>---------</div>

              <Collapsible trigger={(<div style={{color:'yellow'}}>{`SYSTEM DESIGN -->`}</div>)}>
                <div style={{display:'grid', padding:'10px',marginTop:'5px'}}>
                  <label style={labelStyle}>
                    <input
                      type="radio"
                      value="FE"
                      checked={selectedSystemDesign === 'FE'}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>{
                        setSelectedSystemDesign(event.target.value);
                      }}  
                    />
                    FE
                  </label>

                  <label style={labelStyle}>
                    <input
                      type="radio"
                      value="BE"
                      checked={selectedSystemDesign === 'BE'}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>{
                        setSelectedSystemDesign(event.target.value);
                      }}
                    />
                    BE
                  </label>
                </div>
                <div style={{width:'150px'}}>
                    <button style={{color:'yellow', margin:'3px'}} onClick={() =>{
                      console.log("\n\n\n clicked on next",sysDesignCounter)
                        if(sysDesignCounter === 'none'){
                          // Set the first prompt in the chat input
                          const firstPrompt = selectedSystemDesign == 'FE' ? FESystemDesignPrompts[0] : systemDesignPrompts[0];
                          setFileContent(firstPrompt);
                          setSysDesignCounter(0);
                          setSelectedOption('systemdesign');
                          console.log('Set first system design prompt:', firstPrompt);
                          return;
                        }
                        
                        // Check if we can move to next prompt (both arrays have 7 elements, indices 0-6)
                        const maxIndex = selectedSystemDesign == 'FE' ? FESystemDesignPrompts.length - 1 : systemDesignPrompts.length - 1;
                        const currentArray = selectedSystemDesign == 'FE' ? FESystemDesignPrompts : systemDesignPrompts;
                        
                        console.log('Current counter:', sysDesignCounter, 'Max index:', maxIndex, 'Array type:', selectedSystemDesign);
                        
                        if(!isNaN(sysDesignCounter) && sysDesignCounter < maxIndex){
                          const nextPrompt = currentArray[sysDesignCounter + 1];
                          // Set the next prompt in the chat input area (user can edit before sending)
                          setFileContent(nextPrompt);
                          setSysDesignCounter(sysDesignCounter + 1);
                          console.log(`Set system design prompt ${sysDesignCounter + 1}:`, nextPrompt);
                        } else {
                          // We've reached the end, show completion message
                          const completionMessage = selectedSystemDesign == 'FE' 
                            ? "🎉 You've completed all Frontend System Design prompts! Click 'Reset' to start over."
                            : "🎉 You've completed all Backend System Design prompts! Click 'Reset' to start over.";
                          setFileContent(completionMessage);
                          console.log('Reached end of system design prompts');
                        }
                        
                        // Special handling for first system design prompt with additional text
                        // Check if we're moving from the first prompt (counter 0) to second prompt (counter 1)
                        console.log('🎬 DEBUG: Checking YouTube search conditions...');
                        console.log('🎬 DEBUG: sysDesignCounter:', sysDesignCounter);
                        console.log('🎬 DEBUG: selectedOption:', selectedOption);
                        console.log('🎬 DEBUG: fileContent length:', fileContent ? fileContent.length : 0);
                        console.log('🎬 DEBUG: fileContent preview:', fileContent ? fileContent.substring(0, 100) + '...' : 'empty');
                        
                        if(sysDesignCounter === 0 && selectedOption === 'systemdesign'){
                          const currentPrompt = selectedSystemDesign == 'FE' ? FESystemDesignPrompts[0] : systemDesignPrompts[0];
                          console.log('🎬 DEBUG: currentPrompt length:', currentPrompt.length);
                          console.log('🎬 DEBUG: currentPrompt preview:', currentPrompt.substring(0, 100) + '...');
                          
                          // Check if the current fileContent has additional text beyond the original prompt
                          if(openOnGo && fileContent && fileContent.length > currentPrompt.length && fileContent.includes(currentPrompt)){
                            console.log('🎬 DEBUG: Additional text detected!');
                            // Extract the additional text that user appended
                            const additionalText = fileContent.replace(currentPrompt, '').trim();
                            console.log('🎬 DEBUG: Extracted additional text:', additionalText);
                            
                            if(additionalText.length > 0){
                              console.log('🎬 Opening YouTube search for additional text:', additionalText);
                              // Open YouTube search tab with the additional text before executing click
                              const youtubeSearchUrl = `http://localhost:3000/youtube-search?q=${encodeURIComponent(additionalText)}`;
                              console.log('🎬 DEBUG: Opening URL:', youtubeSearchUrl);
                              
                              try {
                                const youtubeWindow = window.open(youtubeSearchUrl, '_blank');
                                if (youtubeWindow) {
                                  console.log('🎬 YouTube search opened successfully!');
                                } else {
                                  console.error('🎬 ERROR: YouTube search window was blocked!');
                                }
                              } catch (error) {
                                console.error('🎬 ERROR: Failed to open YouTube search:', error);
                              }

                              // Use requestAnimationFrame to queue the second window opening
                              requestAnimationFrame(() => {
                                const fileSearchUrl = `http://localhost:3000/file-search?q=${encodeURIComponent(additionalText)}&mode=filename`;
                                console.log('🎬 DEBUG: Opening File Search URL:', fileSearchUrl);
                                try {
                                  const fileSearchWindow = window.open(fileSearchUrl, '_blank');
                                  if (fileSearchWindow) {
                                    console.log('🎬 File search opened successfully!');
                                  } else {
                                    console.error('🎬 ERROR: File search window was blocked!');
                                  }
                                } catch (error) {
                                  console.error('🎬 ERROR: Failed to open File search:', error);
                                }
                              });
                            } else {
                              console.log('🎬 DEBUG: Additional text is empty after trim');
                            }
                          } else {
                            console.log('🎬 DEBUG: No additional text found');
                            console.log('🎬 DEBUG: fileContent includes currentPrompt:', fileContent ? fileContent.includes(currentPrompt) : false);
                          }
                        } else {
                          console.log('🎬 DEBUG: Conditions not met for YouTube search');
                        }
                    }}>
                        Click To Next ({sysDesignCounter === 'none' ? 'Start' : `${sysDesignCounter + 1}/${selectedSystemDesign == 'FE' ? FESystemDesignPrompts.length : systemDesignPrompts.length}`})
                    </button>

                    {/* YouTube Search Button */}
                    <button style={{color:'red', margin:'3px', fontSize:'12px'}} onClick={() => {
                      if(sysDesignCounter === 0 && selectedOption === 'systemdesign'){
                        const currentPrompt = selectedSystemDesign == 'FE' ? FESystemDesignPrompts[0] : systemDesignPrompts[0];
                        if(fileContent && fileContent.length > currentPrompt.length && fileContent.includes(currentPrompt)){
                          const additionalText = fileContent.replace(currentPrompt, '').trim();
                          if(additionalText.length > 0){
                            const youtubeSearchUrl = `http://localhost:3000/youtube-search?q=${encodeURIComponent(additionalText)}`;
                            console.log('🎬 Manual YouTube search:', youtubeSearchUrl);
                            window.open(youtubeSearchUrl, '_blank');
                          } else {
                            alert('No additional text found to search');
                          }
                        } else {
                          alert('Please add additional text to the first system design prompt');
                        }
                      } else {
                        alert('YouTube search only available for first system design prompt with additional text');
                      }
                    }}>
                        🎬 YouTube
                    </button>

                    {/* File Search Button */}
                    <button style={{color:'blue', margin:'3px', fontSize:'12px'}} onClick={() => {
                      if(sysDesignCounter === 0 && selectedOption === 'systemdesign'){
                        const currentPrompt = selectedSystemDesign == 'FE' ? FESystemDesignPrompts[0] : systemDesignPrompts[0];
                        if(fileContent && fileContent.length > currentPrompt.length && fileContent.includes(currentPrompt)){
                          const additionalText = fileContent.replace(currentPrompt, '').trim();
                          if(additionalText.length > 0){
                            const fileSearchUrl = `http://localhost:3000/file-search?q=${encodeURIComponent(additionalText)}&mode=filename`;
                            console.log('🎬 Manual File search:', fileSearchUrl);
                            window.open(fileSearchUrl, '_blank');
                          } else {
                            alert('No additional text found to search');
                          }
                        } else {
                          alert('Please add additional text to the first system design prompt');
                        }
                      } else {
                        alert('File search only available for first system design prompt with additional text');
                      }
                    }}>
                        📁 Files
                    </button>
                    
                    {/* Reset button to start over */}
                    <button style={{color:'orange', margin:'3px', fontSize:'12px'}} onClick={() => {
                      setSysDesignCounter('none');
                      setFileContent('');
                      console.log('Reset system design counter');
                    }}>
                        Reset
                    </button>
                    
                    {/* Debug info */}
                    <div style={{color:'gray', fontSize:'10px', marginTop:'5px'}}>
                      Type: {selectedSystemDesign}<br/>
                      Counter: {sysDesignCounter}<br/>
                      Total: {selectedSystemDesign == 'FE' ? FESystemDesignPrompts.length : systemDesignPrompts.length}
                    </div>
                </div>
                <div>---RelevantFiles:----</div>
                <div>
                  <input type="text"  style={{ color: 'black' }} value={fileSearch} placeholder="Search..." onChange={(e)=>{setFileSearch(e.target.value)}} />
                  <button onClick={()=>{
                    // REDIRECTION: Fetches relevant files from system design path
                    fetchRelevantFiles(fileSearch);
                  }}>Search</button>
                </div>
                <div>
                  {relevantFiles && relevantFiles.matchingFolders && (<div>Folders:</div>)}
                  {relevantFiles && relevantFiles.matchingFolders && relevantFiles.matchingFolders.map((file : string, index: number) => {
                    //console.log("file-->",file)
                    return (
                      <div key={index}>
                        <button  style={{textAlign:'left'}} onClick={()=>{
                          console.log("\n\n\nCLicked on file-->",file)
                          // REDIRECTION: Makes API call to /open endpoint to open file
                          axios.get(`/open?path=${sysDesignPath}${sysDesignFolder}${file}`)
                        }}>{`->${file}`}</button>
                        <br />
                      </div>
                    );
                  })}
                  <div>------</div>
                  {relevantFiles && relevantFiles.matchingFiles && (<div>Files:</div>)}
                  {relevantFiles && relevantFiles.matchingFiles && relevantFiles.matchingFiles.map((file : string, index: number) => {
                    //console.log("file-->",file)
                    return (
                      <div key={index}>
                        <button style={{textAlign:'left'}}  onClick={()=>{
                          console.log("\n\n\nCLicked on file-->",file)
                          // REDIRECTION: Makes API call to /open endpoint to open file
                          axios.get(`/open?path=${sysDesignPath}${sysDesignFolder}${file}`)
                        }}>{file}</button>
                        <br />
                      </div>
                    );
                  })}
                </div>

              </Collapsible>

              <div>---------</div>

              <Collapsible trigger={(<div style={{color:'yellow'}}>{`Transcripts -->`}</div>)}>
                  <div>
                      <KeypressDetector onPress={(keys: string)=>{
                            console.log("\n\n\n\nPressedKEyssss-->",keys)
                          }}/>
                      <SpeechRecognitionComponent socket={socket} selfSocket={selfSocket} handleSpeechResult={handleSpeechResult} onPressKey={( result: string) => {
                        console.log("🚀 ~ file: home.tsx:882 ~ result:", result)
                        setFileContent(result);
                      }}/>
                      {/* <MsgCopy/> */}
                  </div>

              </Collapsible>
            </div>
            <Promptbar />
          </div>
        </main>
      )}
    </HomeContext.Provider>
  );
};
export default (Home);

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  let serverSidePluginKeysSet = false;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      serverSidePluginKeysSet,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};