import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { theme, Typography } from 'antd';
import {
  AiModelAddProvider,
  AiModelCapabilitySetting,
  AiModelCapabilityPicker,
  AiModelChoosedSelect,
  AiModelConfigProvider,
  AiModelIoSetting,
  AiProviderChoosedList,
  AiModelThemeSwitch,
  defaultCatalog,
  localStorageModelStorage,
} from 'ai-modal-config';
import { initialModels } from './initialModels';
import './index.css';

const { Text } = Typography;

function DemoFrame() {
  const { token } = theme.useToken();
  const [capabilityKeys, setCapabilityKeys] = useState<string[]>([]);
  return (
    <div style={{ minHeight: '100vh', padding: 24, background: token.colorBgLayout, color: token.colorText }}>
      <AiModelThemeSwitch />
      <AiModelCapabilityPicker value={capabilityKeys} onChange={setCapabilityKeys} />
      <Text strong className="aimc-section-title">
        # 已配置的供应商
      </Text>
      <AiProviderChoosedList capabilityKeys={capabilityKeys} />
      <AiModelChoosedSelect style={{ width: '100%' }} capabilityKeys={capabilityKeys} showProvider />
      <Text strong className="aimc-section-title">
        # AI模型供应商
      </Text>
      <AiModelAddProvider />
      <Text strong className="aimc-section-title">
        # 模型输入 / 输出 配置
      </Text>
      <AiModelIoSetting />
      <Text strong className="aimc-section-title">
        # 模型能力配置
      </Text>
      <AiModelCapabilitySetting />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AiModelConfigProvider
      catalog={defaultCatalog}
      initialModels={initialModels}
      storage={localStorageModelStorage}
    >
      <DemoFrame />
    </AiModelConfigProvider>
  </StrictMode>,
);
