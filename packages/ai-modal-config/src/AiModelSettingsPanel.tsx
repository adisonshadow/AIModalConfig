/**
 * 已添加模型列表 + 添加弹窗 + 编辑弹窗
 */
import { useState } from 'react';
import { App, Button, Form, Modal, Typography } from 'antd';
import type { AIModelConfig } from './types/model';
import type { ModelPreset } from './presets/modelPresets';
import { splitLegacyModelId, resolveRequestModelId } from './logic/aiModelRequestId';
import { syncPresetModelsFromTags } from './logic/presetModelInstances';
import { useAiModelConfig } from './context';
import { CustomModelList } from './ui/CustomModelList';
import { CustomModelForm, type CustomModelFormValues } from './ui/CustomModelForm';
import { AddAiModelModal } from './ui/AddAiModelModal';
import { ModelPresetQuickForm, type ModelPresetQuickFormValues } from './ui/ModelPresetQuickForm';

const { Text } = Typography;

/** 待 React 将对应 <Form> 挂到 DOM 后再写实例，避免 useForm 未连接告警 */
function runAfterFormPaint(cb: () => void) {
  setTimeout(cb, 0);
}

export function AiModelSettingsPanel() {
  const { message } = App.useApp();
  const { models, ready, catalog, commitModels } = useAiModelConfig();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPreset, setEditingPreset] = useState<ModelPreset | null>(null);
  const [form] = Form.useForm<CustomModelFormValues>();
  const [presetEditForm] = Form.useForm<ModelPresetQuickFormValues>();

  const closeEditModal = () => {
    form.resetFields();
    presetEditForm.resetFields();
    setEditModalOpen(false);
    setEditingId(null);
    setEditingPreset(null);
  };

  const handleEdit = (m: AIModelConfig) => {
    setEditingId(m.id);
    if (m.presetKey) {
      const preset = catalog.presets.find((p) => p.presetKey === m.presetKey);
      if (preset) {
        setEditingPreset(preset);
        setEditModalOpen(true);
        runAfterFormPaint(() => {
          const siblings = models.filter((x) => x.presetKey === preset.presetKey);
          const tagList = siblings
            .map((x) => resolveRequestModelId(x))
            .filter((rid): rid is string => Boolean(rid?.trim()));
          presetEditForm.setFieldsValue({
            name: siblings[0]?.name ?? m.name ?? preset.displayName,
            modelDisplayNames: tagList,
            apiKey: m.apiKey ?? '',
            minimaxGroupId: m.minimaxGroupId ?? siblings[0]?.minimaxGroupId ?? '',
          });
        });
        return;
      }
    }
    setEditingPreset(null);
    setEditModalOpen(true);
    runAfterFormPaint(() => {
      let modelDisplayName = m.modelDisplayName?.trim() ?? '';
      let primaryVersion = m.primaryVersion?.trim() ?? '';
      if (!modelDisplayName && !primaryVersion && m.model) {
        const s = splitLegacyModelId(m.model);
        modelDisplayName = s.modelDisplayName;
        primaryVersion = s.primaryVersion;
      }
      form.setFieldsValue({
        name: m.name,
        provider: m.provider,
        apiUrl: m.apiUrl,
        apiKey: m.apiKey,
        modelDisplayName,
        primaryVersion,
        isLocal: m.isLocal === true,
        capabilityKeys: m.capabilityKeys,
      });
    });
  };

  const handleDelete = async (id: string) => {
    const next = models.filter((x) => x.id !== id);
    if (editingId === id) closeEditModal();
    await commitModels(next, '已删除');
  };

  const handleSaveEditPreset = async () => {
    if (editingId == null || !editingPreset) return;
    try {
      const values = await presetEditForm.validateFields();
      const tagsRaw = values.modelDisplayNames ?? [];
      const sharedName = (values.name ?? '').trim() || editingPreset.displayName;
      const apiKey = editingPreset.isLocal ? '' : (values.apiKey ?? '').trim();

      const { nextModels, added, removed } = syncPresetModelsFromTags({
        preset: editingPreset,
        allModels: models,
        tags: tagsRaw,
        apiKey,
        sharedName,
        mode: 'reconcile',
      });

      let patchedModels = nextModels;
      if (editingPreset.presetKey === 'minimax_speech') {
        const gid = (values.minimaxGroupId ?? '').trim();
        patchedModels = nextModels.map((m) =>
          m.presetKey === 'minimax_speech' ? { ...m, minimaxGroupId: gid || undefined } : m,
        );
      }

      const ok = await commitModels(patchedModels);
      if (ok) {
        const parts: string[] = [];
        if (added) parts.push(`新增 ${added} 条`);
        if (removed) parts.push(`删除 ${removed} 条`);
        if (parts.length) message.success(`已保存（${parts.join('，')}）`);
        closeEditModal();
      }
    } catch {
      /* validate */
    }
  };

  const handleSaveEditModel = async () => {
    if (editingId == null) return;
    try {
      const values = await form.validateFields();
      const existing = models.find((m) => m.id === editingId);
      const isLocal = values.isLocal === true;
      const md = (values.modelDisplayName ?? '').trim();
      const pv = (values.primaryVersion ?? '').trim();
      const next: AIModelConfig = {
        id: editingId,
        name: values.name,
        provider: values.provider,
        apiUrl: values.apiUrl ?? '',
        apiKey: isLocal ? '' : (values.apiKey ?? ''),
        capabilityKeys: values.capabilityKeys ?? [],
      };
      if (md) next.modelDisplayName = md;
      if (pv) next.primaryVersion = pv;
      if (!md && !pv && existing?.model) next.model = existing.model;
      if (existing?.presetKey) next.presetKey = existing.presetKey;
      if (existing?.vendorKey) next.vendorKey = existing.vendorKey;
      if (isLocal) next.isLocal = true;
      const nextModels = models.map((m) => (m.id === editingId ? next : m));
      const ok = await commitModels(nextModels);
      if (ok) closeEditModal();
    } catch {
      /* validate */
    }
  };

  if (!ready) {
    return <Text type="secondary">加载中…</Text>;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text strong>已添加模型</Text>
        <Button type="primary" onClick={() => setAddModalOpen(true)}>
          添加AI模型
        </Button>
      </div>
      <CustomModelList
        models={models}
        filterCapabilityKeys={[]}
        hideTitle
        showAddButton={false}
        showLocalDeployTip={false}
        onAdd={() => setAddModalOpen(true)}
        onEdit={handleEdit}
        onDelete={(id) => void handleDelete(id)}
      />
      <AddAiModelModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        models={models}
        onCommitModels={commitModels}
      />
      <Modal
        title={editingPreset ? `编辑：${editingPreset.displayName}` : '编辑 AI 模型'}
        centered
        open={editModalOpen}
        onCancel={closeEditModal}
        footer={null}
        width={620}
        destroyOnHidden
      >
        {editingPreset ? (
          <ModelPresetQuickForm
            preset={editingPreset}
            mode="edit"
            form={presetEditForm}
            onSave={() => void handleSaveEditPreset()}
            onCancel={closeEditModal}
          />
        ) : (
          <CustomModelForm
            form={form}
            formTitle="编辑模型"
            onSave={() => void handleSaveEditModel()}
            onCancel={closeEditModal}
          />
        )}
      </Modal>
    </>
  );
}
