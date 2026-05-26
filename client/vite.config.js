import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 設定: /api へのリクエストをバックエンド（3001番）にプロキシする
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
