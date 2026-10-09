import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select, Typography } from 'antd';
import type { CatalogListItem } from '../../types/provider';
import { CATALOG_ICON_OPTIONS, ModelIoTypeIcon } from '../modelIoIcons';

const { Text } = Typography;

export function CatalogListEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: CatalogListItem[];
  onChange: (next: CatalogListItem[]) => void;
}) {
  const keys = items.map((item) => item.key.trim());

  const patch = (index: number, partial: Partial<CatalogListItem>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...partial } : item)));
  };

  return (
    <div>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>
        {title}
      </Text>
      {items.map((item, index) => {
        const key = item.key.trim();
        const duplicated = key !== '' && keys.filter((value) => value === key).length > 1;
        return (
          <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <Select
              allowClear
              placeholder="图标"
              style={{ width: 118 }}
              value={item.icon}
              options={CATALOG_ICON_OPTIONS.map((option) => ({
                value: option.value,
                label: (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <ModelIoTypeIcon typeKey={option.value} />
                    {option.label}
                  </span>
                ),
              }))}
              onChange={(value) => patch(index, { icon: value || undefined })}
            />
            <Input
              placeholder="keyname"
              value={item.key}
              status={duplicated ? 'error' : undefined}
              style={{ width: 140 }}
              onChange={(e) => patch(index, { key: e.target.value })}
            />
            <Input
              placeholder="label"
              value={item.label}
              style={{ flex: 1, minWidth: 0 }}
              onChange={(e) => patch(index, { label: e.target.value })}
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`删除${title} ${item.label || item.key || index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            />
          </div>
        );
      })}
      <Button icon={<PlusOutlined />} onClick={() => onChange([...items, { key: '', label: '' }])}>
        添加
      </Button>
    </div>
  );
}
