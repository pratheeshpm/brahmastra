const isAzure = (process.env.gpt4 == "true");
// Remove hardcoded isOpenRouter and make it dynamic
// const isOpenRouter = true//(process.env.or == "true");

// Function to get API provider from localStorage or default to 'openai'
export const getApiProvider = (): 'openai' | 'openrouter' | 'azure' | 'gemini' => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('apiProvider');
    if (stored && ['openai', 'openrouter', 'azure', 'gemini'].includes(stored)) {
      return stored as 'openai' | 'openrouter' | 'azure' | 'gemini';
    }
  }
  // Default to openai if no stored preference
  return 'openai';
};

// Function to set API provider
export const setApiProvider = (provider: 'openai' | 'openrouter' | 'azure' | 'gemini') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('apiProvider', provider);
  }
};

export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are The Best Software Engineer and architect in the world, a large language model trained to give best answers. Follow the user's instructions carefully. Respond using markdown and be concise and to the point.";

// Make OPENAI_API_HOST dynamic based on API provider
export const getOpenAIApiHost = (provider?: 'openai' | 'openrouter' | 'azure' | 'gemini') => {
  const apiProvider = provider || getApiProvider();
  
  if (apiProvider === 'azure') {
    return "https://dh-prod-openai.openai.azure.com";
  } else if (apiProvider === 'openrouter') {
    return "https://openrouter.ai/api/v1";
  } else if (apiProvider === 'gemini') {
    return "https://generativelanguage.googleapis.com";
  } else {
    return process.env.OPENAI_API_HOST || 'https://api.openai.com';
  }
};

// Keep the original for backward compatibility but make it dynamic
export const OPENAI_API_HOST = getOpenAIApiHost();

export const DEFAULT_TEMPERATURE = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "1");

// Make OPENAI_API_TYPE dynamic
export const getOpenAIApiType = (provider?: 'openai' | 'openrouter' | 'azure' | 'gemini') => {
  const apiProvider = provider || getApiProvider();
  
  if (isAzure && apiProvider === 'azure') {
    return 'azure';
  } else if (apiProvider === 'openrouter') {
    return 'openrouter';
  } else if (apiProvider === 'gemini') {
    return 'gemini';
  } else {
    return process.env.OPENAI_API_TYPE || 'openai';
  }
};

// Keep the original for backward compatibility but make it dynamic
export const OPENAI_API_TYPE = getOpenAIApiType();

// Make OPENAI_API_VERSION dynamic
export const getOpenAIApiVersion = (provider?: 'openai' | 'openrouter' | 'azure' | 'gemini') => {
  const apiProvider = provider || getApiProvider();
  
  if (apiProvider === 'azure') {
    return '2023-07-01-preview';
  } else if (apiProvider === 'openrouter') {
    return 'v1';
  } else if (apiProvider === 'gemini') {
    return 'v1beta';
  } else {
    return process.env.OPENAI_API_VERSION || 'v1';
  }
};

// Keep the original for backward compatibility
export const OPENAI_API_VERSION = getOpenAIApiVersion();

export const OPENAI_ORGANIZATION =
  process.env.OPENAI_ORGANIZATION || '';

export const AZURE_DEPLOYMENT_ID = process.env.AZURE_DEPLOYMENT_ID || 'GPT4' || 'gpt-4-pwa';

export const AZURE_GPT4_KEY = process.env.AZURE_GPT4_KEY || '8778e5ede6014d8a83b385c908149b12';  
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY// || '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'
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const RECEIVER_IP =  'http://localhost:3000'
//'http://localhost:4000';

export const KEYPRESS_COMBO = 'Control';

export const DIAGRAM_SEARCH_ENDPOINT = 'http://localhost:3001';

export const sysDesignPath = `/Users/pratheeshpm/Documents/Interview/leetcode/`;


export const sysDesignFolder = `system-design-main`