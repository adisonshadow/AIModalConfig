/**
 * 把已配置供应商、添加供应商、输入/输出、能力清单按默认顺序放在一起。
 * 需要按需组合时，直接使用对应组件。
 */
import { Typography } from 'antd';
import { useProviderWorkspace } from './providerWorkspaceContext';
import {
  AiModelAddProvider,
  AiModelCapabilitySetting,
  AiModelIoSetting,
  AiProviderChoosedList,
  AiModelThemeSwitch,
} from './sections';

const { Text } = Typography;

export function AiModelSettingsPanel() {
  const { ready } = useProviderWorkspace();
  if (!ready) return <Text type="secondary">加载中…</Text>;
  return (
    <div>
      <AiModelThemeSwitch />
      <Text strong className="aimc-section-title">
        已配置的供应商
      </Text>
      <AiProviderChoosedList />
      <Text strong className="aimc-section-title">
        添加供应商
      </Text>
      <AiModelAddProvider />
      <Text strong className="aimc-section-title">
        模型输入 / 输出
      </Text>
      <AiModelIoSetting />
      <Text strong className="aimc-section-title">
        模型能力
      </Text>
      <AiModelCapabilitySetting />
    </div>
  );
}
