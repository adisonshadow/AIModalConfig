import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'antd', '@ant-design/icons'],
  },
  optimizeDeps: {
    exclude: ['ai-modal-config'],
  },
  server: {
    port: 5175,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
  },
});
