import { OPENAI_API_TYPE } from '../utils/app/const';

export interface OpenAIModel {
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
  supportsImages?: boolean; // New field for image support
}

export enum OpenAIModelID {
  // OpenAI Models
  GPT_3_5 = 'gpt-3.5-turbo',
  GPT_3_5_AZ = 'gpt-35-turbo',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
  GPT_4o = 'gpt-4o',
  GPT_4o_mini = 'gpt-4o-mini',
  GPT_4_1 = 'gpt-4.1',
  GPT_4_1_MINI = 'gpt-4.1-mini',
  GPT_4_1_NANO = 'gpt-4.1-nano',
  GPT_4_5_PREVIEW = 'gpt-4.5-preview',
  O1 = 'o1',
  O1_MINI = 'o1-mini',
  O1_PREVIEW = 'o1-preview',
  O3 = 'o3',
  O3_MINI = 'o3-mini',
  O3_PRO = 'o3-pro',

  
  // Claude Models (Anthropic)
  CLAUDE_SONNET_4 = 'anthropic/claude-sonnet-4',
  CLAUDE_3_7_SONNET = 'anthropic/claude-3.7-sonnet',
  CLAUDE_3_7_SONNET_THINKING = 'anthropic/claude-3.7-sonnet:thinking',
  CLAUDE_3_5_SONNET = 'anthropic/claude-3.5-sonnet',
  CLAUDE_3_5_HAIKU = 'anthropic/claude-3.5-haiku',
  CLAUDE_4_SONNET = 'anthropic/claude-4-sonnet',
  CLAUDE_4_OPUS = 'anthropic/claude-4-opus',
  
  // Mistral Models
  MISTRAL_SMALL_3_2_24B_INSTRUCT = 'mistralai/mistral-small-3.2-24b-instruct:free',
  MISTRAL_MEDIUM_3 = 'mistralai/mistral-medium-3',
  MISTRAL_8B = 'mistralai/ministral-8b',
  MISTRAL_CODESTRAL = 'mistralai/codestral-2501',
  
  // DeepSeek Models
  DEEPSEEK_R1_0528_QWEN3_8B = 'deepseek/deepseek-r1-0528-qwen3-8b:free',
  DEEPSEEK_V3_BASE = 'deepseek/deepseek-v3-base:free',
  DEEPSEEK_R1 = 'deepseek/deepseek-r1',
  DEEPSEEK_PROVER_V2 = 'deepseek/deepseek-prover-v2',
  
  // Google Models
  GEMINI_2_5_PRO_EXP_03_25 = 'google/gemini-2.5-pro-exp-03-25',
  GEMINI_2_5_PRO = 'google/gemini-2.5-pro-preview',
  GEMINI_2_5_FLASH = 'google/gemini-2.5-flash-preview',
  GEMINI_2_0_FLASH = 'google/gemini-2.0-flash-exp',
  
  // xAI Models
  GROK_4 = 'x-ai/grok-4',
  GROK_3_BETA = 'x-ai/grok-3-beta',
  GROK_3_MINI = 'x-ai/grok-3-mini-beta',
  
  // Meta Models
  LLAMA_3_3_70B = 'meta-llama/llama-3.3-70b-instruct',
  LLAMA_4_SCOUT = 'meta-llama/llama-4-scout',
  LLAMA_4_MAVERICK = 'meta-llama/llama-4-maverick',
  LLAMA_3_2_90B_VISION_INSTRUCT = 'meta-llama/llama-3.2-90b-vision-instruct',
  
