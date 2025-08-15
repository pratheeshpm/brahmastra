import { getOpenAIApiHost, getOpenAIApiType, getOpenAIApiVersion, OPENAI_ORGANIZATION, AZURE_GPT4_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY } from '../../utils/app/const';

import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { key, apiProvider } = (await req.json()) as {
      key: string;
      apiProvider?: 'openai' | 'openrouter' | 'azure' | 'gemini';
    };

    // Use the provided apiProvider or default to current setting
    const currentApiType = getOpenAIApiType(apiProvider);
    const currentApiHost = getOpenAIApiHost(apiProvider);
    const currentApiVersion = getOpenAIApiVersion(apiProvider);

    let url = `${currentApiHost}/v1/models`;
    let otherHeaders: Record<string, string> = {};

    if (currentApiType === 'azure') {
      url = `${currentApiHost}/openai/deployments?api-version=${currentApiVersion}`;
      const azureModels = [
        { id: 'gpt-4o', name: 'GPT-4o', supportsImages: true },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5', supportsImages: false }
      ];
      return new Response(JSON.stringify(azureModels), {status: 200})
    } else if (currentApiType === 'gemini') {
      // Return predefined Gemini models
      const geminiModels = [
        { id: OpenAIModelID.GEMINI_1_5_FLASH, name: OpenAIModels[OpenAIModelID.GEMINI_1_5_FLASH].name, supportsImages: OpenAIModels[OpenAIModelID.GEMINI_1_5_FLASH].supportsImages },
        { id: OpenAIModelID.GEMINI_1_5_PRO, name: OpenAIModels[OpenAIModelID.GEMINI_1_5_PRO].name, supportsImages: OpenAIModels[OpenAIModelID.GEMINI_1_5_PRO].supportsImages },
        { id: OpenAIModelID.GEMINI_2_0_FLASH_EXP, name: OpenAIModels[OpenAIModelID.GEMINI_2_0_FLASH_EXP].name, supportsImages: OpenAIModels[OpenAIModelID.GEMINI_2_0_FLASH_EXP].supportsImages },
        { id: OpenAIModelID.GEMINI_2_5_FLASH, name: OpenAIModels[OpenAIModelID.GEMINI_2_5_FLASH].name, supportsImages: OpenAIModels[OpenAIModelID.GEMINI_2_5_FLASH].supportsImages },
        { id: OpenAIModelID.GEMINI_2_5_PRO, name: OpenAIModels[OpenAIModelID.GEMINI_2_5_PRO].name, supportsImages: OpenAIModels[OpenAIModelID.GEMINI_2_5_PRO].supportsImages },
      ];
      return new Response(JSON.stringify(geminiModels), {status: 200})
    } else if (currentApiType === 'openrouter') {
      url = `https://openrouter.ai/api/v1/models`;
      otherHeaders = {
        'Authorization': `Bearer ${key ? key : OPENROUTER_API_KEY}`,
        'HTTP-Referer': '', // Optional: Replace with your app URL for OpenRouter leaderboards
        'X-Title': '', // Optional: Replace with your app name for OpenRouter leaderboards
      };
      const openRouterModels = [
        { id: 'gpt-4o', name: 'GPT-4o', supportsImages: true },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5', supportsImages: false },
        { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4', supportsImages: true },
        { id: "anthropic/claude-opus-4.1", name: 'Claude Opus 4.1', supportsImages: true },
        { id: "anthropic/claude-opus-4", name: 'Claude Opus 4', supportsImages: true },
        { id: "anthropic/claude-3.7-sonnet", name: 'Claude 3.7 Sonnet', supportsImages: true },
        { id: "anthropic/claude-3.7-sonnet:thinking", name: 'Claude 3.7 Sonnet Thinking', supportsImages: true },
        { id: "mistralai/mistral-small-3.2-24b-instruct:free", name: 'Mistral Small 3.2 24B Instruct', supportsImages: false },
        { id: "google/gemini-2.5-pro-exp-03-25", name: 'Gemini 2.5 Pro Exp 03 25', supportsImages: true },
        { id: "google/gemini-2.5-pro-preview", name: 'Gemini 2.5 Pro', supportsImages: true },
        { id: "google/gemini-2.5-flash-preview", name: 'Gemini 2.5 Flash', supportsImages: true },
        { id: "deepseek/deepseek-r1", name: 'DeepSeek R1', supportsImages: false },
        { id: "deepseek/deepseek-v3-base:free", name: 'DeepSeek V3 Base', supportsImages: false },
        { id: "qwen/qwen-2.5-72b-instruct", name: 'Qwen 2.5 72B Instruct', supportsImages: false },
        { id: "anthropic/claude-3.5-sonnet", name: 'Claude 3.5 Sonnet', supportsImages: true },
        { id: "openai/gpt-4o-mini", name: 'GPT-4o Mini', supportsImages: true },
        { id: "meta-llama/llama-3.2-90b-vision-instruct", name: 'Llama 3.2 90B Vision', supportsImages: true },
        { id: "x-ai/grok-beta", name: 'Grok Beta', supportsImages: false },
        // Perplexity Models
        { id: "perplexity/sonar", name: 'Perplexity Sonar', supportsImages: false },
        { id: "perplexity/sonar-pro", name: 'Perplexity Sonar Pro', supportsImages: false },
        { id: "perplexity/sonar-reasoning", name: 'Perplexity Sonar Reasoning', supportsImages: false },
        { id: "perplexity/sonar-reasoning-pro", name: 'Perplexity Sonar Reasoning Pro', supportsImages: false },
        { id: "perplexity/sonar-deep-research", name: 'Perplexity Sonar Deep Research', supportsImages: false },
        { id: "perplexity/r1-1776", name: 'Perplexity R1 1776', supportsImages: false },
      ];

      return new Response(JSON.stringify(openRouterModels), {status: 200})
    } else if(currentApiType === 'openai'){
      url = `${currentApiHost}/v1/models`;
      otherHeaders = {Authorization: `Bearer ${key ? key : process.env.OPENAI_API_KEY}`};
      if(OPENAI_ORGANIZATION){
        otherHeaders = {...otherHeaders, 'OpenAI-Organization': OPENAI_ORGANIZATION};
      }
    } else {
      otherHeaders = {'api-key': `${key ? key : process.env.OPENAI_API_KEY}`};
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...otherHeaders,
      },
    });
     console.log("\n\n\n 🚀 ~ handler ~ response:", response)

    if (response.status === 401) {
      return new Response(response.body, {
        status: 500,
        headers: response.headers,
      });
    } else if (response.status !== 200) {
      console.error(
        `OpenAI API returned an error ${
          response.status
        }: ${await response.text()}`,
      );
      throw new Error('OpenAI API returned an error');
    }

    const json = await response.json();
    console.log("\n\n\n\n\n🚀 ~ file: models.ts:51 ~ handler ~ json:", json)

    const models: OpenAIModel[] = json.data
      .map((model: any) => {
        const model_name = (currentApiType === 'azure') ? model.model : model.id;
      //  console.log("\n\n\n\n\n\n\n\npratheesh🚀 ~ .map ~ model_name:", model_name,  Object.entries(OpenAIModelID))
        for (const [key, value] of Object.entries(OpenAIModelID)) {
         model_name === value && console.log("\n\n\n pratheeshpratheesh🚀🚀pratheesh🚀🚀🚀🚀 ~ .map ~ key, value:", key,'..key,', value,'..value', '..model', model)
          if (value === model_name) {
            return {
              id: model.id,
              name: OpenAIModels[value].name,
              maxLength: OpenAIModels[value].maxLength,
              tokenLimit: OpenAIModels[value].tokenLimit,
              supportsImages: OpenAIModels[value].supportsImages || false,
            };
          }
        }
      })
      .filter(Boolean);
//console.log("\n\n\n\n\nmodels--->",models)
    return new Response(JSON.stringify(models), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error', { status: 500 });
  }
};

export default handler;
