const app = require('express')()
const server = require('http').Server(app)
const path = require('path');
const { exec, execFile } = require('child_process');
const os = require('os');

var stringSimilarity = require('./stringSimilarity');
global.io = require('socket.io')(server,{
  cors: {
    origin: '*', // Replace with the appropriate origin URL
    methods: ['GET', 'POST'],
  },
})
const cors = require('cors');
const next = require('next');
const { Noto_Sans_Samaritan } = require('next/font/google');

const keySender = require('node-key-sender');
const readline = require('readline');
var fs = require('fs');
const filePath = 'transcript_' + Date.now() + '.txt';
    // Create the prompt that will be sent to the chat
    const screenshotPrompt = `📸 Screenshot Analysis Request
Please analyze this screenshot and you would see a coding question in that:
 1. please give the most optimized solution code in javascript with proper comments and explanation and should include all edge cases and corner cases handled.
 2. Optimal Technique and its brief explanation with a sample data example flowing thru the code [E.g., "Sliding Window with Hash Map ..."]
 3. Time Complexity: O(?) + Detailed reasoning (step-by-step breakdown).
 4. Space Complexity: O(?) + Memory usage explanation.
 5. Key Insight: The critical observation enabling optimization and edge cases handled (e.g., "Sorting eliminates nested loops").
If not a coding question, then answer the normal question,
If you dont see any question, predict the next step in the flow of the question,
If not, then extract the text in the main area of the image and give it


[Image data will be included in the chat request]`;

// New prompt for Ctrl+O - Code output prediction
const codeOutputPredictionPrompt = `🔍 Code Analysis: Predict the output of this code or identify errors and provide corrections. Include step-by-step execution flow and reasoning.`;

// Screenshot functionality with global keyboard detection
let GlobalKeyboardListener;
try {
  const { GlobalKeyboardListener: GKL } = require("node-global-key-listener");
  GlobalKeyboardListener = GKL;
  console.log('✅ Global keyboard listener loaded successfully');
} catch (error) {
  console.log('❌ Global keyboard listener not available:', error.message);
}

// Add clipboard functionality
const clipboardy = require('clipboardy');

// Function to send clipboard content to chat
const sendClipboardToChat = async () => {
  try {
    const clipboardContent = clipboardy.readSync() || '';
    if (clipboardContent.trim() === '') {
      console.log('📋 Clipboard is empty, nothing to send');
      return;
    }
    
    console.log('📋 Sending clipboard content to chat:', clipboardContent.substring(0, 100) + (clipboardContent.length > 100 ? '...' : ''));
    
    // Send to connected clients via socket
    global.io && global.io.emit('clipboardContent', clipboardContent);
    
    console.log('✅ Clipboard content sent to chat service');
  } catch (error) {
    console.error('❌ Error sending clipboard to chat:', error);
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Screenshot configuration
const SCREENSHOTS_FOLDER = path.join(os.homedir(), 'Downloads', 'brahmastra-screenshots');
let isProcessingScreenshot = false;

// Ensure screenshots folder exists
if (!fs.existsSync(SCREENSHOTS_FOLDER)) {
  fs.mkdirSync(SCREENSHOTS_FOLDER, { recursive: true });
  console.log(`Created screenshots folder: ${SCREENSHOTS_FOLDER}`);
}

// Screenshot functionality
const takeScreenshot = async () => {
  if (isProcessingScreenshot) {
    console.log('Screenshot already in progress, skipping...');
    return;
  }

  isProcessingScreenshot = true;
  console.log('Taking screenshot...');

  try {
    const timestamp = Date.now();
    const screenshotPath = path.join(SCREENSHOTS_FOLDER, `screenshot_${timestamp}.jpg`);
    
    // Take screenshot using macOS screencapture command
    // -x: no sound, -C: capture cursor, -D 1: main display only, -t jpg: JPEG format
    // -r: interactive selection (removed for automation), -T 0: no delay
    const screencaptureCommand = `screencapture -x -C -D 1 -t jpg "${screenshotPath}"`;
    
    exec(screencaptureCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error('Error taking screenshot:', error);
        isProcessingScreenshot = false;
        return;
      }

      console.log('Screenshot saved to:', screenshotPath);

      // Wait a moment for file to be written
      setTimeout(async () => {
        try {
          // Optimize the screenshot for LLM processing
          //const optimizedPath = await optimizeScreenshotForLLM(screenshotPath);
          
          // Read optimized screenshot and convert to base64
          const imageBuffer = fs.readFileSync(screenshotPath); //optimizedPath);
          const base64Image = imageBuffer.toString('base64');
          const dataUrl = `data:image/jpeg;base64,${base64Image}`;

          console.log('Screenshot optimized and converted to base64, sending to OpenRouter...');

          // Send to chat service
          await sendScreenshotToChat(dataUrl,screenshotPath);  // optimizedPath);

        } catch (readError) {
          console.error('Error reading screenshot file:', readError);
        } finally {
          isProcessingScreenshot = false;
        }
      }, 500); // Wait 500ms for file to be fully written
    });

  } catch (error) {
    console.error('Error in screenshot process:', error);
    isProcessingScreenshot = false;
  }
};

