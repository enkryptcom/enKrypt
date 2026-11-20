import { CrxPlugin } from '@crxjs/vite-plugin';

function transFormManifest(): CrxPlugin {
  const MATCHING_PROTOCOLS = ['file://*/*', 'http://*/*', 'https://*/*'].filter(
    fname => {
      if (fname === 'file://*/*' && process.env.BROWSER === 'safari')
        return false;
      return true;
    },
  );
  return {
    name: 'crx:enkrypt:transform-manifest',
    enforce: 'post',
    renderCrxManifest(manifest) {
      manifest.content_scripts = [
        {
          matches: MATCHING_PROTOCOLS,
          js: ['scripts/contentscript.js'],
          run_at: 'document_start',
          all_frames: false,
        },
        {
          matches: ['*://connect.trezor.io/*/*'],
          js: ['vendor/trezor-content-script.js'],
          run_at: 'document_start',
        },
      ] as any;
      if (process.env.BROWSER !== 'opera' && process.env.BROWSER !== 'safari') {
        manifest.content_scripts?.push({
          matches: MATCHING_PROTOCOLS,
          js: ['scripts/inject.js'],
          run_at: 'document_start',
          all_frames: false,
          world: 'MAIN',
        } as any);
      }
      if (process.env.BROWSER === 'safari') {
        (manifest as any).browser_specific_settings = {
          safari: {
            strict_min_version: '16.6',
            strict_max_version: '26.*',
          },
        };
      }
      manifest.web_accessible_resources?.push({
        resources: [
          'scripts/inject.js',
          'scripts/contentscript.js',
          'scripts/*.js.map',
        ],
        use_dynamic_url: false,
        matches: MATCHING_PROTOCOLS,
      });
      return manifest;
    },
  };
}
export default transFormManifest;
