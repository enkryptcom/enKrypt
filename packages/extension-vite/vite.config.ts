import { fileURLToPath, URL } from 'node:url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
// import typescript from '@rollup/plugin-typescript'
import manifest from './manifest.config'
import assetsRewritePlugin from './configs/vite/assets-rewrite'
import transformManifest from './configs/vite/transform-manifest'
import transformCSInject from './configs/vite/transform-cs-inject'

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  define: {
    'process.env.PREFILL_PASSWORD': JSON.stringify('test pass'),
  },
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
    assetsRewritePlugin,
    transformCSInject(),
    transformManifest(),
    crx({
      manifest,
      contentScripts: {
        injectCss: false,
      },
    }),
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
    commonjsOptions: { transformMixedEsModules: true },
    emptyOutDir: true,
    rollupOptions: {
      plugins: [],
      input: {
        action: 'action.html',
        onboard: 'onboard.html',
        index: 'index.html',
      },
    },
  },
  optimizeDeps: {
    include: ['vue', '@vueuse/core', 'webextension-polyfill', 'crypto'],
    exclude: ['node:fs/promises', 'zlib'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@action': fileURLToPath(new URL('./src/ui/action', import.meta.url)),
    },
  },
})