// Optimize screenshot for LLM processing
const optimizeScreenshotForLLM = async (originalPath) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const optimizedPath = path.join(SCREENSHOTS_FOLDER, `screenshot_${timestamp}_optimized.jpg`);
    
    // Use sips (built-in macOS tool) to optimize the image
    // -Z: max dimension, -s format: output format, -s formatOptions: JPEG quality
    // Resize to max 1920px width/height and 85% quality for better text readability
    const sipsCommand = `sips -Z 1920 -s format jpeg -s formatOptions 85 "${originalPath}" --out "${optimizedPath}"`;
    
    exec(sipsCommand, (error, stdout, stderr) => {
      if (error) {
        console.log('Image optimization failed, using original:', error.message);
        // If optimization fails, use original
        resolve(originalPath);
      } else {
        console.log('Screenshot optimized for LLM processing');
        console.log(`Original: ${originalPath}`);
        console.log(`Optimized: ${optimizedPath}`);
        
        // Check file sizes
        try {
          const originalStats = fs.statSync(originalPath);
          const optimizedStats = fs.statSync(optimizedPath);
          const reduction = Math.round((1 - optimizedStats.size / originalStats.size) * 100);
          console.log(`Size reduction: ${reduction}% (${Math.round(originalStats.size/1024)}KB → ${Math.round(optimizedStats.size/1024)}KB)`);
        } catch (statError) {
          console.log('Could not read file stats:', statError.message);
        }
        
        resolve(optimizedPath);
      }
    });
  });
};

// Send screenshot data to chat service via socket
const sendScreenshotToChat = async (base64Image, screenshotPath) => {
  try {
    console.log('Sending screenshot to chat service...');


    // Create the message data structure that matches the chat service format
    const chatData = {
      type: 'screenshot_analysis',
      timestamp: Date.now(),
      screenshotPath: screenshotPath,
      prompt: screenshotPrompt,
      imageData: base64Image,
    };

    // Emit to connected clients via socket - this will be picked up by the frontend
    global.io && global.io.emit('screenshot_taken', chatData);

    console.log('Screenshot data sent to chat service via socket');

  } catch (error) {
    console.error('Error sending screenshot to chat:', error);
    global.io && global.io.emit('screenshot_error', {
      error: error.message
    });
  }
};

