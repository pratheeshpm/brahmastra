import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { SUMMARIZATION_PROMPT, SHORT_SUMMARIZATION_PROMPT } from '@/utils/app/prompts';
import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';
import * as fs from 'fs';
import * as path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

// Using Node.js runtime to support filesystem operations for caching
// export const config = {
//   runtime: 'edge',
// };

const SUMMARY_CACHE_DIR = path.join(process.cwd(), 'summary-cache');

// Ensure cache directory exists
const ensureCacheDir = () => {
  if (!fs.existsSync(SUMMARY_CACHE_DIR)) {
    fs.mkdirSync(SUMMARY_CACHE_DIR, { recursive: true });
  }
};

// Generate cache filename (including version to invalidate old caches with ultra-detailed prompts)
const getCacheFilename = (videoId: string, title: string, model: string) => {
  const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 50);
  return `${videoId}_${cleanTitle}_${model}_v5.json`;
};

// Check if summary is cached
const getCachedSummary = (videoId: string, title: string, model: string) => {
  try {
    ensureCacheDir();
    const filename = getCacheFilename(videoId, title, model);
    const filePath = path.join(SUMMARY_CACHE_DIR, filename);
    
    console.log(`🔍 Looking for cached summary:`);
    console.log(`   VideoId: ${videoId}`);
    console.log(`   Title: ${title}`);
    console.log(`   Model: ${model}`);
    console.log(`   Generated filename: ${filename}`);
    console.log(`   Full path: ${filePath}`);
    console.log(`   File exists: ${fs.existsSync(filePath)}`);
    
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`✅ Found cached summary for ${videoId} (${model})`);
      return data;
    } else {
      console.log(`❌ Cache file not found: ${filename}`);
      // List all files in cache directory for debugging
      const allFiles = fs.readdirSync(SUMMARY_CACHE_DIR);
      console.log(`📁 All cache files:`, allFiles.filter(f => f.startsWith(videoId)));
    }
  } catch (error) {
    console.error('Error reading cached summary:', error);
  }
  return null;
};

