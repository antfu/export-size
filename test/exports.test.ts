import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { getAllExports } from '../src/exports'

const dir = path.dirname(fileURLToPath(import.meta.url))
const fixtureDir = path.join(dir, 'fixtures/sample-pkg')

describe('getAllExports', () => {
  it('collects named exports from the package entry', async () => {
    const exports = await getAllExports(fixtureDir, 'sample-pkg', true)

    expect(Object.keys(exports).sort()).toEqual(['add', 'foo', 'subtract'])
    expect(exports.add).toBe('index.mjs')
  })
})
