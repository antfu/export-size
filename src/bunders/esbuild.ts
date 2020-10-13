import { Service, startService } from 'esbuild'
import { Bundler } from './base'

function uint8arrayToStringMethod(myUint8Arr: Uint8Array) {
  return String.fromCharCode.apply(null, myUint8Arr)
}

export class ESBuildBundler extends Bundler {
  name = 'esbuild'
  private service: Service

  async start() {
    this.service = await startService()
  }

  async bundle(exportName: string, exportPath: string) {
    const entry = exportName === 'default'
      ? `export { default as _ } from '${exportPath}'`
      : `export { ${exportName} as _ } from '${exportPath}'`
    try {
      const bundledResult = await this.service.build({
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
      })
      const bundled = uint8arrayToStringMethod(bundledResult.outputFiles[0].contents)
        .replace(/\/\*[\s\S]*?\*\/\n?/mg, '') // remove comments

      const minifiedResult = await this.service.transform(bundled, { minify: true, format: 'esm', loader: 'js' })
      const minified = minifiedResult.js
      return {
        bundled,
        minified,
      }
    }
    catch (e) {
      console.log()
      console.log(entry)
      console.error(e)
      return {
        bundled: '',
        minified: '',
      }
    }
  }

  async stop() {
    this.service.stop()
  }
}
