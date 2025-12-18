import { defineManifest, ManifestV3Export } from '@crxjs/vite-plugin';
import { chromeManifest } from './manifest.chrome';
const safariManifest = {
  ...chromeManifest,
  action: {
    default_icon: {
      '16': 'assets/img/safari-icons/icon16.png',
      '19': 'assets/img/safari-icons/icon19.png',
      '32': 'assets/img/safari-icons/icon32.png',
      '38': 'assets/img/safari-icons/icon38.png',
      '48': 'assets/img/safari-icons/icon48.png',
      '64': 'assets/img/safari-icons/icon64.png',
      '72': 'assets/img/safari-icons/icon72.png',
      '192': 'assets/img/safari-icons/icon192.png',
    },
    default_title: 'Enkrypt',
    default_popup: 'action.html',
  },
  host_permissions: ['http://*/*', 'https://*/*'],
  content_security_policy: {
    extension_pages:
      "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; object-src 'self'",
  },
  permissions: [
    'storage',
    'unlimitedStorage',
    'tabs',
    'clipboardRead',
    'clipboardWrite',
    'scripting',
  ],
} as ManifestV3Export;

export default defineManifest(safariManifest);
