# Design a Chat Application with Real-Time Messaging and Notifications


## 📋 Table of Contents

- [Design a Chat Application with Real-Time Messaging and Notifications](#design-a-chat-application-with-real-time-messaging-and-notifications)
  - [Table of Contents](#table-of-contents)
  - [Clarify the Problem and Requirements](#clarify-the-problem-and-requirements)
    - [Problem Understanding](#problem-understanding)
    - [Functional Requirements](#functional-requirements)
    - [Non-Functional Requirements](#non-functional-requirements)
    - [Key Assumptions](#key-assumptions)
  - [High-Level Architecture](#high-level-architecture)
    - [Global System Architecture](#global-system-architecture)
    - [Real-time Message Flow Architecture](#real-time-message-flow-architecture)
  - [UI/UX and Component Structure](#uiux-and-component-structure)
    - [Frontend Component Architecture](#frontend-component-architecture)
    - [State Management Architecture](#state-management-architecture)
    - [Responsive Design Strategy](#responsive-design-strategy)
  - [Real-Time Sync, Data Modeling & APIs](#real-time-sync-data-modeling-apis)
    - [Message Ordering and Consistency Algorithm](#message-ordering-and-consistency-algorithm)
      - [Vector Clock Implementation](#vector-clock-implementation)
      - [Message Delivery Guarantees](#message-delivery-guarantees)
    - [Real-time Presence Algorithm](#real-time-presence-algorithm)
      - [Presence State Machine](#presence-state-machine)
      - [Presence Synchronization Flow](#presence-synchronization-flow)
    - [Data Models](#data-models)
      - [Message Schema](#message-schema)
      - [Chat Schema](#chat-schema)
    - [WebSocket Protocol Design](#websocket-protocol-design)
      - [Custom Protocol Over WebSocket](#custom-protocol-over-websocket)
  - [TypeScript Interfaces & Component Props](#typescript-interfaces--component-props)
    - [Core Data Interfaces](#core-data-interfaces)
    - [Component Props Interfaces](#component-props-interfaces)
  - [API Reference](#api-reference)
  - [Performance and Scalability](#performance-and-scalability)
    - [Message Sharding Strategy](#message-sharding-strategy)
      - [Horizontal Scaling Architecture](#horizontal-scaling-architecture)
    - [WebSocket Connection Management](#websocket-connection-management)
      - [Connection Pooling and Load Balancing](#connection-pooling-and-load-balancing)
    - [Caching Strategy](#caching-strategy)
      - [Multi-Level Caching Architecture](#multi-level-caching-architecture)
    - [Database Optimization](#database-optimization)
      - [Message Storage Optimization](#message-storage-optimization)
  - [Security and Privacy](#security-and-privacy)
    - [End-to-End Encryption Architecture](#end-to-end-encryption-architecture)
      - [Signal Protocol Implementation](#signal-protocol-implementation)
      - [Message Encryption Flow](#message-encryption-flow)
    - [Authentication and Authorization](#authentication-and-authorization)
      - [Multi-Factor Authentication Flow](#multi-factor-authentication-flow)
    - [Privacy and Data Protection](#privacy-and-data-protection)
      - [Data Minimization Strategy](#data-minimization-strategy)
  - [Testing, Monitoring, and Maintainability](#testing-monitoring-and-maintainability)
    - [Testing Strategy](#testing-strategy)
      - [Real-time System Testing Approach](#real-time-system-testing-approach)
    - [Monitoring and Observability](#monitoring-and-observability)
      - [Real-time Metrics Dashboard](#real-time-metrics-dashboard)
    - [Error Handling and Recovery](#error-handling-and-recovery)
      - [Circuit Breaker Pattern Implementation](#circuit-breaker-pattern-implementation)
  - [Trade-offs, Deep Dives, and Extensions](#trade-offs-deep-dives-and-extensions)
    - [Real-time Protocol Comparison](#real-time-protocol-comparison)
    - [Message Storage Trade-offs](#message-storage-trade-offs)
      - [SQL vs NoSQL for Messages](#sql-vs-nosql-for-messages)
    - [Scaling Challenges and Solutions](#scaling-challenges-and-solutions)
      - [Hot Chat Problem](#hot-chat-problem)
      - [Global Consistency vs Performance](#global-consistency-vs-performance)
    - [Advanced Features](#advanced-features)
      - [AI-Powered Chat Features](#ai-powered-chat-features)
      - [Advanced Presence System](#advanced-presence-system)
    - [Future Extensions](#future-extensions)
      - [Next-Generation Chat Features](#next-generation-chat-features)

---

## Table of Contents
1. [Clarify the Problem and Requirements](#clarify-the-problem-and-requirements)
2. [High-Level Architecture](#high-level-architecture)
3. [UI/UX and Component Structure](#uiux-and-component-structure)
4. [Real-Time Sync, Data Modeling & APIs](#real-time-sync-data-modeling--apis)
5. [Performance and Scalability](#performance-and-scalability)
6. [Security and Privacy](#security-and-privacy)
7. [Testing, Monitoring, and Maintainability](#testing-monitoring-and-maintainability)
8. [Trade-offs, Deep Dives, and Extensions](#trade-offs-deep-dives-and-extensions)

---

## Clarify the Problem and Requirements

[⬆️ Back to Top](#--table-of-contents)

---


### Problem Understanding

[⬆️ Back to Top](#--table-of-contents)

---

Design a real-time chat application supporting instant messaging, group chats, media sharing, and push notifications across multiple devices, similar to WhatsApp, Telegram, or Discord. The system must handle millions of concurrent users with low latency message delivery.

### Functional Requirements

[⬆️ Back to Top](#--table-of-contents)

---

- **Real-time Messaging**: Instant message delivery with typing indicators
- **Group Chats**: Support for channels, private groups, and broadcast lists
- **Media Sharing**: Images, videos, documents, voice messages, location
- **User Presence**: Online/offline status, last seen, active status
- **Message Features**: Reply, forward, delete, edit, reactions, mentions
- **Cross-platform**: Web, mobile apps, desktop with sync across devices
- **Notifications**: Push notifications, in-app notifications, email notifications
- **Search**: Message history search, global search, advanced filters

### Non-Functional Requirements

[⬆️ Back to Top](#--table-of-contents)

---

- **Latency**: <100ms message delivery in same region, <500ms globally
- **Scalability**: 500M+ users, 100B+ messages/day, 50M+ concurrent connections
- **Availability**: 99.95% uptime with graceful degradation
- **Consistency**: Messages delivered in order, no message loss
- **Security**: End-to-end encryption, secure key exchange
- **Performance**: <2s app startup, instant message rendering

### Key Assumptions

[⬆️ Back to Top](#--table-of-contents)

---

- Average message size: 200 bytes, max 64KB
- Peak concurrent users: 50M globally
- Messages per user per day: 50-200
- Group chat average size: 10-50 members, max 100K members
- Media files: Images 1-10MB, videos up to 100MB
- Message retention: 1 year for free users, unlimited for premium

---

## High-Level Architecture

[⬆️ Back to Top](#--table-of-contents)

---


### Global System Architecture

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TB
    subgraph "Client Applications"
        WEB[Web App<br/>React/Vue]
        MOBILE[Mobile Apps<br/>React Native/Flutter]
        DESKTOP[Desktop Apps<br/>Electron]
    end
    
    subgraph "Load Balancing & CDN"
        LB[Global Load Balancer<br/>GeoDNS]
        CDN[CDN<br/>Static Assets & Media]
    end
    
    subgraph "API Gateway Layer"
        API_GATEWAY[API Gateway<br/>GraphQL/REST]
        WS_GATEWAY[WebSocket Gateway<br/>Socket.IO/Raw WS]
        RATE_LIMITER[Rate Limiter<br/>Redis-based]
    end
    
    subgraph "Core Services"
        USER_SERVICE[User Service<br/>Profiles & Auth]
        CHAT_SERVICE[Chat Service<br/>Message Handling]
        NOTIFICATION_SERVICE[Notification Service<br/>Push & In-app]
        MEDIA_SERVICE[Media Service<br/>File Upload/Streaming]
        PRESENCE_SERVICE[Presence Service<br/>Online Status]
    end
    
    subgraph "Real-time Infrastructure"
        MESSAGE_BROKER[Message Broker<br/>Apache Kafka]
        WEBSOCKET_SERVERS[WebSocket Servers<br/>Node.js/Go Clusters]
        REDIS_CLUSTER[Redis Cluster<br/>Session & Cache]
    end
    
    subgraph "Data Layer"
        MESSAGE_DB[Message Database<br/>Cassandra/MongoDB]
        USER_DB[User Database<br/>PostgreSQL]
        MEDIA_STORAGE[Media Storage<br/>S3/GCS]
        SEARCH_ENGINE[Search Engine<br/>Elasticsearch]
    end
    
    WEB --> LB
    MOBILE --> LB
    DESKTOP --> LB
    
    LB --> API_GATEWAY
    LB --> WS_GATEWAY
    
    API_GATEWAY --> RATE_LIMITER
    WS_GATEWAY --> RATE_LIMITER
    
    RATE_LIMITER --> USER_SERVICE
    RATE_LIMITER --> CHAT_SERVICE
    RATE_LIMITER --> NOTIFICATION_SERVICE
    RATE_LIMITER --> MEDIA_SERVICE
    RATE_LIMITER --> PRESENCE_SERVICE
    
    CHAT_SERVICE --> MESSAGE_BROKER
    NOTIFICATION_SERVICE --> MESSAGE_BROKER
    PRESENCE_SERVICE --> MESSAGE_BROKER
    
    MESSAGE_BROKER --> WEBSOCKET_SERVERS
    WEBSOCKET_SERVERS --> REDIS_CLUSTER
    
    USER_SERVICE --> USER_DB
    CHAT_SERVICE --> MESSAGE_DB
    MEDIA_SERVICE --> MEDIA_STORAGE
    CHAT_SERVICE --> SEARCH_ENGINE
    
    CDN --> MEDIA_STORAGE
```

### Real-time Message Flow Architecture

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
sequenceDiagram
    participant U1 as User 1<br/>(Sender)
    participant GW as WebSocket<br/>Gateway
    participant CS as Chat<br/>Service
    participant MB as Message<br/>Broker
    participant DB as Message<br/>Database
    participant NS as Notification<br/>Service
    participant U2 as User 2<br/>(Recipient)
    
    Note over U1,U2: User 1 sends message to User 2
    
    U1->>GW: Send message via WebSocket
    GW->>CS: Process message
    CS->>CS: Validate & enrich message
    CS->>DB: Store message
    DB->>CS: Confirm storage
    CS->>MB: Publish message event
    
    par Real-time delivery
        MB->>GW: Route to active recipients
        GW->>U2: Deliver via WebSocket
        U2->>GW: Send delivery receipt
        GW->>CS: Update delivery status
    and Push notification
        MB->>NS: Trigger notification
        NS->>NS: Check user preferences
        NS->>U2: Send push notification
    end
    
    CS->>U1: Send delivery confirmation
```

---

## UI/UX and Component Structure

[⬆️ Back to Top](#--table-of-contents)

---


### Frontend Component Architecture

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "App Shell"
        APP[App Container]
        ROUTER[Router]
        AUTH[Auth Provider]
        WEBSOCKET[WebSocket Provider]
        THEME[Theme Provider]
    end
    
    subgraph "Layout Components"
        SIDEBAR[Chat Sidebar]
        MAIN_AREA[Main Chat Area]
        HEADER[Chat Header]
        STATUS_BAR[Status Bar]
    end
    
    subgraph "Chat List Components"
        CHAT_LIST[Chat List]
        CHAT_ITEM[Chat Item]
        SEARCH_BAR[Search Bar]
        FILTERS[Chat Filters]
        UNREAD_BADGE[Unread Badge]
    end
    
    subgraph "Message Components"
        MESSAGE_LIST[Message List]
        MESSAGE_BUBBLE[Message Bubble]
        MESSAGE_INPUT[Message Input]
        EMOJI_PICKER[Emoji Picker]
        ATTACHMENT_PICKER[Attachment Picker]
        TYPING_INDICATOR[Typing Indicator]
    end
    
    subgraph "Media Components"
        IMAGE_VIEWER[Image Viewer]
        VIDEO_PLAYER[Video Player]
        AUDIO_PLAYER[Audio Player]
        DOCUMENT_VIEWER[Document Viewer]
        VOICE_RECORDER[Voice Recorder]
    end
    
    subgraph "Real-time Services"
        MESSAGE_SERVICE[Message Service]
        PRESENCE_SERVICE[Presence Service]
        NOTIFICATION_SERVICE[Notification Service]
        MEDIA_SERVICE[Media Service]
        SYNC_SERVICE[Sync Service]
    end
    
    APP --> ROUTER
    APP --> AUTH
    APP --> WEBSOCKET
    APP --> THEME
    
    ROUTER --> SIDEBAR
    ROUTER --> MAIN_AREA
    ROUTER --> HEADER
    ROUTER --> STATUS_BAR
    
    SIDEBAR --> CHAT_LIST
    CHAT_LIST --> CHAT_ITEM
    SIDEBAR --> SEARCH_BAR
    SIDEBAR --> FILTERS
    CHAT_ITEM --> UNREAD_BADGE
    
    MAIN_AREA --> MESSAGE_LIST
    MAIN_AREA --> MESSAGE_INPUT
    MESSAGE_LIST --> MESSAGE_BUBBLE
    MESSAGE_LIST --> TYPING_INDICATOR
    MESSAGE_INPUT --> EMOJI_PICKER
    MESSAGE_INPUT --> ATTACHMENT_PICKER
    
    MESSAGE_BUBBLE --> IMAGE_VIEWER
    MESSAGE_BUBBLE --> VIDEO_PLAYER
    MESSAGE_BUBBLE --> AUDIO_PLAYER
    MESSAGE_BUBBLE --> DOCUMENT_VIEWER
    MESSAGE_INPUT --> VOICE_RECORDER
    
    WEBSOCKET --> MESSAGE_SERVICE
    MESSAGE_SERVICE --> PRESENCE_SERVICE
    MESSAGE_SERVICE --> NOTIFICATION_SERVICE
    MESSAGE_SERVICE --> MEDIA_SERVICE
    MESSAGE_SERVICE --> SYNC_SERVICE
```

#### React Component Implementation

[⬆️ Back to Top](#--table-of-contents)

---

**ChatContainer.jsx**

**What this code does:**
• **Main Purpose**: Real-time chat application with WebSocket messaging
• **State Management**: Manages chats, messages, online users, and typing indicators
• **Key Functions**:
  - `handleNewMessage()` - Processes incoming messages and updates chat list
  - `handlePresenceUpdate()` - Tracks user online/offline status
  - `handleTypingUpdate()` - Shows typing indicators from other users
  - `sendMessage()` - Broadcasts messages via WebSocket
  - WebSocket connection management with automatic reconnection

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChatProvider } from './ChatContext';
import ChatSidebar from './ChatSidebar';
import ChatMainArea from './ChatMainArea';
import ChatHeader from './ChatHeader';
import WebSocketManager from './services/WebSocketManager';

const ChatContainer = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({});
  const wsManager = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsManager.current = new WebSocketManager({
      onMessage: handleNewMessage,
      onPresenceUpdate: handlePresenceUpdate,
      onTyping: handleTypingUpdate,
      onChatUpdate: handleChatUpdate
    });

    return () => {
      wsManager.current?.disconnect();
    };
  }, []);

  const handleNewMessage = (message) => {
    setMessages(prev => ({
      ...prev,
      [message.chatId]: [...(prev[message.chatId] || []), message]
    }));
    
    // Update chat list with latest message
    setChats(prev => prev.map(chat => 
      chat.id === message.chatId 
        ? { ...chat, lastMessage: message, unreadCount: chat.unreadCount + 1 }
        : chat
    ));
  };

  const handlePresenceUpdate = (userId, status) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (status === 'online') {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleTypingUpdate = (chatId, userId, isTyping) => {
    setTypingUsers(prev => ({
      ...prev,
      [chatId]: isTyping 
        ? [...(prev[chatId] || []), userId]
        : (prev[chatId] || []).filter(id => id !== userId)
    }));
  };

  const sendMessage = (content, type = 'text') => {
    if (!activeChat) return;

    const message = {
      id: Date.now().toString(),
      chatId: activeChat.id,
      content,
      type,
      timestamp: new Date().toISOString(),
      senderId: 'current-user'
    };

    wsManager.current?.sendMessage(message);
    handleNewMessage(message);
  };

  return (
    <ChatProvider value={{
      activeChat,
      setActiveChat,
      chats,
      messages: messages[activeChat?.id] || [],
      onlineUsers,
      typingUsers: typingUsers[activeChat?.id] || [],
      sendMessage
    }}>
      <div className="chat-container">
        <ChatSidebar chats={chats} onChatSelect={setActiveChat} />
        <div className="main-area">
          <ChatHeader />
          <ChatMainArea />
        </div>
      </div>
    </ChatProvider>
  );
};

export default ChatContainer;
```

**MessageList.jsx**

**What this code does:**
• **Main Purpose**: Virtualized message list with auto-scroll and date grouping
• **Performance**: Virtual scrolling for large message histories
• **Key Functions**:
  - `scrollToBottom()` - Auto-scrolls to newest messages
  - `groupMessagesByDate()` - Organizes messages by date for display
  - `useVirtualScroll()` - Optimizes rendering for large message lists
  - `isAtBottom` detection - Determines when to auto-scroll
  - Message grouping logic for consecutive messages from same user

```jsx
import React, { useEffect, useRef, useContext } from 'react';
import { ChatContext } from './ChatContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useVirtualScroll } from './hooks/useVirtualScroll';

const MessageList = () => {
  const { messages, typingUsers } = useContext(ChatContext);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  
  const {
    visibleItems,
    scrollToIndex,
    isAtBottom
  } = useVirtualScroll({
    items: messages,
    container: containerRef.current,
    itemHeight: 80
  });

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(visibleItems);

  return (
    <div className="message-list" ref={containerRef}>
      {Object.entries(messageGroups).map(([date, dateMessages]) => (
        <div key={date} className="message-date-group">
          <div className="date-divider">{date}</div>
          {dateMessages.map((message, index) => {
            const prevMessage = dateMessages[index - 1];
            const isGrouped = prevMessage && 
              prevMessage.senderId === message.senderId &&
              (new Date(message.timestamp) - new Date(prevMessage.timestamp)) < 300000;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isGrouped={isGrouped}
              />
            );
          })}
        </div>
      ))}
      
      {typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
```

**MessageInput.jsx**

**What this code does:**
• **Main Purpose**: Chat input with emoji picker, file upload, and voice recording
• **Rich Input**: Multi-line text input with formatting and media support
• **Key Functions**:
  - `handleSubmit()` - Sends text messages and clears input
  - `handleTyping()` - Broadcasts typing indicators with timeout
  - `handleEmojiSelect()` - Inserts emojis at cursor position
  - `handleFileUpload()` - Processes different file types (image, video, document)
  - `sendTypingStatus()` - WebSocket typing events with auto-timeout

```jsx
import React, { useState, useRef, useContext } from 'react';
import { ChatContext } from './ChatContext';
import EmojiPicker from './EmojiPicker';
import AttachmentPicker from './AttachmentPicker';
import VoiceRecorder from './VoiceRecorder';

const MessageInput = () => {
  const { sendMessage, activeChat } = useContext(ChatContext);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
  };

  const handleTyping = () => {
    // Send typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send start typing event
    sendTypingStatus(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 3000);
  };

  const sendTypingStatus = (isTyping) => {
    // WebSocket typing event would be sent here
    console.log('Typing status:', isTyping);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleEmojiSelect = (emoji) => {
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    setMessage(newMessage);
    setShowEmojiPicker(false);
    
    // Restore cursor position
    setTimeout(() => {
      inputRef.current.setSelectionRange(start + emoji.length, start + emoji.length);
      inputRef.current.focus();
    }, 0);
  };

  const handleFileUpload = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        sendMessage(file, 'image');
      } else if (file.type.startsWith('video/')) {
        sendMessage(file, 'video');
      } else {
        sendMessage(file, 'document');
      }
    });
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="input-actions">
          <AttachmentPicker onFileSelect={handleFileUpload} />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="emoji-button"
          >
            😊
          </button>
        </div>
        
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="message-input"
          rows="1"
          disabled={!activeChat}
        />
        
        <div className="send-actions">
          {message.trim() ? (
            <button type="submit" className="send-button">
              Send
            </button>
          ) : (
            <VoiceRecorder
              isRecording={isRecording}
              onStartRecording={() => setIsRecording(true)}
              onStopRecording={(audioBlob) => {
                setIsRecording(false);
                sendMessage(audioBlob, 'audio');
              }}
            />
          )}
        </div>
      </form>
      
      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default MessageInput;
```

**WebSocket Service**
```jsx
**WebSocketManager Service**

**What this code does:**
• **Main Purpose**: WebSocket connection management with reconnection logic
• **Message Routing**: Handles different message types (message, presence, typing)
• **Key Functions**:
  - `connect()` - Establishes WebSocket connection with error handling
  - `handleMessage()` - Routes incoming messages by type to appropriate handlers
  - `sendMessage()` - Sends chat messages through WebSocket
  - `handleReconnect()` - Implements exponential backoff reconnection strategy
  - `sendTypingStatus()` - Broadcasts typing indicators to other users

// services/WebSocketManager.js
class WebSocketManager {
  constructor(options) {
    this.options = options;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.connect();
  }

  connect() {
    try {
      this.ws = new WebSocket('ws://localhost:8080/chat');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'message':
        this.options.onMessage?.(data.payload);
        break;
      case 'presence':
        this.options.onPresenceUpdate?.(data.userId, data.status);
        break;
      case 'typing':
        this.options.onTyping?.(data.chatId, data.userId, data.isTyping);
        break;
      case 'chat_update':
        this.options.onChatUpdate?.(data.payload);
        break;
    }
  }

  sendMessage(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'message',
        payload: message
      }));
    }
  }

  sendTypingStatus(chatId, isTyping) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'typing',
        chatId,
        isTyping
      }));
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    this.ws?.close();
  }
}

export default WebSocketManager;
```

### State Management Architecture

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Global State (Redux/Zustand)"
        USER_STATE[User State<br/>Profile, Settings]
        CHAT_STATE[Chat State<br/>Chat List, Active Chat]
        MESSAGE_STATE[Message State<br/>Messages, Pagination]
        UI_STATE[UI State<br/>Modal, Sidebar, Theme]
        CONNECTION_STATE[Connection State<br/>WebSocket Status]
    end
    
    subgraph "Local Component State"
        INPUT_STATE[Input State<br/>Draft, Typing]
        SCROLL_STATE[Scroll State<br/>Position, Auto-scroll]
        MEDIA_STATE[Media State<br/>Upload Progress]
        SEARCH_STATE[Search State<br/>Query, Results]
    end
    
    subgraph "Persistent Storage"
        INDEXED_DB[IndexedDB<br/>Message Cache]
        LOCAL_STORAGE[LocalStorage<br/>User Preferences]
        SESSION_STORAGE[SessionStorage<br/>Temp Data]
    end
    
    USER_STATE --> LOCAL_STORAGE
    CHAT_STATE --> INDEXED_DB
    MESSAGE_STATE --> INDEXED_DB
    UI_STATE --> LOCAL_STORAGE
    
    INPUT_STATE --> SESSION_STORAGE
    MEDIA_STATE --> SESSION_STORAGE
```

### Responsive Design Strategy

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph LR
    subgraph "Mobile Layout (< 768px)"
        M_STACK[Stacked Layout]
        M_FULL[Full-screen Chat]
        M_OVERLAY[Overlay Sidebar]
        M_TOUCH[Touch Gestures]
    end
    
    subgraph "Tablet Layout (768px - 1024px)"
        T_SPLIT[Split View]
        T_SIDEBAR[Collapsible Sidebar]
        T_HYBRID[Touch + Mouse]
        T_LANDSCAPE[Landscape Optimization]
    end
    
    subgraph "Desktop Layout (> 1024px)"
        D_THREE_PANEL[Three-panel Layout]
        D_PERSISTENT[Persistent Sidebar]
        D_SHORTCUTS[Keyboard Shortcuts]
        D_MULTI_WINDOW[Multi-window Support]
    end
    
    M_STACK --> M_FULL
    M_FULL --> M_OVERLAY
    M_OVERLAY --> M_TOUCH
    
    T_SPLIT --> T_SIDEBAR
    T_SIDEBAR --> T_HYBRID
    T_HYBRID --> T_LANDSCAPE
    
    D_THREE_PANEL --> D_PERSISTENT
    D_PERSISTENT --> D_SHORTCUTS
    D_SHORTCUTS --> D_MULTI_WINDOW
```

---

## Real-Time Sync, Data Modeling & APIs

[⬆️ Back to Top](#--table-of-contents)

---


### Message Ordering and Consistency Algorithm

[⬆️ Back to Top](#--table-of-contents)

---


#### Vector Clock Implementation

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    A["User A sends message<br/>Vector: [A:1, B:0, C:0]"] --> B["User B receives<br/>Updates vector: [A:1, B:0, C:0]"]
    B --> C["User B sends message<br/>Vector: [A:1, B:1, C:0]"]
    C --> D["User C receives both<br/>Vector: [A:1, B:1, C:0]"]
    D --> E["User C sends message<br/>Vector: [A:1, B:1, C:1]"]
    
    F["Concurrent message from A<br/>Vector: [A:2, B:0, C:0]"] --> G["Conflict detection<br/>Compare vectors"]
    G --> H["Apply ordering rules<br/>User ID, timestamp"]
    H --> I["Consistent message order<br/>across all clients"]
    
    style G fill:#ffcccc
    style H fill:#ffffcc
    style I fill:#ccffcc
```

#### Message Delivery Guarantees

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
stateDiagram-v2
    [*] --> Sending
    Sending --> Sent: Client transmits
    Sent --> Delivered: Server receives
    Delivered --> Read: Recipient opens
    
    Sending --> Failed: Network error
    Failed --> Retrying: Auto retry
    Retrying --> Sent: Success
    Retrying --> Failed: Max retries
    
    Delivered --> Expired: TTL exceeded
    Read --> [*]: Complete
    Expired --> [*]: Message deleted
```

### Real-time Presence Algorithm

[⬆️ Back to Top](#--table-of-contents)

---


#### Presence State Machine

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
stateDiagram-v2
    [*] --> Offline
    Offline --> Connecting: User opens app
    Connecting --> Online: WebSocket connected
    Online --> Away: No activity 5min
    Away --> Online: User activity
    Online --> Typing: User types
    Typing --> Online: Stop typing
    Online --> Offline: WebSocket disconnect
    Away --> Offline: Extended inactivity
    
    note right of Online
        Heartbeat every 30s
        Activity tracking
    end note
    
    note right of Typing
        Typing indicator
        Auto-timeout 3s
    end note
```

#### Presence Synchronization Flow

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
sequenceDiagram
    participant U1 as User 1
    participant PS as Presence Service
    participant REDIS as Redis Cache
    participant MB as Message Broker
    participant U2 as User 2
    
    Note over U1,U2: User 1 comes online
    
    U1->>PS: Connect WebSocket
    PS->>REDIS: Set user status: online
    PS->>REDIS: Set last seen: now
    PS->>MB: Publish presence update
    MB->>U2: Broadcast to contacts
    U2->>U2: Update UI: User 1 online
    
    Note over U1,U2: User 1 starts typing
    
    U1->>PS: Typing event
    PS->>REDIS: Set typing status (TTL: 3s)
    PS->>MB: Publish typing event
    MB->>U2: Send typing indicator
    U2->>U2: Show "User 1 is typing..."
    
    Note over U1,U2: Auto-cleanup typing status
    
    REDIS->>REDIS: TTL expires
    REDIS->>PS: Typing status removed
    PS->>MB: Publish stop typing
    MB->>U2: Hide typing indicator
```

### Data Models

[⬆️ Back to Top](#--table-of-contents)

---


#### Message Schema

[⬆️ Back to Top](#--table-of-contents)

---

```
Message {
  id: UUID
  chat_id: UUID
  sender_id: UUID
  content: {
    type: 'text' | 'image' | 'video' | 'audio' | 'document'
    text?: String
    media_url?: String
    metadata?: Object
  }
  timestamp: DateTime
  vector_clock: Map<String, Integer>
  reply_to?: UUID
  edited_at?: DateTime
  reactions: [{
    user_id: UUID
    emoji: String
    timestamp: DateTime
  }]
  delivery_status: [{
    user_id: UUID
    status: 'sent' | 'delivered' | 'read'
    timestamp: DateTime
  }]
}
```

#### Chat Schema

[⬆️ Back to Top](#--table-of-contents)

---

```
Chat {
  id: UUID
  type: 'direct' | 'group' | 'channel'
  participants: [{
    user_id: UUID
    role: 'member' | 'admin' | 'owner'
    joined_at: DateTime
    last_read_message_id?: UUID
  }]
  metadata: {
    name?: String
    description?: String
    avatar_url?: String
    created_by: UUID
    created_at: DateTime
  }
  settings: {
    encryption_enabled: Boolean
    message_retention: Integer
    notifications_enabled: Boolean
  }
}
```

### WebSocket Protocol Design

[⬆️ Back to Top](#--table-of-contents)

---


#### Custom Protocol Over WebSocket

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
sequenceDiagram
    participant C as Client
    participant WS as WebSocket Server
    
    Note over C,WS: Connection Establishment
    C->>WS: CONNECT {user_id, token, device_id}
    WS->>C: CONNECTED {session_id, server_time}
    
    Note over C,WS: Message Flow
    C->>WS: SEND_MESSAGE {chat_id, content, client_msg_id}
    WS->>C: MESSAGE_ACK {client_msg_id, server_msg_id, timestamp}
    WS->>C: MESSAGE_RECEIVED {message_object}
    
    Note over C,WS: Presence Updates
    C->>WS: PRESENCE_UPDATE {status, activity}
    WS->>C: PRESENCE_BROADCAST {user_id, status, timestamp}
    
    Note over C,WS: Heartbeat
    C->>WS: PING {timestamp}
    WS->>C: PONG {timestamp, server_time}
    
    Note over C,WS: Error Handling
    WS->>C: ERROR {code, message, retry_after}
    C->>WS: RETRY {original_message}
```

### TypeScript Interfaces & Component Props

[⬆️ Back to Top](#--table-of-contents)

---

#### Core Data Interfaces

```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: MessageContent;
  timestamp: Date;
  editedAt?: Date;
  replyTo?: string;
  reactions: Reaction[];
  status: 'sending' | 'sent' | 'delivered' | 'read';
  isDeleted: boolean;
}

interface MessageContent {
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  text?: string;
  media?: MediaAttachment;
  location?: GeoLocation;
  mentions?: string[];
}

interface Chat {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name?: string;
  description?: string;
  avatarUrl?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
}

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Date;
  isTyping?: boolean;
}
```

#### Component Props Interfaces

```typescript
interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  onChatCreate: () => void;
  showUnreadOnly?: boolean;
  searchQuery?: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onMessageReply: (message: Message) => void;
  onMessageEdit: (messageId: string, newContent: string) => void;
  onMessageDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  virtualScrolling?: boolean;
}

interface MessageInputProps {
  chatId: string;
  replyingTo?: Message;
  onSendMessage: (content: MessageContent) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  onFileUpload: (files: File[]) => void;
  placeholder?: string;
  maxLength?: number;
}

interface UserPresenceProps {
  users: User[];
  onUserClick?: (userId: string) => void;
  showOnlineOnly?: boolean;
  maxVisible?: number;
}
```

### API Reference

[⬆️ Back to Top](#--table-of-contents)

---

#### Chat Management
- `GET /api/chats` - Get user's chat list with pagination and filtering
- `POST /api/chats` - Create new chat (direct message or group)
- `GET /api/chats/:id` - Get chat details with participant information
- `PUT /api/chats/:id` - Update chat settings (name, description, avatar)
- `DELETE /api/chats/:id` - Delete or leave chat with archive option

#### Message Operations
- `GET /api/chats/:id/messages` - Get chat messages with pagination and search
- `POST /api/chats/:id/messages` - Send new message with media attachments
- `PUT /api/messages/:id` - Edit message content (within edit time limit)
- `DELETE /api/messages/:id` - Delete message for self or all participants
- `POST /api/messages/:id/reactions` - Add or remove emoji reaction

#### Real-time Communication
- `WS /api/chat/connect` - Establish WebSocket connection for real-time messaging
- `WS SEND_MESSAGE` - Send message through WebSocket with delivery confirmation
- `WS TYPING_START/STOP` - Broadcast typing indicators to chat participants
- `WS PRESENCE_UPDATE` - Update and broadcast user online status
- `WS MESSAGE_READ` - Mark messages as read with read receipts

#### Media & File Sharing
- `POST /api/media/upload` - Upload media files with progress tracking
- `GET /api/media/:id` - Download media file with access control
- `POST /api/files/share` - Share files with virus scanning and preview generation
- `GET /api/files/:id/preview` - Get file preview thumbnail or metadata
- `DELETE /api/media/:id` - Delete uploaded media file

#### User & Presence
- `GET /api/users/search` - Search users for adding to chats
- `PUT /api/users/status` - Update user presence status and activity
- `GET /api/users/:id/profile` - Get user profile information
- `POST /api/users/block` - Block or unblock user from messaging
- `GET /api/users/contacts` - Get user's contact list with sync support

#### Group Chat Features
- `POST /api/chats/:id/participants` - Add participants to group chat
- `DELETE /api/chats/:id/participants/:userId` - Remove participant from group
- `PUT /api/chats/:id/participants/:userId/role` - Update participant role/permissions
- `GET /api/chats/:id/invite-link` - Generate invite link for group chat
- `POST /api/chats/:id/pin-message` - Pin important message in group chat

---

## Performance and Scalability

[⬆️ Back to Top](#--table-of-contents)

---


### Message Sharding Strategy

[⬆️ Back to Top](#--table-of-contents)

---


#### Horizontal Scaling Architecture

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TB
    subgraph "Consistent Hashing Ring"
        SHARD1[Shard 1<br/>Hash Range: 0-25%]
        SHARD2[Shard 2<br/>Hash Range: 25-50%]
        SHARD3[Shard 3<br/>Hash Range: 50-75%]
        SHARD4[Shard 4<br/>Hash Range: 75-100%]
    end
    
    subgraph "Chat Distribution"
        CHAT_A[Chat A<br/>Hash: 15%]
        CHAT_B[Chat B<br/>Hash: 35%]
        CHAT_C[Chat C<br/>Hash: 65%]
        CHAT_D[Chat D<br/>Hash: 85%]
    end
    
    subgraph "Database Clusters"
        DB1[Cassandra Cluster 1<br/>Replication Factor: 3]
        DB2[Cassandra Cluster 2<br/>Replication Factor: 3]
        DB3[Cassandra Cluster 3<br/>Replication Factor: 3]
        DB4[Cassandra Cluster 4<br/>Replication Factor: 3]
    end
    
    CHAT_A --> SHARD1
    CHAT_B --> SHARD2
    CHAT_C --> SHARD3
    CHAT_D --> SHARD4
    
    SHARD1 --> DB1
    SHARD2 --> DB2
    SHARD3 --> DB3
    SHARD4 --> DB4
```

### WebSocket Connection Management

[⬆️ Back to Top](#--table-of-contents)

---


#### Connection Pooling and Load Balancing

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Client Connections"
        C1[Client 1]
        C2[Client 2]
        C3[Client 3]
        C4[Client 4]
        CN[Client N]
    end
    
    subgraph "Load Balancer Layer"
        LB[WebSocket Load Balancer<br/>HAProxy/NGINX]
        HEALTH[Health Check<br/>Endpoint]
    end
    
    subgraph "WebSocket Server Pool"
        WS1[WS Server 1<br/>10K connections]
        WS2[WS Server 2<br/>10K connections]
        WS3[WS Server 3<br/>10K connections]
        WS4[WS Server 4<br/>10K connections]
    end
    
    subgraph "Session Management"
        REDIS[Redis Cluster<br/>Session Store]
        SESSION_MAP[User → Server Mapping]
    end
    
    C1 --> LB
    C2 --> LB
    C3 --> LB
    C4 --> LB
    CN --> LB
    
    LB --> HEALTH
    HEALTH --> WS1
    HEALTH --> WS2
    HEALTH --> WS3
    HEALTH --> WS4
    
    LB --> WS1
    LB --> WS2
    LB --> WS3
    LB --> WS4
    
    WS1 --> REDIS
    WS2 --> REDIS
    WS3 --> REDIS
    WS4 --> REDIS
    
    REDIS --> SESSION_MAP
```

### Caching Strategy

[⬆️ Back to Top](#--table-of-contents)

---


#### Multi-Level Caching Architecture

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph LR
    subgraph "Client-Side Cache"
        L1[Browser Cache<br/>Recent Messages<br/>TTL: 1h]
        L2[IndexedDB<br/>Message History<br/>TTL: 7 days]
        L3[Memory Cache<br/>Active Chat<br/>TTL: Session]
    end
    
    subgraph "Server-Side Cache"
        L4[Redis Cache<br/>Hot Chats<br/>TTL: 1h]
        L5[Application Cache<br/>User Sessions<br/>TTL: 30min]
        L6[CDN Cache<br/>Media Files<br/>TTL: 30 days]
    end
    
    subgraph "Database"
        L7[Message Database<br/>Cassandra/MongoDB<br/>Permanent]
        L8[Media Storage<br/>S3/GCS<br/>Permanent]
    end
    
    USER[User Request] --> L1
    L1 -->|Miss| L2
    L2 -->|Miss| L3
    L3 -->|Miss| L4
    L4 -->|Miss| L5
    L5 -->|Miss| L7
    
    MEDIA_REQUEST[Media Request] --> L6
    L6 -->|Miss| L8
```

### Database Optimization

[⬆️ Back to Top](#--table-of-contents)

---


#### Message Storage Optimization

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Time-based Partitioning"
        CURRENT[Current Month<br/>Hot Partition<br/>SSD Storage]
        RECENT[Recent 3 Months<br/>Warm Partition<br/>Hybrid Storage]
        ARCHIVE[Archive 6+ Months<br/>Cold Partition<br/>Object Storage]
    end
    
    subgraph "Query Optimization"
        INDEX1["Primary Key: (chat_id, timestamp)"]
        INDEX2["Secondary Index: sender_id"]
        INDEX3["Search Index: content_text"]
        BLOOM["Bloom Filter: message existence"]
    end
    
    subgraph "Compression Strategy"
        COMPRESS1[Recent: No compression<br/>Fast access]
        COMPRESS2[Warm: Light compression<br/>Balanced performance]
        COMPRESS3[Cold: Heavy compression<br/>Storage optimized]
    end
    
    CURRENT --> INDEX1
    CURRENT --> COMPRESS1
    RECENT --> INDEX2
    RECENT --> COMPRESS2
    ARCHIVE --> INDEX3
    ARCHIVE --> COMPRESS3
    
    INDEX1 --> BLOOM
    INDEX2 --> BLOOM
    INDEX3 --> BLOOM
```

---

## Security and Privacy

[⬆️ Back to Top](#--table-of-contents)

---


### End-to-End Encryption Architecture

[⬆️ Back to Top](#--table-of-contents)

---


#### Signal Protocol Implementation

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Key Exchange (Initial)"
        IDENTITY_KEY[Identity Key Pair<br/>Long-term Ed25519]
        PREKEY[Pre-key Bundle<br/>X25519 Keys]
        SIGNED_PREKEY[Signed Pre-key<br/>Server distributed]
        ONETIME_KEYS[One-time Keys<br/>Ephemeral X25519]
    end
    
    subgraph "Session Establishment"
        TRIPLE_DH[Triple Diffie-Hellman<br/>Key Agreement]
        ROOT_KEY[Root Key<br/>Derived from DH]
        CHAIN_KEY[Chain Key<br/>Message key derivation]
        MESSAGE_KEY[Message Keys<br/>AES-256 + HMAC]
    end
    
    subgraph "Forward Secrecy"
        RATCHET[Double Ratchet<br/>Key rotation]
        DH_RATCHET[DH Ratchet<br/>New key pairs]
        SYMMETRIC_RATCHET[Symmetric Ratchet<br/>Hash chains]
    end
    
    IDENTITY_KEY --> TRIPLE_DH
    PREKEY --> TRIPLE_DH
    SIGNED_PREKEY --> TRIPLE_DH
    ONETIME_KEYS --> TRIPLE_DH
    
    TRIPLE_DH --> ROOT_KEY
    ROOT_KEY --> CHAIN_KEY
    CHAIN_KEY --> MESSAGE_KEY
    
    ROOT_KEY --> RATCHET
    RATCHET --> DH_RATCHET
    RATCHET --> SYMMETRIC_RATCHET
```

#### Message Encryption Flow

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
sequenceDiagram
    participant A as Alice
    participant S as Server
    participant B as Bob
    
    Note over A,B: Key Exchange Phase
    A->>S: Upload pre-key bundle
    B->>S: Request Alice's pre-key bundle
    S->>B: Send pre-key bundle
    B->>B: Generate session keys using Triple-DH
    
    Note over A,B: Message Encryption
    B->>B: Encrypt message with message key
    B->>B: Generate new message key
    B->>S: Send encrypted message
    S->>A: Forward encrypted message
    A->>A: Decrypt with corresponding key
    A->>A: Update key chain
    
    Note over A,B: Key Rotation
    A->>A: Generate new DH key pair
    A->>B: Send new public key (encrypted)
    B->>B: Update session with new keys
    B->>A: Acknowledge with new keys
```

### Authentication and Authorization

[⬆️ Back to Top](#--table-of-contents)

---


#### Multi-Factor Authentication Flow

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
stateDiagram-v2
    [*] --> InitialAuth
    InitialAuth --> PhoneVerification: Enter phone
    PhoneVerification --> SMSCode: Send SMS
    SMSCode --> PrimaryAuth: Valid code
    PrimaryAuth --> TwoFactorSetup: First login
    PrimaryAuth --> TwoFactorVerify: Existing user
    
    TwoFactorSetup --> TOTP: Setup authenticator
    TwoFactorSetup --> SMS: Use SMS backup
    TwoFactorSetup --> Authenticated: Complete
    
    TwoFactorVerify --> TOTPVerify: Enter TOTP
    TwoFactorVerify --> SMSBackup: Use SMS backup
    TOTPVerify --> Authenticated: Valid TOTP
    SMSBackup --> Authenticated: Valid SMS code
    
    Authenticated --> [*]
    
    note right of PhoneVerification
        Rate limiting: 3 attempts/hour
        Phone number validation
    end note
    
    note right of TwoFactorVerify
        Backup codes available
        Device trust mechanism
    end note
```

### Privacy and Data Protection

[⬆️ Back to Top](#--table-of-contents)

---


#### Data Minimization Strategy

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Data Collection"
        ESSENTIAL[Essential Data<br/>User ID, Messages]
        FUNCTIONAL[Functional Data<br/>Preferences, Settings]
        OPTIONAL[Optional Data<br/>Analytics, Telemetry]
    end
    
    subgraph "Data Processing"
        ENCRYPTION[End-to-End Encryption<br/>Messages & Media]
        ANONYMIZATION[Data Anonymization<br/>Analytics & Logs]
        PSEUDONYMIZATION[Pseudonymization<br/>User Identifiers]
    end
    
    subgraph "Data Storage"
        LOCAL[Local Storage<br/>Device encryption]
        ENCRYPTED_DB[Encrypted Database<br/>Server-side encryption]
        AUDIT_LOG[Audit Logs<br/>Access tracking]
    end
    
    subgraph "Privacy Controls"
        CONSENT[Consent Management<br/>Granular permissions]
        RETENTION[Data Retention<br/>Automatic deletion]
        PORTABILITY[Data Portability<br/>Export functionality]
    end
    
    ESSENTIAL --> ENCRYPTION
    FUNCTIONAL --> ANONYMIZATION
    OPTIONAL --> PSEUDONYMIZATION
    
    ENCRYPTION --> ENCRYPTED_DB
    ANONYMIZATION --> AUDIT_LOG
    PSEUDONYMIZATION --> LOCAL
    
    ENCRYPTED_DB --> CONSENT
    AUDIT_LOG --> RETENTION
    LOCAL --> PORTABILITY
```

---

## Testing, Monitoring, and Maintainability

[⬆️ Back to Top](#--table-of-contents)

---


### Testing Strategy

[⬆️ Back to Top](#--table-of-contents)

---


#### Real-time System Testing Approach

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Unit Tests"
        UT1[Message Validation<br/>Input sanitization]
        UT2[Encryption Functions<br/>Key generation & usage]
        UT3[State Management<br/>Store mutations]
        UT4[WebSocket Handlers<br/>Event processing]
    end
    
    subgraph "Integration Tests"
        IT1[API Integration<br/>REST & GraphQL]
        IT2[Database Integration<br/>CRUD operations]
        IT3[WebSocket Integration<br/>Real-time messaging]
        IT4[Media Service Integration<br/>File upload/download]
    end
    
    subgraph "End-to-End Tests"
        E2E1[User Journey Tests<br/>Complete chat flows]
        E2E2[Cross-platform Tests<br/>Web/Mobile sync]
        E2E3[Performance Tests<br/>Load & stress testing]
        E2E4[Security Tests<br/>Encryption validation]
    end
    
    subgraph "Real-time Specific Tests"
        RT1[Concurrency Tests<br/>Race conditions]
        RT2[Network Partition Tests<br/>Split-brain scenarios]
        RT3[Message Ordering Tests<br/>Consistency validation]
        RT4[Connection Tests<br/>Reconnection logic]
    end
    
    UT1 --> IT1
    UT2 --> IT2
    UT3 --> IT3
    UT4 --> IT4
    
    IT1 --> E2E1
    IT2 --> E2E2
    IT3 --> E2E3
    IT4 --> E2E4
    
    E2E1 --> RT1
    E2E2 --> RT2
    E2E3 --> RT3
    E2E4 --> RT4
```

### Monitoring and Observability

[⬆️ Back to Top](#--table-of-contents)

---


#### Real-time Metrics Dashboard

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TB
    subgraph "Application Metrics"
        MSG_LATENCY[Message Latency<br/>P50, P95, P99]
        CONNECTION_COUNT[Active Connections<br/>Per server/region]
        THROUGHPUT[Message Throughput<br/>Messages/second]
        ERROR_RATE[Error Rate<br/>Failed operations %]
    end
    
    subgraph "Business Metrics"
        ACTIVE_USERS[Daily/Monthly Active Users]
        MESSAGE_VOLUME[Messages per user/day]
        RETENTION_RATE[User retention rates]
        FEATURE_USAGE[Feature adoption metrics]
    end
    
    subgraph "Infrastructure Metrics"
        CPU_USAGE[Server CPU utilization]
        MEMORY_USAGE[Memory consumption]
        NETWORK_IO[Network I/O bandwidth]
        DATABASE_PERF[Database performance]
    end
    
    subgraph "Alert Management"
        THRESHOLD_ALERTS[Threshold-based alerts]
        ANOMALY_DETECTION[ML-based anomaly detection]
        ESCALATION[Alert escalation policies]
        INCIDENT_RESPONSE[Incident response workflow]
    end
    
    MSG_LATENCY --> THRESHOLD_ALERTS
    CONNECTION_COUNT --> ANOMALY_DETECTION
    THROUGHPUT --> THRESHOLD_ALERTS
    ERROR_RATE --> ESCALATION
    
    ACTIVE_USERS --> ANOMALY_DETECTION
    RETENTION_RATE --> INCIDENT_RESPONSE
    
    CPU_USAGE --> THRESHOLD_ALERTS
    DATABASE_PERF --> ESCALATION
```

### Error Handling and Recovery

[⬆️ Back to Top](#--table-of-contents)

---


#### Circuit Breaker Pattern Implementation

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Open: Failure threshold exceeded
    Open --> HalfOpen: Timeout period elapsed
    HalfOpen --> Closed: Success threshold met
    HalfOpen --> Open: Failure detected
    
    note right of Closed
        Normal operation
        Track failure rate
        Failure count: 0-5
    end note
    
    note right of Open
        Fail fast mode
        Return cached data
        Timeout: 30-60s
    end note
    
    note right of HalfOpen
        Test recovery
        Limited requests
        Quick decision
    end note
```

---

## Trade-offs, Deep Dives, and Extensions

[⬆️ Back to Top](#--table-of-contents)

---


### Real-time Protocol Comparison

[⬆️ Back to Top](#--table-of-contents)

---


| Protocol | WebSocket | Server-Sent Events | Long Polling | WebRTC |
|----------|-----------|-------------------|--------------|---------|
| **Bidirectional** | Yes | No | Yes | Yes |
| **Connection Overhead** | Low | Low | High | Medium |
| **Browser Support** | Universal | Good | Universal | Good |
| **Complexity** | Medium | Low | Low | High |
| **Firewall Friendly** | Good | Excellent | Excellent | Poor |
| **Use Case** | Chat apps | Live feeds | Legacy support | P2P calling |

### Message Storage Trade-offs

[⬆️ Back to Top](#--table-of-contents)

---


#### SQL vs NoSQL for Messages

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph LR
    subgraph "SQL Approach (PostgreSQL)"
        SQL_PROS[Pros:<br/>• ACID compliance<br/>• Complex queries<br/>• Data integrity<br/>• Transactions]
        SQL_CONS[Cons:<br/>• Vertical scaling limits<br/>• Complex sharding<br/>• Schema rigidity]
    end
    
    subgraph "NoSQL Approach (Cassandra)"
        NOSQL_PROS[Pros:<br/>• Horizontal scaling<br/>• High availability<br/>• Time-series optimized<br/>• Flexible schema]
        NOSQL_CONS[Cons:<br/>• Eventual consistency<br/>• Limited query flexibility<br/>• Operational complexity]
    end
    
    SQL_PROS -.->|Trade-off| NOSQL_CONS
    NOSQL_PROS -.->|Trade-off| SQL_CONS
```

### Scaling Challenges and Solutions

[⬆️ Back to Top](#--table-of-contents)

---


#### Hot Chat Problem

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    A[Popular Group Chat<br/>100K+ members] --> B{Scaling Challenge}
    
    B --> C[Message Fanout<br/>100K deliveries per message]
    B --> D[Database Hotspot<br/>Single partition overload]
    B --> E[Memory Pressure<br/>Connection management]
    
    C --> F[Solution: Fanout Service<br/>Async message delivery]
    D --> G[Solution: Read Replicas<br/>Distribute read load]
    E --> H[Solution: Connection Sharding<br/>Distribute connections]
    
    F --> I[Improved Throughput]
    G --> I
    H --> I
```

#### Global Consistency vs Performance

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Strong Consistency"
        SC[Synchronous Replication<br/>All regions updated]
        SC_LATENCY[High Latency<br/>Global round-trip]
        SC_AVAILABILITY[Lower Availability<br/>Any region failure affects all]
    end
    
    subgraph "Eventual Consistency"
        EC[Asynchronous Replication<br/>Local-first writes]
        EC_LATENCY[Low Latency<br/>Local response time]
        EC_CONFLICTS[Conflict Resolution<br/>Vector clocks/timestamps]
    end
    
    SC --> SC_LATENCY
    SC --> SC_AVAILABILITY
    EC --> EC_LATENCY
    EC --> EC_CONFLICTS
    
    SC_LATENCY -.->|Trade-off| EC_LATENCY
    SC_AVAILABILITY -.->|Trade-off| EC_CONFLICTS
```

### Advanced Features

[⬆️ Back to Top](#--table-of-contents)

---


#### AI-Powered Chat Features

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "AI Message Processing"
        NLP[Natural Language Processing]
        SENTIMENT[Sentiment Analysis]
        TRANSLATION[Real-time Translation]
        MODERATION[Content Moderation]
    end
    
    subgraph "Smart Features"
        SMART_REPLY[Smart Reply Suggestions]
        THREAD_SUMMARY[Thread Summarization]
        SPAM_DETECTION[Spam Detection]
        TOPIC_DETECTION[Topic Detection]
    end
    
    subgraph "User Assistance"
        CHATBOT[AI Chatbot Integration]
        VOICE_TO_TEXT[Voice Message Transcription]
        IMAGE_RECOGNITION[Image Content Analysis]
        SCHEDULING[Smart Scheduling Assistant]
    end
    
    NLP --> SMART_REPLY
    SENTIMENT --> THREAD_SUMMARY
    TRANSLATION --> CHATBOT
    MODERATION --> SPAM_DETECTION
    
    SMART_REPLY --> VOICE_TO_TEXT
    THREAD_SUMMARY --> IMAGE_RECOGNITION
    SPAM_DETECTION --> SCHEDULING
    TOPIC_DETECTION --> CHATBOT
```

#### Advanced Presence System

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
stateDiagram-v2
    [*] --> Offline
    Offline --> Online: Connect
    Online --> Active: User interaction
    Active --> Idle: No interaction 5min
    Idle --> Away: No interaction 15min
    Away --> Offline: Extended absence
    
    Online --> Typing: Start typing
    Typing --> Online: Stop typing (3s timeout)
    
    Online --> InCall: Join voice/video call
    InCall --> Online: Leave call
    
    Online --> DoNotDisturb: Manual toggle
    DoNotDisturb --> Online: Manual toggle
    
    note right of Active
        Rich presence:
        • Current app/device
        • Activity type
        • Location (optional)
    end note
```

### Future Extensions

[⬆️ Back to Top](#--table-of-contents)

---


#### Next-Generation Chat Features

[⬆️ Back to Top](#--table-of-contents)

---


1. **Immersive Communication**:
   - AR/VR chat environments
   - Spatial audio conversations
   - Holographic avatars
   - Gesture-based interactions

2. **Advanced AI Integration**:
   - Conversational AI assistants
   - Predictive text completion
   - Emotional intelligence
   - Context-aware responses

3. **Blockchain Integration**:
   - Decentralized identity
   - Cryptocurrency payments
   - NFT sharing and trading
   - Tokenized communities

4. **Enhanced Privacy**:
   - Disappearing messages
   - Anonymous group chats
   - Decentralized architecture
   - Zero-knowledge proofs

This comprehensive design provides a robust foundation for building a scalable, secure, and feature-rich real-time chat application with modern architectural patterns and best practices. 