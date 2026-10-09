/**
 * 添加 AI 模型：常见模型（能力筛选 + 预设 + 右侧表单）/ 自定义表单
 */
import { useEffect, useState } from 'react';
import { App, Button, Form, Typography } from 'antd';
import { AdaptiveModal } from './AdaptiveModal';
import { AdaptiveTabs } from './AdaptiveTabs';
import type { AIModelConfig } from '../types/model';
import type { ModelPreset } from '../presets/modelPresets';
import { findReusableApiKeyForPreset } from '../logic/vendorApiKey';
import { ModelCapabilityFilter } from './ModelCapabilityFilter';
import { ModelPresetGrid } from './ModelPresetGrid';
import { ModelPresetQuickForm, type ModelPresetQuickFormValues } from './ModelPresetQuickForm';
import { CustomModelForm, type CustomModelFormValues } from './CustomModelForm';
import { syncPresetModelsFromTags } from '../logic/presetModelInstances';
import { useModelCatalog } from '../context';

const { Text } = Typography;

export interface AddAiModelModalProps {
  open: boolean;
  onClose: () => void;
  models: AIModelConfig[];
  onCommitModels: (nextModels: AIModelConfig[], message?: string) => Promise<boolean>;
}

export function AddAiModelModal({ open, onClose, models, onCommitModels }: AddAiModelModalProps) {
  const { message } = App.useApp();
  const { presets } = useModelCatalog();
  const [tab, setTab] = useState<string>('preset');
  const [capabilityFilterKeys, setCapabilityFilterKeys] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<ModelPreset | null>(null);
  const [presetQuickForm] = Form.useForm<ModelPresetQuickFormValues>();
  const [addCustomForm] = Form.useForm<CustomModelFormValues>();
  const [customNewId, setCustomNewId] = useState('');

  useEffect(() => {
    if (!open) return;
    setCustomNewId(`m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
    setTab('preset');
    setCapabilityFilterKeys([]);
    setSelectedPreset(null);
    presetQuickForm.resetFields();
    addCustomForm.setFieldsValue({
      apiUrl: '',
      apiKey: '',
      capabilityKeys: [],
      isLocal: false,
    });
  }, [open, presetQuickForm, addCustomForm]);

  useEffect(() => {
    if (!open || tab !== 'custom') return;
    addCustomForm.setFieldsValue({ capabilityKeys: capabilityFilterKeys });
  }, [open, tab, capabilityFilterKeys, addCustomForm]);

  useEffect(() => {
    if (!open || !selectedPreset) return;
    const ex = models.find((m) => m.presetKey === selectedPreset.presetKey);
    const reused = ex?.apiKey?.trim() ? ex.apiKey : findReusableApiKeyForPreset(models, selectedPreset);
    presetQuickForm.setFieldsValue({
      name: ex?.name ?? selectedPreset.displayName,
      modelDisplayNames: [],
      apiKey: ex?.apiKey ?? reused ?? '',
    });
  }, [open, selectedPreset, models, presetQuickForm]);

  const handleSelectPreset = (preset: ModelPreset) => {
    setSelectedPreset(preset);
    const ex = models.find((m) => m.presetKey === preset.presetKey);
    const reused = ex?.apiKey?.trim() ? ex.apiKey : findReusableApiKeyForPreset(models, preset);
    presetQuickForm.setFieldsValue({
      name: ex?.name ?? preset.displayName,
      modelDisplayNames: [],
      apiKey: ex?.apiKey ?? reused ?? '',
    });
  };

  const handleSavePreset = async () => {
    if (!selectedPreset) return;
    try {
      const values = await presetQuickForm.validateFields();
      const tags = (values.modelDisplayNames ?? []).map((x) => String(x).trim()).filter(Boolean);
      const sharedName = (values.name ?? '').trim() || selectedPreset.displayName;
      const apiKey = (values.apiKey ?? '').trim();
      const { nextModels, added, skipped } = syncPresetModelsFromTags({
        preset: selectedPreset,
        allModels: models,
        tags,
        apiKey,
        sharedName,
        mode: 'append',
      });
      let patchedModels = nextModels;
      if (selectedPreset.presetKey === 'minimax_speech') {
        const gid = (values.minimaxGroupId ?? '').trim();
        patchedModels = nextModels.map((m) =>
          m.presetKey === 'minimax_speech' ? { ...m, minimaxGroupId: gid || undefined } : m,
        );
      }
      if (skipped > 0) {
        message.warning(`已跳过 ${skipped} 个重复模型 ID（与已有实例相同）`);
      }
      const ok = await onCommitModels(
        patchedModels,
        added > 0 ? `已添加 ${added} 个模型实例` : skipped > 0 ? '未新增实例' : '已保存',
      );
      if (ok) {
        presetQuickForm.setFieldsValue({ modelDisplayNames: [] });
        setSelectedPreset(null);
      }
    } catch {
      /* validate */
    }
  };

  const handleSaveCustom = async () => {
    try {
      const values = await addCustomForm.validateFields();
      const isLocal = values.isLocal === true;
      const md = (values.modelDisplayName ?? '').trim();
      const pv = (values.primaryVersion ?? '').trim();
      const next: AIModelConfig = {
        id: customNewId || `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name: values.name,
        provider: values.provider,
        apiUrl: values.apiUrl ?? '',
        apiKey: isLocal ? '' : (values.apiKey ?? ''),
        capabilityKeys: values.capabilityKeys ?? [],
      };
      if (md) next.modelDisplayName = md;
      if (pv) next.primaryVersion = pv;
      if (isLocal) next.isLocal = true;
      const nextModels = [...models, next];
      const ok = await onCommitModels(nextModels, '已添加模型');
      if (ok) onClose();
    } catch {
      /* validate */
    }
  };

  const visiblePresets = presets.filter((p) => !p.hideFromAddModal);

  const presetBody = (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, gap: 0 }}>
      <div
        style={{
          width: '50%',
          flexShrink: 0,
          minHeight: 0,
          overflowY: 'auto',
          borderRight: '1px solid var(--ant-color-split)',
          paddingRight: 12,
        }}
      >
        <ModelCapabilityFilter value={capabilityFilterKeys} onChange={setCapabilityFilterKeys} />
        <div style={{ marginTop: 12 }}>
          <ModelPresetGrid
            presets={visiblePresets}
            filterCapabilityKeys={capabilityFilterKeys}
            models={models}
            selectedPresetKey={selectedPreset?.presetKey ?? null}
            onSelectPreset={handleSelectPreset}
          />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: 'auto', paddingLeft: 16 }}>
        {selectedPreset ? (
          <ModelPresetQuickForm
            preset={selectedPreset}
            mode="add"
            form={presetQuickForm}
            onSave={() => void handleSavePreset()}
            onCancel={() => {
              presetQuickForm.resetFields();
              setSelectedPreset(null);
            }}
          />
        ) : (
          <>
            <Form form={presetQuickForm} style={{ display: 'none' }} />
            <Text type="secondary">在左侧选择一个常见模型后，在此填写密钥等信息并保存。</Text>
          </>
        )}
      </div>
    </div>
  );

  const customBody = (
    <div style={{ height: '100%', minHeight: 0, overflowY: 'auto' }}>
      <ModelCapabilityFilter value={capabilityFilterKeys} onChange={setCapabilityFilterKeys} />
      <CustomModelForm
        form={addCustomForm}
        formTitle="仅支持OpenAI兼容协议的模型"
        showActionButtons={false}
        hideCapabilityField
        onSave={() => void handleSaveCustom()}
        onCancel={() => {
          addCustomForm.setFieldsValue({
            apiUrl: '',
            apiKey: '',
            capabilityKeys: [],
            isLocal: false,
            name: undefined,
            provider: undefined,
            modelDisplayName: undefined,
            primaryVersion: undefined,
            model: undefined,
          });
        }}
      />
      <Button type="primary" style={{ marginTop: 8 }} onClick={() => void handleSaveCustom()}>
        添加并保存
      </Button>
    </div>
  );

  return (
    <AdaptiveModal
      title="添加 AI 模型"
      open={open}
      onCancel={onClose}
      width={960}
      centered
      destroyOnHidden
      containerHeight="90%"
      bodyScrollY
      footer={[
        <Button key="done" type="primary" onClick={onClose}>
          完成
        </Button>,
      ]}
    >
      <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <AdaptiveTabs
          style={{ flex: 1, minHeight: 0 }}
          contentOverflow={false}
          activeKey={tab}
          centered
          onChange={(k) => setTab(k)}
          items={[
            { key: 'preset', label: '添加常见模型', children: presetBody, forceRender: true },
            {
              key: 'custom',
              label: '自定义添加',
              children: customBody,
              forceRender: true,
            },
          ]}
        />
      </div>
    </AdaptiveModal>
  );
}
