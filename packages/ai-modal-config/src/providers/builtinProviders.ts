import type { ApiFormat, ProviderModelConfig } from '../types/provider';

export interface BuiltinModelTemplate {
  modelId: string;
  contextWindow?: number;
  maxOutputTokens?: number;
  inputKeys: string[];
  capabilityKeys?: string[];
  reasoningLevels?: string[];
  reasoningParamMap?: string;
}

export interface BuiltinProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiFormat: ApiFormat;
  keyUrl?: string;
  models: BuiltinModelTemplate[];
}

/** 添加供应商网格。自定义入口单独渲染，不在这份列表里。 */
export const BUILTIN_PROVIDERS: BuiltinProvider[] = [
  {
    id: 'kimi',
    name: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    apiFormat: 'openai_chat',
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
    models: [
      { modelId: 'moonshot-v1-128k', contextWindow: 128000, inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'moonshot-v1-32k', contextWindow: 32000, inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
    ],
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    baseUrl: 'https://api.minimaxi.com/anthropic',
    apiFormat: 'anthropic_messages',
    keyUrl: 'https://platform.minimaxi.com/user-center/basic-information/interface-key',
    models: [
      { modelId: 'MiniMax-M2', inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    apiFormat: 'openai_chat',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    models: [
      {
        modelId: 'deepseek-v4-flash',
        inputKeys: ['text'],
        capabilityKeys: ['action_script', 'script', 'novel', 'exec_script', 'agent_orchestration'],
      },
      {
        modelId: 'deepseek-v4-pro',
        inputKeys: ['text'],
        capabilityKeys: ['action_script', 'script', 'novel', 'exec_script', 'agent_orchestration'],
      },
    ],
  },
  {
    id: 'aliyun-cn',
    name: '阿里云百炼（中国）',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiFormat: 'openai_chat',
    keyUrl: 'https://bailian.console.aliyun.com/?apiKey=1#/api-key',
    models: [
      { modelId: 'qwen3.6-plus', inputKeys: ['text', 'image', 'video'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'qwen3.6-flash', inputKeys: ['text', 'image', 'video'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'qwen3.6-max-preview', inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
    ],
  },
  {
    id: 'aliyun-intl',
    name: '阿里云百炼（国际）',
    baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    apiFormat: 'openai_chat',
    keyUrl: 'https://modelstudio.console.alibabacloud.com/#/api-key',
    models: [
      { modelId: 'qwen3.6-plus', inputKeys: ['text', 'image', 'video'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'qwen3.6-flash', inputKeys: ['text', 'image', 'video'], capabilityKeys: ['agent_orchestration'] },
    ],
  },
  {
    id: 'xiaomi-mimo',
    name: 'Xiaomi MiMo',
    baseUrl: 'https://api.xiaomimimo.com/anthropic',
    apiFormat: 'anthropic_messages',
    keyUrl: 'https://platform.xiaomimimo.com/#/docs/quick-start/first-api-call',
    models: [
      { modelId: 'mimo-v2.5-pro', contextWindow: 1_000_000, inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
      {
        modelId: 'mimo-v2.5',
        contextWindow: 1_000_000,
        inputKeys: ['text', 'image'],
        capabilityKeys: ['agent_orchestration'],
      },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiFormat: 'openai_chat',
    keyUrl: 'https://platform.openai.com/api-keys',
    models: [
      { modelId: 'gpt-4o', contextWindow: 128000, inputKeys: ['text', 'image'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'gpt-4o-mini', contextWindow: 128000, inputKeys: ['text', 'image'], capabilityKeys: ['agent_orchestration'] },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com',
    apiFormat: 'anthropic_messages',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { modelId: 'claude-sonnet-4-5', contextWindow: 200000, inputKeys: ['text', 'image'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'claude-3-5-haiku-latest', contextWindow: 200000, inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
    ],
  },
  {
    id: 'xai',
    name: 'xAI',
    baseUrl: 'https://api.x.ai/v1',
    apiFormat: 'openai_chat',
    keyUrl: 'https://console.x.ai/',
    models: [
      { modelId: 'grok-3', inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'grok-3-mini', inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiFormat: 'openai_chat',
    keyUrl: 'https://openrouter.ai/keys',
    models: [],
  },
  {
    id: 'opencode-go',
    name: 'OpenCode Go (Chat)',
    baseUrl: 'https://opencode.ai/zen/v1',
    apiFormat: 'openai_chat',
    keyUrl: 'https://opencode.ai/',
    models: [],
  },
];

export function lookupBuiltinModel(modelId: string): BuiltinModelTemplate | undefined {
  const id = modelId.trim();
  if (!id) return undefined;
  for (const provider of BUILTIN_PROVIDERS) {
    const hit = provider.models.find((m) => m.modelId === id);
    if (hit) return hit;
  }
  return undefined;
}

export function templateToProviderModel(template: BuiltinModelTemplate, id: string): ProviderModelConfig {
  const inputKeys = template.inputKeys.includes('text') ? [...template.inputKeys] : ['text', ...template.inputKeys];
  return {
    id,
    modelId: template.modelId,
    enabled: true,
    contextWindow: template.contextWindow,
    maxOutputTokens: template.maxOutputTokens,
    inputKeys,
    capabilityKeys: template.capabilityKeys ? [...template.capabilityKeys] : [],
    reasoningLevels: template.reasoningLevels ? [...template.reasoningLevels] : [],
    reasoningParamMap: template.reasoningParamMap,
    smartConfig: true,
  };
}
