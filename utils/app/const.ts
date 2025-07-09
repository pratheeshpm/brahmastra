const isAzure = (process.env.gpt4 == "true");
const isOpenRouter = true//(process.env.or == "true");
export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are The Best Software Engineer and architect in the world, a large language model trained to give best answers. Follow the user's instructions carefully. Respond using markdown and be concise and to the point.";

export const OPENAI_API_HOST = isAzure ? "https://dh-prod-openai.openai.azure.com" : ('https://api.openai.com' || process.env.OPENAI_API_HOST );

export const DEFAULT_TEMPERATURE = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "1");

export const OPENAI_API_TYPE = isOpenRouter ? 'openrouter' :  (isAzure ? 
'azure' : ( 'openai' ||process.env.OPENAI_API_TYPE));

export const OPENAI_API_VERSION = 'anthropic/claude-sonnet-4'//isAzure ?  '2023-07-01-preview' :  ('anthropic/claude-sonnet-4' ||  'gpt-4o' || process.env.OPENAI_API_VERSION);

export const OPENAI_ORGANIZATION =
  process.env.OPENAI_ORGANIZATION || '';

export const AZURE_DEPLOYMENT_ID =  'GPT4' || process.env.AZURE_DEPLOYMENT_ID || 'gpt-4-pwa';

export const AZURE_GPT4_KEY = process.env.AZURE_GPT4_KEY || '8778e5ede6014d8a83b385c908149b12';  
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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'

export const RECEIVER_IP =  'http://192.168.1.189:4000'
//'http://localhost:4000';

export const KEYPRESS_COMBO = 'Control';

export const DIAGRAM_SEARCH_ENDPOINT = 'http://localhost:3001';

export const sysDesignPath = `/Users/pratheeshpm/Documents/Interview/leetcode/`;


export const sysDesignFolder = `system-design-main`