// New function for Ctrl+O - Code output prediction screenshot
const takeCodeOutputScreenshot = async () => {
  if (isProcessingScreenshot) {
    console.log('Screenshot already in progress, skipping...');
    return;
  }

  isProcessingScreenshot = true;
  console.log('Taking code output prediction screenshot...');

  try {
    const timestamp = Date.now();
    const screenshotPath = path.join(SCREENSHOTS_FOLDER, `code_output_screenshot_${timestamp}.jpg`);
    
    // Take screenshot using macOS screencapture command
    const screencaptureCommand = `screencapture -x -C -D 1 -t jpg "${screenshotPath}"`;
    
    exec(screencaptureCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error('Error taking code output screenshot:', error);
        isProcessingScreenshot = false;
        return;
      }

      console.log('Code output screenshot saved to:', screenshotPath);

      // Wait a moment for file to be written
      setTimeout(async () => {
        try {
          // Read screenshot and convert to base64
          const imageBuffer = fs.readFileSync(screenshotPath);
          const base64Image = imageBuffer.toString('base64');
          const dataUrl = `data:image/jpeg;base64,${base64Image}`;

          console.log('Code output screenshot converted to base64, sending to chat...');

          // Send to chat service with code output prediction prompt
          await sendCodeOutputScreenshotToChat(dataUrl, screenshotPath);

        } catch (readError) {
          console.error('Error reading code output screenshot file:', readError);
        } finally {
          isProcessingScreenshot = false;
        }
      }, 500);
    });

  } catch (error) {
    console.error('Error in code output screenshot process:', error);
    isProcessingScreenshot = false;
  }
};

// Send code output screenshot data to chat service
const sendCodeOutputScreenshotToChat = async (base64Image, screenshotPath) => {
  try {
    console.log('Sending code output screenshot to chat service...');

    // Create the message data structure with code output prediction prompt
    const chatData = {
      type: 'code_output_screenshot',
      timestamp: Date.now(),
      screenshotPath: screenshotPath,
      prompt: codeOutputPredictionPrompt,
      imageData: base64Image,
    };

    // Emit to connected clients via socket - this will be picked up by the frontend
    global.io && global.io.emit('screenshot_taken', chatData);

    console.log('Code output screenshot data sent to chat service via socket');

  } catch (error) {
    console.error('Error sending code output screenshot to chat:', error);
    global.io && global.io.emit('screenshot_error', {
      error: error.message
    });
  }
};

// New function for Ctrl+N - Simulate "Click to Next" functionality
const simulateClickToNext = () => {
  try {
    console.log('🔄 Simulating "Click to Next" functionality...');
    
    // Emit to connected clients via socket - this will be picked up by the frontend
    global.io && global.io.emit('click_to_next_triggered', {
      type: 'click_to_next',
      timestamp: Date.now(),
    });

    console.log('Click to Next event sent to frontend');

  } catch (error) {
    console.error('Error simulating click to next:', error);
  }
};

// Initialize screenshot and clipboard features with global keyboard detection
const initializeGlobalFeatures = () => {
  console.log('Global features initialized. Available triggers:');
  console.log('1. POST /api/screenshot');
  console.log('2. UI button in the frontend');
  console.log('3. Console commands: "screenshot" or "ss"');
  console.log('4. 🔥 GLOBAL Ctrl+S keyboard shortcut (screenshot)');
  console.log('5. 🔥 GLOBAL Ctrl+C keyboard shortcut (send clipboard to chat)');
  console.log('6. 🔥 GLOBAL Ctrl+O keyboard shortcut (code output prediction screenshot)');
  console.log('7. 🔥 GLOBAL Ctrl+N keyboard shortcut (click to next)');
  console.log('8. Note: Cmd+C still works as normal copy (default macOS behavior)');
  
  // Set up true global keyboard detection
  if (GlobalKeyboardListener) {
    startGlobalKeyboardListener();
  } else {
    console.log('📝 Global keyboard detection not available');
  }
};

// Global keyboard listener for Ctrl+S
let keyboardListener;

