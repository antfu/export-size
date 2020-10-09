import { Service, startService } from 'esbuild'

function uint8arrayToStringMethod(myUint8Arr: Uint8Array) {
  return String.fromCharCode.apply(null, myUint8Arr)
}

export class Bundler {
  service: Service

  constructor(
    public name: string,
    public external: string[],
    public dir: string,
  ) {
  }

  async start() {
    this.service = await startService()
  }

  async bundle(exportName: string) {
    const entry = exportName === 'default'
      ? `import _ from '${this.name}'; _();`
      : `import { ${exportName} as _ } from '${this.name}'; _();`
    try {
      const bundledResult = await this.service.build({
        bundle: true,
        minify: true,
        format: 'esm',
        write: false,
        pure: [],
        stdin: {
          contents: entry,
          resolveDir: this.dir,
        },
        external: this.external,
      })
      const bundled = uint8arrayToStringMethod(bundledResult.outputFiles[0].contents)
        .replace(/\/\*[\s\S]*?\*\/\n?/mg, '') // remove comments

      const minifiedResult = await this.service.transform(bundled, { minify: true })
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

  stop() {
    this.service.stop()
  }
}
