import { fileURLToPath, URL } from 'node:url'
import { dirname, relative } from 'node:path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'
// import webExtenstion from '@enkryptcom/vite-web-extension'
// const tempPlugin = {
//   name: 'worker-env',
//   resolveImportMeta(prop: any, ctx: any) {
//     if (prop !== 'url') return null
//     console.log('resolveImportMeta', ctx)
//     return `chrome.runtime.getURL('${ctx.chunkId}')`
//     // return `new URL('${ctx.chunkId}', '/').href`
//   },
// }
// https://vite.dev/config/
const viteManifestHackIssue846: Plugin & {
  renderCrxManifest: (manifest: any, bundle: any) => void
} = {
  // Workaround from https://github.com/crxjs/chrome-extension-tools/issues/846#issuecomment-1861880919.
  name: 'manifestHackIssue846',
  renderCrxManifest(_manifest, bundle) {
    bundle['manifest.json'] = bundle['.vite/manifest.json']
    bundle['manifest.json'].fileName = 'manifest.json'
    delete bundle['.vite/manifest.json']
  },
}

export default defineConfig({
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
    {
      name: 'assets-rewrite',
      enforce: 'post',
      apply: 'build',
      transformIndexHtml(html, { path }) {
        const assetsPath = relative(dirname(path), '/assets').replace(
          /\\/g,
          '/',
        )
        return html.replace(/"\/assets\//g, `"${assetsPath}/`)
      },
    },
    viteManifestHackIssue846,
    crx({
      manifest,
      contentScripts: {
        injectCss: true,
      },
    }),
    // tempPlugin,
    // webExtenstion({
    //   manifest: 'src/manifest/chrome-manifest-full.json',
    //   additionalInputs: ['index.html', 'onboard.html'],
    // }) as PluginOption,
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
    minify: false,
    rollupOptions: {
      input: {
        action: 'action.html',
        onboard: 'onboard.html',
        index: 'index.html',
      },
      plugins: [],
      external: [],
    },
  },
  optimizeDeps: {
    include: [],
    needsInterop: ['localforage'],
    exclude: ['node:fs/promises'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@action': fileURLToPath(new URL('./src/ui/action', import.meta.url)),
    },
  },
})
