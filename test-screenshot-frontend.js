const io = require('socket.io-client');

console.log('🔍 Frontend Screenshot Processing Test');
console.log('Connecting to server...');

// Create socket connection like the frontend
const socket = io('http://localhost:3000', {
  timeout: 45000,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  randomizationFactor: 0.5,
  transports: ['websocket', 'polling'],
  upgrade: true,
  rememberUpgrade: true,
  forceNew: false,
  multiplex: true,
});

// Simulate the frontend processing
socket.on('connect', () => {
  console.log('✅ Connected to server');
  console.log('🔌 Socket ID:', socket.id);
  
  // Trigger a screenshot
  console.log('\n📸 Triggering screenshot...');
  fetch('http://localhost:3000/api/screenshot')
    .then(response => response.json())
    .then(data => {
      console.log('✅ Screenshot API response:', data);
    })
    .catch(error => {
      console.error('❌ Screenshot API error:', error);
    });
});

// Listen for screenshot_taken event (like useSocket does)
socket.on('screenshot_taken', (data) => {
  console.log('\n🎉 SCREENSHOT_TAKEN EVENT RECEIVED!');
  console.log('📋 Event data summary:', {
    type: data.type,
    timestamp: data.timestamp,
    hasImageData: !!data.imageData,
    promptLength: data.prompt?.length,
    promptPreview: data.prompt?.substring(0, 100) + '...'
  });
  
  // Simulate the frontend processing (like what happens in home.tsx)
  if (data && data.imageData && data.prompt) {
    console.log('✅ Valid screenshot data received');
    console.log('🔍 Simulating frontend processing...');
    
    // Simulate storing in window object
    const simulatedWindow = {};
    simulatedWindow.screenshotData = data;
    simulatedWindow.screenshotDataReady = true;
    
    console.log('📦 Screenshot data stored in simulated window object');
    console.log('🎯 Prompt would be set to:', data.prompt.substring(0, 50) + '...');
    
    // Simulate what ChatInput would do
    console.log('⚡ ChatInput would now:');
    console.log('  1. Detect prompt change and screenshot data');
    console.log('  2. Convert base64 to File object');
    console.log('  3. Set selectedImages and imagePreviewUrls');
    console.log('  4. Auto-trigger message send with image + prompt');
    
    console.log('\n✅ Frontend screenshot processing simulation complete!');
    
  } else {
    console.error('❌ Invalid screenshot data received');
  }
  
  // Close connection
  setTimeout(() => {
    console.log('\n🔌 Closing connection...');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
  process.exit(1);
});

// Timeout if no event received
setTimeout(() => {
  console.error('❌ Test timeout - no screenshot event received');
  socket.disconnect();
  process.exit(1);
}, 15000); 