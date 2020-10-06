import { install } from './install'
import { getExportSize } from './build'
import path from 'path'
import filesize from 'filesize'


async function getExportsSize(pkg: string, external: string[] = []) {
  const dir = path.resolve(__dirname, '..', 'tmp')

  const exprots = await install(dir, pkg, true, external)

  const result = await Promise.all(
    Object.keys(exprots).map(async (name) => {
      const size = await getExportSize({
        dir,
        dist: 'dist',
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

getExportsSize('@vueuse/core', ['vue@next', '@vue/runtime-dom']).then((r) => {
  console.table(
    r.map((i) => ({ name: i.name, size: filesize(i.size) })),
    ['name', 'size']
  )
})
