import path from 'path'
import fs from 'fs-extra'
import gzipSize from 'gzip-size'
import { version } from '../package.json'
import { installTemporaryPackage, loadPackageJSON } from './install'
import { getAllExports } from './exports'
import { getBundler, SupportBundler } from './bunders'
import { getPackageVersion } from './utils'

export { default as readableSize } from 'filesize'
export { default as gzipSize } from 'gzip-size'

export { version }

export * from './bunders/esbuild'
export * from './install'

interface ExportsSizeOptions {
  pkg: string
  external?: string[]
  extraDependencies?: string[]
  output?: boolean
  reporter?: (name: string, progress: number, total: number) => void
  clean?: boolean
  bundler?: SupportBundler
}

interface MetaInfo {
  name: string
  dependencies: string[]
  versions: Record<string, string>
}

interface ExportsInfo {
  name: string
  path: string
  bundled: number
  minzipped: number
}

export async function getExportsSize({
  pkg,
  external = [],
  extraDependencies = [],
  reporter,
  output = true,
  clean = true,
  bundler: bunderName,
}: ExportsSizeOptions) {
  const dist = path.resolve('export-size-output')
  const isLocal = pkg.startsWith('.')

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

  const bundler = getBundler(bunderName, dir, [...external, ...dependencies])

  await bundler.start()

  for (const [name, modulePath] of Object.entries(exportsPaths)) {
    const { bundled, minified } = await bundler.bundle(name, path.resolve(dir, modulePath))

    if (output) {
      await fs.writeFile(path.join(dist, 'bundled', `${name}.js`), bundled, 'utf-8')
      await fs.writeFile(path.join(dist, 'minified', `${name}.min.js`), minified, 'utf-8')
    }

    const bundledSize = bundled.length
    const minzippedSize = await gzipSize(minified)

    count += 1

    if (reporter)
      reporter(name, count, total)

    exports.push({
      name,
      path: modulePath,
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
