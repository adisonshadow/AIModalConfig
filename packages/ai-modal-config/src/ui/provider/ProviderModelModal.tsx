import { useEffect } from 'react';
import { LockOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Checkbox, Collapse, Form, Input, InputNumber, Modal, Select, Space, Tooltip } from 'antd';
import { useColorScheme } from '../../colorScheme';
import type { CatalogListItem, ProviderModelConfig } from '../../types/provider';

export interface ModelFormValues {
  modelId: string;
  contextWindow?: number | null;
  maxOutputTokens?: number | null;
  inputKeys: string[];
  capabilityKeys: string[];
  reasoningLevels: string[];
  reasoningParamMap?: string;
}

function tip(text: string) {
  return (
    <Tooltip title={text}>
      <QuestionCircleOutlined style={{ color: 'var(--ant-color-text-tertiary)' }} />
    </Tooltip>
  );
}

function toFormValues(model: ProviderModelConfig | null, hasText: boolean): ModelFormValues {
  if (!model) {
    return {
      modelId: '',
      inputKeys: hasText ? ['text'] : [],
      capabilityKeys: [],
      reasoningLevels: [],
    };
  }
  return {
    modelId: model.modelId,
    contextWindow: model.contextWindow,
    maxOutputTokens: model.maxOutputTokens,
    inputKeys: model.inputKeys,
    capabilityKeys: model.capabilityKeys,
    reasoningLevels: model.reasoningLevels,
    reasoningParamMap: model.reasoningParamMap,
  };
}

