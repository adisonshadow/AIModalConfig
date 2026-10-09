import type { CatalogListItem, ProviderConfig, ProviderModelConfig, ProviderWorkspace } from './types/provider';
import { isApiFormat } from './logic/providerWorkspace';

export const WORKSPACE_STORAGE_KEY = 'ai-modal-config:provider-workspace';

function isCatalogItem(value: unknown): value is CatalogListItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as CatalogListItem;
  return typeof item.key === 'string' && typeof item.label === 'string' && (item.icon == null || typeof item.icon === 'string');
}

function isProviderModel(value: unknown): value is ProviderModelConfig {
  if (!value || typeof value !== 'object') return false;
  const model = value as ProviderModelConfig;
  return typeof model.id === 'string' && typeof model.modelId === 'string' && typeof model.enabled === 'boolean';
}

function normalizeModel(model: ProviderModelConfig): ProviderModelConfig {
  return {
    ...model,
    inputKeys: Array.isArray(model.inputKeys) ? model.inputKeys : ['text'],
    capabilityKeys: Array.isArray(model.capabilityKeys) ? model.capabilityKeys : [],
    reasoningLevels: Array.isArray(model.reasoningLevels) ? model.reasoningLevels : [],
    smartConfig: model.smartConfig === true,
  };
}

function isProvider(value: unknown): value is ProviderConfig {
  if (!value || typeof value !== 'object') return false;
  const provider = value as ProviderConfig;
  return (
    typeof provider.id === 'string' &&
    typeof provider.name === 'string' &&
    typeof provider.baseUrl === 'string' &&
    isApiFormat(provider.apiFormat) &&
    typeof provider.apiKey === 'string' &&
    typeof provider.enabled === 'boolean' &&
    Array.isArray(provider.models) &&
    provider.models.every(isProviderModel)
  );
}

function normalizeProvider(provider: ProviderConfig): ProviderConfig {
  return { ...provider, models: provider.models.map(normalizeModel) };
}

export function parseWorkspace(raw: unknown): ProviderWorkspace | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as ProviderWorkspace;
  if (!Array.isArray(data.providers) || !data.providers.every(isProvider)) return null;
  data.providers = data.providers.map(normalizeProvider);
  if (!Array.isArray(data.inputTypes) || !data.inputTypes.every(isCatalogItem)) return null;
  if (!Array.isArray(data.outputTypes) || !data.outputTypes.every(isCatalogItem)) return null;
  if (!Array.isArray(data.capabilities) || !data.capabilities.every(isCatalogItem)) return null;
  return data;
}

export function loadWorkspace(): ProviderWorkspace | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (raw == null) return null;
  try {
    return parseWorkspace(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveWorkspace(workspace: ProviderWorkspace): { ok: boolean; error?: string } {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '保存失败' };
  }
}
