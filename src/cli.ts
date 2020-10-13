/* eslint-disable no-unused-expressions */
import filesize from 'filesize'
import chalk from 'chalk'
import yargs from 'yargs'
import { SingleBar, Presets } from 'cli-progress'
import Table from 'cli-table3'
import { version } from '../package.json'
import { SupportBundler } from './bunders'
import { getPackageVersion } from './utils'
import { getExportsSize } from '.'

yargs
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
        .option('bundler', {
          default: 'esbuild',
          type: 'string',
          alias: 'b',
          choices: ['esbuild', 'rollup'],
          describe: 'bundler, can be esbuild or rollup',
        })
    },
    async(args) => {
      if (!args.package) {
        yargs.showHelp()
        return
      }

      console.log(`export-size  v${version}`)

      if (args.bundler === 'esbuild') {
        console.log(`esbuild      v${getPackageVersion('esbuild')}`)
      }
      else {
        console.log(`rollup       v${getPackageVersion('rollup')}`)
        console.log(`terser       v${getPackageVersion('terser')}`)
      }

      const bar = new SingleBar({
        clearOnComplete: true,
        hideCursor: true,
        format: `{bar} {value}/{total} ${chalk.gray('{name}')}`,
        linewrap: false,
        barsize: 40,
      }, Presets.shades_grey)

      bar.start(0, 0, { name: '' })

      const { result, packageJSON, name } = await getExportsSize({
        pkg: args.package,
        external: args.external,
        extraDependencies: args.install,
        output: args.output,
        bundler: args.bundler as SupportBundler,
        reporter(name, value, total) {
          bar.setTotal(total)
          bar.update(value, { name })
        },
      })

      bar.stop()

      const table = new Table({
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        head: ['export\n', 'min+gzip\n'],
        colAligns: ['left', 'right'],
      })

      for (const { name, size } of result)
        table.push([name, filesize(size)])

      console.log()
      console.log(`${chalk.green(name)} v${packageJSON.version}`)
      if (packageJSON._shasum)
        console.log(chalk.gray(`sha ${packageJSON._shasum}`))
      console.log()
      console.log(table.toString())
      console.log()
    },
  )
  .showHelpOnFail(false)
  .help()
  .argv
