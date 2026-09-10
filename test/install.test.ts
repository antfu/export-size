import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { installTemporaryPackage, loadPackageJSON } from '../src/install'

let dir: string

afterEach(async () => {
  if (dir)
    await fs.rm(dir, { recursive: true, force: true })
})

describe('installTemporaryPackage', () => {
  it('installs a package outside of any workspace into node_modules', async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), 'export-size-'))

    const packageDir = await installTemporaryPackage('lodash-es', dir)

    expect(packageDir).toBe(path.join(dir, 'node_modules', 'lodash-es'))
    await expect(fs.stat(packageDir)).resolves.toBeDefined()

    const { name, dependencies } = await loadPackageJSON(packageDir)
    expect(name).toBe('lodash-es')
    expect(dependencies).toEqual([])
  }, 60_000)
})
