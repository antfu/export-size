import path from 'path'
import fs from 'fs-extra'
import gzipSize from 'gzip-size'
import { installTemporaryPackage, loadPackageJSON } from './install'
import { getAllExports } from './exports'
import { getBundler, SupportBundler } from './bunders'

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

  const exports = await getAllExports(dir, name)

  if (output) {
    await fs.ensureDir(dir)
    await fs.ensureDir(path.join(dist, 'bundled'))
    await fs.ensureDir(path.join(dist, 'minified'))
  }

  const total = Object.keys(exports).length
  let count = 0

  const result: { name: string; size: number }[] = []

  const bundler = getBundler(bunderName, dir, [...external, ...dependencies])
  await bundler.start()

  for (const [name, modulePath] of Object.entries(exports)) {
    const { bundled, minified } = await bundler.bundle(name, path.resolve(dir, modulePath))

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
    exports,
    name,
    dependencies,
    packageJSON,
  }
}
