#!/usr/bin/env node

/**
 * Debug WebSocket Events
 * Directly connects to Socket.IO server to test event reception
 */

const io = require('socket.io-client');

console.log('🔍 WebSocket Event Debug Test');
console.log('Connecting to Socket.IO server...');

// Create socket connection exactly like the frontend
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

// Add all the event listeners
socket.on('connect', () => {
  console.log('✅ Connected to Socket.IO server');
  console.log('🔌 Socket ID:', socket.id);
  console.log('🔌 Transport:', socket.io.engine.transport.name);
  
  // Now trigger a screenshot via API
  console.log('\n📸 Triggering screenshot via API...');
  fetch('http://localhost:3000/api/screenshot')
    .then(response => response.json())
    .then(data => {
      console.log('✅ Screenshot API response:', data);
    })
    .catch(error => {
      console.error('❌ Screenshot API error:', error);
    });
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

// Listen for screenshot_taken event
socket.on('screenshot_taken', (data) => {
  console.log('\n🎉 SCREENSHOT_TAKEN EVENT RECEIVED!');
  console.log('📋 Event data:', {
    type: data.type,
    timestamp: data.timestamp,
    promptLength: data.prompt?.length,
    hasImageData: !!data.imageData,
    imageDataLength: data.imageData?.length,
    promptPreview: data.prompt?.substring(0, 100) + '...'
  });
  
  if (data.imageData) {
    console.log('✅ Image data received successfully!');
    console.log('📏 Image data length:', data.imageData.length);
    console.log('🔍 Image data preview:', data.imageData.substring(0, 50) + '...');
  } else {
    console.log('❌ No image data in event!');
  }
  
  // Close after receiving event
  setTimeout(() => {
    console.log('\n✅ Test completed - screenshot event received successfully!');
    socket.disconnect();
    process.exit(0);
  }, 2000);
});

// Listen for screenshot_error event
socket.on('screenshot_error', (data) => {
  console.log('❌ Screenshot error event:', data);
  socket.disconnect();
  process.exit(1);
});

// Listen for debug_test event
socket.on('debug_test', (data) => {
  console.log('🧪 Debug test event received:', data);
});

// Timeout after 10 seconds if no event received
setTimeout(() => {
  console.log('\n⏰ Timeout - no screenshot event received within 10 seconds');
  console.log('❌ This indicates the WebSocket event is not being emitted or received properly');
  socket.disconnect();
  process.exit(1);
}, 10000);

console.log('⏳ Waiting for WebSocket events...'); 