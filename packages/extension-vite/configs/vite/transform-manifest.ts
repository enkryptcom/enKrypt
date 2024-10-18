import { Plugin, ResolvedConfig } from 'vite'
import path from 'path'
import fs from 'fs-extra'

function myPlugin(): Plugin {
  let config: ResolvedConfig

  return {
    name: 'my-plugin:build',
    apply: 'build',
    async configResolved(_config) {
      config = _config
    },
    writeBundle() {
      const filePath = path.resolve(
        config.root,
        config.build.outDir,
        'sprite.svg',
      )
      fs.ensureFileSync(filePath)
      fs.writeFileSync(filePath, 'abc')
    },
  }
}
export default myPlugin
