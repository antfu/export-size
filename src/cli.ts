/* eslint-disable no-console */
import process from 'node:process'
import chalk from 'chalk'
import yargs from 'yargs'
import { Presets, SingleBar } from 'cli-progress'
import Table from 'cli-table3'
import fs from 'fs-extra'
import type { SupportBundler } from './bunders'
import { getExportsSize, readableSize } from '.'

const instance = yargs(process.argv.slice(2))
  .scriptName('export-size')
  .usage('$0 [args]')
  .command(
    '* [package]',
    'Analysis bundle cost for each export of a package',
    (args) => {
      return args
        .positional('package', {
          type: 'string',
          describe: 'package names',
        })
        .option('install', {
          default: [] as string[],
          type: 'array',
          alias: 'i',
          describe: 'extra dependencies',
        })
        .option('external', {
          default: [] as string[],
          type: 'array',
          alias: 'x',
          describe: 'external packages',
        })
        .option('output', {
          default: false,
          type: 'boolean',
          alias: 'o',
          describe: 'output',
        })
        .option('report', {
          default: false,
          type: 'boolean',
          alias: 'r',
          describe: 'report json file',
        })
        .option('bundler', {
          default: 'esbuild',
          type: 'string',
          alias: 'b',
          choices: ['esbuild', 'rollup'],
          describe: 'bundler, can be esbuild or rollup',
        })
    },
    async (args) => {
      if (!args.package) {
        instance.showHelp()
        return
      }

      const bar = new SingleBar({
        clearOnComplete: true,
        hideCursor: true,
        format: `{bar} {value}/{total} ${chalk.gray('{name}')}`,
        linewrap: false,
        barsize: 40,
      }, Presets.shades_grey)

      bar.start(0, 0, { name: '' })

      const { exports, packageJSON, meta } = await getExportsSize({
        pkg: args.package,
        external: args.external as string[],
        extraDependencies: args.install as string[],
        output: args.output,
        bundler: args.bundler as SupportBundler,
        reporter(name, value, total) {
          bar.setTotal(total)
          bar.update(value, { name })
        },
      }).finally(() => {
        bar.stop()
      })

      // versions
      Object
        .entries(meta.versions)
        .forEach(([name, version]) => {
          console.log(chalk.gray(`${name.padEnd(15)}v${version.replace(/^\^/, '')}`))
        })

      const table = new Table({
        chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        head: ['export\n', 'min+brotli\n'],
        colAligns: ['left', 'right'],
      })

      for (const { name, minzipped } of exports)
        table.push([name, readableSize(minzipped)])

      console.log()
      console.log(`${chalk.green(meta.name)} v${packageJSON.version}`)
      if (packageJSON._shasum)
        console.log(chalk.gray(`sha ${packageJSON._shasum}`))
      console.log()
      console.log(table.toString())
      console.log()

      if (args.report) {
        const filepath = './export-size-report.json'
        await fs.writeJSON(filepath, { meta, exports }, { spaces: 2 })
        console.log(chalk.yellow(`report saved to ${chalk.gray(filepath)}`))
        console.log()
      }
    },
  )
  .showHelpOnFail(false)
  .help()

// eslint-disable-next-line no-unused-expressions
instance.argv
