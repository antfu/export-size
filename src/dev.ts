import { getExportsSize } from '.'
import filesize from 'filesize'

getExportsSize('@vueuse/core', ['vue@next', '@vue/runtime-dom']).then((r) => {
  console.table(
    r.map((i) => ({ name: i.name, size: filesize(i.size) })),
    ['name', 'size']
  )
})
