/**
 * 能力筛选：OR 语义，空选表示不过滤
 */
import { Space, Tag, Typography } from 'antd';
import { useModelCatalog } from '../context';

const { Text } = Typography;

export interface ModelCapabilityFilterProps {
  value: string[];
  onChange: (keys: string[]) => void;
}

export function ModelCapabilityFilter({ value, onChange }: ModelCapabilityFilterProps) {
  const { capabilityTags } = useModelCatalog();
  const selected = new Set(value);

  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(Array.from(next));
  };

  return (
    <div style={{ marginBottom: 16, marginTop: 16 }}>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>
        能力筛选
      </Text>
      <Space size={[4, 8]} wrap>
        {capabilityTags.map((t) => (
          <Tag
            key={t.key}
            style={{ cursor: 'pointer', margin: 0 }}
            color={selected.has(t.key) ? 'blue' : 'default'}
            onClick={() => toggle(t.key)}
          >
            {t.label}
          </Tag>
        ))}
      </Space>
    </div>
  );
}
