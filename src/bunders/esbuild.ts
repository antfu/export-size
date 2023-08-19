import { build, transform } from 'esbuild'
import { Bundler } from './base'

export class ESBuildBundler extends Bundler {
  name = 'esbuild'
  async start() {
  }

  async bundle(exportName: string, exportPath: string) {
    const entry = `export { ${exportName} as _ } from '${exportPath}'`
    try {
      const bundledResult = await build({
        bundle: true,
        minify: false,
        format: 'esm',
        platform: 'node',
        write: false,
        stdin: {
          contents: entry,
          resolveDir: this.dir,
          loader: 'js',
        },
        mainFields: ['module', 'browser', 'main'],
        external: this.external,
        legalComments: 'none',
        logLevel: 'silent',
      })
      const bundled = bundledResult.outputFiles[0].text
      const minifiedResult = await transform(bundled, { minify: true, format: 'esm', loader: 'js' })
      const minified = minifiedResult.code
      return {
        bundled,
        minified,
      }
    }
    catch (e) {
      console.error()
      console.error(entry)
      console.error(e)
      return {
        bundled: '',
        minified: '',
      }
    }
  }

  async stop() {
  }
}
