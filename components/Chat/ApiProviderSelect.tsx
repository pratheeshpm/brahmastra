import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { getApiProvider, setApiProvider } from '@/utils/app/const';
import HomeContext from '@/pages/api/home/home.context';

export const ApiProviderSelect = () => {
  const { t } = useTranslation('chat');
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'openrouter' | 'azure'>('openai');
  
  const {
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  // Load saved provider on component mount
  useEffect(() => {
    const savedProvider = getApiProvider();
    setSelectedProvider(savedProvider);
  }, []);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as 'openai' | 'openrouter' | 'azure';
    setSelectedProvider(provider);
    setApiProvider(provider);
    
    // Trigger models refresh by dispatching a state change
    homeDispatch({ field: 'models', value: [] });
    
    // Optionally trigger a page refresh to ensure all components use the new provider
    window.location.reload();
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2 text-left text-neutral-700 dark:text-neutral-400">
        {t('API Provider')}
      </label>
      <div className="w-full rounded-lg border border-neutral-200 bg-transparent pr-2 text-neutral-900 dark:border-neutral-600 dark:text-white">
        <select
          className="w-full bg-transparent p-2"
          value={selectedProvider}
          onChange={handleProviderChange}
        >
          <option
            value="openai"
            className="dark:bg-[#343541] dark:text-white"
          >
            OpenAI
          </option>
          <option
            value="openrouter"
            className="dark:bg-[#343541] dark:text-white"
          >
            OpenRouter
          </option>
          <option
            value="azure"
            className="dark:bg-[#343541] dark:text-white"
          >
            Azure OpenAI
          </option>
        </select>
      </div>
      <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        {selectedProvider === 'openai' && 'Use OpenAI GPT models directly'}
        {selectedProvider === 'openrouter' && 'Access Claude, Mistral, and other models via OpenRouter'}
        {selectedProvider === 'azure' && 'Use Azure OpenAI Service'}
      </div>
    </div>
  );
}; 