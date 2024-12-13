import { defineManifest, ManifestV3Export } from '@crxjs/vite-plugin';
import BaseManifest from './manifest.base';
const chromeManifest = {
  ...BaseManifest,
  manifest_version: 3,
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
  web_accessible_resources: [],
  minimum_chrome_version: '111',
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
} as ManifestV3Export;

export { chromeManifest };

export default defineManifest(chromeManifest);
