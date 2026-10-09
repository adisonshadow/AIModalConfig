import { MoreOutlined } from '@ant-design/icons';
import { Popover, Tag } from 'antd';
import type { CatalogListItem } from '../../types/provider';
import { ModelIoTypeIcon } from '../modelIoIcons';

const VISIBLE_COUNT = 3;

export function CapabilityPreview({
  keys,
  capabilities,
  className,
}: {
  keys: string[];
  capabilities: CatalogListItem[];
  className?: string;
}) {
  const items = keys
    .map((key) => {
      const found = capabilities.find((item) => item.key === key);
      const label = found?.label?.trim();
      return { key, label: label || key, icon: found?.icon };
    })
    .filter((item) => item.label);
  if (items.length === 0) return null;

  const visible = items.slice(0, VISIBLE_COUNT);
  const hiddenCount = items.length - visible.length;

  return (
    <span className={className ?? 'aimc-capability-preview'}>
      {visible.map((item) => (
        <CapabilityTag key={item.key} label={item.label} icon={item.icon} />
      ))}
      {hiddenCount > 0 ? (
        <Popover
          trigger={['hover', 'click']}
          title="全部能力"
          content={
            <div className="aimc-capability-preview" style={{ maxWidth: 320 }}>
              {items.map((item) => (
                <CapabilityTag key={item.key} label={item.label} icon={item.icon} />
              ))}
            </div>
          }
        >
          <Tag
            style={{ margin: 0, cursor: 'pointer' }}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
          >
            +{hiddenCount} <MoreOutlined />
          </Tag>
        </Popover>
      ) : null}
    </span>
  );
}

function CapabilityTag({ label, icon }: { label: string; icon?: string }) {
  return (
    <Tag style={{ margin: 0 }}>
      {icon ? (
        <ModelIoTypeIcon typeKey={icon} style={{ fontSize: 12, color: 'currentColor', marginInlineEnd: 4 }} />
      ) : null}
      {label}
    </Tag>
  );
}
