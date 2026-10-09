/**
 * AI 模型配置类型
 * 能力 tag 化：不同模型有不同擅长方向，一个模型可拥有多种能力
 */

export interface CapabilityTag {
  key: string;
  label: string;
  /** 可空。对应 modelIoIcons 里的逻辑键 */
  icon?: string;
}

/** 预设能力 tag（key | label） */
export const CAPABILITY_TAGS: CapabilityTag[] = [
  { key: 'agent_orchestration', label: '通用Agent', icon: 'gemini' },
  { key: 'draw', label: '绘图' },
  { key: 'matting', label: '抠图' },
  { key: 'sprite', label: '生成精灵图' },
  { key: 'novel', label: '小说创作' },
  { key: 'voice_over', label: '配音' },
  { key: 'voice_design', label: '音色设计' },
  { key: 'voice_enrollment', label: '音色复制' },
  { key: 'music', label: '生成音乐' },
  { key: 'sound_effect', label: '生成声音特效' },
  { key: 'coding', label: '编程' },
  { key: 'video', label: '生成视频' },
  { key: 'image_edit', label: '图像编辑' },
  { key: 'remove_watermark', label: '去水印' },
  { key: 'image_outpaint', label: '扩图' },
  { key: 'image_clarity', label: '图像变清晰' },
  { key: 'transparent_image', label: '透明通道图片' },
];

export interface AIModelConfig {
  id: string;
  name?: string;
  provider?: string;
  apiUrl: string;
  apiKey: string;
  /** 已保存的完整 model（兼容旧版）；有 modelDisplayName 时以 resolveRequestModelId 为准 */
  model?: string;
  /**
   * 服务商控制台上的模型名称/显示名（如 Doubao-Seed3D-2.0 或 API 用 slug），
   * 与 primaryVersion 在请求时组合，避免随版本全量重填一整串 ID
   */
  modelDisplayName?: string;
  /** 易变主版本，如 260328；可单独编辑，请求时与 modelDisplayName 用「-」拼接 */
  primaryVersion?: string;
  /** 能力 tag 的 key 列表，一个模型可拥有多种能力 */
  capabilityKeys: string[];
  /** 常见模型预设 key，自定义模型无此字段 */
  presetKey?: string;
  /**
   * 同一厂商可复用 API Key（如 aliyun_dashscope）；来自常见模型预设，自定义模型通常无
   * @see findReusableApiKeyForPreset
   */
  vendorKey?: string;
  /** 本地部署：可无密钥，请求不带 Authorization */
  isLocal?: boolean;
  /** MiniMax 音色复刻/上传所需 GroupId（控制台「账户信息」） */
  minimaxGroupId?: string;
  /** 由供应商配置投影出来的模型，对应 ProviderConfig.id */
  providerConfigId?: string;
}
