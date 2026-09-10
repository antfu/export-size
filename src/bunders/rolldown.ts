import { rolldown, VERSION } from 'rolldown'
import { Bundler } from './base'

export class RolldownBundler extends Bundler {
  name = 'rolldown'
  version = VERSION

  async start() {

  }

  async stop() {

  }

  async bundle(exportName: string, exportPath: string) {
    const entry = `export { ${exportName} as _ } from '${exportPath}'`

    const id = 'export-size-virtual'
    const bundle = await rolldown({
      input: id,
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
      ],
      external: this.external,
    })

    const { output: bundledOutput } = await bundle.generate({})
    const bundled = bundledOutput[0].code
    const { output: minifiedOutput } = await bundle.generate({ minify: true })
    const minified = minifiedOutput[0].code

    await bundle.close()

    return {
      bundled,
      minified,
    }
  }
}
