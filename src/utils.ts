import { dependencies } from '../package.json'

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

export function getPackageVersion(name: string) {
  return dependencies[name]
}
