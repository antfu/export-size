/* eslint-disable no-unused-expressions */
import filesize from 'filesize'
import chalk from 'chalk'
import yargs from 'yargs'
import { SingleBar, Presets } from 'cli-progress'
import Table from 'cli-table3'
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
          default: true,
          type: 'boolean',
          alias: 'o',
          describe: 'output',
        })
    },
    async(args) => {
      if (!args.package) {
        yargs.showHelp()
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

      const result = await getExportsSize({
        pkg: args.package,
        external: args.external,
        extraDependencies: args.install,
        output: args.output,
        reporter(name, value, total) {
          bar.setTotal(total)
          bar.update(value, { name })
        },
      })

      bar.stop()

      const table = new Table({
        chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
        head: ['export\n', 'size\n'],
        colAligns: ['left', 'right'],
      })

      for (const { name, size } of result)
        table.push([name, filesize(size)])

      console.log()
      console.log(chalk.green(args.package))
      console.log()
      console.log(table.toString())
    },
  )
  .showHelpOnFail(false)
  .help()
  .argv
