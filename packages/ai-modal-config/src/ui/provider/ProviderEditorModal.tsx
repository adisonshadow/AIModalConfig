import { useEffect, useState } from 'react';
import { EditOutlined, InfoCircleOutlined, LinkOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Modal, Select, Switch, Typography } from 'antd';
import type { CatalogListItem, ProviderConfig, ProviderModelConfig } from '../../types/provider';
import { API_FORMAT_OPTIONS } from '../../types/provider';
import { buildProviderTestRequest, providerTestBlockedReason } from '../../logic/providerWorkspace';
import { useColorScheme } from '../../colorScheme';
import { CapabilityPreview } from './CapabilityPreview';
import { ProviderLogo } from './ProviderLogo';
import { ProviderModelModal } from './ProviderModelModal';

const { Text } = Typography;

/** 与默认按钮 controlHeight 对齐。Switch 没有 large。 */
const PROVIDER_SWITCH_HEIGHT = 32;
const PROVIDER_SWITCH_PADDING = 2;
const PROVIDER_SWITCH_HANDLE = PROVIDER_SWITCH_HEIGHT - PROVIDER_SWITCH_PADDING * 2;

function providerSwitchStyles({ props }: { props: { checked?: boolean } }) {
  const checked = props.checked === true;
  return {
    root: {
      height: PROVIDER_SWITCH_HEIGHT,
      minWidth: 84,
      lineHeight: `${PROVIDER_SWITCH_HEIGHT}px`,
    },
    indicator: {
      width: PROVIDER_SWITCH_HANDLE,
      height: PROVIDER_SWITCH_HANDLE,
      insetInlineStart: checked
        ? `calc(100% - ${PROVIDER_SWITCH_HANDLE + PROVIDER_SWITCH_PADDING}px)`
        : PROVIDER_SWITCH_PADDING,
    },
    content: {
      minHeight: PROVIDER_SWITCH_HEIGHT,
      fontSize: 14,
    },
  };
}

