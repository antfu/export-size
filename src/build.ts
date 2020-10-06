import { rollup } from 'rollup'
import path from 'path'
import nodeResolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import gzipSize from 'gzip-size'
import fs from 'fs-extra'
import { parsePackage } from './utils'

export async function build(
  dir: string,
  name: string,
  dist: string,
  external: string[] = []
) {
  const bundle = await rollup({
    input: path.join(dir, name),
    plugins: [nodeResolve()],
    external: external.map((i) => parsePackage(i).name),
  })

  const shaked = await bundle.write({
    file: path.join(dist, name + '.js'),
  })

  const min = await bundle.write({
    file: path.join(dist, name + '.min.js'),
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
}) {
  await fs.writeFile(
    `tmp/${name}.js`,
    `import { ${name} } from '${pkg}'; _(${name})`,
    'utf-8'
  )

  const { min } = await build(dir, name, dist, external)
  return gzipSize.sync(min.output[0].code)
}
