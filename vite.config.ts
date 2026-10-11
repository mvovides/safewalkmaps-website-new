/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({ command, mode }) => {
  const playgroundBuild = mode === 'playground';

  // Tailwind's config is loaded by PostCSS inside this same process and reads
  // this flag to decide whether to scan the playground sources. The dev server
  // always serves the playground; `vite build` never includes it unless asked
  // for with `--mode playground`, which also writes to its own directory.
  process.env.PLAYGROUND = command === 'serve' || playgroundBuild ? '1' : '';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': here('./src'),
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      restoreMocks: true,
    },
    build: {
      target: 'es2020',
      cssTarget: 'safari14',
      sourcemap: false,
      outDir: playgroundBuild ? 'dist-playground' : 'dist',
      rollupOptions: {
        input: here(playgroundBuild ? './playground.html' : './index.html'),
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
  };
});
