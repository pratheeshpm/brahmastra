import { DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';
import { NextApiRequest, NextApiResponse } from 'next';

interface GenerateRequest {
  prompt: string;
  model_id?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  response_format?: 'text' | 'json';
}

interface GenerateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<GenerateResponse>) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      prompt, 
      model_id = 'gpt-4o-mini', 
      temperature = DEFAULT_TEMPERATURE,
      max_tokens = 1000,
      system_prompt = 'You are a helpful assistant.',
      response_format = 'text'
    }: GenerateRequest = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    // Get the model configuration
    let model: OpenAIModel;
    if (model_id in OpenAIModels) {
      model = OpenAIModels[model_id as OpenAIModelID];
    } else {
      // Default fallback to GPT-4o-mini
      model = OpenAIModels[OpenAIModelID.GPT_4o_mini];
    }

    // Use OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(401).json({ success: false, error: 'OpenAI API key is required' });
    }

    const messages = [
      {
        role: 'system' as const,
        content: system_prompt,
      },
      {
        role: 'user' as const,
        content: prompt,
      }
    ];

    console.log(`🤖 Generating response with OpenAI ${model_id}, format: ${response_format}`);

    // Check if model requires max_completion_tokens instead of max_tokens
    const requiresMaxCompletionTokens = model.id.startsWith('o3') || model.id.startsWith('o1') || model.id.startsWith('gpt-5');
    const tokenParam = requiresMaxCompletionTokens ? 'max_completion_tokens' : 'max_tokens';

    const requestBody: any = {
      model: model.id,
      messages,
      [tokenParam]: max_tokens,
      temperature,
    };

    // Add JSON mode if requested (only supported by certain models)
    if (response_format === 'json' && (model_id.includes('gpt-4') || model_id.includes('gpt-3.5'))) {
      requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI API');
    }

    let responseData: any;
    
    if (response_format === 'json') {
      try {
        responseData = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', content);
        // If JSON parsing fails, return the raw content
        responseData = { text: content };
      }
    } else {
      responseData = content;
    }

    console.log(`✅ Successfully generated response, length: ${content.length} chars`);

    return res.status(200).json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error('AI generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return res.status(500).json({ success: false, error: errorMessage });
  }
};

export default handler; 