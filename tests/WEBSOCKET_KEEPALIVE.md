# WebSocket Keep-Alive Configuration

## Overview

This project has been enhanced with comprehensive WebSocket keep-alive settings to maintain stable connections for 1-2 hours, ensuring reliable screenshot functionality and real-time communication.

## Server Configuration (server.js)

### Socket.IO Server Settings

```javascript
global.io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  // Enhanced keep-alive settings for 1-2 hour sessions
  pingTimeout: 7200000,     // 2 hours (how long to wait for pong response)
  pingInterval: 60000,      // 1 minute (how often to send ping packets)
  upgradeTimeout: 30000,    // 30 seconds (timeout for upgrade process)
  allowEIO3: true,          // Engine.IO v3 compatibility
  transports: ['websocket', 'polling'], // Fallback support
  connectTimeout: 45000,    // 45 seconds (initial connection timeout)
  maxHttpBufferSize: 1e8,   // 100MB (for large screenshot data)
})
```

### Connection Monitoring

- **Session Tracking**: Each connection is tracked with connect time, last activity, and client information
- **Activity Updates**: All socket events update the last activity timestamp
- **Long Session Logging**: Sessions longer than 10 minutes log status every 5 minutes
- **Disconnect Analysis**: Logs session duration and disconnect reason

## Client Configuration

### useSocket Hook (hooks/useSocket.ts)

```javascript
const socket = io({
  timeout: 45000,           // Connection timeout
  autoConnect: true,        // Auto-connect on creation
  reconnection: true,       // Enable auto-reconnection
  reconnectionAttempts: 10, // Max reconnection attempts
  reconnectionDelay: 1000,  // Initial delay between attempts
  reconnectionDelayMax: 10000, // Max delay between attempts
  transports: ['websocket', 'polling'], // Transport fallback
  upgrade: true,            // Allow transport upgrades
  rememberUpgrade: true,    // Remember successful upgrades
})
```

### Connection Event Monitoring

The client automatically logs:
- Connection status and transport type
- Disconnection reasons
- Reconnection attempts and successes
- Connection errors
- Transport upgrades

## Features

### 1. **Extended Session Duration**
- **Ping Timeout**: 2 hours before considering connection dead
- **Ping Interval**: Heartbeat every minute to maintain connection
- **Auto-Reconnection**: Up to 10 attempts with progressive backoff

### 2. **Connection Resilience**
- **Transport Fallback**: WebSocket with polling fallback
- **Upgrade Support**: Automatic upgrade to better transports
- **Error Recovery**: Comprehensive error handling and recovery

### 3. **Monitoring & Debugging**
- **Session Tracking**: Detailed connection analytics
- **Debug Endpoint**: `/api/debug/websocket` for real-time status
- **Activity Logging**: Track user activity and connection health

### 4. **Screenshot Optimization**
- **Large Buffer Size**: 100MB buffer for screenshot data
- **Connection Validation**: Ensures connection before screenshot processing
- **Error Handling**: Graceful degradation on connection issues

## Usage

### Testing Keep-Alive Functionality

1. **Run the Test Script**:
   ```bash
   node test-websocket-keepalive.js
   ```

2. **Monitor Connection Status**:
   - Visit `http://localhost:3000/api/debug/websocket`
   - Check browser console for connection logs
   - Monitor server logs for session status

3. **Screenshot Testing**:
   - Use Ctrl+S to trigger screenshots
   - Monitor WebSocket events in browser console
   - Check for `🔍 Screenshot taken event received` logs

### Debug Commands

- **WebSocket Status**: `GET /api/debug/websocket`
- **Screenshot Trigger**: `POST /api/screenshot`
- **Manual Test**: Type `screenshot` in server console

## Connection Lifecycle

### 1. **Initial Connection**
```
🔌 New connection attempt from: http://localhost:3000
🔌 Socket.IO connected: ABC123
🔌 Transport: websocket
```

### 2. **Activity Monitoring**
```
📊 Long session status - ID: ABC123, Duration: 25 min, Last activity: 30s ago
```

### 3. **Graceful Disconnect**
```
🔌 Client disconnected: ABC123
🔌 Disconnect reason: transport close
🔌 Session duration: 1847 seconds
```

## Troubleshooting

### Common Issues

1. **Connection Drops**:
   - Check network stability
   - Monitor browser console for errors
   - Use debug endpoint to verify server status

2. **Screenshot Not Working**:
   - Ensure WebSocket connection is active
   - Check model supports images
   - Verify conversation is selected

3. **Long Session Timeouts**:
   - Monitor ping/pong logs
   - Check for server memory issues
   - Verify keep-alive settings

### Debug Checklist

- [ ] WebSocket connection established
- [ ] Transport type (prefer websocket over polling)
- [ ] No connection errors in console
- [ ] Screenshot data received via WebSocket
- [ ] Model supports image analysis
- [ ] Conversation selected in UI

## Performance Considerations

### Server-Side
- Connection tracking uses minimal memory
- Session cleanup on disconnect
- Periodic status logging for long sessions

### Client-Side
- Single socket instance per app
- Automatic reconnection with backoff
- Transport optimization for performance

## Future Enhancements

1. **Connection Pooling**: Multiple socket instances for high load
2. **Custom Ping Messages**: Application-level heartbeat
3. **Session Persistence**: Resume sessions across page reloads
4. **Adaptive Timeouts**: Dynamic timeout adjustment based on usage

## Configuration Summary

| Setting | Server Value | Client Value | Purpose |
|---------|-------------|--------------|---------|
| Ping Timeout | 2 hours | N/A | Server waits for pong |
| Ping Interval | 1 minute | N/A | Server sends ping |
| Connection Timeout | 45 seconds | 45 seconds | Initial connection |
| Reconnection Attempts | N/A | 10 | Max reconnect tries |
| Buffer Size | 100MB | N/A | Large data support |
| Transports | ws, polling | ws, polling | Fallback support |

This configuration ensures stable WebSocket connections for extended periods while maintaining reliability and providing comprehensive monitoring capabilities. 