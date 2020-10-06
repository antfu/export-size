import path from 'path'
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
}

export async function getExportsSize({
  pkg,
  external = [],
  extraDependencies = [],
  reporter,
  output = true,
}: ExportsSizeOptions) {
  const dist = 'export-size-output'
  const dir = path.resolve(dist, 'temp')

  const {
    exports,
    dependencies,
  } = await install(dir, pkg, true, extraDependencies)

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
