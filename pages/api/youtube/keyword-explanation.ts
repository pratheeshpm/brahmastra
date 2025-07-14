import { NextApiRequest, NextApiResponse } from 'next';
import { createKeywordExplanationPrompt } from '@/utils/prompts/keywordsPrompt';

interface KeywordExplanationRequest {
  keyword: string;
  context: string;
  model_id?: string;
  videoId?: string;
  title?: string;
  forceRefresh?: boolean;
}

interface KeywordExplanationResponse {
  success: boolean;
  explanation?: string;
  error?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<KeywordExplanationResponse>) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      keyword, 
      context,
      model_id = 'gpt-4o-mini',
      videoId,
      title,
      forceRefresh = false
    }: KeywordExplanationRequest = req.body;

    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }

    if (!context || typeof context !== 'string') {
      return res.status(400).json({ success: false, error: 'Context is required' });
    }

    // Check cache first if videoId and title are provided
    if (videoId && title && !forceRefresh) {
      try {
        const cacheResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/youtube/keyword-explanations-cache?videoId=${encodeURIComponent(videoId)}&keyword=${encodeURIComponent(keyword)}&title=${encodeURIComponent(title)}`);
        
        if (cacheResponse.ok) {
          const cacheData = await cacheResponse.json();
          if (cacheData.success && cacheData.cached && cacheData.cached.length > 0) {
            console.log(`✅ Found cached explanation for keyword: ${keyword}`);
            return res.status(200).json({
              success: true,
              explanation: cacheData.cached[0].explanation,
            });
          }
        }
      } catch (cacheError) {
        console.warn('Cache check failed, proceeding with generation:', cacheError);
      }
    }

    // Use the explanation prompt from utils
    const prompt = createKeywordExplanationPrompt(keyword, context);

    const systemPrompt = `You are an expert system design and algorithms instructor with deep knowledge of computer science concepts, data structures, algorithms, and system architecture. You excel at explaining complex technical concepts clearly and creating accurate Mermaid diagrams.`;

    // Call the general AI API
    const aiResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model_id,
        system_prompt: systemPrompt,
        response_format: 'text',
        max_tokens: 1000,
        temperature: 0.4, // Slightly higher for more natural explanations
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      throw new Error(`AI API error: ${errorData.error || aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    
    if (!aiData.success) {
      throw new Error(`AI generation failed: ${aiData.error}`);
    }

    console.log(`✅ Generated explanation for keyword: ${keyword}`);

    // Save to cache if videoId and title are provided
    if (videoId && title) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/youtube/keyword-explanations-cache?videoId=${encodeURIComponent(videoId)}&title=${encodeURIComponent(title)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyword,
            explanation: aiData.data,
            model: model_id,
          }),
        });
        console.log(`💾 Cached explanation for keyword: ${keyword}`);
      } catch (cacheError) {
        console.warn('Failed to cache explanation:', cacheError);
      }
    }

    return res.status(200).json({
      success: true,
      explanation: aiData.data,
    });

  } catch (error) {
    console.error('Keyword explanation generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ success: false, error: errorMessage });
  }
};

export default handler; 