  // Qwen Models
  QWEN_3_235B = 'qwen/qwen-3-235b-a22b',
  QWEN_2_5_72B = 'qwen/qwen-2.5-72b-instruct',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = OpenAIModelID.GPT_4o_mini;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  // OpenAI Models
  [OpenAIModelID.GPT_3_5]: {
    id: OpenAIModelID.GPT_3_5,
    name: 'GPT-3.5 Turbo',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [OpenAIModelID.GPT_3_5_AZ]: {
    id: OpenAIModelID.GPT_3_5_AZ,
    name: 'GPT-3.5 (Azure)',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [OpenAIModelID.GPT_4]: {
    id: OpenAIModelID.GPT_4,
    name: 'GPT-4',
    maxLength: 24000,
    tokenLimit: 8000,
    supportsImages: true,
  },
  [OpenAIModelID.GPT_4_32K]: {
    id: OpenAIModelID.GPT_4_32K,
    name: 'GPT-4 32K',
    maxLength: 96000,
    tokenLimit: 32000,
    supportsImages: true,
  }, 
  [OpenAIModelID.GPT_4o]: {
    id: OpenAIModelID.GPT_4o,
    name: 'GPT-4o',
    maxLength: 384000,
    tokenLimit: 128000,
    supportsImages: true,
  },
  [OpenAIModelID.GPT_4o_mini]: {
    id: OpenAIModelID.GPT_4o_mini,
    name: 'GPT-4o Mini',
    maxLength: 384000,
    tokenLimit: 128000,
    supportsImages: true,
  },
  [OpenAIModelID.GPT_4_1]: {
    id: OpenAIModelID.GPT_4_1,
    name: 'GPT-4.1',
    maxLength: 384000,
    tokenLimit: 128000,
    supportsImages: true,
  },
  [OpenAIModelID.GPT_4_1_MINI]: {
    id: OpenAIModelID.GPT_4_1_MINI,
    name: 'GPT-4.1 Mini',
    maxLength: 384000,
    tokenLimit: 128000,
    supportsImages: true,
  },
  [OpenAIModelID.GPT_4_1_NANO]: {
    id: OpenAIModelID.GPT_4_1_NANO,
    name: 'GPT-4.1 Nano',
    maxLength: 384000,
    tokenLimit: 128000,
    supportsImages: true,
  },
  [OpenAIModelID.GPT_4_5_PREVIEW]: {
    id: OpenAIModelID.GPT_4_5_PREVIEW,
    name: 'GPT-4.5 Preview',
    maxLength: 384000,
    tokenLimit: 128000,
    supportsImages: true,
  },
  [OpenAIModelID.O1]: {
    id: OpenAIModelID.O1,
    name: 'OpenAI o1',
    maxLength: 384000,
    tokenLimit: 128000,
  },
  [OpenAIModelID.O1_MINI]: {
    id: OpenAIModelID.O1_MINI,
    name: 'OpenAI o1-mini',
    maxLength: 384000,
    tokenLimit: 128000,
  },
  [OpenAIModelID.O1_PREVIEW]: {
    id: OpenAIModelID.O1_PREVIEW,
    name: 'OpenAI o1-preview',
    maxLength: 384000,
    tokenLimit: 128000,
  },
  [OpenAIModelID.O3]: {
    id: OpenAIModelID.O3,
    name: 'OpenAI o3',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },
  [OpenAIModelID.O3_MINI]: {
    id: OpenAIModelID.O3_MINI,
    name: 'OpenAI o3-mini',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },
  [OpenAIModelID.O3_PRO]: {
    id: OpenAIModelID.O3_PRO,
    name: 'OpenAI o3-pro',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },

  
  // Claude Models (Anthropic)
  [OpenAIModelID.CLAUDE_SONNET_4]: {
    id: OpenAIModelID.CLAUDE_SONNET_4,
    name: 'Claude Sonnet 4',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },
  [OpenAIModelID.CLAUDE_3_7_SONNET]: {
    id: OpenAIModelID.CLAUDE_3_7_SONNET,
    name: 'Claude 3.7 Sonnet',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },
  [OpenAIModelID.CLAUDE_3_7_SONNET_THINKING]: {
    id: OpenAIModelID.CLAUDE_3_7_SONNET_THINKING,
    name: 'Claude 3.7 Sonnet (Thinking)',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },
  [OpenAIModelID.CLAUDE_3_5_SONNET]: {
    id: OpenAIModelID.CLAUDE_3_5_SONNET,
    name: 'Claude 3.5 Sonnet',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },
  [OpenAIModelID.CLAUDE_3_5_HAIKU]: {
    id: OpenAIModelID.CLAUDE_3_5_HAIKU,
    name: 'Claude 3.5 Haiku',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },
  [OpenAIModelID.CLAUDE_4_SONNET]: {
    id: OpenAIModelID.CLAUDE_4_SONNET,
    name: 'Claude 4 Sonnet',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },
  [OpenAIModelID.CLAUDE_4_OPUS]: {
    id: OpenAIModelID.CLAUDE_4_OPUS,
    name: 'Claude 4 Opus',
    maxLength: 600000,
    tokenLimit: 200000,
    supportsImages: true,
  },
  
  // Mistral Models
  [OpenAIModelID.MISTRAL_SMALL_3_2_24B_INSTRUCT]: {
    id: OpenAIModelID.MISTRAL_SMALL_3_2_24B_INSTRUCT,
    name: 'Mistral Small 3.2 24B',
    maxLength: 98304,
    tokenLimit: 32768,
  },
  [OpenAIModelID.MISTRAL_MEDIUM_3]: {
    id: OpenAIModelID.MISTRAL_MEDIUM_3,
    name: 'Mistral Medium 3',
    maxLength: 393216,
    tokenLimit: 131072,
  },
  [OpenAIModelID.MISTRAL_8B]: {
    id: OpenAIModelID.MISTRAL_8B,
    name: 'Mistral 8B',
    maxLength: 98304,
    tokenLimit: 32768,
  },
  [OpenAIModelID.MISTRAL_CODESTRAL]: {
    id: OpenAIModelID.MISTRAL_CODESTRAL,
    name: 'Mistral Codestral',
    maxLength: 98304,
    tokenLimit: 32768,
  },
  
  // DeepSeek Models
  [OpenAIModelID.DEEPSEEK_R1_0528_QWEN3_8B]: {
    id: OpenAIModelID.DEEPSEEK_R1_0528_QWEN3_8B,
    name: 'DeepSeek R1 Qwen3 8B',
    maxLength: 98304,
    tokenLimit: 32768,
  },
  [OpenAIModelID.DEEPSEEK_V3_BASE]: {
    id: OpenAIModelID.DEEPSEEK_V3_BASE,
    name: 'DeepSeek V3 Base',
    maxLength: 196608,
    tokenLimit: 65536,
  },
  [OpenAIModelID.DEEPSEEK_R1]: {
    id: OpenAIModelID.DEEPSEEK_R1,
    name: 'DeepSeek R1',
    maxLength: 196608,
    tokenLimit: 65536,
  },
  [OpenAIModelID.DEEPSEEK_PROVER_V2]: {
    id: OpenAIModelID.DEEPSEEK_PROVER_V2,
    name: 'DeepSeek Prover V2',
    maxLength: 196608,
    tokenLimit: 65536,
  },
  
  // Google Models
  [OpenAIModelID.GEMINI_2_5_PRO_EXP_03_25]: {
    id: OpenAIModelID.GEMINI_2_5_PRO_EXP_03_25,
    name: 'Gemini 2.5 Pro Exp',
    maxLength: 3000000,
    tokenLimit: 1000000,
    supportsImages: true,
  },
  [OpenAIModelID.GEMINI_2_5_PRO]: {
    id: OpenAIModelID.GEMINI_2_5_PRO,
    name: 'Gemini 2.5 Pro',
    maxLength: 3000000,
    tokenLimit: 1000000,
    supportsImages: true,
  },
  [OpenAIModelID.GEMINI_2_5_FLASH]: {
    id: OpenAIModelID.GEMINI_2_5_FLASH,
    name: 'Gemini 2.5 Flash',
    maxLength: 3000000,
    tokenLimit: 1000000,
    supportsImages: true,
  },
  [OpenAIModelID.GEMINI_2_0_FLASH]: {
    id: OpenAIModelID.GEMINI_2_0_FLASH,
    name: 'Gemini 2.0 Flash',
    maxLength: 3000000,
    tokenLimit: 1000000,
    supportsImages: true,
  },
  
  // xAI Models
  [OpenAIModelID.GROK_4]: {
    id: OpenAIModelID.GROK_4,
    name: 'Grok 4',
    maxLength: 768000,
    tokenLimit: 256000,
    supportsImages: true,
  },
  [OpenAIModelID.GROK_3_BETA]: {
    id: OpenAIModelID.GROK_3_BETA,
    name: 'Grok 3 Beta',
    maxLength: 393216,
    tokenLimit: 131072,
    supportsImages: true,
  },
  [OpenAIModelID.GROK_3_MINI]: {
    id: OpenAIModelID.GROK_3_MINI,
    name: 'Grok 3 Mini',
    maxLength: 393216,
    tokenLimit: 131072,
    supportsImages: true,
  },
  
  // Meta Models
  [OpenAIModelID.LLAMA_3_3_70B]: {
    id: OpenAIModelID.LLAMA_3_3_70B,
    name: 'Llama 3.3 70B',
    maxLength: 393216,
    tokenLimit: 131072,
  },
  [OpenAIModelID.LLAMA_4_SCOUT]: {
    id: OpenAIModelID.LLAMA_4_SCOUT,
    name: 'Llama 4 Scout',
    maxLength: 393216,
    tokenLimit: 131072,
  },
  [OpenAIModelID.LLAMA_4_MAVERICK]: {
    id: OpenAIModelID.LLAMA_4_MAVERICK,
    name: 'Llama 4 Maverick',
    maxLength: 393216,
    tokenLimit: 131072,
  },
  [OpenAIModelID.LLAMA_3_2_90B_VISION_INSTRUCT]: {
    id: OpenAIModelID.LLAMA_3_2_90B_VISION_INSTRUCT,
    name: 'Llama 3.2 90B Vision Instruct',
    maxLength: 393216,
    tokenLimit: 131072,
    supportsImages: true,
  },
  
  // Qwen Models
  [OpenAIModelID.QWEN_3_235B]: {
    id: OpenAIModelID.QWEN_3_235B,
    name: 'Qwen 3 235B',
    maxLength: 3000000,
    tokenLimit: 1000000,
    supportsImages: true,
  },
  [OpenAIModelID.QWEN_2_5_72B]: {
    id: OpenAIModelID.QWEN_2_5_72B,
    name: 'Qwen 2.5 72B',
    maxLength: 393216,
    tokenLimit: 131072,
  },
};
