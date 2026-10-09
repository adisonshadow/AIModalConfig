import { Tag, Typography } from 'antd';
import type { CatalogListItem, ProviderConfig } from '../../types/provider';
import { CapabilityPreview } from './CapabilityPreview';
import { ProviderLogo } from './ProviderLogo';

const { Text } = Typography;

export function ConfiguredProviderList({
  providers,
  capabilities,
  onOpen,
}: {
  providers: ProviderConfig[];
  capabilities: CatalogListItem[];
  onOpen: (id: string) => void;
}) {
  if (providers.length === 0) {
    return <Text type="secondary">还没有配置供应商，从下方选择添加。</Text>;
  }

  return (
    <div>
      {providers.map((provider) => (
        <button key={provider.id} type="button" className="aimc-config-card" onClick={() => onOpen(provider.id)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ProviderLogo builtinId={provider.builtinId} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text strong>{provider.name}</Text>
                <Tag style={{ margin: 0 }} color={provider.enabled ? 'green' : 'default'}>
                  {provider.enabled ? '已启用' : '已停用'}
                </Tag>
              </div>
              <div className="aimc-config-models">
                {provider.models.length === 0 ? (
                  <Text type="secondary">尚未添加模型</Text>
                ) : (
                  provider.models.map((model) => (
                    <span key={model.id} className={model.enabled ? 'aimc-config-model' : 'aimc-config-model is-disabled'}>
                      {model.modelId || '未命名模型'}
                      <CapabilityPreview keys={model.capabilityKeys} capabilities={capabilities} />
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
