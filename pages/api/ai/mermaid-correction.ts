import { NextApiRequest, NextApiResponse } from 'next';

interface MermaidCorrectionRequest {
  originalCode?: string;
  description?: string;
  errorMessage?: string;
  model_id?: string;
}

interface MermaidCorrectionResponse {
  success: boolean;
  correctedCode?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MermaidCorrectionResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { originalCode, description, errorMessage, model_id = 'gpt-4o-mini' }: MermaidCorrectionRequest = req.body;

    if (!originalCode && !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either originalCode or description is required' 
      });
    }

    // Create a prompt for Mermaid diagram correction/generation
    let prompt = '';
    
    if (originalCode && errorMessage) {
      prompt = `Fix this Mermaid diagram code that has an error:

Original Code:
\`\`\`mermaid
${originalCode}
\`\`\`

Error Message: ${errorMessage}

Please provide a corrected version of the Mermaid diagram that fixes the error while maintaining the same structure and information. Return only the corrected Mermaid code without any explanation.`;
    } else if (originalCode) {
      prompt = `Improve and optimize this Mermaid diagram code:

Original Code:
\`\`\`mermaid
${originalCode}
\`\`\`

Please provide an improved version that:
1. Fixes any syntax issues
2. Improves readability and layout
3. Uses better Mermaid syntax and features
4. Maintains the same information and structure

Return only the improved Mermaid code without any explanation.`;
    } else if (description) {
      prompt = `Create a Mermaid diagram based on this description:

Description: ${description}

Please create a clear and well-structured Mermaid diagram that visualizes the described concept. Choose the most appropriate diagram type (flowchart, sequence, class, etc.) based on the content. Return only the Mermaid code without any explanation.`;
    }

    // Call the general AI API
    const aiResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model_id,
        temperature: 0.3,
        max_tokens: 1000,
        system_prompt: 'You are an expert in Mermaid diagram syntax. Always return valid Mermaid code that renders correctly. Focus on clarity, proper syntax, and good visual structure.',
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    console.log('🔍 AI API Response:', { success: aiData.success, hasData: !!aiData.data, hasResponse: !!aiData.response });
    
    if (!aiData.success || !aiData.data) {
      console.error('❌ AI API failed:', aiData);
      throw new Error(`Failed to generate corrected Mermaid code: ${aiData.error || 'Unknown error'}`);
    }

    // Extract Mermaid code from response - AI generate API returns data in 'data' field
    let correctedCode = aiData.data.trim();
    
    if (!correctedCode) {
      throw new Error('AI generated empty response');
    }
    
    // Remove markdown code block formatting if present
    correctedCode = correctedCode.replace(/^```mermaid\n?/, '').replace(/\n?```$/, '');
    
    // Final check for empty code after cleanup
    if (!correctedCode.trim()) {
      throw new Error('Generated code is empty after cleanup');
    }
    
    console.log('✅ Generated Mermaid code length:', correctedCode.length);
    
    // Basic validation - ensure it starts with a valid Mermaid diagram type
    const validTypes = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram', 'journey', 'gantt', 'pie', 'gitgraph'];
    const startsWithValidType = validTypes.some(type => correctedCode.trim().toLowerCase().startsWith(type.toLowerCase()));
    
    if (!startsWithValidType) {
      console.warn('⚠️ Generated code may not be valid Mermaid syntax:', correctedCode.substring(0, 100));
      // Don't throw error here, as the code might still be valid but use newer syntax
    }

    return res.status(200).json({
      success: true,
      correctedCode: correctedCode.trim(),
    });

  } catch (error) {
    console.error('❌ Error in Mermaid correction:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to correct Mermaid diagram',
    });
  }
} 