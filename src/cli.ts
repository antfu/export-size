import { getExportsSize } from '.'
import filesize from 'filesize'

getExportsSize(process.argv[1]).then((r) => {
  console.table(
    r.map((i) => ({ name: i.name, size: filesize(i.size) })),
    ['name', 'size']
  )
})
