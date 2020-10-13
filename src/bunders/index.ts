import { ESBuildBundler } from './esbuild'
import { RollupBundler } from './rollup'

export type SupportBundler = 'esbuild' | 'rollup'

export function getBundler(bundler: SupportBundler = 'esbuild', dir: string, external: string[]) {
  if (bundler === 'rollup')
    return new RollupBundler(dir, external)
  return new ESBuildBundler(dir, external)
}
