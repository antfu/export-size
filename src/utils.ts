export function parsePackage(fullname: string) {
  const parts = fullname.split('@')
  let name = parts[0]
  let version = parts[1] || 'latest'
  if (name === '') {
    name = `@${parts[1]}`
    version = parts[2] || 'latest'
  }
  return { name, version }
}

export function getPackageVersion(name: string, dir?: string) {
  const path = require.resolve(`${name}/package.json`, dir ? { paths: [dir] } : undefined)
  if (path)
    // eslint-disable-next-line no-eval
    return eval('require')(path).version
  return undefined
}
