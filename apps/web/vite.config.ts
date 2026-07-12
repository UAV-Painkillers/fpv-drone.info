/// <reference types='vitest' />
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  server: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    }),
    viteReact(),
  ],
});