export function ProviderEditorModal({
  provider,
  inputTypes,
  capabilities,
  onClose,
  onChange,
  onDelete,
}: {
  provider: ProviderConfig | null;
  inputTypes: CatalogListItem[];
  capabilities: CatalogListItem[];
  onClose: () => void;
  onChange: (next: ProviderConfig) => void;
  onDelete: (id: string) => void;
}) {
  const { dark } = useColorScheme();
  const nativeScheme = dark ? 'dark' : 'light';
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [modelEditor, setModelEditor] = useState<ProviderModelConfig | 'new' | null>(null);

  useEffect(() => {
    setAlert(null);
    setModelEditor(null);
  }, [provider?.id]);

  const testModel = async (model: ProviderModelConfig) => {
    if (!provider) return;
    const blocked = providerTestBlockedReason(provider, model);
    if (blocked) {
      setAlert({ type: 'error', text: blocked });
      return;
    }
    setTestingId(model.id);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const { url, init } = buildProviderTestRequest(provider, model.modelId.trim());
      const res = await fetch(url, { ...init, signal: ctrl.signal });
      const snippet = (await res.text()).replace(/\s+/g, ' ').slice(0, 160);
      if (!res.ok) {
        setAlert({ type: 'error', text: `${provider.name} / ${model.modelId} 连接失败：${res.status} ${snippet}`.trim() });
      } else {
        setAlert({ type: 'success', text: `${provider.name} / ${model.modelId} 连接成功` });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '网络错误';
      setAlert({ type: 'error', text: `${provider.name} / ${model.modelId} 连接失败：${message}` });
    } finally {
      clearTimeout(timer);
      setTestingId(null);
    }
  };

  const confirmDelete = () => {
    if (!provider) return;
    Modal.confirm({
      title: `删除 ${provider.name}？`,
      content: '供应商及其模型会从已配置列表中移除。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => onDelete(provider.id),
    });
  };

  const saveModel = (model: ProviderModelConfig) => {
    if (!provider) return;
    const exists = provider.models.some((item) => item.id === model.id);
    onChange({
      ...provider,
      models: exists ? provider.models.map((item) => (item.id === model.id ? model : item)) : [...provider.models, model],
    });
    setModelEditor(null);
  };

  return (
    <>
      <Modal
        open={provider != null}
        title={
          provider ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 28 }}>
              <ProviderLogo builtinId={provider.builtinId} />
              {provider.builtinId ? (
                <Text strong style={{ fontSize: 16 }}>
                  {provider.name}
                </Text>
              ) : (
                <Input
                  value={provider.name}
                  variant="borderless"
                  style={{ fontSize: 16, fontWeight: 600, padding: 0, width: 220 }}
                  onChange={(e) => onChange({ ...provider, name: e.target.value })}
                />
              )}
            </div>
          ) : null
        }
        centered
        width={680}
        footer={
          provider ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button danger onClick={confirmDelete}>
                删除供应商
              </Button>
              <Switch
                classNames={{ root: 'aimc-provider-switch', indicator: 'aimc-provider-switch-handle' }}
                styles={providerSwitchStyles}
                checked={provider.enabled}
                checkedChildren="启用"
                unCheckedChildren="禁用"
                onChange={(enabled) => onChange({ ...provider, enabled })}
              />
            </div>
          ) : null
        }
        destroyOnHidden
        onCancel={onClose}
        styles={{
          container: { colorScheme: nativeScheme },
          body: { maxHeight: '70vh', overflowY: 'auto', colorScheme: nativeScheme },
        }}
      >
        {provider ? (
          <div>
            {alert ? (
              <Alert
                className="aimc-test-alert"
                type={alert.type}
                showIcon
                closable
                message={alert.text}
                onClose={() => setAlert(null)}
              />
            ) : null}
            <div style={{ marginBottom: 16 }}>
              <Text style={{ display: 'block', marginBottom: 8 }}>Base URL</Text>
              <Input
                value={provider.baseUrl}
                placeholder="https://api.example.com/v1"
                onChange={(e) => onChange({ ...provider, baseUrl: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text style={{ display: 'block', marginBottom: 8 }}>API 格式</Text>
              <Select
                style={{ width: '100%' }}
                value={provider.apiFormat}
                options={API_FORMAT_OPTIONS}
                onChange={(apiFormat) => onChange({ ...provider, apiFormat })}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>API Key</Text>
                {provider.keyUrl ? (
                  <a href={provider.keyUrl} target="_blank" rel="noreferrer">
                    获取 API Key
                  </a>
                ) : null}
              </div>
              <Input.Password
                value={provider.apiKey}
                placeholder="输入 API Key"
                onChange={(e) => onChange({ ...provider, apiKey: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text>模型列表</Text>
              <Button icon={<PlusOutlined />} onClick={() => setModelEditor('new')}>
                添加模型
              </Button>
            </div>
            {provider.models.length === 0 ? (
              <div className="aimc-empty-models">
                <InfoCircleOutlined />
                <span>当前没有配置模型，添加模型后可在聊天中使用。</span>
              </div>
            ) : (
              provider.models.map((model) => (
                  <div key={model.id} className="aimc-model-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ maxWidth: '100%' }} ellipsis>
                        {model.modelId || '未命名模型'}
                      </Text>
                      <CapabilityPreview
                        className="aimc-capability-preview aimc-model-capabilities"
                        keys={model.capabilityKeys}
                        capabilities={capabilities}
                      />
                    </div>
                    <Button
                      type="text"
                      aria-label={`测试 ${model.modelId || '模型'}`}
                      icon={testingId === model.id ? <LoadingOutlined /> : <LinkOutlined />}
                      disabled={testingId != null}
                      onClick={() => void testModel(model)}
                    />
                    <Button type="text" aria-label={`编辑 ${model.modelId || '模型'}`} icon={<EditOutlined />} onClick={() => setModelEditor(model)} />
                    <Switch
                      checked={model.enabled}
                      onChange={(enabled) =>
                        onChange({
                          ...provider,
                          models: provider.models.map((item) => (item.id === model.id ? { ...item, enabled } : item)),
                        })
                      }
                    />
                  </div>
              ))
            )}
          </div>
        ) : null}
      </Modal>
      <ProviderModelModal
        open={modelEditor != null}
        model={modelEditor && modelEditor !== 'new' ? modelEditor : null}
        inputTypes={inputTypes}
        capabilities={capabilities}
        onCancel={() => setModelEditor(null)}
        onSave={saveModel}
      />
    </>
  );
}
