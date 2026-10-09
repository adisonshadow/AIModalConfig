/**
 * 推荐变体与输入/输出分类。
 * 图标由 UI 按 key 映射到 @ant-design/icons，数据里只保留逻辑键与中文名。
 */

export type ModelIoTypeMeta = { label: string };

/**
 * 各逻辑类型的展示配置。预设 io 数组里写这些对象的键（如 text、image）。
 */
export const MODEL_IO_TYPE_CONFIG = {
  text: { label: '文字' },
  image: { label: '图片' },
  video: { label: '视频' },
  audio: { label: '音频' },
  voice: { label: '声音' },
  generic: { label: '其他' },
} as const;

export type ModelIoTypeKey = keyof typeof MODEL_IO_TYPE_CONFIG;

/** 与 ModelIoTypeKey 相同，供 preset 声明 io 时与 I/O 类型命名一致 */
export type ModelIOTypeKey = ModelIoTypeKey;

const IO_CFG = MODEL_IO_TYPE_CONFIG as Record<string, ModelIoTypeMeta>;

export function getModelIoTypeLabel(key: string | undefined): string {
  if (!key) return '';
  return IO_CFG[key]?.label ?? key;
}

/**
 * 输入/输出为逻辑键数组，如
 * { "input": ["text", "image"], "output": ["text"] }
 */
export interface ModelIoInfo {
  input: string[];
  output: string[];
}

export interface RecommendedModalEntry {
  name: string;
  description?: string;
  vendorName?: string;
  displayName: string;
  /**
   * 易变主版本，与 name 以「-」拼接为完整 model id；空字符串表示无独立主版本段（如部分 TTS）
   */
  primaryVersion?: string;
  /** 与 settings 中 capability 的 key 一致；有则保存模型时优先采用 */
  abilityTags?: string[];
  /** 若配置则覆盖家族默认 baseUrl，写入该条模型的 apiUrl（如专用 HTTP 路径，非 OpenAI 兼容 /v1/chat） */
  baseUrl?: string;
  /** 输入/输出为逻辑键数组，与 MODEL_IO_TYPE_CONFIG 对应 */
  io?: ModelIoInfo;
  /** 是否是 WWS 模型 （ RealTime WebSocket） */
  isWWS?: boolean;
}
