export interface ProcessEnv {
  OPENAI_API_KEY: string;
  OPENAI_API_HOST?: string;
  OPENAI_API_TYPE?: 'openai' | 'azure' | 'openrouter' | 'gemini';
  OPENAI_API_VERSION?: string;
  OPENAI_ORGANIZATION?: string;
  GEMINI_API_KEY?: string;
}
