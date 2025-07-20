import { NextApiRequest, NextApiResponse } from 'next';
import { OPENROUTER_API_KEY } from '@/utils/app/const';

interface PerplexitySearchRequest {
  query: string;
  sources?: string[];
  max_tokens?: number;
  temperature?: number;
  model?: string;
  search_domain_filter?: string[];
  search_recency_filter?: string;
  return_citations?: boolean;
  return_images?: boolean;
  return_related_questions?: boolean;
  stream?: boolean;
}

interface PerplexitySearchResponse {
  success: boolean;
  query: string;
  error?: string;
}

// Function to create OpenRouter stream for Perplexity Sonar
const createPerplexityStream = async (
  query: string,
  apiKey: string,
  options: {
    sources?: string[];
    max_tokens?: number;
    temperature?: number;
    model?: string;
    search_domain_filter?: string[];
    search_recency_filter?: string;
    return_citations?: boolean;
    return_images?: boolean;
    return_related_questions?: boolean;
    stream?: boolean;
  } = {}
) => {
  const url = 'https://openrouter.ai/api/v1/chat/completions';
  
  // Extract options with defaults
  const {
    sources,
    max_tokens = 4000,
    temperature = 0.7,
    model = 'perplexity/sonar-pro',
    search_domain_filter,
    search_recency_filter,
    return_citations = true,
    return_images = false,
    return_related_questions = false,
    stream = true
  } = options;
  
  console.log('🚀 Making Perplexity Sonar API call...');
  console.log('📝 API URL:', url);
  console.log('🔑 API Key exists:', !!apiKey);
  console.log('🔑 API Key length:', apiKey?.length || 0);
  console.log('📊 Model:', model);
  console.log('📝 Query:', query);
  console.log('🌐 Sources:', sources);
  console.log('🔍 Domain Filter:', search_domain_filter);
  console.log('⏰ Recency Filter:', search_recency_filter);
  console.log('📚 Return Citations:', return_citations);
  
  let systemPrompt = 'You are a helpful AI assistant that searches the web and provides comprehensive, accurate, and up-to-date information. Always cite your sources with [number] references and provide the complete source URLs at the end of your response.';
  
  if (return_citations) {
    systemPrompt += ' Include detailed citations with URLs for all sources used in your research.';
  }
  
  if (search_domain_filter && search_domain_filter.length > 0) {
    systemPrompt += ` Focus your search on these domains: ${search_domain_filter.join(', ')}.`;
  }
  
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    {
      role: 'user',
      content: query
    }
  ];

  // Add sources if provided
  if (sources && sources.length > 0) {
    messages[0].content += ` Focus your search on these specific sources: ${sources.join(', ')}.`;
  }

      const requestBody: any = {
      model,
      messages,
      max_tokens,
      temperature,
      stream: stream, // Configurable streaming based on user preference
    };
  
  // Add Perplexity-specific parameters
  if (search_domain_filter && search_domain_filter.length > 0) {
    requestBody.search_domain_filter = search_domain_filter;
  }
  
  if (search_recency_filter) {
    requestBody.search_recency_filter = search_recency_filter;
  }
  
  if (return_citations) {
    requestBody.return_citations = return_citations;
  }
  
  if (return_images) {
    requestBody.return_images = return_images;
  }
  
  if (return_related_questions) {
    requestBody.return_related_questions = return_related_questions;
  }
  
  console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://localhost:3000',
      'X-Title': 'Perplexity Web Search',
    },
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  console.log('📥 Response status:', response.status);
  console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    console.error('❌ Perplexity API error response status:', response.status);
    const errorText = await response.text();
    console.error('❌ Perplexity API error response text:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
      console.error('❌ Perplexity API error data:', errorData);
    } catch (parseError) {
      console.error('❌ Failed to parse error response as JSON:', parseError);
      errorData = { error: { message: errorText } };
    }
    
    throw new Error(`Perplexity API error: ${errorData.error?.message || response.statusText}`);
  }

  return response;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('🚀 Perplexity Search API called');
  console.log('📝 Request method:', req.method);
  
  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      query: '',
      error: 'Method not allowed. Use POST.' 
    });
  }

      try {
      const { 
        query, 
        sources, 
        max_tokens = 4000, 
        temperature = 0.7,
        model = 'perplexity/sonar-pro',
        search_domain_filter,
        search_recency_filter,
        return_citations = true,
        return_images = false,
        return_related_questions = false,
        stream = true
      }: PerplexitySearchRequest = req.body;
    
    console.log('📊 Request parameters:');
    console.log('  - Query:', query);
    console.log('  - Sources:', sources);
    console.log('  - Max tokens:', max_tokens);
    console.log('  - Temperature:', temperature);

    if (!query || !query.trim()) {
      console.log('❌ Query is empty or missing');
      return res.status(400).json({
        success: false,
        query: query || '',
        error: 'Query is required'
      });
    }

    // Check if OpenRouter API key is available
    const apiKey = OPENROUTER_API_KEY;
    console.log('🔑 Checking API key...');
    console.log('🔑 API key exists:', !!apiKey);
    console.log('🔑 API key length:', apiKey?.length || 0);
    console.log('🔑 API key first 10 chars:', apiKey?.substring(0, 10) || 'N/A');
    
    if (!apiKey) {
      console.log('❌ OpenRouter API key is missing');
      return res.status(401).json({
        success: false,
        query,
        error: 'OpenRouter API key is required'
      });
    }

    // Set headers for Server-Sent Events (SSE)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    // Send initial message
    res.write(`data: ${JSON.stringify({ 
      type: 'start', 
      message: 'Starting Perplexity search...',
      query 
    })}\n\n`);

          // Call Perplexity Sonar API
      console.log('🤖 Calling Perplexity Sonar API...');
      console.log('📊 Stream mode:', stream);
      const streamResponse = await createPerplexityStream(
        query, 
        apiKey, 
        {
          sources,
          max_tokens,
          temperature,
          model,
          search_domain_filter,
          search_recency_filter,
          return_citations,
          return_images,
          return_related_questions,
          stream
        }
      );
    
    if (stream) {
      // Handle streaming response
      if (streamResponse.body) {
      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('✅ Stream completed');
            res.write(`data: ${JSON.stringify({ 
              type: 'end', 
              message: 'Search completed' 
            })}\n\n`);
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          console.log('📦 Received chunk:', chunk);
          
          // Parse and forward SSE chunks
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                console.log('✅ Stream finished with [DONE]');
                res.write(`data: ${JSON.stringify({ 
                  type: 'end', 
                  message: 'Search completed' 
                })}\n\n`);
                break;
              }
              
                                try {
                    const parsed = JSON.parse(data);
                    
                    // Handle regular content chunks
                    if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                      const delta = parsed.choices[0].delta;
                      if (delta.content) {
                        // Forward the content chunk to client
                        res.write(`data: ${JSON.stringify({ 
                          type: 'content', 
                          content: delta.content,
                          usage: parsed.usage,
                          citations: parsed.citations || []
                        })}\n\n`);
                      }
                    }
                    
                    // Handle final message with potential citations/usage
                    if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
                      const message = parsed.choices[0].message;
                      
                      // Check for annotations with citations
                      if (message.annotations && message.annotations.length > 0) {
                        const citationUrls = message.annotations
                          .filter((ann: any) => ann.type === 'url_citation' && ann.url_citation)
                          .map((ann: any) => ({
                            url: ann.url_citation.url,
                            title: ann.url_citation.title || ann.url_citation.url
                          }));
                          
                        if (citationUrls.length > 0) {
                          res.write(`data: ${JSON.stringify({ 
                            type: 'citations', 
                            citations: citationUrls
                          })}\n\n`);
                        }
                      }
                    }
                    
                    // Handle top-level citations if available
                    if (parsed.citations && parsed.citations.length > 0) {
                      const citationObjects = parsed.citations.map((url: string, index: number) => ({
                        url: url,
                        title: `Source ${index + 1}`,
                        index: index + 1
                      }));
                      
                      res.write(`data: ${JSON.stringify({ 
                        type: 'citations', 
                        citations: citationObjects
                      })}\n\n`);
                    }
                    
                    // Handle usage information
                    if (parsed.usage) {
                      res.write(`data: ${JSON.stringify({ 
                        type: 'usage', 
                        usage: parsed.usage
                      })}\n\n`);
                    }
                  } catch (parseError) {
                    console.warn('⚠️ Could not parse chunk:', data);
                  }
            }
          }
        }
      } catch (streamError) {
        console.error('❌ Stream error:', streamError);
        res.write(`data: ${JSON.stringify({ 
          type: 'error', 
          error: 'Stream processing error' 
        })}\n\n`);
      } finally {
        reader.releaseLock();
      }
      } else {
        console.error('❌ No response body available for streaming');
        res.write(`data: ${JSON.stringify({ 
          type: 'error', 
          error: 'No response body available' 
        })}\n\n`);
      }
    } else {
      // Handle non-streaming response with full citations
      console.log('📄 Processing non-streaming response...');
      const data = await streamResponse.json();
      
      console.log('📋 Non-streaming response structure:');
      console.log('  - Has choices:', !!data.choices);
      console.log('  - Has citations:', !!data.citations);
      console.log('  - Citations count:', data.citations?.length || 0);
      
      // Send the complete response
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const message = data.choices[0].message;
        
        // Send content
        res.write(`data: ${JSON.stringify({ 
          type: 'content', 
          content: message.content,
          usage: data.usage
        })}\n\n`);
        
        // Send citations if available
        let citationsSent = false;
        
        // Check for top-level citations first
        if (data.citations && data.citations.length > 0) {
          const citationObjects = data.citations.map((url: string, index: number) => ({
            url: url,
            title: `Source ${index + 1}`,
            index: index + 1
          }));
          
          res.write(`data: ${JSON.stringify({ 
            type: 'citations', 
            citations: citationObjects
          })}\n\n`);
          citationsSent = true;
        }
        
        // Check for annotations with detailed citations
        if (message.annotations && message.annotations.length > 0) {
          const citationUrls = message.annotations
            .filter((ann: any) => ann.type === 'url_citation' && ann.url_citation)
            .map((ann: any) => ({
              url: ann.url_citation.url,
              title: ann.url_citation.title || ann.url_citation.url
            }));
            
          if (citationUrls.length > 0 && !citationsSent) {
            res.write(`data: ${JSON.stringify({ 
              type: 'citations', 
              citations: citationUrls
            })}\n\n`);
            citationsSent = true;
          }
        }
        
        // Send usage information
        if (data.usage) {
          res.write(`data: ${JSON.stringify({ 
            type: 'usage', 
            usage: data.usage
          })}\n\n`);
        }
        
        // Send completion message
        res.write(`data: ${JSON.stringify({ 
          type: 'end', 
          message: `Search completed (non-streaming mode - ${citationsSent ? 'with citations' : 'no citations found'})` 
        })}\n\n`);
      } else {
        res.write(`data: ${JSON.stringify({ 
          type: 'error', 
          error: 'Invalid response structure' 
        })}\n\n`);
      }
    }
    
    res.end();
    
  } catch (error) {
    console.error('❌ Perplexity search error:', error);
    
    // Send error through SSE if headers already sent
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })}\n\n`);
      res.end();
    } else {
      return res.status(500).json({
        success: false,
        query: req.body?.query || '',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
};

export default handler; 