import { NextApiRequest, NextApiResponse } from 'next';
import { createKeywordsPrompt } from '@/utils/prompts/keywordsPrompt';

interface KeywordsRequest {
  summary: string;
  model_id?: string;
  max_keywords?: number;
  videoId?: string;
  title?: string;
}

interface KeywordsResponse {
  success: boolean;
  keywords?: string[];
  error?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<KeywordsResponse>) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      summary, 
      model_id = 'gpt-4o-mini',
      max_keywords = 10,
      videoId,
      title
    }: KeywordsRequest = req.body;

    if (!summary || typeof summary !== 'string') {
      return res.status(400).json({ success: false, error: 'Summary is required' });
    }

    // Use the enhanced prompt from utils
    const prompt = createKeywordsPrompt(summary, max_keywords);

    const systemPrompt = `You are an expert at extracting relevant technical keywords from system design and algorithms content. You specialize in identifying the most important algorithms, data structures, design patterns, and technical concepts that would be useful for learning and reference purposes.`;

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
        response_format: 'json',
        max_tokens: 500,
        temperature: 0.3, // Lower temperature for more consistent keyword extraction
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

    // Extract keywords from the AI response
    let keywords: string[] = [];
    
    if (aiData.data && typeof aiData.data === 'object' && aiData.data.keywords) {
      keywords = aiData.data.keywords;
    } else if (aiData.data && typeof aiData.data === 'string') {
      // Fallback: try to parse keywords from text response
      try {
        const parsed = JSON.parse(aiData.data);
        keywords = parsed.keywords || [];
      } catch (parseError) {
        // If JSON parsing fails, extract keywords from text
        const lines = aiData.data.split('\n').filter((line: string) => line.trim().length > 0);
        keywords = lines.map((line: string) => line.replace(/^[-*•]\s*/, '').trim()).slice(0, max_keywords);
      }
    }

    // Validate and clean keywords
    keywords = keywords
      .filter((keyword: string) => keyword && typeof keyword === 'string')
      .map((keyword: string) => keyword.trim())
      .filter((keyword: string) => keyword.length > 0 && keyword.split(' ').length <= 3)
      .slice(0, max_keywords);

    console.log(`✅ Generated ${keywords.length} keywords from summary`);

    // Save keywords to cache if videoId and title are provided
    if (videoId && title) {
      try {
        const cacheResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/youtube/summary-cache`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId,
            title,
            keywords,
            model: model_id,
          }),
        });

        if (cacheResponse.ok) {
          console.log(`💾 Keywords saved to cache for video: ${videoId}`);
        } else {
          console.warn(`⚠️ Failed to save keywords to cache for video: ${videoId}`);
        }
      } catch (error) {
        console.error('❌ Error saving keywords to cache:', error);
      }
    }

    return res.status(200).json({
      success: true,
      keywords,
    });

  } catch (error) {
    console.error('Keywords generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ success: false, error: errorMessage });
  }
};

export default handler; 