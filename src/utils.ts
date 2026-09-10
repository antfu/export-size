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

const UNITS = ['B', 'kB', 'MB', 'GB', 'TB']

export function readableSize(bytes: number) {
  if (bytes === 0)
    return '0 B'
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), UNITS.length - 1)
  const value = bytes / 1000 ** exponent
  return `${(exponent === 0 ? value : value.toFixed(2))} ${UNITS[exponent]}`
}
