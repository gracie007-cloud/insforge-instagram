import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://4g87vjv6.us-east.insforge.app',
        changeOrigin: true,
        secure: true
      }
    }
  }
});