const startGlobalKeyboardListener = () => {
  try {
    console.log('🎯 Setting up GLOBAL keyboard detection (Ctrl+S, Ctrl+C, Ctrl+O, Ctrl+N)...');
    
    // Create the global keyboard listener
    keyboardListener = new GlobalKeyboardListener({
      mac: {
        onError: (errorCode) => console.error(`❌ macOS error: ${errorCode}`),
      },
      windows: {
        onError: (errorCode) => console.error(`❌ Windows error: ${errorCode}`),
      },
      linux: {
        onError: (errorCode) => console.error(`❌ Linux error: ${errorCode}`),
      }
    });
    
    let comboDetected = false;
    let debugMode = true;
    let keyDetected = false;
    
    // Turn off debug mode after 10 seconds to reduce noise
    setTimeout(() => {
      if (keyDetected) {
        debugMode = false;
        console.log('🔇 Debug mode disabled. Global keyboard detection is working!');
      } else {
        console.log('⚠️  No keyboard events detected after 10 seconds.');
        console.log('   This likely means accessibility permissions are needed.');
      }
    }, 10000);
    
    keyboardListener.addListener((e, down) => {
      if (!keyDetected) {
        keyDetected = true;
        console.log('✅ Keyboard detection is working!');
      }
      
      // Reset the combo detection when keys are released
      if (e.state === 'UP' && (e.name === 'S' || e.name === 'C' || e.name === 'O' || e.name === 'N' || e.name.includes('CTRL') || e.name.includes('META') || e.name.includes('CMD'))) {
        if (comboDetected) {
          if (debugMode) {
            console.log(`🔄 Reset: ${e.name} released`);
          }
          comboDetected = false;
        }
      }
      
      // Detect Ctrl+S combination (screenshot)
      if (e.name === 'S' && e.state === 'DOWN' && !comboDetected) {
        // Check if any Control or Command key is currently pressed
        const isCtrlPressed = down['LEFT CTRL'] || down['RIGHT CTRL'] || down['CTRL'] || down['CONTROL'];
        const isCmdPressed = down['LEFT META'] || down['RIGHT META'] || down['LEFT CMD'] || down['RIGHT CMD'] || down['META'] || down['CMD'];
        
        if (debugMode) {
          console.log(`🎮 S pressed - Ctrl: ${isCtrlPressed}, Cmd: ${isCmdPressed}`);
          console.log(`🎮 Current keys down:`, Object.keys(down).filter(k => down[k]));
        }
        
        if (isCtrlPressed || isCmdPressed) {
          console.log('🚀 GLOBAL Ctrl+S detected! Taking screenshot...');
          console.log(`   Control keys pressed: ${Object.keys(down).filter(k => k.includes('CTRL') || k.includes('META') || k.includes('CMD')).join(', ')}`);
          comboDetected = true;
          takeScreenshot();
        }
      }
      
      // Detect Ctrl+C combination (clipboard to chat) - ONLY Ctrl, NOT Cmd
      if (e.name === 'C' && e.state === 'DOWN' && !comboDetected) {
        // Check ONLY for Control key (not Command key) to preserve default Cmd+C behavior
        const isCtrlPressed = down['LEFT CTRL'] || down['RIGHT CTRL'] || down['CTRL'] || down['CONTROL'];
        
        if (debugMode) {
          console.log(`🎮 C pressed - Ctrl: ${isCtrlPressed}`);
          console.log(`🎮 Current keys down:`, Object.keys(down).filter(k => down[k]));
        }
        
        if (isCtrlPressed) {
          console.log('📋 GLOBAL Ctrl+C detected! Sending clipboard to chat...');
          console.log(`   Control keys pressed: ${Object.keys(down).filter(k => k.includes('CTRL')).join(', ')}`);
          comboDetected = true;
          sendClipboardToChat();
        }
      }
      
      // Detect Ctrl+O combination (code output prediction screenshot)
      if (e.name === 'O' && e.state === 'DOWN' && !comboDetected) {
        // Check if any Control or Command key is currently pressed
        const isCtrlPressed = down['LEFT CTRL'] || down['RIGHT CTRL'] || down['CTRL'] || down['CONTROL'];
        const isCmdPressed = down['LEFT META'] || down['RIGHT META'] || down['LEFT CMD'] || down['RIGHT CMD'] || down['META'] || down['CMD'];
        
        if (debugMode) {
          console.log(`🎮 O pressed - Ctrl: ${isCtrlPressed}, Cmd: ${isCmdPressed}`);
          console.log(`🎮 Current keys down:`, Object.keys(down).filter(k => down[k]));
        }
        
        if (isCtrlPressed || isCmdPressed) {
          console.log('🔍 GLOBAL Ctrl+O detected! Taking code output prediction screenshot...');
          console.log(`   Control keys pressed: ${Object.keys(down).filter(k => k.includes('CTRL') || k.includes('META') || k.includes('CMD')).join(', ')}`);
          comboDetected = true;
          takeCodeOutputScreenshot();
        }
      }
      
      // Detect Ctrl+N combination (click to next)
      if (e.name === 'N' && e.state === 'DOWN' && !comboDetected) {
        // Check if any Control or Command key is currently pressed
        const isCtrlPressed = down['LEFT CTRL'] || down['RIGHT CTRL'] || down['CTRL'] || down['CONTROL'];
        const isCmdPressed = down['LEFT META'] || down['RIGHT META'] || down['LEFT CMD'] || down['RIGHT CMD'] || down['META'] || down['CMD'];
        
        if (debugMode) {
          console.log(`🎮 N pressed - Ctrl: ${isCtrlPressed}, Cmd: ${isCmdPressed}`);
          console.log(`🎮 Current keys down:`, Object.keys(down).filter(k => down[k]));
        }
        
        if (isCtrlPressed || isCmdPressed) {
          console.log('🔄 GLOBAL Ctrl+N detected! Simulating click to next...');
          console.log(`   Control keys pressed: ${Object.keys(down).filter(k => k.includes('CTRL') || k.includes('META') || k.includes('CMD')).join(', ')}`);
          comboDetected = true;
          simulateClickToNext();
        }
      }
    });
    
    console.log('✅ Global keyboard listener started successfully!');
    console.log('🔥 Press Ctrl+S ANYWHERE to take a screenshot!');
    console.log('📋 Press Ctrl+C ANYWHERE to send clipboard content to chat!');
    console.log('🔍 Press Ctrl+O ANYWHERE to take code output prediction screenshot!');
    console.log('🔄 Press Ctrl+N ANYWHERE to simulate click to next!');
    console.log('💡 Note: Cmd+C still works as normal copy (default macOS behavior)');
    console.log('⚠️  Note: On macOS, you may need to grant accessibility permissions');
    console.log('   Go to: System Preferences > Security & Privacy > Privacy > Accessibility');
    console.log('   Add Terminal or your IDE to the list');
    console.log('');
    console.log('🧪 Testing: Press any key to verify global detection is working...');
    
  } catch (error) {
    console.error('❌ Error starting global keyboard listener:', error);
    console.log('📝 Falling back to other trigger methods');
    
    if (process.platform === 'darwin') {
      console.log('');
      console.log('🍎 macOS Permission Fix:');
      console.log('   1. Open System Preferences');
      console.log('   2. Go to Security & Privacy > Privacy');
      console.log('   3. Click "Accessibility" in the left sidebar');
      console.log('   4. Click the lock icon and enter your password');
      console.log('   5. Add Terminal (or your terminal app) to the list');
      console.log('   6. Restart this server');
      console.log('');
    }
    
    console.log('🔧 Alternative triggers available:');
    console.log('   - Type "ss" in this terminal');
    console.log('   - Use the UI button');
    console.log('   - Call POST /api/screenshot');
  }
};

