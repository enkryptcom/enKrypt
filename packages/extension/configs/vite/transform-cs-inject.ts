import { ResolvedConfig } from 'vite'
import { resolve, dirname, basename } from 'node:path'
import injectConfigs from '../rollup.config.inject'
import contentScriptConfigs from '../rollup.config.contentscript'
import { OutputOptions, PluginContext, rollup, RollupBuild } from 'rollup'
import { CrxPlugin, allFilesReady } from '@crxjs/vite-plugin'

function transformCSInject(): CrxPlugin {
  let config: Partial<ResolvedConfig> = {}
  const outputCache: Record<string, RollupBuild> = {}
  const extraIncludes = {
    inject: {
      path: resolve(__dirname, '../../src/scripts/inject.ts'),
      rollupConfigs: injectConfigs,
      fileName: 'scripts/inject.js',
    },
    contentscript: {
      path: resolve(__dirname, '../../src/scripts/contentscript.ts'),
      rollupConfigs: contentScriptConfigs,
      fileName: 'scripts/contentscript.js',
    },
  }
  const rebuild = async (
    file: string,
    rollupCtx?: PluginContext,
  ): Promise<boolean> => {
    if (file === extraIncludes.inject.path) {
      const build = await rollup(extraIncludes.inject.rollupConfigs)
      outputCache[extraIncludes.inject.fileName] = build
      if (rollupCtx && config.command === 'build') {
        const bundle = await build.generate(
          extraIncludes.inject.rollupConfigs.output as OutputOptions,
        )
        rollupCtx.emitFile({
          type: 'asset',
          fileName: extraIncludes.inject.fileName,
          source: bundle.output[0].code,
        })
      }
      return true
    } else if (file === extraIncludes.contentscript.path) {
      const build = await rollup(extraIncludes.contentscript.rollupConfigs)
      outputCache[extraIncludes.contentscript.fileName] = build
      if (rollupCtx && config.command === 'build') {
        const bundle = await build.generate(
          extraIncludes.contentscript.rollupConfigs.output as OutputOptions,
        )
        rollupCtx.emitFile({
          type: 'asset',
          fileName: extraIncludes.contentscript.fileName,
          source: bundle.output[0].code,
        })
      }
      return true
    }
    return false
  }
  return {
    name: 'crx:enkrypt:transform-contentscript-inject',
    configResolved(_config) {
      config = _config
      allFilesReady().then(() => {
        console.log('Enkrypt: ready!')
      })
    },
    async renderCrxManifest(manifest, bundle) {
      if (config.command === 'serve') {
        const injectBuild = await outputCache[
          extraIncludes.inject.fileName
        ].generate(extraIncludes.inject.rollupConfigs.output as OutputOptions)
        injectBuild.output.forEach(chunk => {
          const fileName = `${(extraIncludes.inject.rollupConfigs.output as OutputOptions).dir}/${chunk.fileName}`
          chunk.fileName = fileName
          bundle[fileName] = chunk as any
        })
        const csBuild = await outputCache[
          extraIncludes.contentscript.fileName
        ].generate(
          extraIncludes.contentscript.rollupConfigs.output as OutputOptions,
        )
        csBuild.output.forEach(chunk => {
          const fileName = `${(extraIncludes.contentscript.rollupConfigs.output as OutputOptions).dir}/${chunk.fileName}`
          chunk.fileName = fileName
          bundle[fileName] = chunk as any
        })
      }
      return manifest
    },
    async buildStart() {
      await rebuild(extraIncludes.inject.path, this)
      await rebuild(extraIncludes.contentscript.path, this)
    },
    async handleHotUpdate({ file, server }) {
      console.log(`Enkrypt: Hot reload: `, basename(file))
      const result = await rebuild(file)
      if (result) {
        if (file === extraIncludes.inject.path) {
          await outputCache[extraIncludes.inject.fileName].write(
            Object.assign(
              extraIncludes.inject.rollupConfigs.output as OutputOptions,
              {
                dir: dirname(`dist/${extraIncludes.inject.fileName}`),
              },
            ),
          )
        } else if (file === extraIncludes.contentscript.path) {
          await outputCache[extraIncludes.contentscript.fileName].write(
            Object.assign(
              extraIncludes.contentscript.rollupConfigs.output as OutputOptions,
              {
                dir: dirname(`dist/${extraIncludes.contentscript.fileName}`),
              },
            ),
          )
        }
        server.ws.send({ type: 'custom', event: 'crx:runtime-reload' })
        console.log(`Enkrypt: Hot reload complete!`)
      }
    },
  }
}
export default transformCSInject
