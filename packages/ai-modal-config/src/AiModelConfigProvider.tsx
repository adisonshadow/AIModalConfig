import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { App } from 'antd';
import { ColorSchemeRoot, type ColorScheme } from './colorScheme';
import { AiModelConfigContext } from './context';
import { ProviderWorkspaceRoot } from './providerWorkspaceContext';
import type { ModelCatalog } from './catalog';
import { migrateModelsCapabilityKeys } from './logic/migrateModelCapabilityKeys';
import type { ModelStorage } from './storage';
import type { AIModelConfig } from './types/model';

export interface AiModelConfigProviderProps {
  /** 初始化导入的目录：能力、输入/输出、预设供应商与大模型 */
  catalog: ModelCatalog;
  /** 本地尚无存档时作为种子；已有存档则忽略 */
  initialModels: AIModelConfig[];
  storage: ModelStorage;
  /**
   * 写死主题。传入后面板不显示切换，也不再使用用户上次的选择。
   * 不传则由面板在自动、深色、浅色之间切换。
   */
  theme?: ColorScheme;
  children: ReactNode;
}

export function AiModelConfigProvider({ theme, ...props }: AiModelConfigProviderProps) {
  return (
    <ColorSchemeRoot theme={theme}>
      <AiModelConfigProviderInner {...props} />
    </ColorSchemeRoot>
  );
}

function AiModelConfigProviderInner({
  catalog,
  initialModels,
  storage,
  children,
}: Omit<AiModelConfigProviderProps, 'theme'>) {
  const { message } = App.useApp();
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const stored = await storage.load();
        const source = stored ?? initialModels;
        const { models: migrated, changed } = migrateModelsCapabilityKeys(source, catalog.presets);
        if (stored == null || changed) {
          await storage.save(migrated);
        }
        if (!cancelled) {
          setModels(migrated);
          setReady(true);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          message.error('加载配置失败');
          setModels(initialModels);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // 只在挂载时导入配置
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commitModels = async (next: AIModelConfig[], successMessage = '已保存'): Promise<boolean> => {
    try {
      const res = await storage.save(next);
      if (res.ok) {
        setModels(next);
        if (successMessage) message.success(successMessage);
        return true;
      }
      message.error(res.error || '保存失败');
      return false;
    } catch (e) {
      message.error('保存失败');
      console.error(e);
      return false;
    }
  };

  const value = useMemo(
    () => ({ catalog, models, ready, commitModels }),
    // commitModels 闭包依赖 message / storage，挂载后稳定即可
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalog, models, ready],
  );

  return (
    <AiModelConfigContext.Provider value={value}>
      <ProviderWorkspaceRoot>{children}</ProviderWorkspaceRoot>
    </AiModelConfigContext.Provider>
  );
}
