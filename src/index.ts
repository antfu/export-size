import type { Bundler, SupportBundler } from './bunders'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { brotliCompress, gzip } from 'node:zlib'
import { version } from '../package.json'
import { getBundler } from './bunders'
import { getAllExports } from './exports'
import { installTemporaryPackage, loadPackageJSON } from './install'
import { getPackageVersion, readableSize } from './utils'

export * from './bunders'
export async function brotliSize(input: string) {
  return (await promisify(brotliCompress)(input)).length
}

export async function gzipSize(input: string) {
  return (await promisify(gzip)(input)).length
}

export { version }

export * from './install'
export { readableSize }

export interface ExportsSizeOptions {
  pkg: string
  external?: string[]
  includes?: string[]
  extraDependencies?: string[]
  output?: boolean
  reporter?: (name: string, progress: number, total: number) => void
  clean?: boolean
  bundler?: SupportBundler | Bundler
  exportsNames?: string[]
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

async function findPackageRoot(startDir: string) {
  let dir = startDir
  for (let parent = path.dirname(dir); dir !== parent; parent = path.dirname(dir)) {
    if (await fs.access(path.join(dir, 'package.json')).then(() => true, () => false))
      return dir
    dir = parent
  }
  throw new Error(`Could not find a package.json above ${startDir}`)
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
  exportsNames,
}: ExportsSizeOptions) {
  const dist = path.resolve('export-size-output')
  const isLocal = pkg[0] === '.' || pkg[0] === '/'
  const isLocalFile = isLocal && (await fs.stat(path.resolve(pkg))).isFile()

  if (output) {
    if (clean)
      await fs.rm(dist, { recursive: true, force: true })
    await fs.mkdir(dist, { recursive: true })
  }

  const localEntry = isLocal ? path.resolve(pkg) : undefined
  const dir = isLocalFile ? path.dirname(localEntry!) : (isLocal ? localEntry! : path.join(dist, 'temp'))
  const packageDir = isLocalFile ? await findPackageRoot(dir) : (isLocal ? dir : await installTemporaryPackage(pkg, dir, extraDependencies))

  const {
    name,
    dependencies,
    packageJSON,
  } = await loadPackageJSON(packageDir)

  const exportsPaths = isLocalFile
    ? await getAllExports(dir, `./${path.basename(localEntry!)}`, false)
    : await getAllExports(dir, name, isLocal)

  if (output) {
    await fs.mkdir(path.join(dist, 'bundled'), { recursive: true })
    await fs.mkdir(path.join(dist, 'minified'), { recursive: true })
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
  else if (bunderName === 'rolldown') {
    meta.versions.rolldown = getPackageVersion('rolldown')
  }
  else {
    meta.versions.rollup = getPackageVersion('rollup')
    meta.versions.terser = getPackageVersion('terser')
  }

  const total = Object.keys(exportsPaths).length
  let count = 0
  const exports: ExportsInfo[] = []

  const externals = [...external, ...dependencies].filter(i => !includes.includes(i))
  const bundler = typeof bunderName === 'string'
    ? getBundler(bunderName, dir, externals)
    : bunderName

  if (!bundler)
    throw new Error('Failed to initialize bundler')

  await bundler.start()

  for (const [name, modulePath] of Object.entries(exportsPaths)) {
    if (exportsNames && !exportsNames.includes(name))
      continue

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
