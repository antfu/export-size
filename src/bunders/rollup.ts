import { rollup, RollupCache, VERSION } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import { minify } from 'terser'
import { parsePackage } from '../utils'
import { Bundler } from './base'

export class RollupBundler extends Bundler {
  name = 'rollup'
  version = VERSION
  cache: RollupCache = {
    modules: [],
  }

  async start() {

  }

  async stop() {

  }

  async bundle(exportName: string, exportPath: string) {
    const entry = exportName === 'default'
      ? `export { default as _ } from '${exportPath}'`
      : `export { ${exportName} as _ } from '${exportPath}'`

    const id = 'export-size-virtual'
    const bundle = await rollup({
      input: id,
      cache: this.cache,
      plugins: [
        {
          name: 'export-size-plugin',
          resolveId(_id) {
            if (_id === id)
              return id
            return null
          },
          load(_id) {
            if (_id === id)
              return entry
          },
        },
        nodeResolve(),
      ],
      external: this.external.map(i => parsePackage(i).name),
    })

    const generated = await bundle.generate({})
    const bundled = generated.output[0].code
    const { code: minified } = await minify(bundled, {
      format: {
        comments: false,
      },
    })

    return {
      bundled,
      minified,
    }
  }
}
