import { ModelProviderCard } from '@/types/llm';

// ref: https://ollama.com/library
const LMStudio: ModelProviderCard = {
  chatModels: [
    {
      description:
        'Llama 3.1 是 Meta 推出的领先模型，支持高达 405B 参数，可应用于复杂对话、多语言翻译和数据分析领域。',
      displayName: 'Llama 3.1 8B',
      enabled: true,
      id: 'llama3.1',
      tokens: 128_000,
    },
    {
      description: 'Qwen2.5 是阿里巴巴的新一代大规模语言模型，以优异的性能支持多元化的应用需求。',
      displayName: 'Qwen2.5 7B',
      enabled: true,
      id: 'qwen2.5',
      tokens: 128_000,
    },
  ],
  defaultShowBrowserRequest: true,
  id: 'lmstudio',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://lmstudio.ai/models',
  name: 'LM Studio',
  showApiKey: false,
  url: 'https://lmstudio.ai',
};

export default LMStudio;
