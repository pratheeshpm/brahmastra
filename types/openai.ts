import { OPENAI_API_TYPE } from '../utils/app/const';

export interface OpenAIModel {
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
}

export enum OpenAIModelID {
  GPT_3_5 = 'gpt-3.5-turbo',
  GPT_3_5_AZ = 'gpt-35-turbo',
  GPT_4 = 'gpt-4',
  GPT_4_32K = 'gpt-4-32k',
  GPT_4o = 'gpt-4o',
  GPT_4o_mini = 'gpt-4o-mini',
  CLAUDE_SONNET_4 = 'anthropic/claude-sonnet-4',
  CLAUDE_3_7_SONNET_THINKING = 'anthropic/claude-3.7-sonnet:thinking',
  MISTRAL_SMALL_3_2_24B_INSTRUCT = 'mistralai/mistral-small-3.2-24b-instruct:free',
  DEEPSEEK_R1_0528_QWEN3_8B = 'deepseek/deepseek-r1-0528-qwen3-8b:free',
  MISTRAL_8B = 'mistralai/ministral-8b',
  GEMINI_2_5_PRO_EXP_03_25 = 'google/gemini-2.5-pro-exp-03-25',
  DEEPSEEK_V3_BASE = 'deepseek/deepseek-v3-base:free',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = OpenAIModelID.GPT_3_5;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  [OpenAIModelID.GPT_3_5]: {
    id: OpenAIModelID.GPT_3_5,
    name: 'GPT-3.5',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [OpenAIModelID.GPT_3_5_AZ]: {
    id: OpenAIModelID.GPT_3_5_AZ,
    name: 'GPT-3.5',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [OpenAIModelID.GPT_4]: {
    id: OpenAIModelID.GPT_4,
    name: 'GPT-4',
    maxLength: 24000,
    tokenLimit: 8000,
  },
  [OpenAIModelID.GPT_4_32K]: {
    id: OpenAIModelID.GPT_4_32K,
    name: 'GPT-4-32K',
    maxLength: 96000,
    tokenLimit: 32000,
  }, 
  [OpenAIModelID.GPT_4o]: {
    id: OpenAIModelID.GPT_4o,
    name: 'GPT-4o',
    maxLength: 96000,
    tokenLimit: 32000,
  },
  [OpenAIModelID.GPT_4o_mini]: {
    id: OpenAIModelID.GPT_4o_mini,
    name: 'GPT-4o-mini',
    maxLength: 96000,
    tokenLimit: 32000,
  },
  [OpenAIModelID.CLAUDE_SONNET_4]: {
    id: OpenAIModelID.CLAUDE_SONNET_4,
    name: 'Claude Sonnet 4',
    maxLength: 200000, // Based on web search result
    tokenLimit: 200000, // Based on web search result
  },
  [OpenAIModelID.CLAUDE_3_7_SONNET_THINKING]: {
    id: OpenAIModelID.CLAUDE_3_7_SONNET_THINKING,
    name: 'Claude 3.7 Sonnet Thinking',
    maxLength: 200000, // Based on web search result
    tokenLimit: 200000, // Based on web search result
  },
  [OpenAIModelID.MISTRAL_SMALL_3_2_24B_INSTRUCT]: {
    id: OpenAIModelID.MISTRAL_SMALL_3_2_24B_INSTRUCT,
    name: 'Mistral Small 3.2 24B Instruct',
    maxLength: 200000, // Based on web search result
    tokenLimit: 200000, // Based on web search result
  },
  [OpenAIModelID.DEEPSEEK_R1_0528_QWEN3_8B]: {
    id: OpenAIModelID.DEEPSEEK_R1_0528_QWEN3_8B,
    name: 'DeepSeek R1 0528 Qwen3 8B',
    maxLength: 200000, // Based on web search result
    tokenLimit: 200000, // Based on web search result
  },
  [OpenAIModelID.MISTRAL_8B]: {
    id: OpenAIModelID.MISTRAL_8B,
    name: 'Mistral 8B',
    maxLength: 200000, // Based on web search result
    tokenLimit: 200000, // Based on web search result
  },
  [OpenAIModelID.GEMINI_2_5_PRO_EXP_03_25]: {
    id: OpenAIModelID.GEMINI_2_5_PRO_EXP_03_25,
    name: 'Gemini 2.5 Pro Exp 03 25',
    maxLength: 200000, // Based on web search result
    tokenLimit: 200000, // Based on web search result
  },
  [OpenAIModelID.DEEPSEEK_V3_BASE]: {
    id: OpenAIModelID.DEEPSEEK_V3_BASE,
    name: 'DeepSeek V3 Base',
    maxLength: 200000, // Based on web search result
    tokenLimit: 200000, // Based on web search result
  },
};
