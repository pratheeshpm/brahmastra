import { useEffect } from 'react';
import io from 'socket.io-client';

// Enhanced Socket.IO client configuration for long-duration connections (1-2 hours)
// Ensure we have a proper URL - default to current origin in browser, localhost in Node.js
const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment - use current origin
    return window.location.origin;
  } else {
    // Node.js environment - use localhost
    return 'http://localhost:3000';
  }
};

const socket = io(getSocketUrl(), {
  // Connection timeout and keep-alive settings
  timeout: 45000,           // 45 seconds - connection timeout
  autoConnect: true,        // Automatically connect on creation
  reconnection: true,       // Enable automatic reconnection
  reconnectionAttempts: 10, // Number of reconnection attempts
  reconnectionDelay: 1000,  // Initial delay between reconnection attempts (1 second)
  reconnectionDelayMax: 10000, // Maximum delay between reconnection attempts (10 seconds)
  randomizationFactor: 0.5, // Randomization factor for reconnection delay
  
  // Transport settings for better connection stability
  transports: ['websocket', 'polling'], // Use both WebSocket and polling as fallback
  upgrade: true,            // Allow transport upgrades
  rememberUpgrade: true,    // Remember the transport upgrade
  
  // Additional settings for reliability
  forceNew: false,          // Reuse existing connection if available
  multiplex: true,          // Allow multiplexing
});

// Add connection event listeners for debugging and monitoring
socket.on('connect', () => {
  console.log('🔌 Socket.IO connected:', socket.id);
  console.log('🔌 Transport:', socket.io.engine.transport.name);
  console.log('🔌 Connected to:', getSocketUrl());
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket.IO disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Server forcefully disconnected, need to reconnect manually
    console.log('🔌 Server disconnect detected, reconnecting...');
    socket.connect();
  }
});

socket.on('connect_error', (error) => {
  console.error('🔌 Socket.IO connection error:', error);
  console.error('🔌 Attempted to connect to:', getSocketUrl());
  
  // If we're getting undefined hostname errors, log the issue for debugging
  if (error.message && error.message.includes('undefined')) {
    console.log('🔌 Detected undefined hostname error - this indicates a URL resolution issue');
    console.log('🔌 Please ensure the application is running in a proper browser environment');
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('🔌 Socket.IO reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔌 Socket.IO reconnection attempt:', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.error('🔌 Socket.IO reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.error('🔌 Socket.IO reconnection failed after maximum attempts');
});

// Monitor transport upgrades
socket.io.engine.on('upgrade', () => {
  console.log('🔌 Transport upgraded to:', socket.io.engine.transport.name);
});

export default function useSocket(eventName: string, cb: (...args: any[]) => void) {
  useEffect(() => {
    // Add debugging for screenshot_taken events specifically
    if (eventName === 'screenshot_taken') {
      console.log('🔍 useSocket: Setting up listener for screenshot_taken on socket:', socket.id);
    }
    
    socket.on(eventName, cb);

    return function useSocketCleanup() {
      socket.off(eventName, cb);
    };
  }, [eventName, cb]);

  return socket;
}
