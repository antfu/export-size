/* eslint-disable no-unused-expressions */
import filesize from 'filesize'
import chalk from 'chalk'
import yargs from 'yargs'
import { SingleBar, Presets } from 'cli-progress'
import { getExportsSize } from '.'

yargs
  .scriptName('export-size')
  .usage('$0 [args]')
  .command(
    '* [package]',
    'Analysis bundle cost for each export of the packages',
    (args) => {
      return args
        .positional('package', {
          type: 'string',
          describe: 'package names',
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
        output: args.output,
        reporter(name, value, total) {
          bar.setTotal(total)
          bar.update(value, { name })
        },
      })

      bar.stop()

      for (const { name, size } of result)
        console.log(`${name}\t\t${filesize(size)}`)
    },
  )
  .showHelpOnFail(false)
  .help()
  .argv
