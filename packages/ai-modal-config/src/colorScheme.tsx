import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { App, ConfigProvider, theme } from 'antd';

export type ColorScheme = 'auto' | 'dark' | 'light';

const STORAGE_KEY = 'ai-modal-config:color-scheme';

interface ColorSchemeContextValue {
  colorScheme: ColorScheme;
  /** 当前实际生效的是深色（含自动跟随系统） */
  dark: boolean;
  locked: boolean;
  setColorScheme: (next: ColorScheme) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

function isColorScheme(value: string | null): value is ColorScheme {
  return value === 'auto' || value === 'dark' || value === 'light';
}

function readStored(): ColorScheme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (isColorScheme(value)) return value;
  } catch {
    /* 隐私模式等无法读本地存储时用自动 */
  }
  return 'auto';
}

function usePrefersDark() {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => setDark(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return dark;
}

export function useColorScheme(): ColorSchemeContextValue {
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    throw new Error('useColorScheme 需要放在 AiModelConfigProvider 内');
  }
  return ctx;
}

/** 包一层 ConfigProvider。传入 theme 时写死，不再读用户选择。 */
export function ColorSchemeRoot({ theme: fixed, children }: { theme?: ColorScheme; children: ReactNode }) {
  const locked = fixed != null;
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => fixed ?? readStored());
  const prefersDark = usePrefersDark();

  useEffect(() => {
    if (fixed) setColorSchemeState(fixed);
  }, [fixed]);

  const setColorScheme = useCallback(
    (next: ColorScheme) => {
      if (locked) return;
      setColorSchemeState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* 忽略写入失败 */
      }
    },
    [locked],
  );

  const dark = colorScheme === 'dark' || (colorScheme === 'auto' && prefersDark);
  const algorithm = dark ? theme.darkAlgorithm : theme.defaultAlgorithm;

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.colorScheme;
    root.style.colorScheme = dark ? 'dark' : 'light';
    return () => {
      root.style.colorScheme = previous;
    };
  }, [dark]);

  const value = useMemo(
    () => ({ colorScheme, dark, locked, setColorScheme }),
    [colorScheme, dark, locked, setColorScheme],
  );

  return (
    <ColorSchemeContext.Provider value={value}>
      <ConfigProvider theme={{ algorithm }}>
        <App>{children}</App>
      </ConfigProvider>
    </ColorSchemeContext.Provider>
  );
}
