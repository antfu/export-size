import path from 'path'
import { getExportSize } from './build'
import { install } from './install'

export * from './build'
export * from './install'

interface ExportsSizeOptions {
  pkg: string
  external?: string[]
  output?: boolean
  reporter?: (name: string, progress: number, total: number) => void
}

export async function getExportsSize({
  pkg,
  external = [],
  reporter,
  output = true,
}: ExportsSizeOptions) {
  const dir = path.resolve(__dirname, '..', 'tmp')

  const exprots = await install(dir, pkg, true, external)

  const total = Object.keys(exprots).length
  let count = 0

  const result = []

  for (const name of Object.keys(exprots)) {
    const size = await getExportSize({
      dir,
      dist: 'export-size-output',
      pkg,
      name,
      external,
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