// Save summary to cache
const saveSummaryToCache = (videoId: string, title: string, model: string, summary: string) => {
  try {
    ensureCacheDir();
    const filename = getCacheFilename(videoId, title, model);
    const filePath = path.join(SUMMARY_CACHE_DIR, filename);
    
    console.log(`📁 Cache directory: ${SUMMARY_CACHE_DIR}`);
    console.log(`📄 Cache filename: ${filename}`);
    console.log(`🗂️ Full cache path: ${filePath}`);
    
    const cacheData = {
      videoId,
      title,
      model,
      summary,
      cachedAt: new Date().toISOString(),
      generatedAt: Date.now()
    };
    
    fs.writeFileSync(filePath, JSON.stringify(cacheData, null, 2));
    console.log(`✅ Successfully saved summary to cache: ${filename}`);
    
    // Verify the file was written
    if (fs.existsSync(filePath)) {
      const fileSize = fs.statSync(filePath).size;
      console.log(`✅ Cache file verified, size: ${fileSize} bytes`);
    } else {
      console.error(`❌ Cache file was not created: ${filePath}`);
    }
  } catch (error) {
    console.error('❌ Error saving summary to cache:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
};

// Function to fetch full video description
const fetchVideoDescription = async (videoId: string) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/youtube/details?video_id=${videoId}`);
    if (response.ok) {
      const data = await response.json();
      return data.description || '';
    }
  } catch (error) {
    console.error('Failed to fetch video description:', error);
  }
  return '';
};

// Custom OpenAI stream function that properly parses SSE data
const createOpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature: number,
  apiKey: string,
  messages: any[]
) => {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: model.id,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      max_tokens: 2000,
      temperature: temperature,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;

          try {
            const json = JSON.parse(data);
            if (json.choices[0].finish_reason != null) {
              controller.close();
              return;
            }
            const text = json.choices[0].delta.content;
            if (text) {
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            }
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);
      
      if (response.body) {
        for await (const chunk of response.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      }
    },
  });

  return stream;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transcript, key, model_id, video_id, title, force_refresh } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Use GPT-4o by default for summarization
    const modelId = model_id || 'gpt-4o-mini';
    const videoId = video_id || 'unknown';
    const videoTitle = title || 'Unknown Video';

    // Check cache first (unless force refresh is requested)
    if (!force_refresh) {
      const cachedSummary = getCachedSummary(videoId, videoTitle, modelId);
      if (cachedSummary && cachedSummary.summary) {
        console.log(`🚀 Returning cached summary for ${videoId}`);
        
        // Return cached summary as SSE stream for consistency
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control',
          'X-Cache-Status': 'hit',
          'X-Cache-Date': cachedSummary.cachedAt,
        });
        
        // Send cached content as a single event
        res.write(`data: ${JSON.stringify({ content: cachedSummary.summary })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        return res.end();
      }
    }
    
    // Get the model configuration
    let model: OpenAIModel;
    if (modelId in OpenAIModels) {
      model = OpenAIModels[modelId as OpenAIModelID];
    } else {
      // Default fallback to GPT-4o-mini
      model = OpenAIModels[OpenAIModelID.GPT_4o_mini];
    }

    // Fetch the full video description for additional context
    console.log(`📄 Fetching video description for ${videoId}...`);
    const videoDescription = await fetchVideoDescription(videoId);
    
    // Prepare the content with description and transcript
    let contentToAnalyze = '';
    
    if (videoDescription.trim()) {
      contentToAnalyze += `**VIDEO DESCRIPTION:**\n${videoDescription}\n\n---\n\n`;
    }
    
    contentToAnalyze += `**VIDEO TRANSCRIPT:**\n${transcript}`;
    
    // Truncate if too long for the model (keeping description intact if possible)
    const maxContentLength = Math.floor(model.maxLength * 0.7); // Leave room for prompt and response
    if (contentToAnalyze.length > maxContentLength) {
      const descriptionLength = videoDescription.length + 50; // Add some buffer for formatting
      const maxTranscriptLength = maxContentLength - descriptionLength;
      
      if (maxTranscriptLength > 1000) { // Only truncate transcript if we have reasonable space left
        const truncatedTranscript = transcript.substring(0, maxTranscriptLength) + "\n\n[Transcript truncated due to length...]";
        contentToAnalyze = '';
        if (videoDescription.trim()) {
          contentToAnalyze += `**VIDEO DESCRIPTION:**\n${videoDescription}\n\n---\n\n`;
        }
        contentToAnalyze += `**VIDEO TRANSCRIPT:**\n${truncatedTranscript}`;
      } else {
        // If description is too long, truncate everything
        contentToAnalyze = contentToAnalyze.substring(0, maxContentLength) + "\n\n[Content truncated due to length...]";
      }
    }

    const messages = [
      {
        role: 'user' as const,
        content: `Please analyze and summarize this YouTube video:\n\n${contentToAnalyze}`
      }
    ];

    console.log(`🤖 Summarizing transcript with OpenAI ${modelId}, length: ${transcript.length} chars`);

    // Use OpenAI API key - prioritize passed key, then environment variable
    const apiKey = key || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'OpenAI API key is required' });
    }
    
    // Set headers for Server-Sent Events streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Cache-Status': 'miss',
    });
    
    const originalStream = await createOpenAIStream(
      model,
      SHORT_SUMMARIZATION_PROMPT, //SUMMARIZATION_PROMPT,
      DEFAULT_TEMPERATURE,
      apiKey,
      messages
    );

    // Stream the response and capture for caching
    let fullSummary = '';
    const decoder = new TextDecoder();
    
    const reader = originalStream?.getReader();
    if (!reader) {
      res.write(`data: ${JSON.stringify({ error: 'Failed to create stream' })}\n\n`);
      return res.end();
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullSummary += chunk;
        
        // Send as Server-Sent Event
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      
      // Save to cache after streaming is complete
      if (fullSummary.trim()) {
        console.log(`💾 Attempting to save summary to cache for videoId: ${videoId}, title: ${videoTitle}, model: ${modelId}`);
        console.log(`📝 Summary length: ${fullSummary.length} characters`);
        saveSummaryToCache(videoId, videoTitle, modelId, fullSummary);
      } else {
        console.warn(`⚠️ No summary content to save for videoId: ${videoId}`);
      }
      
      // Send final event to indicate completion
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error('Streaming error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('Summarization error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ error: errorMessage });
  }
};

export default handler; 