import type { AIModelConfig } from '../types/model';
import type { ApiFormat, CatalogListItem, ProviderConfig, ProviderModelConfig, ProviderWorkspace } from '../types/provider';
import { BUILTIN_PROVIDERS, templateToProviderModel, type BuiltinProvider } from '../providers/builtinProviders';

export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function formatContextWindow(n: number | undefined): string | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null;
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    const text = Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10);
    return `${text}M`;
  }
  if (n >= 1000) {
    const v = n / 1000;
    const text = Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10);
    return `${text}K`;
  }
  return String(Math.round(n));
}

export function providerFromBuiltin(builtin: BuiltinProvider): ProviderConfig {
  return {
    id: createId('pv'),
    builtinId: builtin.id,
    name: builtin.name,
    baseUrl: builtin.baseUrl,
    apiFormat: builtin.apiFormat,
    apiKey: '',
    enabled: false,
    keyUrl: builtin.keyUrl,
    models: builtin.models.map((m) => templateToProviderModel(m, createId('pm'))),
  };
}

export function createCustomProvider(): ProviderConfig {
  return {
    id: createId('pv'),
    name: '新供应商',
    baseUrl: '',
    apiFormat: 'anthropic_messages',
    apiKey: '',
    enabled: false,
    models: [],
  };
}

export function seedIoItems(io: Record<string, { label: string }>, extraPdf: boolean): CatalogListItem[] {
  const items: CatalogListItem[] = Object.entries(io).map(([key, meta]) => ({
    key,
    label: meta.label,
    icon: key,
  }));
  if (extraPdf && !items.some((item) => item.key === 'pdf')) {
    const videoAt = items.findIndex((item) => item.key === 'video');
    items.splice(videoAt >= 0 ? videoAt + 1 : items.length, 0, { key: 'pdf', label: 'PDF', icon: 'pdf' });
  }
  return items;
}

/** 把「通用Agent」从旧默认清单末尾提到第一项，并补上 Gemini 图标。已调整过的清单不动。 */
const LEGACY_CAPABILITY_KEYS = [
  'draw',
  'matting',
  'sprite',
  'novel',
  'voice_over',
  'voice_design',
  'voice_enrollment',
  'music',
  'sound_effect',
  'coding',
  'video',
  'image_edit',
  'remove_watermark',
  'image_outpaint',
  'image_clarity',
  'agent_orchestration',
  'transparent_image',
];

export function promoteDefaultAgentCapability(items: CatalogListItem[]): CatalogListItem[] {
  if (items.map((item) => item.key).join('\0') !== LEGACY_CAPABILITY_KEYS.join('\0')) return items;
  const agentIndex = items.findIndex((item) => item.key === 'agent_orchestration');
  const agent = items[agentIndex];
  if (!agent) return items;
  return [{ ...agent, icon: agent.icon || 'gemini' }, ...items.filter((_, index) => index !== agentIndex)];
}

export function seedWorkspace(
  io: Record<string, { label: string }>,
  capabilities: { key: string; label: string; icon?: string }[],
): ProviderWorkspace {
  return {
    providers: [],
    inputTypes: seedIoItems(io, true),
    outputTypes: seedIoItems(io, false),
    capabilities: capabilities.map((item) => ({
      key: item.key,
      label: item.label,
      ...(item.icon ? { icon: item.icon } : {}),
    })),
  };
}

/** 把旧的扁平模型收成供应商，便于第一次打开新界面时仍能看到已保存的数据。 */
export function providersFromLegacyModels(models: AIModelConfig[]): ProviderConfig[] {
  const groups = new Map<string, AIModelConfig[]>();
  for (const model of models) {
    if (model.providerConfigId) continue;
    const name = model.provider?.trim() || '自定义';
    const bucket = `${name}@@${model.apiUrl ?? ''}`;
    const list = groups.get(bucket) ?? [];
    list.push(model);
    groups.set(bucket, list);
  }
  const providers: ProviderConfig[] = [];
  for (const list of groups.values()) {
    const first = list[0];
    if (!first) continue;
    const builtin = BUILTIN_PROVIDERS.find((item) => item.name === (first.provider?.trim() || ''));
    providers.push({
      id: createId('pv'),
      builtinId: builtin?.id,
      name: first.provider?.trim() || '自定义',
      baseUrl: first.apiUrl ?? '',
      apiFormat: builtin?.apiFormat ?? 'openai_chat',
      apiKey: first.apiKey ?? '',
      enabled: true,
      keyUrl: builtin?.keyUrl,
      models: list.map((model) => legacyModelToProviderModel(model)),
    });
  }
  return providers;
}

