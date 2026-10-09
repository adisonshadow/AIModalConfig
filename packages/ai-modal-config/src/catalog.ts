import type { ModelPreset } from './presets/modelPresets';
import { MODEL_PRESETS } from './presets/modelPresets';
import type { CapabilityTag } from './types/model';
import { CAPABILITY_TAGS } from './types/model';
import type { ModelIoTypeKey, ModelIoTypeMeta } from './types/io';
import { MODEL_IO_TYPE_CONFIG } from './types/io';

/** 初始化时传入的目录：能力、输入/输出类型、预设（供应商与大模型） */
export interface ModelCatalog {
  capabilityTags: CapabilityTag[];
  ioTypes: Record<ModelIoTypeKey, ModelIoTypeMeta>;
  presets: ModelPreset[];
}

/** 从芝绘复制的默认目录，宿主可整体替换 */
export const defaultCatalog: ModelCatalog = {
  capabilityTags: CAPABILITY_TAGS,
  ioTypes: MODEL_IO_TYPE_CONFIG,
  presets: MODEL_PRESETS,
};
