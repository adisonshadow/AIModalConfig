import type { AIModelConfig } from './types/model';

export interface ModelStorage {
  /** 尚无存档时返回 null；空数组表示用户已保存过空列表 */
  load: () => Promise<AIModelConfig[] | null>;
  save: (models: AIModelConfig[]) => Promise<{ ok: boolean; error?: string }>;
}

export const LOCAL_STORAGE_KEY = 'ai-modal-config:models';

export const localStorageModelStorage: ModelStorage = {
  async load() {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw == null) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed as AIModelConfig[];
    } catch {
      return null;
    }
  },
  async save(models) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(models));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : '保存失败' };
    }
  },
};
