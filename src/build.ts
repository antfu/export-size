import path from 'path'
import { rollup, RollupCache } from 'rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import { minify } from 'terser'
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

  const generated = await bundle.generate({})
  const code = generated.output[0].code
  const minified = (await minify(code, {
    format: {
      comments: false,
    },
  })).code

  if (output) {
    await fs.writeFile(path.join(dist, 'bundled', `${name}.js`), code, 'utf-8')
    await fs.writeFile(path.join(dist, 'min', `${name}.min.js`), minified, 'utf-8')
  }

  return {
    code,
    minified,
  }
}

function stringSize(string: string) {
  return Buffer.byteLength(string, 'utf8')
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
    name === 'default'
      ? `import _default from '${pkg}'; _(_default)`
      : `import { ${name} } from '${pkg}'; _(${name})`,
    'utf-8',
  )

  const { minified } = await build(dir, name, dist, external, output)
  return {
    size: stringSize(minified),
    gzipped: await gzipSize(minified),
  }
}