function legacyModelToProviderModel(model: AIModelConfig): ProviderModelConfig {
  return {
    id: model.id,
    modelId: (model.modelDisplayName || model.model || model.name || '').trim(),
    enabled: true,
    inputKeys: ['text'],
    capabilityKeys: model.capabilityKeys ?? [],
    reasoningLevels: [],
    smartConfig: false,
  };
}

export function projectProviderModels(providers: ProviderConfig[]): AIModelConfig[] {
  const out: AIModelConfig[] = [];
  for (const provider of providers) {
    if (!provider.enabled) continue;
    for (const model of provider.models) {
      const modelId = model.modelId.trim();
      if (!model.enabled || !modelId) continue;
      const item: AIModelConfig = {
        id: model.id,
        name: modelId,
        provider: provider.name,
        apiUrl: provider.baseUrl,
        apiKey: provider.apiKey,
        modelDisplayName: modelId,
        capabilityKeys: model.capabilityKeys ?? [],
        providerConfigId: provider.id,
      };
      if (provider.builtinId) item.vendorKey = provider.builtinId;
      out.push(item);
    }
  }
  return out;
}

export function mergeProjectedModels(existing: AIModelConfig[], providers: ProviderConfig[]): AIModelConfig[] {
  const projected = projectProviderModels(providers);
  const projectedIds = new Set(projected.map((model) => model.id));
  const kept = existing.filter((model) => !model.providerConfigId && !projectedIds.has(model.id));
  return [...projected, ...kept];
}

export function sameModelList(a: AIModelConfig[], b: AIModelConfig[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** 供应商或模型未就绪时返回失败文案；可以发起请求时返回 null。 */
export function providerTestBlockedReason(
  provider: Pick<ProviderConfig, 'name' | 'enabled' | 'apiKey' | 'baseUrl'>,
  model: Pick<ProviderModelConfig, 'modelId' | 'enabled'>,
): string | null {
  const modelId = model.modelId.trim() || '未命名模型';
  const prefix = `${provider.name} / ${modelId} 连接失败：`;
  if (!provider.enabled) return `${prefix}该供应商当前不可用，无法测试连接`;
  if (!model.enabled) return `${prefix}该模型当前未启用，无法测试连接`;
  if (!provider.baseUrl.trim()) return `${prefix}未填写 Base URL，无法测试连接`;
  if (!provider.apiKey.trim()) return `${prefix}未填写 API Key，无法测试连接`;
  return null;
}

export function buildProviderTestRequest(
  provider: Pick<ProviderConfig, 'baseUrl' | 'apiFormat' | 'apiKey'>,
  modelId: string,
): { url: string; init: RequestInit } {
  const base = provider.baseUrl.trim().replace(/\/+$/, '');
  const key = provider.apiKey.trim();
  if (provider.apiFormat === 'anthropic_messages') {
    const url = base.endsWith('/messages') ? base : `${base}/v1/messages`;
    return {
      url,
      init: {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      },
    };
  }
  if (provider.apiFormat === 'google_gemini') {
    const url = `${base}/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(key)}`;
    return {
      url,
      init: {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] }),
      },
    };
  }
  const path = provider.apiFormat === 'openai_responses' ? 'responses' : 'chat/completions';
  const url = /\/v1$/.test(base) ? `${base}/${path}` : `${base}/v1/${path}`;
  const body =
    provider.apiFormat === 'openai_responses'
      ? { model: modelId, input: 'ping', max_output_tokens: 16 }
      : { model: modelId, messages: [{ role: 'user', content: 'ping' }], max_tokens: 1 };
  return {
    url,
    init: {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    },
  };
}

export function isApiFormat(value: unknown): value is ApiFormat {
  return value === 'anthropic_messages' || value === 'openai_chat' || value === 'openai_responses' || value === 'google_gemini';
}
