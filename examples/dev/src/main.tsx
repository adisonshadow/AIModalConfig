import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import {
  AiModelConfigProvider,
  AiModelSettingsPanel,
  defaultCatalog,
  localStorageModelStorage,
} from 'ai-modal-config';
import { initialModels } from './initialModels';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <AntApp>
        <AiModelConfigProvider
          catalog={defaultCatalog}
          initialModels={initialModels}
          storage={localStorageModelStorage}
        >
          <div style={{ minHeight: '100vh', padding: 24 }}>
            <AiModelSettingsPanel />
          </div>
        </AiModelConfigProvider>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
