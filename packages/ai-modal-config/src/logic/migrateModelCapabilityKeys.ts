/**
 * 将已保存模型实例的 capabilityKeys 与预设中对应 modal 对齐（预设更新后旧配置不会自动变）
 */
import type { ModelPreset } from '../presets/modelPresets';
import { MODEL_PRESETS } from '../presets/modelPresets';
import type { AIModelConfig } from '../types/model';
import { resolveRequestModelId } from './aiModelRequestId';
import { resolveRecommendedVariant } from './recommendedModal';

function capabilityKeysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort().join('\0');
  const sb = [...b].sort().join('\0');
  return sa === sb;
}

/** 按 presetKey + modelDisplayName / requestModelId 解析预设 modal 的 capabilityKeys */
export function resolveCapabilityKeysFromPreset(
  model: AIModelConfig,
  presets: ModelPreset[] = MODEL_PRESETS,
): string[] | null {
  const presetKey = model.presetKey?.trim();
  if (!presetKey) return null;
  const preset = presets.find((p) => p.presetKey === presetKey);
  if (!preset) return null;

  const md = (model.modelDisplayName ?? model.model ?? '').trim();
  const pv = (model.primaryVersion ?? '').trim();
  const variant = resolveRecommendedVariant(preset, md, pv);
  if (variant?.abilityTags?.length) {
    return [...variant.abilityTags];
  }

  const rid = (resolveRequestModelId(model) ?? '').trim().toLowerCase();
  if (rid && preset.recommendedModals?.length) {
    const byRid = preset.recommendedModals.find((m) => m.name.toLowerCase() === rid);
    if (byRid?.abilityTags?.length) return [...byRid.abilityTags];
  }

  return null;
}

export function migrateModelsCapabilityKeys(
  models: AIModelConfig[],
  presets: ModelPreset[] = MODEL_PRESETS,
): {
  models: AIModelConfig[];
  changed: boolean;
} {
  let changed = false;
  const next = models.map((m) => {
    const keys = resolveCapabilityKeysFromPreset(m, presets);
    if (!keys) return m;
    const current = m.capabilityKeys ?? [];
    if (capabilityKeysEqual(current, keys)) return m;
    changed = true;
    return { ...m, capabilityKeys: keys };
  });
  return { models: next, changed };
}
