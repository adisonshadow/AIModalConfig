# AI 模型配置

可按需组合的 AI 模型与供应商配置界面。组件放在 `AiModelConfigProvider` 里，共用同一份供应商、模型、输入输出和能力数据。

依赖 React 19、antd 6、`@ant-design/icons` 6。

![Demo](https://github.com/adisonshadow/AIModalConfig/blob/main/demo.png?raw=true)

## 本地运行

```bash
pnpm install
pnpm dev
```

示例在 `http://127.0.0.1:5175/`。测试：

```bash
pnpm test
```

## 使用

业务侧自己写标题，组件只负责内容。下面是示例页的组合方式。

```tsx
import { useState } from 'react';
import {
  AiModelAddProvider,
  AiModelCapabilityPicker,
  AiModelCapabilitySetting,
  AiModelChoosedSelect,
  AiModelConfigProvider,
  AiModelIoSetting,
  AiModelThemeSwitch,
  AiProviderChoosedList,
  defaultCatalog,
  localStorageModelStorage,
} from 'ai-modal-config';

function Page() {
  const [capabilityKeys, setCapabilityKeys] = useState<string[]>([]);
  return (
    <AiModelConfigProvider
      catalog={defaultCatalog}
      initialModels={[]}
      storage={localStorageModelStorage}
    >
      <AiModelThemeSwitch />
      <AiModelCapabilityPicker value={capabilityKeys} onChange={setCapabilityKeys} />
      <AiProviderChoosedList capabilityKeys={capabilityKeys} />
      <AiModelChoosedSelect capabilityKeys={capabilityKeys} showProvider style={{ width: '100%' }} />
      <AiModelAddProvider />
      <AiModelIoSetting />
      <AiModelCapabilitySetting />
    </AiModelConfigProvider>
  );
}
```

`capabilityKeys` 为空时不过滤。有选中项时按 OR 过滤：模型具备其中任一能力即保留。

## 组件

| 组件 | 作用 |
|---|---|
| `AiModelConfigProvider` | 提供目录、模型存档和主题。子组件必须放在里面 |
| `AiModelThemeSwitch` | 自动 / 深色 / 浅色。`theme` 写死后不渲染 |
| `AiModelCapabilityPicker` | 能力多选开关 |
| `AiProviderChoosedList` | 已配置供应商。可按 `capabilityKeys` 过滤 |
| `AiModelChoosedSelect` | 已添加供应商里已启用模型的下拉框 |
| `AiModelAddProvider` | 添加内置或自定义供应商 |
| `AiModelIoCatalog` | 模型输入 / 输出清单 |
| `AiModelIoSetting` | 设置页中的输入 / 输出清单 |
| `AiModelCapabilityCatalog` | 模型能力清单 |
| `AiModelCapabilitySetting` | 设置页中的能力清单 |
| `AiModelSettingsPanel` | 把上面几块按默认顺序放在一起 |

`AiModelConfigProvider`：

- `catalog`：能力、输入输出、预设模型。可用 `defaultCatalog`。
- `initialModels`：本地还没有模型存档时的种子数据。
- `storage`：模型读写。可用 `localStorageModelStorage`。
- `theme`：`'auto' | 'dark' | 'light'`。传入后主题固定，不再读取用户上次的选择。

`AiModelChoosedSelect`：

- `capabilityKeys`：与列表相同的能力过滤。
- `showProvider`：是否在选项里显示供应商名，默认 `true`。显示时为「供应商 / 模型」。
- `value` / `onChange`：受控选中项，值为模型 id。不传 `value` 时组件自己记住选择。
- `style`：传给内部 Select。

## 本地存储

| 键 | 内容 |
|---|---|
| `ai-modal-config:models` | 投影出的模型列表 |
| `ai-modal-config:provider-workspace` | 供应商、输入输出和能力清单 |
| `ai-modal-config:color-scheme` | 主题：`auto`、`dark`、`light` |
