# export-size

Analysis bundle cost for each export of an ESM package

## Install

```bash
npx export-size [package-name]
```

## Usage

Calculate local package

```bash
npx export-size .
```

Calculate npm package

```bash
npx export-size @vueuse/core
```

More options

```bash
npx export-size --help
```

### CLI options

| Option | Description | Default |
| --- | --- | --- |
| `--install, -i <deps>` | Extra dependencies to install alongside the package | `[]` |
| `--external, -x <deps>` | Packages to mark as external (excluded from the bundle) | `[]` |
| `--output, -o` | Emit the bundled and minified files to `export-size-output/` | `false` |
| `--report, -r` | Write a JSON report | `false` |
| `--output-file <path>` | Path for the JSON report (implies `--report`) | `./export-size-report.json` |
| `--bundler, -b <bundler>` | Bundler to use, one of `esbuild`, `rollup`, `rolldown` | `esbuild` |

### Bundlers

`export-size` supports multiple bundlers under the hood to measure each export's cost:

- **`esbuild`** (default) — fastest, minifies with esbuild's built-in minifier
- **`rollup`** — bundles with Rollup and minifies with [`terser`](https://github.com/terser/terser)
- **`rolldown`** — bundles and minifies with [Rolldown](https://rolldown.rs)

```bash
npx export-size @vueuse/core --bundler rollup
npx export-size @vueuse/core --bundler rolldown
```

## Programmatic Usage

```bash
npm i -D export-size
```

```ts
import { getExportsSize } from 'export-size'

const { meta, exports, packageJSON } = await getExportsSize({
  pkg: '@vueuse/core', // npm package name, or a path to a local package/file
  bundler: 'esbuild', // 'esbuild' | 'rollup' | 'rolldown', defaults to 'esbuild'
  external: [], // packages to mark as external
  includes: [], // dependencies to force-bundle instead of marking external
  extraDependencies: [], // extra dependencies to install when resolving a remote package
  output: false, // whether to emit bundled/minified files to export-size-output/
  clean: true, // clean the output directory before running
  exportsNames: undefined, // only analyze these specific export names
  reporter(name, progress, total) {
    console.log(`${progress}/${total} ${name}`)
  },
})

console.log(meta) // { name, dependencies, versions }
console.log(exports) // [{ name, path, bundled, minified, minzipped }, ...]
```

You can also pass a custom bundler instance instead of a bundler name, by extending the abstract `Bundler` class exported from `export-size`:

```ts
import { Bundler, getExportsSize } from 'export-size'

class MyBundler extends Bundler {
  async start() { /* ... */ }
  async stop() { /* ... */ }
  async bundle(exportName: string, exportPath: string) {
    return { bundled: '...', minified: '...' }
  }
}

await getExportsSize({
  pkg: '@vueuse/core',
  bundler: new MyBundler(dir, external),
})
```

Example output

```
@vueuse/core v4.0.0-beta.20
sha 8ef798bf7d22f9cca7681c3bb717af59e6b1685d

┌───────────────────────────┬──────────┐
│ export                    │ min+gzip │
│                           │          │
│ useWebWorkerFn            │   1.1 KB │
│ useTransition             │   1007 B │
│ useParallax               │    987 B │
│ asyncComputed             │    924 B │
│ useShare                  │    817 B │
│ useIdle                   │    651 B │
│ useSessionStorage         │    604 B │
│ useLocalStorage           │    600 B │
│ useStoragePlain           │    597 B │
│ useStorage                │    586 B │
│ useDeviceMotion           │    559 B │
│ useMouseInElement         │    542 B │
│ useElementVisibility      │    503 B │
│ useDevicePixelRatio       │    489 B │
│ onStartTyping             │    471 B │
│ useEventSource            │    471 B │
│ useOnline                 │    467 B │
│ useNetwork                │    455 B │
│ useRefHistory             │    451 B │
│ useGeolocation            │    408 B │
│ useBrowserLocation        │    405 B │
│ useMouse                  │    403 B │
│ useBattery                │    395 B │
│ useAsyncState             │    367 B │
│ usePermission             │    365 B │
│ useWindowSize             │    347 B │
│ useWindowScroll           │    344 B │
│ useClipboard              │    337 B │
│ usePreferredColorScheme   │    333 B │
│ useWebSocket              │    329 B │
│ useDeviceOrientation      │    324 B │
│ useThrottle               │    318 B │
│ usePageLeave              │    300 B │
│ useDocumentVisibility     │    291 B │
│ usePreferredDark          │    285 B │
│ useCssVar                 │    284 B │
│ usePreferredLanguages     │    282 B │
│ useTimeoutFn              │    282 B │
│ useWebWorker              │    277 B │
│ useDeviceLight            │    273 B │
│ useInterval               │    273 B │
│ useDebounce               │    262 B │
│ useThrottleFn             │    258 B │
│ useMediaQuery             │    247 B │
│ useRaf                    │    244 B │
│ useTitle                  │    243 B │
│ useIntersectionObserver   │    239 B │
│ useTimeout                │    227 B │
│ useRafFn                  │    224 B │
│ useEventListener          │    222 B │
│ useNow                    │    207 B │
│ useDebounceFn             │    204 B │
│ useFullscreen             │    201 B │
│ useIntervalFn             │    199 B │
│ createGlobalState         │    197 B │
│ useResizeObserver         │    195 B │
│ useMutationObserver       │    190 B │
│ useCounter                │    183 B │
│ explicitComputed          │    146 B │
│ isWindow                  │    144 B │
│ tryOnMounted              │    143 B │
│ assert                    │    137 B │
│ isObject                  │    122 B │
│ DEVICE_PIXEL_RATIO_SCALES │    109 B │
│ tryOnUnmounted            │    107 B │
│ clamp                     │     98 B │
│ isBoolean                 │     92 B │
│ isNumber                  │     91 B │
│ isString                  │     91 B │
│ timestamp                 │     87 B │
│ isFunction                │     86 B │
│ isDef                     │     84 B │
│ isClient                  │     83 B │
│ now                       │     79 B │
│ noop                      │     65 B │
└───────────────────────────┴──────────┘
```

## TODO

- [ ] Support JSON output
- [ ] Support custom output path

## Sponsors

This project is part of my <a href='https://github.com/antfu-sponsors'>Sponsor Program</a>

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/antfu/static/sponsors.svg' alt="Sponsors"/>
  </a>
</p>

## License

MIT
