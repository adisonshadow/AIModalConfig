import { vendorIcons } from '../../../public/vendor-icons/manifest.js';

const MARKS: Record<string, { bg: string; fg: string; text: string }> = {
  openai: { bg: '#f5f5f5', fg: '#111', text: 'AI' },
  anthropic: { bg: '#f3f1ea', fg: '#111', text: 'A' },
  openrouter: { bg: '#22c55e', fg: '#052e16', text: 'OR' },
  'opencode-go': { bg: '#e5e5e5', fg: '#111', text: 'OC' },
  ollama: { bg: '#111111', fg: '#ffffff', text: 'Ol' },
};

/** 内置供应商 id 和色标文件名不一致时的对照。 */
const FILE_ALIAS: Record<string, string> = {
  'aliyun-cn': 'bailian.svg',
  'aliyun-intl': 'bailian.svg',
  'xiaomi-mimo': 'xiaomimimo.svg',
  xai: 'grok.svg',
};

const iconsByFile = new Map(vendorIcons.map((item) => [item.file, item]));

function iconFor(builtinId?: string) {
  if (!builtinId) return undefined;
  return iconsByFile.get(FILE_ALIAS[builtinId] ?? `${builtinId}.svg`);
}

export function ProviderLogo({ builtinId }: { builtinId?: string }) {
  const icon = iconFor(builtinId);
  if (icon?.url) {
    return (
      <span className="aimc-logo" style={{ background: icon.background }} aria-hidden>
        {icon.monochrome ? (
          <span className="aimc-logo-svg" style={{ color: '#fff' }} dangerouslySetInnerHTML={{ __html: icon.svg }} />
        ) : (
          <img className="aimc-logo-img" src={icon.url} alt="" />
        )}
      </span>
    );
  }

  const mark = builtinId ? MARKS[builtinId] : undefined;
  if (!mark) {
    return (
      <span className="aimc-logo" style={{ background: 'var(--ant-color-fill-secondary)', color: 'var(--ant-color-text)' }}>
        +
      </span>
    );
  }
  return (
    <span className="aimc-logo" style={{ background: mark.bg, color: mark.fg }} aria-hidden>
      {mark.text}
    </span>
  );
}
