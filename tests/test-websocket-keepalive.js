#!/usr/bin/env node

/**
 * WebSocket Keep-Alive Test Script
 * Tests the longevity and stability of Socket.IO connections
 * Run this script to verify 1-2 hour connection stability
 */

const io = require('socket.io-client');
const chalk = require('chalk');

const SERVER_URL = 'http://localhost:3000';
const TEST_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const STATUS_INTERVAL = 5 * 60 * 1000; // Report status every 5 minutes

console.log(chalk.blue('🧪 WebSocket Keep-Alive Test Started'));
console.log(chalk.gray(`Server: ${SERVER_URL}`));
console.log(chalk.gray(`Test duration: ${TEST_DURATION / 1000 / 60} minutes`));
console.log(chalk.gray('=' * 50));

// Create socket with enhanced keep-alive settings
const socket = io(SERVER_URL, {
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

// Test statistics
let stats = {
  startTime: Date.now(),
  connectCount: 0,
  disconnectCount: 0,
  reconnectCount: 0,
  errorCount: 0,
  messagesReceived: 0,
  messagesSent: 0,
  lastActivity: Date.now(),
  transportUpgrades: 0
};

// Connection event handlers
socket.on('connect', () => {
  stats.connectCount++;
  stats.lastActivity = Date.now();
  console.log(chalk.green(`✅ Connected: ${socket.id}`));
  console.log(chalk.gray(`   Transport: ${socket.io.engine.transport.name}`));
  console.log(chalk.gray(`   Connect count: ${stats.connectCount}`));
});

socket.on('disconnect', (reason) => {
  stats.disconnectCount++;
  console.log(chalk.yellow(`🔌 Disconnected: ${reason}`));
  console.log(chalk.gray(`   Disconnect count: ${stats.disconnectCount}`));
});

socket.on('connect_error', (error) => {
  stats.errorCount++;
  console.log(chalk.red(`❌ Connection error: ${error.message}`));
  console.log(chalk.gray(`   Error count: ${stats.errorCount}`));
});

socket.on('reconnect', (attemptNumber) => {
  stats.reconnectCount++;
  stats.lastActivity = Date.now();
  console.log(chalk.cyan(`🔄 Reconnected after ${attemptNumber} attempts`));
  console.log(chalk.gray(`   Reconnect count: ${stats.reconnectCount}`));
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(chalk.gray(`🔄 Reconnection attempt: ${attemptNumber}`));
});

socket.on('reconnect_error', (error) => {
  console.log(chalk.red(`❌ Reconnection error: ${error.message}`));
});

socket.on('reconnect_failed', () => {
  console.log(chalk.red('❌ Reconnection failed after maximum attempts'));
});

// Monitor transport upgrades
socket.io.engine.on('upgrade', () => {
  stats.transportUpgrades++;
  console.log(chalk.magenta(`🚀 Transport upgraded to: ${socket.io.engine.transport.name}`));
});

// Listen for debug test events
socket.on('debug_test', (data) => {
  stats.messagesReceived++;
  stats.lastActivity = Date.now();
  console.log(chalk.blue(`📨 Debug test message received: ${data.message}`));
  console.log(chalk.gray(`   Connected clients: ${data.clientsCount}`));
});

// Function to print detailed status
function printStatus() {
  const runtime = Date.now() - stats.startTime;
  const runtimeMinutes = Math.floor(runtime / 60000);
  const timeSinceActivity = Date.now() - stats.lastActivity;
  
  console.log(chalk.yellow('\n📊 CONNECTION STATUS'));
  console.log(chalk.gray('=' * 30));
  console.log(`Runtime: ${runtimeMinutes} minutes`);
  console.log(`Socket ID: ${socket.id || 'Not connected'}`);
  console.log(`Transport: ${socket.connected ? socket.io.engine.transport.name : 'Not connected'}`);
  console.log(`Connected: ${socket.connected ? 'Yes' : 'No'}`);
  console.log(`Last activity: ${Math.floor(timeSinceActivity / 1000)}s ago`);
  console.log(`\nStatistics:`);
  console.log(`  Connects: ${stats.connectCount}`);
  console.log(`  Disconnects: ${stats.disconnectCount}`);
  console.log(`  Reconnects: ${stats.reconnectCount}`);
  console.log(`  Errors: ${stats.errorCount}`);
  console.log(`  Messages received: ${stats.messagesReceived}`);
  console.log(`  Messages sent: ${stats.messagesSent}`);
  console.log(`  Transport upgrades: ${stats.transportUpgrades}`);
  console.log(chalk.gray('=' * 30 + '\n'));
}

// Send periodic keep-alive messages
function sendKeepAlive() {
  if (socket.connected) {
    const message = `Keep-alive from test client at ${new Date().toISOString()}`;
    socket.emit('message', message);
    stats.messagesSent++;
    stats.lastActivity = Date.now();
    console.log(chalk.blue(`📤 Sent keep-alive message #${stats.messagesSent}`));
  }
}

// Set up periodic status reporting
const statusInterval = setInterval(printStatus, STATUS_INTERVAL);

// Send keep-alive message every 2 minutes
const keepAliveInterval = setInterval(sendKeepAlive, 2 * 60 * 1000);

// Test WebSocket debug endpoint every 10 minutes
const debugTestInterval = setInterval(async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/debug/websocket`);
    const data = await response.json();
    console.log(chalk.green(`🔍 Debug endpoint test successful`));
    console.log(chalk.gray(`   Server uptime: ${Math.floor(data.serverUptime / 60)} minutes`));
    console.log(chalk.gray(`   Active sessions: ${data.sessions?.length || 0}`));
  } catch (error) {
    console.log(chalk.red(`❌ Debug endpoint test failed: ${error.message}`));
  }
}, 10 * 60 * 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Shutting down test...'));
  clearInterval(statusInterval);
  clearInterval(keepAliveInterval);
  clearInterval(debugTestInterval);
  
  printStatus();
  
  socket.disconnect();
  console.log(chalk.blue('🧪 WebSocket Keep-Alive Test Completed'));
  process.exit(0);
});

// Auto-shutdown after test duration
setTimeout(() => {
  console.log(chalk.green(`\n✅ Test completed successfully after ${TEST_DURATION / 1000 / 60} minutes`));
  process.kill(process.pid, 'SIGINT');
}, TEST_DURATION);

console.log(chalk.blue('🚀 Test running... Press Ctrl+C to stop early\n')); 