#!/usr/bin/env node

/**
 * Test Multiple Screenshot Processing
 * Tests that multiple screenshots can be taken and processed without state conflicts
 */

const { spawn } = require('child_process');

console.log('🧪 Testing Multiple Screenshot Processing');
console.log('This will simulate taking 3 screenshots with delays to test state cleanup');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeTestScreenshot(number) {
  console.log(`\n📸 Taking test screenshot ${number}...`);
  
  try {
    const response = await fetch('http://localhost:3000/api/screenshot');
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Screenshot ${number} taken successfully`);
    } else {
      console.log(`❌ Screenshot ${number} failed:`, result.error);
    }
  } catch (error) {
    console.log(`❌ Screenshot ${number} error:`, error.message);
  }
}

async function runTest() {
  console.log('\n🔄 Starting test sequence...');
  
  // Take first screenshot
  await takeTestScreenshot(1);
  
  // Wait for processing
  console.log('⏳ Waiting 5 seconds for processing...');
  await delay(5000);
  
  // Take second screenshot
  await takeTestScreenshot(2);
  
  // Wait for processing
  console.log('⏳ Waiting 5 seconds for processing...');
  await delay(5000);
  
  // Take third screenshot
  await takeTestScreenshot(3);
  
  console.log('\n🎯 Test completed! Check browser console for detailed logs.');
  console.log('Expected behavior: All 3 screenshots should process successfully');
  console.log('If any fail, it indicates state cleanup issues.');
}

// Check if server is running
fetch('http://localhost:3000/api/debug/websocket')
  .then(response => response.json())
  .then(data => {
    console.log(`✅ Server is running with ${data.connectedClients} connected clients`);
    runTest();
  })
  .catch(error => {
    console.log('❌ Server not running. Please start the development server first.');
    console.log('Run: npm run dev or node server.js');
  }); 