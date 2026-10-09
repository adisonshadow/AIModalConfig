import { createContext, useContext } from 'react';
import { defaultCatalog, type ModelCatalog } from './catalog';
import type { AIModelConfig } from './types/model';

export interface AiModelConfigContextValue {
  catalog: ModelCatalog;
  models: AIModelConfig[];
  ready: boolean;
  commitModels: (next: AIModelConfig[], successMessage?: string) => Promise<boolean>;
}

export const AiModelConfigContext = createContext<AiModelConfigContextValue | null>(null);

export function useAiModelConfig(): AiModelConfigContextValue {
  const ctx = useContext(AiModelConfigContext);
  if (!ctx) {
    throw new Error('useAiModelConfig 需要放在 AiModelConfigProvider 内');
  }
  return ctx;
}

/** 面板内读目录；脱离 Provider 时回退到 defaultCatalog */
export function useModelCatalog(): ModelCatalog {
  return useContext(AiModelConfigContext)?.catalog ?? defaultCatalog;
}
