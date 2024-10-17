import type { ManifestV3Export } from '@crxjs/vite-plugin'
import packageJson from './package.json'

const { version } = packageJson
// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/)

export default {
  name: 'Enkrypt',
  description: 'Enkrypt: best wallet',
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  manifest_version: 3,
  // key: '',
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
  content_scripts: [
    {
      all_frames: true,
      js: ['src/scripts/contentscript.ts'],
      matches: ['*://*/*'],
      run_at: 'document_end',
    },
  ],
  permissions: [
    'storage',
    'unlimitedStorage',
    'tabs',
    'clipboardRead',
    'clipboardWrite',
  ],
  web_accessible_resources: [
    {
      matches: ['*://*/*'],
      resources: ['src/scripts/contentscript.ts'],
    },
  ],
  icons: {
    16: 'assets/img/icons/icon16.png',
    32: 'assets/img/icons/icon32.png',
    64: 'assets/img/icons/icon64.png',
    192: 'assets/img/icons/icon192.png',
  },
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
} as ManifestV3Export
