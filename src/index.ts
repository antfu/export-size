import path from 'node:path'
import { brotliCompress, gzip } from 'node:zlib'
import { promisify } from 'node:util'
import fs from 'fs-extra'
import { version } from '../package.json'
import { installTemporaryPackage, loadPackageJSON } from './install'
import { getAllExports } from './exports'
import type { SupportBundler } from './bunders'
import { getBundler } from './bunders'
import { getPackageVersion } from './utils'

export { filesize as readableSize } from 'filesize'
export async function brotliSize(input: string) {
  return (await promisify(brotliCompress)(input)).length
}

export async function gzipSize(input: string) {
  return (await promisify(gzip)(input)).length
}

export { version }

export * from './bunders/esbuild'
export * from './install'

export interface ExportsSizeOptions {
  pkg: string
  external?: string[]
  includes?: string[]
  extraDependencies?: string[]
  output?: boolean
  reporter?: (name: string, progress: number, total: number) => void
  clean?: boolean
  bundler?: SupportBundler
}

export interface MetaInfo {
  name: string
  dependencies: string[]
  versions: Record<string, string>
}

export interface ExportsInfo {
  name: string
  path: string
  bundled: number
  minified: number
  minzipped: number
}

export async function getExportsSize({
  pkg,
  external = [],
  includes = [],
  extraDependencies = [],
  reporter,
  output = true,
  clean = true,
  bundler: bunderName,
}: ExportsSizeOptions) {
  const dist = path.resolve('export-size-output')
  const isLocal = pkg[0] === '.' || pkg[0] === '/'

  if (output) {
    if (clean && fs.pathExists(dist))
      await fs.remove(dist)
    await fs.ensureDir(dist)
  }

  const dir = isLocal ? path.resolve(pkg) : path.join(dist, 'temp')
  const packageDir = isLocal ? dir : await installTemporaryPackage(pkg, dir, extraDependencies)

  const {
    name,
    dependencies,
    packageJSON,
  } = await loadPackageJSON(packageDir)

  const exportsPaths = await getAllExports(dir, name, isLocal)

  if (output) {
    await fs.ensureDir(path.join(dist, 'bundled'))
    await fs.ensureDir(path.join(dist, 'minified'))
  }

  const meta: MetaInfo = {
    name,
    dependencies,
    versions: {},
  }

  meta.versions['export-size'] = version

  if (bunderName === 'esbuild') {
    meta.versions.esbuild = getPackageVersion('esbuild')
  }
  else {
    meta.versions.rollup = getPackageVersion('rollup')
    meta.versions.terser = getPackageVersion('terser')
  }

  const total = Object.keys(exportsPaths).length
  let count = 0
  const exports: ExportsInfo[] = []

  const externals = [...external, ...dependencies].filter(i => !includes.includes(i))
  const bundler = getBundler(bunderName, dir, externals)

  await bundler.start()

  for (const [name, modulePath] of Object.entries(exportsPaths)) {
    const { bundled, minified } = await bundler.bundle(name, path.resolve(dir, modulePath).replace(/\\/g, '/'))

    if (output) {
      await fs.writeFile(path.join(dist, 'bundled', `${name}.js`), bundled, 'utf-8')
      await fs.writeFile(path.join(dist, 'minified', `${name}.min.js`), minified, 'utf-8')
    }

    const bundledSize = bundled.length
    const minifiedSize = minified.length
    const minzippedSize = await brotliSize(minified)

    count += 1

    if (reporter)
      reporter(name, count, total)

    exports.push({
      name,
      path: modulePath,
      minified: minifiedSize,
      minzipped: minzippedSize,
      bundled: bundledSize,
    })
  }

  bundler.stop()

  exports.sort((a, b) => b.minzipped - a.minzipped)

  return {
    meta,
    exports,
    packageJSON,
  }
}
