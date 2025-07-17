import { Message } from '@/types/chat';
import { OpenAIModel } from '@/types/openai';
import  { OpenAIClient, AzureKeyCredential } from "@azure/openai";
import { getOpenAIApiHost, getOpenAIApiType, getOpenAIApiVersion, OPENAI_ORGANIZATION, AZURE_GPT4_KEY, OPENROUTER_API_KEY, AZURE_DEPLOYMENT_ID, GEMINI_API_KEY } from '../app/const';

import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';

export class OpenAIError extends Error {
  type: string;
  param: string;
  code: string;

  constructor(message: string, type: string, param: string, code: string) {
    super(message);
    this.name = 'OpenAIError';
    this.type = type;
    this.param = param;
    this.code = code;
  }
}

export const OpenAIStream = async (
  model: OpenAIModel,
  systemPrompt: string,
  temperature : number,
  key: string,
  messages: Message[],
  apiProvider?: 'openai' | 'openrouter' | 'azure' | 'gemini',
) => {
  console.log("🚀 ~ OpenAI Stream ~ model:", model.name)
  console.log("🚀 ~ OpenAI Stream ~ messages count:", messages.length)
  
  // Use the provided apiProvider or default to current setting
  const currentApiType = getOpenAIApiType(apiProvider);
  const currentApiHost = getOpenAIApiHost(apiProvider);
  const currentApiVersion = getOpenAIApiVersion(apiProvider);
  
  let url = `${currentApiHost}/v1/chat/completions`;
  let res: any;
  //url = `${OPENAI_API_HOST}/openai/deployments/${AZURE_DEPLOYMENT_ID}/chat/completions?api-version=${OPENAI_API_VERSION}`;
  if(currentApiType === 'gemini'){
    // Handle Gemini API calls
    const apiKey = key || GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    url = `${currentApiHost}/${currentApiVersion}/models/${model.id}:generateContent?key=${apiKey}`;
    
    // Convert messages to Gemini format
    const geminiMessages = messages.map(msg => {
      if (typeof msg.content === 'string') {
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        };
      } else if (Array.isArray(msg.content)) {
        const parts = msg.content.map(item => {
          if (item.type === 'text') {
            return { text: item.text || '' };
          } else if (item.type === 'image_url') {
            // For images, we'd need to convert to base64 format that Gemini expects
            return { text: `[Image: ${item.image_url?.url || 'No URL'}]` };
          }
          return { text: '' };
        });
        return {
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts
        };
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(msg.content) }]
      };
    });
    
    // Add system prompt as the first message if provided
    const contents = systemPrompt 
      ? [{ role: 'user', parts: [{ text: systemPrompt }] }, ...geminiMessages]
      : geminiMessages;
    
    const requestBody = {
      contents,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 8000,
      }
    };
    
    console.log("🚀 ~ Gemini request ~ model:", model.id, "~ contents:", contents.length);
    console.log("🚀 ~ Gemini API Key present:", !!apiKey);
    
    res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }
  else if(currentApiType === 'azure'){
    const client = new OpenAIClient(
      currentApiHost,
    new AzureKeyCredential(AZURE_GPT4_KEY));
    console.log("🚀 ~ file: index.ts:43 ~ client:",messages)
    // Convert messages to the expected format for Azure API
    const azureMessages = messages.map(msg => ({
      role: msg.role,
      content: typeof msg.content === 'string' ? msg.content : msg.content.map(item => {
        if (item.type === 'text') {
          return item.text || '';
        } else if (item.type === 'image_url') {
          return `[Image: ${item.image_url?.url || 'No URL'}]`;
        }
        return '';
      }).join(' ')
    }));
    console.log("\n\n\n🚀 ~ file: index.ts:53 ~ OPENROUTER_API_KEY:",OPENROUTER_API_KEY)
  
    res = await client.getChatCompletions(
      AZURE_DEPLOYMENT_ID, // assumes a matching model deployment or model name
      [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...azureMessages,
      ],
      /* { stream: true } */
      )
  } else if (currentApiType === 'openrouter') {
    url = `https://openrouter.ai/api/v1/chat/completions`;
    
    // Check if model requires max_completion_tokens instead of max_tokens
    const requiresMaxCompletionTokens = model.id.startsWith('o3') || model.id.startsWith('o1');
    const tokenParam = requiresMaxCompletionTokens ? 'max_completion_tokens' : 'max_tokens';
    
    const requestBody = {
      model: model.id === 'openrouter' ? 'anthropic/claude-sonnet-4' : model.id, // Use sonnet 4 as default under openrouter
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : msg.content
        })),
      ],
      [tokenParam]: 100000,
      temperature: temperature,
      stream: true,
    };
    
    console.log("🚀 ~ OpenRouter request ~ model:", requestBody.model, "~ messages:", requestBody.messages.length);
    
    res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key ? key : OPENROUTER_API_KEY}`,
        'HTTP-Referer': '', // Optional: Replace with your app URL for OpenRouter leaderboards
        'X-Title': '', // Optional: Replace with your app name for OpenRouter leaderboards
      },
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  } else {
    let otherHeaders = {};
    if(currentApiType === 'openai'){
      otherHeaders = {Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`}
      if(OPENAI_ORGANIZATION){
        otherHeaders = {...otherHeaders, 'OpenAI-Organization': OPENAI_ORGANIZATION}
      }
    }else {
      otherHeaders = {'api-key': `${key ? key : process.env.OPENAI_API_KEY}`}
    }

    // Check if model requires max_completion_tokens instead of max_tokens
    const requiresMaxCompletionTokens = model.id.startsWith('o3') || model.id.startsWith('o1');
    const tokenParam = requiresMaxCompletionTokens ? 'max_completion_tokens' : 'max_tokens';
    
    const requestBody = {
      ...(currentApiType === 'openai' && {model: model.id}),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: typeof msg.content === 'string' ? msg.content : msg.content
        })),
      ],
      [tokenParam]: 1000,
      temperature: temperature,
      stream: true,
    };
    
    console.log("🚀 ~ OpenAI request ~ model:", requestBody.model, "~ messages:", requestBody.messages.length);
    
    res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...otherHeaders
      },
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Handle Gemini API responses
  if (currentApiType === 'gemini') {
    if (res.status !== 200) {
      const result = await res.json();
      throw new Error(`Gemini API returned an error: ${result.error?.message || res.statusText}`);
    }
    
    const result = await res.json();
    console.log("🚀 ~ Gemini response:", result);
    
    // Extract text from Gemini response
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Create a simple stream that returns the text
    const stream = new ReadableStream({
      start(controller) {
        const queue = encoder.encode(text);
        controller.enqueue(queue);
        controller.close();
      },
    });
    
    return stream;
  }

  if ((currentApiType === 'openai' || currentApiType === 'openrouter') && res.status !== 200) {
    const result = await res.json();
    if (result.error) {
      throw new OpenAIError(
        result.error.message,
        result.error.type,
        result.error.param,
        result.error.code,
      );
    } else {
      throw new Error(
        `OpenAI API returned an error: ${
          decoder.decode(result?.value) || result.statusText
        }`,
      );
    }
  }else{
    if(currentApiType === 'azure')
      return res && res.choices &&res.choices[0] &&res.choices[0]['message']['content']
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        //console.log("\n\n\n🚀 ~ file: index.ts:112 ~ onParse ~ event:", event)
        if (event.type === 'event') {
          const data = event.data;

          try {
            const json = JSON.parse(data);
            //console.log("\n\n\n🚀 ~ file: index.ts:123 ~ onParse ~ json:", json)
            if (json.choices[0].finish_reason != null) {
              controller.close();
              return;
            }
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);
     // console.log("🚀 ~ file: index.ts:134 ~ forawait ~ chunk:", (OPENAI_API_TYPE === 'openai') ? res.body : res)
      // let resBody = ;
      for await (const chunk of ((currentApiType === 'openai' || currentApiType === 'openrouter') ? res.body : res) as any) {
       // console.log("🚀 ~ file: index.ts:134 ~ forawait ~ chunk:", chunk,decoder.decode(chunk))
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
