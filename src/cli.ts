import type { SupportBundler } from './bunders'
import fs from 'node:fs/promises'
import process from 'node:process'
import ansis from 'ansis'
import cac from 'cac'
import { getExportsSize, readableSize } from '.'

interface ProgressBar {
  update: (value: number, total: number, name: string) => void
  stop: () => void
}

function createProgressBar(): ProgressBar {
  const barsize = 40

  return {
    update(value, total, name) {
      const ratio = total > 0 ? value / total : 0
      const filled = Math.round(barsize * ratio)
      const bar = '█'.repeat(filled) + '░'.repeat(barsize - filled)
      process.stdout.write(`\r${bar} ${value}/${total} ${ansis.gray(name)}${' '.repeat(20)}`)
    },
    stop() {
      process.stdout.write('\r\x1B[K')
    },
  }
}

function renderTable(rows: [string, string][], head: [string, string]) {
  const width0 = Math.max(head[0].length, ...rows.map(r => r[0].length))
  const width1 = Math.max(head[1].length, ...rows.map(r => r[1].length))

  const lines: string[] = []
  lines.push(`${head[0].padEnd(width0)}   ${head[1].padStart(width1)}`)
  for (const [a, b] of rows)
    lines.push(`${a.padEnd(width0)}   ${b.padStart(width1)}`)
  return lines.join('\n')
}

const cli = cac('export-size')

cli
  .command('[package]', 'Analysis bundle cost for each export of a package')
  .option('--install, -i <deps>', 'extra dependencies', { type: [String], default: [] })
  .option('--external, -x <deps>', 'external packages', { type: [String], default: [] })
  .option('--output, -o', 'output', { default: false })
  .option('--report, -r', 'report json file', { default: false })
  .option('--output-file <path>', 'custom path for report json file', { default: './export-size-report.json' })
  .option('--bundler, -b <bundler>', 'bundler, can be esbuild or rollup', { default: 'esbuild' })
  .action(async (pkg: string | undefined, options) => {
    if (!pkg) {
      cli.outputHelp()
      return
    }

    if (options.bundler !== 'esbuild' && options.bundler !== 'rollup') {
      console.error(`Invalid bundler "${options.bundler}", must be "esbuild" or "rollup"`)
      process.exitCode = 1
      return
    }

    const bar = createProgressBar()

    const { exports, packageJSON, meta } = await getExportsSize({
      pkg,
      external: options.external as string[],
      extraDependencies: options.install as string[],
      output: options.output,
      bundler: options.bundler as SupportBundler,
      reporter(name, value, total) {
        bar.update(value, total, name)
      },
    }).finally(() => {
      bar.stop()
    })

    // versions
    Object
      .entries(meta.versions)
      .forEach(([name, version]) => {
        console.log(ansis.gray(`${name.padEnd(15)}v${version.replace(/^\^/, '')}`))
      })

    const rows: [string, string][] = exports.map(({ name, minzipped }) => [name, readableSize(minzipped)])

    console.log()
    console.log(`${ansis.green(meta.name)} v${packageJSON.version}`)
    if (packageJSON._shasum)
      console.log(ansis.gray(`sha ${packageJSON._shasum}`))
    console.log()
    console.log(renderTable(rows, ['export', 'min+brotli']))
    console.log()

    if (options.report) {
      const filepath = options.outputFile
      await fs.writeFile(filepath, JSON.stringify({ meta, exports }, null, 2))
      console.log(ansis.yellow(`report saved to ${ansis.gray(filepath)}`))
      console.log()
    }
  })

cli.help()
cli.parse()
