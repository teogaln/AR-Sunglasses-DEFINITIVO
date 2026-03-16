import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/AR-Sunglasses-DEFINITIVO/', // GitHub Pages repo name
  define: {
    // Inject process.env safely
    'process.env': JSON.stringify(process.env)
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true
  }
});