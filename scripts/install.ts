import { execSync } from 'child_process'
import fs from 'fs-extra'
import path from 'path'
import { getAllExports } from './exports'
import { parsePackage } from './utils'

export async function install(
  dir: string,
  pkg: string,
  clean = true,
  extra: string[] = []
) {
  if (clean) {
    await fs.remove(dir)
  }
  await fs.ensureDir(dir)

  function run(cmd: string) {
    execSync(cmd, { cwd: dir, stdio: 'inherit' })
  }

  const { name } = parsePackage(pkg)

  await fs.writeJSON(path.join(dir, 'package.json'), {
    type: 'module',
    private: true,
    dependencies: Object.fromEntries(
      [pkg, ...extra].map((i) => {
        const { name, version } = parsePackage(i)
        return [name, version]
      })
    ),
  })
  run(`npm i`)

  const exports = await getAllExports(dir, name)

  return exports
}
