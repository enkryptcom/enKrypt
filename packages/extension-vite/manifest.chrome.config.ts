import { defineManifest } from '@crxjs/vite-plugin'
import ManifestConfig from './manifest.config'

export default defineManifest(() => ({
  ...ManifestConfig,
  manifest_version: 3,
  name: 'Enkrypt',
  version: '0.1.0',
}))
