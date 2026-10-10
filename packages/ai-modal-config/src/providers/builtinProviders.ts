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
      { modelId: 'MiniMax-H3', inputKeys: ['text', 'image', 'video', 'audio'], capabilityKeys: ['video'] },
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
        capabilityKeys: ['agent_orchestration', 'novel'],
      },
      {
        modelId: 'deepseek-v4-pro',
        inputKeys: ['text'],
        capabilityKeys: ['agent_orchestration', 'novel'],
      },
    ],
  },
  {
    id: 'aliyun-cn',
    name: '阿里云百炼',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiFormat: 'openai_chat',
    keyUrl: 'https://bailian.console.aliyun.com/?apiKey=1#/api-key',
    models: [
      { modelId: 'qwen3.6-plus', inputKeys: ['text', 'image', 'video'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'qwen3.6-flash', inputKeys: ['text', 'image', 'video'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'qwen3.6-max-preview', inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'qwen-image-2.0', inputKeys: ['text', 'image'], capabilityKeys: ['draw'] },
      { modelId: 'qwen-image-2.0-pro', inputKeys: ['text', 'image'], capabilityKeys: ['draw'] },
      { modelId: 'qwen-image-edit-plus', inputKeys: ['text', 'image'], capabilityKeys: ['draw', 'image_edit'] },
      {
        modelId: 'wan2.7-image',
        inputKeys: ['text', 'image'],
        capabilityKeys: ['draw', 'image_edit', 'matting', 'remove_watermark', 'image_outpaint', 'image_clarity'],
      },
      { modelId: 'happyhorse-1.0-t2v', inputKeys: ['text'], capabilityKeys: ['video'] },
      { modelId: 'happyhorse-1.0-i2v', inputKeys: ['text', 'image'], capabilityKeys: ['video'] },
      { modelId: 'happyhorse-1.0-r2v', inputKeys: ['text', 'image'], capabilityKeys: ['video'] },
    ],
  },
  {
    id: 'volcengine',
    name: '火山引擎',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    apiFormat: 'openai_chat',
    keyUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
    models: [
      {
        modelId: 'doubao-seed-2-1-pro-260915',
        contextWindow: 1_024_000,
        maxOutputTokens: 256_000,
        inputKeys: ['text', 'image', 'video'],
        capabilityKeys: ['agent_orchestration', 'novel'],
      },
      {
        modelId: 'doubao-seed-2-1-lite-260915',
        contextWindow: 1_024_000,
        maxOutputTokens: 256_000,
        inputKeys: ['text', 'image', 'video', 'audio'],
        capabilityKeys: ['agent_orchestration', 'novel'],
      },
      {
        modelId: 'doubao-seedance-2-5-260628',
        inputKeys: ['text', 'image', 'video', 'audio'],
        capabilityKeys: ['video'],
      },
      {
        modelId: 'doubao-seedream-5-0-pro-260628',
        inputKeys: ['text', 'image'],
        capabilityKeys: ['draw', 'image_edit'],
      },
      {
        modelId: 'doubao-seed-character-260628',
        contextWindow: 128_000,
        maxOutputTokens: 32_000,
        inputKeys: ['text'],
        capabilityKeys: ['novel'],
      },
    ],
  },
  {
    id: 'xiaomi-mimo',
    name: 'Xiaomi MiMo',
    baseUrl: 'https://api.xiaomimimo.com/anthropic',
    apiFormat: 'anthropic_messages',
    keyUrl: 'https://platform.xiaomimimo.com/#/docs/quick-start/first-api-call',
    models: [
      { modelId: 'mimo-v2.5-pro', contextWindow: 1_000_000, inputKeys: ['text'], capabilityKeys: ['agent_orchestration','novel'] },
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
    id: 'ollama',
    name: '本地 Ollama',
    baseUrl: 'http://127.0.0.1:11434/v1',
    apiFormat: 'openai_chat',
    models: [
      { modelId: 'llama3.1', contextWindow: 128_000, inputKeys: ['text'], capabilityKeys: ['agent_orchestration'] },
      { modelId: 'qwen3.6', contextWindow: 256_000, inputKeys: ['text', 'image'], capabilityKeys: ['agent_orchestration', 'coding'] },
    ],
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
