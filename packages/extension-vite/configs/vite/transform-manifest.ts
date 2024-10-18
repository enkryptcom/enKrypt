import { CrxPlugin } from '@crxjs/vite-plugin'

function transFormManifest(): CrxPlugin {
  return {
    name: 'crx:enkrypt:transform-manifest',
    enforce: 'post',
    renderCrxManifest(manifest) {
      manifest.content_scripts = [
        {
          matches: ['file://*/*', 'http://*/*', 'https://*/*'],
          js: ['scripts/inject.js'],
          run_at: 'document_start',
          all_frames: false,
          world: 'MAIN',
        },
        {
          matches: ['file://*/*', 'http://*/*', 'https://*/*'],
          js: ['scripts/contentscript.js'],
          run_at: 'document_start',
          all_frames: false,
        },
        {
          matches: ['*://connect.trezor.io/*/*'],
          js: ['vendor/trezor-content-script.js'],
          run_at: 'document_start',
        },
      ] as any
      return manifest
    },
  }
}
export default transFormManifest
