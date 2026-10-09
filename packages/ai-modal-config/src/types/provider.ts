/**
 * 供应商连接，以及输入/输出、能力清单项。
 * 清单项的 icon 可空，存的是图标逻辑键（见 CATALOG_ICON_OPTIONS），不是组件。
 */

export type ApiFormat = 'anthropic_messages' | 'openai_chat' | 'openai_responses' | 'google_gemini';

export interface CatalogListItem {
  key: string;
  label: string;
  /** 可空。对应 modelIoIcons 里的逻辑键 */
  icon?: string;
}

export interface ProviderModelConfig {
  id: string;
  modelId: string;
  enabled: boolean;
  contextWindow?: number;
  maxOutputTokens?: number;
  inputKeys: string[];
  capabilityKeys: string[];
  /** 从低到高 */
  reasoningLevels: string[];
  reasoningParamMap?: string;
  smartConfig: boolean;
}

export interface ProviderConfig {
  id: string;
  /** 内置供应商 id；自定义供应商没有 */
  builtinId?: string;
  name: string;
  baseUrl: string;
  apiFormat: ApiFormat;
  apiKey: string;
  enabled: boolean;
  /** 「获取 API Key」链接 */
  keyUrl?: string;
  models: ProviderModelConfig[];
}

export interface ProviderWorkspace {
  providers: ProviderConfig[];
  inputTypes: CatalogListItem[];
  outputTypes: CatalogListItem[];
  capabilities: CatalogListItem[];
}

export const API_FORMAT_OPTIONS: { value: ApiFormat; label: string }[] = [
  { value: 'anthropic_messages', label: 'Anthropic Messages (/v1/messages)' },
  { value: 'openai_chat', label: 'OpenAI Chat Completions (/v1/chat/completions)' },
  { value: 'openai_responses', label: 'OpenAI Responses (/v1/responses)' },
  { value: 'google_gemini', label: 'Google Gemini' },
];
