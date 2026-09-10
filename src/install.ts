import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { parsePackage } from './utils'

export async function loadPackageJSON(packageDir: string) {
  const packageJSON = JSON.parse(await fs.readFile(path.join(packageDir, 'package.json'), 'utf-8'))

  const dependencies = Array.from(
    new Set([
      ...Object.keys(packageJSON.dependencies || {}),
      ...Object.keys(packageJSON.peerDependencies || {}),
      ...Object.keys(packageJSON.optionalDependencies || {}),
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
    execSync(cmd, { cwd: dir, stdio: 'inherit' })
  }

  const { name } = parsePackage(pkg)

  await fs.mkdir(dir, { recursive: true })

  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({
    type: 'module',
    private: true,
    dependencies: Object.fromEntries(
      [pkg, ...extra].map((i) => {
        const { name, version } = parsePackage(i)
        return [name, version]
      }),
    ),
  }, null, 2))

  run('npm i -s')

  const packageDir = path.join(dir, 'node_modules', name)

  return packageDir
}
