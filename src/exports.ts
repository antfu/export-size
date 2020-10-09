import path from 'path'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import fs from 'fs-extra'
import enhancedResolve from 'enhanced-resolve'

/**
 * Parses code to return all named (and default exports)
 * as well as `export * from` locations
 */
function getExportsDetails(code: string) {
  const ast = parse(code, {
    sourceType: 'module',
    allowUndeclaredExports: true,
    plugins: ['exportDefaultFrom'],
  })

  const exportAllLocations = []
  let exportsList = []

  traverse(ast, {
    ExportNamedDeclaration(path) {
      const { specifiers, declaration } = path.node
      exportsList = exportsList.concat(
        specifiers.map(specifier => specifier.exported.name),
      )

      if (declaration) {
        if (declaration.declarations) {
          declaration.declarations.forEach((dec) => {
            if (dec.id.type === 'ObjectPattern') {
              exportsList = exportsList.concat(
                dec.id.properties.map(property => property.value.name),
              )
            }
            else if (dec.id.type === 'Identifier') {
              exportsList.push(dec.id.name)
            }
          })
        }
        else if (declaration.id) {
          exportsList.push(declaration.id.name)
        }
      }
    },

    ExportDefaultDeclaration() {
      exportsList.push('default')
    },

    ExportAllDeclaration(path) {
      exportAllLocations.push(path.node.source.value)
    },
  })

  return {
    exportAllLocations,
    exports: exportsList,
  }
}

const resolver = enhancedResolve.create.sync({
  extensions: [
    '.web.mjs',
    '.mjs',
    '.web.js',
    '.js',
    '.mjs',
    '.json',
    '.css',
    '.sass',
    '.scss',
  ],
  modules: ['node_modules', '.'],
  mainFields: ['module', 'main'],
})

/**
 * Recursively get all exports starting
 * from a given path
 */
export async function getAllExports(context: string, lookupPath: string): Promise<Record<string, string>> {
  const getAllExportsRecursive = async(ctx, lookPath) => {
    const resolvedPath = resolver(ctx, lookPath)

    if (!resolvedPath)
      return []

    const resolvedExports = {}
    const code = await fs.readFile(resolvedPath, 'utf8')
    const { exports, exportAllLocations } = getExportsDetails(code)

    exports.forEach((exp) => {
      const relativePath = resolvedPath.substring(
        resolvedPath.indexOf(context) + context.length + 1,
      )
      resolvedExports[exp] = relativePath
    })

    const promises = exportAllLocations.map(async(location) => {
      const exports = await getAllExportsRecursive(
        path.dirname(resolvedPath),
        location,
      )
      Object.keys(exports).forEach((expKey) => {
        resolvedExports[expKey] = exports[expKey]
      })
    })

    await Promise.all(promises)
    return resolvedExports
  }

  const allExports = await getAllExportsRecursive(context, lookupPath)
  return allExports
}
