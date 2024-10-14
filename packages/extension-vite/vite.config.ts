import { fileURLToPath, URL } from 'node:url'

import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      include: [
        'crypto',
        'buffer',
        'util',
        'stream',
        'url',
        'http',
        'https',
        'path',
      ],
    }),
    vue(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        math: 'always',
        relativeUrls: true,
        javascriptEnabled: true,
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: [],
      input: {
        appSchoool: fileURLToPath(
          new URL('./src/ui/provider-pages/index.html', import.meta.url),
        ),
        appStudent: fileURLToPath(
          new URL('./src/ui/action/index.html', import.meta.url),
        ),
        appAuth: fileURLToPath(
          new URL('./src/ui/onboard/index.html', import.meta.url),
        ),
      },
    },
  },
  optimizeDeps: {
    exclude: ['node:fs/promises'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@action': fileURLToPath(new URL('./src/ui/action', import.meta.url)),
    },
  },
})
