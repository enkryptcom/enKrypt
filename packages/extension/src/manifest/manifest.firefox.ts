import { defineManifest } from '@crxjs/vite-plugin';
import BaseManifest from './manifest.base';
const firefoxManifest = {
  ...BaseManifest,
  manifest_version: 3,
  commands: {
    _execute_browser_action: {
      suggested_key: {
        windows: 'Alt+Shift+E',
        mac: 'Alt+Shift+E',
        chromeos: 'Alt+Shift+E',
        linux: 'Alt+Shift+E',
      },
    },
  },
  background: {
    scripts: ['src/scripts/firefox/background.ts'],
    type: 'module',
    persistent: true,
  },
  web_accessible_resources: [],
  browser_specific_settings: {
    gecko: {
      id: '{21a9e8ea-7aa4-4aae-923c-ec8211f2779c}',
      strict_min_version: '112.0',
    },
  },
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
};

export default defineManifest({
  ...(firefoxManifest as any),
});
