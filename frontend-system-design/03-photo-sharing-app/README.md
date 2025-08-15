# Create a Photo-Sharing App with Feed and Uploading (like Instagram)


## 📋 Table of Contents

- [Create a Photo-Sharing App with Feed and Uploading (like Instagram)](#create-a-photo-sharing-app-with-feed-and-uploading-like-instagram)
  - [Table of Contents](#table-of-contents)
  - [Clarify the Problem and Requirements](#clarify-the-problem-and-requirements)
    - [Problem Understanding](#problem-understanding)
    - [Functional Requirements](#functional-requirements)
    - [Non-Functional Requirements](#non-functional-requirements)
    - [Key Assumptions](#key-assumptions)
  - [High-Level Architecture](#high-level-architecture)
    - [Global System Architecture](#global-system-architecture)
    - [Image Upload & Processing Pipeline](#image-upload-processing-pipeline)
  - [UI/UX and Component Structure](#uiux-and-component-structure)
    - [Frontend Component Architecture](#frontend-component-architecture)
    - [Responsive Image Rendering](#responsive-image-rendering)
  - [Real-Time Sync, Data Modeling & APIs](#real-time-sync-data-modeling-apis)
    - [Feed Algorithm Implementation](#feed-algorithm-implementation)
      - [Chronological vs Algorithmic Feed](#chronological-vs-algorithmic-feed)
      - [Real-time Feed Updates](#real-time-feed-updates)
    - [Image Processing Algorithm](#image-processing-algorithm)
      - [Multi-Resolution Generation](#multi-resolution-generation)
    - [Data Models](#data-models)
      - [Post Schema](#post-schema)
      - [User Profile Schema](#user-profile-schema)
  - [TypeScript Interfaces & Component Props](#typescript-interfaces--component-props)
    - [Core Data Interfaces](#core-data-interfaces)
    - [Component Props Interfaces](#component-props-interfaces)
  - [API Reference](#api-reference)
  - [Performance and Scalability](#performance-and-scalability)
    - [Image Delivery Optimization](#image-delivery-optimization)
      - [Progressive Image Loading](#progressive-image-loading)
      - [CDN Caching Strategy](#cdn-caching-strategy)
    - [Database Scaling Strategy](#database-scaling-strategy)
      - [Sharding by User ID](#sharding-by-user-id)
    - [Upload Performance Optimization](#upload-performance-optimization)
      - [Parallel Upload Strategy](#parallel-upload-strategy)
  - [Security and Privacy](#security-and-privacy)
    - [Content Moderation Pipeline](#content-moderation-pipeline)
      - [Automated Content Screening](#automated-content-screening)
    - [Privacy Protection Framework](#privacy-protection-framework)
      - [Data Protection Strategy](#data-protection-strategy)
  - [Testing, Monitoring, and Maintainability](#testing-monitoring-and-maintainability)
    - [Testing Strategy](#testing-strategy)
      - [Comprehensive Testing Framework](#comprehensive-testing-framework)
    - [Monitoring and Analytics](#monitoring-and-analytics)
      - [Real-time Metrics Dashboard](#real-time-metrics-dashboard)
  - [Trade-offs, Deep Dives, and Extensions](#trade-offs-deep-dives-and-extensions)
    - [Storage Strategy Trade-offs](#storage-strategy-trade-offs)
    - [Feed Algorithm Trade-offs](#feed-algorithm-trade-offs)
      - [Chronological vs Algorithmic](#chronological-vs-algorithmic)
    - [Advanced Features](#advanced-features)
      - [AI-Powered Content Enhancement](#ai-powered-content-enhancement)
    - [Future Extensions](#future-extensions)
      - [Next-Generation Features](#next-generation-features)

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

Design a photo-sharing platform that enables users to upload, edit, share, and discover visual content through feeds, stories, and social interactions, similar to Instagram, Pinterest, or Snapchat. The system must handle millions of photos daily with real-time interactions and global content delivery.

### Functional Requirements

[⬆️ Back to Top](#--table-of-contents)

---

- **Photo Upload & Processing**: Multi-format support, automatic optimization, filters
- **Social Feed**: Algorithmic timeline, stories, explore page, hashtag discovery
- **Content Interaction**: Likes, comments, shares, saves, direct messaging
- **User Profiles**: Follower/following system, profile customization, bio, highlights
- **Content Creation**: Photo editing, filters, captions, tagging, location
- **Discovery Features**: Search by hashtags, users, locations, trending content
- **Stories & Ephemeral Content**: 24-hour stories, highlights, live streaming
- **Cross-platform**: Web, iOS, Android with seamless sync

### Non-Functional Requirements

[⬆️ Back to Top](#--table-of-contents)

---

- **Performance**: <2s image upload, <500ms feed load, instant interactions
- **Scalability**: 1B+ users, 100M+ photos/day, 500M+ interactions/day
- **Availability**: 99.95% uptime with regional failover
- **Storage**: Petabyte-scale image storage, global CDN distribution
- **Quality**: Multiple resolutions, progressive loading, adaptive delivery
- **Security**: Content moderation, privacy controls, secure uploads

### Key Assumptions

[⬆️ Back to Top](#--table-of-contents)

---

- Average photo size: 2-8MB original, optimized to 200KB-2MB
- User activity: 20 photos viewed/minute, 5 interactions/minute
- Upload frequency: 95M photos/day globally
- Storage growth: 50TB/day of new content
- Peak traffic: 3x normal load during events
- Content lifecycle: 80% of interactions in first 24 hours

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
        WEB[Web App<br/>React/Next.js]
        MOBILE[Mobile Apps<br/>React Native/Native]
        PWA[Progressive Web App<br/>Service Workers]
    end
    
    subgraph "Global CDN"
        CDN[Content Delivery Network<br/>CloudFront/Fastly]
        EDGE_CACHE[Edge Cache<br/>Regional Image Cache]
        IMAGE_CDN[Image CDN<br/>Optimized Delivery]
    end
    
    subgraph "API Gateway"
        LOAD_BALANCER[Load Balancer<br/>Geographic Routing]
        API_GATEWAY[GraphQL Gateway<br/>Unified API]
        RATE_LIMITER[Rate Limiter<br/>Upload Throttling]
        AUTH_SERVICE[Auth Service<br/>JWT + OAuth]
    end
    
    subgraph "Core Services"
        UPLOAD_SERVICE[Upload Service<br/>Image Processing]
        FEED_SERVICE[Feed Service<br/>Content Aggregation]
        USER_SERVICE[User Service<br/>Profiles & Relations]
        INTERACTION_SERVICE[Interaction Service<br/>Likes, Comments]
        NOTIFICATION_SERVICE[Notification Service<br/>Real-time Updates]
        RECOMMENDATION_SERVICE[Recommendation Service<br/>ML-based Discovery]
    end
    
    subgraph "Data Processing"
        IMAGE_PROCESSOR[Image Processor<br/>Resize, Filter, Optimize]
        ML_PIPELINE[ML Pipeline<br/>Content Analysis]
        SEARCH_INDEXER[Search Indexer<br/>Content Discovery]
        ANALYTICS_PROCESSOR[Analytics Processor<br/>User Behavior]
    end
    
    subgraph "Storage Layer"
        IMAGE_STORAGE[Image Storage<br/>S3/GCS Objects]
        METADATA_DB[Metadata DB<br/>PostgreSQL]
        FEED_CACHE[Feed Cache<br/>Redis Cluster]
        SEARCH_INDEX[Search Index<br/>Elasticsearch]
        ANALYTICS_DB[Analytics DB<br/>ClickHouse]
    end
    
    WEB --> CDN
    MOBILE --> CDN
    PWA --> CDN
    
    CDN --> EDGE_CACHE
    EDGE_CACHE --> IMAGE_CDN
    IMAGE_CDN --> LOAD_BALANCER
    
    LOAD_BALANCER --> API_GATEWAY
    API_GATEWAY --> RATE_LIMITER
    RATE_LIMITER --> AUTH_SERVICE
    
    AUTH_SERVICE --> UPLOAD_SERVICE
    AUTH_SERVICE --> FEED_SERVICE
    AUTH_SERVICE --> USER_SERVICE
    AUTH_SERVICE --> INTERACTION_SERVICE
    AUTH_SERVICE --> NOTIFICATION_SERVICE
    AUTH_SERVICE --> RECOMMENDATION_SERVICE
    
    UPLOAD_SERVICE --> IMAGE_PROCESSOR
    FEED_SERVICE --> ML_PIPELINE
    USER_SERVICE --> SEARCH_INDEXER
    INTERACTION_SERVICE --> ANALYTICS_PROCESSOR
    
    IMAGE_PROCESSOR --> IMAGE_STORAGE
    FEED_SERVICE --> METADATA_DB
    USER_SERVICE --> FEED_CACHE
    RECOMMENDATION_SERVICE --> SEARCH_INDEX
    ANALYTICS_PROCESSOR --> ANALYTICS_DB
```

### Image Upload & Processing Pipeline

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Upload Flow"
        CLIENT[Client Upload]
        VALIDATION[File Validation<br/>Size, Format, Content]
        VIRUS_SCAN[Virus Scanning<br/>Malware Detection]
        TEMP_STORAGE[Temporary Storage<br/>Processing Queue]
    end
    
    subgraph "Processing Pipeline"
        METADATA_EXTRACT[Metadata Extraction<br/>EXIF, Geolocation]
        CONTENT_MODERATION[Content Moderation<br/>NSFW, Violence Detection]
        IMAGE_PROCESSING[Image Processing<br/>Multiple Resolutions]
        COMPRESSION[Compression<br/>WebP, AVIF, JPEG]
    end
    
    subgraph "Optimization & Storage"
        RESPONSIVE_VARIANTS[Responsive Variants<br/>Thumbnail to Full-res]
        CDN_DISTRIBUTION[CDN Distribution<br/>Global Replication]
        METADATA_STORAGE[Metadata Storage<br/>Database Record]
        SEARCH_INDEXING[Search Indexing<br/>Tags, Description]
    end
    
    subgraph "Real-time Updates"
        FEED_UPDATE[Feed Update<br/>Follower Notification]
        PUSH_NOTIFICATION[Push Notification<br/>Mobile Alerts]
        WEBSOCKET_BROADCAST[WebSocket Broadcast<br/>Real-time UI]
    end
    
    CLIENT --> VALIDATION
    VALIDATION --> VIRUS_SCAN
    VIRUS_SCAN --> TEMP_STORAGE
    
    TEMP_STORAGE --> METADATA_EXTRACT
    METADATA_EXTRACT --> CONTENT_MODERATION
    CONTENT_MODERATION --> IMAGE_PROCESSING
    IMAGE_PROCESSING --> COMPRESSION
    
    COMPRESSION --> RESPONSIVE_VARIANTS
    RESPONSIVE_VARIANTS --> CDN_DISTRIBUTION
    CDN_DISTRIBUTION --> METADATA_STORAGE
    METADATA_STORAGE --> SEARCH_INDEXING
    
    SEARCH_INDEXING --> FEED_UPDATE
    FEED_UPDATE --> PUSH_NOTIFICATION
    PUSH_NOTIFICATION --> WEBSOCKET_BROADCAST
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
        ROUTER[Router Navigation]
        AUTH[Auth Provider]
        THEME[Theme Provider]
        OFFLINE[Offline Manager]
    end
    
    subgraph "Main Navigation"
        TAB_BAR[Tab Bar Navigation]
        HOME_TAB[Home Feed Tab]
        SEARCH_TAB[Search/Explore Tab]
        CAMERA_TAB[Camera/Upload Tab]
        ACTIVITY_TAB[Activity/Notifications Tab]
        PROFILE_TAB[Profile Tab]
    end
    
    subgraph "Feed Components"
        FEED_CONTAINER[Feed Container]
        STORY_BAR[Stories Bar]
        POST_LIST[Post List]
        POST_ITEM[Post Item]
        IMAGE_VIEWER[Image Viewer]
        INTERACTION_BAR[Interaction Bar]
    end
    
    subgraph "Upload Components"
        CAMERA_INTERFACE[Camera Interface]
        GALLERY_PICKER[Gallery Picker]
        IMAGE_EDITOR[Image Editor]
        FILTER_SELECTOR[Filter Selector]
        CAPTION_EDITOR[Caption Editor]
        UPLOAD_PROGRESS[Upload Progress]
    end
    
    subgraph "Social Components"
        USER_PROFILE[User Profile]
        FOLLOWER_LIST[Follower List]
        COMMENT_SECTION[Comment Section]
        DIRECT_MESSAGE[Direct Message]
        NOTIFICATION_CENTER[Notification Center]
    end
    
    subgraph "Discovery Components"
        SEARCH_BAR[Search Bar]
        EXPLORE_GRID[Explore Grid]
        HASHTAG_FEED[Hashtag Feed]
        LOCATION_FEED[Location Feed]
        TRENDING_SECTION[Trending Section]
    end
    
    subgraph "Shared Services"
        IMAGE_SERVICE[Image Service]
        UPLOAD_SERVICE[Upload Service]
        CACHE_MANAGER[Cache Manager]
        ANALYTICS_TRACKER[Analytics Tracker]
        NOTIFICATION_SERVICE[Notification Service]
    end
    
    APP --> ROUTER
    APP --> AUTH
    APP --> THEME
    APP --> OFFLINE
    
    ROUTER --> TAB_BAR
    TAB_BAR --> HOME_TAB
    TAB_BAR --> SEARCH_TAB
    TAB_BAR --> CAMERA_TAB
    TAB_BAR --> ACTIVITY_TAB
    TAB_BAR --> PROFILE_TAB
    
    HOME_TAB --> FEED_CONTAINER
    FEED_CONTAINER --> STORY_BAR
    FEED_CONTAINER --> POST_LIST
    POST_LIST --> POST_ITEM
    POST_ITEM --> IMAGE_VIEWER
    POST_ITEM --> INTERACTION_BAR
    
    CAMERA_TAB --> CAMERA_INTERFACE
    CAMERA_INTERFACE --> GALLERY_PICKER
    GALLERY_PICKER --> IMAGE_EDITOR
    IMAGE_EDITOR --> FILTER_SELECTOR
    FILTER_SELECTOR --> CAPTION_EDITOR
    CAPTION_EDITOR --> UPLOAD_PROGRESS
    
    SEARCH_TAB --> SEARCH_BAR
    SEARCH_BAR --> EXPLORE_GRID
    EXPLORE_GRID --> HASHTAG_FEED
    HASHTAG_FEED --> LOCATION_FEED
    LOCATION_FEED --> TRENDING_SECTION
    
    PROFILE_TAB --> USER_PROFILE
    USER_PROFILE --> FOLLOWER_LIST
    ACTIVITY_TAB --> NOTIFICATION_CENTER
    
    POST_ITEM --> COMMENT_SECTION
    NOTIFICATION_CENTER --> DIRECT_MESSAGE
    
    IMAGE_VIEWER --> IMAGE_SERVICE
    UPLOAD_PROGRESS --> UPLOAD_SERVICE
    FEED_CONTAINER --> CACHE_MANAGER
    INTERACTION_BAR --> ANALYTICS_TRACKER
    NOTIFICATION_CENTER --> NOTIFICATION_SERVICE
```

#### React Component Implementation

[⬆️ Back to Top](#--table-of-contents)

---

**PhotoFeedContainer.jsx**
```jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PhotoProvider } from './PhotoContext';
import StoryBar from './StoryBar';
import PostList from './PostList';
import CameraInterface from './CameraInterface';
import ImageEditor from './ImageEditor';
import { useInfiniteQuery } from 'react-query';

const PhotoFeedContainer = () => {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery(
    'photoFeed',
    ({ pageParam = null }) => fetchFeedPage(pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 5 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (data) {
      const allPosts = data.pages.flatMap(page => page.posts);
      setPosts(allPosts);
    }
  }, [data]);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      const storiesData = await response.json();
      setStories(storiesData.stories);
    } catch (error) {
      console.error('Failed to fetch stories:', error);
    }
  };

  const handleImageUpload = useCallback((imageFile) => {
    setSelectedImage(imageFile);
    setUploadModalOpen(true);
  }, []);

  const handlePostCreate = useCallback(async (postData) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      const newPost = await response.json();
      setPosts(prev => [newPost, ...prev]);
      setUploadModalOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  }, []);

  const updatePost = useCallback((postId, updates) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ));
  }, []);

  const fetchFeedPage = async (cursor) => {
    const response = await fetch(`/api/feed?cursor=${cursor || ''}&limit=10`);
    return response.json();
  };

  return (
    <PhotoProvider value={{
      posts,
      stories,
      updatePost,
      onImageUpload: handleImageUpload
    }}>
      <div className="photo-feed-container">
        {/* Tab Navigation */}
        <nav className="tab-navigation">
          <button 
            className={activeTab === 'home' ? 'active' : ''}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={activeTab === 'search' ? 'active' : ''}
            onClick={() => setActiveTab('search')}
          >
            Search
          </button>
          <button 
            className={activeTab === 'camera' ? 'active' : ''}
            onClick={() => setActiveTab('camera')}
          >
            Camera
          </button>
        </nav>

        {/* Content Area */}
        {activeTab === 'home' && (
          <div className="home-feed">
            <StoryBar stories={stories} />
            <PostList 
              posts={posts}
              onLoadMore={fetchNextPage}
              hasNextPage={hasNextPage}
              isLoading={isFetchingNextPage}
            />
          </div>
        )}

        {activeTab === 'camera' && (
          <CameraInterface onImageCapture={handleImageUpload} />
        )}

        {/* Upload Modal */}
        {uploadModalOpen && selectedImage && (
          <ImageEditor
            image={selectedImage}
            onSave={handlePostCreate}
            onCancel={() => {
              setUploadModalOpen(false);
              setSelectedImage(null);
            }}
          />
        )}
      </div>
    </PhotoProvider>
  );
};

export default PhotoFeedContainer;
```

**PostItem.jsx**

**What this code does:**
• **Main Purpose**: Individual photo post component with social interactions
• **Optimistic Updates**: Immediate UI feedback before server confirmation
• **Key Functions**:
  - `handleLike()` - Toggles like status with optimistic update and error rollback
  - `handleShare()` - Uses Web Share API with clipboard fallback
  - `formatTimeAgo()` - Converts timestamps to user-friendly relative time
  - `handleComment()` - Toggles comment section visibility
  - Image lazy loading with placeholder skeleton
  - Double-tap gesture detection for quick liking

```jsx
import React, { useState, useContext, useRef } from 'react';
import { PhotoContext } from './PhotoContext';
import ImageViewer from './ImageViewer';
import InteractionBar from './InteractionBar';
import CommentSection from './CommentSection';

const PostItem = ({ post }) => {
  const { updatePost } = useContext(PhotoContext);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef(null);

  const handleLike = async () => {
    const newLikedState = !isLiked;
    const newLikeCount = likeCount + (newLikedState ? 1 : -1);
    
    // Optimistic update
    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);
    
    try {
      await fetch(`/api/posts/${post.id}/like`, {
        method: newLikedState ? 'POST' : 'DELETE'
      });
      
      updatePost(post.id, {
        isLiked: newLikedState,
        likeCount: newLikeCount
      });
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikeCount(likeCount);
      console.error('Failed to update like:', error);
    }
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photo by ${post.author.username}`,
          text: post.caption,
          url: `/post/${post.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    }
  };

  return (
    <article className="post-item">
      {/* Post Header */}
      <header className="post-header">
        <div className="author-info">
          <img 
            src={post.author.avatarUrl || '/default-avatar.png'}
            alt={post.author.username}
            className="author-avatar"
          />
          <div className="author-details">
            <span className="author-username">{post.author.username}</span>
            {post.location && (
              <span className="post-location">{post.location.name}</span>
            )}
          </div>
        </div>
        <button className="more-options">⋯</button>
      </header>

      {/* Image Content */}
      <div className="post-image-container">
        <ImageViewer
          ref={imageRef}
          images={post.media}
          onLoad={() => setImageLoaded(true)}
          onDoubleClick={handleLike}
        />
        
        {/* Image overlay effects */}
        {!imageLoaded && (
          <div className="image-placeholder">
            <div className="loading-skeleton" />
          </div>
        )}
      </div>

      {/* Interaction Bar */}
      <InteractionBar
        isLiked={isLiked}
        likeCount={likeCount}
        commentCount={post.commentCount}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
      />

      {/* Caption and Comments */}
      <div className="post-content">
        {post.caption && (
          <div className="post-caption">
            <span className="author-username">{post.author.username}</span>
            <span className="caption-text">{post.caption}</span>
          </div>
        )}
        
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="hashtags">
            {post.hashtags.map(tag => (
              <span key={tag} className="hashtag">#{tag}</span>
            ))}
          </div>
        )}

        <time className="post-timestamp">
          {formatTimeAgo(post.createdAt)}
        </time>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={post.comments}
          onCommentAdd={(comment) => {
            updatePost(post.id, {
              commentCount: post.commentCount + 1,
              comments: [...(post.comments || []), comment]
            });
          }}
        />
      )}
    </article>
  );
};

// Helper function
const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

export default PostItem;
```

**ImageEditor.jsx**

**What this code does:**
• **Main Purpose**: Photo editing interface with filters and caption management
• **Canvas Processing**: Real-time filter application using HTML5 Canvas
• **Key Functions**:
  - `drawImageToCanvas()` - Renders image with applied filters to canvas
  - `handleFilterSelect()` - Applies CSS filters to image preview
  - `extractHashtags()` - Parses caption text for hashtag detection
  - `handleSave()` - Converts canvas to blob and uploads to server
  - Real-time filter preview with predefined filter effects

```jsx
import React, { useState, useRef, useEffect } from 'react';
import FilterSelector from './FilterSelector';
import CaptionEditor from './CaptionEditor';

const ImageEditor = ({ image, onSave, onCancel }) => {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [location, setLocation] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  const filters = [
    { id: 'none', name: 'Original', filter: 'none' },
    { id: 'vintage', name: 'Vintage', filter: 'sepia(0.5) saturate(1.4)' },
    { id: 'dramatic', name: 'Dramatic', filter: 'contrast(1.3) brightness(0.9)' },
    { id: 'mono', name: 'Mono', filter: 'grayscale(1)' },
    { id: 'bright', name: 'Bright', filter: 'brightness(1.2) saturate(1.1)' }
  ];

  useEffect(() => {
    if (image && canvasRef.current) {
      drawImageToCanvas();
    }
  }, [image, selectedFilter]);

  const drawImageToCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Apply filter if selected
      if (selectedFilter) {
        ctx.filter = selectedFilter.filter;
      }
      
      ctx.drawImage(img, 0, 0);
    };
    
    img.src = URL.createObjectURL(image);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
  };

  const extractHashtags = (text) => {
    const hashtagRegex = /#[\w]+/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.map(tag => tag.slice(1)); // Remove # symbol
  };

  const handleCaptionChange = (newCaption) => {
    setCaption(newCaption);
    setHashtags(extractHashtags(newCaption));
  };

  const handleSave = async () => {
    setIsUploading(true);
    
    try {
      // Convert canvas to blob
      const canvas = canvasRef.current;
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });

      // Create form data for upload
      const formData = new FormData();
      formData.append('image', blob, 'edited-image.jpg');
      formData.append('caption', caption);
      formData.append('hashtags', JSON.stringify(hashtags));
      
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      // Upload image
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const uploadResult = await uploadResponse.json();
      
      // Create post
      const postData = {
        mediaUrl: uploadResult.url,
        caption,
        hashtags,
        location,
        filter: selectedFilter?.id
      };
      
      onSave(postData);
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-editor-modal">
      <div className="editor-container">
        <header className="editor-header">
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
          <h2>New Post</h2>
          <button 
            onClick={handleSave} 
            className="save-btn"
            disabled={isUploading}
          >
            {isUploading ? 'Sharing...' : 'Share'}
          </button>
        </header>

        <div className="editor-content">
          {/* Image Preview */}
          <div className="image-preview">
            <canvas 
              ref={canvasRef}
              className="edited-image"
              style={{
                filter: selectedFilter?.filter || 'none',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>

          {/* Filter Selection */}
          <FilterSelector
            filters={filters}
            selectedFilter={selectedFilter}
            onFilterSelect={handleFilterSelect}
            previewImage={image}
          />

          {/* Caption Editor */}
          <CaptionEditor
            caption={caption}
            onCaptionChange={handleCaptionChange}
            hashtags={hashtags}
            location={location}
            onLocationChange={setLocation}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
```

**ImageViewer.jsx**
```jsx
import React, { useState, useRef, useCallback } from 'react';

const ImageViewer = React.forwardRef(({ 
  images, 
  onLoad, 
  onDoubleClick,
  className = '' 
}, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef(null);

  const currentImage = images[currentIndex];

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setImageError(false);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoaded(false);
  }, []);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsLoaded(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsLoaded(false);
    }
  };

  const getImageSrc = (image) => {
    // Progressive image loading - use appropriate size based on viewport
    const screenWidth = window.innerWidth;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    if (screenWidth * devicePixelRatio <= 640) {
      return image.urls.small || image.urls.medium;
    } else if (screenWidth * devicePixelRatio <= 1080) {
      return image.urls.medium || image.urls.large;
    } else {
      return image.urls.large || image.urls.original;
    }
  };

  return (
    <div className={`image-viewer ${className}`} ref={ref}>
      {/* Main Image */}
      <div className="image-container">
        {!isLoaded && !imageError && (
          <div className="image-loading">
            <div className="loading-spinner" />
          </div>
        )}
        
        {imageError ? (
          <div className="image-error">
            <span>Failed to load image</span>
          </div>
        ) : (
          <img
            ref={imageRef}
            src={getImageSrc(currentImage)}
            alt={currentImage.altText || 'Post image'}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onDoubleClick={onDoubleClick}
            className={`main-image ${isLoaded ? 'loaded' : ''}`}
            loading="lazy"
          />
        )}

        {/* Multiple Image Navigation */}
        {images.length > 1 && (
          <>
            <button
              className="nav-btn prev-btn"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              aria-label="Previous image"
            >
              ‹
            </button>
            
            <button
              className="nav-btn next-btn"
              onClick={handleNext}
              disabled={currentIndex === images.length - 1}
              aria-label="Next image"
            >
              ›
            </button>

            {/* Image Indicators */}
            <div className="image-indicators">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsLoaded(false);
                  }}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default ImageViewer;
```

### Responsive Image Rendering

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Image Variants"
        THUMBNAIL[Thumbnail<br/>150x150 - 10KB]
        SMALL[Small<br/>320x320 - 50KB]
        MEDIUM[Medium<br/>640x640 - 200KB]
        LARGE[Large<br/>1080x1080 - 500KB]
        ORIGINAL[Original<br/>Full Resolution - 2MB+]
    end
    
    subgraph "Responsive Strategy"
        DEVICE_DETECTION[Device Detection<br/>Screen Size & DPR]
        NETWORK_AWARE[Network Awareness<br/>Connection Speed]
        PROGRESSIVE_LOADING[Progressive Loading<br/>Blur to Sharp]
        LAZY_LOADING[Lazy Loading<br/>Intersection Observer]
    end
    
    subgraph "Delivery Optimization"
        WEBP_SUPPORT[WebP Support<br/>Modern Browsers]
        AVIF_SUPPORT[AVIF Support<br/>Next-gen Format]
        SRCSET_GENERATION[Srcset Generation<br/>Multi-resolution]
        PRELOAD_STRATEGY[Preload Strategy<br/>Critical Images]
    end
    
    DEVICE_DETECTION --> THUMBNAIL
    DEVICE_DETECTION --> SMALL
    NETWORK_AWARE --> MEDIUM
    NETWORK_AWARE --> LARGE
    PROGRESSIVE_LOADING --> ORIGINAL
    
    THUMBNAIL --> WEBP_SUPPORT
    SMALL --> AVIF_SUPPORT
    MEDIUM --> SRCSET_GENERATION
    LARGE --> PRELOAD_STRATEGY
    
    LAZY_LOADING --> PROGRESSIVE_LOADING
    SRCSET_GENERATION --> LAZY_LOADING
```

---

## Real-Time Sync, Data Modeling & APIs

[⬆️ Back to Top](#--table-of-contents)

---


### Feed Algorithm Implementation

[⬆️ Back to Top](#--table-of-contents)

---


#### Chronological vs Algorithmic Feed

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Content Sources"
        FOLLOWING[Following Posts<br/>80% weight]
        SUGGESTED[Suggested Content<br/>15% weight]
        PROMOTED[Promoted Posts<br/>5% weight]
        STORIES[Stories Content<br/>Priority boost]
    end
    
    subgraph "Ranking Factors"
        RECENCY[Recency Score<br/>Time decay function]
        ENGAGEMENT[Engagement Score<br/>Likes, comments, shares]
        RELATIONSHIP[Relationship Score<br/>Interaction history]
        CONTENT_QUALITY[Content Quality<br/>ML-based assessment]
        USER_INTEREST[User Interest<br/>Behavioral patterns]
    end
    
    subgraph "Personalization Engine"
        USER_PROFILE[User Profile<br/>Preferences, History]
        COLLABORATIVE_FILTER[Collaborative Filtering<br/>Similar users]
        CONTENT_FILTER[Content-based Filtering<br/>Image analysis]
        CONTEXT_AWARE[Context Awareness<br/>Time, location, device]
    end
    
    subgraph "Feed Generation"
        CANDIDATE_SELECTION[Candidate Selection<br/>Initial filtering]
        SCORING_ENGINE[Scoring Engine<br/>Weighted ranking]
        DIVERSITY_INJECTION[Diversity Injection<br/>Content variety]
        FINAL_RANKING[Final Ranking<br/>Optimized order]
    end
    
    FOLLOWING --> CANDIDATE_SELECTION
    SUGGESTED --> CANDIDATE_SELECTION
    PROMOTED --> CANDIDATE_SELECTION
    STORIES --> CANDIDATE_SELECTION
    
    RECENCY --> SCORING_ENGINE
    ENGAGEMENT --> SCORING_ENGINE
    RELATIONSHIP --> SCORING_ENGINE
    CONTENT_QUALITY --> SCORING_ENGINE
    USER_INTEREST --> SCORING_ENGINE
    
    USER_PROFILE --> COLLABORATIVE_FILTER
    COLLABORATIVE_FILTER --> CONTENT_FILTER
    CONTENT_FILTER --> CONTEXT_AWARE
    
    CANDIDATE_SELECTION --> SCORING_ENGINE
    SCORING_ENGINE --> DIVERSITY_INJECTION
    DIVERSITY_INJECTION --> FINAL_RANKING
    
    CONTEXT_AWARE --> SCORING_ENGINE
```

#### Real-time Feed Updates

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
sequenceDiagram
    participant U1 as User 1<br/>(Publisher)
    participant US as Upload Service
    participant FS as Feed Service
    participant MQ as Message Queue
    participant CACHE as Redis Cache
    participant U2 as User 2<br/>(Follower)
    
    Note over U1,U2: User 1 uploads new photo
    
    U1->>US: Upload photo + metadata
    US->>US: Process & optimize image
    US->>FS: Notify content published
    FS->>MQ: Publish feed_update event
    
    par Feed Cache Update
        MQ->>FS: Process feed update
        FS->>FS: Identify followers
        FS->>CACHE: Update follower feeds
        CACHE->>CACHE: Prepend new post
    and Real-time Notification
        MQ->>U2: Push notification
        U2->>U2: Show "New posts available"
    end
    
    Note over U2: User 2 refreshes feed
    U2->>FS: Request latest feed
    FS->>CACHE: Fetch updated feed
    CACHE->>FS: Return posts with new content
    FS->>U2: Display updated feed
```

### Image Processing Algorithm

[⬆️ Back to Top](#--table-of-contents)

---


#### Multi-Resolution Generation

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    A[Original Image<br/>4000x3000 - 8MB] --> B[Quality Analysis<br/>Detect resolution, format]
    B --> C{Processing Strategy}
    
    C -->|High Quality| D[Lossless Pipeline]
    C -->|Standard Quality| E[Balanced Pipeline]
    C -->|Quick Upload| F[Fast Pipeline]
    
    D --> G[Generate 6 variants<br/>Preserve quality]
    E --> H[Generate 4 variants<br/>Optimize size]
    F --> I[Generate 2 variants<br/>Fast processing]
    
    G --> J[150x150 - Thumbnail]
    G --> K[320x320 - Small]
    G --> L[640x640 - Medium]
    G --> M[1080x1080 - Large]
    G --> N[1620x1620 - XL]
    G --> O[Original - Archive]
    
    H --> J
    H --> K
    H --> L
    H --> M
    
    F --> J
    F --> L
    
    J --> P[WebP + AVIF variants]
    K --> P
    L --> P
    M --> P
    N --> P
    
    P --> Q[CDN Distribution<br/>Global availability]
```

### Data Models

[⬆️ Back to Top](#--table-of-contents)

---


#### Post Schema

[⬆️ Back to Top](#--table-of-contents)

---

```
Post {
  id: UUID
  user_id: UUID
  caption: String
  location?: {
    name: String
    coordinates: GeoPoint
  }
  media: [{
    id: UUID
    type: 'image' | 'video'
    urls: {
      thumbnail: String
      small: String
      medium: String
      large: String
      original: String
    }
    alt_text?: String
    filters_applied: [String]
  }]
  hashtags: [String]
  mentions: [UserID]
  metadata: {
    created_at: DateTime
    updated_at: DateTime
    is_archived: Boolean
    privacy: 'public' | 'followers' | 'private'
    comments_enabled: Boolean
    likes_enabled: Boolean
  }
  engagement: {
    likes_count: Integer
    comments_count: Integer
    shares_count: Integer
    saves_count: Integer
    views_count: Integer
  }
  algorithm_scores: {
    quality_score: Float
    engagement_rate: Float
    virality_potential: Float
    spam_probability: Float
  }
}
```

#### User Profile Schema

[⬆️ Back to Top](#--table-of-contents)

---

```
UserProfile {
  id: UUID
  username: String
  display_name: String
  bio?: String
  avatar_url?: String
  website?: String
  verified: Boolean
  private: Boolean
  statistics: {
    posts_count: Integer
    followers_count: Integer
    following_count: Integer
    stories_highlights: Integer
  }
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    language: String
    timezone: String
    notifications: {
      likes: Boolean
      comments: Boolean
      follows: Boolean
      mentions: Boolean
      stories: Boolean
    }
    privacy: {
      profile_visibility: 'public' | 'followers' | 'private'
      story_visibility: 'public' | 'followers' | 'close_friends'
      activity_status: Boolean
      read_receipts: Boolean
    }
  }
}
```

### TypeScript Interfaces & Component Props

[⬆️ Back to Top](#--table-of-contents)

---

#### Core Data Interfaces

```typescript
interface Post {
  id: string;
  userId: string;
  caption: string;
  media: MediaItem[];
  location?: Location;
  hashtags: string[];
  mentions: string[];
  likes: number;
  comments: number;
  createdAt: Date;
  isPrivate: boolean;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  altText?: string;
  filters?: string[];
}

interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

interface Story {
  id: string;
  userId: string;
  media: MediaItem;
  text?: string;
  createdAt: Date;
  expiresAt: Date;
  views: number;
}
```

#### Component Props Interfaces

```typescript
interface PhotoFeedProps {
  posts: Post[];
  onPostLike: (postId: string) => void;
  onPostComment: (postId: string, comment: string) => void;
  onLoadMore: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

interface ImageUploadProps {
  onUpload: (files: File[]) => void;
  onFiltersApply: (filters: FilterConfig) => void;
  maxFiles?: number;
  acceptedFormats?: string[];
  compressImages?: boolean;
  showPreview?: boolean;
}

interface UserProfileProps {
  user: User;
  posts: Post[];
  isOwnProfile: boolean;
  onFollow?: () => void;
  onMessage?: () => void;
  onPostSelect: (post: Post) => void;
  displayMode?: 'grid' | 'list';
}

interface StoriesBarProps {
  stories: Story[];
  onStoryView: (storyId: string) => void;
  onAddStory?: () => void;
  autoplay?: boolean;
  showAddButton?: boolean;
}
```

### API Reference

[⬆️ Back to Top](#--table-of-contents)

---

#### Content Management
- `POST /api/posts` - Upload new photo/video post with metadata and filters
- `GET /api/posts/:id` - Fetch specific post with comments and engagement data
- `PUT /api/posts/:id` - Edit post caption, location, or privacy settings
- `DELETE /api/posts/:id` - Delete post and associated media files
- `GET /api/posts/feed` - Get personalized feed with algorithmic ranking

#### Media Processing
- `POST /api/media/upload` - Upload raw media files with progress tracking
- `POST /api/media/filters` - Apply filters and effects to uploaded media
- `GET /api/media/optimize` - Get optimized media URLs for different screen sizes
- `POST /api/media/compress` - Compress media files for faster loading
- `GET /api/media/:id/metadata` - Get media EXIF data and technical information

#### Social Interactions
- `POST /api/posts/:id/like` - Like or unlike a post with engagement tracking
- `POST /api/posts/:id/comments` - Add comment to post with mention support
- `GET /api/posts/:id/comments` - Get paginated comments with nested replies
- `POST /api/users/:id/follow` - Follow or unfollow user with notification
- `GET /api/users/:id/followers` - Get user's followers list with pagination

#### Discovery & Search
- `GET /api/explore` - Get trending and recommended content for discovery
- `GET /api/search/posts` - Search posts by hashtags, location, or content
- `GET /api/search/users` - Search users by username, display name, or bio
- `GET /api/hashtags/trending` - Get trending hashtags with usage statistics
- `GET /api/locations/nearby` - Get nearby locations for photo tagging

#### Stories & Ephemeral Content
- `POST /api/stories` - Create new story with 24-hour expiration
- `GET /api/stories/feed` - Get stories from followed users in chronological order
- `PUT /api/stories/:id/view` - Mark story as viewed with analytics tracking
- `GET /api/stories/:id/viewers` - Get list of users who viewed the story
- `DELETE /api/stories/:id` - Delete story before expiration

#### User Profile
- `GET /api/users/:id/profile` - Get user profile with posts and statistics
- `PUT /api/users/profile` - Update user profile information and settings
- `GET /api/users/:id/posts` - Get user's posts with privacy filtering
- `POST /api/users/avatar` - Update user profile picture with cropping
- `GET /api/users/settings` - Get user privacy and notification preferences

---

## Performance and Scalability

[⬆️ Back to Top](#--table-of-contents)

---


### Image Delivery Optimization

[⬆️ Back to Top](#--table-of-contents)

---


#### Progressive Image Loading

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
stateDiagram-v2
    [*] --> BlurPlaceholder
    BlurPlaceholder --> LowResolution: Network available
    LowResolution --> MediumResolution: Viewport intersect
    MediumResolution --> HighResolution: User interaction
    HighResolution --> OriginalResolution: Full view request
    
    BlurPlaceholder --> OfflineMode: Network unavailable
    OfflineMode --> LowResolution: Connection restored
    
    note right of BlurPlaceholder
        Base64 blur (1-2KB)
        Immediate display
        Preserve layout
    end note
    
    note right of LowResolution
        WebP/AVIF small (20-50KB)
        Quick load
        Basic quality
    end note
    
    note right of HighResolution
        Full quality (200-500KB)
        Crisp display
        Optimal experience
    end note
```

#### CDN Caching Strategy

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph LR
    subgraph "Cache Layers"
        L1[Browser Cache<br/>Viewed Images<br/>TTL: 7 days]
        L2[Service Worker<br/>Critical Images<br/>TTL: 30 days]
        L3[CDN Edge<br/>Popular Images<br/>TTL: 30 days]
        L4[CDN Regional<br/>All Images<br/>TTL: 365 days]
        L5[Origin Storage<br/>Source Images<br/>Permanent]
    end
    
    subgraph "Smart Caching"
        POPULARITY[Popularity Tracking<br/>Hit count analysis]
        GEOGRAPHIC[Geographic Patterns<br/>Regional preferences]
        TEMPORAL[Temporal Patterns<br/>Time-based caching]
        PREDICTIVE[Predictive Caching<br/>ML-based prefetch]
    end
    
    USER[User Request] --> L1
    L1 -->|Miss| L2
    L2 -->|Miss| L3
    L3 -->|Miss| L4
    L4 -->|Miss| L5
    
    POPULARITY --> L3
    GEOGRAPHIC --> L4
    TEMPORAL --> L2
    PREDICTIVE --> L1
```

### Database Scaling Strategy

[⬆️ Back to Top](#--table-of-contents)

---


#### Sharding by User ID

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TB
    subgraph "User Sharding"
        SHARD_A[Shard A<br/>Users 0-250M<br/>US East]
        SHARD_B[Shard B<br/>Users 250-500M<br/>US West]
        SHARD_C[Shard C<br/>Users 500-750M<br/>EU Central]
        SHARD_D[Shard D<br/>Users 750M-1B<br/>Asia Pacific]
    end
    
    subgraph "Content Sharding"
        CONTENT_HOT[Hot Content<br/>Last 7 days<br/>SSD Storage]
        CONTENT_WARM[Warm Content<br/>Last 90 days<br/>Hybrid Storage]
        CONTENT_COLD[Cold Content<br/>Archive<br/>Object Storage]
    end
    
    subgraph "Cross-shard Operations"
        FEED_AGGREGATOR[Feed Aggregator<br/>Multi-shard queries]
        SEARCH_SERVICE[Global Search<br/>Elasticsearch cluster]
        ANALYTICS_SERVICE[Analytics Service<br/>Cross-shard metrics]
    end
    
    SHARD_A --> CONTENT_HOT
    SHARD_B --> CONTENT_WARM
    SHARD_C --> CONTENT_COLD
    SHARD_D --> FEED_AGGREGATOR
    
    FEED_AGGREGATOR --> SEARCH_SERVICE
    SEARCH_SERVICE --> ANALYTICS_SERVICE
```

### Upload Performance Optimization

[⬆️ Back to Top](#--table-of-contents)

---


#### Parallel Upload Strategy

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    A[User Selects Image] --> B[Client-side Validation<br/>Size, format, dimensions]
    B --> C[Image Preprocessing<br/>Compression, resizing]
    C --> D[Generate Upload Chunks<br/>5MB chunks for large files]
    D --> E[Parallel Upload<br/>Multiple chunks simultaneously]
    E --> F[Server-side Reassembly<br/>Reconstruct original]
    F --> G[Background Processing<br/>Generate variants]
    G --> H[CDN Distribution<br/>Global replication]
    
    subgraph "Upload Optimization"
        RESUMABLE[Resumable Uploads<br/>Handle network failures]
        DEDUPLICATION[Deduplication<br/>Hash-based detection]
        COMPRESSION[Smart Compression<br/>Quality vs size optimization]
        PRIORITIZATION[Upload Prioritization<br/>Critical images first]
    end
    
    E --> RESUMABLE
    F --> DEDUPLICATION
    G --> COMPRESSION
    H --> PRIORITIZATION
```

---

## Security and Privacy

[⬆️ Back to Top](#--table-of-contents)

---


### Content Moderation Pipeline

[⬆️ Back to Top](#--table-of-contents)

---


#### Automated Content Screening

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Upload Security"
        UPLOAD[Image Upload]
        VIRUS_SCAN[Virus Scanning<br/>Malware detection]
        METADATA_STRIP[Metadata Stripping<br/>EXIF data removal]
        HASH_CHECK[Hash Checking<br/>Known harmful content]
    end
    
    subgraph "AI Content Analysis"
        NSFW_DETECTION[NSFW Detection<br/>Adult content screening]
        VIOLENCE_DETECTION[Violence Detection<br/>Harmful imagery]
        FACE_DETECTION[Face Detection<br/>Privacy protection]
        TEXT_ANALYSIS[OCR Text Analysis<br/>Embedded text screening]
    end
    
    subgraph "Contextual Analysis"
        CAPTION_ANALYSIS[Caption Analysis<br/>NLP processing]
        HASHTAG_ANALYSIS[Hashtag Monitoring<br/>Trend analysis]
        USER_HISTORY[User History<br/>Behavioral patterns]
        COMMUNITY_REPORTS[Community Reports<br/>User flagging]
    end
    
    subgraph "Action Framework"
        AUTO_APPROVAL[Auto Approval<br/>Clean content]
        HUMAN_REVIEW[Human Review<br/>Borderline cases]
        AUTO_REJECT[Auto Rejection<br/>Policy violations]
        SHADOW_BAN[Shadow Ban<br/>Reduced visibility]
    end
    
    UPLOAD --> VIRUS_SCAN
    VIRUS_SCAN --> METADATA_STRIP
    METADATA_STRIP --> HASH_CHECK
    
    HASH_CHECK --> NSFW_DETECTION
    NSFW_DETECTION --> VIOLENCE_DETECTION
    VIOLENCE_DETECTION --> FACE_DETECTION
    FACE_DETECTION --> TEXT_ANALYSIS
    
    TEXT_ANALYSIS --> CAPTION_ANALYSIS
    CAPTION_ANALYSIS --> HASHTAG_ANALYSIS
    HASHTAG_ANALYSIS --> USER_HISTORY
    USER_HISTORY --> COMMUNITY_REPORTS
    
    COMMUNITY_REPORTS --> AUTO_APPROVAL
    COMMUNITY_REPORTS --> HUMAN_REVIEW
    COMMUNITY_REPORTS --> AUTO_REJECT
    COMMUNITY_REPORTS --> SHADOW_BAN
```

### Privacy Protection Framework

[⬆️ Back to Top](#--table-of-contents)

---


#### Data Protection Strategy

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Data Collection"
        MINIMAL_COLLECTION[Minimal Data Collection<br/>Need-to-know basis]
        EXPLICIT_CONSENT[Explicit Consent<br/>Clear purposes]
        GRANULAR_CONTROLS[Granular Controls<br/>Feature-specific permissions]
    end
    
    subgraph "Data Processing"
        ENCRYPTION_REST[Encryption at Rest<br/>AES-256 storage]
        ENCRYPTION_TRANSIT[Encryption in Transit<br/>TLS 1.3]
        TOKENIZATION[Data Tokenization<br/>Sensitive data protection]
        ANONYMIZATION[Data Anonymization<br/>Analytics processing]
    end
    
    subgraph "User Rights"
        DATA_PORTABILITY[Data Portability<br/>Export functionality]
        RIGHT_DELETION[Right to Deletion<br/>Account removal]
        ACCESS_CONTROL[Access Control<br/>Data viewing]
        CONSENT_WITHDRAWAL[Consent Withdrawal<br/>Opt-out mechanisms]
    end
    
    subgraph "Compliance"
        GDPR_COMPLIANCE[GDPR Compliance<br/>EU regulations]
        CCPA_COMPLIANCE[CCPA Compliance<br/>California privacy]
        COPPA_COMPLIANCE[COPPA Compliance<br/>Child protection]
        AUDIT_TRAILS[Audit Trails<br/>Access logging]
    end
    
    MINIMAL_COLLECTION --> ENCRYPTION_REST
    EXPLICIT_CONSENT --> ENCRYPTION_TRANSIT
    GRANULAR_CONTROLS --> TOKENIZATION
    
    ENCRYPTION_REST --> DATA_PORTABILITY
    ENCRYPTION_TRANSIT --> RIGHT_DELETION
    TOKENIZATION --> ACCESS_CONTROL
    ANONYMIZATION --> CONSENT_WITHDRAWAL
    
    DATA_PORTABILITY --> GDPR_COMPLIANCE
    RIGHT_DELETION --> CCPA_COMPLIANCE
    ACCESS_CONTROL --> COPPA_COMPLIANCE
    CONSENT_WITHDRAWAL --> AUDIT_TRAILS
```

---

## Testing, Monitoring, and Maintainability

[⬆️ Back to Top](#--table-of-contents)

---


### Testing Strategy

[⬆️ Back to Top](#--table-of-contents)

---


#### Comprehensive Testing Framework

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Unit Tests"
        UT1[Image Processing Tests<br/>Resize, compression algorithms]
        UT2[Feed Algorithm Tests<br/>Ranking, filtering logic]
        UT3[Upload Tests<br/>File validation, chunking]
        UT4[Security Tests<br/>Content moderation]
    end
    
    subgraph "Integration Tests"
        IT1[API Integration<br/>Upload, feed endpoints]
        IT2[Database Integration<br/>CRUD operations]
        IT3[CDN Integration<br/>Image delivery]
        IT4[Third-party Integration<br/>OAuth, payments]
    end
    
    subgraph "Performance Tests"
        PT1[Load Testing<br/>Concurrent uploads]
        PT2[Stress Testing<br/>Peak traffic simulation]
        PT3[Image Processing<br/>Batch processing limits]
        PT4[CDN Performance<br/>Global delivery speed]
    end
    
    subgraph "User Experience Tests"
        UX1[Visual Regression<br/>UI consistency]
        UX2[Accessibility Tests<br/>Screen reader support]
        UX3[Cross-platform Tests<br/>Device compatibility]
        UX4[Network Tests<br/>Offline functionality]
    end
    
    UT1 --> IT1
    UT2 --> IT2
    UT3 --> IT3
    UT4 --> IT4
    
    IT1 --> PT1
    IT2 --> PT2
    IT3 --> PT3
    IT4 --> PT4
    
    PT1 --> UX1
    PT2 --> UX2
    PT3 --> UX3
    PT4 --> UX4
```

### Monitoring and Analytics

[⬆️ Back to Top](#--table-of-contents)

---


#### Real-time Metrics Dashboard

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TB
    subgraph "User Experience Metrics"
        UPLOAD_SUCCESS[Upload Success Rate<br/>Target: >99%]
        IMAGE_LOAD_TIME[Image Load Time<br/>Target: <2s]
        FEED_REFRESH_TIME[Feed Refresh Time<br/>Target: <500ms]
        INTERACTION_LATENCY[Interaction Latency<br/>Target: <100ms]
    end
    
    subgraph "System Performance"
        CDN_HIT_RATE[CDN Hit Rate<br/>Target: >95%]
        PROCESSING_TIME[Image Processing Time<br/>Target: <30s]
        DATABASE_PERFORMANCE[Database Performance<br/>Query response time]
        API_THROUGHPUT[API Throughput<br/>Requests/second]
    end
    
    subgraph "Business Metrics"
        DAILY_UPLOADS[Daily Uploads<br/>Growth tracking]
        USER_ENGAGEMENT[User Engagement<br/>Session duration]
        CONTENT_QUALITY[Content Quality<br/>Moderation rates]
        REVENUE_METRICS[Revenue Metrics<br/>Ad performance]
    end
    
    subgraph "Alert Framework"
        THRESHOLD_ALERTS[Threshold Alerts<br/>Performance degradation]
        ANOMALY_DETECTION[Anomaly Detection<br/>Usage pattern changes]
        ERROR_TRACKING[Error Tracking<br/>Crash reporting]
        ESCALATION_POLICIES[Escalation Policies<br/>Incident response]
    end
    
    UPLOAD_SUCCESS --> THRESHOLD_ALERTS
    CDN_HIT_RATE --> ANOMALY_DETECTION
    DAILY_UPLOADS --> ERROR_TRACKING
    USER_ENGAGEMENT --> ESCALATION_POLICIES
```

---

## Trade-offs, Deep Dives, and Extensions

[⬆️ Back to Top](#--table-of-contents)

---


### Storage Strategy Trade-offs

[⬆️ Back to Top](#--table-of-contents)

---


| Approach | Object Storage (S3) | CDN-first | Distributed FS | Hybrid |
|----------|-------------------|-----------|----------------|---------|
| **Cost** | Medium | High | Low | Medium |
| **Performance** | Good | Excellent | Variable | Good |
| **Scalability** | Excellent | Excellent | Good | Excellent |
| **Complexity** | Low | Medium | High | High |
| **Global Reach** | Good | Excellent | Limited | Excellent |
| **Durability** | 99.999999999% | Dependent | Variable | High |

### Feed Algorithm Trade-offs

[⬆️ Back to Top](#--table-of-contents)

---


#### Chronological vs Algorithmic

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph LR
    subgraph "Chronological Feed"
        CHRONO_PROS[Pros:<br/>• Predictable<br/>• Transparent<br/>• Real-time<br/>• User control]
        CHRONO_CONS[Cons:<br/>• Lower engagement<br/>• Missed content<br/>• Quality variance<br/>• Limited discovery]
    end
    
    subgraph "Algorithmic Feed"
        ALGO_PROS[Pros:<br/>• Higher engagement<br/>• Better content<br/>• Personalized<br/>• Discovery features]
        ALGO_CONS[Cons:<br/>• Filter bubbles<br/>• Less transparency<br/>• Complex systems<br/>• Bias potential]
    end
    
    CHRONO_PROS -.->|Trade-off| ALGO_CONS
    ALGO_PROS -.->|Trade-off| CHRONO_CONS
```

### Advanced Features

[⬆️ Back to Top](#--table-of-contents)

---


#### AI-Powered Content Enhancement

[⬆️ Back to Top](#--table-of-contents)

---


```mermaid
graph TD
    subgraph "Computer Vision"
        OBJECT_DETECTION[Object Detection<br/>Auto-tagging]
        SCENE_RECOGNITION[Scene Recognition<br/>Context understanding]
        QUALITY_ASSESSMENT[Quality Assessment<br/>Technical evaluation]
        AESTHETIC_SCORING[Aesthetic Scoring<br/>Visual appeal]
    end
    
    subgraph "Content Intelligence"
        AUTO_CAPTIONING[Auto Captioning<br/>AI-generated descriptions]
        HASHTAG_SUGGESTIONS[Hashtag Suggestions<br/>Trend-aware recommendations]
        SIMILAR_CONTENT[Similar Content<br/>Recommendation engine]
        TREND_PREDICTION[Trend Prediction<br/>Viral potential]
    end
    
    subgraph "User Experience"
        SMART_CROPPING[Smart Cropping<br/>Focus-aware thumbnails]
        COLOR_ENHANCEMENT[Color Enhancement<br/>Automatic adjustments]
        ACCESSIBILITY[Accessibility<br/>Alt-text generation]
        PERSONALIZATION[Personalization<br/>Individual preferences]
    end
    
    OBJECT_DETECTION --> AUTO_CAPTIONING
    SCENE_RECOGNITION --> HASHTAG_SUGGESTIONS
    QUALITY_ASSESSMENT --> SIMILAR_CONTENT
    AESTHETIC_SCORING --> TREND_PREDICTION
    
    AUTO_CAPTIONING --> SMART_CROPPING
    HASHTAG_SUGGESTIONS --> COLOR_ENHANCEMENT
    SIMILAR_CONTENT --> ACCESSIBILITY
    TREND_PREDICTION --> PERSONALIZATION
```

### Future Extensions

[⬆️ Back to Top](#--table-of-contents)

---


#### Next-Generation Features

[⬆️ Back to Top](#--table-of-contents)

---


1. **Immersive Content**:
   - AR filters and effects
   - 3D photo viewing
   - Virtual gallery spaces
   - Interactive storytelling

2. **AI-Enhanced Creation**:
   - Style transfer filters
   - Content generation
   - Smart editing suggestions
   - Automated highlight reels

3. **Social Commerce**:
   - Shoppable posts
   - Virtual try-on
   - Influencer marketplace
   - Live shopping streams

4. **Advanced Analytics**:
   - Emotional engagement tracking
   - Visual trend analysis
   - Creator performance insights
   - Audience behavior mapping

This comprehensive design provides a robust foundation for building a scalable, engaging photo-sharing platform that handles millions of users while delivering high-quality visual experiences with advanced social features. 