// Clean up function
const cleanupGlobalListener = () => {
  if (keyboardListener) {
    try {
      keyboardListener.kill();
      console.log('Global keyboard listener cleaned up');
    } catch (error) {
      console.error('Error cleaning up keyboard listener:', error);
    }
  }
};

const appendToFile = (content) => {
  fs.appendFile(filePath, content, (err) => {
    if (err) throw err;
  });
}
const writeToFile = (content) => {
  // Replace the content of the file
fs.writeFile(filePath, content, 'utf8', (err) => {
  if (err) {
    console.error('Error replacing the content of the file:', err);
  } else {
    console.log('Content of the file successfully replaced.');
  }
});
}

const appendContent = (content) => {
  fs.readFile(filePath, 'utf8', function(err, data) {
    if(!data || err){
      return writeToFile(content)
    }
    let last = data.split('\n');
    let lastLine = last[last.length - 1];
    return appendToFile('\n'+content)
   /*  if(stringSimilarity(content, lastLine) < 0.7){
      return appendToFile('\n'+content + '\n')
    }else{
      return writeToFile(last.slice(0, last.length - 1).join('\n') + '\n' + content)
    } */
  });
}

// Define your combo shortcut keys (e.g., Ctrl+C)
const shortcutKeyCombination = {
  ctrl: true,
  name: 'a'
};

