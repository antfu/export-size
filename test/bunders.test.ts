import { Buffer } from 'node:buffer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ESBuildBundler } from '../src/bunders/esbuild'
import { getBundler } from '../src/bunders/index'
import { RolldownBundler } from '../src/bunders/rolldown'
import { RollupBundler } from '../src/bunders/rollup'

const dir = path.dirname(fileURLToPath(import.meta.url))
const fixture = path.join(dir, 'fixtures/sample-pkg/index.mjs')
const fixtureWithDep = path.join(dir, 'fixtures/sample-pkg/with-dep.mjs')

describe('getBundler', () => {
  it('returns esbuild bundler by default', () => {
    expect(getBundler(undefined, dir, [])).toBeInstanceOf(ESBuildBundler)
  })

  it('returns esbuild bundler', () => {
    expect(getBundler('esbuild', dir, [])).toBeInstanceOf(ESBuildBundler)
  })

  it('returns rollup bundler', () => {
    expect(getBundler('rollup', dir, [])).toBeInstanceOf(RollupBundler)
  })

  it('returns rolldown bundler', () => {
    expect(getBundler('rolldown', dir, [])).toBeInstanceOf(RolldownBundler)
  })
})

describe.each([
  ['esbuild', ESBuildBundler],
  ['rollup', RollupBundler],
  ['rolldown', RolldownBundler],
] as const)('%s bundler', (_name, BundlerClass) => {
  it('bundles a named export', async () => {
    const bundler = new BundlerClass(dir, [])
    await bundler.start()
    const { bundled, minified } = await bundler.bundle('add', fixture)
    await bundler.stop()

    expect(bundled).toContain('function')
    expect(minified.length).toBeGreaterThan(0)
    expect(minified.length).toBeLessThan(bundled.length)
  })

  it('produces working minified code', async () => {
    const bundler = new BundlerClass(dir, [])
    await bundler.start()
    const { minified } = await bundler.bundle('add', fixture)
    await bundler.stop()

    const mod = await import(`data:text/javascript;base64,${Buffer.from(minified).toString('base64')}`)
    expect(mod._(1, 2)).toBe(3)
  })

  it('inlines dependencies when not external', async () => {
    const bundler = new BundlerClass(dir, [])
    await bundler.start()
    const { bundled } = await bundler.bundle('withDep', fixtureWithDep)
    await bundler.stop()

    expect(bundled).not.toContain('from "lodash-es"')
    expect(bundled).not.toContain('from\'lodash-es\'')
  })

  it('respects the external option', async () => {
    const bundler = new BundlerClass(dir, ['lodash-es'])
    await bundler.start()
    const { bundled, minified } = await bundler.bundle('withDep', fixtureWithDep)
    await bundler.stop()

    expect(bundled).toContain('lodash-es')
    expect(minified).toContain('lodash-es')
  })
})
