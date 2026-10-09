import { useState, type CSSProperties } from 'react';
import { DesktopOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { Button, Select, Segmented, Typography } from 'antd';
import { useColorScheme } from './colorScheme';
import { useProviderWorkspace } from './providerWorkspaceContext';
import type { ProviderConfig } from './types/provider';
import { CatalogListEditor } from './ui/catalog/CatalogListEditor';
import { ModelIoTypeIcon } from './ui/modelIoIcons';
import { ConfiguredProviderList } from './ui/provider/ConfiguredProviderList';
import { ProviderPicker } from './ui/provider/ProviderPicker';

const { Text } = Typography;

/** 空选表示不过滤。多选为 OR：模型具备任一所选能力即保留。 */
function filterProvidersByCapabilities(providers: ProviderConfig[], capabilityKeys?: string[]): ProviderConfig[] {
  const selected = new Set((capabilityKeys ?? []).map((key) => key.trim()).filter(Boolean));
  if (selected.size === 0) return providers;
  return providers.flatMap((provider) => {
    const models = provider.models.filter((model) => model.capabilityKeys.some((key) => selected.has(key)));
    if (models.length === 0) return [];
    return [{ ...provider, models }];
  });
}

/** 已配置的供应商。传入 capabilityKeys 时按能力过滤。 */
export function AiProviderChoosedList({ capabilityKeys }: { capabilityKeys?: string[] }) {
  const { ready, workspace, setEditingId } = useProviderWorkspace();
  if (!ready || !workspace) return null;
  const providers = filterProvidersByCapabilities(workspace.providers, capabilityKeys);
  return (
    <section className="aimc-section">
      {providers.length === 0 && workspace.providers.length > 0 ? (
        <Text type="secondary">没有符合所选能力的供应商</Text>
      ) : (
        <ConfiguredProviderList providers={providers} capabilities={workspace.capabilities} onOpen={setEditingId} />
      )}
    </section>
  );
}

/** 能力多选。Toggle Button，空选表示不过滤。 */
export function AiModelCapabilityPicker({
  value = [],
  onChange,
}: {
  value?: string[];
  onChange?: (keys: string[]) => void;
}) {
  const { ready, workspace } = useProviderWorkspace();
  if (!ready || !workspace) return null;
  const selected = new Set(value);
  const items = workspace.capabilities.filter((item) => item.key.trim() && item.label.trim());

  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange?.(Array.from(next));
  };

  return (
    <div className="aimc-capability-picker">
      {items.map((item) => {
        const active = selected.has(item.key);
        return (
          <Button
            key={item.key}
            type={active ? 'primary' : 'default'}
            aria-pressed={active}
            icon={item.icon ? <ModelIoTypeIcon typeKey={item.icon} style={{ color: 'currentColor' }} /> : undefined}
            onClick={() => toggle(item.key)}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
}

/** 已添加供应商里、已启用的模型。capabilityKeys 与列表相同，空选不过滤。 */
export function AiModelChoosedSelect({
  capabilityKeys,
  showProvider = true,
  value,
  onChange,
  style,
}: {
  capabilityKeys?: string[];
  /** 是否显示模型供应商，默认显示 */
  showProvider?: boolean;
  value?: string;
  onChange?: (modelId?: string) => void;
  style?: CSSProperties;
}) {
  const { ready, workspace } = useProviderWorkspace();
  const [inner, setInner] = useState<string | undefined>();
  if (!ready || !workspace) return null;
  const options = filterProvidersByCapabilities(workspace.providers, capabilityKeys).flatMap((provider) =>
    provider.models
      .filter((model) => model.enabled)
      .map((model) => {
        const modelName = model.modelId || '未命名模型';
        return {
          value: model.id,
          label: showProvider ? `${provider.name} / ${modelName}` : modelName,
        };
      }),
  );
  const current = value !== undefined ? value : inner;
  const selected = current != null && options.some((item) => item.value === current) ? current : undefined;

  return (
    <Select
      className="aimc-model-choosed-select"
      style={style}
      allowClear
      placeholder="选择模型"
      options={options}
      value={selected}
      onChange={(next) => {
        const modelId = next ?? undefined;
        if (value === undefined) setInner(modelId);
        onChange?.(modelId);
      }}
    />
  );
}

/** 添加供应商 */
export function AiModelAddProvider() {
  const { ready, workspace, createCustom, pickBuiltin } = useProviderWorkspace();
  if (!ready || !workspace) return null;
  return (
    <section className="aimc-section">
      <ProviderPicker onCreateCustom={createCustom} onPickBuiltin={pickBuiltin} />
    </section>
  );
}

/** 模型输入 / 输出清单 */
export function AiModelIoCatalog() {
  const { ready, workspace, setInputTypes, setOutputTypes } = useProviderWorkspace();
  if (!ready || !workspace) return null;
  return (
    <div className="aimc-catalog-grid">
      <CatalogListEditor title="模型输入" items={workspace.inputTypes} onChange={setInputTypes} />
      <CatalogListEditor title="模型输出" items={workspace.outputTypes} onChange={setOutputTypes} />
    </div>
  );
}

/** 设置页中的模型输入 / 输出 */
export function AiModelIoSetting() {
  return (
    <section className="aimc-section">
      <AiModelIoCatalog />
    </section>
  );
}

/** 模型能力清单 */
export function AiModelCapabilityCatalog() {
  const { ready, workspace, setCapabilities } = useProviderWorkspace();
  if (!ready || !workspace) return null;
  return <CatalogListEditor title="能力项" items={workspace.capabilities} onChange={setCapabilities} />;
}

/** 设置页中的模型能力清单 */
export function AiModelCapabilitySetting() {
  return (
    <section className="aimc-section">
      <AiModelCapabilityCatalog />
    </section>
  );
}

/** 主题切换。AiModelConfigProvider 写死 theme 时不渲染。 */
export function AiModelThemeSwitch() {
  const { colorScheme, locked, setColorScheme } = useColorScheme();
  if (locked) return null;
  return (
    <div className="aimc-theme-bar">
      <Segmented
        value={colorScheme}
        onChange={(value) => {
          if (value === 'auto' || value === 'dark' || value === 'light') setColorScheme(value);
        }}
        options={[
          { value: 'auto', icon: <DesktopOutlined />, tooltip: '自动' },
          { value: 'dark', icon: <MoonOutlined />, tooltip: '深色' },
          { value: 'light', icon: <SunOutlined />, tooltip: '浅色' },
        ]}
      />
    </div>
  );
}
