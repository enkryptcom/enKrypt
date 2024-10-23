import { defineManifest, ManifestV3Export } from '@crxjs/vite-plugin';
import { chromeManifest } from './manifest.chrome';
const operaManifest = {
  ...chromeManifest,
  host_permissions: ['file://*/*', 'http://*/*', 'https://*/*'],
  permissions: [
    'storage',
    'unlimitedStorage',
    'tabs',
    'clipboardRead',
    'clipboardWrite',
    'scripting',
  ],
} as ManifestV3Export;

export default defineManifest(operaManifest);
