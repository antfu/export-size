import path from 'path'
import { rollup, RollupCache } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import gzipSize from 'gzip-size'
import fs from 'fs-extra'
import { parsePackage } from './utils'

const cache: RollupCache = {
  modules: [],
}

export async function build(
  dir: string,
  name: string,
  dist: string,
  external: string[] = [],
  output: boolean,
) {
  const bundle = await rollup({
    input: path.join(dir, name),
    cache,
    plugins: [nodeResolve()],
    external: external.map(i => parsePackage(i).name),
  })

  const shaked = await bundle[output ? 'write' : 'generate']({
    file: path.join(dist, 'bundled', `${name}.js`),
  })

  const min = await bundle[output ? 'write' : 'generate']({
    file: path.join(dist, 'min', `${name}.min.js`),
    plugins: [
      terser({
        compress: true,
        format: {
          comments: false,
        },
      }),
    ],
  })

  return {
    shaked,
    min,
  }
}

export async function getExportSize({
  dir = 'tmp',
  dist = 'dist',
  pkg,
  name,
  external = [],
  output = true,
}) {
  await fs.writeFile(
    path.join(dir, `${name}.js`),
    `import { ${name} } from '${pkg}'; _(${name})`,
    'utf-8',
  )

  const { min } = await build(dir, name, dist, external, output)
  return await gzipSize(min.output[0].code)
}
