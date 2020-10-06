import path from 'path'
import fs from 'fs-extra'
import { getExportSize } from './build'
import { install } from './install'

export * from './build'
export * from './install'

interface ExportsSizeOptions {
  pkg: string
  external?: string[]
  extraDependencies?: string[]
  output?: boolean
  reporter?: (name: string, progress: number, total: number) => void
  clean?: boolean
}

export async function getExportsSize({
  pkg,
  external = [],
  extraDependencies = [],
  reporter,
  output = true,
  clean = true,
}: ExportsSizeOptions) {
  const dist = 'export-size-output'
  const dir = path.resolve(dist, 'temp')

  if (clean && fs.pathExists(dist))
    await fs.remove(dist)
  await fs.ensureDir(dist)
  await fs.ensureDir(dir)

  const {
    exports,
    dependencies,
  } = await install(dir, pkg, extraDependencies)

  const total = Object.keys(exports).length
  let count = 0

  const result = []

  for (const name of Object.keys(exports)) {
    const size = await getExportSize({
      dir,
      dist: 'export-size-output',
      pkg,
      name,
      external: [...external, ...dependencies],
      output,
    })

    count += 1

    if (reporter)
      reporter(name, count, total)

    result.push({ name, size })
  }

  result.sort((a, b) => b.size - a.size)

  return result
}
