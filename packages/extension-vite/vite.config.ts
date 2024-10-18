import { fileURLToPath, URL } from 'node:url'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'
import viteManifestHackIssue846 from './configs/vite/manifest-hack'
import assetsRewritePlugin from './configs/vite/assets-rewrite'
import transformManifest from './configs/vite/transform-manifest'

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
    viteManifestHackIssue846,
    assetsRewritePlugin,
    crx({
      manifest,
      contentScripts: {
        injectCss: false,
      },
    }),
    transformManifest(),
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
        inject: 'src/scripts/inject.ts',
      },
    },
  },
  optimizeDeps: {
    include: ['vue', '@vueuse/core', 'webextension-polyfill'],
    exclude: ['node:fs/promises'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@action': fileURLToPath(new URL('./src/ui/action', import.meta.url)),
    },
  },
})
