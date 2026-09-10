import { describe, expect, it } from 'vitest'
import { parsePackage, readableSize } from '../src/utils'

describe('parsePackage', () => {
  it('parses a plain package name', () => {
    expect(parsePackage('lodash-es')).toEqual({ name: 'lodash-es', version: 'latest' })
  })

  it('parses a package name with a version', () => {
    expect(parsePackage('lodash-es@4.17.21')).toEqual({ name: 'lodash-es', version: '4.17.21' })
  })

  it('parses a scoped package name', () => {
    expect(parsePackage('@babel/core')).toEqual({ name: '@babel/core', version: 'latest' })
  })

  it('parses a scoped package name with a version', () => {
    expect(parsePackage('@babel/core@7.0.0')).toEqual({ name: '@babel/core', version: '7.0.0' })
  })
})

describe('readableSize', () => {
  it('formats zero bytes', () => {
    expect(readableSize(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(readableSize(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(readableSize(1500)).toBe('1.50 kB')
  })

  it('formats megabytes', () => {
    expect(readableSize(1_500_000)).toBe('1.50 MB')
  })
})
