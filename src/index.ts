import { getExportSize } from './build'
import { install } from './install'
import path from 'path'

export * from './build'
export * from './install'

export async function getExportsSize(pkg: string, external: string[] = []) {
  const dir = path.resolve(__dirname, '..', 'tmp')

  const exprots = await install(dir, pkg, true, external)

  const result = await Promise.all(
    Object.keys(exprots).map(async (name) => {
      const size = await getExportSize({
        dir,
        dist: 'export-size-output',
        pkg,
        name,
        external,
      })

      return { name, size }
    })
  )

  result.sort((a, b) => b.size - a.size)

  return result
}