export function ProviderModelModal({
  open,
  model,
  inputTypes,
  capabilities,
  onCancel,
  onSave,
}: {
  open: boolean;
  model: ProviderModelConfig | null;
  inputTypes: CatalogListItem[];
  capabilities: CatalogListItem[];
  onCancel: () => void;
  onSave: (model: ProviderModelConfig) => void;
}) {
  const [form] = Form.useForm<ModelFormValues>();
  const { dark } = useColorScheme();
  const nativeScheme = dark ? 'dark' : 'light';
  const hasText = inputTypes.some((item) => item.key === 'text');
  const visibleInputs = inputTypes.filter((item) => item.key.trim() && item.label.trim());
  const visibleCaps = capabilities.filter((item) => item.key.trim() && item.label.trim());

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue(toFormValues(model, hasText));
  }, [open, model, form, hasText]);

  const reset = () => {
    form.setFieldsValue(toFormValues(model, hasText));
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      const inputKeys = values.inputKeys ?? [];
      const withText = hasText ? Array.from(new Set(['text', ...inputKeys])) : inputKeys;
      onSave({
        id: model?.id ?? `pm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        modelId: values.modelId.trim(),
        enabled: model?.enabled ?? true,
        contextWindow: values.contextWindow ?? undefined,
        maxOutputTokens: values.maxOutputTokens ?? undefined,
        inputKeys: withText,
        capabilityKeys: values.capabilityKeys ?? [],
        reasoningLevels: (values.reasoningLevels ?? []).map((item) => item.trim()).filter(Boolean),
        reasoningParamMap: values.reasoningParamMap?.trim() || undefined,
        smartConfig: model?.smartConfig ?? false,
      });
    } catch {
      /* validate */
    }
  };

  return (
    <Modal
      title={model ? '编辑模型' : '添加模型'}
      open={open}
      centered
      width={560}
      destroyOnHidden
      onCancel={onCancel}
      styles={{
        container: { colorScheme: nativeScheme },
        body: { maxHeight: '70vh', overflowY: 'auto', colorScheme: nativeScheme },
      }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button type="link" style={{ paddingInline: 0 }} onClick={reset}>
            重置表单
          </Button>
          <Space>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={() => void save()}>
              保存
            </Button>
          </Space>
        </div>
      }
    >
      <Form className="aimc-model-form" form={form} layout="vertical" requiredMark={false}>
        <Form.Item name="modelId" label="模型 ID" rules={[{ required: true, whitespace: true, message: '请输入模型 ID' }]}>
          <Input placeholder="模型 ID" allowClear />
        </Form.Item>
        <Form.Item
          name="contextWindow"
          label={<span>上下文窗口 {tip('模型可接收的最大上下文长度，单位 token。')}</span>}
        >
          <InputNumber min={1} controls={false} style={{ width: '100%' }} placeholder="" />
        </Form.Item>
        <Form.Item
          name="maxOutputTokens"
          label={<span>最大输出 Token {tip('单次回复允许生成的最大 token 数。')}</span>}
        >
          <InputNumber min={1} controls={false} style={{ width: '100%' }} placeholder="" />
        </Form.Item>
        <Collapse
          ghost
          defaultActiveKey={['advanced']}
          items={[
            {
              key: 'advanced',
              label: '高级配置',
              children: (
                <>
                  <Form.Item
                    label={<span>输入类型 {tip('文本默认开启且不可取消。选项来自「模型输入」清单。')}</span>}
                  >
                    <Form.Item name="inputKeys" noStyle>
                      <InputTypeChecks items={visibleInputs} lockText={hasText} />
                    </Form.Item>
                  </Form.Item>
                  <Form.Item label={<span>模型能力 {tip('选项来自「模型能力」清单，可多选。')}</span>}>
                    <Form.Item name="capabilityKeys" noStyle>
                      <CapabilityChecks items={visibleCaps} />
                    </Form.Item>
                  </Form.Item>
                  <Form.Item label={<span>推理等级（从低到高） {tip('按从低到高的顺序保存档位名称。')}</span>}>
                    <Form.List name="reasoningLevels">
                      {(fields, { add, remove }) => (
                        <Space orientation="vertical" style={{ width: '100%' }} size={8}>
                          {fields.map((field) => (
                            <Space key={field.key} style={{ width: '100%' }}>
                              <Form.Item {...field} noStyle>
                                <Input placeholder="等级名称" style={{ width: 240 }} />
                              </Form.Item>
                              <Button type="text" onClick={() => remove(field.name)}>
                                删除
                              </Button>
                            </Space>
                          ))}
                          <Button icon={<PlusOutlined />} onClick={() => add('')} />
                        </Space>
                      )}
                    </Form.List>
                  </Form.Item>
                  <Form.Item
                    name="reasoningParamMap"
                    label={<span>推理参数映射 {tip('请求里用来传递推理等级的参数名。')}</span>}
                  >
                    <Select
                      allowClear
                      placeholder=""
                      options={[
                        { value: 'reasoning_effort', label: 'reasoning_effort' },
                        { value: 'thinking', label: 'thinking' },
                        { value: 'enable_thinking', label: 'enable_thinking' },
                      ]}
                    />
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
}

function InputTypeChecks({
  value = [],
  onChange,
  items,
  lockText,
}: {
  value?: string[];
  onChange?: (keys: string[]) => void;
  items: CatalogListItem[];
  lockText: boolean;
}) {
  const selected = new Set(value);
  const toggle = (key: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(key);
    else next.delete(key);
    if (lockText) next.add('text');
    onChange?.(Array.from(next));
  };

  if (items.length === 0) return <span style={{ color: 'var(--ant-color-text-secondary)' }}>请先在「模型输入」中添加类型</span>;

  return (
    <Space size={[8, 8]} wrap>
      {items.map((item) => {
        const locked = lockText && item.key === 'text';
        return (
          <Checkbox
            key={item.key}
            checked={locked || selected.has(item.key)}
            disabled={locked}
            onChange={(e) => toggle(item.key, e.target.checked)}
          >
            <Space size={4}>
              {item.label}
              {locked ? <LockOutlined style={{ fontSize: 12, color: 'var(--ant-color-text-quaternary)' }} /> : null}
            </Space>
          </Checkbox>
        );
      })}
    </Space>
  );
}

function CapabilityChecks({
  value = [],
  onChange,
  items,
}: {
  value?: string[];
  onChange?: (keys: string[]) => void;
  items: CatalogListItem[];
}) {
  if (items.length === 0) return <span style={{ color: 'var(--ant-color-text-secondary)' }}>请先在「模型能力」中添加能力</span>;
  const selected = new Set(value);
  return (
    <Space size={[8, 8]} wrap>
      {items.map((item) => (
        <Checkbox
          key={item.key}
          checked={selected.has(item.key)}
          onChange={(e) => {
            const next = new Set(selected);
            if (e.target.checked) next.add(item.key);
            else next.delete(item.key);
            onChange?.(Array.from(next));
          }}
        >
          {item.label}
        </Checkbox>
      ))}
    </Space>
  );
}
