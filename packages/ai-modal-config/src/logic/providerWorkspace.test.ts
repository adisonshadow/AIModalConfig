import { describe, expect, it } from 'vitest';
import type { AIModelConfig } from '../types/model';
import {
  buildProviderTestRequest,
  formatContextWindow,
  mergeProjectedModels,
  projectProviderModels,
  promoteDefaultAgentCapability,
  providerTestBlockedReason,
  providersFromLegacyModels,
} from './providerWorkspace';
import type { ProviderConfig } from '../types/provider';

function provider(partial: Partial<ProviderConfig> = {}): ProviderConfig {
  return {
    id: 'pv1',
    name: 'Xiaomi MiMo',
    baseUrl: 'https://api.xiaomimimo.com/anthropic',
    apiFormat: 'anthropic_messages',
    apiKey: 'sk-test',
    enabled: true,
    models: [
      {
        id: 'pm1',
        modelId: 'mimo-v2.5',
        enabled: true,
        contextWindow: 1_000_000,
        inputKeys: ['text', 'image'],
        capabilityKeys: ['agent_orchestration'],
        reasoningLevels: [],
        smartConfig: true,
      },
    ],
    ...partial,
  };
}

describe('provider workspace', () => {
  it('把百万上下文格式化成 1M', () => {
    expect(formatContextWindow(1_000_000)).toBe('1M');
    expect(formatContextWindow(128000)).toBe('128K');
    expect(formatContextWindow(undefined)).toBeNull();
  });

  it('供应商关闭时给出不可用文案', () => {
    const text = providerTestBlockedReason(provider({ enabled: false }), provider().models[0]!);
    expect(text).toBe('Xiaomi MiMo / mimo-v2.5 连接失败：该供应商当前不可用，无法测试连接');
  });

  it('供应商可用且密钥齐全时不拦截测试', () => {
    expect(providerTestBlockedReason(provider(), provider().models[0]!)).toBeNull();
  });

  it('按 API 格式拼测试地址', () => {
    const anthropic = buildProviderTestRequest(provider(), 'mimo-v2.5');
    expect(anthropic.url).toBe('https://api.xiaomimimo.com/anthropic/v1/messages');
    const openai = buildProviderTestRequest(
      provider({ baseUrl: 'https://api.deepseek.com/v1', apiFormat: 'openai_chat' }),
      'deepseek-v4-flash',
    );
    expect(openai.url).toBe('https://api.deepseek.com/v1/chat/completions');
    const ark = buildProviderTestRequest(
      provider({ baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', apiFormat: 'openai_chat' }),
      'doubao-seed-2-1-pro-260915',
    );
    expect(ark.url).toBe('https://ark.cn-beijing.volces.com/api/v3/chat/completions');
  });

  it('停用的供应商不会投影进模型列表，并替换同 id 的旧记录', () => {
    const existing: AIModelConfig[] = [
      {
        id: 'pm1',
        apiUrl: 'old',
        apiKey: '',
        capabilityKeys: [],
      },
      {
        id: 'keep',
        apiUrl: 'http://local',
        apiKey: '',
        capabilityKeys: ['novel'],
      },
    ];
    const off = provider({ enabled: false });
    expect(projectProviderModels([off])).toEqual([]);
    const merged = mergeProjectedModels(existing, [provider()]);
    expect(merged.map((item) => item.id)).toEqual(['pm1', 'keep']);
    expect(merged[0]?.providerConfigId).toBe('pv1');
    expect(merged[0]?.apiUrl).toBe('https://api.xiaomimimo.com/anthropic');
  });

  it('只把尚未调整的默认能力清单里的通用Agent提到第一项', () => {
    const legacy = [
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
      { key: 'agent_orchestration', label: '通用Agent' },
      { key: 'transparent_image', label: '透明通道图片' },
    ];
    const next = promoteDefaultAgentCapability(legacy);
    expect(next[0]).toEqual({ key: 'agent_orchestration', label: '通用Agent', icon: 'gemini' });
    expect(next[1]?.key).toBe('draw');
    expect(next.at(-1)?.key).toBe('transparent_image');
    expect(promoteDefaultAgentCapability(next)).toBe(next);
  });

  it('把旧模型按供应商收成一组', () => {
    const models: AIModelConfig[] = [
      {
        id: 'a',
        provider: 'DeepSeek',
        apiUrl: 'https://api.deepseek.com/v1',
        apiKey: 'sk',
        modelDisplayName: 'deepseek-v4-flash',
        capabilityKeys: ['novel'],
      },
    ];
    const grouped = providersFromLegacyModels(models);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]?.name).toBe('DeepSeek');
    expect(grouped[0]?.builtinId).toBe('deepseek');
    expect(grouped[0]?.models[0]?.modelId).toBe('deepseek-v4-flash');
  });
});
