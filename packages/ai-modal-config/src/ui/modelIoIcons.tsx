import type { ComponentType, CSSProperties } from 'react';
import {
  AppstoreOutlined,
  AudioOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FontSizeOutlined,
  GeminiFilled,
  UploadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

const IO_ICON: Record<string, ComponentType<{ style?: CSSProperties }>> = {
  text: FontSizeOutlined,
  image: FileImageOutlined,
  video: VideoCameraOutlined,
  audio: CustomerServiceOutlined,
  voice: AudioOutlined,
  pdf: FilePdfOutlined,
  generic: AppstoreOutlined,
  gemini: GeminiFilled,
};

/** 清单里可选的图标。值为逻辑键，界面只存这个键。 */
export const CATALOG_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: 'text', label: '文字' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'voice', label: '声音' },
  { value: 'pdf', label: 'PDF' },
  { value: 'generic', label: '其他' },
  { value: 'gemini', label: 'Gemini' },
];

const iconStyle = {
  fontSize: 14,
  color: 'var(--ant-color-text-tertiary, rgba(255,255,255,0.45))',
};

export function ModelIoSectionIcon({ section }: { section: 'input' | 'output' }) {
  const Icon = section === 'input' ? UploadOutlined : DownloadOutlined;
  return <Icon style={iconStyle} aria-hidden />;
}

export function ModelIoTypeIcon({ typeKey, style }: { typeKey: string; style?: CSSProperties }) {
  const Icon = IO_ICON[typeKey] ?? AppstoreOutlined;
  return <Icon style={{ ...iconStyle, ...style }} aria-hidden />;
}
