import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { App } from 'antd';
import { useAiModelConfig } from './context';
import {
  createCustomProvider,
  mergeProjectedModels,
  promoteDefaultAgentCapability,
  providerFromBuiltin,
  providersFromLegacyModels,
  sameModelList,
  seedWorkspace,
} from './logic/providerWorkspace';
import { BUILTIN_PROVIDERS } from './providers/builtinProviders';
import type { CatalogListItem, ProviderConfig, ProviderWorkspace } from './types/provider';
import { ProviderEditorModal } from './ui/provider/ProviderEditorModal';
import { loadWorkspace, saveWorkspace } from './workspaceStorage';
import './ui/provider/providerPanel.css';

interface ProviderWorkspaceContextValue {
  ready: boolean;
  workspace: ProviderWorkspace | null;
  setEditingId: (id: string | null) => void;
  openProvider: (provider: ProviderConfig) => void;
  pickBuiltin: (builtinId: string) => void;
  createCustom: () => void;
  setInputTypes: (inputTypes: CatalogListItem[]) => void;
  setOutputTypes: (outputTypes: CatalogListItem[]) => void;
  setCapabilities: (capabilities: CatalogListItem[]) => void;
}

const ProviderWorkspaceContext = createContext<ProviderWorkspaceContextValue | null>(null);

export function useProviderWorkspace(): ProviderWorkspaceContextValue {
  const ctx = useContext(ProviderWorkspaceContext);
  if (!ctx) {
    throw new Error('供应商组件需要放在 AiModelConfigProvider 内');
  }
  return ctx;
}

export function ProviderWorkspaceRoot({ children }: { children: ReactNode }) {
  const { message } = App.useApp();
  const { models, ready, catalog, commitModels } = useAiModelConfig();
  const [workspace, setWorkspace] = useState<ProviderWorkspace | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!ready || hydrated.current) return;
    hydrated.current = true;
    const saved = loadWorkspace();
    if (saved) {
      setWorkspace({ ...saved, capabilities: promoteDefaultAgentCapability(saved.capabilities) });
      return;
    }
    const seeded = seedWorkspace(catalog.ioTypes, catalog.capabilityTags);
    seeded.providers = providersFromLegacyModels(models);
    setWorkspace(seeded);
  }, [ready, catalog, models]);

  useEffect(() => {
    if (!workspace || !hydrated.current) return;
    const res = saveWorkspace(workspace);
    if (!res.ok) message.error(res.error || '保存供应商配置失败');
  }, [workspace, message]);

  useEffect(() => {
    if (!workspace || !hydrated.current) return;
    const next = mergeProjectedModels(models, workspace.providers);
    if (sameModelList(models, next)) return;
    void commitModels(next, '');
  }, [workspace, models, commitModels]);

  const updateProvider = useCallback((next: ProviderConfig) => {
    setWorkspace((current) =>
      current
        ? { ...current, providers: current.providers.map((item) => (item.id === next.id ? next : item)) }
        : current,
    );
  }, []);

  const openProvider = useCallback((provider: ProviderConfig) => {
    setWorkspace((current) => (current ? { ...current, providers: [...current.providers, provider] } : current));
    setEditingId(provider.id);
  }, []);

  const pickBuiltin = useCallback(
    (builtinId: string) => {
      const existing = workspace?.providers.find((item) => item.builtinId === builtinId);
      if (existing) {
        setEditingId(existing.id);
        return;
      }
      const builtin = BUILTIN_PROVIDERS.find((item) => item.id === builtinId);
      if (!builtin) return;
      openProvider(providerFromBuiltin(builtin));
    },
    [workspace, openProvider],
  );

  const createCustom = useCallback(() => {
    openProvider(createCustomProvider());
  }, [openProvider]);

  const setInputTypes = useCallback((inputTypes: CatalogListItem[]) => {
    setWorkspace((current) => (current ? { ...current, inputTypes } : current));
  }, []);

  const setOutputTypes = useCallback((outputTypes: CatalogListItem[]) => {
    setWorkspace((current) => (current ? { ...current, outputTypes } : current));
  }, []);

  const setCapabilities = useCallback((capabilities: CatalogListItem[]) => {
    setWorkspace((current) => (current ? { ...current, capabilities } : current));
  }, []);

  const deleteProvider = useCallback((id: string) => {
    setWorkspace((current) =>
      current ? { ...current, providers: current.providers.filter((item) => item.id !== id) } : current,
    );
    setEditingId(null);
  }, []);

  const value = useMemo(
    () => ({
      ready: workspace != null,
      workspace,
      setEditingId,
      openProvider,
      pickBuiltin,
      createCustom,
      setInputTypes,
      setOutputTypes,
      setCapabilities,
    }),
    [workspace, openProvider, pickBuiltin, createCustom, setInputTypes, setOutputTypes, setCapabilities],
  );

  const editing = workspace?.providers.find((item) => item.id === editingId) ?? null;

  return (
    <ProviderWorkspaceContext.Provider value={value}>
      {children}
      {workspace ? (
        <ProviderEditorModal
          provider={editing}
          inputTypes={workspace.inputTypes}
          capabilities={workspace.capabilities}
          onClose={() => setEditingId(null)}
          onChange={updateProvider}
          onDelete={deleteProvider}
        />
      ) : null}
    </ProviderWorkspaceContext.Provider>
  );
}
