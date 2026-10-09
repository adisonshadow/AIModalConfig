import { RightOutlined } from '@ant-design/icons';
import { BUILTIN_PROVIDERS } from '../../providers/builtinProviders';
import { ProviderLogo } from './ProviderLogo';

export function ProviderPicker({ onCreateCustom, onPickBuiltin }: {
  onCreateCustom: () => void;
  onPickBuiltin: (builtinId: string) => void;
}) {
  return (
    <div className="aimc-provider-grid">
      <button type="button" className="aimc-provider-card" onClick={onCreateCustom}>
        <ProviderLogo />
        <span className="aimc-provider-card-name">创建自定义供应商</span>
        <RightOutlined style={{ color: 'var(--ant-color-text-tertiary)' }} />
      </button>
      {BUILTIN_PROVIDERS.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className="aimc-provider-card"
          onClick={() => onPickBuiltin(provider.id)}
        >
          <ProviderLogo builtinId={provider.id} />
          <span className="aimc-provider-card-name">{provider.name}</span>
          <RightOutlined style={{ color: 'var(--ant-color-text-tertiary)' }} />
        </button>
      ))}
    </div>
  );
}
