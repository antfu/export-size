import path from 'path'
import fs from 'fs-extra'
import gzipSize from 'gzip-size'
import { install } from './install'
import { Bundler } from './esbuild'

export * from './esbuild'
export * from './install'

interface ExportsSizeOptions {
  pkg: string
  external?: string[]
  extraDependencies?: string[]
  output?: boolean
  reporter?: (name: string, progress: number, total: number) => void
  clean?: boolean
}

function stringSize(string: string) {
  return Buffer.byteLength(string, 'utf8')
}

export async function getExportSize({
  dir = 'tmp',
  pkg,
  name,
  external = [],
}) {
  const bundler = new Bundler(pkg, external, dir)
  await bundler.stop()

  const { bundled, minified } = await bundler.bundle(name)

  return {
    rawSize: stringSize(bundled),
    gzipSize: await gzipSize(minified),
  }
}

export async function getExportsSize({
  pkg,
  external = [],
  extraDependencies = [],
  reporter,
  output = true,
  clean = true,
}: ExportsSizeOptions) {
  const dist = path.resolve('export-size-output')
  const dir = path.join(dist, 'temp')

  if (clean && fs.pathExists(dist))
    await fs.remove(dist)
  await fs.ensureDir(dist)
  await fs.ensureDir(dir)

  if (output) {
    await fs.ensureDir(path.join(dist, 'bundled'))
    await fs.ensureDir(path.join(dist, 'minified'))
  }

  const packageInfo = await install(dir, pkg, extraDependencies)

  const {
    exports,
    dependencies,
  } = packageInfo

  const total = Object.keys(exports).length
  let count = 0

  const result: {name: string; size: number }[] = []

  const bundler = new Bundler(pkg, [...external, ...dependencies], dir)
  await bundler.start()

  for (const name of Object.keys(exports)) {
    const { bundled, minified } = await bundler.bundle(name)

    if (output) {
      await fs.writeFile(path.join(dist, 'bundled', `${name}.js`), bundled, 'utf-8')
      await fs.writeFile(path.join(dist, 'minified', `${name}.min.js`), minified, 'utf-8')
    }

    const size = await gzipSize(minified)

    count += 1

    if (reporter)
      reporter(name, count, total)

    result.push({ name, size })
  }

  bundler.stop()

  result.sort((a, b) => b.size - a.size)

  return {
    result,
    packageInfo,
  }
}
