const urls = import.meta.glob('./*.svg', { eager: true, query: '?url', import: 'default' });
const raws = import.meta.glob('./*.svg', { eager: true, query: '?raw', import: 'default' });

/** 品牌图标清单。background 取自各色标在深色卡片上能看清的底色。 */
const entries = [
  { file: 'bailian.svg', background: '#ffffff' },
  { file: 'bytedance.svg', background: '#ffffff' },
  { file: 'deepseek.svg', background: '#ffffff' },
  { file: 'doubao.svg', background: '#ffffff' },
  { file: 'gemini.svg', background: '#ffffff' },
  { file: 'grok.svg', background: '#000000' },
  { file: 'happyhorse.svg', background: '#000000' },
  { file: 'jimeng.svg', background: '#000000' },
  { file: 'kimi.svg', background: '#000000' },
  { file: 'kling.svg', background: '#000000' },
  { file: 'minimax.svg', background: '#ffffff' },
  { file: 'nanobanana.svg', background: '#ffffff' },
  { file: 'qwen.svg', background: '#ffffff' },
  { file: 'volcengine.svg', background: '#ffffff' },
  { file: 'xiaomimimo.svg', background: '#000000' },
  { file: 'openai.svg', background: '#000000' },
  { file: 'comfyui.svg', background: '#000000' },
];

function asset(file) {
  const key = Object.keys(urls).find((item) => item.endsWith(`/${file}`));
  return { url: key ? urls[key] : '', raw: key ? raws[key] : '' };
}

export const vendorIcons = entries.map((item) => {
  const { url, raw } = asset(item.file);
  return {
    file: item.file,
    background: item.background,
    url,
    monochrome: String(raw).includes('currentColor'),
    svg: String(raw).includes('currentColor') ? String(raw) : '',
  };
});
