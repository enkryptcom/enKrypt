import type { ManifestV3Export } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const { version } = packageJson

export default {
  homepage_url: 'https://www.enkrypt.com',
  version,
  name: 'Enkrypt: ETH, BTC and Solana Wallet',
  short_name: 'Enkrypt',
  description: 'Everything in the blockchain made easy',
  manifest_version: 3,
  permissions: [
    'storage',
    'unlimitedStorage',
    'tabs',
    'clipboardRead',
    'clipboardWrite',
  ],
  commands: {
    _execute_action: {
      suggested_key: {
        windows: 'Alt+Shift+E',
        mac: 'Alt+Shift+E',
        chromeos: 'Alt+Shift+E',
        linux: 'Alt+Shift+E',
      },
    },
  },
  content_scripts: [
    // {
    //   matches: ['file://*/*', 'http://*/*', 'https://*/*'],
    //   js: ['src/scripts/inject.ts'],
    //   run_at: 'document_start',
    //   all_frames: false,
    //   world: 'MAIN',
    // },
    // {
    //   matches: ['file://*/*', 'http://*/*', 'https://*/*'],
    //   js: ['src/scripts/contentscript.ts'],
    //   run_at: 'document_start',
    //   all_frames: false,
    // },
    // {
    //   matches: ['*://connect.trezor.io/*/*'],
    //   js: ['public/vendor/trezor-content-script.js'],
    //   run_at: 'document_start',
    // },
  ],
  icons: {
    16: 'assets/img/icons/icon16.png',
    32: 'assets/img/icons/icon32.png',
    64: 'assets/img/icons/icon64.png',
    192: 'assets/img/icons/icon192.png',
  },
  action: {
    default_icon: {
      '16': 'assets/img/icons/icon16.png',
      '32': 'assets/img/icons/icon32.png',
      '64': 'assets/img/icons/icon64.png',
      '192': 'assets/img/icons/icon192.png',
    },
    default_title: 'Enkrypt',
    default_popup: 'action.html',
  },
  background: {
    service_worker: 'src/scripts/chrome/background.ts',
    type: 'module',
  },
  web_accessible_resources: [],
  minimum_chrome_version: '111',
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
} as ManifestV3Export
