import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { getAllExports } from './exports'
import { parsePackage } from './utils'

export async function install(
  dir: string,
  pkg: string,
  extra: string[] = [],
) {
  function run(cmd: string) {
    execSync(cmd, { cwd: dir })
  }

  const { name } = parsePackage(pkg)

  await fs.writeJSON(path.join(dir, 'package.json'), {
    type: 'module',
    private: true,
    dependencies: Object.fromEntries(
      [pkg, ...extra].map((i) => {
        const { name, version } = parsePackage(i)
        return [name, version]
      }),
    ),
  })
  run('npm i -s')

  const packageJsonPath = require.resolve(`${name}/package.json`, { paths: [dir] })
  const packageDir = path.dirname(packageJsonPath)

  const packageJSON = await fs.readJSON(packageJsonPath)

  const dependencies = Array.from(
    new Set([
      ...Object.keys(packageJSON.dependencies || {}),
      ...Object.keys(packageJSON.peerDependencies || {}),
      ...Object.keys(packageJSON.devDependencies || {}),
    ]),
  )

  const exports = await getAllExports(dir, name)

  return {
    exports,
    dependencies,
    packageJSON,
    packageDir,
  }
}
