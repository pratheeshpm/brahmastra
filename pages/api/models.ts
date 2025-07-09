import { AZURE_DEPLOYMENT_ID, OPENAI_API_HOST, OPENAI_API_TYPE, OPENAI_API_VERSION, OPENAI_ORGANIZATION, AZURE_GPT4_KEY, OPENROUTER_API_KEY } from '../../utils/app/const';

import { OpenAIModel, OpenAIModelID, OpenAIModels } from '@/types/openai';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { key } = (await req.json()) as {
      key: string;
    };

    let url = `${OPENAI_API_HOST}/v1/models`;
    let otherHeaders: Record<string, string> = {};

    if (OPENAI_API_TYPE === 'azure') {
      url = `${OPENAI_API_HOST}/openai/deployments?api-version=${OPENAI_API_VERSION}`;
      return new Response(JSON.stringify( [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5' }
      ]
      ),{status: 200})
    } else if (OPENAI_API_TYPE === 'openrouter') {
      url = `https://openrouter.ai/api/v1/models`;
      otherHeaders = {
        'Authorization': `Bearer ${key ? key : OPENROUTER_API_KEY}`,
        'HTTP-Referer': '', // Optional: Replace with your app URL for OpenRouter leaderboards
        'X-Title': '', // Optional: Replace with your app name for OpenRouter leaderboards
      };
      return new Response(JSON.stringify( [
        { id: 'gpt-4o', name: 'GPT-4o' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5' },
        { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
        {id:"anthropic/claude-3.7-sonnet:thinking", name: 'Claude 3.7 Sonnet Thinking' },
        { id: "mistralai/mistral-small-3.2-24b-instruct:free", name: 'Mistral Small 3.2 24B Instruct'  },
        {id: "google/gemini-2.5-pro-exp-03-25", name: 'Gemini 2.5 Pro Exp 03 25' },
        {id: "deepseek/deepseek-r1-0528-qwen3-8b:free", name: 'DeepSeek R1 0528 Qwen3 8B' },
        {id: "mistralai/ministral-8b", name: 'Mistral 8B' },
        {id: 'deepseek/deepseek-v3-base:free', name: 'DeepSeek V3 Base' },

      ]),{status: 200})
    } else if(OPENAI_API_TYPE === 'openai'){
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
        const model_name = (OPENAI_API_TYPE === 'azure') ? model.model : model.id;
      //  console.log("\n\n\n\n\n\n\n\npratheesh🚀 ~ .map ~ model_name:", model_name,  Object.entries(OpenAIModelID))
        for (const [key, value] of Object.entries(OpenAIModelID)) {
         model_name === value && console.log("\n\n\n pratheeshpratheesh🚀🚀pratheesh🚀🚀🚀🚀 ~ .map ~ key, value:", key,'..key,', value,'..value', '..model', model)
          if (value === model_name) {
            return {
              id: model.id,
              name: OpenAIModels[value].name,
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
