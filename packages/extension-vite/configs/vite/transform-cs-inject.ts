import { Plugin } from 'vite'
import { resolve } from 'node:path'
import injectConfigs from '../rollup.config.inject'
import contentScriptConfigs from '../rollup.config.contentscript'
import { OutputOptions, rollup } from 'rollup'

const crxRuntimeReload = {
  type: 'custom',
  event: 'crx:runtime-reload',
}
function transformCSInject(): Plugin {
  const extraIncludes = {
    inject: {
      path: resolve(__dirname, '../../src/scripts/inject.ts'),
      rollupConfigs: injectConfigs,
    },
    contentscript: {
      path: resolve(__dirname, '../../src/scripts/contentscript.ts'),
      rollupConfigs: contentScriptConfigs,
    },
  }
  const rebuild = async (file: string): Promise<boolean> => {
    if (file === extraIncludes.inject.path) {
      const build = await rollup(extraIncludes.inject.rollupConfigs)
      await build.write(
        extraIncludes.inject.rollupConfigs.output as OutputOptions,
      )
      return true
    } else if (file === extraIncludes.contentscript.path) {
      const build = await rollup(extraIncludes.contentscript.rollupConfigs)
      await build.write(
        extraIncludes.contentscript.rollupConfigs.output as OutputOptions,
      )
      return true
    }
    return false
  }
  return {
    name: 'crx:enkrypt:transform-contentscript-inject',
    async buildStart() {
      await rebuild(extraIncludes.inject.path)
      await rebuild(extraIncludes.contentscript.path)
    },
    async handleHotUpdate({ file, server }) {
      const result = await rebuild(file)
      if (result) {
        server.ws.send(crxRuntimeReload as any)
      }
    },
  }
}
export default transformCSInject
