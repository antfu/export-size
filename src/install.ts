import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs-extra'
import { parsePackage } from './utils'

export async function loadPackageJSON(packageDir: string) {
  const packageJSON = await fs.readJSON(path.join(packageDir, 'package.json'))

  const dependencies = Array.from(
    new Set([
      ...Object.keys(packageJSON.dependencies || {}),
      ...Object.keys(packageJSON.peerDependencies || {}),
      ...Object.keys(packageJSON.devDependencies || {}),
    ]),
  )

  return {
    name: packageJSON.name,
    packageDir,
    packageJSON,
    dependencies,
  }
}

export async function installTemporaryPackage(
  pkg: string,
  dir: string,
  extra: string[] = [],
) {
  function run(cmd: string) {
    execSync(cmd, { cwd: dir })
  }

  const { name } = parsePackage(pkg)

  await fs.ensureDir(dir)

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

  // eslint-disable-next-line no-eval
  const packageJsonPath = eval('require').resolve(`${name}/package.json`, { paths: [dir] })
  const packageDir = path.dirname(packageJsonPath)

  return packageDir
}
