#!/usr/bin/env node

/**
 * WebSocket Connection Diagnostic Script
 * Helps identify and debug WebSocket connection issues
 */

const chalk = require('chalk');

console.log(chalk.blue('🔍 WebSocket Connection Diagnostics'));
console.log(chalk.gray('=' * 50));

// Test environment setup
console.log(chalk.yellow('\n📋 Environment Check:'));
console.log(`- Node.js version: ${process.version}`);
console.log(`- Platform: ${process.platform}`);
console.log(`- Current working directory: ${process.cwd()}`);

// Test hostname resolution
console.log(chalk.yellow('\n🌐 Hostname Resolution Test:'));

const testHostnames = [
  'localhost',
  '127.0.0.1',
  'undefined' // This should fail
];

const dns = require('dns');
const util = require('util');
const lookup = util.promisify(dns.lookup);

async function testHostname(hostname) {
  try {
    const result = await lookup(hostname);
    console.log(chalk.green(`✅ ${hostname} -> ${result.address} (${result.family})`));
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ ${hostname} -> Error: ${error.message}`));
    return false;
  }
}

async function runDiagnostics() {
  console.log('\nTesting hostname resolution:');
  for (const hostname of testHostnames) {
    await testHostname(hostname);
  }

  // Test Socket.IO client creation with different URLs
  console.log(chalk.yellow('\n🔌 Socket.IO Client Test:'));
  
  const testUrls = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    undefined, // This should cause the undefined hostname error
    ''
  ];

  for (const url of testUrls) {
    try {
      console.log(`\nTesting URL: ${url || 'undefined'}`);
      
      // Dynamic import to avoid module loading issues
      const io = require('socket.io-client');
      
      if (url === undefined) {
        console.log(chalk.red('⚠️  Creating socket without URL (this may cause undefined hostname)'));
        // This is likely the source of the undefined hostname error
        const socket = io();
        socket.disconnect();
      } else {
        const socket = io(url, {
          autoConnect: false,
          timeout: 5000
        });
        console.log(chalk.green(`✅ Socket created successfully for: ${url}`));
        socket.disconnect();
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error creating socket for ${url}: ${error.message}`));
    }
  }

  // Check running processes
  console.log(chalk.yellow('\n🔍 Process Check:'));
  const { exec } = require('child_process');
  
  exec('ps aux | grep -E "(node|websocket|socket.io)" | grep -v grep', (error, stdout, stderr) => {
    if (stdout) {
      console.log('Running Node.js/WebSocket processes:');
      console.log(stdout);
    } else {
      console.log('No relevant processes found');
    }
  });

  // Check for open ports
  exec('lsof -i -P -n | grep LISTEN | grep -E "(3000|8080|8081|8082)"', (error, stdout, stderr) => {
    if (stdout) {
      console.log('\nOpen ports on common WebSocket ports:');
      console.log(stdout);
    } else {
      console.log('\nNo processes listening on common WebSocket ports');
    }
  });

  console.log(chalk.blue('\n🎯 Recommendations:'));
  console.log('1. Check if any Socket.IO clients are created without explicit URLs');
  console.log('2. Ensure all WebSocket connections specify proper hostnames');
  console.log('3. Review components that use Socket.IO client connections');
  console.log('4. Check if test scripts or background processes are running');
  console.log('5. Verify environment variables are properly set');
}

runDiagnostics().catch(console.error); 