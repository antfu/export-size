import { ESBuildBundler } from './esbuild'
import { RolldownBundler } from './rolldown'
import { RollupBundler } from './rollup'

export type SupportBundler = 'esbuild' | 'rollup' | 'rolldown'

export function getBundler(
  bundler: SupportBundler = 'esbuild',
  dir: string,
  external: string[],
) {
  if (bundler === 'rollup')
    return new RollupBundler(dir, external)
  if (bundler === 'rolldown')
    return new RolldownBundler(dir, external)
  return new ESBuildBundler(dir, external)
}

export * from './base'
export * from './esbuild'
export * from './rolldown'
export * from './rollup'