// Listen for user input and trigger keypress event
rl.on('line', (input) => {
  console.log("\n\n\n\n🚀 ~ file: server.js:29 ~ rl.on ~ input:", input)
  if (input) {
    keySender.sendText(input);
    console.log(`\n\n\n\n\nKey sequence "${input}" sent.`);
  }
  if (input === 'shortcut') {
    keySender.sendCombination([keySender.CONTROL, 'c']);
    console.log('\n\n\n\n\nShortcut key combination sent!');
  }
  if (input === 'screenshot' || input === 'ss') {
    console.log('🎯 Manual screenshot trigger via console!');
    takeScreenshot();
  }
  if (input === 'clipboard' || input === 'cb') {
    console.log('📋 Manual clipboard trigger via console!');
    sendClipboardToChat();
  }
  if (input === 'codeoutput' || input === 'co') {
    console.log('🔍 Manual code output screenshot trigger via console!');
    takeCodeOutputScreenshot();
  }
  if (input === 'clicknext' || input === 'cn') {
    console.log('🔄 Manual click to next trigger via console!');
    simulateClickToNext();
  }
  if (input === 'ctrl+s' || input === 'ctrl s') {
    console.log('🎯 Simulating Ctrl+S global shortcut detection!');
    takeScreenshot();
  }
  if (input === 'ctrl+c' || input === 'ctrl c') {
    console.log('📋 Simulating Ctrl+C global shortcut detection!');
    sendClipboardToChat();
  }
  if (input === 'ctrl+o' || input === 'ctrl o') {
    console.log('🔍 Simulating Ctrl+O global shortcut detection!');
    takeCodeOutputScreenshot();
  }
  if (input === 'ctrl+n' || input === 'ctrl n') {
    console.log('🔄 Simulating Ctrl+N global shortcut detection!');
    simulateClickToNext();
  }
  if (input === 'test') {
    console.log('🧪 Run: node test_global_keys.js');
    console.log('   This will test if global keyboard detection works on your system');
  }
});

console.log('🎯 Brahmastra Server Console Commands:');
console.log('- Type "ss" to take a screenshot');
console.log('- Type "cb" to send clipboard content to chat');
console.log('- Type "co" to take code output prediction screenshot');
console.log('- Type "cn" to simulate click to next');
console.log('- Press Ctrl+S globally for screenshot (if permissions granted)');
console.log('- Press Ctrl+C globally for clipboard to chat (if permissions granted)');
console.log('- Press Ctrl+O globally for code output prediction screenshot (if permissions granted)');
console.log('- Press Ctrl+N globally for click to next (if permissions granted)');


app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

let interval;

