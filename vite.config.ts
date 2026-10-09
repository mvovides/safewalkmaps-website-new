import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    cssTarget: 'safari14',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('gsap')) return 'vendor-gsap';
          if (id.includes('react-router') || id.includes('@remix-run')) return 'vendor-router';
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('lucide-react')) return 'vendor-icons';
          return undefined;
        },
      },
    },
  },
});
