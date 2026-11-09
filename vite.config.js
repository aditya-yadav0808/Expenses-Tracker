import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dbPlugin from './server/dbPlugin.js';

export default defineConfig({
  plugins: [react(), dbPlugin()],
  build: { rollupOptions: { output: { manualChunks: { charts: ['recharts'], vendor: ['react', 'react-dom', 'react-router-dom'] } } } },
});