const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new date. Will be consumed by the client
  socket.emit("FromAPI", response);
};

global.io && global.io.on("connection", (socket) => {
  global.socketIO = socket;
  console.log("New client connected");
  /* if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
   */

  socket.on('filecontent',(result) => {
    console.log("\n🚀 ~ file: server.js:77 ~ socket.on ~ result:", result)
    appendContent(result)
  })

  socket.on('message', (message) => {
    console.log('Received message:', message);
    global.io && global.io.emit('message', message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

function searchKeywordInFolder(keyword, folderPath, project) {
  const matchingFiles = [];
  const matchingFolders = [];

  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const subFolderPath = path.join(folderPath, file);
      const { matchingFiles: subMatchingFiles, matchingFolders: subMatchingFolders } = searchKeywordInFolder(keyword, subFolderPath, project);
      matchingFiles.push(...subMatchingFiles);
      matchingFolders.push(...subMatchingFolders);
      if (isSimilar(file,keyword)) {
        matchingFolders.push(getProperMeta(filePath,project));
      }
    } else if (stat.isFile()) {
      if (isSimilar(file,keyword)) {
        matchingFiles.push(getProperMeta(filePath,project));
      }
    }
  }

  if (folderPath.includes(keyword)) {
    matchingFolders.push(folderPath);
  }

  return { matchingFiles, matchingFolders };
}

function isSimilar(f,k){
  let file = f.toLowerCase()
  let keyword = k.toLowerCase()
  if(file.includes(keyword)){
    return true;
  }
}

function openFile(mostRelevantFile, cb) {
  if(mostRelevantFile){ 
    let filePath = (mostRelevantFile.replace(/ /g, '\\ '));
    exec(`ls ${filePath}`, (error, stdout, stderr) => {
      console.log("\n\n\n🚀 ~ file: findOutQ.js:108 ~ exec ~ error, stdout, stderr:",stdout,"\n\n\n\nOutput: \n",error,stderr)
      if(stdout){
        exec(`cat ${stdout}`, (e, fileContent, stde) => {
          try{  
            eval(fileContent)
          }catch(e){
            console.log("Something is wrong:",e)
          }
        })
        exec(`code ${filePath}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing the shell script: ${error}`);
            cb(error)
            return;
          }
          return cb(null,"opened")
          console.log(`Shell script executed successfully. Output: ${stdout}`);
        });
    
      }
    })
   
  }
}

function getProperMeta(path, project){
  let paths = path.split(project);
  return paths.length == 1 ? paths[0] : paths[1];
}


