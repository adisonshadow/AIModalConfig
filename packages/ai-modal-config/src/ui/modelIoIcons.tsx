import type { ComponentType, CSSProperties } from 'react';
import {
  AppstoreOutlined,
  AudioOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FontSizeOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';

const IO_ICON: Record<string, ComponentType<{ style?: CSSProperties }>> = {
  text: FontSizeOutlined,
  image: FileImageOutlined,
  video: VideoCameraOutlined,
  audio: CustomerServiceOutlined,
  voice: AudioOutlined,
  generic: AppstoreOutlined,
};

const iconStyle = {
  fontSize: 14,
  color: 'var(--ant-color-text-tertiary, rgba(255,255,255,0.45))',
};

export function ModelIoSectionIcon({ section }: { section: 'input' | 'output' }) {
  const Icon = section === 'input' ? UploadOutlined : DownloadOutlined;
  return <Icon style={iconStyle} aria-hidden />;
}

export function ModelIoTypeIcon({ typeKey }: { typeKey: string }) {
  const Icon = IO_ICON[typeKey] ?? AppstoreOutlined;
  return <Icon style={iconStyle} aria-hidden />;
}
