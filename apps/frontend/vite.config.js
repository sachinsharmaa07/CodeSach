import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': import.meta.dirname + '/src' } },
  server: {
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:5001', changeOrigin: true } },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@monaco-editor')) return 'monaco';
          if (id.includes('recharts')) return 'charts';
          if (
            id.includes('react-dom') ||
            id.includes('react-router-dom') ||
            id.includes('@tanstack/react-query') ||
            id.includes('zustand')
          )
            return 'vendor';
        },
      },
    },
  },
});