nextApp.prepare().then(() => {
  app.use(cors({
    origin: '*', // Replace with your allowed origin(s)
    methods: ['GET', 'POST','PUT'], // Specify the allowed HTTP methods
  }));

  // Screenshot API endpoint - must be before the general API handler
  app.post('/api/screenshot', async (req, res) => {
    try {
      console.log('Screenshot API endpoint called');
      await takeScreenshot();
      res.json({ success: true, message: 'Screenshot taken and being processed' });
    } catch (error) {
      console.error('Screenshot API error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Simple GET endpoint for easier triggering
  app.get('/api/screenshot', async (req, res) => {
    try {
      console.log('Screenshot GET endpoint called');
      await takeScreenshot();
      res.json({ success: true, message: 'Screenshot taken and being processed' });
    } catch (error) {
      console.error('Screenshot API error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Clipboard API endpoint
  app.post('/api/clipboard', async (req, res) => {
    try {
      console.log('📋 Clipboard API endpoint called');
      await sendClipboardToChat();
      res.json({ success: true, message: 'Clipboard content sent to chat' });
    } catch (error) {
      console.error('Clipboard API error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Simple GET endpoint for easier triggering
  app.get('/api/clipboard', async (req, res) => {
    try {
      console.log('📋 Clipboard GET endpoint called');
      await sendClipboardToChat();
      res.json({ success: true, message: 'Clipboard content sent to chat' });
    } catch (error) {
      console.error('Clipboard API error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Shortcut simulation endpoint
  app.post('/api/shortcut/ctrl-s', async (req, res) => {
    try {
      console.log('🎯 Ctrl+S shortcut simulation endpoint called');
      await takeScreenshot();
      res.json({ success: true, message: 'Ctrl+S shortcut simulated - screenshot taken' });
    } catch (error) {
      console.error('Shortcut simulation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Clipboard shortcut simulation endpoint
  app.post('/api/shortcut/ctrl-c', async (req, res) => {
    try {
      console.log('📋 Ctrl+C shortcut simulation endpoint called');
      await sendClipboardToChat();
      res.json({ success: true, message: 'Ctrl+C shortcut simulated - clipboard sent to chat' });
    } catch (error) {
      console.error('Shortcut simulation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Code output prediction screenshot API endpoint
  app.post('/api/screenshot/codeoutput', async (req, res) => {
    try {
      console.log('Code output prediction screenshot API endpoint called');
      await takeCodeOutputScreenshot();
      res.json({ success: true, message: 'Code output prediction screenshot taken and being processed' });
    } catch (error) {
      console.error('Code output screenshot API error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Click to next API endpoint
  app.post('/api/click-to-next', async (req, res) => {
    try {
      console.log('Click to next API endpoint called');
      await simulateClickToNext();
      res.json({ success: true, message: 'Click to next triggered' });
    } catch (error) {
      console.error('Click to next API error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Shortcut simulation endpoints
  app.post('/api/shortcut/ctrl-o', async (req, res) => {
    try {
      console.log('🔍 Ctrl+O shortcut simulation endpoint called');
      await takeCodeOutputScreenshot();
      res.json({ success: true, message: 'Ctrl+O shortcut simulated - code output prediction screenshot taken' });
    } catch (error) {
      console.error('Shortcut simulation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/shortcut/ctrl-n', async (req, res) => {
    try {
      console.log('🔄 Ctrl+N shortcut simulation endpoint called');
      await simulateClickToNext();
      res.json({ success: true, message: 'Ctrl+N shortcut simulated - click to next triggered' });
    } catch (error) {
      console.error('Shortcut simulation error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

   // Handle other API routes
   app.all('/api/*', (req, res) => {
    // Forward the request to Next.js API route handler
    return nextHandler(req, res);
  });

  app.get('/match', (req, res) => {
    const keyword = req.query.keyword;
    const folderPath = req.query.folder;
    const project = req.query.project || ' ';
  
    if (!keyword || !folderPath) {
      return res.status(400).json({ error: 'Missing keyword or folderPath' });
    }
  
    
    if (!keyword || !folderPath) {
      return res.status(400).json({ error: 'Missing keyword or folderPath' });
    }

    const { matchingFiles, matchingFolders } = searchKeywordInFolder(keyword, folderPath, project);
    return res.json({ matchingFiles, matchingFolders });
  });

  app.get('/open', (req, res) => {
    const path = req.query.path;
    openFile(path,(err,r)=>{
      return res.status( err ? 500 : 200).json({ message: err? err : "Opened" });
    })
  })

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  });

  // Initialize keyboard listener after server setup
  initializeGlobalFeatures();

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
    console.log('🔥 Global shortcuts enabled:')
    console.log('  📸 Press Ctrl+S ANYWHERE to take a screenshot!')
    console.log('  📋 Press Ctrl+C ANYWHERE to send clipboard to chat!')
    console.log('  🔍 Press Ctrl+O ANYWHERE to take code output prediction screenshot!')
    console.log('  🔄 Press Ctrl+N ANYWHERE to simulate click to next!')
    console.log('  💡 Note: Cmd+C still works as normal copy')
  })

  // Cleanup on process exit
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    cleanupGlobalListener();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    cleanupGlobalListener();
    process.exit(0);
  });
})

