import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server';

import { ChatBody, Message } from '@/types/chat';

// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { model, messages, key, prompt, temperature, imageData, apiProvider } = (await req.json()) as ChatBody & { 
      imageData?: string;
      apiProvider?: 'openai' | 'openrouter' | 'azure' | 'gemini';
    };
    console.log("🚀 ~ file: chat.ts:19 ~ handler ~  model, messages, key, prompt, temperature, imageData, apiProvider :",  model, messages, key, prompt, temperature, !!imageData, apiProvider )

    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    let promptToSend = prompt;
    if (!promptToSend) {
      promptToSend = DEFAULT_SYSTEM_PROMPT;
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      // Handle both string and multimodal content for token counting
      const contentText = typeof message.content === 'string' ? message.content : 
        (Array.isArray(message.content) ? message.content.find(c => c.type === 'text')?.text || '' : '');
      const tokens = encoding.encode(contentText);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    // If we have image data, modify the last message to include the image
    if (imageData && messagesToSend.length > 0) {
      const lastMessage = messagesToSend[messagesToSend.length - 1];
      const textContent = typeof lastMessage.content === 'string' ? lastMessage.content : 
        (Array.isArray(lastMessage.content) ? lastMessage.content.find(c => c.type === 'text')?.text || '' : '');
      
      messagesToSend[messagesToSend.length - 1] = {
        ...lastMessage,
        content: [
          {
            type: 'text',
            text: textContent
          },
          {
            type: 'image_url',
            image_url: {
              url: imageData
            }
          }
        ]
      };
    }

    encoding.free();

    const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend, apiProvider);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    if (error instanceof OpenAIError) {
      return new Response('Error', { status: 500, statusText: error.message });
    } else {
      return new Response('Error', { status: 500 });
    }
  }
};

export default handler;
